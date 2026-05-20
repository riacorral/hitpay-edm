import OpenAI from 'openai';
import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'AI image generation is not configured (missing OPENAI_API_KEY)' }, { status: 503 });
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const { prompt } = await req.json() as { prompt?: string };
  if (!prompt?.trim()) {
    return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
  }

  // Prepend brand context to every prompt
  const enhancedPrompt = `Professional marketing photo for a fintech payments company in Singapore. ${prompt.trim()} Clean, modern, corporate aesthetic. No text, no logos, no watermarks.`;

  const image = await openai.images.generate({
    model: 'dall-e-3',
    prompt: enhancedPrompt,
    n: 1,
    size: '1792x1024',
    quality: 'standard',
  });

  const imageUrl = image.data[0]?.url;
  if (!imageUrl) return NextResponse.json({ error: 'No image returned' }, { status: 500 });

  // Download from OpenAI (URL expires in ~1 hour) and store permanently in Vercel Blob
  const fetched = await fetch(imageUrl);
  const blob = await fetched.blob();
  const stored = await put(`edm-ai/${Date.now()}.png`, blob, { access: 'public' });

  return NextResponse.json({ url: stored.url });
}
