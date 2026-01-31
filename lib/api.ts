// lib/api.ts
// API client for GEO Tracker backend

import type {
  RunConfig,
  JobCreatedResponse,
  RunProgress,
  RunResults,
  HealthResponse,
  Query,
  SheetFetchResponse,
  SheetValidateResponse,
  VisibilityReport,
  Brand,
  BrandRun,
  BrandListResponse,
  BrandDetailResponse,
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'APIError';
  }
}

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new APIError(
      response.status,
      errorData.detail || errorData.error || `API error: ${response.status}`
    );
  }

  return response.json();
}

// Health check
export async function checkHealth(): Promise<HealthResponse> {
  return fetchAPI<HealthResponse>('/health');
}

// Start a new run
export async function startRun(config: RunConfig): Promise<JobCreatedResponse> {
  // Validate queries exist before sending
  if (!config.queries || config.queries.length === 0) {
    throw new Error('No queries provided. Please add at least one question before starting analysis.');
  }

  // Convert camelCase to snake_case for API
  const payload = {
    company_id: config.companyId,
    brand_name: config.brandName,
    industry: config.industry || '',  // Industry context for competitor detection
    providers: config.providers,
    openai_model: config.openaiModel || 'gpt-4.1-mini',
    gemini_model: config.geminiModel || 'gemini-2.5-flash',
    perplexity_model: config.perplexityModel || 'sonar',
    anthropic_model: config.anthropicModel || 'claude-sonnet-4-20250514',
    mode: config.mode,
    queries: config.queries.map(q => ({
      question: q.question,
      category: q.category || null,
      prompt_id: q.promptId || null,
    })),
    market: config.market || 'DE',
    lang: config.lang || 'de',
    raw: config.raw || false,
    request_timeout: config.requestTimeout || 60,
    max_retries: config.maxRetries || 1,
    sleep_ms: config.sleepMs || 0,
  };

  console.log('[startRun] Sending payload with', payload.queries.length, 'queries');

  const response = await fetchAPI<any>('/api/runs', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  // Convert snake_case to camelCase
  return {
    jobId: response.job_id,
    runId: response.run_id,
    status: response.status,
    message: response.message,
    estimatedDurationSeconds: response.estimated_duration_seconds,
  };
}

// Get run status/progress
export async function getRunStatus(jobId: string): Promise<RunProgress> {
  const response = await fetchAPI<any>(`/api/runs/${jobId}/status`);

  return {
    runId: response.run_id,
    status: response.status,
    totalTasks: response.total_tasks,
    completedTasks: response.completed_tasks,
    failedTasks: response.failed_tasks,
    progressPercent: response.progress_percent,
    currentProvider: response.current_provider,
    currentQuery: response.current_query,
    estimatedRemainingSeconds: response.estimated_remaining_seconds,
    startedAt: response.started_at,
    updatedAt: response.updated_at,
    error: response.error,
  };
}

// Get run results
export async function getRunResults(jobId: string): Promise<RunResults> {
  const response = await fetchAPI<any>(`/api/runs/${jobId}/results`);

  return {
    summary: {
      runId: response.summary.run_id,
      companyId: response.summary.company_id,
      brandName: response.summary.brand_name,
      status: response.summary.status,
      totalQueries: response.summary.total_queries,
      totalResponses: response.summary.total_responses,
      overallVisibility: response.summary.overall_visibility,
      avgSentiment: response.summary.avg_sentiment,
      avgTrustAuthority: response.summary.avg_trust_authority,
      providerVisibility: response.summary.provider_visibility || {},
      competitorVisibility: response.summary.competitor_visibility || {},
      startedAt: response.summary.started_at,
      completedAt: response.summary.completed_at,
      durationSeconds: response.summary.duration_seconds,
    },
    results: response.results.map((r: any) => ({
      runId: r.run_id,
      promptId: r.prompt_id,
      category: r.category,
      question: r.question,
      provider: r.provider,
      model: r.model,
      mode: r.mode,
      responseText: r.response_text,
      latencyMs: r.latency_ms,
      tokensIn: r.tokens_in,
      tokensOut: r.tokens_out,
      presence: r.presence,
      sentiment: r.sentiment,
      trustAuthority: r.trust_authority,
      trustSunday: r.trust_sunday,
      brandMentioned: r.brand_mentioned,
      otherBrandsDetected: r.other_brands_detected || [],
      sources: r.sources || [],
      timestamp: r.timestamp,
    })),
  };
}

// Cancel a run
export async function cancelRun(jobId: string): Promise<{ message: string }> {
  return fetchAPI<{ message: string }>(`/api/runs/${jobId}/cancel`, {
    method: 'POST',
  });
}

// List recent runs
export async function listRuns(limit: number = 20): Promise<any[]> {
  return fetchAPI<any[]>(`/api/runs?limit=${limit}`);
}

// Generate queries (placeholder endpoint)
export async function generateQueries(
  industry: string,
  companyName: string,
  count: number = 25
): Promise<{ queries: Query[]; count: number }> {
  const params = new URLSearchParams({
    industry,
    company_name: companyName,
    count: count.toString(),
  });

  const response = await fetchAPI<any>(`/api/queries/generate?${params}`, {
    method: 'POST',
  });

  return {
    queries: response.queries.map((q: any) => ({
      question: q.question,
      category: q.category,
      promptId: q.prompt_id,
    })),
    count: response.count,
  };
}

// Get historical results
export async function getHistoricalResults(
  companyId?: string,
  limit: number = 100,
  sinceDays: number = 7
): Promise<{ results: any[]; count: number }> {
  const params = new URLSearchParams({
    limit: limit.toString(),
    since_days: sinceDays.toString(),
  });
  if (companyId) {
    params.append('company_id', companyId);
  }

  return fetchAPI<{ results: any[]; count: number }>(`/api/results?${params}`);
}

// Utility: Poll for run completion
export async function pollRunStatus(
  jobId: string,
  onProgress: (progress: RunProgress) => void,
  pollIntervalMs: number = 2000
): Promise<RunProgress> {
  return new Promise((resolve, reject) => {
    const poll = async () => {
      try {
        const status = await getRunStatus(jobId);
        onProgress(status);

        if (['completed', 'failed', 'cancelled'].includes(status.status)) {
          resolve(status);
        } else {
          setTimeout(poll, pollIntervalMs);
        }
      } catch (error) {
        reject(error);
      }
    };

    poll();
  });
}

// Google Sheets integration
export async function fetchSheetPrompts(
  sheetUrl: string,
  worksheetName?: string,
  forceRefresh: boolean = false
): Promise<SheetFetchResponse> {
  const response = await fetchAPI<any>('/api/sheets/prompts', {
    method: 'POST',
    body: JSON.stringify({
      sheet_url: sheetUrl,
      worksheet_name: worksheetName,
      force_refresh: forceRefresh,
    }),
  });

  return {
    prompts: response.prompts.map((p: any) => ({
      promptId: p.prompt_id,
      category: p.category,
      question: p.question,
    })),
    totalCount: response.total_count,
    columnsDetected: {
      question: response.columns_detected?.question,
      category: response.columns_detected?.category,
    },
    allColumns: response.all_columns || [],
    cached: response.cached,
    sheetTitle: response.sheet_title,
    sheetId: response.sheet_id,
  };
}

export async function validateSheetUrl(url: string): Promise<SheetValidateResponse> {
  const response = await fetchAPI<any>(`/api/sheets/validate?url=${encodeURIComponent(url)}`);

  return {
    valid: response.valid,
    sheetId: response.sheet_id,
    sheetTitle: response.sheet_title,
    totalPrompts: response.total_prompts,
    columns: response.columns,
    columnsDetected: response.columns_detected,
    error: response.error,
  };
}

// Visibility Reports
export async function generateVisibilityReport(
  brandName: string,
  resultsSummary: any,
  detailedResults: any[],
  jobId?: string,
  provider: string = 'openai',
  model: string = 'gpt-4.1',
  forceRegenerate: boolean = false
): Promise<VisibilityReport> {
  const response = await fetchAPI<any>('/api/reports/visibility', {
    method: 'POST',
    body: JSON.stringify({
      job_id: jobId,
      brand_name: brandName,
      results_summary: resultsSummary,
      detailed_results: detailedResults,
      provider,
      model,
      force_regenerate: forceRegenerate,
    }),
  });

  return {
    report: response.report,
    generatedAt: response.generated_at,
    provider: response.provider,
    model: response.model,
    tokensUsed: response.tokens_used,
    brandName: response.brand_name,
    saved: response.saved,
    fromCache: response.from_cache,
    error: response.error,
  };
}

export async function getCachedReport(jobId: string): Promise<VisibilityReport | null> {
  try {
    const response = await fetchAPI<any>(`/api/reports/${jobId}`);
    return {
      report: response.report,
      generatedAt: response.generated_at,
      provider: response.provider,
      model: response.model,
      tokensUsed: response.tokens_used,
      brandName: response.brand_name,
      fromCache: true,
    };
  } catch (error) {
    if (error instanceof APIError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

// Brand History API
export async function getBrands(companyId?: string, limit: number = 50): Promise<BrandListResponse> {
  const params = new URLSearchParams({ limit: limit.toString() });
  if (companyId) {
    params.append('company_id', companyId);
  }

  const response = await fetchAPI<any>(`/api/brands?${params}`);

  return {
    brands: response.brands.map((b: any) => ({
      id: b.id,
      brandName: b.brand_name,
      industry: b.industry,
      market: b.market,
      companyId: b.company_id,
      totalRuns: b.total_runs,
      totalQueries: b.total_queries,
      avgVisibility: b.avg_visibility,
      createdAt: b.created_at,
      lastRunAt: b.last_run_at,
    })),
    count: response.count,
  };
}

export async function getBrandById(brandId: number): Promise<BrandDetailResponse> {
  const response = await fetchAPI<any>(`/api/brands/${brandId}`);

  return {
    brand: {
      id: response.brand.id,
      brandName: response.brand.brand_name,
      industry: response.brand.industry,
      market: response.brand.market,
      companyId: response.brand.company_id,
      totalRuns: response.brand.total_runs,
      totalQueries: response.brand.total_queries,
      avgVisibility: response.brand.avg_visibility,
      createdAt: response.brand.created_at,
      lastRunAt: response.brand.last_run_at,
    },
    history: response.history.map((r: any) => ({
      id: r.id,
      brandId: r.brand_id,
      jobId: r.job_id,
      providers: r.providers,
      mode: r.mode,
      totalQueries: r.total_queries,
      visibilityPct: r.visibility_pct,
      avgSentiment: r.avg_sentiment,
      avgTrust: r.avg_trust,
      competitorSummary: r.competitor_summary,
      createdAt: r.created_at,
    })),
  };
}

export async function searchBrandByName(brandName: string, companyId?: string): Promise<Brand | null> {
  const params = new URLSearchParams();
  if (companyId) {
    params.append('company_id', companyId);
  }

  try {
    const response = await fetchAPI<any>(`/api/brands/search/${encodeURIComponent(brandName)}?${params}`);

    if (!response.brand) return null;

    return {
      id: response.brand.id,
      brandName: response.brand.brand_name,
      industry: response.brand.industry,
      market: response.brand.market,
      companyId: response.brand.company_id,
      totalRuns: response.brand.total_runs,
      totalQueries: response.brand.total_queries,
      avgVisibility: response.brand.avg_visibility,
      createdAt: response.brand.created_at,
      lastRunAt: response.brand.last_run_at,
    };
  } catch (error) {
    if (error instanceof APIError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function getBrandHistory(brandId: number, limit: number = 20): Promise<BrandRun[]> {
  const response = await fetchAPI<any>(`/api/brands/${brandId}/history?limit=${limit}`);

  return response.history.map((r: any) => ({
    id: r.id,
    brandId: r.brand_id,
    jobId: r.job_id,
    providers: r.providers,
    mode: r.mode,
    totalQueries: r.total_queries,
    visibilityPct: r.visibility_pct,
    avgSentiment: r.avg_sentiment,
    avgTrust: r.avg_trust,
    competitorSummary: r.competitor_summary,
    createdAt: r.created_at,
  }));
}

export async function deleteBrand(brandId: number): Promise<{ success: boolean; message: string }> {
  return fetchAPI<{ success: boolean; message: string }>(`/api/brands/${brandId}`, {
    method: 'DELETE',
  });
}

export { APIError };
