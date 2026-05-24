'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { GeoRaydarLogo } from '@/components/GeoRaydarLogo';
import { ArrowLeft, Quote, TrendingUp, Target, Zap, ArrowRight } from 'lucide-react';

export default function CaseStudiesPage() {
  return (
    <div className="min-h-screen bg-dark-900">
      {/* Nav */}
      <nav className="border-b border-dark-700 py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link href="/">
            <GeoRaydarLogo size="sm" />
          </Link>
          <Link
            href="/#contact"
            className="px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg text-sm font-medium transition-colors"
          >
            Get Your Free Audit
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-dark-400 hover:text-white transition-colors mb-12"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-500/10 border border-primary-500/30 rounded-full text-xs text-primary-400 mb-6">
            <Zap className="w-3 h-3" />
            Real Results
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Case Studies</h1>
          <p className="text-dark-400 text-lg max-w-xl">
            How brands are measuring and growing their presence in AI-generated responses.
          </p>
        </motion.div>

        {/* Case Study Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-dark-800 rounded-3xl border border-dark-700 overflow-hidden mb-8"
        >
          {/* Top bar */}
          <div className="bg-gradient-to-r from-primary-500/20 to-secondary/10 border-b border-dark-700 px-8 py-5 flex items-center justify-between">
            <div>
              <div className="text-xs text-primary-400 font-medium mb-1">CASE STUDY</div>
              <h2 className="text-xl font-bold">Premium Supplement Brand</h2>
              <div className="text-sm text-dark-400 mt-0.5">Health &amp; Nutrition — Germany</div>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-sm text-secondary font-medium">
              <TrendingUp className="w-4 h-4" />
              +292% AI presence
            </div>
          </div>

          <div className="p-8">
            {/* Metrics */}
            <div className="grid grid-cols-3 gap-4 mb-10">
              <div className="bg-dark-900 rounded-xl p-5 border border-dark-700 text-center">
                <div className="text-3xl font-bold text-red-400 mb-1">12%</div>
                <div className="text-xs text-dark-500">Presence before</div>
              </div>
              <div className="bg-dark-900 rounded-xl p-5 border border-dark-700 text-center">
                <div className="text-3xl font-bold text-secondary mb-1">47%</div>
                <div className="text-xs text-dark-500">After 3 months</div>
              </div>
              <div className="bg-dark-900 rounded-xl p-5 border border-dark-700 text-center">
                <div className="text-3xl font-bold text-primary-400 mb-1">4</div>
                <div className="text-xs text-dark-500">LLMs tracked</div>
              </div>
            </div>

            {/* Story */}
            <div className="grid md:grid-cols-3 gap-8 mb-10">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-dark-700 flex items-center justify-center">
                    <Target className="w-3 h-3 text-dark-400" />
                  </div>
                  <span className="text-sm font-semibold text-dark-300">The Problem</span>
                </div>
                <p className="text-sm text-dark-400 leading-relaxed">
                  A leading European supplement brand had strong traditional SEO rankings but zero visibility into how AI assistants were responding to purchase-intent queries in their category.
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-dark-700 flex items-center justify-center">
                    <Zap className="w-3 h-3 text-primary-400" />
                  </div>
                  <span className="text-sm font-semibold text-dark-300">What We Did</span>
                </div>
                <p className="text-sm text-dark-400 leading-relaxed">
                  GeoRaydar built a 120-query library covering product recommendations, comparisons, and ingredient queries. We tracked responses weekly across GPT-4, Claude, Gemini, and Perplexity, then identified the content and citation gaps driving low mentions.
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-dark-700 flex items-center justify-center">
                    <TrendingUp className="w-3 h-3 text-secondary" />
                  </div>
                  <span className="text-sm font-semibold text-dark-300">The Result</span>
                </div>
                <p className="text-sm text-dark-400 leading-relaxed">
                  In 12 weeks, presence rate grew from 12% to 47% across tracked queries. The brand went from unmentioned in most AI responses to appearing in nearly half — including as a first recommendation in 3 out of 4 LLMs for their core product category.
                </p>
              </div>
            </div>

            {/* Quote */}
            <div className="bg-dark-900 rounded-2xl p-6 border border-dark-700">
              <Quote className="w-6 h-6 text-primary-500 mb-3" />
              <p className="text-base text-white leading-relaxed mb-4">
                &ldquo;GeoRaydar gave us visibility into a completely blind spot. We had no idea competitors were dominating AI recommendations while we focused solely on traditional SEO.&rdquo;
              </p>
              <div className="text-sm text-dark-400">Marketing Director, Premium Supplement Brand</div>
            </div>
          </div>
        </motion.div>

        {/* More coming */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center py-12 border border-dashed border-dark-700 rounded-2xl mb-16"
        >
          <p className="text-dark-500 text-sm mb-1">More case studies coming soon.</p>
          <p className="text-dark-600 text-xs">Brands in SaaS, e-commerce, and finance.</p>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-gradient-to-br from-primary-500/10 to-secondary/10 rounded-3xl border border-primary-500/30 p-10 text-center"
        >
          <h2 className="text-2xl font-bold mb-3">Want results like these?</h2>
          <p className="text-dark-400 mb-8 max-w-md mx-auto">
            We&apos;ll audit your brand&apos;s current AI presence and show you exactly where the gaps are — free.
          </p>
          <Link
            href="/#contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary-500 hover:bg-primary-600 rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-primary-500/25"
          >
            Get Your Free Audit <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
