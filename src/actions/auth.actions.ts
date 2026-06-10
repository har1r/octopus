// src/actions/auth.actions.ts
'use server';

import { signIn, signOut } from '@/auth';
import { loginSchema } from '@/validators/auth.validator';
import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';

export async function loginAction(values: unknown) {
  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { username, password } = parsed.data;

  try {
    await signIn('credentials', {
      username,
      password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { success: false, error: 'Username atau password salah' };
        default:
          return { success: false, error: 'Gagal masuk: ' + error.message };
      }
    }
    return { success: false, error: 'Terjadi kesalahan sistem' };
  }

  redirect('/dashboard');
}

export async function logoutAction() {
  await signOut({ redirectTo: '/login' });
}
