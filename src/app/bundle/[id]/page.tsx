// src/app/bundle/[id]/page.tsx
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { BundleService } from '@/services/bundle.service';
import { PermohonanRepository } from '@/repositories/permohonan.repository';
import { BundleWorkspace } from '@/components/forms/bundle-workspace';
import { ApplicationStatus } from '@prisma/client';

export const metadata = {
  title: 'Workspace Bundle - Architax PBB',
};

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function BundleDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const { id } = await params;
  const result = await BundleService.findById(id);

  if (!result.success || !result.data) {
    redirect('/bundle');
  }

  const bundle = result.data;

  // Retrieve eligible submitted permohonan files of the SAME service type that can be added to this bundle
  let availableItems: any[] = [];
  const allowedEditRoles = ['STAF_PENELITI'];
  
  if (allowedEditRoles.includes(session.user.role)) {
    const queueResult = await PermohonanRepository.findFiltered({
      status: ApplicationStatus.SUBMITTED,
      serviceType: bundle.serviceType,
      limit: 50,
    });
    availableItems = queueResult.items;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#222222]">Workspace Detail Bundle</h1>
        <p className="text-xs text-[#717171]">
          Kelola isi berkas permohonan, cetak surat pengantar, dan finalisasi berkas bundle
        </p>
      </div>

      <BundleWorkspace 
        bundle={bundle as any} 
        availableItems={availableItems} 
        userRole={session.user.role} 
      />
    </div>
  );
}
