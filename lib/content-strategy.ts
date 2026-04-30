// lib/content-strategy.ts
// Generates actionable content strategy from RunResults for the GEO Visibility PDF Report

import { RunResults } from './types';

export interface ContentGap {
  query: string;
  category: string;
  competitors: string[];
  priority: 'critical' | 'high' | 'medium';
}

export interface OutreachTarget {
  domain: string;
  citations: number;
  priority: 'critical' | 'high' | 'medium';
}

export interface ContentPlanItem {
  timeframe: '30' | '60' | '90';
  action: string;
  specifics: string;
  owner: 'SEO' | 'Content' | 'PR' | 'Dev' | 'Marketing';
  impact: string;
  priority: 'high' | 'medium' | 'low';
}

export interface ContentStrategy {
  gaps: ContentGap[];
  outreachTargets: OutreachTarget[];
  plan: ContentPlanItem[];
  quickWins: string[];
}

function extractDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    // Fallback: strip protocol and path manually
    return url
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .split('/')[0];
  }
}

function getGapPriority(competitorCount: number): 'critical' | 'high' | 'medium' {
  if (competitorCount >= 3) return 'critical';
  if (competitorCount >= 2) return 'high';
  return 'medium';
}

function getOutreachPriority(citations: number): 'critical' | 'high' | 'medium' {
  if (citations >= 2) return 'critical';
  return 'high';
}

