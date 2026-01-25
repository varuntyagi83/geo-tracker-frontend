'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { generateVisibilityReport } from '@/lib/api';
import type { RunResults, VisibilityReport as VisibilityReportType } from '@/lib/types';

interface VisibilityReportProps {
  results: RunResults;
  brandName: string;
  jobId?: string;
}

export function VisibilityReport({ results, brandName, jobId }: VisibilityReportProps) {
  const [report, setReport] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [reportMeta, setReportMeta] = useState<{
    generatedAt?: string;
    provider?: string;
    model?: string;
    tokensUsed?: number;
  } | null>(null);

  const handleGenerateReport = async (forceRegenerate = false) => {
    setIsGenerating(true);
    setError(null);

    try {
      // Convert to snake_case for API
      const summaryForApi = {
        overall_visibility: results.summary.overallVisibility,
        avg_sentiment: results.summary.avgSentiment,
        avg_trust_authority: results.summary.avgTrustAuthority,
        provider_visibility: results.summary.providerVisibility,
        competitor_visibility: results.summary.competitorVisibility,
        total_queries: results.summary.totalQueries,
      };

      const resultsForApi = results.results.map(r => ({
        question: r.question,
        provider: r.provider,
        brand_mentioned: r.brandMentioned,
        response_text: r.responseText,
        sources: r.sources,
        other_brands_detected: r.otherBrandsDetected,
        presence: r.presence,
        sentiment: r.sentiment,
      }));

      const data = await generateVisibilityReport(
        brandName,
        summaryForApi,
        resultsForApi,
        jobId,
        'openai',
        'gpt-4.1',
        forceRegenerate
      );

      setReport(data.report);
      setReportMeta({
        generatedAt: data.generatedAt,
        provider: data.provider,
        model: data.model,
        tokensUsed: data.tokensUsed,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (report) {
      navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const renderReport = () => {
    if (!report) return null;

    // Parse markdown-like headers and format
    const sections = report.split(/(?=###)/);

    return (
      <div className="prose prose-invert max-w-none">
        {sections.map((section, idx) => {
          if (!section.trim()) return null;

          // Check if it's a header section
          const headerMatch = section.match(/^###\s+(.+)/);
          if (headerMatch) {
            const [, title] = headerMatch;
            const content = section.replace(/^###\s+.+\n/, '').trim();

            return (
              <div key={idx} className="mb-6">
                <h3 className="text-lg font-bold text-blue-400 mb-3 border-b border-gray-700 pb-2">
                  {title}
                </h3>
                <div className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {content}
                </div>
              </div>
            );
          }

          return (
            <div key={idx} className="text-sm text-gray-300 whitespace-pre-wrap mb-4">
              {section}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <h3 className="text-lg font-semibold text-white">AI Visibility Report</h3>
        </div>

        <div className="flex items-center gap-2">
          {report && (
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-md text-sm flex items-center gap-1 text-gray-300"
            >
              {copied ? (
                <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          )}
          <button
            onClick={() => handleGenerateReport(!!report)}
            disabled={isGenerating}
            className={cn(
              'px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors',
              isGenerating
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            )}
          >
            {isGenerating ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </>
            ) : report ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Regenerate
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Generate Report
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 mb-4">
          {error}
        </div>
      )}

      {!report && !isGenerating && !error && (
        <div className="text-center py-12 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="mb-4">
            Generate an AI-powered report with personalized recommendations
            to improve your brand&apos;s visibility in AI assistants.
          </p>
          <p className="text-sm">
            The report includes content optimization advice, competitive analysis,
            and priority action items.
          </p>
        </div>
      )}

      {isGenerating && (
        <div className="text-center py-12">
          <svg className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-400">
            Analyzing your results and generating recommendations...
          </p>
          <p className="text-sm text-gray-600 mt-2">
            This may take 15-30 seconds
          </p>
        </div>
      )}

      {report && !isGenerating && (
        <>
          {reportMeta && (
            <div className="text-xs text-gray-600 mb-4 flex items-center gap-4">
              <span>Generated: {new Date(reportMeta.generatedAt || '').toLocaleString()}</span>
              <span>Model: {reportMeta.model}</span>
              {reportMeta.tokensUsed && <span>Tokens: {reportMeta.tokensUsed.toLocaleString()}</span>}
            </div>
          )}
          <div className="bg-gray-900/50 rounded-lg p-6 max-h-[600px] overflow-y-auto">
            {renderReport()}
          </div>
        </>
      )}
    </div>
  );
}
