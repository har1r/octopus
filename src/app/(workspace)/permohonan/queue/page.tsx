// src/app/permohonan/queue/page.tsx
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { PermohonanService } from '@/services/permohonan.service';
import { ValidationQueue } from '@/components/tables/validation-queue';
import { ApplicationStatus } from '@prisma/client';

export const metadata = {
  title: 'Antrean Validasi - Architax PBB',
};

export default async function QueuePage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // Enforce STAF_PENELITI access control
  if (session.user.role !== 'STAF_PENELITI') {
    redirect('/forbidden');
  }

  // Fetch all SUBMITTED permohonan files
  const result = await PermohonanService.findFiltered({
    status: ApplicationStatus.SUBMITTED,
    limit: 100, // retrieve up to 100 queue items at once
  });

  const items = result.success && result.data ? result.data.items : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#222222]">Antrean Validasi Permohonan</h1>
        <p className="text-xs text-[#717171]">
          Periksa data masukan, minta revisi, reject berkas, atau kelompokkan berkas ke dalam bundle.
        </p>
      </div>

      <ValidationQueue initialItems={items} />
    </div>
  );
}
