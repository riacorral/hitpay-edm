import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/** Server-side admin client (uses service role key — never expose to browser) */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

/** Server-side client for Route Handlers and Server Components */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        },
      },
    }
  );
}

export type Campaign = {
  id: string;
  user_id: string;
  slug: string;
  title: string;
  subject: string;
  preview_text: string | null;
  template: string;
  markdown: string;
  html_content: string | null;
  mjml_content: string | null;
  loops_campaign_id: string | null;
  loops_campaign_url: string | null;
  status: 'draft' | 'uploaded';
  created_at: string;
  updated_at: string;
};

export type User = {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  google_sub: string;
  created_at: string;
  updated_at: string;
};

export type LoopsCredentials = {
  id: string;
  user_id: string;
  loops_api_key_enc: string | null;
  loops_session_enc: string | null;
  updated_at: string;
};
