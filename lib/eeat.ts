// lib/eeat.ts
// Calculates E-E-A-T scores from RunResults data for the GEO Visibility PDF Report

import { RunResults } from './types';

export interface EEATDimension {
  score: number; // 0-100
  label: string;
  description: string;
  insight: string;
  color: string;
}

export interface EEATScore {
  experience: EEATDimension;
  expertise: EEATDimension;
  authoritativeness: EEATDimension;
  trustworthiness: EEATDimension;
  overall: number;
}

function getColor(score: number): string {
  if (score >= 70) return '#10b981';
  if (score >= 40) return '#f59e0b';
  return '#ef4444';
}

export function calculateEEAT(results: RunResults, brandName: string): EEATScore {
  const { summary, results: queryResults } = results;

  // ── Experience ──────────────────────────────────────────────────────────────
  // Avg sentiment of brand-mentioned results, normalised from [-1, 1] → [0, 100]
  const mentionedResults = queryResults.filter((r) => r.brandMentioned);
  let experienceScore = 30; // default when no mentions

  if (mentionedResults.length > 0) {
    const sentimentResults = mentionedResults.filter(
      (r) => typeof r.sentiment === 'number'
    );
    if (sentimentResults.length > 0) {
      const avgSentiment =
        sentimentResults.reduce((sum, r) => sum + (r.sentiment as number), 0) /
        sentimentResults.length;
      // Normalise [-1, 1] → [0, 100]
      experienceScore = Math.round(((avgSentiment + 1) / 2) * 100);
    }
  }

  const experienceColor = getColor(experienceScore);
  const experienceMentionCount = mentionedResults.length;
  const experienceInsight =
    mentionedResults.length > 0
      ? `${brandName} was mentioned in ${experienceMentionCount} out of ${queryResults.length} queries with an average sentiment that maps to a score of ${experienceScore}/100. ${
          experienceScore >= 70
            ? 'Positive framing in AI responses strongly reinforces brand trust.'
            : experienceScore >= 40
            ? 'Neutral-to-mixed sentiment leaves room to improve how AI models describe brand experiences.'
            : 'Negative or absent sentiment signals that AI models may be misrepresenting brand experiences.'
        }`
      : `${brandName} was not detected in any AI responses, resulting in a default Experience score of 30. Publishing first-hand use-case content and testimonials can shift AI models toward positive brand framing.`;

  const experience: EEATDimension = {
    score: experienceScore,
    label: 'Experience',
    description: 'Measures how positively AI models describe brand interactions and customer outcomes.',
    insight: experienceInsight,
    color: experienceColor,
  };

  // ── Expertise ────────────────────────────────────────────────────────────────
  // Avg trustAuthority * 100; default 40 when no data
  const authorityResults = queryResults.filter(
    (r) => typeof r.trustAuthority === 'number'
  );
  let expertiseScore = 40;

  if (authorityResults.length > 0) {
    const avgTrustAuthority =
      authorityResults.reduce((sum, r) => sum + (r.trustAuthority as number), 0) /
      authorityResults.length;
    expertiseScore = Math.round(avgTrustAuthority * 100);
  }

  const expertiseColor = getColor(expertiseScore);
  const expertiseInsight =
    authorityResults.length > 0
      ? `Across ${authorityResults.length} scored responses, the average source authority for ${brandName} is ${expertiseScore}/100. ${
          expertiseScore >= 70
            ? 'High-authority citations indicate AI models treat your content as a credible expert source.'
            : expertiseScore >= 40
            ? 'Moderate authority suggests increasing citations from industry publications and research institutions.'
            : 'Low authority scores indicate AI models are rarely pulling from authoritative sources that mention your brand.'
        }`
      : `No trust-authority data was available for this run; a default Expertise score of 40 has been applied. Generating content cited by domain-authority-rich sites will improve this metric over future runs.`;

  const expertise: EEATDimension = {
    score: expertiseScore,
    label: 'Expertise',
    description: 'Reflects the authority level of sources that reference your brand in AI-generated answers.',
    insight: expertiseInsight,
    color: expertiseColor,
  };

  // ── Authoritativeness ────────────────────────────────────────────────────────
  // Avg trustSunday * 100; default 15 when no data
  const sundayResults = queryResults.filter(
    (r) => typeof r.trustSunday === 'number'
  );
  let authScore = 15;

  if (sundayResults.length > 0) {
    const avgTrustSunday =
      sundayResults.reduce((sum, r) => sum + (r.trustSunday as number), 0) /
      sundayResults.length;
    authScore = Math.round(avgTrustSunday * 100);
  }

  const authColor = getColor(authScore);
  const authInsight =
    sundayResults.length > 0
      ? `Brand-owned sources represent ${authScore}% of citations on average across ${sundayResults.length} responses. ${
          authScore >= 70
            ? `${brandName}'s own properties dominate the source mix — excellent signal for AI knowledge graph ownership.`
            : authScore >= 40
            ? `Moderate brand-owned citation share; publishing more structured, linkable content on owned domains will improve this.`
            : `Brand-owned sources are rarely cited — a concerted content authority campaign is needed to shift AI attribution toward ${brandName}'s properties.`
        }`
      : `No brand-owned source data was found in this run; a default Authoritativeness score of 15 has been applied. Publishing well-structured content on ${brandName}'s primary domain with clear entity signals is the highest-impact starting point.`;

  const authoritativeness: EEATDimension = {
    score: authScore,
    label: 'Authoritativeness',
    description: 'Measures the proportion of AI citations that come from brand-owned or brand-controlled sources.',
    insight: authInsight,
    color: authColor,
  };

  // ── Trustworthiness ──────────────────────────────────────────────────────────
  // composite = (positiveRate * 0.6 + (1 - negativeRatio) * 0.4) * 100
  const totalResults = queryResults.length;
  let trustScore = 50;

  if (mentionedResults.length > 0 && totalResults > 0) {
    const positiveCount = mentionedResults.filter(
      (r) => typeof r.sentiment === 'number' && (r.sentiment as number) > 0.1
    ).length;
    const positiveRate = positiveCount / mentionedResults.length;

    const negativeCount = queryResults.filter(
      (r) => typeof r.sentiment === 'number' && (r.sentiment as number) < -0.3
    ).length;
    const negativeRatio = negativeCount / totalResults;

    trustScore = Math.round((positiveRate * 0.6 + (1 - negativeRatio) * 0.4) * 100);
  }

  const trustColor = getColor(trustScore);
  const positiveRateDisplay =
    mentionedResults.length > 0
      ? Math.round(
          (mentionedResults.filter(
            (r) => typeof r.sentiment === 'number' && (r.sentiment as number) > 0.1
          ).length /
            mentionedResults.length) *
            100
        )
      : 0;
  const trustInsight =
    mentionedResults.length > 0
      ? `${positiveRateDisplay}% of responses where ${brandName} was mentioned carried positive sentiment, contributing to a composite Trustworthiness score of ${trustScore}/100. ${
          trustScore >= 70
            ? 'Strong positive framing and low negative-response rates signal high AI model trust in the brand.'
            : trustScore >= 40
            ? 'A moderate score indicates mixed signals — reducing negative-sentiment responses through proactive content can lift this significantly.'
            : 'Low trustworthiness reflects either few positive mentions or a notable share of negative-sentiment responses; a reputation-repair content strategy is recommended.'
        }`
      : `${brandName} was not mentioned in any responses, so Trustworthiness defaults to a composite of 50. Establishing brand presence across authoritative sources is the prerequisite for improving this dimension.`;

  const trustworthiness: EEATDimension = {
    score: trustScore,
    label: 'Trustworthiness',
    description: 'Composite of positive-mention rate and absence of negative signals across all AI responses.',
    insight: trustInsight,
    color: trustColor,
  };

  // ── Overall ──────────────────────────────────────────────────────────────────
  const overall = Math.round(
    (experienceScore + expertiseScore + authScore + trustScore) / 4
  );

  return {
    experience,
    expertise,
    authoritativeness,
    trustworthiness,
    overall,
  };
}
