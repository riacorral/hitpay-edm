import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/get-user';
import { createAdminClient } from '@/lib/supabase';
import { parseEdm } from '@/src/parser/markdown';
import { renderEdm } from '@/src/renderer/engine';
import { generateMjml } from '@/src/renderer/mjml';

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createAdminClient();
  const { data: campaigns, error } = await supabase
    .from('campaigns')
    .select('id, markdown')
    .not('markdown', 'is', null);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let updated = 0;
  const errors: string[] = [];

  for (const c of campaigns ?? []) {
    try {
      const parsed = parseEdm(c.markdown as string);
      const [html, mjml] = await Promise.all([
        renderEdm(parsed),
        Promise.resolve(generateMjml(parsed)),
      ]);
      await supabase
        .from('campaigns')
        .update({ html_content: html, mjml_content: mjml })
        .eq('id', c.id);
      updated++;
    } catch (err) {
      errors.push(`${c.id}: ${err instanceof Error ? err.message : 'failed'}`);
    }
  }

  return NextResponse.json({ updated, errors });
}
