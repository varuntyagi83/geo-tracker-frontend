'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
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

interface SentimentBand {
  label: string;
  min: number;
  max: number;
  color: string;
  shortLabel: string;
}

const BANDS: SentimentBand[] = [
  { label: 'Strong Positive (0.6–1.0)', shortLabel: 'Str+', min: 0.6, max: 1.0, color: '#10b981' },
  { label: 'Positive (0.1–0.6)', shortLabel: 'Pos', min: 0.1, max: 0.6, color: '#34d399' },
  { label: 'Neutral (-0.1–0.1)', shortLabel: 'Neut', min: -0.1, max: 0.1, color: C.amber },
  { label: 'Negative (-0.6– -0.1)', shortLabel: 'Neg', min: -0.6, max: -0.1, color: '#f97316' },
  { label: 'Strong Negative (-1– -0.6)', shortLabel: 'Str–', min: -1.0, max: -0.6, color: C.red },
];

function getSentimentEmoji(score: number): string {
  if (score >= 0.6) return '😊';
  if (score >= 0.1) return '🙂';
  if (score >= -0.1) return '😐';
  if (score >= -0.6) return '😕';
  return '😟';
}

function getSentimentLabel(score: number): string {
  if (score >= 0.6) return 'Strongly Positive';
  if (score >= 0.1) return 'Positive';
  if (score >= -0.1) return 'Neutral';
  if (score >= -0.6) return 'Negative';
  return 'Strongly Negative';
}

function getSentimentDescription(score: number, brandName: string): string {
  if (score >= 0.6)
    return `${brandName} is consistently framed in a highly positive light by AI models. The brand narrative conveys trust, quality, and authority.`;
  if (score >= 0.1)
    return `${brandName} receives generally favourable coverage in AI responses. Sentiment is leaning positive but with room for stronger positioning.`;
  if (score >= -0.1)
    return `AI responses about ${brandName} are largely neutral in tone. The brand has not established a strongly positive or negative narrative yet.`;
  if (score >= -0.6)
    return `AI models carry some negative associations when mentioning ${brandName}. Review content and reviews that may be influencing training data.`;
  return `${brandName} is framed negatively in AI responses. Urgent content and reputation work is needed to shift the underlying narrative.`;
}

function getSentimentColor(score: number): string {
  if (score >= 0.6) return '#10b981';
  if (score >= 0.1) return '#34d399';
  if (score >= -0.1) return C.amber;
  if (score >= -0.6) return '#f97316';
  return C.red;
}

