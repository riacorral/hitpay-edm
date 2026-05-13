'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ErrorContent() {
  const params = useSearchParams();
  const error = params.get('error');

  const message =
    error === 'AccessDenied'
      ? 'Only @hit-pay.com Google accounts are allowed to sign in.'
      : 'An error occurred during sign in. Please try again.';

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F9F9F6' }}>
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-sm flex flex-col items-center gap-6 text-center">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg"
          style={{ backgroundColor: '#002771' }}
        >
          H
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-sm text-gray-500">{message}</p>
        </div>
        <a
          href="/auth/signin"
          className="text-sm font-medium hover:underline"
          style={{ color: '#2465DE' }}
        >
          Try again
        </a>
      </div>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense>
      <ErrorContent />
    </Suspense>
  );
}
