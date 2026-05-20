import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/get-user';
import { createAdminClient } from '@/lib/supabase';
import { parseEdm } from '@/src/parser/markdown';
import { renderEdm } from '@/src/renderer/engine';
import { generateMjml } from '@/src/renderer/mjml';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('campaigns')
    .select('*, users!user_id(name, email, avatar_url)')
    .eq('id', id)
    .single();

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ campaign: data });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { markdown } = await req.json();
  if (!markdown) return NextResponse.json({ error: 'markdown is required' }, { status: 400 });

  try {
    const parsed = parseEdm(markdown as string);
    const [html, mjml] = await Promise.all([
      renderEdm(parsed),
      Promise.resolve(generateMjml(parsed)),
    ]);

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('campaigns')
      .update({
        markdown: markdown as string,
        title: parsed.frontmatter.subject,
        subject: parsed.frontmatter.subject,
        preview_text: parsed.frontmatter.previewText ?? null,
        template: parsed.frontmatter.template,
        html_content: html,
        mjml_content: mjml,
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error || !data) return NextResponse.json({ error: 'Not found or update failed' }, { status: 404 });
    return NextResponse.json({ campaign: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Render failed';
    return NextResponse.json({ error: message }, { status: 422 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('campaigns')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
