import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

const SYSTEM_PROMPT = `You edit copy for HitPay merchant proposals. HitPay is a Singapore-HQ, MAS-licensed payments platform for SMEs across Southeast Asia (Philippines, Singapore, Malaysia and more).

Voice: clear, confident, benefit-led. Not hype-y. Address the merchant plainly.

HARD RULES:
- Do NOT invent or change fees, payout timings, or payment-method availability. Keep claims accurate.
- Do NOT use em-dashes. Use commas, colons or parentheses instead.
- Never use these words: seamlessly, unlock, revolutionise, revolutionize, game-changer, cutting-edge, empower.
- Preserve any template tokens EXACTLY if they appear: {merchantName}, {tapToPay}, {recurringVia}. Do not delete or rename them.
- Keep the number of value-prop points the same unless the instruction explicitly asks to add or remove.

Return ONLY valid JSON, no markdown, no code fences, no commentary. Exact shape:
{"headline": "string", "summary": "string", "props": ["string", "string", ...]}`;

export async function POST(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'AI not configured (missing ANTHROPIC_API_KEY)' }, { status: 503 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const headline = typeof body.headline === 'string' ? body.headline : '';
  const summary = typeof body.summary === 'string' ? body.summary : '';
  const props: string[] = Array.isArray(body.props) ? body.props.filter((p: unknown) => typeof p === 'string') : [];
  const instruction = typeof body.instruction === 'string' ? body.instruction.slice(0, 1000) : '';
  const market = typeof body.market === 'string' ? body.market : '';
  const vertical = typeof body.vertical === 'string' ? body.vertical : '';

  if (!instruction.trim()) {
    return NextResponse.json({ error: 'Missing instruction' }, { status: 400 });
  }

  const userMsg = `Market: ${market || 'unspecified'}. Vertical: ${vertical || 'unspecified'}.

Current copy (JSON):
${JSON.stringify({ headline, summary, props }, null, 2)}

Instruction: ${instruction}

Return the edited copy as JSON only.`;

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1600,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMsg }],
    });

    const text = message.content
      .map((b) => (b.type === 'text' ? b.text : ''))
      .join('')
      .trim();

    const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

    let parsed: any;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: 'AI returned an unexpected format' }, { status: 502 });
    }

    return NextResponse.json({
      headline: typeof parsed.headline === 'string' ? parsed.headline : headline,
      summary: typeof parsed.summary === 'string' ? parsed.summary : summary,
      props: Array.isArray(parsed.props) && parsed.props.length
        ? parsed.props.filter((p: unknown) => typeof p === 'string')
        : props,
    });
  } catch (err) {
    console.error('proposals/refine error', err);
    return NextResponse.json({ error: 'AI request failed' }, { status: 500 });
  }
}
