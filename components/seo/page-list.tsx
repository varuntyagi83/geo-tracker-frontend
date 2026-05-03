'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import type { PageAnalysis } from '@/types/seo/analysis'

interface PageListProps {
  pages: PageAnalysis[]
  onSelect: (page: PageAnalysis) => void
  selectedUrl?: string
}

type SortKey = 'overall' | 'seo' | 'aeo' | 'url'
type Filter = 'all' | 'issues'

function scoreColor(score: number): string {
  if (score >= 80) return 'text-cyan-500 dark:text-cyan-400'
  if (score >= 60) return 'text-lime-600 dark:text-lime-400'
  if (score >= 40) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-red-600 dark:text-red-400'
}

function issueCount(page: PageAnalysis): number {
  return [...page.meta, ...page.content, ...page.technical, ...page.aeo]
    .filter(c => c.status !== 'pass').length
}

export function PageList({ pages, onSelect, selectedUrl }: PageListProps) {
  const [sort, setSort] = useState<SortKey>('overall')
  const [dir, setDir] = useState<'asc' | 'desc'>('asc')
  const [filter, setFilter] = useState<Filter>('all')

  function toggleSort(key: SortKey) {
    if (sort === key) setDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSort(key); setDir('asc') }
  }

  const sorted = [...pages]
    .filter(p => filter === 'all' || issueCount(p) > 0)
    .sort((a, b) => {
      let cmp = 0
      if (sort === 'url') cmp = a.url.localeCompare(b.url)
      else cmp = a.scores[sort] - b.scores[sort]
      return dir === 'asc' ? cmp : -cmp
    })

  function SortHeader({ label, col }: { label: string; col: SortKey }) {
    const active = sort === col
    return (
      <button
        onClick={() => toggleSort(col)}
        className={`flex items-center gap-1 text-xs font-semibold uppercase tracking-wider transition-colors ${
          active ? 'text-primary-400' : 'text-dark-400 hover:text-dark-200'
        }`}
      >
        {label}
        <span className="text-dark-500">{active ? (dir === 'asc' ? '↑' : '↓') : '↕'}</span>
      </button>
    )
  }

  return (
    <div className="space-y-3">
      {/* Filter + hint */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(['all', 'issues'] as Filter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                filter === f
                  ? 'border-primary-500 text-primary-400 bg-primary-500/10'
                  : 'border-dark-600 text-dark-400 hover:border-dark-500 hover:text-dark-300'
              }`}
            >
              {f === 'all' ? `All (${pages.length})` : `Has Issues (${pages.filter(p => issueCount(p) > 0).length})`}
            </button>
          ))}
        </div>
        <p className="text-xs text-dark-400 italic">Click a row to see detailed analysis</p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-dark-600">
        <table className="w-full text-sm">
          <thead className="border-b border-dark-600 bg-dark-700">
            <tr>
              <th className="text-left px-4 py-2.5"><SortHeader label="URL" col="url" /></th>
              <th className="text-right px-3 py-2.5"><SortHeader label="Overall" col="overall" /></th>
              <th className="text-right px-3 py-2.5"><SortHeader label="SEO" col="seo" /></th>
              <th className="text-right px-3 py-2.5"><SortHeader label="AEO" col="aeo" /></th>
              <th className="text-right px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-dark-400">Issues</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((page, i) => {
              const issues = issueCount(page)
              const isSelected = page.url === selectedUrl
              return (
                <tr
                  key={page.url}
                  onClick={() => onSelect(page)}
                  title="Click to see detailed analysis"
                  className={`border-b border-dark-700/50 cursor-pointer transition-colors group ${
                    isSelected
                      ? 'bg-primary-500/10 border-l-2 border-l-primary-500'
                      : i % 2 === 0
                        ? 'bg-transparent hover:bg-dark-700/40'
                        : 'bg-dark-700/20 hover:bg-dark-700/40'
                  }`}
                >
                  <td className="px-4 py-2.5 font-mono text-xs text-dark-300 max-w-xs truncate">
                    {page.url.replace(/^https?:\/\//, '')}
                    {page.depth === 0 && (
                      <Badge variant="outline" className="ml-2 text-[10px] border-cyan-400 dark:border-cyan-800 text-cyan-600 dark:text-cyan-600 py-0">home</Badge>
                    )}
                  </td>
                  <td className={`px-3 py-2.5 text-right font-bold tabular-nums ${scoreColor(page.scores.overall)}`}>
                    {page.scores.overall}
                  </td>
                  <td className={`px-3 py-2.5 text-right tabular-nums ${scoreColor(page.scores.seo)}`}>
                    {page.scores.seo}
                  </td>
                  <td className={`px-3 py-2.5 text-right tabular-nums ${scoreColor(page.scores.aeo)}`}>
                    {page.scores.aeo}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    {issues > 0 ? (
                      <span className="text-xs text-red-500 dark:text-red-400 font-semibold">{issues}</span>
                    ) : (
                      <span className="text-xs text-emerald-500">✓</span>
                    )}
                  </td>
                  <td className="pr-3 text-dark-600 group-hover:text-dark-400 transition-colors text-xs">
                    ›
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {sorted.length === 0 && (
          <div className="py-8 text-center text-dark-400 text-sm">No pages match the filter</div>
        )}
      </div>
    </div>
  )
}
