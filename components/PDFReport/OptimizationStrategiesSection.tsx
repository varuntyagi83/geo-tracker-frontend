'use client';

import type { RunResults } from '@/lib/types';
import type { OptimizationStrategy } from '@/lib/optimization-strategies';

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

function priorityColor(priority: 'critical' | 'high' | 'medium'): string {
  if (priority === 'critical') return C.red;
  if (priority === 'high') return C.amber;
  return C.green;
}

function priorityLabel(priority: 'critical' | 'high' | 'medium'): string {
  if (priority === 'critical') return 'CRITICAL';
  if (priority === 'high') return 'HIGH';
  return 'MEDIUM';
}

interface StrategyCardProps {
  strategy: OptimizationStrategy;
}

function StrategyCard({ strategy }: StrategyCardProps) {
  const pColor = priorityColor(strategy.priority);
  const pLabel = priorityLabel(strategy.priority);
  const topActions = strategy.actions.slice(0, 3);

  return (
    <div
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderTop: `4px solid ${strategy.color}`,
        borderRadius: '0 0 12px 12px',
        padding: '18px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        width: '220px',
        minHeight: '280px',
        boxSizing: 'border-box',
      }}
    >
      {/* Icon circle */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: strategy.bgColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            flexShrink: 0,
          }}
        >
          {strategy.iconEmoji}
        </div>
        {/* Priority badge */}
        <div
          style={{
            padding: '3px 8px',
            borderRadius: 12,
            background: `${pColor}20`,
            border: `1px solid ${pColor}40`,
            fontSize: 9,
            fontWeight: 800,
            color: pColor,
            letterSpacing: 1,
            alignSelf: 'flex-start',
          }}
        >
          {pLabel}
        </div>
      </div>

      {/* Title */}
      <div style={{ fontSize: 13, fontWeight: 700, color: C.text, lineHeight: 1.35 }}>
        {strategy.title}
      </div>

      {/* Description */}
      <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.55, flexGrow: 1 }}>
        {strategy.description.length > 95
          ? strategy.description.slice(0, 92) + '…'
          : strategy.description}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {topActions.map((action, i) => (
          <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                background: `${strategy.color}25`,
                color: strategy.color,
                fontSize: 8,
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: 1,
              }}
            >
              {i + 1}
            </div>
            <div
              style={{
                fontSize: 10,
                color: C.text,
                lineHeight: 1.45,
              }}
            >
              {action.length > 70 ? action.slice(0, 67) + '…' : action}
            </div>
          </div>
        ))}
      </div>

      {/* Why relevant */}
      {strategy.whyRelevant && (
        <div
          style={{
            fontSize: 10,
            color: C.faint,
            fontStyle: 'italic',
            lineHeight: 1.45,
            borderTop: `1px solid ${C.border}`,
            paddingTop: 8,
          }}
        >
          {strategy.whyRelevant.length > 80
            ? strategy.whyRelevant.slice(0, 77) + '…'
            : strategy.whyRelevant}
        </div>
      )}
    </div>
  );
}

export function OptimizationStrategiesSection({
  results,
  brandName,
  strategies,
}: {
  results: RunResults;
  brandName: string;
  strategies: OptimizationStrategy[];
}) {
  // Show up to 5 strategies, sorted by relevance score descending
  const sorted = [...strategies]
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 5);

  const topRow = sorted.slice(0, 3);
  const bottomRow = sorted.slice(3, 5);

  return (
    <div data-pdf-page style={pageStyle}>
      {/* Section Header */}
      <div
        style={{
          borderLeft: '4px solid #f97316',
          background: 'linear-gradient(90deg, rgba(249,115,22,0.08) 0%, transparent 100%)',
          borderRadius: '0 8px 8px 0',
          padding: '16px 20px',
          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 3,
            color: '#f97316',
            textTransform: 'uppercase' as const,
            marginBottom: 4,
          }}
        >
          Section 12
        </div>
        <div style={{ fontSize: 24, fontWeight: 700, color: C.text, marginBottom: 4 }}>
          Optimization Strategies
        </div>
        <div style={{ fontSize: 13, color: C.muted }}>
          Proven tactics to improve your brand&apos;s visibility in AI-generated responses —
          prioritized for your specific gaps
        </div>
      </div>

      {/* Intro */}
      <div
        style={{
          fontSize: 13,
          color: C.muted,
          marginBottom: 24,
          lineHeight: 1.6,
        }}
      >
        Based on your analysis results for <strong style={{ color: C.text }}>{brandName}</strong>,
        here are the {sorted.length} most impactful strategies ranked by relevance to your specific
        visibility gaps.
      </div>

      {sorted.length === 0 ? (
        <div
          style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            padding: 40,
            textAlign: 'center',
            color: C.muted,
            fontSize: 13,
          }}
        >
          No optimization strategies available. Run an analysis to generate personalized strategies.
        </div>
      ) : (
        <>
          {/* Top row: up to 3 cards */}
          <div
            style={{
              display: 'flex',
              gap: 14,
              justifyContent: 'flex-start',
              marginBottom: 14,
              flexWrap: 'nowrap',
            }}
          >
            {topRow.map((strategy) => (
              <StrategyCard key={strategy.id} strategy={strategy} />
            ))}
          </div>

          {/* Bottom row: up to 2 cards, centered */}
          {bottomRow.length > 0 && (
            <div
              style={{
                display: 'flex',
                gap: 14,
                justifyContent: 'center',
                marginBottom: 24,
              }}
            >
              {bottomRow.map((strategy) => (
                <StrategyCard key={strategy.id} strategy={strategy} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Footer note */}
      <div
        style={{
          background: `rgba(249,115,22,0.06)`,
          border: `1px solid rgba(249,115,22,0.2)`,
          borderRadius: 10,
          padding: '14px 18px',
          marginTop: 4,
        }}
      >
        <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>
          <strong style={{ color: '#f97316' }}>Note:</strong> These strategies are ranked by
          relevance score ({sorted.map((s) => `${s.title}: ${s.relevanceScore}`).join(', ')}) based
          on your actual analysis results — not generic advice.
        </div>
      </div>
    </div>
  );
}
