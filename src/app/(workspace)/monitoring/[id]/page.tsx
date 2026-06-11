// src/app/monitoring/[id]/page.tsx
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { BundleService } from '@/services/bundle.service';
import { MonitoringWorkspace } from '@/components/forms/monitoring-workspace';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Monitoring Detail & Selesai - Architax PBB',
};

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function MonitoringDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  // Enforce STAF_PEMANTAU or SUPERVISOR role
  const allowed = ['STAF_PEMANTAU', 'SUPERVISOR'];
  if (!allowed.includes(session.user.role)) {
    redirect('/forbidden');
  }

  const { id } = await params;
  const result = await BundleService.findById(id);

  if (!result.success || !result.data) {
    redirect('/monitoring');
  }

  const bundle = result.data;

  return (
    <div className="space-y-6">
      {/* Breadcrumb + Header */}
      <div>
        <Link
          href="/monitoring"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#717171] hover:text-[#222222] transition-colors mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Kembali ke Daftar Monitoring
        </Link>
        <h1 className="text-2xl font-bold text-[#222222]">Proses & Monitoring Bundle</h1>
        <p className="text-xs text-[#717171] mt-1">
          Validasi alur penyelesaian berkas permohonan ke pusat dan selesaikan berkas bundle.
        </p>
      </div>

      <MonitoringWorkspace 
        bundle={bundle as any} 
        userRole={session.user.role} 
      />
    </div>
  );
}
