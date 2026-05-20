import NextAuth, { type NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async signIn({ profile }) {
      const email = profile?.email ?? '';
      if (!email.endsWith('@hit-pay.com')) {
        return false;
      }
      const supabase = getSupabaseAdmin();
      await supabase.from('users').upsert(
        {
          email,
          name: profile?.name ?? null,
          google_sub: profile?.sub,
          avatar_url: (profile as Record<string, unknown>)?.picture as string ?? null,
        },
        { onConflict: 'google_sub' }
      );
      return true;
    },
    async jwt({ token, profile }) {
      if (profile?.sub) {
        token.googleSub = profile.sub;
        token.email = profile.email;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.googleSub = token.googleSub as string;
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

declare module 'next-auth' {
  interface Session {
    user: {
      googleSub: string;
    } & Session['user'];
  }
}
