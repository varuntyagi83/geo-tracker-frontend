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
import {
  cn,
  formatDuration,
  getVisibilityColor,
  getSentimentColor,
  getSampleQueriesForIndustry,
  parseQueriesFromText,
} from '@/lib/utils';
import { useAuth } from '@/lib/auth';

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

  // Check if user has admin access
  const canAccessAdmin = user?.permissions?.can_access_admin || user?.role === 'admin' || user?.role === 'demo';

  return (
    <header className="border-b border-dark-700 bg-dark-900/80 backdrop-blur-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Globe className="w-8 h-8 text-primary-500" />
          <span className="text-xl font-bold">GEO Tracker</span>
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
// COMPONENT: Step Indicator
// ==============================================
function StepIndicator({ currentStep, steps }: { currentStep: number; steps: string[] }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center">
          <div
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all',
              index < currentStep
                ? 'bg-primary-500 text-white'
                : index === currentStep
                ? 'bg-primary-500/20 text-primary-500 border-2 border-primary-500'
                : 'bg-dark-700 text-dark-400'
            )}
          >
            {index < currentStep ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
          </div>
          <span
            className={cn(
              'ml-2 text-sm hidden sm:inline',
              index <= currentStep ? 'text-white' : 'text-dark-400'
            )}
          >
            {step}
          </span>
          {index < steps.length - 1 && (
            <ChevronRight className="w-4 h-4 mx-2 text-dark-500" />
          )}
        </div>
      ))}
    </div>
  );
}

