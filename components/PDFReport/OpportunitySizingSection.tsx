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
      <div style={{ fontSize: 11, color, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' as const, marginBottom: 4 }}>
        {number}
      </div>
      <div style={{ fontSize: 24, fontWeight: 800, color: C.text }}>{title}</div>
      {subtitle && <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>{subtitle}</div>}
    </div>
  );
}

function OpportunityCard({
  accentColor,
  bigNumber,
  label,
  context,
}: {
  accentColor: string;
  bigNumber: string;
  label: string;
  context: string;
}) {
  return (
    <div
      style={{
        flex: 1,
        background: C.card,
        border: `1px solid ${C.border}`,
        borderTop: `3px solid ${accentColor}`,
        borderRadius: 10,
        padding: '20px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <div style={{ fontSize: 32, fontWeight: 900, color: accentColor, lineHeight: 1, letterSpacing: -1 }}>
        {bigNumber}
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.text, lineHeight: 1.3 }}>{label}</div>
      <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.5, marginTop: 2 }}>{context}</div>
    </div>
  );
}

export function OpportunitySizingSection({
  results,
  brandName,
}: {
  results: RunResults;
  brandName: string;
}) {
  const { summary, results: queryResults } = results;

  // Derived metrics
  const currentMentions = queryResults.filter((r) => r.brandMentioned).length;
  const totalResponses = queryResults.length;
  const overallVisibility = summary.overallVisibility ?? 0;

  const providerEntries = Object.entries(summary.providerVisibility ?? {});
  const bestProvider =
    providerEntries.length > 0
      ? providerEntries.reduce((best, cur) => (cur[1] > best[1] ? cur : best), providerEntries[0])
      : null;
  const worstProvider =
    providerEntries.length > 0
      ? providerEntries.reduce((worst, cur) => (cur[1] < worst[1] ? cur : worst), providerEntries[0])
      : null;

  const bestProviderName = bestProvider ? bestProvider[0] : 'best provider';
  const bestProviderPct = bestProvider ? Math.round(bestProvider[1]) : 0;

  const potentialAtBestProvider = Math.round((totalResponses * bestProviderPct) / 100);
  const upliftFromMatchingBest = Math.max(0, potentialAtBestProvider - currentMentions);

  const competitorEntries = Object.entries(summary.competitorVisibility ?? {}).sort(
    ([, a], [, b]) => b - a
  );
  const topCompetitor = competitorEntries[0] ?? null;
  const topCompetitorName = topCompetitor ? topCompetitor[0] : 'Top Competitor';
  const topCompetitorPct = topCompetitor ? Math.round(topCompetitor[1]) : 0;
  const gapToTopCompetitor = Math.max(0, topCompetitorPct - Math.round(overallVisibility));

  // Queries where competitors appear but brand doesn't
  const gapQueryCount = queryResults.filter(
    (r) => !r.brandMentioned && r.otherBrandsDetected.length > 0
  ).length;

  // Domains cited that don't include brand name
  const domainFreq: Record<string, number> = {};
  for (const r of queryResults) {
    for (const s of r.sources) {
      if (!s.url) continue;
      try {
        const domain = new URL(s.url).hostname.replace(/^www\./, '');
        if (domain) domainFreq[domain] = (domainFreq[domain] ?? 0) + 1;
      } catch {
        /* ignore */
      }
    }
  }
  const topCitedDomain = Object.entries(domainFreq).sort(([, a], [, b]) => b - a)[0];
  const topDomainName = topCitedDomain ? topCitedDomain[0] : 'high-authority domain';
  const topDomainCitations = topCitedDomain ? topCitedDomain[1] : 0;

  const visibilityPct = Math.round(overallVisibility);
  const topNGapPct = Math.round((gapQueryCount / Math.max(totalResponses, 1)) * 100);

  // Priority matrix actions
  const matrixItems: Array<{ quadrant: 'hl' | 'hh'; action: string }> = [
    { quadrant: 'hl', action: `Optimize top gap queries for AI citation` },
    { quadrant: 'hl', action: `Add FAQ schema to existing pages` },
    { quadrant: 'hh', action: `Commission 3rd-party benchmark studies` },
  ];

  return (
    <div data-pdf-page style={pageStyle}>
      <SectionHeader
        number="Section 15"
        title="Opportunity Sizing"
        subtitle="What improved visibility means in concrete numbers"
        color={C.amber}
      />

      {/* 2x2 opportunity cards */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
        <OpportunityCard
          accentColor={C.primary}
          bigNumber={`+${upliftFromMatchingBest}`}
          label="More Appearances"
          context={`By matching your best provider (${bestProviderName}) across all providers`}
        />
        <OpportunityCard
          accentColor={C.green}
          bigNumber={potentialAtBestProvider.toString()}
          label="Total Mentions Possible"
          context={`At ${bestProviderName}'s ${bestProviderPct}% rate across ${totalResponses} queries`}
        />
      </div>
      <div style={{ display: 'flex', gap: 14, marginBottom: 24 }}>
        <OpportunityCard
          accentColor={C.amber}
          bigNumber={`${topCompetitorName} +${gapToTopCompetitor}%`}
          label="Competitor Lead to Close"
          context="Closing this gap represents significant market share recovery"
        />
        <OpportunityCard
          accentColor={C.purple}
          bigNumber={gapQueryCount.toString()}
          label="Priority Queries"
          context="Queries where competitors appear but you don't — direct expansion potential"
        />
      </div>

      {/* Narrative opportunity statements */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        {[
          {
            icon: '→',
            text: `If ${brandName} matches ${bestProviderName}'s ${bestProviderPct}% across ALL providers → ${potentialAtBestProvider} brand mentions instead of ${currentMentions} per analysis cycle`,
            color: C.primary,
          },
          {
            icon: '→',
            text: `Appearing on ${topDomainName} (${topDomainCitations} AI citation${topDomainCitations !== 1 ? 's' : ''}) → estimated +${Math.max(1, topDomainCitations)} additional mentions per run, every run`,
            color: C.teal,
          },
          {
            icon: '→',
            text: `Closing the displacement gap across ${gapQueryCount} queries → ${topNGapPct}% share-of-voice recovery against actively competing brands`,
            color: C.amber,
          },
        ].map((stmt, i) => (
          <div
            key={i}
            style={{
              background: `${stmt.color}08`,
              border: `1px solid ${stmt.color}25`,
              borderLeft: `3px solid ${stmt.color}`,
              borderRadius: '0 8px 8px 0',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 800, color: stmt.color, flexShrink: 0, marginTop: 1 }}>
              {stmt.icon}
            </div>
            <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>{stmt.text}</div>
          </div>
        ))}
      </div>

      {/* Priority matrix */}
      <div
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 10,
          overflow: 'hidden',
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
          Priority Matrix
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: 'auto auto', gap: 0 }}>
          {/* Labels */}
          <div
            style={{
              padding: '14px 16px',
              borderRight: `1px solid ${C.border}`,
              borderBottom: `1px solid ${C.border}`,
              background: 'rgba(16,185,129,0.05)',
            }}
          >
            <div style={{ fontSize: 10, fontWeight: 700, color: C.green, letterSpacing: 1, textTransform: 'uppercase' as const, marginBottom: 8 }}>
              High Impact / Low Effort
            </div>
            {matrixItems
              .filter((m) => m.quadrant === 'hl')
              .map((m, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.green, flexShrink: 0 }} />
                  <div style={{ fontSize: 11, color: C.text }}>{m.action}</div>
                </div>
              ))}
          </div>
          <div
            style={{
              padding: '14px 16px',
              borderBottom: `1px solid ${C.border}`,
              background: 'rgba(245,158,11,0.04)',
            }}
          >
            <div style={{ fontSize: 10, fontWeight: 700, color: C.amber, letterSpacing: 1, textTransform: 'uppercase' as const, marginBottom: 8 }}>
              High Impact / High Effort
            </div>
            {matrixItems
              .filter((m) => m.quadrant === 'hh')
              .map((m, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.amber, flexShrink: 0 }} />
                  <div style={{ fontSize: 11, color: C.text }}>{m.action}</div>
                </div>
              ))}
          </div>
          <div style={{ padding: '12px 16px', borderRight: `1px solid ${C.border}`, background: 'rgba(71,85,105,0.1)' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, letterSpacing: 1, textTransform: 'uppercase' as const }}>
              Low Impact / Low Effort
            </div>
            <div style={{ fontSize: 11, color: C.faint, marginTop: 6, fontStyle: 'italic' }}>Maintenance tasks</div>
          </div>
          <div style={{ padding: '12px 16px', background: 'rgba(71,85,105,0.05)' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, letterSpacing: 1, textTransform: 'uppercase' as const }}>
              Low Impact / High Effort
            </div>
            <div style={{ fontSize: 11, color: C.faint, marginTop: 6, fontStyle: 'italic' }}>Defer or deprioritize</div>
          </div>
        </div>
      </div>
    </div>
  );
}
