'use client';

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
  indigo: '#6366f1',
  teal: '#14b8a6',
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

const AEO_DIMENSIONS = [
  { label: 'FAQ Schema Coverage', description: 'Structured question-answer markup on key pages', icon: '❓' },
  { label: 'Structured Product Data', description: 'JSON-LD product schema with attributes and pricing', icon: '📦' },
  { label: 'Content Comprehensiveness per Category', description: 'Depth and breadth of topic coverage per pillar', icon: '📄' },
  { label: 'Page Load Speed & Crawlability', description: 'Core Web Vitals and AI crawler accessibility', icon: '⚡' },
  { label: 'Internal Linking for AI Navigation', description: 'Logical content graph that AI models can traverse', icon: '🔗' },
];

export function AEOSection({ brandName }: { brandName: string }) {
  return (
    <div data-pdf-page style={pageStyle}>
      <SectionHeader
        number="Section 16"
        title="AEO Readiness Score"
        subtitle="Answer Engine Optimization — Website Audit"
        color={C.indigo}
      />

      {/* Phase 2 badge */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 24px',
            background: `${C.indigo}15`,
            border: `1px solid ${C.indigo}40`,
            borderRadius: 8,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: C.indigo,
              flexShrink: 0,
            }}
          />
          <div style={{ fontSize: 12, fontWeight: 700, color: C.indigo, letterSpacing: 2, textTransform: 'uppercase' as const }}>
            Phase 2 Feature — Apify Integration Required
          </div>
        </div>
      </div>

      {/* Locked dimension cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        {AEO_DIMENSIONS.map((dim, i) => (
          <div
            key={i}
            style={{
              background: C.cardAlt,
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              opacity: 0.6,
            }}
          >
            <div style={{ fontSize: 18, flexShrink: 0 }}>{dim.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 2 }}>{dim.label}</div>
              <div style={{ fontSize: 11, color: C.faint }}>{dim.description}</div>
            </div>
            <div
              style={{
                width: 80,
                height: 8,
                background: C.border,
                borderRadius: 4,
                flexShrink: 0,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: `repeating-linear-gradient(45deg, ${C.faint}30 0px, ${C.faint}30 4px, transparent 4px, transparent 8px)`,
                }}
              />
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.faint, minWidth: 44, textAlign: 'right' }}>
              — / 100
            </div>
          </div>
        ))}
      </div>

      {/* Why it matters */}
      <div
        style={{
          background: `${C.indigo}08`,
          border: `1px solid ${C.indigo}25`,
          borderRadius: 10,
          padding: '16px 20px',
          marginBottom: 16,
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 700, color: C.indigo, letterSpacing: 2, textTransform: 'uppercase' as const, marginBottom: 8 }}>
          Why AEO Matters
        </div>
        <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.7 }}>
          <strong style={{ color: C.text }}>GEO score</strong> measures how third parties describe you.{' '}
          <strong style={{ color: C.text }}>AEO score</strong> measures whether your{' '}
          <strong style={{ color: C.text }}>own website</strong> is AI-readable and extractable. A brand
          can have strong third-party citations but still underperform because its own content lacks the
          schema, structure, and comprehensiveness that AI models need to directly extract and cite it.
        </div>
      </div>

      {/* CTA box */}
      <div
        style={{
          background: `linear-gradient(135deg, ${C.indigo}15 0%, ${C.purple}10 100%)`,
          border: `1px solid ${C.indigo}35`,
          borderRadius: 10,
          padding: '16px 20px',
          marginBottom: 16,
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 700, color: C.indigo, marginBottom: 6 }}>
          Unlock Full Website Audit
        </div>
        <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>
          Connect the Apify integration in settings to unlock a full website audit that benchmarks{' '}
          <strong style={{ color: C.text }}>{brandName}.com</strong> against the 10 most-cited domains in
          this report — scoring FAQ schema, product structured data, content depth, crawlability, and
          internal link graph quality.
        </div>
      </div>

      {/* Partial insight from current data */}
      <div
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 10,
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
        }}
      >
        <div style={{ fontSize: 18, flexShrink: 0 }}>💡</div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.amber, letterSpacing: 1, textTransform: 'uppercase' as const, marginBottom: 5 }}>
            Partial Insight from Current Report Data
          </div>
          <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>
            Based on this report's source citations, the AI models referenced external domains without
            including <strong style={{ color: C.text }}>{brandName}</strong> as a primary source. This
            pattern strongly suggests potential AEO gaps in product page content, FAQ schema markup, and
            structured data richness — all factors that determine whether AI models extract content
            directly from your domain versus relying on third-party intermediaries.
          </div>
        </div>
      </div>
    </div>
  );
}
