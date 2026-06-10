// src/app/audit/layout.tsx
import * as React from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppLayout } from '@/components/app-layout';
import { UserRole } from '@prisma/client';

export default async function AuditLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return (
    <AppLayout userName={session.user.name ?? 'Pengguna'} userRole={session.user.role as UserRole}>
      {children}
    </AppLayout>
  );
}
