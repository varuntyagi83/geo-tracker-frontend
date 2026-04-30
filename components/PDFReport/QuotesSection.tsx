'use client';

import type { RunResults, QueryResult } from '@/lib/types';

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

const PROVIDER_COLORS: Record<string, string> = {
  openai: '#74aa9c',
  gemini: '#4285f4',
  perplexity: '#6366f1',
  anthropic: '#d4a27f',
};

function extractBrandSentence(text: string, brandName: string): string | null {
  // Split on sentence boundaries
  const sentences = text
    .split(/(?<=[.!?])\s+|\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 15);

  for (const sentence of sentences) {
    if (sentence.toLowerCase().includes(brandName.toLowerCase())) {
      // Trim to a reasonable length
      return sentence.length > 220 ? sentence.slice(0, 217) + '…' : sentence;
    }
  }
  return null;
}

function extractPositiveWords(results: QueryResult[], brandName: string): string[] {
  const positiveWords: Record<string, number> = {};
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'is', 'are', 'was', 'were', 'it', 'its', 'this', 'that',
    'their', 'they', 'has', 'have', 'had', 'be', 'been', 'being', 'from',
    'by', 'as', 'not', 'no', brandName.toLowerCase(),
  ]);

  const positiveTerms = [
    'premium', 'quality', 'trusted', 'effective', 'natural', 'certified',
    'organic', 'pure', 'high-quality', 'reliable', 'reputable', 'clinical',
    'science-backed', 'transparent', 'sustainable', 'innovative', 'leading',
    'established', 'proven', 'recommended', 'popular', 'well-known',
    'excellent', 'superior', 'best', 'top', 'award', 'certified',
  ];

  for (const result of results) {
    if (!result.brandMentioned) continue;
    const text = result.responseText.toLowerCase();
    for (const term of positiveTerms) {
      if (text.includes(term)) {
        positiveWords[term] = (positiveWords[term] || 0) + 1;
      }
    }
  }

  return Object.entries(positiveWords)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([word]) => word);
}

interface Quote {
  text: string;
  provider: string;
  query: string;
}

export function QuotesSection({
  results,
  brandName,
}: {
  results: RunResults;
  brandName: string;
}) {
  // Extract quotes
  const quotes: Quote[] = [];
  for (const result of results.results) {
    if (!result.brandMentioned) continue;
    if (quotes.length >= 6) break;
    const sentence = extractBrandSentence(result.responseText, brandName);
    if (sentence) {
      quotes.push({
        text: sentence,
        provider: result.provider,
        query:
          result.question.length > 55
            ? result.question.slice(0, 52) + '…'
            : result.question,
      });
    }
  }

  const positiveWords = extractPositiveWords(results.results, brandName);
  const fillerCount = Math.max(0, 6 - quotes.length);

  const GRID_ITEMS = [...quotes, ...Array(fillerCount).fill(null)];

  const noQuotes = quotes.length < 2;

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
          Section 8
        </div>
        <div style={{ fontSize: 24, fontWeight: 700, color: C.text, marginBottom: 4 }}>
          How AI Describes Your Brand
        </div>
        <div style={{ fontSize: 13, color: C.muted }}>
          Verbatim excerpts from AI responses where brand was mentioned
        </div>
      </div>

      {/* Intro text */}
      <div style={{ fontSize: 13, color: C.muted, marginBottom: 20, lineHeight: 1.6 }}>
        These are actual sentences from AI model responses. They reveal the narrative AI has
        absorbed about your brand — the language, associations, and context in which{' '}
        <strong style={{ color: C.text }}>{brandName}</strong> is placed.
      </div>

      {noQuotes ? (
        <div
          style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            padding: 40,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 8 }}>
            No Brand Quotes Available
          </div>
          <div style={{ fontSize: 13, color: C.muted }}>
            Not enough AI responses mentioned {brandName} directly. Run more queries across
            different providers to generate quote examples.
          </div>
        </div>
      ) : (
        <>
          {/* Quote grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 14,
              marginBottom: 24,
            }}
          >
            {GRID_ITEMS.map((item, index) => {
              if (!item) {
                // Filler card
                return (
                  <div
                    key={`filler-${index}`}
                    style={{
                      background: `${C.cardAlt}80`,
                      border: `1px dashed ${C.border}`,
                      borderRadius: 10,
                      padding: '20px 20px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: 130,
                      gap: 8,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 28,
                        color: C.faint,
                        fontWeight: 900,
                      }}
                    >
                      +
                    </div>
                    <div style={{ fontSize: 12, color: C.faint, textAlign: 'center' }}>
                      Run more queries to generate additional quote examples
                    </div>
                  </div>
                );
              }

              const quote = item as Quote;
              const providerColor =
                PROVIDER_COLORS[quote.provider.toLowerCase()] || C.primary;

              return (
                <div
                  key={index}
                  style={{
                    background: C.card,
                    border: `1px solid ${C.border}`,
                    borderLeft: `3px solid ${C.purple}`,
                    borderRadius: '0 10px 10px 0',
                    padding: '18px 18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                  }}
                >
                  {/* Quote mark */}
                  <div
                    style={{
                      fontSize: 36,
                      lineHeight: 1,
                      color: C.purple,
                      fontFamily: 'Georgia, serif',
                      marginBottom: -8,
                    }}
                  >
                    &#8220;
                  </div>
                  {/* Quote text */}
                  <div
                    style={{
                      fontSize: 13,
                      fontStyle: 'italic',
                      color: C.text,
                      lineHeight: 1.65,
                      flexGrow: 1,
                    }}
                  >
                    {quote.text}
                  </div>
                  {/* Footer: provider badge + query */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      paddingTop: 8,
                      borderTop: `1px solid ${C.border}`,
                    }}
                  >
                    <div
                      style={{
                        padding: '2px 8px',
                        borderRadius: 12,
                        background: `${providerColor}20`,
                        border: `1px solid ${providerColor}40`,
                        fontSize: 10,
                        fontWeight: 700,
                        color: providerColor,
                        textTransform: 'capitalize' as const,
                        letterSpacing: 0.5,
                        flexShrink: 0,
                      }}
                    >
                      {quote.provider}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: C.faint,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {quote.query}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Insight */}
          <div
            style={{
              background: `rgba(139,92,246,0.06)`,
              border: `1px solid rgba(139,92,246,0.2)`,
              borderRadius: 10,
              padding: '16px 20px',
            }}
          >
            <div style={{ fontSize: 13, color: C.text, lineHeight: 1.7 }}>
              <strong style={{ color: C.purple }}>Insight:</strong> When AI mentions{' '}
              <strong>{brandName}</strong>, it consistently uses language like{' '}
              {positiveWords.length > 0 ? (
                <>
                  {positiveWords.map((word, i) => (
                    <span key={word}>
                      <em style={{ color: C.muted }}>"{word}"</em>
                      {i < positiveWords.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                  . These associations can be amplified by reinforcing these themes in your
                  content strategy and structured data.
                </>
              ) : (
                <>
                  terms that reflect its current reputation. Strengthen these associations
                  through consistent content signals and authoritative citations.
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
