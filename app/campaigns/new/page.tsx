'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewCampaignPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [images, setImages] = useState<{ url: string; name: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [generatedMarkdown, setGeneratedMarkdown] = useState('');
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

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

  async function handleGenerate() {
    if (!prompt.trim()) return;
    setGenerating(true);
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
      setGeneratedMarkdown(data.markdown);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate email');
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markdown: generatedMarkdown }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Save failed');
      router.push(`/campaigns/${data.campaign.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
      setSaving(false);
    }
  }

  const hasPreview = !!previewHtml;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9F9F6' }}>
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3">
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">← Campaigns</Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-medium text-gray-900">New Campaign</span>
      </nav>

      <div className={`mx-auto px-4 py-8 transition-all duration-300 ${hasPreview ? 'max-w-6xl' : 'max-w-2xl'}`}>

        {/* ── Input state ── */}
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
              {/* Prompt textarea */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-100 transition-colors">
                <textarea
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleGenerate();
                  }}
                  placeholder={`e.g. Product launch email for HitPay QR Code. New way for restaurants to accept payments — no hardware, just a QR code. Fast checkout, works with existing POS. CTA to hitpayapp.com/qr. Launch date 1 June.`}
                  rows={6}
                  className="w-full text-sm text-gray-800 outline-none resize-none placeholder-gray-400 leading-relaxed"
                  autoFocus
                />
              </div>

              {/* Image upload */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-700">
                    Images <span className="text-gray-400 font-normal text-xs">— optional, used as hero or inline photos</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
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
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs text-center py-0.5 rounded-b-lg">
                          Image {i + 1}
                        </div>
                        <button
                          type="button"
                          onClick={() => setImages(prev => prev.filter((_, j) => j !== i))}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white rounded-full shadow border border-gray-200 flex items-center justify-center text-xs text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >×</button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">No images added. Drop your photos here or click Add image.</p>
                )}
              </div>

              <button
                onClick={handleGenerate}
                disabled={generating || !prompt.trim()}
                className="w-full py-3 rounded-xl text-white text-sm font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity"
                style={{ backgroundColor: '#2465DE' }}
              >
                {generating
                  ? <span className="flex items-center justify-center gap-2"><span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Generating email…</span>
                  : 'Generate Email →'}
              </button>
              <p className="text-center text-xs text-gray-400">⌘ + Enter to generate</p>
            </div>
          </div>
        )}

        {/* ── Preview state ── */}
        {hasPreview && (
          <div className="flex gap-6 items-start">
            {/* Left sidebar */}
            <div className="w-72 shrink-0 space-y-3">
              {/* Brief recap */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Your brief</p>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{prompt}</p>
                {images.length > 0 && (
                  <div className="mt-3 flex gap-1.5 flex-wrap">
                    {images.map((img, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={img.url} src={img.url} alt={`Image ${i + 1}`} className="w-10 h-10 object-cover rounded border border-gray-200" />
                    ))}
                  </div>
                )}
              </div>

              {error && (
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
              )}

              <button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                {generating
                  ? <span className="flex items-center justify-center gap-2"><span className="animate-spin inline-block w-3 h-3 border border-gray-400 border-t-transparent rounded-full" /> Regenerating…</span>
                  : '↺ Regenerate'}
              </button>

              <button
                onClick={() => { setPreviewHtml(''); setGeneratedMarkdown(''); setError(''); }}
                className="w-full py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-500 hover:bg-gray-50 transition-colors"
              >
                ← Edit brief
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-3 rounded-xl text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
                style={{ backgroundColor: '#2465DE' }}
              >
                {saving ? 'Saving…' : 'Save Campaign'}
              </button>
            </div>

            {/* Email preview */}
            <div className="flex-1 rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white" style={{ height: '820px' }}>
              <iframe
                srcDoc={previewHtml}
                className="w-full h-full border-0"
                title="Email preview"
              />
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
