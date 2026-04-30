'use client';

import type { RunResults } from '@/lib/types';
import type { ContentStrategy } from '@/lib/content-strategy';

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

const OWNER_COLORS: Record<string, string> = {
  SEO: C.primary,
  Content: C.purple,
  PR: C.teal,
  Dev: C.amber,
  Marketing: C.orange,
};

const PRIORITY_COLORS: Record<string, string> = {
  critical: C.red,
  high: C.amber,
  medium: C.teal,
};

function OwnerBadge({ owner }: { owner: string }) {
  const color = OWNER_COLORS[owner] ?? C.muted;
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: 10,
        background: `${color}20`,
        border: `1px solid ${color}50`,
        fontSize: 9,
        fontWeight: 700,
        color,
        letterSpacing: 0.5,
        textTransform: 'uppercase' as const,
        flexShrink: 0,
      }}
    >
      {owner}
    </span>
  );
}

export function ContentPlanSection({
  results,
  brandName,
  strategy,
}: {
  results: RunResults;
  brandName: string;
  strategy: ContentStrategy;
}) {
  const { plan, quickWins, gaps } = strategy;

  const thirtyDay = plan.filter((p) => p.timeframe === '30');
  const sixtyDay = plan.filter((p) => p.timeframe === '60');
  const ninetyDay = plan.filter((p) => p.timeframe === '90');

  const columns = [
    {
      label: '30 Days',
      sublabel: 'Quick Wins',
      items: thirtyDay,
      headerBg: 'rgba(16,185,129,0.15)',
      border: C.green,
      accentColor: C.green,
    },
    {
      label: '60 Days',
      sublabel: 'Content Creation',
      items: sixtyDay,
      headerBg: 'rgba(245,158,11,0.15)',
      border: C.amber,
      accentColor: C.amber,
    },
    {
      label: '90 Days',
      sublabel: 'Authority Building',
      items: ninetyDay,
      headerBg: 'rgba(239,68,68,0.15)',
      border: C.red,
      accentColor: C.red,
    },
  ];

  const topGaps = gaps.slice(0, 5);

  return (
    <div data-pdf-page style={pageStyle}>
      <SectionHeader
        number="Section 14"
        title="30/60/90 Day Action Plan"
        subtitle="Data-driven roadmap specific to your visibility gaps"
        color={C.green}
      />

      {/* Three-column timeline */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 24 }}>
        {columns.map((col) => (
          <div
            key={col.label}
            style={{
              flex: 1,
              background: C.card,
              border: `1px solid ${C.border}`,
              borderTop: `3px solid ${col.border}`,
              borderRadius: 10,
              overflow: 'hidden',
            }}
          >
            {/* Column header */}
            <div
              style={{
                background: col.headerBg,
                padding: '12px 14px',
                borderBottom: `1px solid ${col.border}30`,
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 800, color: col.accentColor }}>{col.label}</div>
              <div style={{ fontSize: 10, color: C.muted, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' as const }}>
                {col.sublabel}
              </div>
            </div>

            {/* Items */}
            <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {col.items.length === 0 ? (
                <div style={{ fontSize: 12, color: C.faint, fontStyle: 'italic' }}>No items for this timeframe.</div>
              ) : (
                col.items.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      borderBottom: idx < col.items.length - 1 ? `1px solid ${C.border}` : 'none',
                      paddingBottom: idx < col.items.length - 1 ? 12 : 0,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6, marginBottom: 4 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: C.text, lineHeight: 1.4, flex: 1 }}>
                        {item.action}
                      </div>
                      <OwnerBadge owner={item.owner} />
                    </div>
                    <div style={{ fontSize: 10, color: C.muted, lineHeight: 1.5 }}>
                      {item.specifics}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Wins box */}
      <div
        style={{
          background: 'rgba(16,185,129,0.06)',
          border: `1px solid rgba(16,185,129,0.25)`,
          borderLeft: `4px solid ${C.green}`,
          borderRadius: '0 10px 10px 0',
          padding: '16px 20px',
          marginBottom: 20,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 700, color: C.green, marginBottom: 10 }}>
          ⚡ Quick Wins — Start These This Week
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {quickWins.map((win, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <div
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: C.green,
                  flexShrink: 0,
                  marginTop: 5,
                }}
              />
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>{win}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Content Gap reference table */}
      {topGaps.length > 0 && (
        <div
          style={{
            background: C.cardAlt,
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
            Content Gaps Driving This Plan (Top {topGaps.length})
          </div>
          {topGaps.map((gap, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '8px 16px',
                borderBottom: i < topGaps.length - 1 ? `1px solid ${C.border}` : 'none',
                background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
              }}
            >
              <div style={{ flex: 1, fontSize: 11, color: C.text, lineHeight: 1.3 }}>{gap.query}</div>
              <div style={{ fontSize: 10, color: C.faint, minWidth: 70 }}>{gap.category}</div>
              <div style={{ fontSize: 10, color: C.muted, minWidth: 90 }}>
                {gap.competitors.slice(0, 2).join(', ')}
                {gap.competitors.length > 2 ? ` +${gap.competitors.length - 2}` : ''}
              </div>
              <span
                style={{
                  display: 'inline-block',
                  padding: '2px 8px',
                  borderRadius: 8,
                  background: `${PRIORITY_COLORS[gap.priority] ?? C.muted}20`,
                  border: `1px solid ${PRIORITY_COLORS[gap.priority] ?? C.muted}50`,
                  fontSize: 9,
                  fontWeight: 700,
                  color: PRIORITY_COLORS[gap.priority] ?? C.muted,
                  textTransform: 'uppercase' as const,
                  letterSpacing: 0.5,
                }}
              >
                {gap.priority}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
