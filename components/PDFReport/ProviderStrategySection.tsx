'use client';

import type { RunResults } from '@/lib/types';

const C = {
  bg: '#0f172a',
  card: '#1e293b',
  cardAlt: '#243044',
  border: '#334155',
  text: '#f1f5f9',
  muted: '#94a3b8',
  faint: '#64748b',
  primary: '#3b82f6',
  green: '#10b981',
  amber: '#f59e0b',
  red: '#ef4444',
  purple: '#8b5cf6',
  teal: '#14b8a6',
  orange: '#f97316',
};

const pageStyle: React.CSSProperties = {
  width: '794px',
  minHeight: '500px',
  background: C.bg,
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  padding: '40px',
  boxSizing: 'border-box',
  color: C.text,
};

function getScoreColor(score: number | undefined): string {
  if (score === undefined) return C.faint;
  const pct = score <= 1 ? score * 100 : score;
  if (pct >= 70) return C.green;
  if (pct >= 40) return C.amber;
  return C.red;
}

function formatScore(score: number | undefined): string {
  if (score === undefined) return 'Not tested';
  const pct = score <= 1 ? Math.round(score * 100) : Math.round(score);
  return `${pct}%`;
}

interface ProviderDef {
  key: string;
  name: string;
  icon: string;
  color: string;
  how: string;
  actions: string[];
}

const PROVIDER_DEFS: ProviderDef[] = [
  {
    key: 'openai',
    name: 'OpenAI (ChatGPT)',
    icon: '🤖',
    color: '#74aa9c',
    how: 'Pulls from training data and Bing-indexed sources. Content freshness, editorial backlinks, and structured brand mentions in indexed pages matter most.',
    actions: [
      'Publish expert-authored long-form content on your domain targeting supplement category questions',
      'Get editorial mentions on Bing-indexed health and nutrition media sites',
      'Ensure your brand name appears in structured H1/H2 headings alongside product claims',
    ],
  },
  {
    key: 'gemini',
    name: 'Google Gemini',
    icon: '🔮',
    color: '#4285f4',
    how: 'Uses live Google Search results. Your organic Google ranking, Knowledge Panel, and structured data (schema.org) directly determine Gemini responses.',
    actions: [
      'Optimise your Google Business Profile and Knowledge Panel with accurate brand data',
      'Implement Product, FAQPage, and Organization schema markup on all key pages',
      'Rank for branded + category head terms to appear in Gemini live search pulls',
    ],
  },
  {
    key: 'perplexity',
    name: 'Perplexity AI',
    icon: '🔍',
    color: '#6366f1',
    how: 'Citation-heavy engine that pulls from Reddit, review sites, Q&A forums, and community discussions. Social proof and peer reviews are the primary trust signals.',
    actions: [
      'Build an active presence on Reddit supplement communities (r/Supplements, r/nutrition)',
      'Drive reviews on Trustpilot, iHerb, Amazon, and other review aggregators AI cites',
      'Answer questions on Quora and StackExchange with authoritative brand-linked responses',
    ],
  },
  {
    key: 'anthropic',
    name: 'Claude (Anthropic)',
    icon: '🧠',
    color: '#d4a27f',
    how: 'Relies primarily on training data corpus. Long-form authoritative content, academic citations, clinical studies, and peer-reviewed references carry the most weight.',
    actions: [
      'Commission or sponsor clinical studies and white papers featuring your brand name',
      'Publish detailed, citation-rich research pages with links to PubMed and academic sources',
      'Build brand mentions into expert interviews, academic blogs, and trusted health directories',
    ],
  },
];

