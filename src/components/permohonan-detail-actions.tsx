// src/components/permohonan-detail-actions.tsx
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { requestRevisionAction, rejectPermohonanAction } from '@/actions/permohonan.actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Loader2, Edit3, XOctagon } from 'lucide-react';
import { ApplicationStatus } from '@prisma/client';

interface PermohonanDetailActionsProps {
  id: string;
  nomorBerkas: string;
  bundleId: string | null;
  status: ApplicationStatus;
}

export function PermohonanDetailActions({ id, nomorBerkas, bundleId, status }: PermohonanDetailActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  const isBundled = !!bundleId;
  const isSubmitted = status === ApplicationStatus.SUBMITTED;
  const isDisabled = isBundled || !isSubmitted || isPending;

  const handleRevision = () => {
    const note = prompt(`Masukkan catatan revisi / alasan perbaikan untuk berkas ${nomorBerkas}:`);
    if (note === null) return; // cancelled
    if (note.trim() === '') {
      alert('Catatan revisi wajib diisi agar staf penginput tahu bagian mana yang harus diperbaiki.');
      return;
    }

    startTransition(async () => {
      try {
        const result = await requestRevisionAction(id, note.trim());
        if (result.success) {
          toast.success(`Berkas ${nomorBerkas} dikembalikan untuk revisi`);
          router.refresh();
        } else {
          toast.error(result.error || 'Gagal mengajukan revisi');
        }
      } catch (error: any) {
        toast.error(error.message || 'Terjadi kesalahan');
      }
    });
  };

  const handleReject = () => {
    if (confirm(`Apakah Anda yakin ingin REJECT berkas ${nomorBerkas}?`)) {
      startTransition(async () => {
        try {
          const result = await rejectPermohonanAction(id);
          if (result.success) {
            toast.success(`Berkas ${nomorBerkas} berhasil direject`);
            router.refresh();
          } else {
            toast.error(result.error || 'Gagal mereject berkas');
          }
        } catch (error: any) {
          toast.error(error.message || 'Terjadi kesalahan');
        }
      });
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        onClick={handleRevision}
        disabled={isDisabled}
        className="bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg h-10 px-4 flex items-center gap-1.5 text-sm transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
        title={isBundled ? "Kunci: Berkas terikat bundle" : "Minta Revisi"}
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Edit3 className="h-4 w-4" />}
        Minta Revisi
      </Button>
      <Button
        onClick={handleReject}
        disabled={isDisabled}
        className="bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg h-10 px-4 flex items-center gap-1.5 text-sm transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
        title={isBundled ? "Kunci: Berkas terikat bundle" : "Tolak Berkas"}
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <XOctagon className="h-4 w-4" />}
        Tolak Berkas
      </Button>
      {isBundled && (
        <span className="text-xs text-rose-500 font-semibold bg-rose-50 border border-rose-100 rounded-md px-2.5 py-1">
          🔒 Tombol aksi terkunci karena berkas sudah masuk bundle.
        </span>
      )}
    </div>
  );
}
