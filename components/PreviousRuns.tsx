'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { getRunHistory } from '@/lib/api';
import type { RunHistorySummary } from '@/lib/types';

interface PreviousRunsProps {
  companyId?: string;
  onSelectRun?: (run: RunHistorySummary) => void;
}

export function PreviousRuns({ companyId, onSelectRun }: PreviousRunsProps) {
  const [runs, setRuns] = useState<RunHistorySummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sinceDays, setSinceDays] = useState(30);

  useEffect(() => {
    loadRuns();
  }, [companyId, sinceDays]);

  const loadRuns = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getRunHistory(companyId, 50, sinceDays);
      setRuns(response.runs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load run history');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getVisibilityColor = (visibility: number) => {
    if (visibility >= 70) return 'text-green-400';
    if (visibility >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getVisibilityBgColor = (visibility: number) => {
    if (visibility >= 70) return 'bg-green-500';
    if (visibility >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-center py-12">
          <svg className="w-8 h-8 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="text-lg font-semibold text-white">Previous Runs</h3>
          <span className="text-sm text-gray-400">({runs.length} runs found)</span>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={sinceDays}
            onChange={(e) => setSinceDays(parseInt(e.target.value))}
            className="px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-md text-sm text-gray-300"
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={365}>Last year</option>
          </select>
          <button
            onClick={loadRuns}
            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-md text-sm flex items-center gap-1 text-gray-300"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 mb-4">
          {error}
        </div>
      )}

      {runs.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="mb-2">No runs found in the last {sinceDays} days</p>
          <p className="text-sm">Run your first analysis to see data here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-gray-700">
            <div className="col-span-3">Brand / Date</div>
            <div className="col-span-2">Providers</div>
            <div className="col-span-2">Queries</div>
            <div className="col-span-2">Visibility</div>
            <div className="col-span-2">Sentiment</div>
            <div className="col-span-1">Mode</div>
          </div>

          {/* Run Rows */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {runs.map((run, index) => (
              <div
                key={`${run.runTs}-${index}`}
                className={cn(
                  'grid grid-cols-12 gap-4 px-4 py-3 rounded-lg border transition-colors cursor-pointer',
                  'bg-gray-900/50 border-gray-700 hover:bg-gray-700/50'
                )}
                onClick={() => onSelectRun?.(run)}
              >
                {/* Brand / Date */}
                <div className="col-span-3">
                  <div className="font-medium text-white truncate">{run.brandName || 'Unknown Brand'}</div>
                  <div className="text-xs text-gray-400">{formatDate(run.runTs)}</div>
                  <div className="text-xs text-gray-500">{run.market} / {run.lang?.toUpperCase()}</div>
                </div>

                {/* Providers */}
                <div className="col-span-2">
                  <div className="flex flex-wrap gap-1">
                    {run.providers.map((provider) => (
                      <span
                        key={provider}
                        className="text-xs px-2 py-0.5 rounded bg-gray-700 text-gray-300 capitalize"
                      >
                        {provider}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Queries */}
                <div className="col-span-2">
                  <div className="text-white font-medium">{run.totalQueries}</div>
                  <div className="text-xs text-gray-400">
                    {run.brandMentions} mentions
                  </div>
                </div>

                {/* Visibility */}
                <div className="col-span-2">
                  <div className={cn('font-bold text-lg', getVisibilityColor(run.visibilityPct))}>
                    {run.visibilityPct.toFixed(1)}%
                  </div>
                  <div className="w-full h-1.5 bg-gray-700 rounded-full mt-1">
                    <div
                      className={cn('h-full rounded-full', getVisibilityBgColor(run.visibilityPct))}
                      style={{ width: `${Math.min(run.visibilityPct, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Sentiment */}
                <div className="col-span-2">
                  {run.avgSentiment !== null ? (
                    <div className={cn(
                      'font-medium',
                      run.avgSentiment > 0.3 ? 'text-green-400' :
                      run.avgSentiment < -0.3 ? 'text-red-400' : 'text-yellow-400'
                    )}>
                      {run.avgSentiment > 0.3 ? '😊' : run.avgSentiment < -0.3 ? '😞' : '😐'}{' '}
                      {run.avgSentiment.toFixed(2)}
                    </div>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                  {run.avgLatencyMs && (
                    <div className="text-xs text-gray-500">{(run.avgLatencyMs / 1000).toFixed(1)}s avg</div>
                  )}
                </div>

                {/* Mode */}
                <div className="col-span-1">
                  <span className={cn(
                    'text-xs px-2 py-0.5 rounded',
                    run.mode === 'provider_web' ? 'bg-blue-500/20 text-blue-300' : 'bg-gray-700 text-gray-300'
                  )}>
                    {run.mode === 'provider_web' ? 'Web' : 'Internal'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      {runs.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-700">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-white">{runs.length}</div>
              <div className="text-xs text-gray-400">Total Runs</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {runs.reduce((sum, r) => sum + r.totalQueries, 0)}
              </div>
              <div className="text-xs text-gray-400">Total Queries</div>
            </div>
            <div>
              <div className={cn(
                'text-2xl font-bold',
                getVisibilityColor(
                  runs.reduce((sum, r) => sum + r.visibilityPct, 0) / runs.length
                )
              )}>
                {(runs.reduce((sum, r) => sum + r.visibilityPct, 0) / runs.length).toFixed(1)}%
              </div>
              <div className="text-xs text-gray-400">Avg Visibility</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {new Set(runs.map(r => r.brandName)).size}
              </div>
              <div className="text-xs text-gray-400">Brands Tracked</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
