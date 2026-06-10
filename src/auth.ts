// src/auth.ts
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { AuthService } from '@/services/auth.service';

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials) return null;
        const { username, password } = credentials;
        if (typeof username !== 'string' || typeof password !== 'string') {
          return null;
        }

        const result = await AuthService.validateUser(username, password);
        if (result.success && result.data) {
          const user = result.data;
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            username: user.username,
            role: user.role,
          };
        }
        return null;
      },
    }),
  ],
});
