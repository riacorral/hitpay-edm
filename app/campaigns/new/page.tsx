'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ImagePicker } from '@/components/image-picker';

const TEMPLATES = [
  // Marketing
  { id: 'product-launch',          label: 'Product Launch',          emoji: '🚀', desc: 'Announce a new product with hero image and features',   category: 'Marketing' },
  { id: 'feature-update',          label: 'Feature Update',          emoji: '✨', desc: 'Highlight what\'s new this month',                       category: 'Marketing' },
  { id: 'newsletter',              label: 'Newsletter',              emoji: '📰', desc: 'Multi-section digest with metrics',                      category: 'Marketing' },
  { id: 'promotional',             label: 'Promotional',             emoji: '🎁', desc: 'Promo code, discount, and expiry date',                  category: 'Marketing' },
  { id: 'event-invitation',        label: 'Event Invitation',        emoji: '📅', desc: 'Event details and register CTA',                         category: 'Marketing' },
  { id: 'partner-spotlight',       label: 'Partner Spotlight',       emoji: '🤝', desc: 'Feature a partner with logo and story',                  category: 'Marketing' },
  // Operational
  { id: 'important-announcement',  label: 'Important Announcement',  emoji: '⚠️',  desc: 'Urgent notice that needs immediate attention',           category: 'Operational' },
  { id: 'app-changes',             label: 'App Changes',             emoji: '📱', desc: 'Platform or app update notification',                   category: 'Operational' },
  { id: 'rate-changes',            label: 'Rate Changes',            emoji: '💱', desc: 'Fee or pricing update with effective date',              category: 'Operational' },
  { id: 'compliance',              label: 'Compliance Notice',       emoji: '📋', desc: 'Regulatory or policy update notice',                    category: 'Operational' },
];

type FieldDef = {
  key: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  hint?: string;
  type?: 'text' | 'url' | 'number' | 'image';
  aiPromptSuggestion?: string;
};

