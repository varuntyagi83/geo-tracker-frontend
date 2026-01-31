// app/page.tsx - Landing Page
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import {
  Globe,
  ArrowRight,
  Search,
  BarChart3,
  TrendingUp,
  Zap,
  Target,
  Users,
  CheckCircle2,
  ChevronRight,
  MessageSquare,
  Eye,
  Shield,
  BookOpen,
  Database,
  Star,
  Quote,
  Send,
  Menu,
  X,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';

// ==============================================
// MOCK DATA FOR DASHBOARD PREVIEW
// ==============================================

const presenceData = [
  { week: 'W1', presence: 18 },
  { week: 'W2', presence: 19 },
  { week: 'W3', presence: 17 },
  { week: 'W4', presence: 21 },
  { week: 'W5', presence: 24 },
  { week: 'W6', presence: 28 },
  { week: 'W7', presence: 31 },
  { week: 'W8', presence: 29 },
  { week: 'W9', presence: 34 },
  { week: 'W10', presence: 38 },
  { week: 'W11', presence: 41 },
  { week: 'W12', presence: 45 },
];

const llmBreakdown = [
  { name: 'GPT-4', presence: 31, color: '#10B981' },
  { name: 'Claude', presence: 28, color: '#3B82F6' },
  { name: 'Gemini', presence: 22, color: '#F59E0B' },
  { name: 'Perplexity', presence: 41, color: '#8B5CF6' },
];

const competitorData = [
  { name: 'Your Brand', presence: 31, color: '#3B82F6' },
  { name: 'Competitor A', presence: 67, color: '#EF4444' },
  { name: 'Competitor B', presence: 54, color: '#F59E0B' },
  { name: 'Competitor C', presence: 23, color: '#6B7280' },
];

const queryCategories = [
  { category: 'Product recommendations', percentage: 45 },
  { category: 'Brand comparisons', percentage: 25 },
  { category: 'Industry knowledge', percentage: 18 },
  { category: 'Purchase intent', percentage: 12 },
];

// ==============================================
// ANIMATED COUNTER COMPONENT
// ==============================================

function AnimatedCounter({ value, suffix = '%', duration = 2 }: { value: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = value;
      const increment = end / (duration * 60);

      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 1000 / 60);

      return () => clearInterval(timer);
    }
  }, [isInView, value, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

// ==============================================
// SECTION WRAPPER FOR ANIMATIONS
// ==============================================

function Section({ children, className = '', id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.section
      ref={ref}
      id={id}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

// ==============================================
// NAVIGATION
// ==============================================

function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#problem', label: 'Problem' },
    { href: '#how-it-works', label: 'How It Works' },
    { href: '#dashboard', label: 'Dashboard' },
    { href: '#pricing', label: 'Pricing' },
  ];

  return (
    <nav className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      isScrolled ? 'bg-dark-900/95 backdrop-blur-lg border-b border-dark-700' : 'bg-transparent'
    )}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Globe className="w-8 h-8 text-primary-500" />
            <span className="text-xl font-bold">GEO Tracker</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-dark-400 hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg text-sm font-medium transition-colors"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm text-dark-400 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg text-sm font-medium transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-dark-700 py-4"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-dark-400 hover:text-white transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="flex flex-col gap-2 pt-4 border-t border-dark-700">
                {user ? (
                  <Link
                    href="/dashboard"
                    className="px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg text-sm font-medium text-center transition-colors"
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="px-4 py-2 border border-dark-600 rounded-lg text-sm font-medium text-center hover:bg-dark-800 transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/signup"
                      className="px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg text-sm font-medium text-center transition-colors"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
}

// ==============================================
// HERO SECTION
// ==============================================

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary-500/10 via-transparent to-transparent" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-secondary/20 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/30 rounded-full text-sm text-primary-400 mb-6">
              <Zap className="w-4 h-4" />
              AI Visibility Analytics
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
          >
            Your Brand is{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
              Invisible
            </span>{' '}
            to AI.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary">
              Let&apos;s Fix That.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-dark-400 mb-8 max-w-2xl mx-auto"
          >
            Track how often your brand appears in AI-generated responses across ChatGPT, Claude, Gemini, and Perplexity. Get actionable insights to improve your AI presence.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/signup"
              className="px-8 py-4 bg-primary-500 hover:bg-primary-600 rounded-xl text-lg font-medium transition-all hover:shadow-lg hover:shadow-primary-500/25 flex items-center justify-center gap-2"
            >
              See Your AI Presence Score <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#how-it-works"
              className="px-8 py-4 border border-dark-600 hover:border-dark-500 rounded-xl text-lg font-medium transition-colors"
            >
              Learn More
            </a>
          </motion.div>

          {/* Animated Flow Visualization */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mt-16 relative"
          >
            <div className="flex items-center justify-center gap-4 md:gap-8 flex-wrap">
              {/* Query */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-dark-800 border border-dark-700 rounded-xl flex items-center justify-center">
                  <Search className="w-8 h-8 text-primary-500" />
                </div>
                <span className="text-xs text-dark-400 mt-2">Queries</span>
              </div>

              <ArrowRight className="w-6 h-6 text-dark-500 hidden sm:block" />

              {/* LLMs */}
              <div className="flex flex-col items-center">
                <div className="flex gap-2">
                  <div className="w-12 h-12 bg-dark-800 border border-dark-700 rounded-lg flex items-center justify-center text-2xl">
                    🤖
                  </div>
                  <div className="w-12 h-12 bg-dark-800 border border-dark-700 rounded-lg flex items-center justify-center text-2xl">
                    ✨
                  </div>
                  <div className="w-12 h-12 bg-dark-800 border border-dark-700 rounded-lg flex items-center justify-center text-2xl">
                    🔮
                  </div>
                </div>
                <span className="text-xs text-dark-400 mt-2">AI Models</span>
              </div>

              <ArrowRight className="w-6 h-6 text-dark-500 hidden sm:block" />

              {/* Analysis */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-dark-800 border border-dark-700 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-8 h-8 text-secondary" />
                </div>
                <span className="text-xs text-dark-400 mt-2">Analysis</span>
              </div>

              <ArrowRight className="w-6 h-6 text-dark-500 hidden sm:block" />

              {/* Insights */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <span className="text-xs text-dark-400 mt-2">Insights</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-6 h-10 border-2 border-dark-500 rounded-full flex justify-center pt-2"
        >
          <div className="w-1.5 h-1.5 bg-dark-400 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}

// ==============================================
// PROBLEM SECTION
// ==============================================

function ProblemSection() {
  return (
    <Section id="problem" className="py-24 bg-dark-800/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            The Search Landscape Has Changed
          </h2>
          <p className="text-xl text-dark-400 max-w-2xl mx-auto">
            Consumers are asking AI assistants instead of searching Google. Is your brand part of the conversation?
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-dark-900 rounded-2xl p-8 border border-dark-700 text-center">
            <div className="text-5xl font-bold text-primary-500 mb-2">
              <AnimatedCounter value={67} />
            </div>
            <div className="text-dark-400">of Gen Z uses AI for purchase decisions</div>
          </div>
          <div className="bg-dark-900 rounded-2xl p-8 border border-dark-700 text-center">
            <div className="text-5xl font-bold text-red-500 mb-2">
              <AnimatedCounter value={0} />
            </div>
            <div className="text-dark-400">Visibility into AI recommendations</div>
          </div>
          <div className="bg-dark-900 rounded-2xl p-8 border border-dark-700 text-center">
            <div className="text-5xl font-bold text-secondary mb-2">
              <AnimatedCounter value={4} suffix="+" />
            </div>
            <div className="text-dark-400">Major LLMs influencing buyers</div>
          </div>
        </div>

        {/* Comparison */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-dark-900 rounded-2xl p-8 border border-dark-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-dark-700 rounded-lg flex items-center justify-center">
                <Search className="w-5 h-5 text-dark-400" />
              </div>
              <h3 className="text-xl font-semibold">Traditional Search Journey</h3>
            </div>
            <div className="space-y-4 text-dark-400">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-dark-500 rounded-full" />
                <span>User searches on Google</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-dark-500 rounded-full" />
                <span>Clicks through 10+ results</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-dark-500 rounded-full" />
                <span>Compares options manually</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-dark-500 rounded-full" />
                <span>Your SEO efforts = visibility</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary-500/10 to-secondary/10 rounded-2xl p-8 border border-primary-500/30">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold">AI-First Journey (Today)</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary-500 rounded-full" />
                <span>User asks ChatGPT directly</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary-500 rounded-full" />
                <span>Gets curated recommendations</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary-500 rounded-full" />
                <span>Trusts AI&apos;s suggestions</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <span className="text-red-400">Your brand? Maybe not mentioned...</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sample AI Response */}
        <div className="mt-12 bg-dark-900 rounded-2xl p-8 border border-red-500/30">
          <div className="text-sm text-red-400 mb-4 flex items-center gap-2">
            <Eye className="w-4 h-4" />
            What your customers might see when they ask AI:
          </div>
          <div className="bg-dark-800 rounded-xl p-6 font-mono text-sm">
            <div className="text-dark-400 mb-2">User: What are the best vitamin D supplements in Germany?</div>
            <div className="text-white">
              AI: Based on quality and customer reviews, here are the top vitamin D supplements:
              <br /><br />
              1. <span className="text-orange-400">Brand A</span> - Known for high bioavailability
              <br />
              2. <span className="text-orange-400">Brand B</span> - Organic and vegan options
              <br />
              3. <span className="text-orange-400">Brand C</span> - Best value for money
              <br /><br />
              <span className="text-dark-500">// Where&apos;s YOUR brand?</span>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

// ==============================================
// HOW IT WORKS SECTION
// ==============================================

function HowItWorksSection() {
  const steps = [
    {
      icon: Target,
      title: 'Define',
      description: 'We identify high-intent queries your customers ask AI assistants.',
      color: 'text-primary-500',
      bgColor: 'bg-primary-500/20',
    },
    {
      icon: Search,
      title: 'Track',
      description: 'We query GPT-4, Claude, Gemini, and Perplexity regularly to monitor responses.',
      color: 'text-secondary',
      bgColor: 'bg-secondary/20',
    },
    {
      icon: BarChart3,
      title: 'Analyze',
      description: 'Measure presence rate, sentiment, and competitive positioning in AI responses.',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/20',
    },
    {
      icon: TrendingUp,
      title: 'Optimize',
      description: 'Get actionable recommendations to improve your AI visibility over time.',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/20',
    },
  ];

  return (
    <Section id="how-it-works" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-dark-400 max-w-2xl mx-auto">
            A systematic approach to measuring and improving your brand&apos;s AI presence
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700 h-full hover:border-dark-600 transition-colors">
                <div className={cn('w-14 h-14 rounded-xl flex items-center justify-center mb-4', step.bgColor)}>
                  <step.icon className={cn('w-7 h-7', step.color)} />
                </div>
                <div className="text-sm text-dark-500 mb-1">Step {index + 1}</div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-dark-400">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                  <ChevronRight className="w-8 h-8 text-dark-600" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

// ==============================================
// DASHBOARD PREVIEW SECTION
// ==============================================

function DashboardPreviewSection() {
  return (
    <Section id="dashboard" className="py-24 bg-dark-800/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Your AI Visibility Dashboard</h2>
          <p className="text-xl text-dark-400 max-w-2xl mx-auto">
            Real-time analytics on how your brand performs across AI assistants
          </p>
        </div>

        {/* Mock Dashboard */}
        <div className="bg-dark-900 rounded-3xl border border-dark-700 p-6 md:p-8 max-w-6xl mx-auto">
          {/* Main Metric */}
          <div className="bg-gradient-to-br from-primary-500/20 to-secondary/10 rounded-2xl p-8 mb-8 text-center border border-primary-500/20">
            <div className="text-sm text-primary-400 mb-2">Overall Presence Rate</div>
            <div className="text-6xl font-bold text-white mb-2">
              <AnimatedCounter value={23} />
            </div>
            <div className="text-dark-400">Your brand mentioned in 23 of 100 relevant queries</div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Trend Chart */}
            <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
              <h3 className="text-lg font-semibold mb-4">12-Week Presence Trend</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={presenceData}>
                    <XAxis dataKey="week" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="presence"
                      stroke="#3B82F6"
                      strokeWidth={3}
                      dot={{ fill: '#3B82F6', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* LLM Breakdown */}
            <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
              <h3 className="text-lg font-semibold mb-4">Presence by LLM</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={llmBreakdown} layout="vertical">
                    <XAxis type="number" stroke="#64748b" fontSize={12} />
                    <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={12} width={80} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="presence" radius={[0, 4, 4, 0]}>
                      {llmBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Competitor Comparison */}
            <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
              <h3 className="text-lg font-semibold mb-4">Competitor Comparison</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={competitorData}>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="presence" radius={[4, 4, 0, 0]}>
                      {competitorData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Query Categories */}
            <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
              <h3 className="text-lg font-semibold mb-4">Query Categories</h3>
              <div className="space-y-4">
                {queryCategories.map(cat => (
                  <div key={cat.category}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-dark-300">{cat.category}</span>
                      <span className="text-dark-400">{cat.percentage}%</span>
                    </div>
                    <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500 rounded-full"
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

// ==============================================
// BASELINE SECTION
// ==============================================

function BaselineSection() {
  return (
    <Section className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Establishing Your Baseline</h2>
          <p className="text-xl text-dark-400 max-w-2xl mx-auto">
            A systematic methodology to measure and improve your AI visibility
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
            <Database className="w-8 h-8 text-primary-500 mb-4" />
            <h3 className="font-semibold mb-2">Query Library</h3>
            <p className="text-dark-400 text-sm">50-200 industry-specific, high-intent queries tailored to your market</p>
          </div>
          <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
            <TrendingUp className="w-8 h-8 text-secondary mb-4" />
            <h3 className="font-semibold mb-2">Weekly Tracking</h3>
            <p className="text-dark-400 text-sm">Consistent measurement cadence across all major LLMs</p>
          </div>
          <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
            <Target className="w-8 h-8 text-purple-500 mb-4" />
            <h3 className="font-semibold mb-2">Baseline Period</h3>
            <p className="text-dark-400 text-sm">4-week initial measurement before optimization begins</p>
          </div>
          <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
            <BarChart3 className="w-8 h-8 text-orange-500 mb-4" />
            <h3 className="font-semibold mb-2">Metrics Tracked</h3>
            <p className="text-dark-400 text-sm">Presence %, Position, Sentiment, and Context analysis</p>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-dark-800 rounded-2xl p-8 border border-dark-700">
          <div className="relative">
            <div className="absolute left-0 right-0 top-1/2 h-1 bg-dark-700 -translate-y-1/2" />
            <div className="relative flex justify-between">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center z-10 mb-2">
                  <Target className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium">Baseline</span>
                <span className="text-xs text-dark-400">Weeks 1-4</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center z-10 mb-2">
                  <Zap className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium">Optimization</span>
                <span className="text-xs text-dark-400">Weeks 5-12</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center z-10 mb-2">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium">Growth</span>
                <span className="text-xs text-dark-400">Ongoing</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

// ==============================================
// OPTIMIZATION STRATEGIES SECTION
// ==============================================

function OptimizationSection() {
  const strategies = [
    {
      icon: BookOpen,
      title: 'Content Authority',
      description: 'Creating definitive, AI-crawlable content that establishes your brand as the go-to source.',
    },
    {
      icon: Database,
      title: 'Structured Data',
      description: 'Schema markup and structured data that LLMs can easily understand and reference.',
    },
    {
      icon: Globe,
      title: 'Citation Building',
      description: 'Getting mentioned in authoritative sources that LLMs trust and frequently reference.',
    },
    {
      icon: Shield,
      title: 'Knowledge Graph Presence',
      description: 'Ensuring presence in Wikipedia, Wikidata, and industry-specific databases.',
    },
    {
      icon: Star,
      title: 'Review & Mention Velocity',
      description: 'Building authentic social proof through reviews and organic mentions.',
    },
  ];

  return (
    <Section className="py-24 bg-dark-800/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Optimization Strategies</h2>
          <p className="text-xl text-dark-400 max-w-2xl mx-auto">
            Proven tactics to improve your brand&apos;s visibility in AI-generated responses
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {strategies.map((strategy, index) => (
            <motion.div
              key={strategy.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-dark-900 rounded-xl p-6 border border-dark-700 hover:border-primary-500/50 transition-colors"
            >
              <strategy.icon className="w-10 h-10 text-primary-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">{strategy.title}</h3>
              <p className="text-dark-400">{strategy.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

// ==============================================
// PRICING SECTION
// ==============================================

function PricingSection() {
  const plans = [
    {
      name: 'Starter',
      price: '0',
      period: '',
      description: 'Try GEO tracking for free',
      features: [
        '25 queries per month',
        '2 LLM providers',
        'Basic visibility score',
        'Community support',
        '7-day data retention',
      ],
      cta: 'Start Free',
      highlighted: false,
    },
    {
      name: 'Pro',
      price: '99',
      period: '/month',
      description: 'For growing businesses',
      features: [
        '200 queries per month',
        'All 4 LLM providers',
        'Weekly tracking & reports',
        'Competitor monitoring (3)',
        'Email alerts',
        '90-day data retention',
      ],
      cta: 'Start Pro Trial',
      highlighted: true,
    },
    {
      name: 'Business',
      price: '299',
      period: '/month',
      description: 'For teams & agencies',
      features: [
        '1,000 queries per month',
        'All 4 LLM providers',
        'Daily tracking & reports',
        'Unlimited competitors',
        'AI optimization recommendations',
        'API access',
        '1-year data retention',
        'Priority support',
      ],
      cta: 'Start Business Trial',
      highlighted: false,
    },
  ];

  // Enterprise services - separate from SaaS plans
  const enterpriseServices = {
    audit: {
      name: 'AEO Audit',
      price: '2,499',
      period: 'one-time',
      description: 'Comprehensive visibility assessment',
      features: [
        'Full AI visibility audit across all LLMs',
        'Custom query library (500+ queries)',
        'Deep competitor analysis',
        'Content gap identification',
        'Citation & knowledge graph audit',
        'Detailed report & recommendations',
        'Strategy presentation call',
      ],
      cta: 'Get Your Audit',
    },
    management: {
      name: 'AEO Management',
      price: '1,499',
      period: '/month',
      description: 'Ongoing optimization & growth',
      features: [
        'Everything in AEO Audit',
        'Monthly strategy execution',
        'Content optimization implementation',
        'Citation building campaigns',
        'Knowledge graph management',
        'Weekly progress reports',
        'Dedicated AEO specialist',
        'Quarterly strategy reviews',
      ],
      cta: 'Start AEO Management',
      recommended: true,
    },
  };

  return (
    <Section id="pricing" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-dark-400 max-w-2xl mx-auto">
            Choose between self-service tracking or full-service AEO optimization
          </p>
        </div>

        {/* SaaS Plans */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-dark-800 border border-dark-700 rounded-full text-sm text-dark-300">
              <BarChart3 className="w-4 h-4" />
              Self-Service Tracking Platform
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className={cn(
                  'rounded-2xl p-6 border',
                  plan.highlighted
                    ? 'bg-gradient-to-b from-primary-500/10 to-transparent border-primary-500/50'
                    : 'bg-dark-800 border-dark-700'
                )}
              >
                {plan.highlighted && (
                  <div className="text-xs text-primary-400 font-medium mb-4">MOST POPULAR</div>
                )}
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold">&euro;{plan.price}</span>
                  <span className="text-dark-400 text-sm">{plan.period}</span>
                </div>
                <p className="text-dark-400 text-sm mb-6">{plan.description}</p>
                <ul className="space-y-2 mb-6">
                  {plan.features.map(feature => (
                    <li key={feature} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-dark-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={cn(
                    'block w-full py-3 rounded-lg font-medium text-center transition-colors text-sm',
                    plan.highlighted
                      ? 'bg-primary-500 hover:bg-primary-600 text-white'
                      : 'bg-dark-700 hover:bg-dark-600 text-white'
                  )}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Enterprise Services */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-secondary/20 to-primary-500/20 border border-secondary/30 rounded-full text-sm text-secondary">
              <Zap className="w-4 h-4" />
              Full-Service AEO Optimization
            </div>
            <p className="text-dark-400 mt-4 max-w-xl mx-auto">
              Let our experts handle your AI visibility strategy while you focus on your business
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* AEO Audit */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
              className="rounded-2xl p-6 border bg-dark-800 border-dark-700"
            >
              <div className="text-xs text-orange-400 font-medium mb-4">ONE-TIME</div>
              <h3 className="text-xl font-bold mb-2">{enterpriseServices.audit.name}</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold">&euro;{enterpriseServices.audit.price}</span>
                <span className="text-dark-400 text-sm"> {enterpriseServices.audit.period}</span>
              </div>
              <p className="text-dark-400 text-sm mb-6">{enterpriseServices.audit.description}</p>
              <ul className="space-y-2 mb-6">
                {enterpriseServices.audit.features.map(feature => (
                  <li key={feature} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-dark-300">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/contact"
                className="block w-full py-3 rounded-lg font-medium text-center transition-colors text-sm bg-dark-700 hover:bg-dark-600 text-white"
              >
                {enterpriseServices.audit.cta}
              </Link>
            </motion.div>

            {/* AEO Management */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
              className="rounded-2xl p-6 border bg-gradient-to-b from-secondary/10 to-transparent border-secondary/50 relative"
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="px-3 py-1 bg-secondary text-dark-900 text-xs font-bold rounded-full">
                  RECOMMENDED
                </span>
              </div>
              <div className="text-xs text-secondary font-medium mb-4">SUBSCRIPTION</div>
              <h3 className="text-xl font-bold mb-2">{enterpriseServices.management.name}</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold">&euro;{enterpriseServices.management.price}</span>
                <span className="text-dark-400 text-sm">{enterpriseServices.management.period}</span>
              </div>
              <p className="text-dark-400 text-sm mb-6">{enterpriseServices.management.description}</p>
              <ul className="space-y-2 mb-6">
                {enterpriseServices.management.features.map(feature => (
                  <li key={feature} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-dark-300">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/contact"
                className="block w-full py-3 rounded-lg font-medium text-center transition-colors text-sm bg-secondary hover:bg-secondary/90 text-dark-900"
              >
                {enterpriseServices.management.cta}
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </Section>
  );
}

// ==============================================
// CASE STUDY SECTION
// ==============================================

function CaseStudySection() {
  return (
    <Section className="py-24 bg-dark-800/50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Real Results</h2>
            <p className="text-xl text-dark-400">
              See how brands are improving their AI visibility
            </p>
          </div>

          <div className="bg-dark-900 rounded-2xl p-8 border border-dark-700">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="text-sm text-primary-400 mb-2">Case Study</div>
                <h3 className="text-2xl font-bold mb-4">
                  Premium Supplement Brand Increases AI Presence by 292%
                </h3>
                <p className="text-dark-400 mb-6">
                  A leading European supplement brand used GEO Tracker to identify visibility gaps and implement targeted optimization strategies.
                </p>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-dark-800 rounded-lg p-4">
                    <div className="text-sm text-dark-400">Before</div>
                    <div className="text-3xl font-bold text-red-500">12%</div>
                  </div>
                  <div className="bg-dark-800 rounded-lg p-4">
                    <div className="text-sm text-dark-400">After 3 months</div>
                    <div className="text-3xl font-bold text-secondary">47%</div>
                  </div>
                </div>
              </div>
              <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                <Quote className="w-8 h-8 text-primary-500 mb-4" />
                <p className="text-lg mb-4">
                  &ldquo;GEO Tracker gave us visibility into a completely blind spot. We had no idea competitors were dominating AI recommendations while we focused solely on traditional SEO.&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-500/20 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary-500" />
                  </div>
                  <div>
                    <div className="font-medium">Marketing Director</div>
                    <div className="text-sm text-dark-400">Premium Supplement Brand</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

// ==============================================
// CTA/CONTACT SECTION
// ==============================================

function CTASection() {
  const [formData, setFormData] = useState({
    company: '',
    website: '',
    industry: '',
    email: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSubmitted(true);
    setIsSubmitting(false);
  };

  return (
    <Section id="contact" className="py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Get Your Free AI Visibility Audit
            </h2>
            <p className="text-xl text-dark-400">
              Discover how visible your brand is to AI assistants
            </p>
          </div>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-secondary/10 border border-secondary/30 rounded-2xl p-8 text-center"
            >
              <CheckCircle2 className="w-16 h-16 text-secondary mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Thank You!</h3>
              <p className="text-dark-400">
                We&apos;ll analyze your brand&apos;s AI visibility and send you a report within 48 hours.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-dark-800 rounded-2xl p-8 border border-dark-700">
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={e => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Your Company"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Website</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={e => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="https://example.com"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Industry *</label>
                  <select
                    required
                    value={formData.industry}
                    onChange={e => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select industry</option>
                    <option value="supplements">Supplements & Vitamins</option>
                    <option value="ecommerce">E-commerce</option>
                    <option value="saas">SaaS / Software</option>
                    <option value="finance">Finance & Banking</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="you@company.com"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-500/50 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>Processing...</>
                ) : (
                  <>
                    Request Free Audit <Send className="w-5 h-5" />
                  </>
                )}
              </button>
              <p className="text-xs text-dark-400 text-center mt-4">
                No credit card required. We&apos;ll send your report within 48 hours.
              </p>
            </form>
          )}
        </div>
      </div>
    </Section>
  );
}

// ==============================================
// FOOTER
// ==============================================

function Footer() {
  return (
    <footer className="border-t border-dark-700 py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Globe className="w-8 h-8 text-primary-500" />
              <span className="text-xl font-bold">GEO Tracker</span>
            </Link>
            <p className="text-sm text-dark-400">
              Track and improve your brand visibility across AI assistants.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-dark-400">
              <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
              <li><a href="#dashboard" className="hover:text-white transition-colors">Dashboard</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-dark-400">
              <li><a href="#" className="hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-dark-400">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Imprint</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-dark-700 pt-8 text-center text-sm text-dark-400">
          &copy; {new Date().getFullYear()} GEO Tracker. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

// ==============================================
// MAIN PAGE COMPONENT
// ==============================================

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <HeroSection />
      <ProblemSection />
      <HowItWorksSection />
      <DashboardPreviewSection />
      <BaselineSection />
      <OptimizationSection />
      <PricingSection />
      <CaseStudySection />
      <CTASection />
      <Footer />
    </div>
  );
}
