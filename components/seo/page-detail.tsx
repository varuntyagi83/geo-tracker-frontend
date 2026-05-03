'use client'

import type { PageAnalysis, CheckItem } from '@/types/seo/analysis'

interface PageDetailProps {
  page: PageAnalysis
  onClose: () => void
}

function CheckRow({ check }: { check: CheckItem }) {
  const isPass = check.status === 'pass'
  const isFail = check.status === 'fail'
  const icon = isPass ? '✓' : isFail ? '✕' : '!'
  const iconColor = isPass ? 'text-cyan-400' : isFail ? 'text-red-400' : 'text-amber-400'

  return (
    <div className="py-1.5 border-b border-dark-700/40 last:border-0">
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className={`text-xs font-bold flex-shrink-0 w-3 ${iconColor}`}>{icon}</span>
        <code className="text-xs text-dark-200 font-mono">{check.tag}</code>
        {check.found && (
          <>
            <span className="text-xs text-dark-500">·</span>
            <span className="text-xs text-dark-300 break-all">{check.found}</span>
          </>
        )}
      </div>
      {check.recommendation && (
        <p className="text-xs text-dark-500 ml-5 mt-1 leading-relaxed">{check.recommendation}</p>
      )}
    </div>
  )
}

export function PageDetailPanel({ page, onClose }: PageDetailProps) {
  const sections: { label: string; checks: CheckItem[] }[] = [
    { label: 'META',      checks: page.meta },
    { label: 'CONTENT',   checks: page.content },
    { label: 'TECHNICAL', checks: page.technical },
    { label: 'AEO',       checks: page.aeo },
  ]

  const issueCount = sections.flatMap(s => s.checks).filter(c => c.status !== 'pass').length

  return (
    <div className="mt-4 rounded-xl border border-dark-600 bg-dark-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-dark-700 bg-dark-750">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-sm font-mono text-white truncate">{page.url}</span>
          {issueCount > 0 && (
            <span className="text-xs text-amber-400 flex-shrink-0">{issueCount} issue{issueCount !== 1 ? 's' : ''}</span>
          )}
        </div>
        <button
          onClick={onClose}
          className="ml-4 text-dark-400 hover:text-white transition-colors text-lg leading-none flex-shrink-0"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      {/* Scores row */}
      <div className="flex gap-6 px-5 py-3 border-b border-dark-700 bg-dark-750/50">
        {[
          { label: 'Overall', value: page.scores.overall },
          { label: 'SEO',     value: page.scores.seo },
          { label: 'AEO',     value: page.scores.aeo },
        ].map(({ label, value }) => {
          const color = value >= 80 ? 'text-cyan-400' : value >= 60 ? 'text-lime-400' : value >= 40 ? 'text-amber-400' : 'text-red-400'
          return (
            <div key={label} className="flex items-baseline gap-1.5">
              <span className="text-xs text-dark-400">{label}</span>
              <span className={`text-lg font-bold tabular-nums ${color}`}>{value}</span>
            </div>
          )
        })}
      </div>

      {/* Sections */}
      <div className="px-5 py-4 space-y-5 max-h-[60vh] overflow-y-auto">
        {sections.map(({ label, checks }) => (
          <div key={label}>
            <p className="text-xs font-semibold text-dark-400 uppercase tracking-widest mb-2">{label}</p>
            <div>
              {checks.map(check => (
                <CheckRow key={check.tag} check={check} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