const TEMPLATE_FIELDS: Record<string, FieldDef[]> = {
  'product-launch': [
    { key: 'productName',     label: 'Product Name',         placeholder: 'e.g. HitPay QR',          required: true },
    { key: 'ctaUrl',          label: 'Button URL',           placeholder: 'https://hitpayapp.com',   required: true, type: 'url' },
    { key: 'ctaText',         label: 'Button Text',          placeholder: 'Get Started (default)' },
    { key: 'heroImage',       label: 'Hero Image',           hint: 'Optional', type: 'image', aiPromptSuggestion: 'Sleek product launch hero image, abstract tech background, professional studio lighting' },
    { key: 'secondaryCtaText', label: 'Secondary Button Text', placeholder: 'Learn More' },
    { key: 'secondaryCtaUrl',  label: 'Secondary Button URL',  placeholder: 'https://...', type: 'url' },
  ],
  'feature-update': [
    { key: 'versionBadge',    label: 'Version / Period',     placeholder: 'e.g. May 2026' },
    { key: 'ctaUrl',          label: 'Button URL',           placeholder: 'https://hitpayapp.com',   type: 'url' },
    { key: 'ctaText',         label: 'Button Text',          placeholder: 'Learn More (default)' },
  ],
  'newsletter': [
    { key: 'title',           label: 'Newsletter Title',     placeholder: 'e.g. This Month at HitPay' },
    { key: 'subtitle',        label: 'Subtitle',             placeholder: 'e.g. Updates, insights, and more' },
    { key: 'issueNumber',     label: 'Issue Number',         placeholder: 'e.g. 12', type: 'number' },
    { key: 'date',            label: 'Date Label',           placeholder: 'e.g. May 2026' },
  ],
  'promotional': [
    { key: 'ctaUrl',          label: 'Button URL',           placeholder: 'https://hitpayapp.com',   required: true, type: 'url' },
    { key: 'promoCode',       label: 'Promo Code',           placeholder: 'e.g. SAVE20' },
    { key: 'discountText',    label: 'Discount Text',        placeholder: 'e.g. 20% off' },
    { key: 'expiryDate',      label: 'Expiry Date',          placeholder: 'e.g. 31 May 2026' },
    { key: 'ctaText',         label: 'Button Text',          placeholder: 'Claim Offer (default)' },
  ],
  'event-invitation': [
    { key: 'eventName',       label: 'Event Name',           placeholder: 'e.g. HitPay Workshop' },
    { key: 'eventDate',       label: 'Event Date',           placeholder: 'e.g. 15 May 2026' },
    { key: 'eventTime',       label: 'Event Time',           placeholder: 'e.g. 2:00 PM SGT' },
    { key: 'eventLocation',   label: 'Location',             placeholder: 'e.g. Marina Bay Sands, Singapore' },
    { key: 'primaryCtaText',  label: 'Register Button Text', placeholder: 'Register Now' },
    { key: 'primaryCtaUrl',   label: 'Register Button URL',  placeholder: 'https://...', type: 'url' },
    { key: 'ctaUrl',          label: 'Fallback Button URL',  placeholder: 'https://hitpayapp.com', required: true, type: 'url', hint: 'Required' },
    { key: 'ctaText',         label: 'Fallback Button Text', placeholder: 'Register Now (default)' },
  ],
  'partner-spotlight': [
    { key: 'partnerName',     label: 'Partner Name',         placeholder: 'e.g. Grab',              required: true },
    { key: 'ctaUrl',          label: 'Button URL',           placeholder: 'https://hitpayapp.com',   required: true, type: 'url' },
    { key: 'partnerLogo',     label: 'Partner Logo',         hint: 'Optional', type: 'image', aiPromptSuggestion: 'Clean partner company logo on white background, minimal and professional' },
    { key: 'ctaText',         label: 'Button Text',          placeholder: 'Read More (default)' },
  ],
  'important-announcement': [
    { key: 'badgeText',       label: 'Badge Label',          placeholder: 'Important Notice (default)' },
    { key: 'heroImage',       label: 'Header Image',         hint: 'Optional', type: 'image', aiPromptSuggestion: 'Abstract attention-grabbing header image, warm amber and blue tones, professional' },
    { key: 'ctaUrl',          label: 'Button URL',           placeholder: 'https://hitpayapp.com',   type: 'url' },
    { key: 'ctaText',         label: 'Button Text',          placeholder: 'Learn More (default)' },
  ],
  'app-changes': [
    { key: 'versionBadge',    label: 'Version / Period',     placeholder: 'e.g. v3.4 · May 2026' },
    { key: 'effectiveDate',   label: 'Effective Date',       placeholder: 'e.g. 1 June 2026' },
    { key: 'heroImage',       label: 'App Screenshot',       hint: 'Optional', type: 'image', aiPromptSuggestion: 'Clean mobile app screenshot mockup on a neutral background, fintech payment app UI' },
    { key: 'ctaUrl',          label: 'Button URL',           placeholder: 'https://hitpayapp.com',   type: 'url' },
    { key: 'ctaText',         label: 'Button Text',          placeholder: 'View Changes (default)' },
  ],
  'rate-changes': [
    { key: 'effectiveDate',   label: 'Effective Date',       placeholder: 'e.g. 1 July 2026',       required: true },
    { key: 'rateDescription', label: 'What\'s Changing',     placeholder: 'e.g. Transaction Fee Update' },
    { key: 'heroImage',       label: 'Header Image',         hint: 'Optional', type: 'image', aiPromptSuggestion: 'Abstract financial data visualization, clean blue gradient background, professional' },
    { key: 'ctaUrl',          label: 'Button URL',           placeholder: 'https://hitpayapp.com',   type: 'url' },
    { key: 'ctaText',         label: 'Button Text',          placeholder: 'View Details (default)' },
  ],
  'compliance': [
    { key: 'complianceType',  label: 'Notice Type',          placeholder: 'e.g. Privacy Policy Update' },
    { key: 'effectiveDate',   label: 'Effective Date',       placeholder: 'e.g. 1 June 2026' },
    { key: 'requiredAction',  label: 'Required Action',      placeholder: 'e.g. Review and accept by 31 May 2026', hint: 'Shown as a prominent callout' },
    { key: 'ctaUrl',          label: 'Button URL',           placeholder: 'https://hitpayapp.com',   type: 'url' },
    { key: 'ctaText',         label: 'Button Text',          placeholder: 'Read Update (default)' },
  ],
};

const BODY_PLACEHOLDERS: Record<string, string> = {
  'product-launch':
    `Write the main announcement here.\n\nYou can use:\n- Bullet points like this\n- **Bold text** for emphasis\n\nKeep it concise — 2–4 short paragraphs works best.`,
  'feature-update':
    `Describe what's new this month.\n\n- **Feature name** — what it does and why it matters\n- **Another feature** — short description\n\nAdd a closing line encouraging people to check it out.`,
  'newsletter':
    `## What's happening\n\nWrite your first section here.\n\n## More updates\n\nAdd as many sections as you need.`,
  'promotional':
    `Describe the offer here — what's included and why it's valuable.\n\nKeep it punchy — 1–2 short paragraphs is enough.\n\nRemind them the offer is time-limited.`,
  'event-invitation':
    `Tell them what the event is about and why they should attend.\n\nWhat will they learn? Who else is going?\n\nKeep it exciting and action-oriented.`,
  'partner-spotlight':
    `Tell the partner story here. Who are they, what do they do, why does this partnership matter?\n\nInclude any standout details — metrics, quotes, or what makes them special.`,
  'important-announcement':
    `Write the announcement clearly and concisely.\n\nWhat is changing? When does it take effect? What do readers need to do?\n\nKeep it direct — no fluff.`,
  'app-changes':
    `Describe what's changing in the app.\n\n- **Change one** — what it is and how it affects users\n- **Change two** — short description\n\nInclude any action users need to take.`,
  'rate-changes':
    `Explain the rate change here.\n\nWhat is changing, by how much, and why?\n\nInclude a table or bullet list if there are multiple changes:\n\n- **Current rate**: X%\n- **New rate**: Y%\n\nReassure users and point them to more information.`,
  'compliance':
    `Summarize what's changing and why.\n\nBe clear about:\n- What the change is\n- Why it's happening\n- What (if anything) the reader needs to do\n\nKeep legal language plain and readable.`,
};

