'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function SettingsPage() {
  const [hasApiKey, setHasApiKey] = useState(false);
  const [hasSessionToken, setHasSessionToken] = useState(false);
  const [maskedApiKey, setMaskedApiKey] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [sessionToken, setSessionToken] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/settings/loops')
      .then((r) => r.json())
      .then((d) => {
        setHasApiKey(d.hasApiKey);
        setHasSessionToken(d.hasSessionToken);
        setMaskedApiKey(d.maskedApiKey ?? '');
      });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!apiKey && !sessionToken) return;

    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const res = await fetch('/api/settings/loops', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loopsApiKey: apiKey || undefined,
          loopsSessionToken: sessionToken || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSaved(true);
      if (apiKey) setHasApiKey(true);
      if (sessionToken) setHasSessionToken(true);
      setApiKey('');
      setSessionToken('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9F9F6' }}>
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
          ← Dashboard
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-medium text-gray-900">Settings</span>
      </nav>

      <main className="max-w-xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-6" style={{ color: '#002771' }}>Settings</h1>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-1">Loops Credentials</h2>
          <p className="text-sm text-gray-500 mb-5">
            Required to upload campaigns directly to Loops.so.
          </p>

          <div className="flex gap-4 mb-5 text-sm">
            <div className={`flex items-center gap-1.5 ${hasApiKey ? 'text-green-600' : 'text-gray-400'}`}>
              <span>{hasApiKey ? '✓' : '○'}</span>
              <span>API Key {hasApiKey ? `(${maskedApiKey})` : 'not set'}</span>
            </div>
            <div className={`flex items-center gap-1.5 ${hasSessionToken ? 'text-green-600' : 'text-gray-400'}`}>
              <span>{hasSessionToken ? '✓' : '○'}</span>
              <span>Session Token {hasSessionToken ? 'set' : 'not set'}</span>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loops API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={hasApiKey ? 'Enter to update…' : 'Enter API key…'}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                Find in Loops → Settings → API
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loops Session Token
              </label>
              <input
                type="password"
                value={sessionToken}
                onChange={(e) => setSessionToken(e.target.value)}
                placeholder={hasSessionToken ? 'Enter to update…' : 'Enter session token…'}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="mt-2 bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-600 space-y-1">
                <p className="font-medium text-gray-700">How to get your session token:</p>
                <ol className="list-decimal list-inside space-y-1 text-gray-500">
                  <li>Go to <strong>app.loops.so</strong> and make sure you're logged in</li>
                  <li>Right-click anywhere → <strong>Inspect</strong> (or Cmd+Option+I)</li>
                  <li>Click the <strong>Application</strong> tab</li>
                  <li>In the left sidebar, expand <strong>Cookies</strong> → click <strong>https://app.loops.so</strong></li>
                  <li>Find <code className="bg-gray-200 px-1 rounded">__Secure-next-auth.session-token</code> — copy the value</li>
                </ol>
                <p className="text-gray-400 pt-1">Note: tokens expire periodically — update this if uploads start failing.</p>
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {saved && <p className="text-sm text-green-600">Credentials saved.</p>}

            <button
              type="submit"
              disabled={saving || (!apiKey && !sessionToken)}
              className="px-4 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: '#2465DE' }}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
