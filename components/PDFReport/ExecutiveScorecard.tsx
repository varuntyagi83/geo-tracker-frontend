'use client';

import type { RunResults } from '@/lib/types';
import type { EEATScore } from '@/lib/eeat';

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

function getScoreColor(score: number): string {
  if (score >= 70) return C.green;
  if (score >= 40) return C.amber;
  return C.red;
}

function TrafficLightCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <div
      style={{
        flex: 1,
        background: C.card,
        border: `1px solid ${C.border}`,
        borderTop: `3px solid ${color}`,
        borderRadius: 10,
        padding: '14px 12px',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 22, fontWeight: 900, color, lineHeight: 1, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, color: C.muted, textTransform: 'uppercase' as const, marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 9, color: C.faint, lineHeight: 1.3 }}>{sub}</div>
    </div>
  );
}

export function ExecutiveScorecard({
  results,
  brandName,
  eeat,
}: {
  results: RunResults;
  brandName: string;
  eeat: EEATScore;
}) {
  const { summary, results: queryResults } = results;

  const date = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const visibilityPct = Math.round(summary.overallVisibility);
  const visColor = getScoreColor(visibilityPct);

  const providerEntries = Object.entries(summary.providerVisibility ?? {});
  const bestProvider =
    providerEntries.length > 0
      ? providerEntries.reduce((b, c) => (c[1] > b[1] ? c : b), providerEntries[0])
      : null;
  const worstProvider =
    providerEntries.length > 0
      ? providerEntries.reduce((w, c) => (c[1] < w[1] ? c : w), providerEntries[0])
      : null;

  const bestProviderName = bestProvider ? bestProvider[0] : '—';
  const bestProviderPct = bestProvider ? Math.round(bestProvider[1]) : 0;
  const worstProviderName = worstProvider ? worstProvider[0] : '—';
  const worstProviderPct = worstProvider ? Math.round(worstProvider[1]) : 0;

  // Brand rank among all detected brands
  const allBrandVisibility = (
    [[brandName, summary.overallVisibility ?? 0], ...Object.entries(summary.competitorVisibility ?? {})] as [string, number][]
  ).sort(([, a], [, b]) => b - a);
  const brandRank = allBrandVisibility.findIndex(([name]) => name === brandName) + 1;
  const totalBrands = allBrandVisibility.length;

  // Top competitor
  const competitorEntries = Object.entries(summary.competitorVisibility ?? {}).sort(
    ([, a], [, b]) => b - a
  );
  const topCompetitor = competitorEntries[0] ?? null;
  const topCompetitorName = topCompetitor ? topCompetitor[0] : 'competitors';
  const topCompetitorPct = topCompetitor ? Math.round(topCompetitor[1]) : 0;

  // Gap queries
  const gapQueryCount = queryResults.filter(
    (r) => !r.brandMentioned && r.otherBrandsDetected.length > 0
  ).length;

  // Top uncovered domain
  const domainFreq: Record<string, number> = {};
  for (const r of queryResults) {
    for (const s of r.sources) {
      if (!s.url) continue;
      try {
        const domain = new URL(s.url).hostname.replace(/^www\./, '');
        if (domain) domainFreq[domain] = (domainFreq[domain] ?? 0) + 1;
      } catch { /* ignore */ }
    }
  }
  const topUncoveredDomain = Object.entries(domainFreq).sort(([, a], [, b]) => b - a)[0]?.[0] ?? 'high-authority domain';

  // Uplift calculation
  const currentMentions = queryResults.filter((r) => r.brandMentioned).length;
  const totalResponses = queryResults.length;
  const potentialAtBest = Math.round((totalResponses * bestProviderPct) / 100);
  const uplift = Math.max(0, potentialAtBest - currentMentions);

  // Priority action
  const priorityAction =
    visibilityPct < 40
      ? `Publish expert content targeting the ${gapQueryCount} queries where ${topCompetitorName} appears without ${brandName}, and submit to ${topUncoveredDomain} to establish citation presence across the top AI providers.`
      : visibilityPct < 70
      ? `Close the ${worstProviderPct < 30 ? `${worstProviderName} visibility gap (${worstProviderPct}%)` : 'provider-specific gaps'} by publishing content in formats and sources favoured by underperforming AI providers, targeting the ${gapQueryCount} displacement queries.`
      : `Expand topic cluster coverage in the ${gapQueryCount} gap queries to defend visibility leadership, while securing additional citations on ${topUncoveredDomain} to reinforce authority across all providers.`;

  return (
    <div data-pdf-page style={pageStyle}>
      {/* Header bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: 4,
        }}
      >
        <div style={{ fontSize: 20, fontWeight: 900, color: C.text, letterSpacing: -0.5 }}>
          EXECUTIVE SCORECARD — <span style={{ color: C.primary }}>{brandName.toUpperCase()}</span>
        </div>
        <div style={{ fontSize: 11, color: C.muted }}>{date}</div>
      </div>
      <div style={{ fontSize: 11, color: C.faint, marginBottom: 24 }}>
        AI Visibility Performance Summary — Prepared by GEO Raydar
      </div>

      {/* 5 KPI traffic-light cards */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        <TrafficLightCard
          label="GEO Visibility"
          value={`${visibilityPct}%`}
          sub={visibilityPct >= 70 ? 'Strong' : visibilityPct >= 40 ? 'Moderate' : 'Low'}
          color={visColor}
        />
        <TrafficLightCard
          label="E-E-A-T Score"
          value={`${eeat.overall}/100`}
          sub={eeat.overall >= 70 ? 'Strong' : eeat.overall >= 40 ? 'Moderate' : 'Weak'}
          color={getScoreColor(eeat.overall)}
        />
        <TrafficLightCard
          label="Top Provider"
          value={`${bestProviderPct}%`}
          sub={bestProviderName.charAt(0).toUpperCase() + bestProviderName.slice(1)}
          color={getScoreColor(bestProviderPct)}
        />
        <TrafficLightCard
          label="Worst Provider"
          value={`${worstProviderPct}%`}
          sub={worstProviderName.charAt(0).toUpperCase() + worstProviderName.slice(1)}
          color={getScoreColor(worstProviderPct)}
        />
        <TrafficLightCard
          label="Brand vs Competition"
          value={`#${brandRank} of ${totalBrands}`}
          sub="ranked by visibility"
          color={brandRank === 1 ? C.green : brandRank <= Math.ceil(totalBrands / 2) ? C.amber : C.red}
        />
      </div>

      {/* Two-column risks / opportunities */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        {/* Risks */}
        <div
          style={{
            flex: 1,
            background: 'rgba(239,68,68,0.05)',
            border: `1px solid rgba(239,68,68,0.25)`,
            borderRadius: 10,
            padding: '16px 18px',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: C.red, letterSpacing: 2, textTransform: 'uppercase' as const, marginBottom: 12 }}>
            Top 3 Risks
          </div>
          {[
            {
              title: `Low ${worstProviderName} visibility (${worstProviderPct}%)`,
              desc: `${brandName} is nearly invisible on one of the most-used AI assistants`,
            },
            {
              title: `Competitor displacement in ${gapQueryCount} queries`,
              desc: `${topCompetitorName} appears in your place — direct market share loss in progress`,
            },
            {
              title: 'Low own-domain citation rate',
              desc: `Full dependency on third-party coverage creates fragile, uncontrolled positioning`,
            },
          ].map((risk, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: i < 2 ? 12 : 0 }}>
              <div style={{ fontSize: 13, color: C.red, flexShrink: 0, marginTop: 1 }}>✕</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 2 }}>{risk.title}</div>
                <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.4 }}>{risk.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Opportunities */}
        <div
          style={{
            flex: 1,
            background: 'rgba(16,185,129,0.05)',
            border: `1px solid rgba(16,185,129,0.25)`,
            borderRadius: 10,
            padding: '16px 18px',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: C.green, letterSpacing: 2, textTransform: 'uppercase' as const, marginBottom: 12 }}>
            Top 3 Opportunities
          </div>
          {[
            {
              title: `Match ${bestProviderName}'s score across all providers`,
              desc: `→ +${uplift} appearance${uplift !== 1 ? 's' : ''} per analysis cycle with consistent brand framing`,
            },
            {
              title: `Get listed on ${topUncoveredDomain}`,
              desc: `Already a top AI citation source — immediate visibility uplift on first mention`,
            },
            {
              title: `${gapQueryCount} content gap queries`,
              desc: `Direct expansion potential — each closed gap converts a competitor appearance into a brand appearance`,
            },
          ].map((opp, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: i < 2 ? 12 : 0 }}>
              <div style={{ fontSize: 13, color: C.green, flexShrink: 0, marginTop: 1 }}>✓</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 2 }}>{opp.title}</div>
                <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.4 }}>{opp.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Priority action headline */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(139,92,246,0.10) 100%)',
          border: `1px solid rgba(59,130,246,0.30)`,
          borderRadius: 10,
          padding: '18px 24px',
          textAlign: 'center',
          marginBottom: 24,
        }}
      >
        <div style={{ fontSize: 10, fontWeight: 700, color: C.primary, letterSpacing: 3, textTransform: 'uppercase' as const, marginBottom: 8 }}>
          Priority Action
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.text, lineHeight: 1.6 }}>
          {priorityAction}
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          borderTop: `1px solid ${C.border}`,
          paddingTop: 12,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ fontSize: 10, color: C.faint }}>
          Generated by GEO Raydar · {date} · Confidential
        </div>
        <div style={{ fontSize: 10, color: C.faint }}>
          Powered by OpenAI, Google Gemini, Perplexity AI, Anthropic Claude
        </div>
      </div>
    </div>
  );
}
