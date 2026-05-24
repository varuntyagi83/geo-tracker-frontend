'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function UpgradeSuccessPage() {
  useEffect(() => {
    // Redirect to dashboard after 4 seconds
    const t = setTimeout(() => {
      window.location.href = '/dashboard';
    }, 4000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-5xl mb-6">&#10003;</div>
        <h1 className="text-3xl font-bold mb-3">You are upgraded.</h1>
        <p className="text-gray-400 mb-8">
          Your plan is now active. Your new query quota is available immediately.
          Redirecting to your dashboard in a few seconds.
        </p>
        <Link
          href="/dashboard"
          className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-lg transition"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
