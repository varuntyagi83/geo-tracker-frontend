'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
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

function extractDomain(url: string): string {
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, '');
  } catch {
    // fallback: strip protocol and path
    return url
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .split('/')[0]
      .split('?')[0];
  }
}

function getPriority(citations: number, featured: boolean): string {
  if (featured) return 'Monitor';
  if (citations >= 2) return 'Critical';
  return 'High';
}

function getPriorityColor(priority: string): string {
  if (priority === 'Critical') return C.red;
  if (priority === 'High') return C.amber;
  return C.green;
}

export function SourceSection({
  results,
  brandName,
}: {
  results: RunResults;
  brandName: string;
}) {
  // Count domains
  const domainCounts: Record<string, number> = {};
  for (const result of results.results) {
    for (const source of result.sources) {
      if (!source.url) continue;
      const domain = extractDomain(source.url);
      if (!domain || domain.length < 3) continue;
      domainCounts[domain] = (domainCounts[domain] || 0) + 1;
    }
  }

  const sortedDomains = Object.entries(domainCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const top8 = sortedDomains.slice(0, 8);

  // Collect all source URLs keyed by domain for brand check
  const domainUrls: Record<string, string[]> = {};
  for (const result of results.results) {
    for (const source of result.sources) {
      if (!source.url) continue;
      const domain = extractDomain(source.url);
      if (!domainUrls[domain]) domainUrls[domain] = [];
      domainUrls[domain].push(source.url);
    }
  }

  // Source gap table rows
  const gapRows = top8.map(([domain, count], i) => {
    const urls = domainUrls[domain] || [];
    const featured = urls.some((u) =>
      u.toLowerCase().includes(brandName.toLowerCase().split(' ')[0])
    );
    const priority = getPriority(count, featured);
    return { rank: i + 1, domain, count, featured, priority };
  });

  // Pie: brand-owned vs third-party vs competitor-adjacent
  const competitorNames = Object.keys(results.summary.competitorVisibility);
  let brandOwned = 0;
  let competitorAdjacent = 0;
  let thirdParty = 0;

  for (const result of results.results) {
    for (const source of result.sources) {
      if (!source.url) continue;
      const urlLower = source.url.toLowerCase();
      const domainStr = extractDomain(source.url).toLowerCase();
      const brandWord = brandName.toLowerCase().split(' ')[0];

      if (domainStr.includes(brandWord) || urlLower.includes(brandWord)) {
        brandOwned++;
      } else if (
        competitorNames.some((c) => domainStr.includes(c.toLowerCase().split(' ')[0]))
      ) {
        competitorAdjacent++;
      } else {
        thirdParty++;
      }
    }
  }

  const pieData = [
    { name: 'Brand-Owned', value: brandOwned, color: C.teal },
    { name: 'Third-Party', value: thirdParty, color: C.primary },
    { name: 'Competitor-Adjacent', value: competitorAdjacent, color: C.orange },
  ].filter((d) => d.value > 0);

  const topDomain = top8[0]?.[0] || 'unknown';
  const topDomainCount = top8[0]?.[1] || 0;
  const topDomainFeatured = gapRows[0]?.featured ?? false;

  const barData = top8.map(([domain, count]) => ({
    domain: domain.length > 22 ? domain.slice(0, 20) + '…' : domain,
    fullDomain: domain,
    count,
  }));

  return (
    <div data-pdf-page style={pageStyle}>
      {/* Section Header */}
      <div
        style={{
          borderLeft: '4px solid #14b8a6',
          background: 'linear-gradient(90deg, rgba(20,184,166,0.08) 0%, transparent 100%)',
          borderRadius: '0 8px 8px 0',
          padding: '16px 20px',
          marginBottom: 24,
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 3,
            color: '#14b8a6',
            textTransform: 'uppercase' as const,
            marginBottom: 4,
          }}
        >
          Section 9–10
        </div>
        <div style={{ fontSize: 24, fontWeight: 700, color: C.text, marginBottom: 4 }}>
          Source &amp; Citation Analysis + Outreach Targets
        </div>
        <div style={{ fontSize: 13, color: C.muted }}>
          Where AI models source their information about your category
        </div>
      </div>

      {/* Two-column: bar chart + pie */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 24 }}>
        {/* Left: horizontal bar chart */}
        <div
          style={{
            flex: '0 0 50%',
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            padding: '18px 16px',
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 2,
              color: C.muted,
              textTransform: 'uppercase' as const,
              marginBottom: 12,
            }}
          >
            Top 8 Cited Domains
          </div>
          {top8.length === 0 ? (
            <div style={{ color: C.faint, fontSize: 13 }}>No source data available.</div>
          ) : (
            <BarChart
              width={335}
              height={260}
              data={barData}
              layout="vertical"
              margin={{ top: 4, right: 24, bottom: 4, left: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false} />
              <XAxis type="number" tick={{ fill: C.muted, fontSize: 10 }} allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="domain"
                tick={{ fill: C.muted, fontSize: 10 }}
                width={110}
              />
              <Tooltip
                contentStyle={{
                  background: C.card,
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                }}
                labelFormatter={(_: unknown, payload: any[]) =>
                  payload[0]?.payload?.fullDomain || ''
                }
                labelStyle={{ color: C.text }}
                itemStyle={{ color: C.teal }}
                formatter={(value: number) => [value, 'Citations']}
              />
              <Bar dataKey="count" fill={C.teal} radius={[0, 4, 4, 0]} />
            </BarChart>
          )}
        </div>

        {/* Right: pie chart */}
        <div
          style={{
            flex: '0 0 calc(50% - 20px)',
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            padding: '18px 16px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 2,
              color: C.muted,
              textTransform: 'uppercase' as const,
              marginBottom: 12,
            }}
          >
            Source Type Breakdown
          </div>
          {pieData.length === 0 ? (
            <div style={{ color: C.faint, fontSize: 13 }}>No source data available.</div>
          ) : (
            <PieChart width={295} height={240}>
              <Pie
                data={pieData}
                cx={140}
                cy={105}
                innerRadius={55}
                outerRadius={90}
                dataKey="value"
                paddingAngle={3}
              >
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: C.card,
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                }}
                itemStyle={{ color: C.text }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(value: string) => (
                  <span style={{ color: C.muted, fontSize: 11 }}>{value}</span>
                )}
              />
            </PieChart>
          )}
        </div>
      </div>

      {/* Source gap table */}
      <div
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          overflow: 'hidden',
          marginBottom: 20,
        }}
      >
        {/* Table header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '44px 1fr 90px 140px 110px',
            background: C.cardAlt,
            borderBottom: `1px solid ${C.border}`,
            padding: '10px 16px',
            gap: 8,
          }}
        >
          {['Rank', 'Domain', 'AI Citations', `${brandName} Featured?`, 'Action Priority'].map(
            (h) => (
              <div
                key={h}
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: 1.5,
                  color: C.muted,
                  textTransform: 'uppercase' as const,
                }}
              >
                {h}
              </div>
            )
          )}
        </div>

        {/* Table rows */}
        {gapRows.map((row, i) => (
          <div
            key={row.domain}
            style={{
              display: 'grid',
              gridTemplateColumns: '44px 1fr 90px 140px 110px',
              padding: '11px 16px',
              gap: 8,
              borderBottom: i < gapRows.length - 1 ? `1px solid ${C.border}` : 'none',
              background: i % 2 === 0 ? 'transparent' : `${C.cardAlt}60`,
              alignItems: 'center',
            }}
          >
            <div style={{ fontSize: 12, color: C.faint, fontWeight: 700 }}>#{row.rank}</div>
            <div
              style={{
                fontSize: 12,
                color: C.text,
                fontFamily: 'monospace',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {row.domain}
            </div>
            <div style={{ fontSize: 12, color: C.teal, fontWeight: 700 }}>{row.count}</div>
            <div>
              <span
                style={{
                  padding: '2px 10px',
                  borderRadius: 12,
                  fontSize: 10,
                  fontWeight: 700,
                  background: row.featured ? `${C.green}20` : `${C.red}20`,
                  color: row.featured ? C.green : C.red,
                  border: `1px solid ${row.featured ? C.green : C.red}40`,
                }}
              >
                {row.featured ? 'Yes' : 'No — Outreach Needed'}
              </span>
            </div>
            <div>
              <span
                style={{
                  padding: '2px 10px',
                  borderRadius: 12,
                  fontSize: 10,
                  fontWeight: 700,
                  background: `${getPriorityColor(row.priority)}20`,
                  color: getPriorityColor(row.priority),
                  border: `1px solid ${getPriorityColor(row.priority)}40`,
                }}
              >
                {row.priority}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Insight */}
      <div
        style={{
          background: `rgba(20,184,166,0.06)`,
          border: `1px solid rgba(20,184,166,0.2)`,
          borderRadius: 10,
          padding: '16px 20px',
        }}
      >
        <div style={{ fontSize: 13, color: C.text, lineHeight: 1.7 }}>
          <strong style={{ color: C.teal }}>Insight:</strong> AI models cited{' '}
          <strong>{topDomain}</strong> {topDomainCount} time
          {topDomainCount !== 1 ? 's' : ''}.{' '}
          {!topDomainFeatured ? (
            <>
              <strong>{brandName}</strong> is not currently featured there. Getting listed would
              add {topDomainCount}+ citation
              {topDomainCount !== 1 ? 's' : ''} per analysis cycle, directly boosting GEO
              visibility.
            </>
          ) : (
            <>
              <strong>{brandName}</strong> is already present on this domain — monitor for
              content freshness and citation quality.
            </>
          )}
        </div>
      </div>
    </div>
  );
}
