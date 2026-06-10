// src/components/shared/delete-permohonan-button.tsx
'use client';

import * as React from 'react';
import { deletePermohonanAction } from '@/actions/permohonan.actions';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Trash2, Loader2 } from 'lucide-react';

interface DeletePermohonanButtonProps {
  id: string;
  nomorBerkas: string;
}

export function DeletePermohonanButton({ id, nomorBerkas }: DeletePermohonanButtonProps) {
  const [isPending, startTransition] = React.useTransition();

  const handleDelete = () => {
    if (confirm(`Apakah Anda yakin ingin menghapus berkas ${nomorBerkas}?`)) {
      startTransition(async () => {
        try {
          const result = await deletePermohonanAction(id);
          if (result.success) {
            toast.success(`Berkas ${nomorBerkas} berhasil dihapus`);
          } else {
            toast.error(result.error || 'Gagal menghapus berkas');
          }
        } catch (error: any) {
          toast.error(error.message || 'Terjadi kesalahan');
        }
      });
    }
  };

  return (
    <Button
      variant="ghost"
      onClick={handleDelete}
      disabled={isPending}
      className="text-[#EF4444] hover:text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg p-2 h-9 w-9"
      title="Hapus Draft"
    >
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  );
}
