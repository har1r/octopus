// src/app/manifest/shipping/page.tsx
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { ManifestService } from '@/services/manifest.service';
import { BundleRepository } from '@/repositories/bundle.repository';
import { BundleStatus } from '@prisma/client';
import { ShippingKanban } from '@/components/kanban/shipping-kanban';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Kanban Manifest - Architax PBB',
};

interface PageProps {
  searchParams: Promise<{
    id?: string;
  }>;
}

export default async function ManifestShippingPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  // Enforce STAF_PENGIRIM or SUPERVISOR role
  const allowed = ['STAF_PENGIRIM', 'SUPERVISOR'];
  if (!allowed.includes(session.user.role)) {
    redirect('/forbidden');
  }

  const { id } = await searchParams;
  if (!id) {
    redirect('/manifest');
  }

  const result = await ManifestService.findById(id);
  if (!result.success || !result.data) {
    redirect('/manifest');
  }

  const manifest = result.data;

  // Retrieve bundles currently associated with this manifest
  let manifestBundles: any[] = [];
  if (manifest.bundleIds.length > 0) {
    const bundlesResult = await BundleRepository.findManyByIds(manifest.bundleIds);
    manifestBundles = bundlesResult;
  }

  // Retrieve eligible available bundles (READY_TO_SHIP status, not yet in any manifest)
  const availableBundlesResult = await BundleRepository.findFiltered({
    status: BundleStatus.READY_TO_SHIP,
    limit: 50,
  });
  const availableBundles = availableBundlesResult.items.filter(
    b => !manifest.bundleIds.includes(b.id)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/manifest"
          className="border border-[#DDDDDD] hover:bg-[#F7F7F7] text-[#222222] h-10 w-10 p-0 rounded-lg flex items-center justify-center transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#222222]">Board Pengiriman Manifest</h1>
          <p className="text-xs text-[#717171]">
            Seret bundle ke manifest untuk dikirim, unggah tanda tangan, dan selesaikan pengiriman
          </p>
        </div>
      </div>

      <ShippingKanban
        manifest={manifest}
        manifestBundles={manifestBundles}
        availableBundles={availableBundles as any}
      />
    </div>
  );
}
