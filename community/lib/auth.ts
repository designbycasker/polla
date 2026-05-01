import NextAuth from 'next-auth';
import Kakao from 'next-auth/providers/kakao';
import { getSupabaseAdmin } from './supabase';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Kakao({
      clientId: process.env.KAKAO_CLIENT_ID!,
      clientSecret: process.env.KAKAO_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'kakao' && user.id && user.email) {
        const { error } = await getSupabaseAdmin()
          .from('users')
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .upsert({
            id: user.id,
            email: user.email,
            name: user.name ?? null,
            avatar_url: user.image ?? null,
            provider: 'kakao',
          } as any, { onConflict: 'id' });
        if (error) console.error('upsert user error:', error);
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) token.sub = user.id;
      return token;
    },
  },
  pages: {
    signIn: '/login',
  },
});
