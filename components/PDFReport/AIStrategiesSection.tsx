'use client';

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

type Priority = 'HIGH' | 'MEDIUM' | 'LOW';

interface StrategyCard {
  priority: Priority;
  title: string;
  why: string;
  action: string;
  impact: string;
}

function inferPriority(text: string): Priority {
  const lower = text.toLowerCase();
  if (/critical|immediately|urgent|high priority|as soon as|must/.test(lower)) return 'HIGH';
  if (/should|recommend|important|strongly|need to/.test(lower)) return 'MEDIUM';
  return 'LOW';
}

function priorityColor(p: Priority): string {
  if (p === 'HIGH') return C.red;
  if (p === 'MEDIUM') return C.amber;
  return C.green;
}

function priorityIcon(p: Priority): string {
  if (p === 'HIGH') return '🔴';
  if (p === 'MEDIUM') return '🟡';
  return '🟢';
}

/**
 * Parse an AI-generated markdown report into structured strategy cards.
 * Splits on "##" headers or numbered items (1., 2., 3.) then extracts sections.
 */
function parseAiReport(text: string): StrategyCard[] {
  const cards: StrategyCard[] = [];

  // Try ## heading split first
  const bySections = text
    .split(/\n##\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);

  // If no ## headings, fall back to numbered item split
  const sections =
    bySections.length > 1
      ? bySections.slice(0, 6)
      : text
          .split(/\n(?=\d+\.\s+\*\*|\n\d+\.\s+)/)
          .map((s) => s.trim())
          .filter((s) => s.length > 20)
          .slice(0, 6);

  for (const section of sections) {
    const lines = section
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) continue;

    // Title = first line, strip markdown bold/heading chars and leading numbers
    const rawTitle = lines[0]
      .replace(/^#+\s*/, '')
      .replace(/^\d+\.\s*/, '')
      .replace(/\*\*/g, '')
      .trim();
    const title = rawTitle.length > 60 ? rawTitle.slice(0, 57) + '…' : rawTitle;
    if (!title) continue;

    const body = lines.slice(1).join(' ').replace(/\*\*/g, '').replace(/\*/g, '');
    const priority = inferPriority(section);

    // Try to extract WHY / ACTION / IMPACT sub-fields by common patterns
    const whyMatch = body.match(/why[:\s]+([^.]+\.)/i);
    const actionMatch = body.match(/action[:\s]+([^.]+\.)/i);
    const impactMatch = body.match(/impact[:\s]+([^.]+\.)/i);

    const why = whyMatch
      ? whyMatch[1].trim()
      : body.length > 30
      ? (body.split('. ')[0] + '.').slice(0, 120)
      : 'Addresses a key visibility gap identified in your analysis.';

    const action = actionMatch
      ? actionMatch[1].trim()
      : body.split('. ')[1]
      ? (body.split('. ')[1] + '.').slice(0, 120)
      : 'Implement this strategy as part of your content and technical GEO roadmap.';

    const impact = impactMatch
      ? impactMatch[1].trim()
      : body.split('. ')[2]
      ? (body.split('. ')[2] + '.').slice(0, 120)
      : 'Expected to increase brand visibility in AI-generated responses.';

    cards.push({ priority, title, why, action, impact });
  }

  return cards.slice(0, 6);
}

/**
 * Fallback: generate 3 data-driven strategy cards from results when no aiReport is provided.
 */
function generateFallbackCards(results: RunResults, brandName: string): StrategyCard[] {
  const cards: StrategyCard[] = [];
  const { providerVisibility, competitorVisibility } = results.summary;

  // Card 1: lowest-scoring provider
  const providerEntries = Object.entries(providerVisibility);
  if (providerEntries.length > 0) {
    const [worstProvider, worstScore] = providerEntries.sort((a, b) => a[1] - b[1])[0];
    const pct = Math.round(worstScore);
    cards.push({
      priority: pct < 30 ? 'HIGH' : 'MEDIUM',
      title: `Optimize for ${worstProvider.charAt(0).toUpperCase() + worstProvider.slice(1)}`,
      why: `${brandName} has only ${pct}% visibility on ${worstProvider}, making it the lowest-performing provider in this analysis.`,
      action: `Audit the content types ${worstProvider} favours and publish targeted material. Check citation sources pulled by ${worstProvider} for brand mentions.`,
      impact: `Improving ${worstProvider} visibility by 20% points would meaningfully lift the overall GEO score.`,
    });
  }

  // Card 2: top competitor
  const competitorEntries = Object.entries(competitorVisibility).sort((a, b) => b[1] - a[1]);
  if (competitorEntries.length > 0) {
    const [topComp, topScore] = competitorEntries[0];
    const pct = Math.round(topScore);
    cards.push({
      priority: pct > 60 ? 'HIGH' : 'MEDIUM',
      title: `Counter ${topComp} Dominance`,
      why: `${topComp} appears in ${pct}% of AI responses in your category, displacing ${brandName} in key queries.`,
      action: `Identify the queries where ${topComp} appears and ${brandName} does not. Create content that directly answers those questions with stronger citations.`,
      impact: `Reducing ${topComp}'s displacement rate by 15 points would recover an estimated ${Math.round(pct * 0.15)}% additional brand mentions.`,
    });
  }

  // Card 3: top un-featured citation source
  const domainCounts: Record<string, number> = {};
  for (const result of results.results) {
    for (const source of result.sources) {
      if (!source.url) continue;
      try {
        const domain = new URL(source.url.startsWith('http') ? source.url : `https://${source.url}`)
          .hostname.replace(/^www\./, '');
        domainCounts[domain] = (domainCounts[domain] || 0) + 1;
      } catch {
        // skip malformed
      }
    }
  }

  const topUnfeatured = Object.entries(domainCounts)
    .sort((a, b) => b[1] - a[1])
    .find(([domain]) => !domain.toLowerCase().includes(brandName.toLowerCase().split(' ')[0]));

  if (topUnfeatured) {
    const [domain, count] = topUnfeatured;
    cards.push({
      priority: count >= 3 ? 'HIGH' : 'MEDIUM',
      title: `Get Featured on ${domain}`,
      why: `${domain} was cited ${count} times by AI models but ${brandName} is not currently featured there.`,
      action: `Reach out to ${domain} for a product listing, editorial review, or brand mention. Provide a press kit and product samples if applicable.`,
      impact: `Getting listed on ${domain} could add up to ${count} additional citations per analysis cycle.`,
    });
  }

  return cards;
}

interface StrategyCardComponentProps {
  card: StrategyCard;
  index: number;
}

function StrategyCardComponent({ card, index }: StrategyCardComponentProps) {
  const pColor = priorityColor(card.priority);
  const pIcon = priorityIcon(card.priority);

  return (
    <div
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderLeft: `4px solid ${pColor}`,
        borderRadius: '0 10px 10px 0',
        padding: '18px 20px',
        marginBottom: 12,
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14 }}>{pIcon}</span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: pColor,
              letterSpacing: 1,
            }}
          >
            {card.priority} PRIORITY
          </span>
        </div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: C.faint,
          }}
        >
          #{index + 1}
        </div>
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: 15,
          fontWeight: 700,
          color: C.text,
          marginBottom: 12,
          lineHeight: 1.3,
        }}
      >
        {card.title}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: C.border, marginBottom: 12 }} />

      {/* WHY / ACTION / IMPACT */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { label: 'WHY', value: card.why, color: C.muted },
          { label: 'ACTION', value: card.action, color: C.text },
          { label: 'IMPACT', value: card.impact, color: C.teal },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ display: 'flex', gap: 10 }}>
            <div
              style={{
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: 1.5,
                color: C.faint,
                minWidth: 50,
                paddingTop: 2,
                textTransform: 'uppercase' as const,
              }}
            >
              {label}:
            </div>
            <div style={{ fontSize: 12, color, lineHeight: 1.55 }}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AIStrategiesSection({
  results,
  brandName,
  aiReport,
}: {
  results: RunResults;
  brandName: string;
  aiReport?: string;
}) {
  const cards =
    aiReport && aiReport.trim().length > 50
      ? parseAiReport(aiReport)
      : generateFallbackCards(results, brandName);

  const hasParsedReport = !!(aiReport && aiReport.trim().length > 50);

  return (
    <div data-pdf-page style={pageStyle}>
      {/* Section Header */}
      <div
        style={{
          borderLeft: '4px solid #8b5cf6',
          background: 'linear-gradient(90deg, rgba(139,92,246,0.08) 0%, transparent 100%)',
          borderRadius: '0 8px 8px 0',
          padding: '16px 20px',
          marginBottom: 20,
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 3,
            color: '#8b5cf6',
            textTransform: 'uppercase' as const,
            marginBottom: 4,
          }}
        >
          Section 13
        </div>
        <div style={{ fontSize: 24, fontWeight: 700, color: C.text, marginBottom: 4 }}>
          AI-Generated Strategic Recommendations
        </div>
        <div style={{ fontSize: 13, color: C.muted }}>
          {hasParsedReport
            ? 'Personalized recommendations from GPT-4 analysis of your visibility data'
            : 'Data-driven strategies generated from your analysis results'}
        </div>
      </div>

      {/* Source badge */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 14px',
          borderRadius: 20,
          background: hasParsedReport
            ? `${C.purple}18`
            : `${C.amber}18`,
          border: `1px solid ${hasParsedReport ? C.purple : C.amber}40`,
          fontSize: 11,
          fontWeight: 600,
          color: hasParsedReport ? C.purple : C.amber,
          marginBottom: 20,
        }}
      >
        {hasParsedReport ? '🤖 GPT-4 Analysis' : '📊 Auto-Generated from Data'}
      </div>

      {/* Cards */}
      <div>
        {cards.map((card, i) => (
          <StrategyCardComponent key={i} card={card} index={i} />
        ))}
      </div>

      {/* Footer */}
      {!hasParsedReport && (
        <div
          style={{
            background: `rgba(139,92,246,0.06)`,
            border: `1px solid rgba(139,92,246,0.2)`,
            borderRadius: 10,
            padding: '14px 18px',
            marginTop: 8,
          }}
        >
          <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>
            <strong style={{ color: C.purple }}>Tip:</strong> Run the AI Report in the dashboard
            to get a full GPT-4 powered strategy analysis with 10+ personalized recommendations
            tailored specifically to <strong style={{ color: C.text }}>{brandName}</strong>&apos;s
            visibility gaps.
          </div>
        </div>
      )}
    </div>
  );
}
