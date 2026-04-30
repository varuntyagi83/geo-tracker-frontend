'use client';

import type { RunResults, QueryResult } from '@/lib/types';

interface SectionProps {
  results: RunResults;
  brandName: string;
  market?: string;
  lang?: string;
}

const C = {
  bg: '#0f172a',
  card: '#1e293b',
  cardAlt: '#243044',
  border: '#334155',
  text: '#f1f5f9',
  muted: '#94a3b8',
  faint: '#64748b',
  teal: '#14b8a6',
  tealGlow: 'rgba(20,184,166,0.15)',
  green: '#10b981',
  amber: '#f59e0b',
  red: '#ef4444',
};

function SectionHeader({
  number,
  title,
  subtitle,
  color,
}: {
  number: string;
  title: string;
  subtitle: string;
  color: string;
}) {
  return (
    <div
      style={{
        padding: '16px 20px',
        background: `linear-gradient(90deg, ${color}20 0%, transparent 100%)`,
        borderLeft: `4px solid ${color}`,
        marginBottom: '28px',
        borderRadius: '0 8px 8px 0',
      }}
    >
      <div style={{ fontSize: 11, color, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>
        {number}
      </div>
      <div style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9' }}>{title}</div>
      {subtitle && <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>{subtitle}</div>}
    </div>
  );
}

function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max - 1) + '…' : text;
}

