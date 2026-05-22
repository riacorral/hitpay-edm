export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/get-user';
import { createAdminClient } from '@/lib/supabase';
import { decrypt } from '@/lib/encryption';
import { createDraftCampaign, updateDraftCampaign } from '@/src/loops/client';

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const supabase = createAdminClient();

  // Fetch campaign (no user_id filter — any team member can upload)
  const { data: campaign, error: campErr } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .single();

  if (campErr || !campaign) {
    return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
  }

  if (!campaign.mjml_content) {
    return NextResponse.json({ error: 'Campaign has no MJML content' }, { status: 400 });
  }

  // Fetch Loops credentials
  const { data: creds } = await supabase
    .from('loops_credentials')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!creds?.loops_session_enc) {
    return NextResponse.json(
      { error: 'No Loops session token found. Please configure it in Settings.' },
      { status: 400 }
    );
  }

  const sessionToken = decrypt(creds.loops_session_enc);
  let refreshedToken: string | null = null;

  try {
    const result = campaign.loops_campaign_id
      ? await updateDraftCampaign(
          sessionToken,
          campaign.loops_campaign_id,
          campaign.subject,
          campaign.preview_text ?? '',
          campaign.mjml_content,
          true,
          (newToken) => { refreshedToken = newToken; }
        )
      : await createDraftCampaign(
          sessionToken,
          campaign.subject,
          campaign.preview_text ?? '',
          campaign.mjml_content,
          true,
          (newToken) => { refreshedToken = newToken; }
        );

    // Save refreshed session token if it changed
    if (refreshedToken && refreshedToken !== sessionToken) {
      const { encrypt } = await import('@/lib/encryption');
      await supabase
        .from('loops_credentials')
        .update({ loops_session_enc: encrypt(refreshedToken) })
        .eq('user_id', user.id);
    }

    // Fetch existing upload history
    const { data: existing } = await supabase
      .from('campaigns')
      .select('loops_uploads')
      .eq('id', id)
      .single();

    const prevUploads: { url: string; uploaded_at: string; uploaded_by: string }[] =
      Array.isArray(existing?.loops_uploads) ? existing.loops_uploads : [];

    const newEntry = {
      url: result.url,
      uploaded_at: new Date().toISOString(),
      uploaded_by: user.email,
    };

    // Update campaign with Loops info — latest URL always at top
    await supabase
      .from('campaigns')
      .update({
        loops_campaign_id: result.campaignId,
        loops_campaign_url: result.url,
        status: 'uploaded',
        loops_uploads: [newEntry, ...prevUploads],
      })
      .eq('id', id);

    return NextResponse.json({ url: result.url, campaignId: result.campaignId });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed';
    const isExpired = message.toLowerCase().includes('401') || message.toLowerCase().includes('403');
    return NextResponse.json(
      {
        error: isExpired
          ? 'Loops session token has expired. Please update it in Settings.'
          : message,
      },
      { status: isExpired ? 401 : 500 }
    );
  }
}
