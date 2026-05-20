import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { parseEdm } from '@/src/parser/markdown';
import { renderEdm } from '@/src/renderer/engine';

const SYSTEM_PROMPT = `You are an expert email copywriter for HitPay, a fintech payment solutions company based in Singapore.

CRITICAL FORMATTING RULE: Your response must begin with exactly three dashes on the first line (---) followed immediately by the YAML frontmatter. Do not include any text, explanation, or code fences before or after the document. The very first characters of your response must be: ---

THE MOST IMPORTANT RULE: The FIRST field inside the frontmatter MUST be "template:" — without it the email cannot render. ALWAYS include it.

EXACT REQUIRED FORMAT:
---
template: partner-spotlight
subject: Example subject line
previewText: Preview text shown in email clients
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
- Write complete polished copy, no placeholders.`;

function cleanOutput(raw: string): string {
  // Strip code fences if present (```markdown ... ``` or ``` ... ```)
  const fenceMatch = raw.match(/^```[^\n]*\n([\s\S]*?)\n?```\s*$/);
  if (fenceMatch) return fenceMatch[1].trim();
  return raw.trim();
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'AI generation not configured (missing ANTHROPIC_API_KEY)' }, { status: 503 });
  }

  const { prompt, images } = await req.json() as { prompt?: string; images?: string[] };
  if (!prompt?.trim()) return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const userMessage = images?.length
    ? `${prompt.trim()}\n\nImages to include: ${images.join(', ')}`
    : prompt.trim();

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    });

    const raw = (message.content[0] as { type: string; text: string }).text;
    const markdown = cleanOutput(raw);

    if (!markdown.startsWith('---')) {
      return NextResponse.json({
        error: 'Generation produced an unexpected format. Please try again.',
      }, { status: 422 });
    }

    const parsed = parseEdm(markdown);
    const html = await renderEdm(parsed);
    return NextResponse.json({ markdown, html });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Generation failed';
    return NextResponse.json({ error: msg }, { status: 422 });
  }
}
