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
  faint: '#475569',
  primary: '#3b82f6',
  primaryGlow: 'rgba(59,130,246,0.15)',
  green: '#10b981',
  greenGlow: 'rgba(16,185,129,0.15)',
  amber: '#f59e0b',
  amberGlow: 'rgba(245,158,11,0.15)',
  red: '#ef4444',
  redGlow: 'rgba(239,68,68,0.15)',
};

function getScoreColor(score: number): string {
  if (score >= 70) return C.green;
  if (score >= 40) return C.amber;
  return C.red;
}

function getScoreGlow(score: number): string {
  if (score >= 70) return C.greenGlow;
  if (score >= 40) return C.amberGlow;
  return C.redGlow;
}

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

function MetricCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  return (
    <div style={{
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: 10,
      padding: '16px 14px',
      textAlign: 'center',
      flex: 1,
    }}>
      <div style={{ fontSize: 26, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 10, color: C.muted, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 10, color: C.faint, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

export function VisibilitySection({ results, brandName }: SectionProps) {
  const { summary, results: queryResults } = results;

  const score = Math.round(summary.overallVisibility);
  const scoreColor = getScoreColor(score);
  const scoreGlow = getScoreGlow(score);

  // Donut data
  const mentioned = queryResults.filter((r) => r.brandMentioned).length;
  const notMentioned = queryResults.filter((r) => !r.brandMentioned && r.presence !== null && r.presence !== undefined).length;
  const na = queryResults.filter((r) => r.presence === null || r.presence === undefined).length;
  const donutData = [
    { name: 'Mentioned', value: mentioned },
    { name: 'Not Mentioned', value: notMentioned },
    { name: 'N/A', value: na > 0 ? na : undefined },
  ].filter((d) => d.value !== undefined && (d.value as number) > 0);
  const donutColors = [C.green, C.red, C.faint];

  // Provider bar chart
  const providerData = Object.entries(summary.providerVisibility).map(([provider, vis]) => ({
    provider: provider.charAt(0).toUpperCase() + provider.slice(1),
    pct: Math.round(vis),
  }));

  // Insight generation
  const sorted = [...providerData].sort((a, b) => b.pct - a.pct);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];
  const gap = best && worst ? best.pct - worst.pct : 0;
  const multiplier = worst && worst.pct > 0 ? (best.pct / worst.pct).toFixed(1) : 'N/A';

  const avgSentiment =
    summary.avgSentiment != null
      ? Math.round(((summary.avgSentiment + 1) / 2) * 100)
      : null;
  const avgTrust =
    summary.avgTrustAuthority != null
      ? Math.round(summary.avgTrustAuthority * 100)
      : null;

  const scoreBandLabel =
    score >= 70 ? 'Strong Visibility' : score >= 40 ? 'Moderate Visibility' : 'Low Visibility';
  const scoreBandDesc =
    score >= 70
      ? `${brandName} is well-represented in AI-generated answers. Maintain content freshness and expand topic coverage to preserve this position.`
      : score >= 40
      ? `${brandName} has moderate AI presence. With targeted content investment and citation building, scores above 70% are achievable within 2–3 months.`
      : `${brandName} has minimal AI visibility. Foundational GEO content creation, structured data implementation, and authority link-building are critical priority items.`;

  const insightText =
    best && worst
      ? `${best.provider} is the strongest-performing provider at ${best.pct}%, while ${worst.provider} shows only ${worst.pct}%${gap > 0 ? ` — a ${gap}-point gap` : ''}${worst.pct > 0 ? ` (${multiplier}× difference)` : ''}. This disparity indicates model-specific training data differences; publishing in formats and sources favored by ${worst.provider} can close this gap significantly.`
      : `Provider-level data is insufficient for gap analysis. Ensure all provider queries are completing successfully before re-running.`;

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
        number="Section 1"
        title="GEO Visibility Score & Analysis"
        subtitle={`${brandName} · AI Presence Across All Providers`}
        color={C.primary}
      />

      {/* Row 1: Donut + Provider Bar */}
      <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
        {/* Left: Donut */}
        <div style={{
          flex: 1,
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          padding: '20px',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>
            Overall Mention Rate
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ position: 'relative', width: 140, height: 140 }}>
              <PieChart width={140} height={140}>
                <Pie
                  data={donutData}
                  cx={65}
                  cy={65}
                  innerRadius={44}
                  outerRadius={62}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {donutData.map((_, i) => (
                    <Cell key={i} fill={donutColors[i]} />
                  ))}
                </Pie>
              </PieChart>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: scoreColor }}>{score}%</div>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              {[
                { label: 'Mentioned', value: mentioned, color: C.green },
                { label: 'Not Mentioned', value: notMentioned, color: C.red },
                ...(na > 0 ? [{ label: 'N/A', value: na, color: C.faint }] : []),
              ].map((item) => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: item.color, flexShrink: 0 }} />
                  <div style={{ fontSize: 12, color: C.muted, flex: 1 }}>{item.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{item.value}</div>
                </div>
              ))}
              <div style={{ marginTop: 12, fontSize: 11, color: C.muted, lineHeight: 1.5 }}>
                {mentioned} of {queryResults.length} responses mentioned <span style={{ color: C.text, fontWeight: 600 }}>{brandName}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Provider bar chart */}
        <div style={{
          flex: 1,
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          padding: '20px',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>
            Visibility by Provider
          </div>
          <BarChart
            width={300}
            height={160}
            data={providerData}
            layout="vertical"
            margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
          >
            <XAxis type="number" domain={[0, 100]} tick={{ fill: C.faint, fontSize: 9 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="provider" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} width={72} />
            <Tooltip
              contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 11 }}
              formatter={(v: number) => [`${v}%`, 'Visibility']}
            />
            <Bar dataKey="pct" radius={[0, 4, 4, 0]} barSize={16}>
              {providerData.map((entry, i) => (
                <Cell key={i} fill={getScoreColor(entry.pct)} />
              ))}
            </Bar>
          </BarChart>
        </div>
      </div>

      {/* Score interpretation card */}
      <div style={{
        background: `${scoreGlow}`,
        border: `1px solid ${scoreColor}30`,
        borderLeft: `4px solid ${scoreColor}`,
        borderRadius: '0 10px 10px 0',
        padding: '16px 20px',
        marginBottom: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: scoreColor }}>{score}%</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{scoreBandLabel}</div>
        </div>
        <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{scoreBandDesc}</div>
      </div>

      {/* Auto-generated insight box */}
      <div style={{
        background: C.cardAlt,
        border: `1px solid ${C.border}`,
        borderRadius: 10,
        padding: '16px 20px',
        marginBottom: 24,
      }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.primary, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>
          AI Analyst Insight
        </div>
        <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.7 }}>{insightText}</div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 14 }}>
        <MetricCard label="Mentioned" value={mentioned.toString()} sub={`of ${queryResults.length} total`} color={C.green} />
        <MetricCard label="Not Mentioned" value={notMentioned.toString()} sub={`of ${queryResults.length} total`} color={C.red} />
        <MetricCard
          label="Avg Sentiment"
          value={avgSentiment !== null ? `${avgSentiment}%` : 'N/A'}
          sub="normalised 0–100"
          color={avgSentiment !== null ? getScoreColor(avgSentiment) : C.faint}
        />
        <MetricCard
          label="Avg Trust Auth."
          value={avgTrust !== null ? `${avgTrust}%` : 'N/A'}
          sub="source authority"
          color={avgTrust !== null ? getScoreColor(avgTrust) : C.faint}
        />
      </div>
    </div>
  );
}
