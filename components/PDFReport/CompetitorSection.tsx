'use client';

import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import type { RunResults } from '@/lib/types';

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
  primary: '#3b82f6',
  red: '#ef4444',
  redGlow: 'rgba(239,68,68,0.15)',
  green: '#10b981',
  amber: '#f59e0b',
  orange: '#f97316',
  yellow: '#eab308',
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

function PriorityBadge({ count }: { count: number }) {
  let label: string;
  let color: string;
  let bg: string;

  if (count >= 3) {
    label = 'CRITICAL';
    color = C.red;
    bg = 'rgba(239,68,68,0.15)';
  } else if (count === 2) {
    label = 'HIGH';
    color = C.orange;
    bg = 'rgba(249,115,22,0.15)';
  } else {
    label = 'MEDIUM';
    color = C.yellow;
    bg = 'rgba(234,179,8,0.15)';
  }

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '3px 8px',
      borderRadius: 10,
      background: bg,
      border: `1px solid ${color}40`,
      fontSize: 8,
      fontWeight: 800,
      color,
      letterSpacing: 1,
      whiteSpace: 'nowrap',
    }}>
      {label}
    </div>
  );
}

export function CompetitorSection({ results, brandName }: SectionProps) {
  const { results: queryResults } = results;

  // Count competitor mentions
  const competitorCounts: Record<string, number> = {};
  queryResults.forEach((r) => {
    r.otherBrandsDetected.forEach((brand) => {
      competitorCounts[brand] = (competitorCounts[brand] || 0) + 1;
    });
  });

  const brandMentions = queryResults.filter((r) => r.brandMentioned).length;
  const totalCompetitorMentions = Object.values(competitorCounts).reduce((a, b) => a + b, 0);
  const totalVoice = brandMentions + totalCompetitorMentions;
  const brandShare = totalVoice > 0 ? Math.round((brandMentions / totalVoice) * 100) : 0;

  // Top 8 competitors sorted by count
  const sortedCompetitors = Object.entries(competitorCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);

  // Donut data
  const donutData = [
    { name: brandName, value: brandMentions },
    { name: 'All Competitors', value: totalCompetitorMentions },
  ];

  // Bar chart data: brand (blue) + top competitors (orange)
  const barData = [
    { name: truncate(brandName, 14), count: brandMentions, pct: brandShare, isBrand: true },
    ...sortedCompetitors.map(([name, count]) => ({
      name: truncate(name, 14),
      count,
      pct: totalVoice > 0 ? Math.round((count / totalVoice) * 100) : 0,
      isBrand: false,
    })),
  ].sort((a, b) => b.count - a.count);

  // Displacement table: !brandMentioned AND competitors appeared
  const displacementRows = queryResults
    .filter((r) => !r.brandMentioned && r.otherBrandsDetected.length > 0)
    .sort((a, b) => b.otherBrandsDetected.length - a.otherBrandsDetected.length)
    .slice(0, 8);

  // Insight: who appeared most in displacement queries
  const displacementCounts: Record<string, number> = {};
  queryResults
    .filter((r) => !r.brandMentioned)
    .forEach((r) => {
      r.otherBrandsDetected.forEach((brand) => {
        displacementCounts[brand] = (displacementCounts[brand] || 0) + 1;
      });
    });
  const topDisplacer = Object.entries(displacementCounts).sort(([, a], [, b]) => b - a)[0];
  const displacementTotal = displacementRows.length;
  const totalAbsent = queryResults.filter((r) => !r.brandMentioned).length;

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
        number="Section 5–6"
        title="Competitive Share of Voice & Displacement Analysis"
        subtitle={`${brandName} · Who owns the AI conversation in your category`}
        color={C.red}
      />

      {/* Row 1: Donut + Bar */}
      <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
        {/* Left: Share of Voice Donut */}
        <div style={{
          flex: '0 0 auto',
          width: 260,
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          padding: '18px',
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14 }}>
            Share of Voice
          </div>
          <div style={{ position: 'relative', width: 160, height: 160, margin: '0 auto 12px' }}>
            <PieChart width={160} height={160}>
              <Pie
                data={donutData}
                cx={75}
                cy={75}
                innerRadius={50}
                outerRadius={70}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
                strokeWidth={0}
              >
                <Cell fill={C.primary} />
                <Cell fill={C.red} />
              </Pie>
            </PieChart>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: C.primary }}>{brandShare}%</div>
              <div style={{ fontSize: 8, color: C.muted, fontWeight: 600, letterSpacing: 1 }}>Brand Share</div>
            </div>
          </div>

          {/* Legend */}
          {[
            { color: C.primary, label: brandName, value: brandMentions },
            { color: C.red, label: 'All Competitors', value: totalCompetitorMentions },
          ].map((l) => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: l.color, flexShrink: 0 }} />
              <div style={{ fontSize: 11, color: C.muted, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.label}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.text }}>{l.value}</div>
            </div>
          ))}
        </div>

        {/* Right: Competitor ranking bar chart */}
        <div style={{
          flex: 1,
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          padding: '18px',
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14 }}>
            Brand vs Competitors — Mention Count
          </div>
          <BarChart
            width={420}
            height={180}
            data={barData}
            layout="vertical"
            margin={{ top: 0, right: 50, left: 0, bottom: 0 }}
          >
            <XAxis type="number" tick={{ fill: C.faint, fontSize: 9 }} axisLine={false} tickLine={false} />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: C.muted, fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={90}
            />
            <Tooltip
              contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 11 }}
              formatter={(v: number, _name: string, props: { payload?: { pct?: number } }) => [
                `${v} mentions (${props?.payload?.pct ?? 0}%)`,
                'Count',
              ]}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={14}>
              {barData.map((entry, i) => (
                <Cell key={i} fill={entry.isBrand ? C.primary : C.orange} />
              ))}
            </Bar>
          </BarChart>
          <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: C.primary }} />
              <span style={{ fontSize: 9, color: C.muted }}>{brandName} (your brand)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: C.orange }} />
              <span style={{ fontSize: 9, color: C.muted }}>Competitors</span>
            </div>
          </div>
        </div>
      </div>

      {/* Displacement Table */}
      {displacementRows.length > 0 && (
        <div style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          overflow: 'hidden',
          marginBottom: 16,
        }}>
          <div style={{
            padding: '14px 18px',
            borderBottom: `1px solid ${C.border}`,
            background: C.redGlow,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.red, letterSpacing: 1 }}>
              Direct Displacement — Queries Where Competitors Appeared Without You
            </div>
          </div>

          {/* Table header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 220px 80px',
            padding: '8px 18px',
            background: `${C.cardAlt}`,
            borderBottom: `1px solid ${C.border}`,
          }}>
            {['Query', 'Competitors Who Appeared', 'Priority'].map((h) => (
              <div key={h} style={{ fontSize: 9, fontWeight: 700, color: C.muted, letterSpacing: 1, textTransform: 'uppercase' }}>
                {h}
              </div>
            ))}
          </div>

          {/* Rows */}
          {displacementRows.map((row, i) => (
            <div
              key={i}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 220px 80px',
                padding: '8px 18px',
                borderBottom: i < displacementRows.length - 1 ? `1px solid ${C.border}22` : 'none',
                alignItems: 'center',
                background: i % 2 === 1 ? `${C.cardAlt}50` : 'transparent',
              }}
            >
              <div style={{ fontSize: 10, color: C.muted, paddingRight: 12 }}>
                {truncate(row.question, 60)}
              </div>
              <div style={{ fontSize: 10, color: C.text }}>
                {row.otherBrandsDetected.slice(0, 3).join(', ')}
                {row.otherBrandsDetected.length > 3 && (
                  <span style={{ color: C.faint }}> +{row.otherBrandsDetected.length - 3} more</span>
                )}
              </div>
              <div>
                <PriorityBadge count={row.otherBrandsDetected.length} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Insight */}
      <div style={{
        background: C.cardAlt,
        border: `1px solid ${C.border}`,
        borderLeft: `4px solid ${C.red}`,
        borderRadius: '0 10px 10px 0',
        padding: '14px 18px',
      }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.red, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>
          Competitive Displacement Insight
        </div>
        <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.7 }}>
          {topDisplacer
            ? <>
                <strong style={{ color: C.text }}>{topDisplacer[0]}</strong> appeared in{' '}
                <strong style={{ color: C.red }}>{topDisplacer[1]}</strong> of {totalAbsent} queries where{' '}
                <strong style={{ color: C.text }}>{brandName}</strong> was absent — the highest displacement count of any competitor.{' '}
              </>
            : null}
          {brandShare < 30
            ? `${brandName} holds only ${brandShare}% share of voice, significantly below competitive parity. A systematic content authority campaign targeting high-displacement queries is the highest-leverage action.`
            : brandShare < 60
            ? `${brandName} holds ${brandShare}% share of voice — a competitive position, but with ${100 - brandShare}% still owned by competitors. Focus on the ${displacementTotal} directly displaced queries identified above.`
            : `${brandName} leads with ${brandShare}% share of voice. Defending this position requires ongoing content refresh and monitoring for emerging competitors.`}
        </div>
      </div>
    </div>
  );
}
