import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/get-user';
import { createAdminClient } from '@/lib/supabase';
import { campaignSlug } from '@/src/campaign/slug';

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const supabase = createAdminClient();

  const { data: original, error: fetchError } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !original) {
    return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
  }

  // Generate a unique slug with a timestamp suffix to avoid conflicts
  const baseSlug = campaignSlug(original.subject);
  const slug = `${baseSlug}-${Date.now().toString(36)}`;

  const { data, error } = await supabase
    .from('campaigns')
    .insert({
      user_id: user.id,
      slug,
      title: original.title,
      subject: original.subject,
      preview_text: original.preview_text,
      template: original.template,
      markdown: original.markdown,
      html_content: original.html_content,
      mjml_content: original.mjml_content,
      status: 'draft',
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ campaign: data }, { status: 201 });
}
