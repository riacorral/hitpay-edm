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

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: `You are editing an existing HitPay email campaign. Apply the requested changes to the email markdown document.

Rules:
- Return ONLY the updated markdown document with YAML frontmatter — no explanation, no preamble, no code fences
- Keep all unchanged sections exactly as they are
- Preserve all valid URLs and required frontmatter fields
- The frontmatter template field must remain one of: product-launch, feature-update, newsletter, promotional, event-invitation, partner-spotlight, important-announcement, app-changes, rate-changes, compliance
- All ctaUrl values must be valid https:// URLs`,
    messages: [
      {
        role: 'user',
        content: `Current email:\n\n${currentMarkdown}\n\nInstruction: ${instruction}`,
      },
    ],
  });

  const markdown = (message.content[0] as { type: string; text: string }).text.trim();

  try {
    const parsed = parseEdm(markdown);
    const html = await renderEdm(parsed);
    return NextResponse.json({ markdown, html });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Render failed';
    return NextResponse.json({ error: msg, markdown }, { status: 422 });
  }
}
