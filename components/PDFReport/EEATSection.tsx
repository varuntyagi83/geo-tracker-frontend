'use client';

import { RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts';
import type { RunResults } from '@/lib/types';
import type { EEATScore } from '@/lib/eeat';

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
  purple: '#8b5cf6',
  purpleGlow: 'rgba(139,92,246,0.15)',
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

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div style={{ width: '100%', height: 6, background: C.border, borderRadius: 3, overflow: 'hidden' }}>
      <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: 3 }} />
    </div>
  );
}

function DimensionCard({ label, score, color, insight }: { label: string; score: number; color: string; insight: string }) {
  const initial = label.charAt(0);
  return (
    <div style={{
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      padding: '18px 16px',
      borderTop: `3px solid ${color}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: `${color}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
          fontWeight: 800,
          color,
        }}>
          {initial}
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{label}</div>
          <div style={{ fontSize: 10, color: C.muted }}>E-E-A-T Dimension</div>
        </div>
        <div style={{ marginLeft: 'auto', fontSize: 26, fontWeight: 900, color }}>{score}</div>
      </div>
      <ProgressBar value={score} color={color} />
      <div style={{ fontSize: 11, color: C.muted, marginTop: 10, lineHeight: 1.6 }}>
        {insight.length > 160 ? insight.slice(0, 157) + '…' : insight}
      </div>
    </div>
  );
}

export function EEATSection({ results, brandName, eeat }: SectionProps & { eeat: EEATScore }) {
  const overall = eeat.overall;
  const overallColor = overall >= 70 ? C.green : overall >= 40 ? C.amber : C.red;
  const overallBand =
    overall >= 70
      ? 'Strong E-E-A-T Profile'
      : overall >= 40
      ? 'Developing E-E-A-T Profile'
      : 'Weak E-E-A-T Profile';

  const dims = [
    eeat.experience,
    eeat.expertise,
    eeat.authoritativeness,
    eeat.trustworthiness,
  ];

  const strongest = [...dims].sort((a, b) => b.score - a.score)[0];
  const weakest = [...dims].sort((a, b) => a.score - b.score)[0];

  const radarData = dims.map((d) => ({ subject: d.label, score: d.score, fullMark: 100 }));

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
        number="Section 2"
        title="E-E-A-T Score Analysis"
        subtitle={`${brandName} · Experience, Expertise, Authoritativeness & Trustworthiness`}
        color={C.purple}
      />

      {/* Overall score callout */}
      <div style={{
        background: `${C.purpleGlow}`,
        border: `1px solid ${C.purple}30`,
        borderRadius: 12,
        padding: '20px 24px',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        gap: 24,
      }}>
        <div style={{ textAlign: 'center', minWidth: 100 }}>
          <div style={{ fontSize: 52, fontWeight: 900, color: overallColor, lineHeight: 1 }}>{overall}</div>
          <div style={{ fontSize: 9, color: C.muted, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginTop: 4 }}>
            / 100
          </div>
        </div>
        <div style={{ width: 1, height: 60, background: C.border }} />
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: C.text, marginBottom: 4 }}>Overall E-E-A-T Score</div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 12px',
            borderRadius: 20,
            background: `${overallColor}18`,
            border: `1px solid ${overallColor}40`,
            marginBottom: 8,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: overallColor }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: overallColor, letterSpacing: 1 }}>{overallBand}</span>
          </div>
          <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6, maxWidth: 440 }}>
            {brandName}'s composite E-E-A-T score is {overall}/100, aggregated from four AI-signal dimensions. {
              overall >= 70
                ? 'This indicates strong entity authority and positive brand framing across AI systems.'
                : overall >= 40
                ? 'Moderate performance with clear uplift opportunities in authoritativeness and citation depth.'
                : 'Significant investment in content authority, structured data, and citation building is required.'
            }
          </div>
        </div>

        {/* Mini bar overview */}
        <div style={{ marginLeft: 'auto', minWidth: 180 }}>
          {dims.map((d) => (
            <div key={d.label} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontSize: 10, color: C.muted }}>{d.label}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: d.color }}>{d.score}</span>
              </div>
              <ProgressBar value={d.score} color={d.color} />
            </div>
          ))}
        </div>
      </div>

      {/* 4-card grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {dims.map((d) => (
          <DimensionCard
            key={d.label}
            label={d.label}
            score={d.score}
            color={d.color}
            insight={d.insight}
          />
        ))}
      </div>

      {/* Bottom row: Radar + Takeaway */}
      <div style={{ display: 'flex', gap: 20 }}>
        {/* Radar chart */}
        <div style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          padding: '16px',
          flex: '0 0 auto',
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>
            Dimension Radar
          </div>
          <RadarChart width={300} height={240} data={radarData} cx="50%" cy="50%" outerRadius={90}>
            <PolarGrid stroke={C.border} />
            <PolarAngleAxis dataKey="subject" tick={{ fill: C.muted, fontSize: 10 }} />
            <Radar name="Score" dataKey="score" stroke={C.purple} fill={C.purple} fillOpacity={0.25} strokeWidth={2} />
          </RadarChart>
        </div>

        {/* Key takeaway */}
        <div style={{
          flex: 1,
          background: C.cardAlt,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.purple, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>
            Key Takeaway
          </div>
          <div style={{ fontSize: 14, color: C.text, lineHeight: 1.7, marginBottom: 16 }}>
            {brandName}'s E-E-A-T profile shows{' '}
            <span style={{ color: strongest.color, fontWeight: 700 }}>
              {strongest.label}
            </span>{' '}
            as the strongest dimension at{' '}
            <span style={{ color: strongest.color, fontWeight: 700 }}>{strongest.score}/100</span>,
            while{' '}
            <span style={{ color: weakest.color, fontWeight: 700 }}>
              {weakest.label}
            </span>{' '}
            is the primary gap at{' '}
            <span style={{ color: weakest.color, fontWeight: 700 }}>{weakest.score}/100</span>.
          </div>

          <div style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            padding: '12px 14px',
            marginBottom: 12,
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.green, letterSpacing: 1, marginBottom: 4 }}>
              STRENGTH: {strongest.label.toUpperCase()} ({strongest.score}/100)
            </div>
            <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.5 }}>
              {strongest.insight.length > 130 ? strongest.insight.slice(0, 127) + '…' : strongest.insight}
            </div>
          </div>

          <div style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            padding: '12px 14px',
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.red, letterSpacing: 1, marginBottom: 4 }}>
              PRIORITY GAP: {weakest.label.toUpperCase()} ({weakest.score}/100)
            </div>
            <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.5 }}>
              {weakest.insight.length > 130 ? weakest.insight.slice(0, 127) + '…' : weakest.insight}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
