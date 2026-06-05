import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { parseEdm } from '@/src/parser/markdown';
import { renderEdm } from '@/src/renderer/engine';

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
- Preserve ALL frontmatter fields exactly, including long URLs with UTM parameters.
- The frontmatter template field must remain one of: product-launch, feature-update, newsletter, promotional, event-invitation, partner-spotlight, important-announcement, app-changes, rate-changes, compliance
- All ctaUrl values must be valid https:// URLs
- Do NOT use merge tags like {{first_name}} — use plain copy
- YAML values containing a colon MUST be wrapped in double quotes, e.g. subject: "Exclusive Offer: Save on Card Payments"
- To set a hero banner image, add heroImage to the frontmatter on the SAME LINE as the key: heroImage: https://image-url. NEVER put the URL on the next line. All these templates support heroImage: product-launch, feature-update, newsletter, important-announcement, app-changes, rate-changes, partner-spotlight, event-invitation.
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
          content: `Current email:\n\n${currentMarkdown}\n\nInstruction: ${instruction}`,
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

    const parsed = parseEdm(markdown);
    const html = await renderEdm(parsed);
    return NextResponse.json({ markdown, html });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Refinement failed';
    return NextResponse.json({ error: msg }, { status: 422 });
  }
}
