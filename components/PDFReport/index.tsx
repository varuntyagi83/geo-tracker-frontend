'use client';

import { forwardRef } from 'react';
import type { RunResults } from '@/lib/types';
import type { EEATScore } from '@/lib/eeat';
import type { ContentStrategy } from '@/lib/content-strategy';
import type { OptimizationStrategy } from '@/lib/optimization-strategies';
import { calculateEEAT } from '@/lib/eeat';
import { generateContentStrategy } from '@/lib/content-strategy';
import { generateOptimizationStrategies } from '@/lib/optimization-strategies';

// Section components
import { CoverPage } from './CoverPage';
import { VisibilitySection } from './VisibilitySection';
import { EEATSection } from './EEATSection';
import { HeatMapSection } from './HeatMapSection';
import { TopicClusterSection } from './TopicClusterSection';
import { CompetitorSection } from './CompetitorSection';
import { SentimentSection } from './SentimentSection';
import { QuotesSection } from './QuotesSection';
import { SourceSection } from './SourceSection';
import { ProviderStrategySection } from './ProviderStrategySection';
import { OptimizationStrategiesSection } from './OptimizationStrategiesSection';
import { AIStrategiesSection } from './AIStrategiesSection';
import { ContentPlanSection } from './ContentPlanSection';
import { OpportunitySizingSection } from './OpportunitySizingSection';
import { AEOSection } from './AEOSection';
import { ExecutiveScorecard } from './ExecutiveScorecard';
import { MethodologySection } from './MethodologySection';

export interface PDFReportProps {
  results: RunResults;
  brandName: string;
  market?: string;
  lang?: string;
  /** Optional AI-generated narrative text from the VisibilityReport component */
  aiReport?: string;
}

/**
 * PDFReport — the main hidden container that composes all 17 report sections.
 *
 * Accepts a forwarded ref so the parent dashboard can pass the root element
 * directly to `exportReportToPDF(containerElement, brandName)` via html2canvas.
 *
 * The component is positioned off-screen (left: -9999px) so it renders in the
 * DOM for html2canvas without being visible to the user.
 */
export const PDFReport = forwardRef<HTMLDivElement, PDFReportProps>(
  ({ results, brandName, market, lang, aiReport }, ref) => {
    // Derive computed data once at the orchestrator level so all sections
    // receive the same stable values.
    const eeat: EEATScore = calculateEEAT(results, brandName);
    const contentStrategy: ContentStrategy = generateContentStrategy(results, brandName);
    const strategies: OptimizationStrategy[] = generateOptimizationStrategies(results, brandName);

    return (
      <div
        ref={ref}
        data-pdf-container
        style={{
          position: 'fixed',
          left: '-9999px',
          top: 0,
          width: '794px',
          background: '#0f172a',
          zIndex: -1,
        }}
      >
        {/* Section 0: Cover Page */}
        <CoverPage
          results={results}
          brandName={brandName}
          market={market}
          lang={lang}
        />

        {/* Section 1: GEO Visibility Score */}
        <VisibilitySection results={results} brandName={brandName} />

        {/* Section 2 (or wherever EEATSection sits): E-E-A-T Analysis */}
        <EEATSection results={results} brandName={brandName} eeat={eeat} />

        {/* Section 3: Query Heat Map */}
        <HeatMapSection results={results} brandName={brandName} />

        {/* Section 4: Topic Cluster Analysis */}
        <TopicClusterSection results={results} brandName={brandName} />

        {/* Section 5: Competitor Intelligence */}
        <CompetitorSection results={results} brandName={brandName} />

        {/* Section 6: Sentiment Depth Profile */}
        <SentimentSection results={results} brandName={brandName} />

        {/* Section 7: Brand Quotes & Verbatims */}
        <QuotesSection results={results} brandName={brandName} />

        {/* Section 8: Source & Citation Analysis */}
        <SourceSection results={results} brandName={brandName} />

        {/* Section 9: Provider Strategy Breakdown */}
        <ProviderStrategySection results={results} brandName={brandName} />

        {/* Section 10–11: Optimization Strategies */}
        <OptimizationStrategiesSection
          results={results}
          brandName={brandName}
          strategies={strategies}
        />

        {/* Section 12–13: AI-Generated Strategic Narrative */}
        <AIStrategiesSection
          results={results}
          brandName={brandName}
          aiReport={aiReport}
        />

        {/* Section 14: 30/60/90 Day Content Plan */}
        <ContentPlanSection
          results={results}
          brandName={brandName}
          strategy={contentStrategy}
        />

        {/* Section 15: Opportunity Sizing */}
        <OpportunitySizingSection results={results} brandName={brandName} />

        {/* Section 16: AEO Readiness Score (Placeholder) */}
        <AEOSection brandName={brandName} />

        {/* Section 17: Executive Scorecard */}
        <ExecutiveScorecard results={results} brandName={brandName} eeat={eeat} />

        {/* Section 18: Methodology & Glossary */}
        <MethodologySection results={results} />
      </div>
    );
  }
);

PDFReport.displayName = 'PDFReport';
