// lib/types.ts
// Type definitions for the GEO Tracker application

export type Provider = 'openai' | 'gemini' | 'perplexity' | 'anthropic';
export type Mode = 'internal' | 'provider_web';
export type RunStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface Company {
  id: string;
  name: string;
  website?: string;
  industry: string;
  description?: string;
  brandKeywords: string[];
  competitors: string[];
  createdAt: string;
}

export interface Query {
  question: string;
  category?: string;
  promptId?: string;
}

export interface RunConfig {
  companyId: string;
  brandName: string;
  industry?: string;  // Industry context for competitor detection
  providers: Provider[];
  openaiModel?: string;
  geminiModel?: string;
  perplexityModel?: string;
  anthropicModel?: string;
  mode: Mode;
  queries: Query[];
  market?: string;
  lang?: string;
  raw?: boolean;
  requestTimeout?: number;
  maxRetries?: number;
  sleepMs?: number;
}

export interface JobCreatedResponse {
  jobId: string;
  runId: string;
  status: RunStatus;
  message: string;
  estimatedDurationSeconds?: number;
}

export interface RunProgress {
  runId: string;
  status: RunStatus;
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  progressPercent: number;
  currentProvider?: string;
  currentQuery?: string;
  estimatedRemainingSeconds?: number;
  startedAt?: string;
  updatedAt: string;
  error?: string;
}

export interface Source {
  url: string;
  title?: string;
}

export interface QueryResult {
  runId: number;
  promptId?: string;
  category?: string;
  question: string;
  provider: string;
  model: string;
  mode: string;
  responseText: string;
  latencyMs?: number;
  tokensIn?: number;
  tokensOut?: number;
  presence?: number;
  sentiment?: number;
  trustAuthority?: number;
  trustSunday?: number;
  brandMentioned: boolean;
  otherBrandsDetected: string[];
  sources: Source[];
  timestamp: string;
}

export interface RunSummary {
  runId: string;
  companyId: string;
  brandName: string;
  status: RunStatus;
  totalQueries: number;
  totalResponses: number;
  overallVisibility: number;
  avgSentiment?: number;
  avgTrustAuthority?: number;
  providerVisibility: Record<string, number>;
  competitorVisibility: Record<string, number>;
  startedAt?: string;
  completedAt?: string;
  durationSeconds?: number;
}

export interface RunResults {
  summary: RunSummary;
  results: QueryResult[];
}

export interface HealthResponse {
  status: string;
  version: string;
  providersAvailable: string[];
}

// Form state types
export interface CompanyFormData {
  name: string;
  website: string;
  industry: string;
  description: string;
  brandKeywords: string;
  competitors: string;
}

export interface RunConfigFormData {
  brandName: string;
  providers: Provider[];
  mode: Mode;
  market: string;
  lang: string;
  queriesText: string;
}

// Google Sheets types
export interface SheetPrompt {
  promptId: string;
  category: string;
  question: string;
}

export interface SheetFetchResponse {
  prompts: SheetPrompt[];
  totalCount: number;
  columnsDetected: {
    question: string | null;
    category: string | null;
  };
  allColumns: string[];
  cached: boolean;
  sheetTitle: string;
  sheetId: string;
}

export interface SheetValidateResponse {
  valid: boolean;
  sheetId?: string;
  sheetTitle?: string;
  totalPrompts?: number;
  columns?: string[];
  columnsDetected?: {
    question: string | null;
    category: string | null;
  };
  error?: string;
}

// Visibility Report types
export interface VisibilityReport {
  report: string;
  generatedAt: string;
  provider: string;
  model: string;
  tokensUsed: number;
  brandName?: string;
  saved?: boolean;
  fromCache?: boolean;
  error?: string;
}

// Brand History types
export interface Brand {
  id: number;
  brandName: string;
  industry: string;
  market: string;
  companyId: string;
  totalRuns: number;
  totalQueries: number;
  avgVisibility: number;
  createdAt: string;
  lastRunAt: string;
}

export interface BrandRun {
  id: number;
  brandId: number;
  jobId: string;
  providers: string[];
  mode: string;
  totalQueries: number;
  visibilityPct: number;
  avgSentiment: number;
  avgTrust: number;
  competitorSummary: Record<string, number>;
  createdAt: string;
}

export interface BrandListResponse {
  brands: Brand[];
  count: number;
}

export interface BrandDetailResponse {
  brand: Brand;
  history: BrandRun[];
}

// Previous Runs History types
export interface RunHistorySummary {
  runTs: string;
  brandName: string;
  providers: string[];
  models: string[];
  mode: string;
  market: string;
  lang: string;
  totalQueries: number;
  brandMentions: number;
  visibilityPct: number;
  avgSentiment: number | null;
  avgTrust: number | null;
  avgLatencyMs: number | null;
  companyId: string | null;
}

export interface RunHistoryResponse {
  runs: RunHistorySummary[];
  count: number;
}
