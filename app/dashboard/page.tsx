// app/dashboard/page.tsx
'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe,
  Zap,
  BarChart3,
  Play,
  Settings,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Search,
  Building2,
  MessageSquare,
  Eye,
  Link2,
  FileText,
  AlertTriangle,
  Clock,
  Globe2,
  LogOut,
  User,
  History,
  PlusCircle,
  Download,
  Layers,
} from 'lucide-react';

import {
  startRun,
  getRunStatus,
  getRunResults,
  checkHealth,
  fetchSheetPrompts,
} from '@/lib/api';
import type {
  RunConfig,
  RunProgress,
  RunResults,
  Query,
  QueryResult,
  Provider,
  Mode,
  Source,
  SheetPrompt,
  Brand,
} from '@/lib/types';
import { SheetInput } from '@/components/SheetInput';
import { VisibilityReport } from '@/components/VisibilityReport';
import { BrandHistory } from '@/components/BrandHistory';
import { PreviousRuns } from '@/components/PreviousRuns';
import { PDFReport } from '@/components/PDFReport/index';
import { exportReportToPDF, openReportAsHTML } from '@/lib/pdf-export';
import {
  cn,
  formatDuration,
  getVisibilityColor,
  getSentimentColor,
  getSampleQueriesForIndustry,
  parseQueriesFromText,
} from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { SiteOverview } from '@/components/seo/site-overview';
import { PageList } from '@/components/seo/page-list';
import { AIRecommendationsPanel } from '@/components/seo/ai-recommendations';
import { CrawlProgressPanel } from '@/components/seo/crawl-progress';
import { PageDetailPanel } from '@/components/seo/page-detail';
import type { SiteAnalysis, PageAnalysis } from '@/types/seo/analysis';
import type { OrchestratorState } from '@/types/seo/orchestrator';

// ==============================================
// CONSTANTS
// ==============================================

const MARKETS = [
  { code: 'DE', name: 'Germany' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'FR', name: 'France' },
  { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'AT', name: 'Austria' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'PL', name: 'Poland' },
  { code: 'SE', name: 'Sweden' },
  { code: 'DK', name: 'Denmark' },
  { code: 'NO', name: 'Norway' },
  { code: 'FI', name: 'Finland' },
  { code: 'BE', name: 'Belgium' },
  { code: 'PT', name: 'Portugal' },
  { code: 'AU', name: 'Australia' },
  { code: 'CA', name: 'Canada' },
  { code: 'IN', name: 'India' },
  { code: 'JP', name: 'Japan' },
];

const LANGUAGES = [
  { code: 'de', name: 'German' },
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'French' },
  { code: 'es', name: 'Spanish' },
  { code: 'it', name: 'Italian' },
  { code: 'nl', name: 'Dutch' },
  { code: 'pl', name: 'Polish' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'sv', name: 'Swedish' },
  { code: 'da', name: 'Danish' },
  { code: 'no', name: 'Norwegian' },
  { code: 'fi', name: 'Finnish' },
  { code: 'ja', name: 'Japanese' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ko', name: 'Korean' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
];

const INDUSTRIES = [
  'Supplements & Vitamins',
  'E-commerce',
  'SaaS / Software',
  'Finance & Banking',
  'Healthcare',
  'Food & Beverage',
  'Fashion & Apparel',
  'Travel & Hospitality',
  'Real Estate',
  'Education',
  'Automotive',
  'Technology',
  'Consulting',
  'Legal Services',
  'Other',
];