export function ProviderStrategySection({
  results,
  brandName,
}: {
  results: RunResults;
  brandName: string;
}) {
  const { providerVisibility } = results.summary;

  const sorted = [...PROVIDER_DEFS].sort((a, b) => {
    const scoreA = providerVisibility[a.key] ?? -1;
    const scoreB = providerVisibility[b.key] ?? -1;
    return scoreA - scoreB; // worst first — needs most work
  });

  const best = [...PROVIDER_DEFS].reduce(
    (acc, p) =>
      (providerVisibility[p.key] ?? -1) > (providerVisibility[acc.key] ?? -1) ? p : acc,
    PROVIDER_DEFS[0]
  );
  const worst = sorted[0];

  return (
    <div data-pdf-page style={pageStyle}>
      {/* Section Header */}
      <div
        style={{
          borderLeft: '4px solid #3b82f6',
          background: 'linear-gradient(90deg, rgba(59,130,246,0.08) 0%, transparent 100%)',
          borderRadius: '0 8px 8px 0',
          padding: '16px 20px',
          marginBottom: 20,
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 3,
            color: '#3b82f6',
            textTransform: 'uppercase' as const,
            marginBottom: 4,
          }}
        >
          Section 11
        </div>
        <div style={{ fontSize: 24, fontWeight: 700, color: C.text, marginBottom: 4 }}>
          Provider-Specific Optimization Strategies
        </div>
        <div style={{ fontSize: 13, color: C.muted }}>
          Each AI engine indexes content differently — here&apos;s how to optimize for each
        </div>
      </div>

      {/* Summary pills */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          marginBottom: 24,
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            padding: '6px 14px',
            borderRadius: 20,
            background: `${C.green}18`,
            border: `1px solid ${C.green}40`,
            fontSize: 12,
            color: C.green,
            fontWeight: 600,
          }}
        >
          Best: {best.name} ({formatScore(providerVisibility[best.key])})
        </div>
        <div
          style={{
            padding: '6px 14px',
            borderRadius: 20,
            background: `${C.red}18`,
            border: `1px solid ${C.red}40`,
            fontSize: 12,
            color: C.red,
            fontWeight: 600,
          }}
        >
          Needs Work: {worst.name} ({formatScore(providerVisibility[worst.key])})
        </div>
        <div
          style={{
            padding: '6px 14px',
            borderRadius: 20,
            background: `${C.muted}18`,
            border: `1px solid ${C.border}`,
            fontSize: 12,
            color: C.muted,
          }}
        >
          Brand: {brandName}
        </div>
      </div>

      {/* 2x2 provider cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
        }}
      >
        {PROVIDER_DEFS.map((provider) => {
          const score = providerVisibility[provider.key];
          const scoreColor = getScoreColor(score);
          const scoreDisplay = formatScore(score);
          const isWorst = worst.key === provider.key;

          return (
            <div
              key={provider.key}
              style={{
                background: C.card,
                border: `1px solid ${C.border}`,
                borderTop: `3px solid ${provider.color}`,
                borderRadius: '0 0 12px 12px',
                padding: '18px 18px',
              }}
            >
              {/* Provider name + score */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 20 }}>{provider.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>
                      {provider.name}
                    </div>
                    {isWorst && (
                      <div style={{ fontSize: 9, color: C.red, fontWeight: 700, letterSpacing: 1 }}>
                        PRIORITY FOCUS
                      </div>
                    )}
                  </div>
                </div>
                <div
                  style={{
                    padding: '4px 10px',
                    borderRadius: 20,
                    background: `${scoreColor}20`,
                    border: `1px solid ${scoreColor}40`,
                    fontSize: 13,
                    fontWeight: 800,
                    color: scoreColor,
                  }}
                >
                  {scoreDisplay}
                </div>
              </div>

              {/* Visibility bar */}
              {score !== undefined && (
                <div style={{ marginBottom: 14 }}>
                  <div
                    style={{
                      height: 5,
                      background: C.border,
                      borderRadius: 3,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${score <= 1 ? score * 100 : score}%`,
                        height: '100%',
                        background: scoreColor,
                        borderRadius: 3,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* How it works */}
              <div
                style={{
                  background: C.cardAlt,
                  borderRadius: 8,
                  padding: '10px 12px',
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: 1.5,
                    color: provider.color,
                    textTransform: 'uppercase' as const,
                    marginBottom: 5,
                  }}
                >
                  How It Works
                </div>
                <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.55 }}>
                  {provider.how}
                </div>
              </div>

              {/* Actions */}
              <div>
                <div
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: 1.5,
                    color: C.muted,
                    textTransform: 'uppercase' as const,
                    marginBottom: 8,
                  }}
                >
                  Key Actions for {brandName}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {provider.actions.map((action, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <div
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          background: `${provider.color}20`,
                          border: `1px solid ${provider.color}40`,
                          color: provider.color,
                          fontSize: 9,
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: 1,
                        }}
                      >
                        {i + 1}
                      </div>
                      <div style={{ fontSize: 11, color: C.text, lineHeight: 1.5 }}>
                        {action}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
