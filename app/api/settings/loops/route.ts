import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/get-user';
import { createAdminClient } from '@/lib/supabase';
import { encrypt, decrypt } from '@/lib/encryption';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createAdminClient();
  const { data } = await supabase
    .from('loops_credentials')
    .select('loops_api_key_enc, loops_session_enc')
    .eq('user_id', user.id)
    .single();

  if (!data) {
    return NextResponse.json({ hasApiKey: false, hasSessionToken: false });
  }

  const maskedApiKey = data.loops_api_key_enc
    ? '••••••••' + decrypt(data.loops_api_key_enc).slice(-4)
    : null;

  return NextResponse.json({
    hasApiKey: !!data.loops_api_key_enc,
    hasSessionToken: !!data.loops_session_enc,
    maskedApiKey,
  });
}

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { loopsApiKey, loopsSessionToken } = await req.json();

  const supabase = createAdminClient();
  const update: Record<string, string> = {};

  if (loopsApiKey) update.loops_api_key_enc = encrypt(loopsApiKey as string);
  if (loopsSessionToken) update.loops_session_enc = encrypt(loopsSessionToken as string);

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  }

  const { error } = await supabase
    .from('loops_credentials')
    .upsert({ user_id: user.id, ...update }, { onConflict: 'user_id' });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