export function generateContentStrategy(
  results: RunResults,
  brandName: string
): ContentStrategy {
  const { results: queryResults } = results;

  // ── Gaps ────────────────────────────────────────────────────────────────────
  // Queries where brand was NOT mentioned but competitors were detected
  const gapResults = queryResults.filter(
    (r) => !r.brandMentioned && r.otherBrandsDetected.length > 0
  );

  // Sort by competitor count descending, take top 10
  gapResults.sort((a, b) => b.otherBrandsDetected.length - a.otherBrandsDetected.length);

  const gaps: ContentGap[] = gapResults.slice(0, 10).map((r) => ({
    query: r.question,
    category: r.category ?? 'General',
    competitors: r.otherBrandsDetected,
    priority: getGapPriority(r.otherBrandsDetected.length),
  }));

  // ── Outreach Targets ────────────────────────────────────────────────────────
  // Count domain frequency across ALL sources in ALL results
  const domainFrequency: Record<string, number> = {};

  for (const r of queryResults) {
    for (const source of r.sources) {
      if (!source.url) continue;
      const domain = extractDomain(source.url);
      if (domain) {
        domainFrequency[domain] = (domainFrequency[domain] ?? 0) + 1;
      }
    }
  }

  // Sort by citation count, take top 8
  const sortedDomains = Object.entries(domainFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);

  const outreachTargets: OutreachTarget[] = sortedDomains.map(([domain, citations]) => ({
    domain,
    citations,
    priority: getOutreachPriority(citations),
  }));

  // ── Helpers for contextual plan items ──────────────────────────────────────
  const topGapQuery = gaps[0]?.query ?? 'key industry questions';
  const topGapQuery2 = gaps[1]?.query ?? 'supplemental queries';
  const topDomain = outreachTargets[0]?.domain ?? 'high-authority publication';
  const topDomain2 = outreachTargets[1]?.domain ?? 'secondary publication';
  const topDomain3 = outreachTargets[2]?.domain ?? 'tertiary publication';
  const topCompetitor = gaps[0]?.competitors[0] ?? 'leading competitor';

  const uniqueCategories = Array.from(new Set(gaps.map((g) => g.category)));
  const topCategory = uniqueCategories[0] ?? 'core product category';
  const secondCategory = uniqueCategories[1] ?? 'secondary category';

  // ── Content Plan ────────────────────────────────────────────────────────────
  const plan: ContentPlanItem[] = [
    // 30-day items
    {
      timeframe: '30',
      action: 'Optimise existing pages for top content gaps',
      specifics: `Update landing pages and blog posts to directly answer "${topGapQuery}" — the highest-priority gap where ${topCompetitor} currently appears without ${brandName}.`,
      owner: 'SEO',
      impact: 'Bridges the most critical visibility gap within existing content assets',
      priority: 'high',
    },
    {
      timeframe: '30',
      action: 'Add FAQ schema markup to top-ranking pages',
      specifics: `Implement FAQ schema on pages targeting "${topGapQuery2}" to signal structured expertise to AI models and increase citation likelihood.`,
      owner: 'Dev',
      impact: 'Structured data improves AI model parsability and boosts E-E-A-T signals',
      priority: 'high',
    },
    {
      timeframe: '30',
      action: `Submit content to ${topDomain}`,
      specifics: `Pitch a contributed article or data study to ${topDomain} (${outreachTargets[0]?.citations ?? 1} existing citations), establishing ${brandName} as an expert source on that platform.`,
      owner: 'PR',
      impact: 'Directly targets the highest-frequency citation source in AI responses',
      priority: 'high',
    },

    // 60-day items
    {
      timeframe: '60',
      action: `Publish definitive guides for top gap categories`,
      specifics: `Create long-form pillar content for "${topCategory}" and "${secondCategory}" — the two categories with the most unanswered queries. Include original data, comparisons, and expert quotes.`,
      owner: 'Content',
      impact: 'Positions brand as category authority across the broadest query clusters',
      priority: 'high',
    },
    {
      timeframe: '60',
      action: `PR outreach to ${topDomain2} and ${topDomain3}`,
      specifics: `Develop a joint research piece or expert commentary for ${topDomain2} and ${topDomain3}, both of which are already citing competitors in AI responses.`,
      owner: 'PR',
      impact: 'Displaces competitor citations on two high-value domains simultaneously',
      priority: 'medium',
    },
    {
      timeframe: '60',
      action: 'Launch review velocity campaign',
      specifics: `Activate a post-purchase review sequence targeting G2, Trustpilot, and Google to increase the volume of authentic brand mentions that AI models can cite.`,
      owner: 'Marketing',
      impact: 'Boosts trustworthiness signals and diversifies citation sources',
      priority: 'medium',
    },

    // 90-day items
    {
      timeframe: '90',
      action: 'Commission third-party product testing and benchmarks',
      specifics: `Partner with an independent testing body to publish a benchmark study featuring ${brandName}. Target platforms already citing competitors: ${topDomain}, ${topDomain2}.`,
      owner: 'Marketing',
      impact: 'Creates neutral, citable third-party evidence that shifts AI model responses',
      priority: 'high',
    },
    {
      timeframe: '90',
      action: 'Systematic knowledge graph entity reinforcement',
      specifics: `Submit ${brandName} entity data to Wikidata and Google's Knowledge Graph, and ensure Wikipedia references align with current positioning to reduce AI hallucination risk.`,
      owner: 'SEO',
      impact: 'Anchors brand facts in AI training sources, reducing misattribution long-term',
      priority: 'medium',
    },
    {
      timeframe: '90',
      action: 'Competitive displacement campaign on critical gap queries',
      specifics: `For the ${Math.min(gaps.filter((g) => g.priority === 'critical').length, 5)} critical gap queries, run targeted link-building and content amplification so ${brandName} consistently appears alongside or above ${topCompetitor}.`,
      owner: 'Content',
      impact: 'Converts the highest-priority gaps into brand visibility wins within one quarter',
      priority: 'high',
    },
  ];

  // ── Quick Wins ──────────────────────────────────────────────────────────────
  const quickWins: string[] = [
    `Add ${brandName} as an answer source on "${topGapQuery}" — ${topCompetitor} already appears here without you.`,
    `Claim and optimise your brand profile on ${topDomain} (${outreachTargets[0]?.citations ?? 1} AI citations) to capture easy brand mentions.`,
    `Publish a comparison page targeting "${topGapQuery2}" — this query already surfaces ${gaps[1]?.competitors.slice(0, 2).join(' and ') ?? 'competitors'} but not ${brandName}.`,
    `Add FAQ schema to your top 5 blog posts; structured markup is one of the fastest signals AI models use to attribute expertise.`,
    `Request a featured mention or data contribution on ${topDomain2 ?? 'a top-cited publication'} — a single authoritative citation can shift AI response patterns within weeks.`,
  ];

  return {
    gaps,
    outreachTargets,
    plan,
    quickWins,
  };
}