function buildMarkdown(
  template: string,
  subject: string,
  previewText: string,
  fields: Record<string, string>,
  body: string
): string {
  const esc = (s: string) => s.replace(/"/g, '\\"');
  const lines: string[] = ['---'];
  lines.push(`template: ${template}`);
  lines.push(`subject: "${esc(subject)}"`);
  if (previewText.trim()) lines.push(`previewText: "${esc(previewText)}"`);

  for (const [key, value] of Object.entries(fields)) {
    if (!value?.trim()) continue;
    if (key === 'issueNumber') {
      const n = parseInt(value, 10);
      if (!isNaN(n)) lines.push(`issueNumber: ${n}`);
    } else {
      lines.push(`${key}: "${esc(value.trim())}"`);
    }
  }

  lines.push('---', '', body.trim());
  return lines.join('\n');
}

const STEP_LABELS = ['Choose template', 'Fill in details', 'Preview & save'];

const CATEGORIES = ['Marketing', 'Operational'];

export default function NewCampaignPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [template, setTemplate] = useState('');
  const [subject, setSubject] = useState('');
  const [previewText, setPreviewText] = useState('');
  const [fields, setFields] = useState<Record<string, string>>({});
  const [body, setBody] = useState('');
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewing, setPreviewing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function selectTemplate(id: string) {
    setTemplate(id);
    setFields({});
    setBody('');
    setPreviewHtml('');
    setError('');
    setStep(2);
  }

  function setField(key: string, value: string) {
    setFields(prev => ({ ...prev, [key]: value }));
  }

  function validateStep2(): string | null {
    if (!subject.trim()) return 'Subject line is required';
    const defs = TEMPLATE_FIELDS[template] ?? [];
    for (const def of defs) {
      if (def.required && !fields[def.key]?.trim()) return `${def.label} is required`;
    }
    if (!body.trim()) return 'Email body is required';
    return null;
  }

  async function handlePreview() {
    const err = validateStep2();
    if (err) { setError(err); return; }
    setError('');
    setPreviewing(true);
    try {
      const md = buildMarkdown(template, subject, previewText, fields, body);
      const res = await fetch('/api/campaigns/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markdown: md }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Preview failed');
      setPreviewHtml(data.html);
      setStep(3);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Preview failed');
    } finally {
      setPreviewing(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      const md = buildMarkdown(template, subject, previewText, fields, body);
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markdown: md }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Save failed');
      router.push(`/campaigns/${data.campaign.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
      setSaving(false);
    }
  }

  const tpl = TEMPLATES.find(t => t.id === template);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9F9F6' }}>
      {/* Nav */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3">
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">← Campaigns</Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-medium text-gray-900">New Campaign</span>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Step indicator */}
        <div className="flex items-center gap-1 mb-8">
          {STEP_LABELS.map((label, i) => {
            const n = i + 1;
            const done = step > n;
            const active = step === n;
            return (
              <div key={n} className="flex items-center gap-2">
                <button
                  onClick={() => { if (done) setStep(n); }}
                  disabled={!done}
                  className="flex items-center gap-1.5"
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                      done ? 'bg-green-100 text-green-700' : active ? 'text-white' : 'bg-gray-200 text-gray-400'
                    }`}
                    style={active ? { backgroundColor: '#2465DE' } : undefined}
                  >
                    {done ? '✓' : n}
                  </span>
                  <span className={`text-sm ${active ? 'font-semibold text-gray-900' : done ? 'text-gray-500 hover:text-gray-700 cursor-pointer' : 'text-gray-400'}`}>
                    {label}
                  </span>
                </button>
                {i < STEP_LABELS.length - 1 && <span className="text-gray-300 mx-1 text-xs">›</span>}
              </div>
            );
          })}
        </div>

        {/* ── Step 1: Template selection ── */}
        {step === 1 && (
          <div>
            <h1 className="text-xl font-semibold text-gray-900 mb-1">What type of email?</h1>
            <p className="text-sm text-gray-500 mb-6">Pick a template to get started.</p>
            {CATEGORIES.map(cat => (
              <div key={cat} className="mb-6">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{cat}</p>
                <div className="grid grid-cols-2 gap-3">
                  {TEMPLATES.filter(t => t.category === cat).map(t => (
                    <button
                      key={t.id}
                      onClick={() => selectTemplate(t.id)}
                      className="text-left p-4 rounded-xl bg-white border border-gray-200 hover:border-blue-400 hover:shadow-sm transition-all group"
                    >
                      <span className="text-2xl block mb-2">{t.emoji}</span>
                      <span className="font-semibold text-gray-900 text-sm block group-hover:text-blue-600">{t.label}</span>
                      <span className="text-xs text-gray-400 mt-0.5 block">{t.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Step 2: Fill in details ── */}
        {step === 2 && tpl && (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{tpl.emoji}</span>
              <h1 className="text-xl font-semibold text-gray-900">{tpl.label}</h1>
            </div>
            <p className="text-sm text-gray-500 mb-6">Fill in the details for your email.</p>

            {error && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-5">
              {/* Subject + preview text */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email header</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject line <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="e.g. Important update about your account"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preview text <span className="text-gray-400 font-normal text-xs">(shows in inbox under subject)</span>
                  </label>
                  <input
                    type="text"
                    value={previewText}
                    onChange={e => setPreviewText(e.target.value)}
                    placeholder="e.g. Please read this important notice."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Template-specific fields */}
              {(TEMPLATE_FIELDS[template]?.length ?? 0) > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-5">
                  <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Template details</h2>
                  {TEMPLATE_FIELDS[template].map(f => (
                    <div key={f.key}>
                      {f.type === 'image' ? (
                        <ImagePicker
                          value={fields[f.key] ?? ''}
                          onChange={url => setField(f.key, url)}
                          label={f.label}
                          required={f.required}
                          hint={f.hint}
                          aiPromptSuggestion={f.aiPromptSuggestion}
                        />
                      ) : (
                        <>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {f.label}
                            {f.required && <span className="text-red-500 ml-1">*</span>}
                            {f.hint && <span className="text-gray-400 font-normal text-xs ml-1">— {f.hint}</span>}
                          </label>
                          <input
                            type={f.type === 'url' ? 'url' : f.type === 'number' ? 'number' : 'text'}
                            value={fields[f.key] ?? ''}
                            onChange={e => setField(f.key, e.target.value)}
                            placeholder={f.placeholder}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                          />
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Body */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Email body <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs text-gray-400">Use - for bullets, **text** for bold, ## for headings</span>
                </div>
                <textarea
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  placeholder={BODY_PLACEHOLDERS[template] ?? 'Write your email content here…'}
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 resize-y font-mono"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <button onClick={() => setStep(1)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">
                ← Back
              </button>
              <button
                onClick={handlePreview}
                disabled={previewing}
                className="px-6 py-2.5 rounded-lg text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
                style={{ backgroundColor: '#2465DE' }}
              >
                {previewing ? 'Rendering…' : 'Preview Email →'}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Preview & save ── */}
        {step === 3 && (
          <div>
            <h1 className="text-xl font-semibold text-gray-900 mb-1">Looks good?</h1>
            <p className="text-sm text-gray-500 mb-4">Review your email below, then save it to your campaigns.</p>

            {error && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm mb-6 bg-white" style={{ height: '560px' }}>
              <iframe
                srcDoc={previewHtml}
                className="w-full h-full border-0"
                title="Email preview"
              />
            </div>

            <div className="flex items-center justify-between">
              <button onClick={() => setStep(2)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">
                ← Edit details
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={async () => {
                    setPreviewing(true);
                    setError('');
                    try {
                      const md = buildMarkdown(template, subject, previewText, fields, body);
                      const res = await fetch('/api/campaigns/preview', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ markdown: md }),
                      });
                      const data = await res.json();
                      if (!res.ok) throw new Error(data.error ?? 'Refresh failed');
                      setPreviewHtml(data.html);
                    } catch (e) {
                      setError(e instanceof Error ? e.message : 'Refresh failed');
                    } finally {
                      setPreviewing(false);
                    }
                  }}
                  disabled={previewing}
                  className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  {previewing ? 'Refreshing…' : 'Refresh preview'}
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2.5 rounded-lg text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
                  style={{ backgroundColor: '#2465DE' }}
                >
                  {saving ? 'Saving…' : 'Save Campaign'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
