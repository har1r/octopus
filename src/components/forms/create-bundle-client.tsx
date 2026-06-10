// src/components/forms/create-bundle-client.tsx
'use client';

import * as React from 'react';
import { createBundleAction } from '@/actions/bundle.actions';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Loader2, Package, ArrowLeft } from 'lucide-react';

interface CreateBundleClientProps {
  ids: string[];
  itemsCount: number;
  hasErrors: boolean;
}

export function CreateBundleClient({ ids, itemsCount, hasErrors }: CreateBundleClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  const handleCreate = () => {
    if (hasErrors) return;

    startTransition(async () => {
      try {
        const result = await createBundleAction(ids);
        if (result.success && result.data) {
          toast.success(`Bundle ${result.data.bundleNumber} berhasil dibuat`);
          router.push(`/bundle/${result.data.id}`);
          router.refresh();
        } else {
          toast.error(result.error || 'Gagal membuat bundle');
        }
      } catch (error: any) {
        toast.error(error.message || 'Terjadi kesalahan sistem');
      }
    });
  };

  return (
    <div className="flex items-center gap-3">
      <Button
        type="button"
        variant="outline"
        onClick={() => router.back()}
        disabled={isPending}
        className="border-[#DDDDDD] hover:bg-[#F7F7F7] h-11 px-6 rounded-lg font-semibold"
      >
        Kembali
      </Button>
      <Button
        onClick={handleCreate}
        disabled={isPending || hasErrors}
        className="bg-[#FF385C] hover:bg-[#E31C5F] text-white h-11 px-8 rounded-lg font-semibold shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Memproses...
          </>
        ) : (
          <>
            <Package className="h-5 w-5" />
            Konfirmasi & Buat Bundle ({itemsCount} Berkas)
          </>
        )}
      </Button>
    </div>
  );
}
