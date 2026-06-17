import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/get-user';
import { createAdminClient } from '@/lib/supabase';
import { parseEdm } from '@/src/parser/markdown';
import { generateMjml } from '@/src/renderer/mjml';
import mjml2html from 'mjml';

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
  const { markdown, brief_images, name } = await req.json();

  const supabase = createAdminClient();

  // Name-only update (no markdown)
  if (name !== undefined && !markdown) {
    const { data, error } = await supabase
      .from('campaigns')
      .update({ title: name as string })
      .eq('id', id)
      .select()
      .single();
    if (error || !data) return NextResponse.json({ error: error?.message ?? 'Not found' }, { status: 404 });
    return NextResponse.json({ campaign: data });
  }

  if (!markdown) return NextResponse.json({ error: 'markdown is required' }, { status: 400 });

  try {
    const parsed = parseEdm(markdown as string);
    const mjml = generateMjml(parsed);
    const { html } = mjml2html(mjml, { validationLevel: 'skip' });

    const { data, error } = await supabase
      .from('campaigns')
      .update({
        markdown: markdown as string,
        subject: parsed.frontmatter.subject,
        preview_text: parsed.frontmatter.previewText ?? null,
        template: parsed.frontmatter.template,
        mjml_content: mjml,
        ...(Array.isArray(brief_images) && { brief_images }),
        last_updated_by: user.email,
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json({ error: error?.message ?? 'Campaign not found' }, { status: 404 });
    }
    return NextResponse.json({ campaign: data, html });
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
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
