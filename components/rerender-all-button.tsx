'use client';

import { useState } from 'react';

export function RerenderAllButton({ count }: { count: number }) {
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle');
  const [result, setResult] = useState('');

  async function handleClick() {
    if (!confirm(`Re-render all ${count} campaigns with the latest templates (footer, icons, etc.)?`)) return;
    setState('loading');
    try {
      const res = await fetch('/api/campaigns/rerender-all', { method: 'POST' });
      const data = await res.json();
      setResult(`Updated ${data.updated}${data.errors?.length ? `, ${data.errors.length} failed` : ''}`);
      setState('done');
      setTimeout(() => setState('idle'), 4000);
    } catch {
      setState('idle');
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={state === 'loading'}
      className="px-3 py-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
    >
      {state === 'loading' ? 'Updating…' : state === 'done' ? result : '↺ Refresh templates'}
    </button>
  );
}
