'use client';

import { PieChart, Pie, Cell } from 'recharts';
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
  green: '#10b981',
  amber: '#f59e0b',
  red: '#ef4444',
  purple: '#8b5cf6',
  teal: '#14b8a6',
};

function getScoreColor(score: number): string {
  if (score >= 70) return C.green;
  if (score >= 40) return C.amber;
  return C.red;
}

function getScoreBand(score: number): string {
  if (score >= 70) return 'Strong Visibility — Above 70% industry median';
  if (score >= 40) return 'Moderate Visibility — Below 40% industry median';
  return 'Low Visibility — Significant content gap identified';
}

function getScoreLabel(score: number): string {
  if (score >= 70) return 'STRONG';
  if (score >= 40) return 'MODERATE';
  return 'LOW';
}

export function CoverPage({ results, brandName, market, lang }: SectionProps) {
  const { summary } = results;
  const score = Math.round(summary.overallVisibility);
  const scoreColor = getScoreColor(score);
  const scoreBand = getScoreBand(score);
  const providerCount = Object.keys(summary.providerVisibility).length;
  const date = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const donutData = [
    { name: 'Score', value: score },
    { name: 'Remaining', value: 100 - score },
  ];

  return (
    <div
      data-pdf-page
      style={{
        width: '794px',
        minHeight: '1122px',
        background: C.bg,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        padding: 0,
        boxSizing: 'border-box',
        color: C.text,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle geometric SVG pattern background */}
      <svg
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.04 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#3b82f6" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Radial glow top-right */}
      <div style={{
        position: 'absolute',
        top: -120,
        right: -120,
        width: 400,
        height: 400,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Top gradient bar */}
      <div style={{
        width: '100%',
        height: 6,
        background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #14b8a6 100%)',
      }} />

      <div style={{ padding: '36px 48px', position: 'relative', zIndex: 1 }}>
        {/* Logo area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 80 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="8" stroke="white" strokeWidth="1.5" />
              <circle cx="10" cy="10" r="3" fill="white" />
              <line x1="10" y1="2" x2="10" y2="5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="10" y1="15" x2="10" y2="18" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="2" y1="10" x2="5" y2="10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="15" y1="10" x2="18" y2="10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 3, color: C.primary, textTransform: 'uppercase' }}>
              GEO RAYDAR
            </div>
            <div style={{ fontSize: 10, color: C.muted, letterSpacing: 1 }}>
              Visibility Intelligence Platform
            </div>
          </div>
        </div>

        {/* Main title block */}
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{
            display: 'inline-block',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 4,
            color: C.muted,
            textTransform: 'uppercase',
            marginBottom: 16,
            padding: '6px 14px',
            border: `1px solid ${C.border}`,
            borderRadius: 20,
          }}>
            Generative Engine Optimization Analysis
          </div>
          <div style={{ fontSize: 48, fontWeight: 900, color: C.text, lineHeight: 1.1, marginBottom: 12, letterSpacing: -1 }}>
            GEO VISIBILITY
          </div>
          <div style={{ fontSize: 48, fontWeight: 900, color: C.text, lineHeight: 1.1, marginBottom: 24, letterSpacing: -1 }}>
            REPORT
          </div>
          <div style={{ fontSize: 30, fontWeight: 700, color: C.primary, marginBottom: 8 }}>
            {brandName}
          </div>
        </div>

        {/* Divider */}
        <div style={{
          height: 1,
          background: `linear-gradient(90deg, transparent 0%, ${C.border} 20%, ${C.border} 80%, transparent 100%)`,
          margin: '28px 0',
        }} />

        {/* Score ring + band */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 48, marginBottom: 32 }}>
          {/* Donut chart */}
          <div style={{ position: 'relative', width: 160, height: 160 }}>
            <PieChart width={160} height={160}>
              <Pie
                data={donutData}
                cx={75}
                cy={75}
                innerRadius={52}
                outerRadius={72}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
                strokeWidth={0}
              >
                <Cell fill={scoreColor} />
                <Cell fill={C.border} />
              </Pie>
            </PieChart>
            {/* Score overlay */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              lineHeight: 1,
            }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: scoreColor }}>{score}%</div>
              <div style={{ fontSize: 8, color: C.muted, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 }}>
                GEO Score
              </div>
            </div>
          </div>

          <div style={{ maxWidth: 340 }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              borderRadius: 20,
              background: `${scoreColor}18`,
              border: `1px solid ${scoreColor}40`,
              marginBottom: 12,
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: scoreColor }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: scoreColor, letterSpacing: 1 }}>
                {getScoreLabel(score)}
              </span>
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 8 }}>
              {scoreBand}
            </div>
            <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
              {score < 40
                ? `${brandName} appears in fewer than ${score}% of AI-generated answers. Significant content gaps and citation opportunities remain untapped.`
                : score < 70
                ? `${brandName} has moderate presence in AI answers. Targeted content authority efforts can push visibility above the 70% threshold.`
                : `${brandName} has strong AI visibility. Focus on maintaining quality and expanding into adjacent topic clusters.`}
            </div>
          </div>
        </div>

        {/* Metadata pills grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16,
          marginBottom: 40,
        }}>
          {[
            { label: 'Queries Analyzed', value: summary.totalQueries.toString() },
            { label: 'Providers Tested', value: providerCount.toString() },
            { label: 'Market', value: market || 'Global' },
            { label: 'Language', value: lang ? lang.toUpperCase() : 'EN' },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                padding: '18px 16px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 4 }}>
                {item.value}
              </div>
              <div style={{ fontSize: 10, color: C.muted, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>

        {/* Horizontal provider snapshot */}
        <div style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          padding: '20px 24px',
          marginBottom: 40,
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: C.muted, textTransform: 'uppercase', marginBottom: 14 }}>
            Provider Visibility Snapshot
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {Object.entries(summary.providerVisibility).map(([provider, vis]) => {
              const pct = Math.round(vis);
              const col = getScoreColor(pct);
              return (
                <div key={provider} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: '1 1 140px' }}>
                  <div style={{ fontSize: 11, color: C.muted, textTransform: 'capitalize', minWidth: 80 }}>{provider}</div>
                  <div style={{ flex: 1, height: 6, background: C.border, borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: col, borderRadius: 3 }} />
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: col, minWidth: 36, textAlign: 'right' }}>{pct}%</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '16px 48px',
        borderTop: `1px solid ${C.border}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: `${C.card}80`,
      }}>
        <div style={{ fontSize: 10, color: C.faint }}>
          Prepared by GEO Raydar · {date}
        </div>
        <div style={{ fontSize: 10, color: C.faint }}>
          CONFIDENTIAL — FOR INTERNAL USE ONLY
        </div>
      </div>
    </div>
  );
}
