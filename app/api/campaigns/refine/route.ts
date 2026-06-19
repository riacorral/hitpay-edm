import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { parseEdm } from '@/src/parser/markdown';
import { generateMjml } from '@/src/renderer/mjml';
import mjml2html from 'mjml';

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'AI not configured' }, { status: 503 });
  }

  const { currentMarkdown, instruction } = await req.json() as {
    currentMarkdown?: string;
    instruction?: string;
  };

  if (!currentMarkdown?.trim()) return NextResponse.json({ error: 'currentMarkdown is required' }, { status: 400 });
  if (!instruction?.trim()) return NextResponse.json({ error: 'instruction is required' }, { status: 400 });

  // Strip base64 images before sending to Claude to avoid massive token usage.
  // Replace each unique data URL with a short placeholder and restore afterward.
  const base64Map = new Map<string, string>();
  let base64Counter = 0;
  const markdownForAi = currentMarkdown.replace(
    /data:image\/[a-zA-Z]+;base64,[A-Za-z0-9+\/=]+/g,
    (match) => {
      if (!base64Map.has(match)) {
        base64Map.set(match, `__BASE64_IMAGE_${++base64Counter}__`);
      }
      return base64Map.get(match)!;
    },
  );

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: `You are editing an existing HitPay email campaign. Apply the requested changes.

CRITICAL: Your response must begin with exactly --- on the first line (the YAML frontmatter). No explanation, no preamble, no code fences.

Rules:
- Output the COMPLETE email from --- to the last line. Never truncate or omit sections.
- Keep all unchanged sections exactly as they are — including images, image URLs, :::columns blocks, ::: image-left blocks, and any other special syntax.
- Inline images are represented as __BASE64_IMAGE_N__ placeholders. Preserve every placeholder exactly — never modify, remove, or duplicate them.
- Preserve ALL frontmatter fields exactly, including long URLs with UTM parameters.
- The frontmatter template field must remain one of: product-launch, feature-update, newsletter, promotional, event-invitation, partner-spotlight, important-announcement, app-changes, rate-changes, compliance
- All ctaUrl values must be valid https:// URLs
- Do NOT use merge tags like {{first_name}} — use plain copy
- YAML values containing a colon MUST be wrapped in double quotes, e.g. subject: "Exclusive Offer: Save on Card Payments"
- To set a hero banner image, add heroImage to the frontmatter on the SAME LINE as the key: heroImage: https://image-url. NEVER put the URL on the next line. All these templates support heroImage: product-launch, feature-update, newsletter, important-announcement, app-changes, rate-changes, partner-spotlight, event-invitation.
- When converting an inline image (![](url) in the body) into a hero banner: ADD heroImage: url to the frontmatter AND REMOVE the ![](url) line from the body — do NOT keep both.
- NEVER use raw HTML tags. For stat grids use :::columns blocks:
  :::columns
  ::column 🛒 **900M**
  Description text here
  ::column 📈 **42%**
  Another description
  :::`,
      messages: [
        {
          role: 'user',
          content: `Current email:\n\n${markdownForAi}\n\nInstruction: ${instruction}`,
        },
      ],
    });

    const raw = (message.content[0] as { type: string; text: string }).text;
    const fenceMatch = raw.match(/^```[^\n]*\n([\s\S]*?)\n?```\s*$/);
    const text = (fenceMatch ? fenceMatch[1] : raw).trim();
    const fmIdx = text.startsWith('---') ? 0 : text.search(/^---$/m);
    const cleaned = fmIdx > 0 ? text.slice(fmIdx).trim() : text;
    // Quote any YAML values containing ": " to prevent gray-matter parse errors
    const markdown = cleaned.replace(
      /^(---\n)([\s\S]*?)(\n---)/m,
      (_, open, body, close) => {
        const sanitized = body.replace(
          /^([a-zA-Z][a-zA-Z0-9]*:\s*)(.+)$/gm,
          (line: string, keyPart: string, valuePart: string) => {
            const v = valuePart.trim();
            if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) return line;
            if (/^https?:\/\//.test(v)) return line;
            if (v.includes(': ') || v.endsWith(':')) return `${keyPart}"${v.replace(/"/g, '\\"')}"`;
            return line;
          },
        );
        return open + sanitized + close;
      },
    );

    // Restore base64 images Claude was told to preserve as placeholders
    const inverseMap = new Map([...base64Map.entries()].map(([k, v]) => [v, k]));
    const restoredMarkdown = markdown.replace(/__BASE64_IMAGE_\d+__/g, (p) => inverseMap.get(p) ?? p);

    const parsed = parseEdm(restoredMarkdown);
    const { html } = mjml2html(generateMjml(parsed), { validationLevel: 'skip' });
    return NextResponse.json({ markdown: restoredMarkdown, html });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Refinement failed';
    return NextResponse.json({ error: msg }, { status: 422 });
  }
}
