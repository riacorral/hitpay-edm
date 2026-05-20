'use client';

import { useState, useRef } from 'react';

const CDN = 'https://3cse8uwfv1q9zblo.public.blob.vercel-storage.com/hitpay-edm';

const LIBRARY = [
  { label: 'HitPay Logo (Dark)', url: `${CDN}/logo-dark%402x.png` },
  { label: 'HitPay Logo (White)', url: `${CDN}/logo-white%402x.png` },
  { label: 'HitPay Logogram', url: `${CDN}/hitpay-logogram.svg` },
];

interface Props {
  value: string;
  onChange: (url: string) => void;
  label: string;
  required?: boolean;
  hint?: string;
  aiPromptSuggestion?: string;
}

export function ImagePicker({ value, onChange, label, required, hint, aiPromptSuggestion }: Props) {
  const [panel, setPanel] = useState<'none' | 'ai' | 'library' | 'url'>('none');
  const [aiPrompt, setAiPrompt] = useState('');
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload(file: File) {
    setUploading(true);
    setError('');
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/images/upload', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Upload failed');
      onChange(data.url);
      setPanel('none');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function handleGenerate() {
    if (!aiPrompt.trim()) return;
    setGenerating(true);
    setError('');
    try {
      const res = await fetch('/api/images/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Generation failed');
      onChange(data.url);
      setPanel('none');
      setAiPrompt('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Generation failed');
    } finally {
      setGenerating(false);
    }
  }

  function togglePanel(p: typeof panel) {
    setPanel(prev => prev === p ? 'none' : p);
    setError('');
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
        {hint && <span className="text-gray-400 font-normal text-xs ml-1">— {hint}</span>}
      </label>

      {/* Current image preview */}
      {value && (
        <div className="mb-2 relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="w-full max-h-36 object-contain p-2" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-1.5 right-1.5 w-5 h-5 bg-white rounded-full shadow flex items-center justify-center text-gray-400 hover:text-red-500 text-xs font-bold"
          >
            ×
          </button>
        </div>
      )}

      {!value && (
        <>
          {/* Action buttons */}
          <div className="grid grid-cols-3 gap-2 mb-1">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="py-2 px-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center gap-1"
            >
              {uploading ? (
                <span className="animate-spin inline-block w-3 h-3 border border-gray-400 border-t-transparent rounded-full" />
              ) : (
                <span>↑</span>
              )}
              {uploading ? 'Uploading…' : 'Upload photo'}
            </button>
            <button
              type="button"
              onClick={() => togglePanel('ai')}
              className={`py-2 px-2 rounded-lg border text-xs font-medium transition-colors flex items-center justify-center gap-1 ${
                panel === 'ai'
                  ? 'border-purple-400 bg-purple-50 text-purple-700'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              ✦ AI Generate
            </button>
            <button
              type="button"
              onClick={() => togglePanel('library')}
              className={`py-2 px-2 rounded-lg border text-xs font-medium transition-colors flex items-center justify-center gap-1 ${
                panel === 'library'
                  ? 'border-blue-400 bg-blue-50 text-blue-700'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              ⊞ Library
            </button>
          </div>

          {/* Paste URL toggle */}
          <button
            type="button"
            onClick={() => togglePanel('url')}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            {panel === 'url' ? '▲ Hide' : '▼ Or paste a URL'}
          </button>
          {panel === 'url' && (
            <input
              type="url"
              placeholder="https://..."
              className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
              onChange={e => {
                const v = e.target.value.trim();
                if (v.startsWith('http')) onChange(v);
              }}
            />
          )}
        </>
      )}

      {/* AI Generate panel */}
      {panel === 'ai' && (
        <div className="mt-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-xs font-semibold text-purple-800 mb-2">Describe the image you want</p>
          <textarea
            value={aiPrompt}
            onChange={e => setAiPrompt(e.target.value)}
            placeholder={aiPromptSuggestion ?? 'e.g. Modern payment terminal on a wooden desk, soft studio lighting'}
            rows={2}
            className="w-full px-3 py-2 border border-purple-200 rounded-lg text-sm outline-none focus:border-purple-400 bg-white resize-none mb-2"
          />
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating || !aiPrompt.trim()}
            className="w-full py-2 rounded-lg text-white text-xs font-semibold disabled:opacity-50 transition-opacity"
            style={{ backgroundColor: '#7C3AED' }}
          >
            {generating ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin inline-block w-3 h-3 border border-white border-t-transparent rounded-full" />
                Generating… (takes ~15s)
              </span>
            ) : 'Generate image'}
          </button>
        </div>
      )}

      {/* Library panel */}
      {panel === 'library' && (
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs font-semibold text-blue-800 mb-2">HitPay brand assets</p>
          <div className="grid grid-cols-3 gap-2">
            {LIBRARY.map(item => (
              <button
                key={item.url}
                type="button"
                onClick={() => { onChange(item.url); setPanel('none'); }}
                className="border border-blue-200 rounded-lg overflow-hidden bg-white hover:border-blue-400 transition-colors p-1"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url} alt={item.label} className="w-full h-10 object-contain" />
                <p className="text-xs text-gray-500 mt-0.5 text-center truncate px-1">{item.label}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}
