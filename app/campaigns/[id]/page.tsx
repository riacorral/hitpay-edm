'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { EmailPreview } from '@/components/email-preview';

type Campaign = {
  id: string;
  subject: string;
  template: string;
  status: string;
  created_at: string;
  html_content: string | null;
  mjml_content: string | null;
  loops_campaign_url: string | null;
  users: { name: string | null; email: string; avatar_url: string | null } | null;
};

const TEMPLATE_LABELS: Record<string, string> = {
  'product-launch':         'Product Launch',
  'feature-update':         'Feature Update',
  'newsletter':             'Newsletter',
  'promotional':            'Promotional',
  'event-invitation':       'Event Invitation',
  'partner-spotlight':      'Partner Spotlight',
  'important-announcement': 'Important Announcement',
  'app-changes':            'App Changes',
  'rate-changes':           'Rate Changes',
  'compliance':             'Compliance Notice',
};

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'preview' | 'mjml' | 'html'>('preview');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(`/api/campaigns/${id}`)
      .then((r) => r.json())
      .then((d) => setCampaign(d.campaign as Campaign))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleUpload() {
    setUploading(true);
    setUploadError('');
    try {
      const res = await fetch(`/api/campaigns/${id}/upload`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCampaign((c) => c ? { ...c, status: 'uploaded', loops_campaign_url: data.url } : c);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this campaign? This cannot be undone.')) return;
    setDeleting(true);
    await fetch(`/api/campaigns/${id}`, { method: 'DELETE' });
    router.push('/dashboard');
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F9F9F6' }}>
        <p className="text-sm text-gray-400">Loading…</p>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F9F9F6' }}>
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-3">Campaign not found</p>
          <Link href="/dashboard" className="text-sm font-medium hover:underline" style={{ color: '#2465DE' }}>
            ← Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F9F9F6' }}>
      {/* Nav */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
          ← Campaigns
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-medium text-gray-900 truncate max-w-xs">{campaign.subject}</span>

        <div className="ml-auto flex items-center gap-3">
          <Link
            href={`/campaigns/new?edit=${id}`}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Edit
          </Link>
          {campaign.loops_campaign_url && (
            <a
              href={campaign.loops_campaign_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium hover:underline"
              style={{ color: '#2465DE' }}
            >
              View in Loops ↗
            </a>
          )}
          {campaign.status !== 'uploaded' && (
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="px-4 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: '#2465DE' }}
            >
              {uploading ? 'Uploading…' : 'Upload to Loops'}
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 disabled:opacity-50"
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </nav>

      {/* Meta bar */}
      <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-4 flex-wrap">
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
          {TEMPLATE_LABELS[campaign.template] ?? campaign.template}
        </span>
        {campaign.status === 'uploaded' ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
            In Loops
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
            Editing
          </span>
        )}
        {campaign.users && (() => {
          const creator = campaign.users!;
          const displayName = creator.name ?? creator.email.split('@')[0];
          const initials = creator.name
            ? creator.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
            : creator.email[0].toUpperCase();
          return (
            <div className="flex items-center gap-1.5">
              {creator.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={creator.avatar_url} alt={displayName} className="w-5 h-5 rounded-full object-cover" />
              ) : (
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-semibold" style={{ backgroundColor: '#2465DE' }}>
                  {initials}
                </div>
              )}
              <span className="text-xs text-gray-500">{displayName}</span>
            </div>
          );
        })()}
        <span className="text-xs text-gray-400">
          {new Date(campaign.created_at).toLocaleDateString('en-SG', {
            day: 'numeric', month: 'short', year: 'numeric',
          })}
        </span>
        {uploadError && (
          <p className="text-xs text-red-600 ml-2">
            {uploadError}{' '}
            {uploadError.toLowerCase().includes('settings') && (
              <Link href="/settings" className="underline font-medium">Go to Settings →</Link>
            )}
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100 px-6 flex gap-4">
        {(['preview', 'mjml', 'html'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`py-3 text-sm font-medium border-b-2 transition-colors ${
              tab === t
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {tab === 'preview' && campaign.html_content && (
          <EmailPreview html={campaign.html_content} />
        )}
        {tab === 'mjml' && (
          <pre className="p-6 text-xs font-mono text-gray-700 overflow-auto h-full bg-white whitespace-pre-wrap">
            {campaign.mjml_content ?? 'No MJML content'}
          </pre>
        )}
        {tab === 'html' && (
          <pre className="p-6 text-xs font-mono text-gray-700 overflow-auto h-full bg-white whitespace-pre-wrap">
            {campaign.html_content ?? 'No HTML content'}
          </pre>
        )}
      </div>
    </div>
  );
}
