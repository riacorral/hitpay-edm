'use client';

import { useState, useCallback } from 'react';

type PreviewMode = 'desktop' | 'mobile';

const WIDTHS: Record<PreviewMode, number> = { desktop: 620, mobile: 390 };

export function EmailPreview({ html, loading = false }: { html: string; loading?: boolean }) {
  const [mode, setMode] = useState<PreviewMode>('desktop');
  const [iframeHeight, setIframeHeight] = useState(600);

  const onLoad = useCallback((e: React.SyntheticEvent<HTMLIFrameElement>) => {
    const doc = e.currentTarget.contentDocument;
    if (!doc) return;
    const h = doc.documentElement?.scrollHeight || doc.body?.scrollHeight || 600;
    setIframeHeight(h);
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Toggle bar */}
      <div className="flex items-center justify-center gap-1 py-2 bg-white border-b border-gray-100 shrink-0">
        {(['desktop', 'mobile'] as const).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              mode === m ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {m === 'desktop'
              ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
              : <svg width="12" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
            }
            {m.charAt(0).toUpperCase() + m.slice(1)}
            <span className="text-gray-300">{m === 'desktop' ? '620px' : '390px'}</span>
          </button>
        ))}
      </div>

      {/* Scrollable preview area */}
      <div className="flex-1 overflow-y-auto" style={{ backgroundColor: '#E8E8E5' }}>
        <div className="py-6 flex justify-center">
          {loading ? (
            <div className="flex items-center justify-center" style={{ width: WIDTHS[mode], height: 400 }}>
              <span className="animate-spin w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full" />
            </div>
          ) : (
            <div style={{ width: WIDTHS[mode], boxShadow: '0 4px 24px rgba(0,0,0,0.12)', borderRadius: '4px', overflow: 'hidden', background: '#fff' }}>
              <iframe
                key={mode}
                srcDoc={html}
                onLoad={onLoad}
                style={{ display: 'block', width: '100%', height: iframeHeight, border: 0 }}
                title="Email preview"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
