import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { parseEdm } from '@/src/parser/markdown';
import { generateMjml } from '@/src/renderer/mjml';
import mjml2html from 'mjml';

const SYSTEM_PROMPT = `You are an expert email copywriter for HitPay, a fintech payment solutions company based in Singapore.

CRITICAL FORMATTING RULE: Your response must begin with exactly three dashes on the first line (---) followed immediately by the YAML frontmatter. Do not include any text, explanation, or code fences before or after the document. The very first characters of your response must be: ---

THE MOST IMPORTANT RULE: The FIRST field inside the frontmatter MUST be "template:" — without it the email cannot render. ALWAYS include it.

EXACT REQUIRED FORMAT:
---
template: partner-spotlight
subject: Example subject line
previewText: Preview text shown in email clients
market: sg
partnerName: Partner Name
ctaUrl: https://hitpayapp.com
ctaText: Learn More
---

## Heading

Body paragraph here.

- bullet one
- bullet two

AVAILABLE TEMPLATES (pick the most appropriate):

product-launch — announcing a new product
  productName: "string" (required)
  ctaUrl: "https://..." (required)
  ctaText: "string" (optional)
  heroImage: "https://..." (optional)

feature-update — new features or improvements
  versionBadge: "string" (optional, e.g. "May 2026")
  ctaUrl: "https://..." (optional)
  ctaText: "string" (optional)

newsletter — regular digest or roundup
  title: "string" (optional)
  subtitle: "string" (optional)
  issueNumber: number (optional, no quotes)
  date: "string" (optional)

promotional — discount or offer
  ctaUrl: "https://..." (required)
  promoCode: "string" (optional)
  discountText: "string" (optional)
  expiryDate: "string" (optional)
  ctaText: "string" (optional)

event-invitation — event or webinar
  eventName: "string" (optional)
  eventDate: "string" (optional)
  eventTime: "string" (optional)
  eventLocation: "string" (optional)
  primaryCtaText: "string" (optional)
  primaryCtaUrl: "https://..." (optional)
  ctaUrl: "https://..." (required)
  ctaText: "string" (optional)

partner-spotlight — featuring a partner
  partnerName: "string" (required)
  ctaUrl: "https://..." (required)
  partnerLogo: "https://..." (optional)
  ctaText: "string" (optional)

important-announcement — urgent notice
  badgeText: "string" (optional)
  ctaUrl: "https://..." (optional)
  ctaText: "string" (optional)
  heroImage: "https://..." (optional)

app-changes — platform or app update
  versionBadge: "string" (optional)
  effectiveDate: "string" (optional)
  ctaUrl: "https://..." (optional)
  ctaText: "string" (optional)
  heroImage: "https://..." (optional)

rate-changes — fee or pricing update
  effectiveDate: "string" (required)
  rateDescription: "string" (optional)
  ctaUrl: "https://..." (optional)
  ctaText: "string" (optional)
  heroImage: "https://..." (optional)

compliance — regulatory or policy update
  complianceType: "string" (optional)
  effectiveDate: "string" (optional)
  requiredAction: "string" (optional)
  ctaUrl: "https://..." (optional)
  ctaText: "string" (optional)

RULES:
- All URLs must start with https://. Use https://hitpayapp.com as fallback.
- Refer to HitPay's business customers as "merchant partners".
- Tone: professional, warm, confident.
- Do NOT use merge tags like {{first_name}} or {firstName} — write plain copy.
- If images are provided, use the first as heroImage (if template supports it).
- CTA URLs: every ctaUrl and every [text](url){.cta} link that points to a webpage (http/https) MUST carry UTM parameters appended as a query string: ?utm_source=email&utm_medium=email&utm_campaign=<kebab-case-campaign-slug>&utm_content=<position>-<kebab-case-cta-slug> — utm_content is 1-indexed by the CTA's order in the email (e.g. utm_content=1-read-the-docs, then utm_content=2-talk-to-us for the next one). Skip UTM params on mailto: or tel: links.
- Subject lines: use Title Case. Front-load the first 3-5 words with the strongest hook (biggest benefit, pain point solved, or genuine curiosity) — never spend the opening words on the brand name or filler like "Introducing"/"Announcing"/"Newsletter". Keep under ~60 characters. Prefer benefit/outcome language over feature names (e.g. "Skip API Keys" over "OAuth Apps"). Clarity over cleverness — never clickbait. Example: "Meet Bukku - HitPay's New Accounting Integration" not "Meet Bukku - HitPay's new accounting integration".
- Preview text: complement the subject, don't repeat it — add context or a supporting benefit. ~40-90 characters. No generic filler ("View in browser") and no trailing punctuation.
- YAML values that contain a colon must ALWAYS be wrapped in double quotes. Example: subject: "Exclusive Offer: Save on Card Payments" — never write subject: Exclusive Offer: Save on Card Payments (unquoted).
- Write complete polished copy, no placeholders.
- NEVER include raw HTML tags (no <div>, <span>, <table>, etc.) in the markdown body. Only use the markdown syntax shown above.
- For stat/metric grids (e.g. 4 numbers side by side), use the :::columns block syntax:
  :::columns
  ::column 🛒 **900M**
  People use ChatGPT every week looking for things to buy
  ::column 📈 **42%**
  Higher conversion from AI-referred shoppers
  :::
  Each ::column line has: optional emoji, then the stat in **bold**. Description follows on the next line(s). Close the block with :::.
- Always include market: sg/my/ph/global in frontmatter. Use the target market specified in the user message.

MARKET FIELD VALUES: sg (Singapore), my (Malaysia), ph (Philippines), global (all others)`;

