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

  // Enforce access control
  if (session.user.role === 'STAF_PENGINPUT' && permohonan.createdById !== session.user.id) {
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
    <div className="container mx-auto">
      <PermohonanForm initialData={formattedPermohonan as any} />
    </div>
  );
}
