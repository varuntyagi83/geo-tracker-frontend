'use client';

import Link from 'next/link';

export default function UpgradeCancelPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-5xl mb-6">&#10005;</div>
        <h1 className="text-3xl font-bold mb-3">Checkout cancelled.</h1>
        <p className="text-gray-400 mb-8">No charge was made. You can upgrade anytime.</p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/upgrade"
            className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-lg transition"
          >
            Back to Plans
          </Link>
          <Link
            href="/dashboard"
            className="inline-block border border-gray-600 hover:bg-gray-800 text-gray-300 font-semibold px-6 py-3 rounded-lg transition"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
