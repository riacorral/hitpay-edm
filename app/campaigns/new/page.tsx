'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type EditMode = 'refine' | 'edit' | 'regenerate' | 'brief';

export default function NewCampaignPage() {
  const router = useRouter();

  // Brief state
  const [prompt, setPrompt] = useState('');
  const [images, setImages] = useState<{ url: string; name: string }[]>([]);

  // Result state
  const [previewHtml, setPreviewHtml] = useState('');
  const [markdown, setMarkdown] = useState('');

  // Edit mode (shown after first generation)
  const [editMode, setEditMode] = useState<EditMode>('refine');
  const [refinePrompt, setRefinePrompt] = useState('');
  const [editedMarkdown, setEditedMarkdown] = useState('');

  // Loading / error
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fileRef = useRef<HTMLInputElement>(null);
  const hasPreview = !!previewHtml;

  // ── Image upload ──────────────────────────────────────
  async function handleImageUpload(files: FileList) {
    setUploading(true);
    setError('');
    const added: { url: string; name: string }[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue;
      if (file.size > 5 * 1024 * 1024) { setError(`${file.name} is too large (max 5MB)`); continue; }
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/images/upload', { method: 'POST', body: form });
      const data = await res.json();
      if (res.ok) added.push({ url: data.url, name: file.name });
    }
    setImages(prev => [...prev, ...added]);
    setUploading(false);
  }

  // ── Generate (first time) ─────────────────────────────
  async function handleGenerate() {
    if (!prompt.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/campaigns/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, images: images.map(i => i.url) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Generation failed');
      setPreviewHtml(data.html);
      setMarkdown(data.markdown);
      setEditedMarkdown(data.markdown);
      setEditMode('refine');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate email');
    } finally {
      setLoading(false);
    }
  }

  // ── Refine (minor edit prompt) ────────────────────────
  async function handleRefine() {
    if (!refinePrompt.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/campaigns/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentMarkdown: markdown, instruction: refinePrompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Refinement failed');
      setPreviewHtml(data.html);
      setMarkdown(data.markdown);
      setEditedMarkdown(data.markdown);
      setRefinePrompt('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Refinement failed');
    } finally {
      setLoading(false);
    }
  }

  // ── Re-render from direct markdown edit ──────────────
  async function handleRerender() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/campaigns/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markdown: editedMarkdown }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Render failed');
      setPreviewHtml(data.html);
      setMarkdown(editedMarkdown);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Render failed');
    } finally {
      setLoading(false);
    }
  }

  // ── Save ──────────────────────────────────────────────
  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markdown }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Save failed');
      router.push(`/campaigns/${data.campaign.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
      setSaving(false);
    }
  }

  // ── Back to brief ─────────────────────────────────────
  function handleBackToBrief() {
    setPreviewHtml('');
    setMarkdown('');
    setEditedMarkdown('');
    setError('');
    setRefinePrompt('');
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9F9F6' }}>
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3">
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">← Campaigns</Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-medium text-gray-900">New Campaign</span>
      </nav>

      <div className={`mx-auto px-4 py-8 transition-all duration-300 ${hasPreview ? 'max-w-6xl' : 'max-w-2xl'}`}>

        {/* ══ BRIEF INPUT (before first generation) ══ */}
        {!hasPreview && (
          <div>
            <h1 className="text-xl font-semibold text-gray-900 mb-1">What's this email about?</h1>
            <p className="text-sm text-gray-500 mb-6">
              Describe it like you're briefing a copywriter — type of email, who it's for, key details, any links or promo codes.
            </p>

            {error && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
            )}

            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-gray-200 p-5 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-100 transition-colors">
                <textarea
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleGenerate(); }}
                  placeholder="e.g. Product launch email for HitPay QR Code. New way for restaurants to accept payments — no hardware, just a QR code. Fast checkout, works with existing POS. CTA to hitpayapp.com/qr. Launch date 1 June."
                  rows={6}
                  className="w-full text-sm text-gray-800 outline-none resize-none placeholder-gray-400 leading-relaxed"
                  autoFocus
                />
              </div>

              {/* Images */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-700">
                    Images <span className="text-gray-400 font-normal text-xs">— optional</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                  >
                    {uploading
                      ? <span className="flex items-center gap-1.5"><span className="animate-spin inline-block w-3 h-3 border border-gray-400 border-t-transparent rounded-full" /> Uploading…</span>
                      : '+ Add image'}
                  </button>
                </div>
                {images.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {images.map((img, i) => (
                      <div key={img.url} className="relative group w-20 h-20">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.url} alt={img.name} className="w-full h-full object-cover rounded-lg border border-gray-200" />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs text-center py-0.5 rounded-b-lg">Image {i + 1}</div>
                        <button
                          type="button"
                          onClick={() => setImages(prev => prev.filter((_, j) => j !== i))}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white rounded-full shadow border border-gray-200 flex items-center justify-center text-xs text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >×</button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">Add photos to include as hero or inline images.</p>
                )}
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading || !prompt.trim()}
                className="w-full py-3 rounded-xl text-white text-sm font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity"
                style={{ backgroundColor: '#2465DE' }}
              >
                {loading
                  ? <span className="flex items-center justify-center gap-2"><span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Generating email…</span>
                  : 'Generate Email →'}
              </button>
              <p className="text-center text-xs text-gray-400">⌘ + Enter to generate</p>
            </div>
          </div>
        )}

        {/* ══ PREVIEW + EDIT PANEL ══ */}
        {hasPreview && (
          <div className="flex gap-5 items-start">

            {/* ── Left: edit controls ── */}
            <div className="w-72 shrink-0 space-y-3">

              {error && (
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
              )}

              {/* Mode tabs */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="grid grid-cols-2 border-b border-gray-100">
                  {([
                    { id: 'refine',     label: 'Refine' },
                    { id: 'edit',       label: 'Edit text' },
                    { id: 'regenerate', label: 'Regenerate' },
                    { id: 'brief',      label: 'Edit brief' },
                  ] as { id: EditMode; label: string }[]).map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => { setEditMode(tab.id); setError(''); }}
                      className={`py-2.5 text-xs font-medium border-b-2 transition-colors ${
                        editMode === tab.id
                          ? 'border-blue-500 text-blue-600 bg-blue-50'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="p-4">
                  {/* ── Refine: minor edit prompt ── */}
                  {editMode === 'refine' && (
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Describe any change — wording, tone, structure, add or remove sections.</p>
                      <textarea
                        value={refinePrompt}
                        onChange={e => setRefinePrompt(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleRefine(); }}
                        placeholder="e.g. Make the intro shorter and punchier. Add a bullet list of 3 benefits after the first paragraph."
                        rows={4}
                        className="w-full text-sm text-gray-800 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 resize-none placeholder-gray-400 mb-2"
                      />
                      <button
                        onClick={handleRefine}
                        disabled={loading || !refinePrompt.trim()}
                        className="w-full py-2 rounded-lg text-white text-xs font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity"
                        style={{ backgroundColor: '#2465DE' }}
                      >
                        {loading ? <span className="flex items-center justify-center gap-1.5"><span className="animate-spin inline-block w-3 h-3 border border-white border-t-transparent rounded-full" /> Working…</span> : 'Apply changes'}
                      </button>
                    </div>
                  )}

                  {/* ── Edit text: direct markdown edit ── */}
                  {editMode === 'edit' && (
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Edit the email directly. Click Re-render to update the preview.</p>
                      <textarea
                        value={editedMarkdown}
                        onChange={e => setEditedMarkdown(e.target.value)}
                        rows={14}
                        className="w-full text-xs text-gray-700 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 resize-none font-mono mb-2"
                        spellCheck={false}
                      />
                      <button
                        onClick={handleRerender}
                        disabled={loading}
                        className="w-full py-2 rounded-lg text-white text-xs font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity"
                        style={{ backgroundColor: '#2465DE' }}
                      >
                        {loading ? <span className="flex items-center justify-center gap-1.5"><span className="animate-spin inline-block w-3 h-3 border border-white border-t-transparent rounded-full" /> Rendering…</span> : 'Re-render preview'}
                      </button>
                    </div>
                  )}

                  {/* ── Regenerate ── */}
                  {editMode === 'regenerate' && (
                    <div>
                      <p className="text-xs text-gray-500 mb-3">Regenerate the email from scratch using the same brief and images.</p>
                      <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="w-full py-2 rounded-lg text-white text-xs font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity mb-2"
                        style={{ backgroundColor: '#2465DE' }}
                      >
                        {loading ? <span className="flex items-center justify-center gap-1.5"><span className="animate-spin inline-block w-3 h-3 border border-white border-t-transparent rounded-full" /> Generating…</span> : '↺ Regenerate email'}
                      </button>
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs font-medium text-gray-500 mb-1">Current brief</p>
                        <p className="text-xs text-gray-400 leading-relaxed whitespace-pre-line">{prompt}</p>
                        {images.length > 0 && (
                          <div className="mt-2 flex gap-1 flex-wrap">
                            {images.map((img, i) => (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img key={img.url} src={img.url} alt={`Image ${i+1}`} className="w-8 h-8 object-cover rounded border border-gray-200" />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ── Edit brief ── */}
                  {editMode === 'brief' && (
                    <div>
                      <p className="text-xs text-gray-500 mb-3">Change your brief and images, then generate a fresh email.</p>
                      <textarea
                        value={prompt}
                        onChange={e => setPrompt(e.target.value)}
                        rows={5}
                        className="w-full text-sm text-gray-800 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 resize-none placeholder-gray-400 mb-2"
                        placeholder="Describe the email…"
                      />
                      <div className="flex items-center gap-2 mb-2">
                        <button
                          type="button"
                          onClick={() => fileRef.current?.click()}
                          disabled={uploading}
                          className="text-xs px-2.5 py-1.5 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                        >
                          {uploading ? 'Uploading…' : '+ Images'}
                        </button>
                        {images.length > 0 && (
                          <div className="flex gap-1">
                            {images.map((img, i) => (
                              <div key={img.url} className="relative group">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={img.url} alt="" className="w-8 h-8 object-cover rounded border border-gray-200" />
                                <button
                                  onClick={() => setImages(prev => prev.filter((_, j) => j !== i))}
                                  className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full border border-gray-200 flex items-center justify-center text-xs text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100"
                                >×</button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={handleGenerate}
                        disabled={loading || !prompt.trim()}
                        className="w-full py-2 rounded-lg text-white text-xs font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity"
                        style={{ backgroundColor: '#2465DE' }}
                      >
                        {loading ? <span className="flex items-center justify-center gap-1.5"><span className="animate-spin inline-block w-3 h-3 border border-white border-t-transparent rounded-full" /> Generating…</span> : 'Generate new email'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Save */}
              <button
                onClick={handleSave}
                disabled={saving || loading}
                className="w-full py-3 rounded-xl text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
                style={{ backgroundColor: '#002771' }}
              >
                {saving ? 'Saving…' : 'Save Campaign'}
              </button>

              <button
                onClick={handleBackToBrief}
                className="w-full py-2 text-xs text-gray-400 hover:text-gray-600"
              >
                ← Start over
              </button>
            </div>

            {/* ── Right: email preview ── */}
            <div className="flex-1 rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white" style={{ height: '860px' }}>
              {loading && !previewHtml ? (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="animate-spin w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full" />
                </div>
              ) : (
                <iframe
                  srcDoc={previewHtml}
                  className="w-full h-full border-0"
                  title="Email preview"
                />
              )}
            </div>
          </div>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={e => {
          if (e.target.files?.length) handleImageUpload(e.target.files);
          e.target.value = '';
        }}
      />
    </div>
  );
}
