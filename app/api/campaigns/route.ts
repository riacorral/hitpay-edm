import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/get-user';
import { createAdminClient } from '@/lib/supabase';
import { parseEdm } from '@/src/parser/markdown';
import { renderEdm } from '@/src/renderer/engine';
import { generateMjml } from '@/src/renderer/mjml';
import { campaignSlug } from '@/src/campaign/slug';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('campaigns')
    .select('id, slug, title, subject, template, status, created_at, updated_at, loops_campaign_url')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ campaigns: data });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { markdown } = await req.json();
  if (!markdown) return NextResponse.json({ error: 'markdown is required' }, { status: 400 });

  try {
    const parsed = parseEdm(markdown as string);
    const [html, mjml] = await Promise.all([
      renderEdm(parsed),
      Promise.resolve(generateMjml(parsed)),
    ]);

    const slug = campaignSlug(parsed.frontmatter.subject);
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('campaigns')
      .insert({
        user_id: user.id,
        slug,
        title: parsed.frontmatter.subject,
        subject: parsed.frontmatter.subject,
        preview_text: parsed.frontmatter.previewText ?? null,
        template: parsed.frontmatter.template,
        markdown: markdown as string,
        html_content: html,
        mjml_content: mjml,
        status: 'draft',
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ campaign: data }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Render failed';
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
