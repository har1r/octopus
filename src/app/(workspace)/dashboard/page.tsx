// src/app/dashboard/page.tsx
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { PermohonanService } from '@/services/permohonan.service';
import { ClayDashboardClient } from '@/components/clay-dashboard-client';

export const metadata = {
  title: 'Home - Architax',
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const user = session.user;
  const createdById = user.role === 'STAF_PENGINPUT' ? user.id : undefined;

  // Retrieve latest 5 entries from DB
  const result = await PermohonanService.findFiltered({
    createdById,
    page: 1,
    limit: 5,
  });

  const dbItems = result.success && result.data ? result.data.items : [];

  return (
    <ClayDashboardClient
      initialUserName={user.name ?? 'Mufti'}
      userRole={user.role}
      dbItems={dbItems}
    />
  );
}
