'use client';

import { Suspense, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { createCheckoutSession, createPortalSession } from '@/lib/api';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '0',
    period: '',
    description: 'Try GEO tracking for free',
    features: ['25 queries / month', '2 LLM providers', 'Basic visibility score'],
    cta: 'Current Plan',
    free: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '99',
    period: '/month',
    description: 'For growing businesses',
    features: ['200 queries / month', 'All 4 LLM providers', 'Weekly reports + email alerts'],
    cta: 'Upgrade to Pro',
    highlighted: true,
    free: false,
  },
  {
    id: 'business',
    name: 'Business',
    price: '299',
    period: '/month',
    description: 'For teams and agencies',
    features: ['1,000 queries / month', 'All 4 LLM providers', 'Daily reports + API access + priority support'],
    cta: 'Upgrade to Business',
    free: false,
  },
];

function UpgradePageInner() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const cancelled = searchParams.get('cancelled');
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpgrade = async (planId: string) => {
    if (!user) {
      window.location.href = '/login?from=/upgrade';
      return;
    }
    setLoading(planId);
    setError(null);
    try {
      const { url } = await createCheckoutSession(planId);
      window.location.href = url;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Try again.');
      setLoading(null);
    }
  };

  const handleManageBilling = async () => {
    setLoading('portal');
    setError(null);
    try {
      const { url } = await createPortalSession();
      window.location.href = url;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not open billing portal.');
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3">Simple, Transparent Pricing</h1>
          <p className="text-gray-400 text-lg">Track your AI brand visibility. Upgrade or downgrade anytime.</p>
          {cancelled && (
            <p className="mt-4 text-yellow-400 text-sm">Checkout was cancelled. No charge was made.</p>
          )}
          {error && (
            <p className="mt-4 text-red-400 text-sm">{error}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-2xl border p-8 flex flex-col ${
                plan.highlighted
                  ? 'border-blue-500 bg-blue-950/30'
                  : 'border-gray-800 bg-gray-900/50'
              }`}
            >
              {plan.highlighted && (
                <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-3">Most Popular</span>
              )}
              <h2 className="text-xl font-bold mb-1">{plan.name}</h2>
              <div className="mb-1">
                <span className="text-3xl font-bold">&euro;{plan.price}</span>
                <span className="text-gray-400 text-sm">{plan.period}</span>
              </div>
              <p className="text-gray-400 text-sm mb-6">{plan.description}</p>
              <ul className="space-y-2 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-green-400 mt-0.5">&#10003;</span>
                    {f}
                  </li>
                ))}
              </ul>
              {plan.free ? (
                <Link
                  href="/dashboard"
                  className="w-full text-center py-2.5 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800 transition text-sm font-medium"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={loading !== null}
                  className={`w-full py-2.5 rounded-lg text-sm font-semibold transition ${
                    plan.highlighted
                      ? 'bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-60'
                      : 'bg-gray-700 hover:bg-gray-600 text-white disabled:opacity-60'
                  }`}
                >
                  {loading === plan.id ? 'Redirecting...' : plan.cta}
                </button>
              )}
            </div>
          ))}
        </div>

        {user && (
          <div className="text-center">
            <button
              onClick={handleManageBilling}
              disabled={loading !== null}
              className="text-sm text-gray-400 hover:text-gray-200 underline underline-offset-2 transition disabled:opacity-50"
            >
              {loading === 'portal' ? 'Opening...' : 'Manage billing and invoices'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function UpgradePage() {
  return (
    <Suspense fallback={null}>
      <UpgradePageInner />
    </Suspense>
  );
}