// ==============================================
// COMPONENT: Company Setup Form
// ==============================================
function CompanySetup({
  onNext,
  formData,
  setFormData,
}: {
  onNext: () => void;
  formData: { brandName: string; industry: string; businessContext: string; questionCount: number };
  setFormData: (data: { brandName: string; industry: string; businessContext: string; questionCount: number }) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-xl mx-auto"
    >
      <div className="text-center mb-8">
        <Building2 className="w-12 h-12 text-primary-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Set Up Your Brand</h2>
        <p className="text-dark-400">Tell us about your company so we can track your visibility</p>
      </div>

      <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Brand Name *</label>
            <input
              type="text"
              value={formData.brandName}
              onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
              placeholder="e.g., Sunday Natural"
              className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <p className="text-xs text-dark-400 mt-1">
              This is the brand name we&apos;ll look for in AI responses
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Industry *</label>
            <select
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Select your industry</option>
              {INDUSTRIES.map((industry) => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Business Context *</label>
            <textarea
              value={formData.businessContext}
              onChange={(e) => setFormData({ ...formData, businessContext: e.target.value })}
              placeholder="e.g., Premium German brand specializing in natural, high-quality dietary supplements. Known for organic vitamins, minerals, and plant-based formulas. Target audience: health-conscious consumers seeking clean-label products."
              rows={4}
              className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-dark-400 mt-1">
              Describe your brand&apos;s positioning, products, target audience, and unique selling points
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Number of Questions to Generate</label>
            <select
              value={formData.questionCount}
              onChange={(e) => setFormData({ ...formData, questionCount: parseInt(e.target.value) })}
              className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value={5}>5 questions</option>
              <option value={10}>10 questions</option>
              <option value={15}>15 questions</option>
              <option value={20}>20 questions</option>
              <option value={25}>25 questions (maximum)</option>
            </select>
            <p className="text-xs text-dark-400 mt-1">
              AI will generate this many targeted questions for visibility analysis
            </p>
          </div>
        </div>

        <button
          onClick={onNext}
          disabled={!formData.brandName || !formData.industry || !formData.businessContext}
          className={cn(
            'w-full mt-6 px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2',
            formData.brandName && formData.industry && formData.businessContext
              ? 'bg-primary-500 hover:bg-primary-600 text-white'
              : 'bg-dark-600 text-dark-400 cursor-not-allowed'
          )}
        >
          Continue <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

// ==============================================
// COMPONENT: Query Configuration
// ==============================================
function QueryConfig({
  onStart,
  onBack,
  queries,
  setQueries,
  industry,
  brandName,
  businessContext,
  questionCount,
  language,
  market,
  isStarting,
}: {
  onStart: (queries: Query[]) => void;
  onBack: () => void;
  queries: Query[];
  setQueries: (queries: Query[]) => void;
  industry: string;
  brandName: string;
  businessContext: string;
  questionCount: number;
  language: string;
  market: string;
  isStarting: boolean;
}) {
  const [queriesText, setQueriesText] = useState(queries.map((q) => q.question).join('\n'));
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<'manual' | 'sheets'>('manual');
  const [sheetPromptsLoaded, setSheetPromptsLoaded] = useState(false);
  const [sheetError, setSheetError] = useState<string | null>(null);

  const handleSheetPromptsLoaded = (prompts: SheetPrompt[], total: number) => {
    const questionsText = prompts.map(p => p.question).join('\n');
    setQueriesText(questionsText);
    setSheetPromptsLoaded(true);
    setSheetError(null);
  };

  const handleSheetError = (error: string) => {
    setSheetError(error);
    setSheetPromptsLoaded(false);
  };

  const handleLoadSamples = () => {
    const samples = getSampleQueriesForIndustry(industry, language).slice(0, questionCount);
    setQueriesText(samples.join('\n'));
    setGenerationError(null);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerationError(null);

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    const marketNames: Record<string, string> = {
      'DE': 'Germany',
      'US': 'United States',
      'GB': 'United Kingdom',
      'UK': 'United Kingdom',
      'FR': 'France',
      'ES': 'Spain',
      'IT': 'Italy',
      'AT': 'Austria',
      'CH': 'Switzerland',
      'NL': 'Netherlands',
      'BE': 'Belgium',
      'PL': 'Poland',
      'SE': 'Sweden',
      'DK': 'Denmark',
      'NO': 'Norway',
      'FI': 'Finland',
      'PT': 'Portugal',
      'AU': 'Australia',
      'CA': 'Canada',
      'IN': 'India',
      'JP': 'Japan',
      'BR': 'Brazil',
      'MX': 'Mexico',
      'KR': 'South Korea',
      'CN': 'China',
      'SG': 'Singapore',
      'AE': 'United Arab Emirates',
      'SA': 'Saudi Arabia',
      'ZA': 'South Africa',
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/queries/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company_name: brandName,
          industry: industry,
          description: businessContext,
          language: language,
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
        const questionTexts = data.queries.map((q: { question: string }) => q.question);
        setQueriesText(questionTexts.join('\n'));

        if (data.generated_by === 'fallback') {
          setGenerationError('Note: Using template queries. Check API keys for AI generation.');
        }
      } else {
        throw new Error('No queries returned from API');
      }
    } catch (err) {
      console.error('AI generation error:', err);
      setGenerationError(err instanceof Error ? err.message : 'AI generation failed');
      const samples = getSampleQueriesForIndustry(industry, language).slice(0, questionCount);
      setQueriesText(samples.join('\n'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartAnalysis = () => {
    const parsed = parseQueriesFromText(queriesText);
    setQueries(parsed);
    onStart(parsed);  // Pass parsed queries directly to avoid async state issue
  };

  const currentQueryCount = queriesText.split('\n').filter((l) => l.trim()).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-2xl mx-auto"
    >
      <div className="text-center mb-8">
        <MessageSquare className="w-12 h-12 text-primary-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Generate & Review Queries</h2>
        <p className="text-dark-400">AI will generate questions based on your brand context</p>
      </div>

      <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-700 mb-4">
        <div className="text-xs text-dark-400 mb-2">Generating queries for:</div>
        <div className="space-y-1">
          <div className="text-sm"><span className="text-dark-400">Brand:</span> <span className="text-white font-medium">{brandName}</span></div>
          <div className="text-sm"><span className="text-dark-400">Industry:</span> <span className="text-white">{industry}</span></div>
          <div className="text-sm"><span className="text-dark-400">Context:</span> <span className="text-dark-300">{businessContext.length > 100 ? businessContext.substring(0, 100) + '...' : businessContext}</span></div>
          <div className="text-sm"><span className="text-dark-400">Target:</span> <span className="text-white">{questionCount} questions in {language.toUpperCase()}</span></div>
        </div>
      </div>

      <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
        {/* Input Mode Toggle */}
        <div className="flex items-center gap-2 mb-4 p-1 bg-dark-700 rounded-lg w-fit">
          <button
            onClick={() => setInputMode('manual')}
            className={cn(
              'px-4 py-2 rounded-md text-sm font-medium transition-colors',
              inputMode === 'manual'
                ? 'bg-primary-500 text-white'
                : 'text-dark-400 hover:text-white'
            )}
          >
            Manual Entry
          </button>
          <button
            onClick={() => setInputMode('sheets')}
            className={cn(
              'px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1',
              inputMode === 'sheets'
                ? 'bg-primary-500 text-white'
                : 'text-dark-400 hover:text-white'
            )}
          >
            <FileText className="w-4 h-4" />
            Import from Sheets
          </button>
        </div>

        {inputMode === 'sheets' ? (
          <div className="mb-4">
            <SheetInput
              onPromptsLoaded={handleSheetPromptsLoaded}
              onError={handleSheetError}
            />
            {sheetError && (
              <div className="mt-2 text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded">
                {sheetError}
              </div>
            )}
            {sheetPromptsLoaded && (
              <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-sm text-green-400">
                Prompts loaded from Google Sheet. You can review and edit them below.
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between mb-4">
            <label className="text-sm font-medium">
              Questions ({currentQueryCount} / {questionCount})
            </label>
            <div className="flex gap-2 items-center">
              <button
                onClick={handleLoadSamples}
                className="text-xs px-3 py-1.5 bg-dark-700 hover:bg-dark-600 rounded-md transition-colors"
              >
                Load Samples
              </button>
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="text-xs px-3 py-1.5 bg-primary-500/20 text-primary-400 hover:bg-primary-500/30 rounded-md transition-colors flex items-center gap-1"
              >
                {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                AI Generate ({questionCount})
              </button>
            </div>
          </div>
        )}

        <textarea
          value={queriesText}
          onChange={(e) => setQueriesText(e.target.value)}
          placeholder={language === 'de'
            ? "Geben Sie eine Frage pro Zeile ein, z.B.:\n\nWas sind die besten Vitamin D Nahrungsergänzungsmittel?\nVergleiche natürliche Supplement-Marken\nWelches Magnesium hilft beim Schlafen?"
            : "Enter one question per line, e.g.:\n\nWhat are the best vitamin D supplements?\nCompare natural supplement brands\nWhich magnesium helps with sleep?"}
          rows={12}
          className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm resize-none"
        />

        {generationError && (
          <div className="mt-2 text-xs text-amber-400 bg-amber-500/10 px-3 py-2 rounded">
            {generationError}
          </div>
        )}

        <p className="text-xs text-dark-400 mt-2">
          {inputMode === 'manual'
            ? `Click "AI Generate" to create ${questionCount} targeted questions using your brand context. You can edit the questions before running the analysis.`
            : 'Import prompts from your Google Sheet, then review and edit them as needed.'}
        </p>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onBack}
            className="px-6 py-3 bg-dark-700 hover:bg-dark-600 rounded-lg font-medium transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleStartAnalysis}
            disabled={currentQueryCount === 0 || isStarting}
            className={cn(
              'flex-1 px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2',
              currentQueryCount > 0 && !isStarting
                ? 'bg-primary-500 hover:bg-primary-600 text-white'
                : 'bg-dark-600 text-dark-400 cursor-not-allowed'
            )}
          >
            {isStarting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Starting...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" /> Start Analysis ({currentQueryCount} queries)
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ==============================================
// COMPONENT: Provider & Settings Configuration
// ==============================================
function ProviderConfig({
  onNext,
  onBack,
  providers,
  setProviders,
  mode,
  setMode,
  market,
  setMarket,
  language,
  setLanguage,
  openaiModel,
  setOpenaiModel,
  geminiModel,
  setGeminiModel,
  perplexityModel,
  setPerplexityModel,
  anthropicModel,
  setAnthropicModel,
}: {
  onNext: () => void;
  onBack: () => void;
  providers: Provider[];
  setProviders: (providers: Provider[]) => void;
  mode: Mode;
  setMode: (mode: Mode) => void;
  market: string;
  setMarket: (market: string) => void;
  language: string;
  setLanguage: (lang: string) => void;
  openaiModel: string;
  setOpenaiModel: (model: string) => void;
  geminiModel: string;
  setGeminiModel: (model: string) => void;
  perplexityModel: string;
  setPerplexityModel: (model: string) => void;
  anthropicModel: string;
  setAnthropicModel: (model: string) => void;
}) {
  const toggleProvider = (provider: Provider) => {
    if (providers.includes(provider)) {
      if (providers.length > 1) {
        setProviders(providers.filter((p) => p !== provider));
      }
    } else {
      setProviders([...providers, provider]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-2xl mx-auto"
    >
      <div className="text-center mb-8">
        <Settings className="w-12 h-12 text-primary-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Configure Analysis</h2>
        <p className="text-dark-400">Select AI providers, models, region, and language</p>
      </div>

      <div className="space-y-6">
        <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
          <label className="block text-sm font-medium mb-4 flex items-center gap-2">
            <span className="text-2xl">🤖</span> AI Providers & Models
          </label>
          <div className="space-y-3">
            {PROVIDER_OPTIONS.map((provider) => (
              <div key={provider.id} className="space-y-2">
                <button
                  onClick={() => toggleProvider(provider.id)}
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
                        if (provider.id === 'openai') {
                          setOpenaiModel(e.target.value);
                        } else if (provider.id === 'gemini') {
                          setGeminiModel(e.target.value);
                        } else if (provider.id === 'perplexity') {
                          setPerplexityModel(e.target.value);
                        } else {
                          setAnthropicModel(e.target.value);
                        }
                      }}
                      className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {provider.models.map((model) => (
                        <option key={model.id} value={model.id}>
                          {model.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-dark-400 mt-3">
            {providers.length} provider(s) selected
          </p>
        </div>

        <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
          <label className="block text-sm font-medium mb-4 flex items-center gap-2">
            <Globe2 className="w-5 h-5 text-primary-500" /> Region & Language
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
                  <option key={m.code} value={m.code}>
                    {m.name} ({m.code})
                  </option>
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
                  <option key={l.code} value={l.code}>
                    {l.name} ({l.code})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

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

        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="px-6 py-3 bg-dark-700 hover:bg-dark-600 rounded-lg font-medium transition-colors"
          >
            Back
          </button>
          <button
            onClick={onNext}
            disabled={providers.length === 0}
            className={cn(
              'flex-1 px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2',
              providers.length > 0
                ? 'bg-primary-500 hover:bg-primary-600 text-white'
                : 'bg-dark-600 text-dark-400 cursor-not-allowed'
            )}
          >
            Continue <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ==============================================
// COMPONENT: Progress View
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
        <h2 className="text-2xl font-bold mb-2">Analysis in Progress</h2>
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
// COMPONENT: Results View
// ==============================================
function ResultsView({
  results,
  brandName,
  onNewRun,
  jobId,
}: {
  results: RunResults;
  brandName: string;
  onNewRun: () => void;
  jobId?: string;
}) {
  const { summary } = results;
  const [activeTab, setActiveTab] = useState<'overview' | 'results' | 'competitors' | 'sources' | 'report' | 'history'>('overview');
  const [providerFilter, setProviderFilter] = useState<string>('all');

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
        <button
          onClick={onNewRun}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg text-sm font-medium transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          New Analysis
        </button>
      </div>

      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Analysis Complete</h2>
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
          className="px-6 py-3 bg-primary-500 hover:bg-primary-600 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Run New Analysis
        </button>
      </div>
    </motion.div>
  );
}

// ==============================================
// MAIN DASHBOARD PAGE
// ==============================================
export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [step, setStep] = useState(0);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  // Form state
  const [companyData, setCompanyData] = useState({
    brandName: '',
    industry: '',
    businessContext: '',
    questionCount: 15
  });
  const [queries, setQueries] = useState<Query[]>([]);
  const [providers, setProviders] = useState<Provider[]>(['openai', 'gemini']);
  const [mode, setMode] = useState<Mode>('provider_web');
  const [market, setMarket] = useState('DE');
  const [language, setLanguage] = useState('de');
  const [openaiModel, setOpenaiModel] = useState('gpt-4.1-mini');
  const [geminiModel, setGeminiModel] = useState('gemini-2.5-flash');
  const [perplexityModel, setPerplexityModel] = useState('sonar');
  const [anthropicModel, setAnthropicModel] = useState('claude-sonnet-4-20250514');

  // Main view mode: 'history' shows previous runs, 'new' shows the new analysis flow
  const [viewMode, setViewMode] = useState<'history' | 'new'>('history');

  // Run state
  const [isStarting, setIsStarting] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [progress, setProgress] = useState<RunProgress | null>(null);
  const [results, setResults] = useState<RunResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Ref to prevent double-submission
  const isSubmittingRef = useRef(false);

  const steps = ['Brand Setup', 'Configure', 'Queries', 'Results'];

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Check API connection on mount
  useEffect(() => {
    let isMounted = true;

    checkHealth()
      .then(() => {
        if (isMounted) setIsConnected(true);
      })
      .catch(() => {
        if (isMounted) setIsConnected(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Poll for progress when job is running
  useEffect(() => {
    // Don't poll if we already have results or no job ID
    if (!jobId || step !== 3 || results) return;

    let isMounted = true;

    const pollInterval = setInterval(async () => {
      if (!isMounted) return;

      try {
        const status = await getRunStatus(jobId);
        if (!isMounted) return;

        setProgress(status);

        if (['completed', 'failed', 'cancelled'].includes(status.status)) {
          clearInterval(pollInterval);

          if (status.status === 'completed') {
            try {
              const runResults = await getRunResults(jobId);
              if (isMounted) {
                setResults(runResults);
                setError(null);  // Clear any previous errors on success
              }
            } catch (resultsErr) {
              // If we can't get results by job_id, the job completed but data wasn't persisted
              // This is non-critical - results may still be available from in-memory cache
              console.warn('Could not fetch results by job_id:', resultsErr);
              // Don't set error here - the job did complete successfully
            }
          } else {
            const errorMsg = status.error
              ? `Run ${status.status}: ${status.error.split('\n')[0]}`
              : `Run ${status.status}`;
            if (isMounted) {
              setError(errorMsg);
            }
          }
        }
      } catch (err) {
        // Only show error if we don't have results yet
        // If job completed but status endpoint fails (job cleaned from memory), that's ok
        clearInterval(pollInterval);
        if (isMounted && !results) {
          setError(err instanceof Error ? err.message : 'Failed to get status');
        }
      }
    }, 2000);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [jobId, step, results]);

  const handleStartRun = async (parsedQueries: Query[]) => {
    // Prevent double-submission using ref (works across re-renders)
    if (isSubmittingRef.current) {
      return;
    }

    // Check if queries are valid
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
        brandName: companyData.brandName,
        industry: companyData.industry,
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
      setJobId(response.jobId);
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start run');
    } finally {
      isSubmittingRef.current = false;
      setIsStarting(false);
    }
  };

  const handleNewRun = () => {
    setStep(0);
    setViewMode('new');  // Switch to new analysis mode
    setCompanyData({
      brandName: '',
      industry: '',
      businessContext: '',
      questionCount: 15
    });
    setQueries([]);
    setJobId(null);
    setProgress(null);
    setResults(null);
    setError(null);
  };

  // Handle viewing a previous run's results
  const handleViewPreviousRun = async (run: import('@/lib/types').RunHistorySummary) => {
    if (!run.jobId) {
      setError('This run does not have detailed results available.');
      return;
    }

    setError(null);
    setIsStarting(true);

    try {
      // Load the results for this run
      const runResults = await getRunResults(run.jobId);

      // Update state to show results
      setCompanyData({
        brandName: run.brandName || 'Unknown Brand',
        industry: '',
        businessContext: '',
        questionCount: run.totalQueries || 0
      });
      setResults(runResults);
      setJobId(run.jobId);
      setStep(3);  // Go to results view
      setViewMode('new');  // Switch out of history mode to show results
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load run details');
    } finally {
      setIsStarting(false);
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  // Show connection status
  if (isConnected === false) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">API Not Connected</h1>
          <p className="text-dark-400 mb-4">
            Make sure the GEO Tracker API is running on port 8000
          </p>
          <code className="bg-dark-800 px-4 py-2 rounded text-sm">
            uvicorn api.main:app --reload --port 8000
          </code>
        </div>
      </div>
    );
  }

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

        {/* Main View Toggle - show only when not in active run */}
        {step < 3 && (
          <div className="flex items-center justify-center gap-4 mb-8">
            <button
              onClick={() => setViewMode('history')}
              className={cn(
                'flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all',
                viewMode === 'history'
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                  : 'bg-dark-800 text-dark-400 hover:bg-dark-700 hover:text-white border border-dark-700'
              )}
            >
              <History className="w-5 h-5" />
              Previous Runs
            </button>
            <button
              onClick={() => setViewMode('new')}
              className={cn(
                'flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all',
                viewMode === 'new'
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                  : 'bg-dark-800 text-dark-400 hover:bg-dark-700 hover:text-white border border-dark-700'
              )}
            >
              <PlusCircle className="w-5 h-5" />
              New Analysis
            </button>
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

        {/* Previous Runs View */}
        {viewMode === 'history' && step < 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
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

        {/* New Analysis Flow */}
        {viewMode === 'new' && step < 3 && <StepIndicator currentStep={step} steps={steps} />}

        {/* Step content - only show when in 'new' mode or during active run */}
        <AnimatePresence mode="wait">
          {viewMode === 'new' && step === 0 && (
            <CompanySetup
              key="company"
              formData={companyData}
              setFormData={setCompanyData}
              onNext={() => setStep(1)}
            />
          )}

          {viewMode === 'new' && step === 1 && (
            <ProviderConfig
              key="providers"
              providers={providers}
              setProviders={setProviders}
              mode={mode}
              setMode={setMode}
              market={market}
              setMarket={setMarket}
              language={language}
              setLanguage={setLanguage}
              openaiModel={openaiModel}
              setOpenaiModel={setOpenaiModel}
              geminiModel={geminiModel}
              setGeminiModel={setGeminiModel}
              perplexityModel={perplexityModel}
              setPerplexityModel={setPerplexityModel}
              anthropicModel={anthropicModel}
              setAnthropicModel={setAnthropicModel}
              onNext={() => setStep(2)}
              onBack={() => setStep(0)}
            />
          )}

          {viewMode === 'new' && step === 2 && (
            <QueryConfig
              key="queries"
              queries={queries}
              setQueries={setQueries}
              industry={companyData.industry}
              brandName={companyData.brandName}
              businessContext={companyData.businessContext}
              questionCount={companyData.questionCount}
              language={language}
              market={market}
              onStart={handleStartRun}
              onBack={() => setStep(1)}
              isStarting={isStarting}
            />
          )}

          {step === 3 && !results && progress && (
            <ProgressView key="progress" progress={progress} />
          )}

          {step === 3 && results && (
            <ResultsView
              key="results"
              results={results}
              brandName={companyData.brandName}
              onNewRun={handleNewRun}
              jobId={jobId || undefined}
            />
          )}
        </AnimatePresence>
      </main>

      <footer className="border-t border-dark-700 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-dark-400">
          GEO Tracker &copy; 2026 - Track your brand visibility across AI assistants
        </div>
      </footer>
    </div>
  );
}
