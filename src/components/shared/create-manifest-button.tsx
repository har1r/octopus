// src/components/shared/create-manifest-button.tsx
'use client';

import * as React from 'react';
import { createManifestAction } from '@/actions/manifest.actions';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Loader2, Plus } from 'lucide-react';

export function CreateManifestButton() {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  const handleCreate = () => {
    startTransition(async () => {
      try {
        const result = await createManifestAction([]);
        if (result.success && result.data) {
          toast.success(`Manifest ${result.data.manifestNumber} berhasil dibuat`);
          router.push(`/manifest/shipping?id=${result.data.id}`);
          router.refresh();
        } else {
          toast.error(result.error || 'Gagal membuat manifest');
        }
      } catch (error: any) {
        toast.error(error.message || 'Terjadi kesalahan sistem');
      }
    });
  };

  return (
    <Button
      onClick={handleCreate}
      disabled={isPending}
      className="bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E40AF] text-white font-bold rounded-xl h-11 px-5 shadow-md shadow-[#2563EB]/15 flex items-center justify-center gap-1.5 transition-all duration-150 active:scale-[0.97] cursor-pointer"
    >
      {isPending ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          Membuat...
        </>
      ) : (
        <>
          <Plus className="h-5 w-5" /> Buat Manifest Baru
        </>
      )}
    </Button>
  );
}
