import { auth } from '@/lib/auth';
import { createAdminClient, type User } from '@/lib/supabase';

/**
 * Returns the current user's DB record from Supabase using the NextAuth JWT session.
 * Returns null if unauthenticated.
 */
export async function getCurrentUser(): Promise<User | null> {
  const session = await auth();
  if (!session?.user?.googleSub) return null;

  const supabase = createAdminClient();
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('google_sub', session.user.googleSub)
    .single();

  return (data as User) ?? null;
}
