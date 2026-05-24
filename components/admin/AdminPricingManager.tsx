// components/admin/AdminPricingManager.tsx
// Company pricing management table for the admin console.
'use client';

import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Save, ShieldAlert, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  listAdminCompanies,
  updateCompanyPrice,
  APIError,
  type ManagedCompany,
} from '@/lib/api';

interface AdminPricingManagerProps {
  // Whether the current user may edit company prices (super_admin only).
  canManagePricing: boolean;
}

function formatPrice(price: number | null): string {
  if (price === null || price === undefined) return '—';
  return `$${price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function AdminPricingManager({ canManagePricing }: AdminPricingManagerProps) {
  const [companies, setCompanies] = useState<ManagedCompany[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Per-row editable price drafts, keyed by company id.
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [savingId, setSavingId] = useState<number | null>(null);
  const [savedId, setSavedId] = useState<number | null>(null);

  const fetchCompanies = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listAdminCompanies();
      setCompanies(data);
      // Seed drafts from current prices.
      const seeded: Record<number, string> = {};
      data.forEach((c) => {
        seeded[c.id] = c.price === null || c.price === undefined ? '' : String(c.price);
      });
      setDrafts(seeded);
    } catch (e) {
      setError(e instanceof APIError ? e.message : 'Failed to load companies.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleSave = async (c: ManagedCompany) => {
    const raw = (drafts[c.id] ?? '').trim();
    let price: number | null;
    if (raw === '') {
      price = null;
    } else {
      const parsed = Number(raw);
      if (Number.isNaN(parsed) || parsed < 0) {
        setError('Price must be a non-negative number, or empty to clear it.');
        return;
      }
      price = parsed;
    }

    setSavingId(c.id);
    setError(null);
    try {
      const updated = await updateCompanyPrice(c.id, price);
      setCompanies((prev) => prev.map((x) => (x.id === c.id ? updated : x)));
      setDrafts((prev) => ({
        ...prev,
        [c.id]:
          updated.price === null || updated.price === undefined ? '' : String(updated.price),
      }));
      setSavedId(c.id);
      setTimeout(() => setSavedId((cur) => (cur === c.id ? null : cur)), 2000);
    } catch (e) {
      setError(e instanceof APIError ? e.message : 'Failed to update price.');
    } finally {
      setSavingId(null);
    }
  };

  const isDirty = (c: ManagedCompany): boolean => {
    const current = c.price === null || c.price === undefined ? '' : String(c.price);
    return (drafts[c.id] ?? '').trim() !== current.trim();
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-destructive font-medium">Action failed</p>
            <p className="text-destructive/80 text-sm">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-destructive/70 hover:text-destructive">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="bg-dark-800 rounded-xl border border-dark-700">
        <div className="p-4 border-b border-dark-700 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold font-heading">Company Pricing</h2>
            <p className="text-xs text-dark-400">
              {canManagePricing
                ? 'Set the USD price per company. Leave empty to clear.'
                : 'Read-only. Pricing can only be edited by a super admin.'}
            </p>
          </div>
          <button
            onClick={fetchCompanies}
            disabled={isLoading}
            className="p-2 text-dark-400 hover:text-white transition-colors"
            title="Refresh"
          >
            <RefreshCw className={cn('w-5 h-5', isLoading && 'animate-spin')} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-700 text-left">
                <th className="px-4 py-3 text-xs font-medium text-dark-400">Brand</th>
                <th className="px-4 py-3 text-xs font-medium text-dark-400">Industry</th>
                <th className="px-4 py-3 text-xs font-medium text-dark-400">Market</th>
                <th className="px-4 py-3 text-xs font-medium text-dark-400">Total Runs</th>
                <th className="px-4 py-3 text-xs font-medium text-dark-400">Price (USD)</th>
                {canManagePricing && (
                  <th className="px-4 py-3 text-xs font-medium text-dark-400">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {companies.map((c) => (
                <tr key={c.id} className="border-b border-dark-700/50 hover:bg-dark-700/30">
                  <td className="px-4 py-3">
                    <p className="font-medium text-sm">{c.brand_name}</p>
                    {c.company_id && (
                      <p className="text-xs text-dark-400">{c.company_id}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-dark-300">{c.industry || '—'}</td>
                  <td className="px-4 py-3 text-sm text-dark-300">{c.market || '—'}</td>
                  <td className="px-4 py-3 text-sm">{c.total_runs}</td>
                  <td className="px-4 py-3">
                    {canManagePricing ? (
                      <div className="flex items-center gap-1">
                        <span className="text-dark-400 text-sm">$</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={drafts[c.id] ?? ''}
                          onChange={(e) =>
                            setDrafts((prev) => ({ ...prev, [c.id]: e.target.value }))
                          }
                          placeholder="—"
                          className="w-28 px-2 py-1.5 bg-dark-700 border border-dark-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    ) : (
                      <span className="text-sm">{formatPrice(c.price)}</span>
                    )}
                  </td>
                  {canManagePricing && (
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleSave(c)}
                        disabled={savingId === c.id || !isDirty(c)}
                        className={cn(
                          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                          savedId === c.id
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-primary-500 hover:bg-primary-600 disabled:bg-dark-700 disabled:text-dark-500'
                        )}
                      >
                        {savedId === c.id ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Saved
                          </>
                        ) : savingId === c.id ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            Saving
                          </>
                        ) : (
                          <>
                            <Save className="w-3.5 h-3.5" />
                            Save
                          </>
                        )}
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {companies.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={canManagePricing ? 6 : 5} className="px-4 py-8 text-center text-dark-400">
                    No companies found
                  </td>
                </tr>
              )}
              {isLoading && companies.length === 0 && (
                <tr>
                  <td colSpan={canManagePricing ? 6 : 5} className="px-4 py-8 text-center text-dark-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto" />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