export function SentimentSection({
  results,
  brandName,
}: {
  results: RunResults;
  brandName: string;
}) {
  const mentionedResults = results.results.filter(
    (r) => r.sentiment !== undefined && r.sentiment !== null
  );

  // Sentiment bands histogram
  const bandCounts = BANDS.map((band) => ({
    label: band.shortLabel,
    fullLabel: band.label,
    color: band.color,
    count: mentionedResults.filter(
      (r) => (r.sentiment as number) >= band.min && (r.sentiment as number) < band.max
    ).length,
  }));
  // Fix upper bound for the top band
  bandCounts[0].count = mentionedResults.filter((r) => (r.sentiment as number) >= 0.6).length;

  // Per-provider avg sentiment
  const providerMap: Record<string, number[]> = {};
  for (const r of mentionedResults) {
    if (r.sentiment === undefined || r.sentiment === null) continue;
    if (!providerMap[r.provider]) providerMap[r.provider] = [];
    providerMap[r.provider].push(r.sentiment as number);
  }
  const providerSentiments = Object.entries(providerMap).map(([provider, scores]) => ({
    provider,
    avg: scores.reduce((a, b) => a + b, 0) / scores.length,
  }));

  // Overall brand sentiment
  const allScores = mentionedResults
    .map((r) => r.sentiment as number)
    .filter((s) => s !== undefined && s !== null);
  const brandAvgSentiment =
    allScores.length > 0 ? allScores.reduce((a, b) => a + b, 0) / allScores.length : 0;

  const positiveCount = mentionedResults.filter((r) => (r.sentiment as number) > 0.1).length;
  const totalSentimentCount = mentionedResults.length;
  const positivePct =
    totalSentimentCount > 0 ? Math.round((positiveCount / totalSentimentCount) * 100) : 0;

  const providerColors: Record<string, string> = {
    openai: '#74aa9c',
    gemini: '#4285f4',
    perplexity: '#6366f1',
    anthropic: '#d4a27f',
  };

  return (
    <div data-pdf-page style={pageStyle}>
      {/* Section Header */}
      <div
        style={{
          borderLeft: '4px solid #10b981',
          background: 'linear-gradient(90deg, rgba(16,185,129,0.08) 0%, transparent 100%)',
          borderRadius: '0 8px 8px 0',
          padding: '16px 20px',
          marginBottom: 28,
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 3,
            color: '#10b981',
            textTransform: 'uppercase' as const,
            marginBottom: 4,
          }}
        >
          Section 7
        </div>
        <div style={{ fontSize: 24, fontWeight: 700, color: C.text, marginBottom: 4 }}>
          Sentiment Depth Profile
        </div>
        <div style={{ fontSize: 13, color: C.muted }}>
          How AI models emotionally frame {brandName} across all responses
        </div>
      </div>

      {/* Row: histogram + provider breakdown */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 24 }}>
        {/* Left: histogram */}
        <div
          style={{
            flex: '0 0 55%',
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            padding: 20,
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
            Sentiment Distribution
          </div>
          <BarChart width={380} height={220} data={bandCounts} margin={{ top: 8, right: 8, bottom: 8, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
            <XAxis dataKey="label" tick={{ fill: C.muted, fontSize: 11 }} />
            <YAxis tick={{ fill: C.muted, fontSize: 11 }} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8 }}
              labelStyle={{ color: C.text }}
              itemStyle={{ color: C.muted }}
              formatter={(value: number, _: string, entry: any) => [
                value,
                entry?.payload?.fullLabel ?? '',
              ]}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {bandCounts.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </div>

        {/* Right: per-provider sentiment */}
        <div
          style={{
            flex: '0 0 calc(45% - 20px)',
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            padding: 20,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 2,
              color: C.muted,
              textTransform: 'uppercase' as const,
              marginBottom: 16,
            }}
          >
            Per-Provider Sentiment
          </div>
          {providerSentiments.length === 0 ? (
            <div style={{ color: C.faint, fontSize: 13 }}>No per-provider sentiment data.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {providerSentiments.map(({ provider, avg }) => {
                const pct = Math.round(((avg + 1) / 2) * 100); // map -1..1 to 0..100
                const col =
                  providerColors[provider.toLowerCase()] || C.primary;
                const sentCol = getSentimentColor(avg);
                return (
                  <div key={provider}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: 6,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 12,
                          color: C.text,
                          textTransform: 'capitalize' as const,
                        }}
                      >
                        {provider}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: sentCol }}>
                        {avg >= 0 ? '+' : ''}
                        {avg.toFixed(2)}
                      </span>
                    </div>
                    <div
                      style={{
                        height: 8,
                        background: C.border,
                        borderRadius: 4,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${pct}%`,
                          height: '100%',
                          background: col,
                          borderRadius: 4,
                          transition: 'width 0.3s',
                        }}
                      />
                    </div>
                    <div style={{ fontSize: 10, color: C.faint, marginTop: 2 }}>
                      {getSentimentLabel(avg)}
                    </div>
                  </div>
                );
              })}
              <div
                style={{
                  marginTop: 8,
                  paddingTop: 12,
                  borderTop: `1px solid ${C.border}`,
                  fontSize: 11,
                  color: C.faint,
                  fontStyle: 'italic',
                }}
              >
                Note: Competitor sentiment is not directly available from response data — only brand sentiment is scored.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Brand sentiment summary card */}
      <div
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          padding: '24px 28px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 32,
        }}
      >
        {/* Large score */}
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <div style={{ fontSize: 48, marginBottom: 4 }}>{getSentimentEmoji(brandAvgSentiment)}</div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 900,
              color: getSentimentColor(brandAvgSentiment),
              lineHeight: 1,
            }}
          >
            {brandAvgSentiment >= 0 ? '+' : ''}
            {brandAvgSentiment.toFixed(2)}
          </div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 2,
              color: C.muted,
              textTransform: 'uppercase' as const,
              marginTop: 4,
            }}
          >
            Brand Avg
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 80, background: C.border, flexShrink: 0 }} />

        {/* Description */}
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '4px 12px',
              borderRadius: 20,
              background: `${getSentimentColor(brandAvgSentiment)}18`,
              border: `1px solid ${getSentimentColor(brandAvgSentiment)}40`,
              marginBottom: 10,
            }}
          >
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: getSentimentColor(brandAvgSentiment),
              }}
            />
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: getSentimentColor(brandAvgSentiment),
                letterSpacing: 1,
              }}
            >
              {getSentimentLabel(brandAvgSentiment).toUpperCase()}
            </span>
          </div>
          <div style={{ fontSize: 14, color: C.text, lineHeight: 1.6 }}>
            {getSentimentDescription(brandAvgSentiment, brandName)}
          </div>
        </div>
      </div>

      {/* Insight text */}
      <div
        style={{
          background: `rgba(16,185,129,0.06)`,
          border: `1px solid rgba(16,185,129,0.2)`,
          borderRadius: 10,
          padding: '16px 20px',
          marginBottom: 16,
        }}
      >
        <div style={{ fontSize: 13, color: C.text, lineHeight: 1.7 }}>
          <strong style={{ color: '#10b981' }}>Insight:</strong>{' '}
          {positivePct}% of brand mentions received positive sentiment (&gt;0.1 score). The brand
          narrative is{' '}
          {brandAvgSentiment >= 0.3
            ? 'predominantly positive — AI models associate the brand with quality and credibility.'
            : brandAvgSentiment >= 0
            ? 'mildly favourable — there is meaningful room to strengthen the positive framing.'
            : 'trending neutral to negative — content strategy changes are needed to shift the tone.'}
        </div>
      </div>

      {/* Driver note */}
      <div style={{ fontSize: 12, color: C.faint, lineHeight: 1.6 }}>
        <strong style={{ color: C.muted }}>What drives sentiment:</strong> Positive sentiment is
        typically driven by expert endorsements, clinical citations, structured product descriptions,
        and authoritative review coverage. Negative sentiment often stems from complaint forums,
        low-quality review sites, or competitor comparisons where the brand underperforms.
      </div>
    </div>
  );
}
