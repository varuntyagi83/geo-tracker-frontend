// lib/api.ts
// API client for GEO Tracker backend

import type {
  RunConfig,
  JobCreatedResponse,
  RunProgress,
  RunResults,
  HealthResponse,
  Query,
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
  // Convert camelCase to snake_case for API
  const payload = {
    company_id: config.companyId,
    brand_name: config.brandName,
    industry: config.industry || '',  // Industry context for competitor detection
    providers: config.providers,
    openai_model: config.openaiModel || 'gpt-4.1-mini',
    gemini_model: config.geminiModel || 'gemini-2.5-flash',
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

export { APIError };
