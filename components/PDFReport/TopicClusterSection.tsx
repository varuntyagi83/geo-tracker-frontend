'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
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
  faint: '#475569',
  orange: '#f97316',
  orangeGlow: 'rgba(249,115,22,0.15)',
  green: '#10b981',
  amber: '#f59e0b',
  red: '#ef4444',
  primary: '#3b82f6',
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

function classifyQuestion(question: string, category?: string): string {
  if (category && category.trim()) return category.trim();
  const q = question.toLowerCase();
  if (/omega|fish oil|omega-3/.test(q)) return 'Omega-3';
  if (/vitamin d3?|vit\.? d/.test(q)) return 'Vitamin D';
  if (/probio|darm/.test(q)) return 'Probiotics';
  if (/magnes/.test(q)) return 'Magnesium';
  if (/zinc|zink/.test(q)) return 'Zinc';
  if (/multivit|multi/.test(q)) return 'Multivitamin';
  if (/preis|kaufen|bestellen|buy|price|order/.test(q)) return 'Purchase Intent';
  return 'General';
}

function getClusterColor(pct: number): string {
  if (pct >= 50) return C.green;
  if (pct >= 25) return C.amber;
  return C.red;
}

function getClusterBadge(pct: number): { label: string; color: string; bg: string } {
  if (pct >= 50) return { label: 'STRONG', color: C.green, bg: 'rgba(16,185,129,0.15)' };
  if (pct >= 25) return { label: 'WEAK', color: C.amber, bg: 'rgba(245,158,11,0.15)' };
  return { label: 'MISSING', color: C.red, bg: 'rgba(239,68,68,0.15)' };
}

export function TopicClusterSection({ results, brandName }: SectionProps) {
  const { results: queryResults } = results;

  // Group by cluster
  const clusterMap = new Map<string, { total: number; mentioned: number }>();
  queryResults.forEach((r) => {
    const cluster = classifyQuestion(r.question, r.category);
    if (!clusterMap.has(cluster)) clusterMap.set(cluster, { total: 0, mentioned: 0 });
    const entry = clusterMap.get(cluster)!;
    entry.total++;
    if (r.brandMentioned) entry.mentioned++;
  });

  const clusters = Array.from(clusterMap.entries()).map(([name, { total, mentioned }]) => ({
    name,
    total,
    mentioned,
    pct: total > 0 ? Math.round((mentioned / total) * 100) : 0,
  })).sort((a, b) => b.pct - a.pct);

  const best = clusters[0];
  const worst = clusters[clusters.length - 1];

  const chartData = clusters.map((c) => ({ name: c.name, pct: c.pct }));

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
        number="Section 4"
        title="Topic Cluster Performance"
        subtitle={`${brandName} · Visibility score broken down by content category`}
        color={C.orange}
      />

      {/* Bar chart */}
      <div style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: '20px',
        marginBottom: 24,
      }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>
          Visibility by Topic Cluster (%)
        </div>
        <BarChart
          width={700}
          height={220}
          data={chartData}
          margin={{ top: 0, right: 16, left: 0, bottom: 40 }}
        >
          <XAxis
            dataKey="name"
            tick={{ fill: C.muted, fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            angle={-25}
            textAnchor="end"
            interval={0}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: C.faint, fontSize: 9 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 11 }}
            formatter={(v: number) => [`${v}%`, 'Brand Visibility']}
          />
          <Bar dataKey="pct" radius={[4, 4, 0, 0]} barSize={40}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={getClusterColor(entry.pct)} />
            ))}
          </Bar>
        </BarChart>

        {/* Color legend */}
        <div style={{ display: 'flex', gap: 20, marginTop: 8, justifyContent: 'center' }}>
          {[
            { color: C.green, label: '>50% — Strong' },
            { color: C.amber, label: '25–50% — Weak' },
            { color: C.red, label: '<25% — Missing' },
          ].map((l) => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: 2, background: l.color }} />
              <span style={{ fontSize: 10, color: C.muted }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Cluster cards grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 14,
        marginBottom: 24,
      }}>
        {clusters.map((cluster) => {
          const badge = getClusterBadge(cluster.pct);
          return (
            <div
              key={cluster.name}
              style={{
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
              }}
            >
              {/* Score circle */}
              <div style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: `${getClusterColor(cluster.pct)}15`,
                border: `2px solid ${getClusterColor(cluster.pct)}40`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: getClusterColor(cluster.pct) }}>
                  {cluster.pct}%
                </div>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{cluster.name}</div>
                  <div style={{
                    padding: '2px 8px',
                    borderRadius: 10,
                    background: badge.bg,
                    border: `1px solid ${badge.color}30`,
                    fontSize: 8,
                    fontWeight: 800,
                    color: badge.color,
                    letterSpacing: 1,
                  }}>
                    {badge.label}
                  </div>
                </div>
                <div style={{ fontSize: 10, color: C.muted }}>
                  {cluster.mentioned} of {cluster.total} queries · {cluster.pct}% visibility
                </div>
                {/* Mini progress bar */}
                <div style={{ width: '100%', height: 4, background: C.border, borderRadius: 2, marginTop: 8, overflow: 'hidden' }}>
                  <div style={{
                    width: `${cluster.pct}%`,
                    height: '100%',
                    background: getClusterColor(cluster.pct),
                    borderRadius: 2,
                  }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Insight */}
      <div style={{
        background: C.cardAlt,
        border: `1px solid ${C.border}`,
        borderLeft: `4px solid ${C.orange}`,
        borderRadius: '0 10px 10px 0',
        padding: '14px 18px',
      }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.orange, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>
          Cluster Performance Insight
        </div>
        <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.7 }}>
          {brandName} performs strongest in{' '}
          <strong style={{ color: C.green }}>{best?.name || '—'}</strong>{' '}
          ({best?.pct ?? 0}%) but is{' '}
          {(worst?.pct ?? 0) === 0 ? 'completely invisible' : 'underperforming'} in{' '}
          <strong style={{ color: C.red }}>{worst?.name || '—'}</strong>{' '}
          ({worst?.pct ?? 0}%).{' '}
          {worst && worst.pct < 25
            ? `The "${worst.name}" cluster represents a high-priority content gap — publishing dedicated, authoritative content targeting these queries can rapidly improve AI citation rates.`
            : `Continue building on existing strengths while investing in lower-performing clusters to achieve uniform AI visibility.`}
        </div>
      </div>
    </div>
  );
}
