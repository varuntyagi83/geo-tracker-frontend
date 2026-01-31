'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { getBrands, getBrandById, deleteBrand } from '@/lib/api';
import type { Brand, BrandRun } from '@/lib/types';

interface BrandHistoryProps {
  companyId?: string;
  onSelectBrand?: (brand: Brand) => void;
}

export function BrandHistory({ companyId, onSelectBrand }: BrandHistoryProps) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [history, setHistory] = useState<BrandRun[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load brands on mount
  useEffect(() => {
    loadBrands();
  }, [companyId]);

  const loadBrands = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getBrands(companyId, 50);
      setBrands(response.brands);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load brands');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectBrand = async (brand: Brand) => {
    setSelectedBrand(brand);
    setIsLoadingHistory(true);
    setError(null);

    try {
      const response = await getBrandById(brand.id);
      setHistory(response.history);
      if (onSelectBrand) {
        onSelectBrand(brand);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load brand history');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleDeleteBrand = async (brandId: number) => {
    if (!confirm('Are you sure you want to delete this brand and all its history?')) {
      return;
    }

    try {
      await deleteBrand(brandId);
      setBrands(brands.filter(b => b.id !== brandId));
      if (selectedBrand?.id === brandId) {
        setSelectedBrand(null);
        setHistory([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete brand');
    }
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'Unknown date';
    try {
      const date = new Date(dateStr);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Invalid date';
    }
  };

  const getVisibilityColor = (visibility: number) => {
    if (visibility >= 70) return 'text-green-400';
    if (visibility >= 40) return 'text-yellow-400';
    return 'text-red-400';
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-white">Brand History</h3>
        </div>
        <button
          onClick={loadBrands}
          className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-md text-sm flex items-center gap-1 text-gray-300"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 mb-4">
          {error}
        </div>
      )}

      {brands.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="mb-2">No brand history yet</p>
          <p className="text-sm">Run your first analysis to start tracking brand performance over time.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Brand List */}
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-3">Tracked Brands ({brands.length})</h4>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {brands.map((brand) => (
                <div
                  key={brand.id}
                  className={cn(
                    'p-4 rounded-lg border cursor-pointer transition-colors',
                    selectedBrand?.id === brand.id
                      ? 'bg-blue-500/20 border-blue-500/50'
                      : 'bg-gray-900/50 border-gray-700 hover:bg-gray-700/50'
                  )}
                  onClick={() => handleSelectBrand(brand)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-white truncate">{brand.brandName}</h5>
                      <p className="text-sm text-gray-400">
                        {brand.industry || 'No industry'} | {brand.market || 'No market'}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteBrand(brand.id);
                      }}
                      className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                      title="Delete brand"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-xs text-gray-500">Runs</div>
                      <div className="font-semibold text-white">{brand.totalRuns}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Queries</div>
                      <div className="font-semibold text-white">{brand.totalQueries}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Avg. Visibility</div>
                      <div className={cn('font-semibold', getVisibilityColor(brand.avgVisibility))}>
                        {brand.avgVisibility.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Last run: {brand.lastRunAt ? formatDate(brand.lastRunAt) : 'Never'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Run History */}
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-3">
              {selectedBrand ? `Run History - ${selectedBrand.brandName}` : 'Select a brand to view history'}
            </h4>

            {isLoadingHistory ? (
              <div className="flex items-center justify-center py-12">
                <svg className="w-6 h-6 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : selectedBrand && history.length > 0 ? (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {history.map((run) => (
                  <div
                    key={run.id}
                    className="p-4 bg-gray-900/50 rounded-lg border border-gray-700"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">{formatDate(run.createdAt)}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-300">
                        {run.mode}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div>
                        <div className="text-xs text-gray-500">Visibility</div>
                        <div className={cn('font-semibold text-sm', getVisibilityColor(run.visibilityPct))}>
                          {run.visibilityPct.toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Sentiment</div>
                        <div className="font-semibold text-sm text-white">
                          {run.avgSentiment?.toFixed(2) || '-'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Trust</div>
                        <div className="font-semibold text-sm text-white">
                          {run.avgTrust?.toFixed(2) || '-'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Queries</div>
                        <div className="font-semibold text-sm text-white">{run.totalQueries}</div>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {run.providers.map((provider) => (
                        <span
                          key={provider}
                          className="text-xs px-2 py-0.5 rounded bg-gray-700 text-gray-300"
                        >
                          {provider}
                        </span>
                      ))}
                    </div>
                    {run.competitorSummary && Object.keys(run.competitorSummary).length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-700">
                        <div className="text-xs text-gray-500 mb-1">Top Competitors:</div>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(run.competitorSummary)
                            .sort(([, a], [, b]) => b - a)
                            .slice(0, 3)
                            .map(([name, count]) => (
                              <span
                                key={name}
                                className="text-xs px-2 py-0.5 rounded bg-orange-500/20 text-orange-300"
                              >
                                {name}: {count}
                              </span>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : selectedBrand ? (
              <div className="text-center py-12 text-gray-500">
                <p>No run history for this brand yet.</p>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <svg className="w-8 h-8 mx-auto mb-2 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-sm">Click on a brand to view its run history</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
