// src/app/arsip/[id]/page.tsx
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { BundleService } from '@/services/bundle.service';
import { ArchivingWorkspace } from '@/components/forms/archiving-workspace';
import { BundleStatus } from '@prisma/client';

export const metadata = {
  title: 'Workspace Arsip - Architax PBB',
};

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ArchivingWorkspacePage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  // Enforce STAF_PENGARSIP or SUPERVISOR role
  const allowed = ['STAF_PENGARSIP', 'SUPERVISOR'];
  if (!allowed.includes(session.user.role)) {
    redirect('/forbidden');
  }

  const { id } = await params;
  const result = await BundleService.findById(id);

  if (!result.success || !result.data) {
    redirect('/arsip');
  }

  const bundle = result.data;

  // Verify bundle status
  if (bundle.status !== BundleStatus.READY_TO_ARCHIVE) {
    redirect('/arsip');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#222222]">Workspace Pengarsipan Berkas</h1>
        <p className="text-xs text-[#717171]">
          Kelola scan dokumen per berkas permohonan dalam bundle
        </p>
      </div>

      <ArchivingWorkspace bundle={bundle as any} userRole={session.user.role} />
    </div>
  );
}
