'use client';

import { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { getRunHistory } from '@/lib/api';
import type { RunHistorySummary } from '@/lib/types';
import {
  ChevronDown,
  ChevronRight,
  Building2,
  RefreshCw,
  Clock,
  TrendingUp,
  Loader2,
  AlertCircle,
} from 'lucide-react';

interface PreviousRunsProps {
  companyId?: string;
  onSelectRun?: (run: RunHistorySummary) => void;
}

// Group runs by company name
interface CompanyGroup {
  brandName: string;
  runs: RunHistorySummary[];
  totalRuns: number;
  totalQueries: number;
  avgVisibility: number;
  avgSentiment: number | null;
  lastRunTs: string;
}

export function PreviousRuns({ companyId, onSelectRun }: PreviousRunsProps) {
  const [runs, setRuns] = useState<RunHistorySummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sinceDays, setSinceDays] = useState(30);
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(new Set());

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

  // Group runs by company name
  const companyGroups = useMemo((): CompanyGroup[] => {
    const groups: Record<string, RunHistorySummary[]> = {};

    runs.forEach(run => {
      const brandName = run.brandName || 'Unknown Brand';
      if (!groups[brandName]) {
        groups[brandName] = [];
      }
      groups[brandName].push(run);
    });

    // Convert to array and calculate aggregates
    return Object.entries(groups)
      .map(([brandName, brandRuns]) => {
        const totalQueries = brandRuns.reduce((sum, r) => sum + r.totalQueries, 0);
        const avgVisibility = brandRuns.reduce((sum, r) => sum + r.visibilityPct, 0) / brandRuns.length;

        // Calculate average sentiment (only from runs that have sentiment)
        const runsWithSentiment = brandRuns.filter(r => r.avgSentiment !== null);
        const avgSentiment = runsWithSentiment.length > 0
          ? runsWithSentiment.reduce((sum, r) => sum + (r.avgSentiment || 0), 0) / runsWithSentiment.length
          : null;

        // Sort runs by timestamp (newest first)
        const sortedRuns = [...brandRuns].sort((a, b) =>
          new Date(b.runTs).getTime() - new Date(a.runTs).getTime()
        );

        return {
          brandName,
          runs: sortedRuns,
          totalRuns: brandRuns.length,
          totalQueries,
          avgVisibility,
          avgSentiment,
          lastRunTs: sortedRuns[0].runTs,
        };
      })
      // Sort companies by last run timestamp (most recent first)
      .sort((a, b) => new Date(b.lastRunTs).getTime() - new Date(a.lastRunTs).getTime());
  }, [runs]);

  const toggleCompany = (brandName: string) => {
    setExpandedCompanies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(brandName)) {
        newSet.delete(brandName);
      } else {
        newSet.add(brandName);
      }
      return newSet;
    });
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

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', {
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

  const getSentimentColor = (sentiment: number | null) => {
    if (sentiment === null) return 'text-gray-500';
    if (sentiment > 0.3) return 'text-green-400';
    if (sentiment < -0.3) return 'text-red-400';
    return 'text-yellow-400';
  };

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Clock className="w-6 h-6 text-blue-500" />
          <h3 className="text-lg font-semibold text-white">Previous Runs</h3>
          <span className="text-sm text-gray-400">
            ({companyGroups.length} {companyGroups.length === 1 ? 'company' : 'companies'}, {runs.length} runs)
          </span>
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
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Empty State */}
      {runs.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Clock className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="mb-2">No runs found in the last {sinceDays} days</p>
          <p className="text-sm">Run your first analysis to see data here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Company Groups */}
          {companyGroups.map((group) => {
            const isExpanded = expandedCompanies.has(group.brandName);

            return (
              <div
                key={group.brandName}
                className="border border-gray-700 rounded-lg overflow-hidden"
              >
                {/* Company Header (clickable to expand/collapse) */}
                <button
                  onClick={() => toggleCompany(group.brandName)}
                  className="w-full px-4 py-3 bg-gray-900/70 hover:bg-gray-700/50 transition-colors flex items-center gap-4"
                >
                  {/* Expand/Collapse Icon */}
                  <div className="text-gray-400">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                  </div>

                  {/* Company Icon */}
                  <Building2 className="w-5 h-5 text-blue-400" />

                  {/* Company Name */}
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-white text-lg">{group.brandName}</div>
                    <div className="text-xs text-gray-400">
                      {group.totalRuns} {group.totalRuns === 1 ? 'run' : 'runs'} • Last run: {formatDate(group.lastRunTs)}
                    </div>
                  </div>

                  {/* Aggregate Stats */}
                  <div className="flex items-center gap-6">
                    {/* Total Queries */}
                    <div className="text-right">
                      <div className="text-sm font-medium text-white">{group.totalQueries}</div>
                      <div className="text-xs text-gray-500">queries</div>
                    </div>

                    {/* Average Visibility */}
                    <div className="text-right min-w-[80px]">
                      <div className={cn('text-lg font-bold', getVisibilityColor(group.avgVisibility))}>
                        {group.avgVisibility.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500">avg presence</div>
                    </div>

                    {/* Average Sentiment */}
                    <div className="text-right min-w-[60px]">
                      <div className={cn('text-sm font-medium', getSentimentColor(group.avgSentiment))}>
                        {group.avgSentiment !== null ? (
                          <>
                            {group.avgSentiment > 0.3 ? '😊' : group.avgSentiment < -0.3 ? '😞' : '😐'}{' '}
                            {group.avgSentiment.toFixed(2)}
                          </>
                        ) : (
                          '-'
                        )}
                      </div>
                      <div className="text-xs text-gray-500">sentiment</div>
                    </div>
                  </div>
                </button>

                {/* Expanded Run List */}
                {isExpanded && (
                  <div className="border-t border-gray-700">
                    {/* Run List Header */}
                    <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-gray-400 uppercase tracking-wider bg-gray-900/30">
                      <div className="col-span-1"></div>
                      <div className="col-span-2">Date / Time</div>
                      <div className="col-span-2">Providers</div>
                      <div className="col-span-2">Queries</div>
                      <div className="col-span-2">Visibility</div>
                      <div className="col-span-2">Sentiment</div>
                      <div className="col-span-1">Mode</div>
                    </div>

                    {/* Individual Runs */}
                    <div className="divide-y divide-gray-700/50">
                      {group.runs.map((run, index) => (
                        <div
                          key={`${run.runTs}-${index}`}
                          className={cn(
                            'grid grid-cols-12 gap-4 px-4 py-3 transition-all cursor-pointer group',
                            'hover:bg-gray-700/30',
                            run.jobId ? 'hover:shadow-lg' : 'opacity-70 cursor-not-allowed'
                          )}
                          onClick={() => run.jobId && onSelectRun?.(run)}
                          title={run.jobId ? 'Click to view details' : 'No detailed data available'}
                        >
                          {/* Index Number */}
                          <div className="col-span-1 flex items-center">
                            <span className="text-gray-500 text-sm">{index + 1}.</span>
                          </div>

                          {/* Date / Time */}
                          <div className="col-span-2">
                            <div className="text-sm text-white">{formatTime(run.runTs)}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(run.runTs).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
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
                            <div className={cn('font-bold', getVisibilityColor(run.visibilityPct))}>
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
                                'font-medium text-sm',
                                getSentimentColor(run.avgSentiment)
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
                          <div className="col-span-1 flex items-center justify-between">
                            <span className={cn(
                              'text-xs px-2 py-0.5 rounded',
                              run.mode === 'provider_web' ? 'bg-blue-500/20 text-blue-300' : 'bg-gray-700 text-gray-300'
                            )}>
                              {run.mode === 'provider_web' ? 'Web' : 'Int'}
                            </span>
                            {/* Click indicator */}
                            {run.jobId && (
                              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Summary Stats */}
      {runs.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-700">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-white">{companyGroups.length}</div>
              <div className="text-xs text-gray-400">Companies</div>
            </div>
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
          </div>
        </div>
      )}
    </div>
  );
}