const PROVIDER_OPTIONS = [
  {
    id: 'openai' as Provider,
    name: 'OpenAI',
    icon: '🤖',
    color: 'bg-green-500',
    models: [
      { id: 'gpt-4.1', name: 'GPT-4.1 (Latest)' },
      { id: 'gpt-4.1-mini', name: 'GPT-4.1 Mini' },
      { id: 'gpt-4.1-nano', name: 'GPT-4.1 Nano (Fast)' },
      { id: 'gpt-4o', name: 'GPT-4o' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo (Legacy)' },
    ]
  },
  {
    id: 'gemini' as Provider,
    name: 'Google Gemini',
    icon: '✨',
    color: 'bg-blue-500',
    models: [
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (Recommended)' },
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
      { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash-Lite' },
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
      { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash (Preview)' },
    ]
  },
  {
    id: 'perplexity' as Provider,
    name: 'Perplexity',
    icon: '🔍',
    color: 'bg-purple-500',
    description: 'Native web search built-in',
    models: [
      { id: 'sonar', name: 'Sonar (Recommended)' },
      { id: 'sonar-pro', name: 'Sonar Pro' },
      { id: 'sonar-reasoning', name: 'Sonar Reasoning' },
    ]
  },
  {
    id: 'anthropic' as Provider,
    name: 'Anthropic Claude',
    icon: '🧠',
    color: 'bg-orange-500',
    description: 'Uses RAG for web mode',
    models: [
      { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4 (Recommended)' },
      { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku (Fast)' },
      { id: 'claude-opus-4-20250514', name: 'Claude Opus 4 (Most Capable)' },
    ]
  },
];

// ==============================================
// COMPONENT: Header
// ==============================================
function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const canAccessAdmin = user?.permissions?.can_access_admin || user?.role === 'admin' || user?.role === 'demo';

  return (
    <header className="border-b border-dark-700 bg-dark-900/80 backdrop-blur-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Globe className="w-8 h-8 text-primary-500" />
          <span className="text-xl font-bold">GEO Raydar</span>
        </Link>
        <nav className="flex items-center gap-4">
          <a href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/docs`} target="_blank" className="text-sm text-dark-400 hover:text-white transition-colors flex items-center gap-1">
            API <ExternalLink className="w-3 h-3" />
          </a>
          {user && canAccessAdmin && (
            <Link
              href="/admin"
              className="px-3 py-1.5 text-sm bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors"
            >
              Admin Panel
            </Link>
          )}
          {user && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-dark-400">
                <User className="w-4 h-4" />
                {user.name || user.email}
                {user.role && user.role !== 'user' && (
                  <span className={cn(
                    'px-1.5 py-0.5 rounded text-xs',
                    user.role === 'admin' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                  )}>
                    {user.role}
                  </span>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-sm text-dark-400 hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

// ==============================================
// COMPONENT: Phase Indicator
// ==============================================
function PhaseIndicator({ currentPhase }: { currentPhase: number }) {
  const phases = ['Setup', 'Structural', 'LLM Visibility', 'Combined Report'];
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {phases.map((phase, index) => (
        <div key={phase} className="flex items-center">
          <div
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all',
              index < currentPhase
                ? 'bg-primary-500 text-white'
                : index === currentPhase
                ? 'bg-primary-500/20 text-primary-500 border-2 border-primary-500'
                : 'bg-dark-700 text-dark-400'
            )}
          >
            {index < currentPhase ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
          </div>
          <span
            className={cn(
              'ml-2 text-sm hidden sm:inline',
              index <= currentPhase ? 'text-white' : 'text-dark-400'
            )}
          >
            {phase}
          </span>
          {index < phases.length - 1 && (
            <ChevronRight className="w-4 h-4 mx-2 text-dark-500" />
          )}
        </div>
      ))}
    </div>
  );
}

// ==============================================
// COMPONENT: Source Link
// ==============================================
function SourceLink({ source, index }: { source: Source; index: number }) {
  let domain = '';
  try {
    domain = new URL(source.url).hostname.replace('www.', '');
  } catch {
    domain = source.url?.substring(0, 30) || '';
  }

  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 px-2 py-1 bg-dark-700 hover:bg-dark-600 rounded text-xs transition-colors group"
    >
      <Link2 className="w-3 h-3 text-dark-400 group-hover:text-primary-400" />
      <span className="text-dark-300 group-hover:text-white truncate max-w-[150px]">
        {source.title || domain || `Source ${index + 1}`}
      </span>
      <ExternalLink className="w-3 h-3 text-dark-500" />
    </a>
  );
}

// ==============================================
// COMPONENT: Query Result Card
// ==============================================
function QueryResultCard({ result, brandName }: { result: QueryResult; brandName: string }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-dark-800 rounded-lg border border-dark-700 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 text-left hover:bg-dark-700/30 transition-colors"
      >
        <div className="flex items-start gap-4">
          <div className="mt-1">
            {result.brandMentioned ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs px-2 py-0.5 bg-dark-600 rounded capitalize">{result.provider}</span>
              <span className="text-xs text-dark-400">{result.model}</span>
              {result.latencyMs && (
                <span className="text-xs text-dark-500">{(result.latencyMs / 1000).toFixed(1)}s</span>
              )}
            </div>
            <p className="text-sm font-medium truncate">{result.question}</p>

            <div className="flex items-center gap-4 mt-2 text-xs">
              <span className={result.brandMentioned ? 'text-green-500' : 'text-red-500'}>
                {result.brandMentioned ? `✓ ${brandName} mentioned` : `✗ Not mentioned`}
              </span>
              {result.sentiment !== null && result.sentiment !== undefined && (
                <span className={getSentimentColor(result.sentiment)}>
                  Sentiment: {result.sentiment > 0.3 ? '😊' : result.sentiment < -0.3 ? '😞' : '😐'} {result.sentiment.toFixed(2)}
                </span>
              )}
              {result.sources && result.sources.length > 0 && (
                <span className="text-dark-400">
                  <Link2 className="w-3 h-3 inline mr-1" />
                  {result.sources.length} source(s)
                </span>
              )}
            </div>
          </div>

          <ChevronDown className={cn(
            'w-5 h-5 text-dark-400 transition-transform',
            isExpanded && 'rotate-180'
          )} />
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-dark-700 p-4 space-y-4">
          <div>
            <h4 className="text-xs font-medium text-dark-400 mb-2 flex items-center gap-1">
              <FileText className="w-3 h-3" /> Question Asked
            </h4>
            <div className="bg-dark-700/50 rounded p-3 text-sm font-mono">
              {result.question}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-medium text-dark-400 mb-2 flex items-center gap-1">
              <MessageSquare className="w-3 h-3" /> AI Response
            </h4>
            <div className="bg-dark-700/50 rounded p-3 text-sm max-h-64 overflow-y-auto whitespace-pre-wrap">
              {result.responseText || '(No response)'}
            </div>
          </div>

          {result.sources && result.sources.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-dark-400 mb-2 flex items-center gap-1">
                <Link2 className="w-3 h-3" /> Sources Cited ({result.sources.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {result.sources.map((source, idx) => (
                  <SourceLink key={idx} source={source} index={idx} />
                ))}
              </div>
            </div>
          )}

          {result.otherBrandsDetected && result.otherBrandsDetected.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-dark-400 mb-2 flex items-center gap-1">
                <Eye className="w-3 h-3" /> Competitors Mentioned in Response
              </h4>
              <div className="flex flex-wrap gap-2">
                {result.otherBrandsDetected.map((brand, idx) => (
                  <span key={idx} className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-xs">
                    {brand}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-4 gap-3 pt-2">
            <div className="text-center p-2 bg-dark-700/50 rounded">
              <div className="text-lg font-bold">{result.presence !== null && result.presence !== undefined ? result.presence.toFixed(2) : '-'}</div>
              <div className="text-xs text-dark-400">Presence</div>
            </div>
            <div className="text-center p-2 bg-dark-700/50 rounded">
              <div className={cn('text-lg font-bold', getSentimentColor(result.sentiment))}>
                {result.sentiment !== null && result.sentiment !== undefined ? result.sentiment.toFixed(2) : '-'}
              </div>
              <div className="text-xs text-dark-400">Sentiment</div>
            </div>
            <div className="text-center p-2 bg-dark-700/50 rounded">
              <div className="text-lg font-bold">{result.trustAuthority !== null && result.trustAuthority !== undefined ? result.trustAuthority.toFixed(2) : '-'}</div>
              <div className="text-xs text-dark-400">Trust (Auth)</div>
            </div>
            <div className="text-center p-2 bg-dark-700/50 rounded">
              <div className="text-lg font-bold">{result.tokensOut || '-'}</div>
              <div className="text-xs text-dark-400">Tokens</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==============================================
// COMPONENT: Progress View (LLM)
// ==============================================
function ProgressView({ progress }: { progress: RunProgress }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-xl mx-auto"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
        <h2 className="text-2xl font-bold mb-2">LLM Analysis in Progress</h2>
        <p className="text-dark-400">Testing your brand visibility across AI models</p>
      </div>

      <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span>Progress</span>
            <span className="text-primary-500">{progress.progressPercent.toFixed(0)}%</span>
          </div>
          <div className="h-3 bg-dark-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress.progressPercent}%` }}
              className="h-full bg-primary-500 rounded-full"
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center mb-6">
          <div className="bg-dark-700 rounded-lg p-3">
            <div className="text-2xl font-bold text-primary-500">{progress.completedTasks}</div>
            <div className="text-xs text-dark-400">Completed</div>
          </div>
          <div className="bg-dark-700 rounded-lg p-3">
            <div className="text-2xl font-bold">{progress.totalTasks - progress.completedTasks}</div>
            <div className="text-xs text-dark-400">Remaining</div>
          </div>
          <div className="bg-dark-700 rounded-lg p-3">
            <div className="text-2xl font-bold text-red-500">{progress.failedTasks}</div>
            <div className="text-xs text-dark-400">Failed</div>
          </div>
        </div>

        {progress.currentQuery && (
          <div className="bg-dark-700/50 rounded-lg p-4">
            <div className="text-xs text-dark-400 mb-1">Currently processing:</div>
            <div className="text-sm font-medium flex items-center gap-2">
              <span className="text-primary-400">{progress.currentProvider}</span>
              <span className="text-dark-500">•</span>
              <span className="truncate">{progress.currentQuery}</span>
            </div>
          </div>
        )}

        {progress.estimatedRemainingSeconds && progress.estimatedRemainingSeconds > 0 && (
          <div className="text-center text-sm text-dark-400 mt-4">
            Estimated time remaining: {formatDuration(progress.estimatedRemainingSeconds)}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ==============================================
// COMPONENT: Results View (LLM Phase 2)
// ==============================================
function ResultsView({
  results,
  brandName,
  onNewRun,
  jobId,
  onContinueToCombined,
}: {
  results: RunResults;
  brandName: string;
  onNewRun: () => void;
  jobId?: string;
  onContinueToCombined?: () => void;
}) {
  const { summary } = results;
  const [activeTab, setActiveTab] = useState<'overview' | 'results' | 'competitors' | 'sources' | 'report' | 'history'>('overview');
  const [providerFilter, setProviderFilter] = useState<string>('all');
  const pdfReportRef = useRef<HTMLDivElement>(null);
  const [isPdfExporting, setIsPdfExporting] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);
  const [pdfProgressLabel, setPdfProgressLabel] = useState('');

  const handleDownloadPDF = async () => {
    if (!pdfReportRef.current) return;
    setIsPdfExporting(true);
    setPdfProgress(0);
    try {
      await exportReportToPDF(
        pdfReportRef.current,
        brandName,
        (pct, label) => {
          setPdfProgress(pct);
          setPdfProgressLabel(label);
        }
      );
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setIsPdfExporting(false);
      setPdfProgress(0);
      setPdfProgressLabel('');
    }
  };

  const handleViewAsHTML = () => {
    if (!pdfReportRef.current) return;
    openReportAsHTML(pdfReportRef.current, brandName);
  };

  const competitorStats = useMemo(() => {
    const counts: Record<string, number> = {};
    results.results.forEach(r => {
      if (r.otherBrandsDetected) {
        r.otherBrandsDetected.forEach(brand => {
          counts[brand] = (counts[brand] || 0) + 1;
        });
      }
    });

    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        visibility: (count / results.results.length) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);
  }, [results.results]);

  const sourceStats = useMemo(() => {
    const domains: Record<string, { count: number; urls: string[] }> = {};
    results.results.forEach(r => {
      if (r.sources) {
        r.sources.forEach(s => {
          try {
            const domain = new URL(s.url).hostname.replace('www.', '');
            if (!domains[domain]) {
              domains[domain] = { count: 0, urls: [] };
            }
            domains[domain].count++;
            if (domains[domain].urls.length < 3) {
              domains[domain].urls.push(s.url);
            }
          } catch {}
        });
      }
    });

    return Object.entries(domains)
      .map(([domain, data]) => ({ domain, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);
  }, [results.results]);

  const filteredResults = providerFilter === 'all'
    ? results.results
    : results.results.filter(r => r.provider === providerFilter);

  const providers = Array.from(new Set(results.results.map(r => r.provider)));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto"
    >
      {/* Navigation buttons */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onNewRun}
          className="flex items-center gap-2 px-4 py-2 bg-dark-700 hover:bg-dark-600 rounded-lg text-sm font-medium transition-colors"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          Back to Dashboard
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={handleViewAsHTML}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all bg-dark-700 hover:bg-dark-600 text-dark-200 border border-dark-600"
          >
            <Eye className="w-4 h-4" />
            View as HTML
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={isPdfExporting}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              isPdfExporting
                ? 'bg-dark-700 text-dark-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg shadow-purple-900/30'
            )}
          >
            {isPdfExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {pdfProgress > 0 ? `${pdfProgress}% · ${pdfProgressLabel}` : 'Preparing report...'}
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download PDF Report
              </>
            )}
          </button>
          <button
            onClick={onNewRun}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg text-sm font-medium transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            New Analysis
          </button>
        </div>
      </div>

      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">LLM Analysis Complete</h2>
        <p className="text-dark-400">
          Analyzed {summary.totalQueries} queries across {Object.keys(summary.providerVisibility).length} providers
        </p>
      </div>

      <div className="bg-gradient-to-br from-primary-500/20 to-primary-600/10 rounded-2xl p-8 border border-primary-500/30 mb-6">
        <div className="text-center">
          <div className="text-sm text-primary-400 mb-2">Overall Visibility Score</div>
          <div className={cn('text-6xl font-bold mb-2', getVisibilityColor(summary.overallVisibility))}>
            {summary.overallVisibility.toFixed(1)}%
          </div>
          <div className="text-dark-400">
            Your brand <span className="text-white font-medium">{brandName}</span> was mentioned in{' '}
            {summary.overallVisibility.toFixed(0)}% of AI responses
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-6 border-b border-dark-700 pb-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'results', label: 'Detailed Results', icon: FileText },
          { id: 'competitors', label: 'Competitors', icon: Eye },
          { id: 'sources', label: 'Sources', icon: Link2 },
          { id: 'report', label: 'AI Report', icon: Zap },
          { id: 'history', label: 'Brand History', icon: Clock },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'bg-primary-500/20 text-primary-400'
                : 'text-dark-400 hover:text-white hover:bg-dark-700'
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
              <div className="text-dark-400 text-sm mb-1">Avg Sentiment</div>
              <div className={cn('text-2xl font-bold', getSentimentColor(summary.avgSentiment))}>
                {summary.avgSentiment !== null && summary.avgSentiment !== undefined ? summary.avgSentiment.toFixed(2) : '-'}
              </div>
            </div>
            <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
              <div className="text-dark-400 text-sm mb-1">Trust Score</div>
              <div className="text-2xl font-bold text-primary-500">
                {summary.avgTrustAuthority !== null && summary.avgTrustAuthority !== undefined ? summary.avgTrustAuthority.toFixed(2) : '-'}
              </div>
            </div>
            <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
              <div className="text-dark-400 text-sm mb-1">Queries Run</div>
              <div className="text-2xl font-bold">{summary.totalQueries}</div>
            </div>
            <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
              <div className="text-dark-400 text-sm mb-1">Duration</div>
              <div className="text-2xl font-bold">{formatDuration(summary.durationSeconds)}</div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary-500" />
                Visibility by Provider
              </h3>
              <div className="space-y-4">
                {Object.entries(summary.providerVisibility).map(([provider, visibility]) => (
                  <div key={provider}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize">{provider}</span>
                      <span className={getVisibilityColor(visibility)}>{visibility.toFixed(1)}%</span>
                    </div>
                    <div className="h-3 bg-dark-700 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          visibility >= 70 ? 'bg-green-500' : visibility >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                        )}
                        style={{ width: `${visibility}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary-500" />
                Top Competitors (from AI responses)
              </h3>
              {competitorStats.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {competitorStats.slice(0, 8).map((comp, idx) => (
                    <div key={comp.name} className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-dark-500 w-5">#{idx + 1}</span>
                        <span className="text-sm">{comp.name}</span>
                      </div>
                      <span className="text-sm text-dark-400">{comp.visibility.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-dark-400 text-sm">No competitor mentions detected</div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'results' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-dark-400">Filter by provider:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setProviderFilter('all')}
                className={cn(
                  'px-3 py-1 rounded text-sm transition-colors',
                  providerFilter === 'all' ? 'bg-primary-500 text-white' : 'bg-dark-700 text-dark-400 hover:bg-dark-600'
                )}
              >
                All ({results.results.length})
              </button>
              {providers.map(provider => (
                <button
                  key={provider}
                  onClick={() => setProviderFilter(provider)}
                  className={cn(
                    'px-3 py-1 rounded text-sm capitalize transition-colors',
                    providerFilter === provider ? 'bg-primary-500 text-white' : 'bg-dark-700 text-dark-400 hover:bg-dark-600'
                  )}
                >
                  {provider} ({results.results.filter(r => r.provider === provider).length})
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredResults.map((result, index) => (
              <QueryResultCard key={index} result={result} brandName={brandName} />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'competitors' && (
        <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
          <h3 className="text-lg font-semibold mb-4">Competitor Visibility Analysis</h3>
          <p className="text-sm text-dark-400 mb-6">
            These are brands detected in AI responses (extracted from actual response text and sources, not predefined).
          </p>

          {competitorStats.length > 0 ? (
            <div className="space-y-3">
              {competitorStats.map((comp, idx) => (
                <div key={comp.name} className="flex items-center gap-4">
                  <span className="text-dark-500 w-8 text-right">#{idx + 1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">{comp.name}</span>
                      <span className="text-dark-400">
                        {comp.count} mention{comp.count !== 1 ? 's' : ''} ({comp.visibility.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500 rounded-full"
                        style={{ width: `${comp.visibility}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-dark-400 py-8">
              <Eye className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>No competitor brands were detected in the responses.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'sources' && (
        <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
          <h3 className="text-lg font-semibold mb-4">Source Domains Cited by AI</h3>
          <p className="text-sm text-dark-400 mb-6">
            These are the domains most frequently cited as sources by the AI models.
          </p>

          {sourceStats.length > 0 ? (
            <div className="space-y-4">
              {sourceStats.map((src, idx) => (
                <div key={src.domain} className="border-b border-dark-700 pb-4 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-dark-500">#{idx + 1}</span>
                      <span className="font-medium">{src.domain}</span>
                    </div>
                    <span className="text-sm text-dark-400">{src.count} citation{src.count !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {src.urls.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary-400 hover:text-primary-300 truncate max-w-xs flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {url.length > 60 ? url.substring(0, 60) + '...' : url}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-dark-400 py-8">
              <Link2 className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>No sources were cited in the responses.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'report' && (
        <VisibilityReport
          results={results}
          brandName={brandName}
          jobId={jobId}
        />
      )}

      {activeTab === 'history' && (
        <BrandHistory companyId="demo-company" filterBrandName={brandName} />
      )}

      <div className="flex justify-center gap-4 mt-8">
        <button
          onClick={onNewRun}
          className="px-6 py-3 bg-dark-700 hover:bg-dark-600 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" /> New Analysis
        </button>
        {onContinueToCombined && (
          <button
            onClick={onContinueToCombined}
            className="flex-1 max-w-sm px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            View Combined Report <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Hidden PDF report */}
      <PDFReport
        ref={pdfReportRef}
        results={results}
        brandName={brandName}
      />
    </motion.div>
  );
}

// ==============================================
// MAIN DASHBOARD PAGE
// ==============================================
export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  // Phase state: 0=Setup, 1=Structural Baseline, 2=LLM Visibility, 3=Combined Report
  const [phase, setPhase] = useState<0 | 1 | 2 | 3>(0);
  const [showHistory, setShowHistory] = useState(true);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  // ==============================================
  // Phase 0 form state
  // ==============================================
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [brandName, setBrandName] = useState('');
  const [industry, setIndustry] = useState('');
  const [businessContext, setBusinessContext] = useState('');
  const [questionCount, setQuestionCount] = useState(15);
  const [crawlMode, setCrawlMode] = useState<'quick' | 'standard' | 'deep'>('standard');
  const [maxPages, setMaxPages] = useState(25);
  const [crawlDepth, setCrawlDepth] = useState(2);

  // ==============================================
  // Phase 1 SEO crawl state
  // ==============================================
  const [seoAnalysis, setSeoAnalysis] = useState<SiteAnalysis | null>(null);
  const [seoState, setSeoState] = useState<OrchestratorState>('idle');
  const [seoProgress, setSeoProgress] = useState<any>({ completed: 0, total: 0, pagesPerSecond: 0, estimatedTimeRemaining: 0, currentUrl: '' });
  const [seoLog, setSeoLog] = useState<string[]>([]);
  const [seoError, setSeoError] = useState<string | null>(null);
  const [seoTab, setSeoTab] = useState<'overview' | 'pages' | 'ai'>('overview');
  const [selectedPage, setSelectedPage] = useState<string | null>(null);

  // ==============================================
  // Phase 2 LLM visibility state
  // ==============================================
  const [queries, setQueries] = useState<Query[]>([]);
  const [providers, setProviders] = useState<Provider[]>(['openai', 'gemini']);
  const [mode, setMode] = useState<Mode>('provider_web');
  const [market, setMarket] = useState('DE');
  const [language, setLanguage] = useState('de');
  const [openaiModel, setOpenaiModel] = useState('gpt-4.1-mini');
  const [geminiModel, setGeminiModel] = useState('gemini-2.5-flash');
  const [perplexityModel, setPerplexityModel] = useState('sonar');
  const [anthropicModel, setAnthropicModel] = useState('claude-sonnet-4-20250514');

  // Phase 2 query generation state
  const [queriesText, setQueriesText] = useState('');
  const [isGeneratingQueries, setIsGeneratingQueries] = useState(false);
  const [queryGenError, setQueryGenError] = useState<string | null>(null);

  // Phase 2 run state
  const [isStarting, setIsStarting] = useState(false);
  const [llmJobId, setLlmJobId] = useState<string | null>(null);
  const [llmProgress, setLlmProgress] = useState<RunProgress | null>(null);
  const [llmResults, setLlmResults] = useState<RunResults | null>(null);
  const [llmRunning, setLlmRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSubmittingRef = useRef(false);

  // ==============================================
  // Auth + Health checks
  // ==============================================
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    let isMounted = true;
    checkHealth()
      .then(() => { if (isMounted) setIsConnected(true); })
      .catch(() => { if (isMounted) setIsConnected(false); });
    return () => { isMounted = false; };
  }, []);

  // ==============================================
  // Auto-derive brand name from URL
  // ==============================================
  const handleUrlChange = (url: string) => {
    setWebsiteUrl(url);
    try {
      const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
      const hostname = parsed.hostname.replace(/^www\./, '');
      const parts = hostname.split('.');
      const name = parts[0];
      if (name) {
        setBrandName(name.charAt(0).toUpperCase() + name.slice(1));
      }
    } catch {
      // URL not yet parseable; leave brandName as-is
    }
  };

  // ==============================================
  // Phase 1: SEO crawl via SSE
  // ==============================================
  const crawlModeConfig = {
    quick:    { maxPages: 10,  maxDepth: 1 },
    standard: { maxPages: 25,  maxDepth: 2 },
    deep:     { maxPages: 50,  maxDepth: 3 },
  };

  useEffect(() => {
    if (phase !== 1) return;

    const normalizedUrl = websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`;
    const url = `/analyze/stream?url=${encodeURIComponent(normalizedUrl)}&maxPages=${maxPages}&maxDepth=${crawlDepth}&includeSitemap=false`;

    setSeoState('initializing');
    setSeoError(null);
    setSeoAnalysis(null);
    setSeoLog([]);

    const es = new EventSource(url);
    let terminated = false;

    es.addEventListener('state', (e: MessageEvent) => {
      try {
        const raw = JSON.parse(e.data);
        const state = typeof raw === 'string' ? raw as OrchestratorState : (raw.to ?? raw.state ?? 'initializing');
        setSeoState(state);
        setSeoLog(prev => [...prev, `→ ${state}`]);
      } catch {
        setSeoState(e.data as OrchestratorState);
      }
    });

    es.addEventListener('page', (e: MessageEvent) => {
      try {
        const { url: pageUrl, scores } = JSON.parse(e.data);
        setSeoLog(prev => [...prev, `analyzed: ${pageUrl} (${scores?.overall ?? '?'})`]);
      } catch {}
    });

    es.addEventListener('progress', (e: MessageEvent) => {
      try {
        setSeoProgress(JSON.parse(e.data));
      } catch {}
    });

    es.addEventListener('log', (e: MessageEvent) => {
      setSeoLog(prev => [...prev, e.data]);
    });

    es.addEventListener('complete', (e: MessageEvent) => {
      terminated = true;
      try {
        const analysis: SiteAnalysis = JSON.parse(e.data);
        setSeoAnalysis(analysis);
        setSeoState('complete');
      } catch {
        setSeoError('Failed to parse crawl results.');
        setSeoState('error');
      }
      es.close();
    });

    es.addEventListener('fail', (e: MessageEvent) => {
      terminated = true;
      try {
        const data = JSON.parse(e.data);
        setSeoError(data.message || 'Crawl failed. Please try again.');
      } catch {
        setSeoError(e.data || 'Crawl failed. Please try again.');
      }
      setSeoState('error');
      es.close();
    });

    es.onerror = () => {
      if (!terminated) {
        setSeoError('Could not connect to the analysis server. Please retry.');
        setSeoState('error');
      }
      es.close();
    };

    return () => {
      es.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // ==============================================
  // Phase 2: Auto-generate queries on mount
  // ==============================================
  useEffect(() => {
    if (phase !== 2) return;
    if (queriesText) return; // already generated

    generateQueries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const generateQueries = async () => {
    setIsGeneratingQueries(true);
    setQueryGenError(null);

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    const marketNames: Record<string, string> = {
      DE: 'Germany', US: 'United States', GB: 'United Kingdom', UK: 'United Kingdom',
      FR: 'France', ES: 'Spain', IT: 'Italy', AT: 'Austria', CH: 'Switzerland',
      NL: 'Netherlands', BE: 'Belgium', PL: 'Poland', SE: 'Sweden', DK: 'Denmark',
      NO: 'Norway', FI: 'Finland', PT: 'Portugal', AU: 'Australia', CA: 'Canada',
      IN: 'India', JP: 'Japan',
    };

    try {
      const response = await fetch(`${API_BASE}/api/queries/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: brandName,
          industry,
          description: businessContext,
          language,
          count: questionCount,
          target_market: marketNames[market] || market,
          provider: 'auto',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Generation failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.queries && data.queries.length > 0) {
        const texts = data.queries.map((q: { question: string }) => q.question);
        setQueriesText(texts.join('\n'));
        if (data.generated_by === 'fallback') {
          setQueryGenError('Note: Using template queries. Check API keys for AI generation.');
        }
      } else {
        throw new Error('No queries returned');
      }
    } catch (err) {
      const samples = getSampleQueriesForIndustry(industry, language).slice(0, questionCount);
      setQueriesText(samples.join('\n'));
      setQueryGenError(err instanceof Error ? err.message : 'AI generation failed; loaded samples instead.');
    } finally {
      setIsGeneratingQueries(false);
    }
  };

  const handleLoadSamples = () => {
    const samples = getSampleQueriesForIndustry(industry, language).slice(0, questionCount);
    setQueriesText(samples.join('\n'));
    setQueryGenError(null);
  };

  // ==============================================
  // Phase 2: Poll LLM run
  // ==============================================
  useEffect(() => {
    if (!llmJobId || !llmRunning || llmResults) return;

    let isMounted = true;

    const pollInterval = setInterval(async () => {
      if (!isMounted) return;

      try {
        const status = await getRunStatus(llmJobId);
        if (!isMounted) return;
        setLlmProgress(status);

        if (['completed', 'failed', 'cancelled'].includes(status.status)) {
          clearInterval(pollInterval);
          setLlmRunning(false);

          if (status.status === 'completed') {
            try {
              const runResults = await getRunResults(llmJobId);
              if (isMounted) {
                setLlmResults(runResults);
                setError(null);
              }
            } catch (resultsErr) {
              console.warn('Could not fetch results by job_id:', resultsErr);
            }
          } else {
            const errorMsg = status.error
              ? `Run ${status.status}: ${status.error.split('\n')[0]}`
              : `Run ${status.status}`;
            if (isMounted) setError(errorMsg);
          }
        }
      } catch (err) {
        clearInterval(pollInterval);
        setLlmRunning(false);
        if (isMounted && !llmResults) {
          setError(err instanceof Error ? err.message : 'Failed to get status');
        }
      }
    }, 2000);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [llmJobId, llmRunning, llmResults]);

  const handleStartLlmRun = async () => {
    if (isSubmittingRef.current) return;

    const parsedQueries = parseQueriesFromText(queriesText);
    if (!parsedQueries || parsedQueries.length === 0) {
      setError('No queries to analyze. Please add at least one question.');
      return;
    }

    isSubmittingRef.current = true;
    setIsStarting(true);
    setError(null);

    try {
      const config: RunConfig = {
        companyId: 'demo-company',
        brandName,
        industry,
        providers,
        openaiModel,
        geminiModel,
        perplexityModel,
        anthropicModel,
        mode,
        queries: parsedQueries,
        market,
        lang: language,
      };

      const response = await startRun(config);
      setLlmJobId(response.jobId);
      setLlmRunning(true);
      setQueries(parsedQueries);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start run');
    } finally {
      isSubmittingRef.current = false;
      setIsStarting(false);
    }
  };

  // ==============================================
  // Handle previous run selection
  // ==============================================
  const handleViewPreviousRun = async (run: import('@/lib/types').RunHistorySummary) => {
    if (!run.jobId) {
      setError('This run does not have detailed results available.');
      return;
    }

    setError(null);
    setIsStarting(true);

    try {
      const runResults = await getRunResults(run.jobId);
      setBrandName(run.brandName || 'Unknown Brand');
      setLlmResults(runResults);
      setLlmJobId(run.jobId);
      setPhase(2);
      setShowHistory(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load run details');
    } finally {
      setIsStarting(false);
    }
  };

  const handleNewAnalysis = () => {
    setPhase(0);
    setShowHistory(false);
    setWebsiteUrl('');
    setBrandName('');
    setIndustry('');
    setBusinessContext('');
    setQuestionCount(15);
    setCrawlMode('standard');
    setSeoAnalysis(null);
    setSeoState('idle');
    setSeoError(null);
    setQueriesText('');
    setQueries([]);
    setLlmJobId(null);
    setLlmProgress(null);
    setLlmResults(null);
    setLlmRunning(false);
    setError(null);
  };

  // ==============================================
  // SEO Report helpers
  // ==============================================
  const openSeoReportAsHTML = (analysis: SiteAnalysis) => {
    const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>SEO Report - ${analysis.domain}</title>
<style>
  body { font-family: system-ui, sans-serif; max-width: 900px; margin: 2rem auto; padding: 0 1rem; background: #0f1117; color: #e2e8f0; }
  h1 { color: #22d3ee; } h2 { color: #a78bfa; border-bottom: 1px solid #334155; padding-bottom: 0.5rem; }
  .scores { display: flex; gap: 2rem; margin: 1rem 0; }
  .score { text-align: center; padding: 1rem; background: #1e293b; border-radius: 0.5rem; min-width: 100px; }
  .score .val { font-size: 2rem; font-weight: 700; color: #22d3ee; }
  .score .lbl { font-size: 0.75rem; color: #94a3b8; }
  table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
  th { text-align: left; padding: 0.5rem; background: #1e293b; font-size: 0.75rem; text-transform: uppercase; color: #94a3b8; }
  td { padding: 0.5rem; border-bottom: 1px solid #1e293b; font-size: 0.875rem; }
  .issue { padding: 0.5rem; border-radius: 0.25rem; margin: 0.25rem 0; font-size: 0.8rem; }
  .critical { background: #450a0a; border-left: 3px solid #ef4444; }
  .warning { background: #431407; border-left: 3px solid #f59e0b; }
</style></head>
<body>
<h1>SEO &amp; AEO Report</h1>
<p style="color:#94a3b8">Domain: <strong style="color:white">${analysis.domain}</strong> &nbsp;&bull;&nbsp; ${analysis.stats.totalPages} pages crawled</p>
<div class="scores">
  <div class="score"><div class="val">${analysis.scores.overall}</div><div class="lbl">Overall</div></div>
  <div class="score"><div class="val">${analysis.scores.seo}</div><div class="lbl">SEO</div></div>
  <div class="score"><div class="val">${analysis.scores.aeo}</div><div class="lbl">AEO</div></div>
</div>
<h2>Site-Wide Issues</h2>
${[...analysis.siteWideIssues.critical, ...analysis.siteWideIssues.warnings].map(i =>
  `<div class="issue ${i.severity}"><strong>${i.title}</strong>: ${i.description} (${i.count} pages)<br><small>${i.recommendation}</small></div>`
).join('')}
<h2>Pages (${analysis.pages.length})</h2>
<table>
<thead><tr><th>URL</th><th>Overall</th><th>SEO</th><th>AEO</th></tr></thead>
<tbody>
${analysis.pages.map(p => `<tr><td style="font-family:monospace;font-size:0.75rem">${p.url}</td><td>${p.scores.overall}</td><td>${p.scores.seo}</td><td>${p.scores.aeo}</td></tr>`).join('')}
</tbody></table>
<p style="color:#475569;font-size:0.75rem">Generated by GEO Raydar on ${new Date().toLocaleString()}</p>
</body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, '_blank');
  };

  const openCombinedReportAsHTML = (seo: SiteAnalysis, llm: RunResults) => {
    const llmVis = llm.summary.overallVisibility;
    const composite = Math.round((llmVis * 0.40) + (seo.scores.overall * 0.40) + (seo.scores.aeo * 0.20));

    const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Combined Visibility Report - ${brandName}</title>
<style>
  body { font-family: system-ui, sans-serif; max-width: 1000px; margin: 2rem auto; padding: 0 1rem; background: #0f1117; color: #e2e8f0; }
  h1 { color: #22d3ee; } h2 { color: #a78bfa; border-bottom: 1px solid #334155; padding-bottom: 0.5rem; margin-top: 2rem; }
  .index-card { background: linear-gradient(135deg, #1e3a5f, #1e1b4b); border: 1px solid #3b82f6; border-radius: 0.75rem; padding: 2rem; text-align: center; margin: 1.5rem 0; }
  .composite { font-size: 4rem; font-weight: 700; color: #22d3ee; }
  .sub-scores { display: flex; gap: 2rem; justify-content: center; margin-top: 1.5rem; }
  .sub { text-align: center; }
  .sub .val { font-size: 1.5rem; font-weight: 700; }
  .sub .lbl { font-size: 0.75rem; color: #94a3b8; }
  .cyan { color: #22d3ee; } .green { color: #4ade80; } .violet { color: #a78bfa; }
  table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
  th { text-align: left; padding: 0.5rem; background: #1e293b; font-size: 0.75rem; text-transform: uppercase; color: #94a3b8; }
  td { padding: 0.5rem; border-bottom: 1px solid #1e293b; font-size: 0.875rem; }
</style></head>
<body>
<h1>Combined Visibility Report</h1>
<p style="color:#94a3b8">Brand: <strong style="color:white">${brandName}</strong></p>
<div class="index-card">
  <p style="color:#94a3b8;font-size:0.875rem;margin-bottom:0.5rem">Visibility Index</p>
  <div class="composite">${composite}</div>
  <div class="sub-scores">
    <div class="sub"><div class="val cyan">${llmVis.toFixed(1)}%</div><div class="lbl">LLM Presence</div></div>
    <div class="sub"><div class="val green">${seo.scores.overall}</div><div class="lbl">Structural Readiness</div></div>
    <div class="sub"><div class="val violet">${seo.scores.aeo}</div><div class="lbl">AEO Score</div></div>
  </div>
</div>
<h2>Structural Baseline (${seo.domain})</h2>
<p>Overall: ${seo.scores.overall} | SEO: ${seo.scores.seo} | AEO: ${seo.scores.aeo} | Pages crawled: ${seo.stats.totalPages}</p>
<h2>LLM Visibility</h2>
<p>Overall Visibility: ${llmVis.toFixed(1)}% | Queries: ${llm.summary.totalQueries} | Providers: ${Object.keys(llm.summary.providerVisibility).join(', ')}</p>
<table><thead><tr><th>Provider</th><th>Visibility</th></tr></thead><tbody>
${Object.entries(llm.summary.providerVisibility).map(([p, v]) => `<tr><td>${p}</td><td>${v.toFixed(1)}%</td></tr>`).join('')}
</tbody></table>
<p style="color:#475569;font-size:0.75rem">Generated by GEO Raydar on ${new Date().toLocaleString()}</p>
</body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    window.open(URL.createObjectURL(blob), '_blank');
  };

  // ==============================================
  // Guards: loading + no connection
  // ==============================================
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (isConnected === false) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">API Not Connected</h1>
          <p className="text-dark-400 mb-4">
            Make sure the GEO Raydar API is running on port 8000
          </p>
          <code className="bg-dark-800 px-4 py-2 rounded text-sm">
            uvicorn api.main:app --reload --port 8000
          </code>
        </div>
      </div>
    );
  }

  // ==============================================
  // Derived values for Phase 3
  // ==============================================
  const llmVisibility = llmResults?.summary?.overallVisibility ?? 0;
  const compositeScore = seoAnalysis
    ? Math.round((llmVisibility * 0.40) + (seoAnalysis.scores.overall * 0.40) + (seoAnalysis.scores.aeo * 0.20))
    : 0;

  let seoDomain = '';
  try {
    seoDomain = seoAnalysis
      ? seoAnalysis.domain
      : new URL(websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`).hostname.replace('www.', '');
  } catch {}

  // ==============================================
  // RENDER
  // ==============================================
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Connection indicator */}
        {isConnected && (
          <div className="flex items-center justify-center gap-2 text-sm text-green-500 mb-6">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            API Connected
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="max-w-xl mx-auto mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>{error}</div>
            </div>
          </div>
        )}

        {/* ============================================================
            PHASE 0: Brand & Site Setup
        ============================================================ */}
        {phase === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-2xl mx-auto"
          >
            {/* History / New Analysis toggle */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <button
                onClick={() => setShowHistory(true)}
                className={cn(
                  'flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all',
                  showHistory
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                    : 'bg-dark-800 text-dark-400 hover:bg-dark-700 hover:text-white border border-dark-700'
                )}
              >
                <History className="w-5 h-5" />
                Previous Runs
              </button>
              <button
                onClick={() => setShowHistory(false)}
                className={cn(
                  'flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all',
                  !showHistory
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                    : 'bg-dark-800 text-dark-400 hover:bg-dark-700 hover:text-white border border-dark-700'
                )}
              >
                <PlusCircle className="w-5 h-5" />
                New Analysis
              </button>
            </div>

            {/* Previous Runs */}
            {showHistory && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-6xl mx-auto"
              >
                <PreviousRuns
                  companyId="demo-company"
                  onSelectRun={handleViewPreviousRun}
                />
                {isStarting && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-blue-400">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Loading run details...
                  </div>
                )}
              </motion.div>
            )}

            {/* New Analysis Setup Form */}
            {!showHistory && (
              <>
                <div className="text-center mb-8">
                  <Globe className="w-12 h-12 text-primary-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Start New Analysis</h2>
                  <p className="text-dark-400">Enter your website and brand details to begin</p>
                </div>

                <div className="bg-dark-800 rounded-xl p-6 border border-dark-700 space-y-5">
                  {/* Website URL */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Website URL *</label>
                    <input
                      type="url"
                      value={websiteUrl}
                      onChange={(e) => handleUrlChange(e.target.value)}
                      placeholder="https://yourbrand.com"
                      className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <p className="text-xs text-dark-400 mt-1">
                      Full URL including protocol. Brand name is auto-derived from the hostname.
                    </p>
                  </div>

                  {/* Brand Name */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Brand Name *</label>
                    <input
                      type="text"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      placeholder="e.g., Acme"
                      className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  {/* Industry */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Industry *</label>
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Select your industry</option>
                      {INDUSTRIES.map((ind) => (
                        <option key={ind} value={ind}>{ind}</option>
                      ))}
                    </select>
                  </div>

                  {/* Business Context */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Business Context *</label>
                    <textarea
                      value={businessContext}
                      onChange={(e) => setBusinessContext(e.target.value)}
                      placeholder="Describe your brand's positioning, products, target audience, and unique selling points..."
                      rows={4}
                      className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    />
                  </div>

                  {/* Crawl Settings */}
                  <div className="space-y-4">
                    <label className="block text-sm font-medium">Crawl Mode</label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['quick', 'standard', 'deep'] as const).map((cm) => {
                        const cfg = crawlModeConfig[cm];
                        return (
                          <button
                            key={cm}
                            onClick={() => {
                              setCrawlMode(cm);
                              setMaxPages(cfg.maxPages);
                              setCrawlDepth(cfg.maxDepth);
                            }}
                            className={cn(
                              'p-4 rounded-lg border-2 transition-all text-left',
                              crawlMode === cm
                                ? 'border-primary-500 bg-primary-500/10'
                                : 'border-dark-600 hover:border-dark-500'
                            )}
                          >
                            <div className="font-medium capitalize">{cm}</div>
                            <div className="text-xs text-dark-400 mt-1">
                              {cfg.maxPages} pages, depth {cfg.maxDepth}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Max Pages slider */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-dark-300">Max Pages</span>
                        <span className="text-sm font-semibold text-primary-400">{maxPages} pages</span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={50}
                        value={maxPages}
                        onChange={(e) => setMaxPages(parseInt(e.target.value))}
                        className="w-full accent-primary-500"
                      />
                      <div className="flex justify-between text-xs text-dark-500 mt-1">
                        <span>1</span><span>10</span><span>25</span><span>50</span>
                      </div>
                    </div>

                    {/* Crawl Depth slider */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-dark-300">Crawl Depth</span>
                        <span className="text-sm font-semibold text-primary-400">depth {crawlDepth}</span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={3}
                        value={crawlDepth}
                        onChange={(e) => setCrawlDepth(parseInt(e.target.value))}
                        className="w-full accent-primary-500"
                      />
                      <div className="flex justify-between text-xs text-dark-500 mt-1">
                        <span>Shallow</span><span>Medium</span><span>Deep</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setShowHistory(false);
                      setPhase(1);
                    }}
                    disabled={!websiteUrl || !brandName || !industry || !businessContext}
                    className={cn(
                      'w-full mt-2 px-6 py-4 rounded-lg font-semibold text-lg transition-all flex items-center justify-center gap-2',
                      websiteUrl && brandName && industry && businessContext
                        ? 'bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/25'
                        : 'bg-dark-600 text-dark-400 cursor-not-allowed'
                    )}
                  >
                    <Play className="w-5 h-5" />
                    Start Analysis
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* ============================================================
            PHASE 1: Structural Baseline (SEO Crawl)
        ============================================================ */}
        {phase === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <PhaseIndicator currentPhase={1} />

            <div className="text-center mb-8">
              <Search className="w-12 h-12 text-primary-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Structural Baseline Crawl</h2>
              <p className="text-dark-400">
                Crawling <span className="text-white font-mono">{websiteUrl}</span> for SEO and AEO signals
              </p>
            </div>

            {/* Crawl in progress */}
            {!seoAnalysis && seoState !== 'error' && (
              <div className="bg-dark-800 rounded-xl p-6 border border-dark-700 mb-6">
                <CrawlProgressPanel
                  state={seoState}
                  progress={seoProgress}
                  log={seoLog}
                />
              </div>
            )}

            {/* Crawl error */}
            {seoState === 'error' && !seoAnalysis && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 mb-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
                  <div>
                    <p className="text-red-400 font-medium mb-1">Crawl failed</p>
                    <p className="text-red-300 text-sm">{seoError}</p>
                    <button
                      onClick={() => setPhase(1)}
                      className="mt-3 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Crawl complete: show results */}
            {seoAnalysis && (
              <>
                {/* Tab nav */}
                <div className="flex gap-2 mb-6 border-b border-dark-700 pb-2">
                  {[
                    { id: 'overview', label: 'Overview', icon: BarChart3 },
                    { id: 'pages', label: 'Pages', icon: FileText },
                    { id: 'ai', label: 'AI Recommendations', icon: Zap },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setSeoTab(tab.id as typeof seoTab)}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                        seoTab === tab.id
                          ? 'bg-primary-500/20 text-primary-400'
                          : 'text-dark-400 hover:text-white hover:bg-dark-700'
                      )}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  ))}

                  {/* Export buttons: right-aligned */}
                  <div className="ml-auto flex gap-2">
                    <button
                      onClick={() => openSeoReportAsHTML(seoAnalysis)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-dark-700 hover:bg-dark-600 text-dark-200 border border-dark-600 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View as HTML
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download PDF
                    </button>
                  </div>
                </div>

                <div className="bg-dark-800 rounded-xl p-6 border border-dark-700 mb-6">
                  {seoTab === 'overview' && (
                    <SiteOverview analysis={seoAnalysis} />
                  )}
                  {seoTab === 'pages' && (
                    <>
                      <PageList
                        pages={seoAnalysis.pages}
                        onSelect={(page: PageAnalysis) => setSelectedPage(prev => prev === page.url ? null : page.url)}
                        selectedUrl={selectedPage ?? undefined}
                      />
                      {selectedPage && (() => {
                        const page = seoAnalysis.pages.find(p => p.url === selectedPage);
                        return page ? (
                          <PageDetailPanel page={page} onClose={() => setSelectedPage(null)} />
                        ) : null;
                      })()}
                    </>
                  )}
                  {seoTab === 'ai' && (
                    seoAnalysis.aiRecommendations ? (
                      <AIRecommendationsPanel recommendations={seoAnalysis.aiRecommendations} />
                    ) : (
                      <div className="text-center py-12 text-dark-400">
                        <Zap className="w-12 h-12 mx-auto mb-4 opacity-30" />
                        <p>AI recommendations were not generated for this crawl.</p>
                      </div>
                    )
                  )}
                </div>

                {/* Continue button */}
                <button
                  onClick={() => setPhase(2)}
                  className="w-full px-6 py-4 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl font-semibold text-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/30"
                >
                  Continue to LLM Visibility <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </motion.div>
        )}

        {/* ============================================================
            PHASE 2: LLM Visibility
        ============================================================ */}
        {phase === 2 && !llmRunning && !llmResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <PhaseIndicator currentPhase={2} />

            <div className="text-center mb-8">
              <Zap className="w-12 h-12 text-primary-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">LLM Visibility Analysis</h2>
              <p className="text-dark-400">Configure AI providers and run the visibility analysis for <span className="text-white font-medium">{brandName}</span></p>
            </div>

            <div className="space-y-6">
              {/* Section 1: AI Providers */}
              <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                <label className="block text-sm font-medium mb-4 flex items-center gap-2">
                  <span className="text-2xl">🤖</span> AI Providers &amp; Models
                </label>
                <div className="space-y-3">
                  {PROVIDER_OPTIONS.map((provider) => (
                    <div key={provider.id} className="space-y-2">
                      <button
                        onClick={() => {
                          if (providers.includes(provider.id)) {
                            if (providers.length > 1) setProviders(providers.filter((p) => p !== provider.id));
                          } else {
                            setProviders([...providers, provider.id]);
                          }
                        }}
                        className={cn(
                          'w-full p-4 rounded-lg border-2 transition-all text-left flex items-center gap-4',
                          providers.includes(provider.id)
                            ? 'border-primary-500 bg-primary-500/10'
                            : 'border-dark-600 hover:border-dark-500'
                        )}
                      >
                        <span className="text-2xl">{provider.icon}</span>
                        <div className="flex-1">
                          <div className="font-medium">{provider.name}</div>
                          <div className="text-sm text-dark-400">
                            {provider.id === 'openai'
                              ? provider.models.find(m => m.id === openaiModel)?.name || openaiModel
                              : provider.id === 'gemini'
                              ? provider.models.find(m => m.id === geminiModel)?.name || geminiModel
                              : provider.id === 'perplexity'
                              ? provider.models.find(m => m.id === perplexityModel)?.name || perplexityModel
                              : provider.models.find(m => m.id === anthropicModel)?.name || anthropicModel}
                          </div>
                          {(provider as any).description && (
                            <div className="text-xs text-dark-500 mt-0.5">{(provider as any).description}</div>
                          )}
                        </div>
                        <div
                          className={cn(
                            'w-5 h-5 rounded border-2 flex items-center justify-center transition-all',
                            providers.includes(provider.id)
                              ? 'border-primary-500 bg-primary-500'
                              : 'border-dark-500'
                          )}
                        >
                          {providers.includes(provider.id) && (
                            <CheckCircle2 className="w-3 h-3 text-white" />
                          )}
                        </div>
                      </button>

                      {providers.includes(provider.id) && (
                        <div className="ml-12 pl-4 border-l-2 border-primary-500/30">
                          <label className="block text-xs text-dark-400 mb-1">Select Model</label>
                          <select
                            value={
                              provider.id === 'openai' ? openaiModel :
                              provider.id === 'gemini' ? geminiModel :
                              provider.id === 'perplexity' ? perplexityModel :
                              anthropicModel
                            }
                            onChange={(e) => {
                              if (provider.id === 'openai') setOpenaiModel(e.target.value);
                              else if (provider.id === 'gemini') setGeminiModel(e.target.value);
                              else if (provider.id === 'perplexity') setPerplexityModel(e.target.value);
                              else setAnthropicModel(e.target.value);
                            }}
                            className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                          >
                            {provider.models.map((model) => (
                              <option key={model.id} value={model.id}>{model.name}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-dark-400 mt-3">{providers.length} provider(s) selected</p>
              </div>

              {/* Section 2: Region & Language */}
              <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                <label className="block text-sm font-medium mb-4 flex items-center gap-2">
                  <Globe2 className="w-5 h-5 text-primary-500" /> Region &amp; Language
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-dark-400 mb-2">Market / Country</label>
                    <select
                      value={market}
                      onChange={(e) => setMarket(e.target.value)}
                      className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {MARKETS.map((m) => (
                        <option key={m.code} value={m.code}>{m.name} ({m.code})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-dark-400 mb-2">Language</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {LANGUAGES.map((l) => (
                        <option key={l.code} value={l.code}>{l.name} ({l.code})</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Knowledge Source */}
              <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                <label className="block text-sm font-medium mb-4 flex items-center gap-2">
                  <Search className="w-5 h-5 text-primary-500" /> Knowledge Source
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setMode('provider_web')}
                    className={cn(
                      'p-4 rounded-lg border-2 transition-all text-left',
                      mode === 'provider_web'
                        ? 'border-primary-500 bg-primary-500/10'
                        : 'border-dark-600 hover:border-dark-500'
                    )}
                  >
                    <div className="font-medium flex items-center gap-2">
                      <Globe className="w-4 h-4" /> Web Search
                    </div>
                    <div className="text-xs text-dark-400 mt-1">Uses live web data (recommended)</div>
                  </button>
                  <button
                    onClick={() => setMode('internal')}
                    className={cn(
                      'p-4 rounded-lg border-2 transition-all text-left',
                      mode === 'internal'
                        ? 'border-primary-500 bg-primary-500/10'
                        : 'border-dark-600 hover:border-dark-500'
                    )}
                  >
                    <div className="font-medium flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Internal Knowledge
                    </div>
                    <div className="text-xs text-dark-400 mt-1">Model&apos;s training data only</div>
                  </button>
                </div>
              </div>

              {/* Section 4: Queries */}
              <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-primary-500" /> Queries
                    {queriesText && (
                      <span className="text-xs text-dark-400">
                        ({queriesText.split('\n').filter(l => l.trim()).length} / {questionCount})
                      </span>
                    )}
                  </label>
                  <div className="flex gap-2 items-center">
                    <button
                      onClick={handleLoadSamples}
                      className="text-xs px-3 py-1.5 bg-dark-700 hover:bg-dark-600 rounded-md transition-colors"
                    >
                      Load Samples
                    </button>
                    <button
                      onClick={generateQueries}
                      disabled={isGeneratingQueries}
                      className="text-xs px-3 py-1.5 bg-primary-500/20 text-primary-400 hover:bg-primary-500/30 rounded-md transition-colors flex items-center gap-1"
                    >
                      {isGeneratingQueries ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                      AI Generate ({questionCount})
                    </button>
                  </div>
                </div>

                {isGeneratingQueries && !queriesText && (
                  <div className="flex items-center gap-3 py-6 justify-center text-dark-400">
                    <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
                    Generating {questionCount} queries for {brandName}...
                  </div>
                )}

                {queryGenError && (
                  <div className="mb-3 text-xs text-amber-400 bg-amber-500/10 px-3 py-2 rounded">
                    {queryGenError}
                  </div>
                )}

                <textarea
                  value={queriesText}
                  onChange={(e) => setQueriesText(e.target.value)}
                  placeholder={`Enter one question per line, e.g.:\n\nWhat are the best ${industry} brands?\nCompare top ${industry} companies\nWho leads in ${industry}?`}
                  rows={12}
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm resize-none"
                />
                <p className="text-xs text-dark-400 mt-2">
                  Edit queries above before running the analysis.
                </p>
              </div>

              {/* Run button */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => { setPhase(1); setLlmResults(null); setLlmProgress(null); }}
                  className="px-6 py-3 bg-dark-700 hover:bg-dark-600 rounded-lg font-medium transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleStartLlmRun}
                  disabled={queriesText.split('\n').filter(l => l.trim()).length === 0 || isStarting || providers.length === 0}
                  className={cn(
                    'flex-1 px-6 py-4 rounded-lg font-semibold text-lg transition-all flex items-center justify-center gap-2',
                    queriesText.split('\n').filter(l => l.trim()).length > 0 && !isStarting && providers.length > 0
                      ? 'bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/25'
                      : 'bg-dark-600 text-dark-400 cursor-not-allowed'
                  )}
                >
                  {isStarting ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Starting...</>
                  ) : (
                    <><Play className="w-5 h-5" /> Run LLM Analysis ({queriesText.split('\n').filter(l => l.trim()).length} queries)</>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Phase 2: LLM running (progress) */}
        {phase === 2 && llmRunning && llmProgress && !llmResults && (
          <ProgressView progress={llmProgress} />
        )}

        {/* Phase 2: LLM waiting for first progress tick */}
        {phase === 2 && llmRunning && !llmProgress && !llmResults && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        )}

        {/* Phase 2: LLM results */}
        {phase === 2 && llmResults && (
          <ResultsView
            results={llmResults}
            brandName={brandName}
            onNewRun={handleNewAnalysis}
            jobId={llmJobId || undefined}
            onContinueToCombined={seoAnalysis ? () => setPhase(3) : undefined}
          />
        )}

        {/* ============================================================
            PHASE 3: Combined Visibility Report
        ============================================================ */}
        {phase === 3 && seoAnalysis && llmResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-5xl mx-auto"
          >
            <PhaseIndicator currentPhase={3} />

            {/* 1. Visibility Index card */}
            <div className="bg-gradient-to-br from-blue-900/40 to-violet-900/30 rounded-2xl p-8 border border-blue-500/30 mb-8">
              <div className="text-center">
                <div className="text-sm text-blue-400 mb-2 font-medium uppercase tracking-wider">Visibility Index</div>
                <div className="text-7xl font-bold text-cyan-400 mb-4">{compositeScore}</div>
                <div className="flex justify-center gap-8 mt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-cyan-400">{llmVisibility.toFixed(1)}%</div>
                    <div className="text-xs text-dark-400 mt-1">LLM Presence</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{seoAnalysis.scores.overall}</div>
                    <div className="text-xs text-dark-400 mt-1">Structural Readiness</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-violet-400">{seoAnalysis.scores.aeo}</div>
                    <div className="text-xs text-dark-400 mt-1">AEO Score</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Structural Baseline section */}
            <div className="bg-dark-800 rounded-xl p-6 border border-dark-700 mb-6">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <Globe className="w-5 h-5 text-green-400" />
                Structural Baseline
                <span className="text-dark-400 font-normal text-sm ml-1">{seoDomain}</span>
              </h3>
              <SiteOverview analysis={seoAnalysis} />
            </div>

            {/* 3. LLM Visibility section */}
            <div className="bg-dark-800 rounded-xl p-6 border border-dark-700 mb-6">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <Zap className="w-5 h-5 text-cyan-400" />
                LLM Visibility
                <span className="text-dark-400 font-normal text-sm ml-1">{brandName}</span>
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-dark-400 mb-3 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" /> Provider Visibility
                  </h4>
                  <div className="space-y-3">
                    {Object.entries(llmResults.summary.providerVisibility).map(([provider, visibility]) => (
                      <div key={provider}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="capitalize">{provider}</span>
                          <span className={getVisibilityColor(visibility)}>{visibility.toFixed(1)}%</span>
                        </div>
                        <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full',
                              visibility >= 70 ? 'bg-green-500' : visibility >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                            )}
                            style={{ width: `${visibility}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-dark-400 mb-3 flex items-center gap-2">
                    <Eye className="w-4 h-4" /> Competitor Mentions
                  </h4>
                  {(() => {
                    const counts: Record<string, number> = {};
                    llmResults.results.forEach(r => {
                      r.otherBrandsDetected?.forEach(b => { counts[b] = (counts[b] || 0) + 1; });
                    });
                    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8);
                    return sorted.length > 0 ? (
                      <div className="space-y-2">
                        {sorted.map(([name, count], idx) => (
                          <div key={name} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-dark-500">#{idx + 1}</span>
                              <span>{name}</span>
                            </div>
                            <span className="text-dark-400">{((count / llmResults.results.length) * 100).toFixed(0)}%</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-dark-400 text-sm">No competitor mentions detected</p>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* 4. Export buttons */}
            <div className="flex gap-3 justify-end mb-6">
              <button
                onClick={() => openCombinedReportAsHTML(seoAnalysis, llmResults)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-dark-700 hover:bg-dark-600 text-dark-200 border border-dark-600 transition-colors"
              >
                <Eye className="w-4 h-4" />
                Export as HTML
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white transition-colors"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>

            {/* New analysis */}
            <div className="flex justify-center">
              <button
                onClick={handleNewAnalysis}
                className="px-8 py-3 bg-primary-500 hover:bg-primary-600 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Run New Analysis
              </button>
            </div>
          </motion.div>
        )}
      </main>

      <footer className="border-t border-dark-700 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-dark-400">
          GEO Raydar &copy; 2026 - Track your brand visibility across AI assistants
        </div>
      </footer>
    </div>
  );
}
