'use client';

import type { RunResults } from '@/lib/types';

const C = {
  bg: '#0f172a',
  card: '#1e293b',
  cardAlt: '#243044',
  border: '#334155',
  text: '#f1f5f9',
  muted: '#94a3b8',
  faint: '#475569',
  primary: '#3b82f6',
  green: '#10b981',
  amber: '#f59e0b',
  red: '#ef4444',
  purple: '#8b5cf6',
  teal: '#14b8a6',
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

function SectionHeader({
  number,
  title,
  color,
}: {
  number: string;
  title: string;
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
      <div style={{ fontSize: 11, color, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' as const, marginBottom: 4 }}>
        {number}
      </div>
      <div style={{ fontSize: 24, fontWeight: 800, color: C.text }}>{title}</div>
    </div>
  );
}

const GLOSSARY_TERMS = [
  {
    term: 'GEO (Generative Engine Optimization)',
    def: 'The practice of optimizing brand content, citations, and entity signals for accurate representation in AI-generated responses.',
  },
  {
    term: 'AEO (Answer Engine Optimization)',
    def: 'Technical optimization of website content, schema markup, and structure so AI models can directly extract and cite it.',
  },
  {
    term: 'Presence Score',
    def: 'A binary/null indicator of brand mention in a specific AI response: 1.0 = brand appeared, 0.0 = competitors appeared but not brand, null = neither.',
  },
  {
    term: 'Share of Voice',
    def: "The brand's total mention count as a percentage of combined brand-plus-competitor mentions across all AI responses.",
  },
  {
    term: 'Displacement',
    def: 'When a competitor appears in an AI response that does not mention your brand — a direct instance of market share erosion in the AI layer.',
  },
  {
    term: 'Citation Building',
    def: 'The strategic process of securing brand mentions in high-authority sources that AI models index, reference, and cite in training data.',
  },
];

const METHODOLOGY_ITEMS = [
  {
    term: 'GEO Visibility Score',
    def: '% of AI responses where the brand name (or a configured keyword alias) was detected using case-insensitive exact-match logic across the full response text.',
  },
  {
    term: 'E-E-A-T Score',
    def: 'Composite of four dimensions derived from run data: Experience (sentiment normalisation), Expertise (trust authority), Authoritativeness (brand-owned citations), Trustworthiness (positive-mention rate + negative-response absence).',
  },
  {
    term: 'Presence (1.0 / 0.0 / null)',
    def: '1.0 = brand appeared in response; 0.0 = competitors appeared but brand did not; null = neither brand nor competitors were detected.',
  },
  {
    term: 'Sentiment (–1 to 1)',
    def: 'VADER-based polarity scoring of the immediate context window around brand mentions. Scores above 0.1 are positive, below –0.1 are negative.',
  },
  {
    term: 'Trust Authority (0–1)',
    def: 'Quality-weighted ratio of high-authority source citations (e.g., academic, major press, government) relative to total sources in the response.',
  },
];

export function MethodologySection({ results }: { results: RunResults }) {
  const { summary, results: queryResults } = results;

  // Unique providers
  const uniqueProviders = Array.from(new Set(queryResults.map((r) => r.provider)));
  const uniqueModes = Array.from(new Set(queryResults.map((r) => r.mode)));
  const uniqueCategories = Array.from(new Set(queryResults.map((r) => r.category).filter(Boolean)));

  return (
    <div data-pdf-page style={pageStyle}>
      <SectionHeader number="Section 18" title="Methodology & Glossary" color={C.faint} />

      {/* Two-column main content */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 24 }}>
        {/* Left: How scores are calculated */}
        <div
          style={{
            flex: 1,
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 10,
            padding: '18px 20px',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: 2, textTransform: 'uppercase' as const, marginBottom: 14 }}>
            How Scores Are Calculated
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {METHODOLOGY_ITEMS.map((item, i) => (
              <div
                key={i}
                style={{
                  paddingBottom: i < METHODOLOGY_ITEMS.length - 1 ? 12 : 0,
                  borderBottom: i < METHODOLOGY_ITEMS.length - 1 ? `1px solid ${C.border}` : 'none',
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 3 }}>{item.term}</div>
                <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.55 }}>{item.def}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: About this analysis */}
        <div
          style={{
            flex: 1,
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 10,
            padding: '18px 20px',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: 2, textTransform: 'uppercase' as const, marginBottom: 14 }}>
            About This Analysis
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              {
                label: 'Providers Tested',
                value: uniqueProviders.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(', '),
              },
              {
                label: 'Mode',
                value: uniqueModes.map((m) => m === 'provider_web' ? 'Web Search' : 'Internal Knowledge').join(', '),
              },
              {
                label: 'Total Queries',
                value: `${queryResults.length} queries across ${uniqueCategories.length || 'multiple'} categories`,
              },
              {
                label: 'Brand Mentions',
                value: `${queryResults.filter((r) => r.brandMentioned).length} of ${queryResults.length} responses`,
              },
              {
                label: 'Competitor Signals',
                value: `${Object.keys(summary.competitorVisibility ?? {}).length} unique competitors detected`,
              },
            ].map((row, i) => (
              <div key={i} style={{ display: 'flex', gap: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.faint, minWidth: 120, flexShrink: 0 }}>{row.label}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{row.value}</div>
              </div>
            ))}

            {/* Non-determinism note */}
            <div
              style={{
                marginTop: 8,
                paddingTop: 12,
                borderTop: `1px solid ${C.border}`,
                background: `${C.amber}08`,
                border: `1px solid ${C.amber}25`,
                borderRadius: 8,
                padding: '10px 12px',
              }}
            >
              <div style={{ fontSize: 10, fontWeight: 700, color: C.amber, letterSpacing: 1, textTransform: 'uppercase' as const, marginBottom: 5 }}>
                Non-Determinism Note
              </div>
              <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.5 }}>
                LLM outputs are probabilistic — results may vary between runs on identical queries. Scores
                represent a statistical snapshot of model behaviour at the time of analysis. We recommend
                running monthly to track trends rather than treating any single run as definitive.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Glossary */}
      <div
        style={{
          background: C.cardAlt,
          border: `1px solid ${C.border}`,
          borderRadius: 10,
          overflow: 'hidden',
          marginBottom: 20,
        }}
      >
        <div
          style={{
            padding: '10px 16px',
            borderBottom: `1px solid ${C.border}`,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 2,
            color: C.muted,
            textTransform: 'uppercase' as const,
          }}
        >
          Glossary
        </div>
        <div style={{ padding: '4px 0' }}>
          {GLOSSARY_TERMS.map((item, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: 12,
                padding: '10px 16px',
                borderBottom: i < GLOSSARY_TERMS.length - 1 ? `1px solid ${C.border}` : 'none',
                background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: C.primary, minWidth: 220, flexShrink: 0 }}>
                {item.term}
              </div>
              <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.5 }}>{item.def}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          borderTop: `1px solid ${C.border}`,
          paddingTop: 14,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ fontSize: 10, color: C.faint }}>
          Data collected by GEO Raydar · Analysis generated {new Date().toLocaleDateString('en-GB')}
        </div>
        <div style={{ fontSize: 10, color: C.faint }}>
          Powered by OpenAI, Google Gemini, Perplexity AI, Anthropic Claude
        </div>
      </div>
    </div>
  );
}
