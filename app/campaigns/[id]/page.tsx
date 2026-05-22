'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { EmailPreview } from '@/components/email-preview';

// ── Toolbar helpers ───────────────────────────────────────────────────────────
function wrapSelection(ta: HTMLTextAreaElement, set: (v: string) => void, b: string, a: string) {
  const { selectionStart: s, selectionEnd: e, value: v } = ta;
  const sel = v.slice(s, e) || 'text';
  set(v.slice(0, s) + b + sel + a + v.slice(e));
  setTimeout(() => { ta.focus(); ta.setSelectionRange(s + b.length, s + b.length + sel.length); }, 0);
}
function prefixLines(ta: HTMLTextAreaElement, set: (v: string) => void, prefix: string) {
  const { selectionStart: s, selectionEnd: e, value: v } = ta;
  const ls = v.slice(0, s).lastIndexOf('\n') + 1;
  set(v.slice(0, ls) + v.slice(ls, e).split('\n').map(l => prefix + l.replace(/^#{1,6}\s?/, '')).join('\n') + v.slice(e));
  setTimeout(() => ta.focus(), 0);
}
function numberLines(ta: HTMLTextAreaElement, set: (v: string) => void) {
  const { selectionStart: s, selectionEnd: e, value: v } = ta;
  const ls = v.slice(0, s).lastIndexOf('\n') + 1;
  set(v.slice(0, ls) + v.slice(ls, e).split('\n').map((l, i) => `${i + 1}. ${l.replace(/^\d+\.\s?/, '')}`).join('\n') + v.slice(e));
  setTimeout(() => ta.focus(), 0);
}
function setFrontmatterField(md: string, key: string, val: string): string {
  const m = md.match(/^(---\n)([\s\S]*?)(\n---)/);
  if (!m) return md;
  const [full, open, body, close] = m;
  const re = new RegExp(`^${key}:.*$`, 'm');
  return open + (re.test(body) ? body.replace(re, `${key}: ${val}`) : body + `\n${key}: ${val}`) + close + md.slice(full.length);
}
function compressImage(file: File): Promise<File> {
  return new Promise(resolve => {
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/bmp'].includes(file.type)) { resolve(file); return; }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const r = Math.min(1800 / img.width, 1800 / img.height, 1);
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * r); c.height = Math.round(img.height * r);
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
      c.toBlob(b => resolve(b ? new File([b], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }) : file), 'image/jpeg', 0.85);
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}
function fmtTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-SG', { day: 'numeric', month: 'short' }) + ' ' +
    d.toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' });
}

type EditMode = 'refine' | 'edit' | 'mjml' | 'html';
type UploadEntry = { url: string; uploaded_at: string; uploaded_by: string };
type Campaign = {
  id: string; subject: string; template: string; status: string;
  created_at: string; updated_at: string;
  last_updated_by: string | null;
  markdown: string;
  html_content: string | null; mjml_content: string | null;
  loops_campaign_url: string | null;
  loops_uploads: UploadEntry[] | null;
  users: { name: string | null; email: string; avatar_url: string | null } | null;
};

const TEMPLATE_LABELS: Record<string, string> = {
  'product-launch': 'Product Launch', 'feature-update': 'Feature Update', 'newsletter': 'Newsletter',
  'promotional': 'Promotional', 'event-invitation': 'Event Invitation', 'partner-spotlight': 'Partner Spotlight',
  'important-announcement': 'Important Announcement', 'app-changes': 'App Changes',
  'rate-changes': 'Rate Changes', 'compliance': 'Compliance Notice',
};

function CampaignPageInner() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params.id as string;
  void searchParams;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState<EditMode>('edit');

  // Edit
  const [editedMd, setEditedMd] = useState('');
  const [liveHtml, setLiveHtml] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState('');
  const [refinePrompt, setRefinePrompt] = useState('');
  const [refining, setRefining] = useState(false);
  const [imgUploading, setImgUploading] = useState(false);
  const [showImgMenu, setShowImgMenu] = useState(false);

  // Actions
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [duplicating, setDuplicating] = useState(false);

  const taRef = useRef<HTMLTextAreaElement>(null);
  const insertRef = useRef<HTMLInputElement>(null);
  const imgModeRef = useRef<'inline' | 'hero' | 'image-left' | 'image-right'>('inline');

  useEffect(() => {
    fetch(`/api/campaigns/${id}`)
      .then(r => r.json())
      .then(d => {
        const c = d.campaign as Campaign;
        setCampaign(c);
        if (c?.markdown) setEditedMd(c.markdown);
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleInsertImage(files: FileList) {
    setImgUploading(true);
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue;
      const compressed = await compressImage(file);
      const form = new FormData(); form.append('file', compressed);
      const res = await fetch('/api/images/upload', { method: 'POST', body: form });
      const data = await res.json();
      if (res.ok && taRef.current) {
        const { selectionStart: s, selectionEnd: e, value } = taRef.current;
        if (imgModeRef.current === 'hero') { setEditedMd(setFrontmatterField(value, 'heroImage', data.url)); }
        else {
          const insert = imgModeRef.current === 'image-left' ? `\n::: image-left ${data.url}\n### Heading\nBody text.\n:::\n`
            : imgModeRef.current === 'image-right' ? `\n::: image-right ${data.url}\n### Heading\nBody text.\n:::\n`
            : `![${value.slice(s, e) || ''}](${data.url})`;
          setEditedMd(value.slice(0, s) + insert + value.slice(e));
        }
      }
    }
    setImgUploading(false);
  }

  async function handleRerender() {
    setRendering(true); setError('');
    try {
      const res = await fetch('/api/campaigns/preview', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ markdown: editedMd }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Render failed');
      setLiveHtml(data.html);
    } catch (e) { setError(e instanceof Error ? e.message : 'Render failed'); }
    finally { setRendering(false); }
  }

  async function handleRefine() {
    if (!refinePrompt.trim()) return;
    setRefining(true); setError('');
    try {
      const res = await fetch('/api/campaigns/refine', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentMarkdown: editedMd, instruction: refinePrompt }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Refinement failed');
      setEditedMd(data.markdown); setLiveHtml(data.html); setRefinePrompt('');
    } catch (e) { setError(e instanceof Error ? e.message : 'Refinement failed'); }
    finally { setRefining(false); }
  }

  async function handleSave() {
    setSaving(true); setError('');
    try {
      const patchRes = await fetch(`/api/campaigns/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ markdown: editedMd }) });
      const patchData = await patchRes.json();
      if (patchRes.ok) {
        setCampaign(c => c ? { ...c, ...patchData.campaign } : patchData.campaign);
        setLiveHtml(patchData.campaign.html_content);
      } else {
        const postRes = await fetch('/api/campaigns', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ markdown: editedMd }) });
        const postData = await postRes.json();
        if (!postRes.ok) throw new Error(postData.error ?? 'Save failed');
        router.push(`/campaigns/${postData.campaign.id}`);
      }
    } catch (e) { setError(e instanceof Error ? e.message : 'Save failed'); }
    finally { setSaving(false); }
  }

  async function handleUpload() {
    setUploading(true); setUploadError('');
    try {
      const res = await fetch(`/api/campaigns/${id}/upload`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCampaign(c => c ? {
        ...c, status: 'uploaded', loops_campaign_url: data.url,
        loops_uploads: [{ url: data.url, uploaded_at: new Date().toISOString(), uploaded_by: '' }, ...(c.loops_uploads ?? [])],
      } : c);
    } catch (e) { setUploadError(e instanceof Error ? e.message : 'Upload failed'); }
    finally { setUploading(false); }
  }

  async function handleDuplicate() {
    setDuplicating(true);
    try {
      const res = await fetch(`/api/campaigns/${id}/duplicate`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/campaigns/${data.campaign.id}`);
    } catch (e) { setUploadError(e instanceof Error ? e.message : 'Duplicate failed'); setDuplicating(false); }
  }

  async function handleDelete() {
    if (!confirm('Delete this campaign? This cannot be undone.')) return;
    setDeleting(true);
    await fetch(`/api/campaigns/${id}`, { method: 'DELETE' });
    router.push('/dashboard');
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F9F9F6' }}>
      <p className="text-sm text-gray-400">Loading…</p>
    </div>
  );

  if (!campaign) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F9F9F6' }}>
      <div className="text-center">
        <p className="text-sm text-gray-500 mb-3">Campaign not found</p>
        <Link href="/dashboard" className="text-sm font-medium hover:underline" style={{ color: '#2465DE' }}>← Back to dashboard</Link>
      </div>
    </div>
  );

  const displayHtml = liveHtml ?? campaign.html_content;
  const uploads: UploadEntry[] = campaign.loops_uploads ?? (campaign.loops_campaign_url ? [{ url: campaign.loops_campaign_url, uploaded_at: campaign.updated_at, uploaded_by: '' }] : []);
  const creator = campaign.users;
  const creatorName = creator ? (creator.name ?? creator.email.split('@')[0]) : null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9F9F6' }}>
      {/* Nav */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3">
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">← Campaigns</Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-medium text-gray-900 truncate max-w-sm">{campaign.subject}</span>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={handleDuplicate} disabled={duplicating}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50">
            {duplicating ? 'Duplicating…' : 'Duplicate'}
          </button>
          <button onClick={handleDelete} disabled={deleting}
            className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 disabled:opacity-50">
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </nav>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-5 items-start">

          {/* ── Left: edit controls ── */}
          <div className="w-80 shrink-0 space-y-3">

            {error && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
            )}

            {/* Mode tabs card */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="grid grid-cols-2 border-b border-gray-100">
                {([
                  { id: 'refine', label: 'Refine' },
                  { id: 'edit',   label: 'Edit text' },
                  { id: 'mjml',   label: 'MJML' },
                  { id: 'html',   label: 'HTML' },
                ] as { id: EditMode; label: string }[]).map(tab => (
                  <button key={tab.id} onClick={() => { setEditMode(tab.id); setError(''); }}
                    className={`py-2.5 text-xs font-medium border-b-2 transition-colors ${
                      editMode === tab.id
                        ? 'border-blue-500 text-blue-600 bg-blue-50'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}>
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-4">

                {/* Refine */}
                {editMode === 'refine' && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Describe any change — wording, tone, structure, add or remove sections.</p>
                    <textarea value={refinePrompt} onChange={e => setRefinePrompt(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleRefine(); }}
                      placeholder="e.g. Make the intro shorter and punchier. Add a bullet list of 3 benefits."
                      rows={5}
                      className="w-full text-sm text-gray-800 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 resize-none placeholder-gray-400 mb-2" />
                    <button onClick={handleRefine} disabled={refining || !refinePrompt.trim()}
                      className="w-full py-2 rounded-lg text-white text-xs font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity"
                      style={{ backgroundColor: '#2465DE' }}>
                      {refining ? <span className="flex items-center justify-center gap-1.5"><span className="animate-spin inline-block w-3 h-3 border border-white border-t-transparent rounded-full" />Working…</span> : 'Apply changes'}
                    </button>
                  </div>
                )}

                {/* Edit text */}
                {editMode === 'edit' && (
                  <div>
                    {/* Toolbar */}
                    <div className="flex flex-wrap items-center gap-1 mb-2 p-1.5 bg-gray-50 border border-gray-200 rounded-lg">
                      {[
                        { l: 'B',  t: 'Bold',           a: () => taRef.current && wrapSelection(taRef.current, setEditedMd, '**', '**'), s: { fontWeight: 700 } },
                        { l: 'I',  t: 'Italic',         a: () => taRef.current && wrapSelection(taRef.current, setEditedMd, '_', '_'),   s: { fontStyle: 'italic' } },
                        { l: 'H1', t: 'Heading 1',      a: () => taRef.current && prefixLines(taRef.current, setEditedMd, '# '),         s: {} },
                        { l: 'H2', t: 'Heading 2',      a: () => taRef.current && prefixLines(taRef.current, setEditedMd, '## '),        s: {} },
                        { l: '•',  t: 'Bullet list',    a: () => taRef.current && prefixLines(taRef.current, setEditedMd, '- '),         s: { fontSize: '16px', lineHeight: '1' } },
                        { l: '1.', t: 'Numbered list',  a: () => taRef.current && numberLines(taRef.current, setEditedMd),               s: { fontSize: '11px' } },
                      ].map(btn => (
                        <button key={btn.l} type="button" title={btn.t} onClick={btn.a}
                          className="w-7 h-7 flex items-center justify-center text-xs text-gray-600 rounded hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200"
                          style={btn.s}>{btn.l}</button>
                      ))}
                      <div className="w-px h-4 bg-gray-200 mx-0.5" />
                      {[['#002771','Deep blue'],['#000000','Black'],['#61667C','Gray']].map(([col, title]) => (
                        <button key={col} type="button" title={title}
                          onClick={() => taRef.current && wrapSelection(taRef.current, setEditedMd, `<span style="color:${col}">`, '</span>')}
                          className="w-7 h-7 flex items-center justify-center text-xs font-bold rounded hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200"
                          style={{ color: col }}>A</button>
                      ))}
                      <div className="w-px h-4 bg-gray-200 mx-0.5" />
                      <div className="relative">
                        <button type="button" title="Insert image" disabled={imgUploading} onClick={() => setShowImgMenu(m => !m)}
                          className="w-7 h-7 flex items-center justify-center text-xs text-gray-600 rounded hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 disabled:opacity-40">
                          {imgUploading ? <span className="animate-spin inline-block w-3 h-3 border border-gray-400 border-t-transparent rounded-full" /> : '🖼'}
                        </button>
                        {showImgMenu && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowImgMenu(false)} />
                            <div className="absolute left-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1 w-48">
                              {([['hero','Hero / banner','heroImage: url'],['inline','Inline image','![alt](url)'],['image-left','Image + text (left)','::: image-left'],['image-right','Image + text (right)','::: image-right']] as const).map(([mode, label, hint]) => (
                                <button key={mode} type="button" onClick={() => { imgModeRef.current = mode; setShowImgMenu(false); insertRef.current?.click(); }}
                                  className="w-full text-left px-3 py-2 hover:bg-gray-50">
                                  <p className="text-xs font-medium text-gray-700">{label}</p>
                                  <p className="text-xs text-gray-400 font-mono">{hint}</p>
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <textarea ref={taRef} value={editedMd} onChange={e => setEditedMd(e.target.value)}
                      rows={18}
                      className="w-full text-xs text-gray-700 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 resize-none font-mono"
                      spellCheck={false} />
                  </div>
                )}

                {/* MJML */}
                {editMode === 'mjml' && (
                  <pre className="text-xs font-mono text-gray-600 whitespace-pre-wrap overflow-auto max-h-96">
                    {campaign.mjml_content ?? 'No MJML content'}
                  </pre>
                )}

                {/* HTML */}
                {editMode === 'html' && (
                  <pre className="text-xs font-mono text-gray-600 whitespace-pre-wrap overflow-auto max-h-96">
                    {campaign.html_content ?? 'No HTML content'}
                  </pre>
                )}

              </div>
            </div>

            {/* Re-render preview */}
            {editMode === 'edit' && (
              <button onClick={handleRerender} disabled={rendering}
                className="w-full py-2 rounded-lg text-white text-xs font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity"
                style={{ backgroundColor: '#2465DE' }}>
                {rendering ? <span className="flex items-center justify-center gap-1.5"><span className="animate-spin inline-block w-3 h-3 border border-white border-t-transparent rounded-full" />Rendering…</span> : 'Re-render preview'}
              </button>
            )}

            {/* Save */}
            <button onClick={handleSave} disabled={saving}
              className="w-full py-2 rounded-lg text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
              style={{ backgroundColor: '#002771' }}>
              {saving ? 'Saving…' : 'Save Campaign'}
            </button>

            {/* Upload to Loops */}
            <button onClick={handleUpload} disabled={uploading}
              className="w-full py-2 rounded-lg text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
              style={{ backgroundColor: '#4a8c64' }}>
              {uploading
                ? <span className="flex items-center justify-center gap-2"><span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full" />Uploading…</span>
                : uploads.length > 0 ? 'Re-upload to Loops' : 'Upload to Loops'}
            </button>
            {uploadError && (
              <p className="text-xs text-red-600">
                {uploadError}{' '}
                {uploadError.toLowerCase().includes('settings') && <Link href="/settings" className="underline">Settings →</Link>}
              </p>
            )}

            {/* View in Loops */}
            {campaign.loops_campaign_url && (
              <a href={campaign.loops_campaign_url} target="_blank" rel="noopener noreferrer"
                className="block w-full py-2 rounded-lg border border-gray-200 bg-white text-center text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                View in Loops ↗
              </a>
            )}

            {/* History */}
            <div className="space-y-1 px-1 pt-1">
              {creatorName && (
                <p className="text-xs text-gray-400">Created by <span className="text-gray-600">{creatorName}</span></p>
              )}
              {campaign.last_updated_by && (
                <p className="text-xs text-gray-400">Last edited by <span className="text-gray-600">{campaign.last_updated_by.split('@')[0]}</span> {fmtTime(campaign.updated_at)}</p>
              )}
              {uploads.length > 0 && (
                <p className="text-xs text-gray-400">Pushed to Loops {fmtTime(uploads[0].uploaded_at)}{uploads[0].uploaded_by ? <> by <span className="text-gray-600">{uploads[0].uploaded_by.split('@')[0]}</span></> : ''}</p>
              )}
            </div>

          </div>

          {/* ── Right: email preview ── */}
          <div className="flex-1 rounded-xl overflow-hidden border border-gray-200 shadow-sm" style={{ height: '860px' }}>
            <EmailPreview html={displayHtml ?? ''} />
          </div>

        </div>
      </div>

      <input ref={insertRef} type="file" accept="image/*" multiple className="hidden"
        onChange={e => { if (e.target.files?.length) handleInsertImage(e.target.files); e.target.value = ''; }} />
    </div>
  );
}

export default function CampaignPage() {
  return <Suspense><CampaignPageInner /></Suspense>;
}
