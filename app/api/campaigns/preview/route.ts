import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/get-user';
import { parseEdm } from '@/src/parser/markdown';
import { renderEdm } from '@/src/renderer/engine';

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { markdown } = await req.json();
  if (!markdown) return NextResponse.json({ error: 'markdown is required' }, { status: 400 });

  try {
    const parsed = parseEdm(markdown as string);
    const html = await renderEdm(parsed);
    return NextResponse.json({ html });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Render failed';
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
