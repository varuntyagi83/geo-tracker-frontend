// lib/optimization-strategies.ts
// Generates data-driven optimisation strategies for the GEO Visibility PDF Report

import { RunResults } from './types';

export interface OptimizationStrategy {
  id: string;
  title: string;
  iconEmoji: string;
  color: string;
  bgColor: string; // rgba with 0.12 opacity
  description: string;
  actions: string[]; // 4 specific actions
  priority: 'critical' | 'high' | 'medium';
  relevanceScore: number; // 0-100
  whyRelevant: string; // 1-sentence explanation tied to specific data
}

function extractDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return url
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .split('/')[0];
  }
}

function hexToRgba(hex: string, alpha: number): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return `rgba(0,0,0,${alpha})`;
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getPriority(score: number): 'critical' | 'high' | 'medium' {
  if (score >= 85) return 'critical';
  if (score >= 65) return 'high';
  return 'medium';
}

export function generateOptimizationStrategies(
  results: RunResults,
  brandName: string
): OptimizationStrategy[] {
  const { summary, results: queryResults } = results;
  const overallVisibility = summary.overallVisibility ?? 0;
  const totalQueries = queryResults.length;

  // ── Derived data ──────────────────────────────────────────────────────────
  const gapQueries = queryResults.filter(
    (r) => !r.brandMentioned && r.otherBrandsDetected.length > 0
  );
  const gapCount = gapQueries.length;
  const topGapQuery = gapQueries[0]?.question ?? 'key industry queries';
  const topGapQuery2 = gapQueries[1]?.question ?? 'supplemental queries';

  // Collect all source domains
  const domainFrequency: Record<string, number> = {};
  let reviewSitesCited = 0;
  const reviewDomains = ['trustpilot', 'g2', 'capterra', 'yelp', 'tripadvisor', 'reviews.io', 'sitejabber'];
  let hasWikipediaSource = false;

  for (const r of queryResults) {
    for (const source of r.sources) {
      if (!source.url) continue;
      const domain = extractDomain(source.url);
      if (!domain) continue;
      domainFrequency[domain] = (domainFrequency[domain] ?? 0) + 1;
      if (domain.includes('wikipedia')) hasWikipediaSource = true;
      if (reviewDomains.some((rd) => domain.includes(rd))) reviewSitesCited++;
    }
  }

  const totalSourceDomains = Object.keys(domainFrequency).length;
  const sortedDomains = Object.entries(domainFrequency)
    .sort(([, a], [, b]) => b - a);
  const topDomain = sortedDomains[0]?.[0] ?? 'high-authority publication';
  const topDomain2 = sortedDomains[1]?.[0] ?? 'secondary publication';
  const topDomain3 = sortedDomains[2]?.[0] ?? 'tertiary publication';

  const topCompetitor =
    gapQueries[0]?.otherBrandsDetected[0] ??
    Object.keys(summary.competitorVisibility ?? {})[0] ??
    'leading competitor';
  const topCompetitor2 =
    gapQueries[0]?.otherBrandsDetected[1] ??
    Object.keys(summary.competitorVisibility ?? {})[1] ??
    'secondary competitor';

  const visibilityDisplay = `${overallVisibility.toFixed(1)}%`;

  // ── Relevance Scores ─────────────────────────────────────────────────────
  const contentAuthorityScore = Math.min(100, Math.round(100 - overallVisibility));
  const structuredDataScore = 85;
  const citationBuildingScore = totalSourceDomains > 5 ? 90 : 95;
  const knowledgeGraphScore = hasWikipediaSource ? 55 : 85;
  const reviewVelocityScore = reviewSitesCited < 2 ? 90 : 60;

  // ── Strategy Definitions ─────────────────────────────────────────────────
  const strategies: OptimizationStrategy[] = [
    {
      id: 'content-authority',
      title: 'Content Authority',
      iconEmoji: '📚',
      color: '#3b82f6',
      bgColor: hexToRgba('#3b82f6', 0.12),
      description:
        `Build and promote deep, expert-level content that directly answers the ${gapCount} queries where ${brandName} is currently absent from AI responses.`,
      actions: [
        `Publish a comprehensive pillar page targeting "${topGapQuery}" — the highest-impact gap where ${topCompetitor} currently appears without ${brandName}.`,
        `Create supporting cluster content around "${topGapQuery2}" with first-hand data, expert quotes, and original research.`,
        `Optimise all existing pages with clear entity signals (brand name, founding date, product categories) in title tags and structured data.`,
        `Establish a cadence of monthly thought-leadership pieces in the categories where AI gap queries are concentrated.`,
      ],
      priority: getPriority(contentAuthorityScore),
      relevanceScore: contentAuthorityScore,
      whyRelevant: `With only ${visibilityDisplay} visibility and ${gapCount} queries where competitors appeared without ${brandName}, content gaps are the #1 lever for GEO improvement.`,
    },
    {
      id: 'structured-data',
      title: 'Structured Data',
      iconEmoji: '🗄️',
      color: '#8b5cf6',
      bgColor: hexToRgba('#8b5cf6', 0.12),
      description:
        'Implement schema markup and machine-readable entity signals so AI models can accurately parse, attribute, and cite brand content.',
      actions: [
        `Add FAQ schema to the top 10 pages targeting your highest-volume gap queries, starting with content around "${topGapQuery}".`,
        'Implement Organization, Product, and BreadcrumbList schema across all primary domain pages to reinforce brand entity recognition.',
        'Create a machine-readable brand entity page (JSON-LD) that consolidates founding year, key personnel, product lines, and authoritative external references.',
        `Submit updated sitemaps and schema to Google Search Console and Bing Webmaster Tools to accelerate indexing after each update.`,
      ],
      priority: getPriority(structuredDataScore),
      relevanceScore: structuredDataScore,
      whyRelevant: `Structured data is universally critical for AI model attribution; without it, even strong content is harder for models like ChatGPT and Gemini to accurately cite ${brandName}.`,
    },
    {
      id: 'citation-building',
      title: 'Citation Building',
      iconEmoji: '🌐',
      color: '#14b8a6',
      bgColor: hexToRgba('#14b8a6', 0.12),
      description:
        `Secure brand mentions and backlinks on the ${totalSourceDomains} domains already cited by AI models to shift citation patterns in ${brandName}'s favour.`,
      actions: [
        `Pitch a contributed article to ${topDomain} — the most-cited domain in these AI responses — positioning ${brandName} as an expert source.`,
        `Develop a joint data piece with ${topDomain2} or ${topDomain3} that prominently features ${brandName}'s insights or product results.`,
        `Identify and pursue unlinked brand mentions across the top 20 citing domains, converting them into formal citations.`,
        `Build a PR calendar targeting 2 new authoritative domain mentions per month for the next 6 months.`,
      ],
      priority: getPriority(citationBuildingScore),
      relevanceScore: citationBuildingScore,
      whyRelevant: `AI models draw heavily from ${totalSourceDomains} detected source domains; securing placement on these same properties is the fastest path to citation parity with competitors.`,
    },
    {
      id: 'knowledge-graph',
      title: 'Knowledge Graph',
      iconEmoji: '🔷',
      color: '#f59e0b',
      bgColor: hexToRgba('#f59e0b', 0.12),
      description:
        `Establish and reinforce ${brandName}'s entity presence in Wikipedia, Wikidata, and Google's Knowledge Graph to reduce AI hallucination and improve attribution accuracy.`,
      actions: [
        hasWikipediaSource
          ? `Expand and update ${brandName}'s Wikipedia article — already detected in AI citations — with current product lines, milestones, and verifiable third-party references.`
          : `Create or claim a Wikipedia article for ${brandName}; Wikipedia is not yet in the citation pool, representing a high-value gap.`,
        `Submit verified entity data to Wikidata (brand name, founding year, industry, HQ location) and link back to the primary domain.`,
        `Ensure Google's Knowledge Panel for ${brandName} is claimed and all fields (description, social profiles, products) are accurate and current.`,
        `Cross-reference entity data consistently across Crunchbase, LinkedIn, and industry directories to reinforce the knowledge graph signal.`,
      ],
      priority: getPriority(knowledgeGraphScore),
      relevanceScore: knowledgeGraphScore,
      whyRelevant: hasWikipediaSource
        ? `Wikipedia is already appearing in AI citations for this topic — updating and expanding ${brandName}'s page will directly boost attribution.`
        : `Wikipedia is absent from the citation pool, which is a significant missed opportunity; AI models heavily weight Wikipedia as an authoritative entity source.`,
    },
    {
      id: 'review-velocity',
      title: 'Review & Mention Velocity',
      iconEmoji: '⭐',
      color: '#10b981',
      bgColor: hexToRgba('#10b981', 0.12),
      description:
        `Increase the volume and recency of authentic reviews, ratings, and brand mentions so AI models treat ${brandName} as a well-validated, trustworthy option.`,
      actions: [
        `Launch an automated post-purchase email sequence requesting reviews on G2, Trustpilot, and Google — ${reviewSitesCited < 2 ? 'currently underrepresented in AI citations' : 'already present but needing higher volume'}.`,
        `Incentivise video testimonials from top customers and publish them on YouTube with structured schema, creating a new citation-eligible asset type.`,
        `Set up Google Alerts and Brand24 monitoring to detect unbranded mentions of ${brandName} and engage promptly to convert them to attributed citations.`,
        `Partner with ${topCompetitor2 !== 'secondary competitor' ? `industry influencers in the ${topCompetitor} category` : 'category influencers'} for co-authored content that generates third-party brand mentions.`,
      ],
      priority: getPriority(reviewVelocityScore),
      relevanceScore: reviewVelocityScore,
      whyRelevant: reviewSitesCited < 2
        ? `Only ${reviewSitesCited} review platform${reviewSitesCited === 1 ? '' : 's'} appeared in AI citations for ${brandName}; review sites are high-trust sources that AI models weight heavily for consumer queries.`
        : `Review platforms are present in citations, but increasing review velocity will help ${brandName} maintain and grow its trust signals as AI models refresh their training data.`,
    },
  ];

  // Sort by relevanceScore descending
  strategies.sort((a, b) => b.relevanceScore - a.relevanceScore);

  return strategies;
}