export function HeatMapSection({ results, brandName }: SectionProps) {
  const { results: queryResults } = results;

  // Collect unique providers and unique questions
  const providerSet = new Set<string>();
  queryResults.forEach((r) => providerSet.add(r.provider));
  const providers = Array.from(providerSet).sort();

  // Unique questions (preserve order, deduplicate by text)
  const questionMap = new Map<string, QueryResult[]>();
  queryResults.forEach((r) => {
    if (!questionMap.has(r.question)) questionMap.set(r.question, []);
    questionMap.get(r.question)!.push(r);
  });
  const allQuestions = Array.from(questionMap.keys());
  const LIMIT = 20;
  const questions = allQuestions.slice(0, LIMIT);
  const totalQuestions = allQuestions.length;
  const truncated = totalQuestions > LIMIT;

  // Build lookup: question + provider → brandMentioned | null
  const lookup = new Map<string, boolean | null>();
  queryResults.forEach((r) => {
    lookup.set(`${r.question}||${r.provider}`, r.brandMentioned);
  });

  // Count mentions per provider for worst-provider insight
  const providerMentions: Record<string, { total: number; mentioned: number }> = {};
  providers.forEach((p) => { providerMentions[p] = { total: 0, mentioned: 0 }; });
  queryResults.forEach((r) => {
    if (providerMentions[r.provider]) {
      providerMentions[r.provider].total++;
      if (r.brandMentioned) providerMentions[r.provider].mentioned++;
    }
  });

  const totalCells = providers.length * questions.length;
  let mentionedCells = 0;
  questions.forEach((q) => {
    providers.forEach((p) => {
      const val = lookup.get(`${q}||${p}`);
      if (val === true) mentionedCells++;
    });
  });

  const worstProvider = providers.slice().sort((a, b) => {
    const ra = providerMentions[a].total > 0 ? providerMentions[a].mentioned / providerMentions[a].total : 0;
    const rb = providerMentions[b].total > 0 ? providerMentions[b].mentioned / providerMentions[b].total : 0;
    return ra - rb;
  })[0];

  const CELL_W = Math.max(36, Math.floor((714 - 200) / Math.max(providers.length, 1)));
  const CELL_H = 24;
  const LABEL_W = 200;

  return (
    <div
      data-pdf-page
      style={{
        width: '794px',
        minHeight: '500px',
        background: C.bg,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        padding: '40px',
        boxSizing: 'border-box',
        color: C.text,
      }}
    >
      <SectionHeader
        number="Section 3"
        title="Query × Provider Heat Map"
        subtitle={`${brandName} · Brand mention presence across all query-provider pairs`}
        color={C.teal}
      />

      {/* Legend */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
        {[
          { color: C.green, label: 'Brand Mentioned' },
          { color: C.red, label: 'Not Mentioned' },
          { color: C.border, label: 'N/A' },
        ].map((item) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 14, height: 14, borderRadius: 3, background: item.color }} />
            <span style={{ fontSize: 11, color: C.muted }}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Heat map grid */}
      <div style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 16,
      }}>
        {/* Header row */}
        <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}` }}>
          <div style={{
            width: LABEL_W,
            minWidth: LABEL_W,
            padding: '8px 12px',
            fontSize: 9,
            fontWeight: 700,
            color: C.muted,
            letterSpacing: 1,
            textTransform: 'uppercase',
          }}>
            Query
          </div>
          {providers.map((p) => (
            <div
              key={p}
              style={{
                width: CELL_W,
                minWidth: CELL_W,
                textAlign: 'center',
                padding: '8px 4px',
                fontSize: 9,
                fontWeight: 700,
                color: C.muted,
                textTransform: 'capitalize',
                letterSpacing: 0.5,
                borderLeft: `1px solid ${C.border}`,
              }}
            >
              {p}
            </div>
          ))}
        </div>

        {/* Data rows */}
        {questions.map((q, rowIdx) => {
          const isEven = rowIdx % 2 === 0;
          return (
            <div
              key={rowIdx}
              style={{
                display: 'flex',
                alignItems: 'center',
                borderBottom: rowIdx < questions.length - 1 ? `1px solid ${C.border}22` : 'none',
                background: isEven ? 'transparent' : `${C.cardAlt}60`,
              }}
            >
              {/* Query label */}
              <div style={{
                width: LABEL_W,
                minWidth: LABEL_W,
                padding: '4px 12px',
                fontSize: 9,
                color: C.muted,
                lineHeight: 1.4,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {truncate(q, 52)}
              </div>

              {/* Provider cells */}
              {providers.map((p) => {
                const val = lookup.get(`${q}||${p}`);
                let bg = C.border;
                let title = 'N/A';
                if (val === true) { bg = C.green; title = 'Mentioned'; }
                else if (val === false) { bg = C.red; title = 'Not Mentioned'; }

                return (
                  <div
                    key={p}
                    title={title}
                    style={{
                      width: CELL_W,
                      minWidth: CELL_W,
                      height: CELL_H,
                      background: val === true ? `${C.green}35` : val === false ? `${C.red}35` : `${C.border}50`,
                      borderLeft: `1px solid ${C.border}22`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <div style={{
                      width: 10,
                      height: 10,
                      borderRadius: 2,
                      background: bg,
                      opacity: val === null || val === undefined ? 0.4 : 1,
                    }} />
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {truncated && (
        <div style={{
          fontSize: 10,
          color: C.amber,
          marginBottom: 12,
          padding: '6px 12px',
          background: 'rgba(245,158,11,0.08)',
          border: '1px solid rgba(245,158,11,0.2)',
          borderRadius: 6,
          display: 'inline-block',
        }}>
          Showing first {LIMIT} of {totalQuestions} queries
        </div>
      )}

      {/* Insight */}
      <div style={{
        background: C.cardAlt,
        border: `1px solid ${C.border}`,
        borderRadius: 10,
        padding: '14px 18px',
      }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.teal, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>
          Heat Map Insight
        </div>
        <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.7 }}>
          <strong style={{ color: C.text }}>{mentionedCells}</strong> of{' '}
          <strong style={{ color: C.text }}>{totalCells}</strong> query-provider combinations showed a brand mention
          ({Math.round((mentionedCells / Math.max(totalCells, 1)) * 100)}% coverage).{' '}
          {worstProvider
            ? <>
                Worst performing provider:{' '}
                <strong style={{ color: C.red }}>{worstProvider}</strong>{' '}
                ({Math.round(
                  (providerMentions[worstProvider].mentioned / Math.max(providerMentions[worstProvider].total, 1)) * 100
                )}% mention rate) — target this provider with structured, authoritative content to close the gap.
              </>
            : 'Review provider-level data to identify content gaps.'}
        </div>
      </div>
    </div>
  );
}