// Quote any YAML frontmatter values that contain ": " (colon + space), which would
// otherwise break the js-yaml parser used by gray-matter. Skips URLs and already-quoted values.
function sanitizeFrontmatterColons(markdown: string): string {
  const fmMatch = markdown.match(/^(---\n)([\s\S]*?)(\n---)/);
  if (!fmMatch) return markdown;
  const [full, open, body, close] = fmMatch;
  const after = markdown.slice(full.length);
  const sanitized = body.replace(
    /^([a-zA-Z][a-zA-Z0-9]*:\s*)(.+)$/gm,
    (line, keyPart, valuePart) => {
      const v = valuePart.trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) return line;
      if (/^https?:\/\//.test(v)) return line;
      if (v.includes(': ') || v.endsWith(':')) {
        return `${keyPart}"${v.replace(/"/g, '\\"')}"`;
      }
      return line;
    },
  );
  return open + sanitized + close + after;
}

function cleanOutput(raw: string): string {
  // Strip code fences if present (```markdown ... ``` or ``` ... ```)
  const fenceMatch = raw.match(/^```[^\n]*\n([\s\S]*?)\n?```\s*$/);
  const text = fenceMatch ? fenceMatch[1].trim() : raw.trim();

  // Strip any preamble before the first --- line (model sometimes adds intro text)
  const cleaned = text.startsWith('---') ? text : (() => {
    const fmIdx = text.search(/^---$/m);
    return fmIdx !== -1 ? text.slice(fmIdx).trim() : text;
  })();

  return sanitizeFrontmatterColons(cleaned);
}

// Templates that support a heroImage frontmatter field
const HERO_IMAGE_TEMPLATES = new Set([
  'product-launch', 'important-announcement', 'app-changes', 'rate-changes', 'compliance',
]);

// Inject the first provided image into the markdown if Claude didn't include it.
// Prefers heroImage frontmatter for templates that support it; falls back to an inline image.
function injectImagesIfMissing(markdown: string, images: string[]): string {
  if (!images.length) return markdown;
  const firstImage = images[0];

  // If the URL is already present anywhere in the markdown, nothing to do
  if (markdown.includes(firstImage)) return markdown;

  const fmMatch = markdown.match(/^(---\n)([\s\S]*?)(\n---)([\s\S]*)$/);
  if (!fmMatch) return markdown;
  const [, open, body, close, rest] = fmMatch;

  const templateMatch = body.match(/^template:\s*(.+)$/m);
  const template = templateMatch?.[1]?.trim() ?? '';

  if (HERO_IMAGE_TEMPLATES.has(template) && !body.includes('heroImage:')) {
    // Inject as heroImage in frontmatter
    const newBody = body.trimEnd() + `\nheroImage: ${firstImage}`;
    return open + newBody + close + rest;
  } else {
    // Inject as inline image at the top of the body content
    return open + body + close + `\n\n![](${firstImage})` + rest;
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'AI generation not configured (missing ANTHROPIC_API_KEY)' }, { status: 503 });
  }

  const { prompt, images, market } = await req.json() as { prompt?: string; images?: string[]; market?: string };
  if (!prompt?.trim()) return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const marketNote = market && market !== 'sg'
    ? `\n\nTarget market: ${market.toUpperCase()} — include market: ${market} in the frontmatter.`
    : '\n\nTarget market: SG — include market: sg in the frontmatter.';

  const userMessage = [
    prompt.trim(),
    images?.length ? `Images to include: ${images.join(', ')}` : '',
    marketNote,
  ].filter(Boolean).join('\n\n');

  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    });

    const raw = (message.content[0] as { type: string; text: string }).text;
    const markdown = injectImagesIfMissing(cleanOutput(raw), images ?? []);

    if (!markdown.startsWith('---')) {
      return NextResponse.json({
        error: 'Generation produced an unexpected format. Please try again.',
      }, { status: 422 });
    }

    const parsed = parseEdm(markdown);
    const { html } = mjml2html(generateMjml(parsed), { validationLevel: 'skip' });
    return NextResponse.json({ markdown, html });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Generation failed';
    return NextResponse.json({ error: msg }, { status: 422 });
  }
}
