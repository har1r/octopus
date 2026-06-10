// src/auth.config.ts
import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isLogin = nextUrl.pathname === '/login';

      const isProtected = 
        nextUrl.pathname.startsWith('/dashboard') || 
        nextUrl.pathname.startsWith('/permohonan') ||
        nextUrl.pathname.startsWith('/bundle') ||
        nextUrl.pathname.startsWith('/arsip') ||
        nextUrl.pathname.startsWith('/manifest') ||
        nextUrl.pathname.startsWith('/monitoring') ||
        nextUrl.pathname.startsWith('/analytics') ||
        nextUrl.pathname.startsWith('/audit');

      if (isProtected) {
        if (isLoggedIn) return true;
        return false; // Redirect to login
      }

      if (isLogin && isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id ?? '';
        token.role = (user as any).role;
        token.username = (user as any).username;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as any;
        session.user.username = token.username as string;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
