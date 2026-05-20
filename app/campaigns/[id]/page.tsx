'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { EmailPreview } from '@/components/email-preview';

// ── Markdown toolbar helpers ──────────────────────────────────────────────
function wrapSelection(
  textarea: HTMLTextAreaElement,
  setValue: (v: string) => void,
  before: string,
  after: string,
) {
  const { selectionStart: s, selectionEnd: e, value } = textarea;
  const selected = value.slice(s, e) || 'text';
  const newVal = value.slice(0, s) + before + selected + after + value.slice(e);
  setValue(newVal);
  setTimeout(() => {
    textarea.focus();
    textarea.setSelectionRange(s + before.length, s + before.length + selected.length);
  }, 0);
}

function prefixLines(
  textarea: HTMLTextAreaElement,
  setValue: (v: string) => void,
  prefix: string,
) {
  const { selectionStart: s, selectionEnd: e, value } = textarea;
  const before = value.slice(0, s);
  const lineStart = before.lastIndexOf('\n') + 1;
  const selected = value.slice(lineStart, e);
  const prefixed = selected.split('\n').map(l => prefix + l.replace(/^#{1,6}\s?/, '')).join('\n');
  const newVal = value.slice(0, lineStart) + prefixed + value.slice(e);
  setValue(newVal);
  setTimeout(() => { textarea.focus(); }, 0);
}

function numberLines(
  textarea: HTMLTextAreaElement,
  setValue: (v: string) => void,
) {
  const { selectionStart: s, selectionEnd: e, value } = textarea;
  const before = value.slice(0, s);
  const lineStart = before.lastIndexOf('\n') + 1;
  const selected = value.slice(lineStart, e);
  const numbered = selected.split('\n').map((l, i) => `${i + 1}. ${l.replace(/^\d+\.\s?/, '')}`).join('\n');
  const newVal = value.slice(0, lineStart) + numbered + value.slice(e);
  setValue(newVal);
  setTimeout(() => { textarea.focus(); }, 0);
}

type Campaign = {
  id: string;
  subject: string;
  template: string;
  status: string;
  created_at: string;
  markdown: string | null;
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
  const [tab, setTab] = useState<'preview' | 'edit' | 'mjml' | 'html'>('preview');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Edit tab state
  const [editedMarkdown, setEditedMarkdown] = useState('');
  const [editPreviewHtml, setEditPreviewHtml] = useState<string | null>(null);
  const [editRendering, setEditRendering] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch(`/api/campaigns/${id}`)
      .then((r) => r.json())
      .then((d) => setCampaign(d.campaign as Campaign))
      .finally(() => setLoading(false));
  }, [id]);

  function handleSwitchToEdit() {
    setTab('edit');
    setEditError('');
    if (campaign?.markdown && !editedMarkdown) {
      setEditedMarkdown(campaign.markdown);
    }
    if (campaign?.html_content && !editPreviewHtml) {
      setEditPreviewHtml(campaign.html_content);
    }
  }

  async function handleRerender() {
    setEditRendering(true);
    setEditError('');
    try {
      const res = await fetch('/api/campaigns/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markdown: editedMarkdown }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Render failed');
      setEditPreviewHtml(data.html);
    } catch (e) {
      setEditError(e instanceof Error ? e.message : 'Render failed');
    } finally {
      setEditRendering(false);
    }
  }

  async function handleEditSave() {
    setEditSaving(true);
    setEditError('');
    try {
      const res = await fetch(`/api/campaigns/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markdown: editedMarkdown }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Save failed');
      setCampaign(prev => prev ? { ...prev, ...data.campaign } : prev);
      setEditPreviewHtml(data.campaign.html_content);
      setTab('preview');
    } catch (e) {
      setEditError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setEditSaving(false);
    }
  }

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
        {uploadError && <p className="text-xs text-red-600 ml-2">{uploadError}</p>}
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100 px-6 flex gap-4">
        {([
          { id: 'preview', label: 'PREVIEW' },
          { id: 'edit',    label: 'Edit' },
          { id: 'mjml',    label: 'MJML' },
          { id: 'html',    label: 'HTML' },
        ] as { id: typeof tab; label: string }[]).map((t) => (
          <button
            key={t.id}
            onClick={() => t.id === 'edit' ? handleSwitchToEdit() : setTab(t.id)}
            className={`py-3 text-sm font-medium border-b-2 transition-colors ${
              tab === t.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">

        {/* Preview tab */}
        {tab === 'preview' && campaign.html_content && (
          <EmailPreview html={campaign.html_content} />
        )}

        {/* Edit tab */}
        {tab === 'edit' && (
          <div className="h-full flex gap-5 p-5 overflow-hidden" style={{ backgroundColor: '#F9F9F6' }}>

            {/* Left: editor panel */}
            <div className="w-72 shrink-0 flex flex-col gap-3 overflow-y-auto">
              {editError && (
                <div className="px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">{editError}</div>
              )}

              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-3 border-b border-gray-100">
                  {/* Toolbar */}
                  <div className="flex flex-wrap items-center gap-1 p-1.5 bg-gray-50 border border-gray-200 rounded-lg">
                    {[
                      { label: 'B',  title: 'Bold',   action: () => textareaRef.current && wrapSelection(textareaRef.current, setEditedMarkdown, '**', '**'), style: { fontWeight: 700 } },
                      { label: 'I',  title: 'Italic', action: () => textareaRef.current && wrapSelection(textareaRef.current, setEditedMarkdown, '_', '_'),   style: { fontStyle: 'italic' } },
                      { label: 'H1', title: 'Heading 1', action: () => textareaRef.current && prefixLines(textareaRef.current, setEditedMarkdown, '# '),  style: {} },
                      { label: 'H2', title: 'Heading 2', action: () => textareaRef.current && prefixLines(textareaRef.current, setEditedMarkdown, '## '), style: {} },
                      { label: '•',  title: 'Bullet list',   action: () => textareaRef.current && prefixLines(textareaRef.current, setEditedMarkdown, '- '),  style: { fontSize: '16px', lineHeight: '1' } },
                      { label: '1.', title: 'Numbered list', action: () => textareaRef.current && numberLines(textareaRef.current, setEditedMarkdown), style: { fontSize: '11px' } },
                    ].map(btn => (
                      <button
                        key={btn.label}
                        type="button"
                        title={btn.title}
                        onClick={btn.action}
                        className="w-7 h-7 flex items-center justify-center text-xs text-gray-600 rounded hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 transition-all"
                        style={btn.style}
                      >
                        {btn.label}
                      </button>
                    ))}

                    <div className="w-px h-4 bg-gray-200 mx-0.5" />

                    {[
                      { color: '#002771', title: 'Deep blue' },
                      { color: '#000000', title: 'Black' },
                      { color: '#61667C', title: 'Gray' },
                    ].map(c => (
                      <button
                        key={c.color}
                        type="button"
                        title={c.title}
                        onClick={() => textareaRef.current && wrapSelection(textareaRef.current, setEditedMarkdown, `<span style="color:${c.color}">`, '</span>')}
                        className="w-7 h-7 flex items-center justify-center text-xs font-bold rounded hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 transition-all"
                        style={{ color: c.color }}
                      >
                        A
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3">
                  <textarea
                    ref={textareaRef}
                    value={editedMarkdown}
                    onChange={e => setEditedMarkdown(e.target.value)}
                    rows={22}
                    className="w-full text-xs text-gray-700 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 resize-none font-mono mb-2"
                    spellCheck={false}
                  />
                  <button
                    onClick={handleRerender}
                    disabled={editRendering}
                    className="w-full py-2 rounded-lg text-white text-xs font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity"
                    style={{ backgroundColor: '#2465DE' }}
                  >
                    {editRendering
                      ? <span className="flex items-center justify-center gap-1.5"><span className="animate-spin inline-block w-3 h-3 border border-white border-t-transparent rounded-full" /> Rendering…</span>
                      : 'Re-render preview'}
                  </button>
                </div>
              </div>

              <button
                onClick={handleEditSave}
                disabled={editSaving || editRendering}
                className="w-full py-3 rounded-xl text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
                style={{ backgroundColor: '#002771' }}
              >
                {editSaving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>

            {/* Right: email preview */}
            <div className="flex-1 overflow-auto rounded-xl border border-gray-200 shadow-sm">
              <EmailPreview
                html={editPreviewHtml ?? campaign.html_content ?? ''}
                loading={editRendering && !editPreviewHtml}
              />
            </div>
          </div>
        )}

        {/* MJML tab */}
        {tab === 'mjml' && (
          <pre className="p-6 text-xs font-mono text-gray-700 overflow-auto h-full bg-white whitespace-pre-wrap">
            {campaign.mjml_content ?? 'No MJML content'}
          </pre>
        )}

        {/* HTML tab */}
        {tab === 'html' && (
          <pre className="p-6 text-xs font-mono text-gray-700 overflow-auto h-full bg-white whitespace-pre-wrap">
            {campaign.html_content ?? 'No HTML content'}
          </pre>
        )}
      </div>
    </div>
  );
}
