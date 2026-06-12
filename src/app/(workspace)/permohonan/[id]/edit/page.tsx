// src/app/permohonan/[id]/edit/page.tsx
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { PermohonanService } from '@/services/permohonan.service';
import { PermohonanForm } from '@/components/forms/permohonan-form';
import { ApplicationStatus } from '@prisma/client';

export const metadata = {
  title: 'Edit Permohonan - Architax PBB',
};

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

import { AlertTriangle } from 'lucide-react';

export default async function EditPermohonanPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const { id } = await params;
  const result = await PermohonanService.findById(id);

  if (!result.success || !result.data) {
    redirect('/permohonan');
  }

  const permohonan = result.data;

  // Enforce access control: only STAF_PENGINPUT can edit, and only their own records
  if (session.user.role !== 'STAF_PENGINPUT' || permohonan.createdById !== session.user.id) {
    redirect('/forbidden');
  }

  // Only permit editing SUBMITTED or REVISION records
  if (permohonan.status !== ApplicationStatus.SUBMITTED && permohonan.status !== ApplicationStatus.REVISION) {
    redirect('/permohonan');
  }

  // Convert decimal properties to standard numbers if they exist
  const formattedPermohonan = {
    ...permohonan,
    oldLandArea: permohonan.oldLandArea ? Number(permohonan.oldLandArea) : null,
    oldBuildingArea: permohonan.oldBuildingArea ? Number(permohonan.oldBuildingArea) : null,
    details: permohonan.details.map(d => ({
      ...d,
      newLandArea: Number(d.newLandArea),
      newBuildingArea: Number(d.newBuildingArea),
    })),
  };

  return (
    <div className="container mx-auto px-4 pb-8 space-y-6">
      {permohonan.status === ApplicationStatus.REVISION && permohonan.revisionNote && (
        <div className="bg-amber-50 border-l-4 border-amber-500 rounded-r-xl p-5 shadow-sm flex items-start gap-4">
          <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 flex-shrink-0">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-amber-800">
              Catatan Revisi dari Staf Peneliti
            </h3>
            <p className="text-xs text-amber-700 mt-1 italic font-medium bg-white/50 border border-amber-200/50 p-2.5 rounded-lg">
              "{permohonan.revisionNote}"
            </p>
            <p className="text-[10px] text-amber-600 mt-2 font-semibold">
              * Perbaiki data sesuai instruksi di atas, lalu kirim kembali berkas untuk proses validasi ulang.
            </p>
          </div>
        </div>
      )}
      <PermohonanForm initialData={formattedPermohonan as any} />
    </div>
  );
}
