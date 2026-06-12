// src/app/permohonan/new/page.tsx
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { PermohonanForm } from '@/components/forms/permohonan-form';

export const metadata = {
  title: 'Buat Permohonan Baru - Architax PBB',
};

export default async function NewPermohonanPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const allowedRoles = ['STAF_PENGINPUT'];
  if (!allowedRoles.includes(session.user.role)) {
    redirect('/forbidden');
  }

  return (
    <div className="container mx-auto">
      <PermohonanForm />
    </div>
  );
}
