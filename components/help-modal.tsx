'use client';

import { useState } from 'react';

export function HelpButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="How to use"
        className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-300 text-xs font-semibold text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors"
      >
        ?
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">How to use the editor</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors text-lg leading-none"
              >
                ×
              </button>
            </div>

            <div className="px-6 py-5 space-y-6">

              {/* Image button */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base">🖼</span>
                  <p className="text-sm font-semibold text-gray-800">Image button</p>
                  <span className="text-xs text-gray-400">in the Edit text toolbar</span>
                </div>
                <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                  Click the image icon in the toolbar to upload and place a photo. You&apos;ll get four placement options:
                </p>
                <div className="space-y-2">
                  {[
                    {
                      label: 'Hero / banner',
                      desc: 'Replaces the full-width banner at the top of the email. Good for a strong visual opener.',
                    },
                    {
                      label: 'Inline image',
                      desc: 'Inserts a centered standalone image in the email body, wherever your cursor is.',
                    },
                    {
                      label: 'Image + text (left)',
                      desc: 'Creates a side-by-side block — photo on the left, your heading and body text on the right.',
                    },
                    {
                      label: 'Image + text (right)',
                      desc: 'Same as above but photo on the right. Good for alternating layouts.',
                    },
                  ].map(item => (
                    <div key={item.label} className="flex gap-3 bg-gray-50 rounded-lg px-3 py-2.5">
                      <div className="w-1 shrink-0 rounded-full" style={{ backgroundColor: '#2465DE' }} />
                      <div>
                        <p className="text-xs font-semibold text-gray-700">{item.label}</p>
                        <p className="text-xs text-gray-500 leading-relaxed mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                  After inserting an Image + text block, edit the generated placeholder text directly in the markdown editor.
                </p>
              </div>

              <div className="border-t border-gray-100" />

              {/* CTA button */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center justify-center w-5 h-4 rounded border border-gray-400">
                    <svg width="10" height="7" viewBox="0 0 14 10" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="0.6" y="0.6" width="12.8" height="8.8" rx="2.4"/>
                      <line x1="3.5" y1="5" x2="10.5" y2="5" strokeLinecap="round"/>
                    </svg>
                  </span>
                  <p className="text-sm font-semibold text-gray-800">CTA button</p>
                  <span className="text-xs text-gray-400">in the Edit text toolbar</span>
                </div>
                <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                  Inserts a styled blue call-to-action button at the cursor position.
                </p>
                <div className="space-y-2">
                  {[
                    { label: '1. Position cursor', desc: 'Click in the markdown editor where you want the button to appear.' },
                    { label: '2. Click the button icon', desc: 'A small form pops up. Enter the button label (e.g. "Get started") and the destination URL.' },
                    { label: '3. Insert', desc: 'Click Insert button or press Enter. The button renders as a full-width blue CTA in the email.' },
                  ].map(item => (
                    <div key={item.label} className="flex gap-3 bg-gray-50 rounded-lg px-3 py-2.5">
                      <div className="w-1 shrink-0 rounded-full" style={{ backgroundColor: '#2465DE' }} />
                      <div>
                        <p className="text-xs font-semibold text-gray-700">{item.label}</p>
                        <p className="text-xs text-gray-500 leading-relaxed mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100" />

              {/* Brief images */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base">📎</span>
                  <p className="text-sm font-semibold text-gray-800">Brief images</p>
                  <span className="text-xs text-gray-400">on the new campaign page</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Upload images before hitting Generate. The AI will automatically use the first image as the hero banner (if the template supports it) and reference the rest for inline placement. You can always reposition them afterward using the image toolbar button in Edit text mode.
                </p>
              </div>

              <div className="border-t border-gray-100" />

              {/* Markdown shortcuts */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base">⌨️</span>
                  <p className="text-sm font-semibold text-gray-800">Markdown shortcuts</p>
                  <span className="text-xs text-gray-400">type directly in Edit text</span>
                </div>
                <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                  The AI generates these automatically, but you can also write or edit them by hand.
                </p>
                <div className="space-y-3">
                  {[
                    {
                      label: 'Stat / columns grid',
                      syntax: ':::columns\n::column 📈 **42%**\nDescription here\n::column 🛒 **900M**\nDescription here\n:::',
                      desc: 'Side-by-side stat cards. Each ::column line takes an optional emoji, a bold number, then description on the next line. Use 2–4 columns.',
                    },
                    {
                      label: 'Image + text block',
                      syntax: '::: image-left https://your-image-url.jpg\n### Heading\nBody text here.\n:::',
                      desc: 'Photo on the left with text on the right. Use image-right to flip it. Replace the URL and edit the heading/body as needed.',
                    },
                    {
                      label: 'CTA button',
                      syntax: '[Get started](https://hitpayapp.com){.cta}',
                      desc: 'Renders as a full-width blue button. The {.cta} tag is what turns the link into a button — don\'t leave it out.',
                    },
                    {
                      label: 'Pull quote / blockquote',
                      syntax: '> "Quote text here."\n> — Attribution name',
                      desc: 'Renders as a styled pull quote with a blue left border. Good for testimonials or highlighted statements.',
                    },
                    {
                      label: 'Divider',
                      syntax: '---',
                      desc: 'Inserts a horizontal rule to separate sections visually.',
                    },
                  ].map(item => (
                    <div key={item.label} className="bg-gray-50 rounded-lg px-3 py-2.5">
                      <p className="text-xs font-semibold text-gray-700 mb-1.5">{item.label}</p>
                      <pre className="text-xs font-mono text-blue-700 bg-blue-50 rounded px-2 py-1.5 whitespace-pre mb-1.5 overflow-x-auto">{item.syntax}</pre>
                      <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
