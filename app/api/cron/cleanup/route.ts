export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

// Called daily by Vercel Cron — deletes Supabase campaign images that were
// bundled into a Loops ZIP 7+ days ago (Loops now hosts them permanently).
export async function GET(req: Request) {
  // Verify this is a Vercel Cron request
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();

  // Find campaigns with images due for cleanup
  const { data: campaigns, error } = await supabase
    .from('campaigns')
    .select('id, supabase_cleanup_paths')
    .not('supabase_cleanup_paths', 'is', null)
    .lt('supabase_cleanup_after', new Date().toISOString());

  if (error) {
    console.error('Cron cleanup query failed:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let deleted = 0;
  const errors: string[] = [];

  for (const campaign of campaigns ?? []) {
    const paths: string[] = Array.isArray(campaign.supabase_cleanup_paths)
      ? campaign.supabase_cleanup_paths
      : [];
    if (paths.length === 0) continue;

    const { error: delErr } = await supabase.storage
      .from('campaign-images')
      .remove(paths);

    if (delErr) {
      errors.push(`${campaign.id}: ${delErr.message}`);
      continue;
    }

    // Clear the cleanup fields
    await supabase
      .from('campaigns')
      .update({ supabase_cleanup_paths: null, supabase_cleanup_after: null })
      .eq('id', campaign.id);

    deleted += paths.length;
  }

  console.log(`Cron cleanup: deleted ${deleted} images, ${errors.length} errors`);
  return NextResponse.json({ deleted, errors });
}
