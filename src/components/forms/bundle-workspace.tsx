// src/components/forms/bundle-workspace.tsx
'use client';

import * as React from 'react';
import { Bundle, Permohonan, BundleStatus, ApplicationStatus } from '@prisma/client';
import { 
  addItemToBundleAction, 
  removeItemFromBundleAction, 
  finalizeBundleAction,
  reExamineBundleAction
} from '@/actions/bundle.actions';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { 
  Loader2, 
  Package, 
  Plus, 
  MinusCircle, 
  FileText, 
  Calendar, 
  ShieldCheck, 
  Download, 
  ArrowLeftRight 
} from 'lucide-react';
import Link from 'next/link';

interface BundleWorkspaceProps {
  bundle: Bundle & { items: Permohonan[] };
  availableItems: Permohonan[];
  userRole: string;
}

function formatNop(nop: string): string {
  const nums = nop.replace(/[^0-9]/g, '');
  if (nums.length !== 18) return nop;
  return `${nums.substring(0, 2)}.${nums.substring(2, 4)}.${nums.substring(4, 7)}.${nums.substring(7, 10)}.${nums.substring(10, 13)}-${nums.substring(13, 17)}.${nums.substring(17, 18)}`;
}

export function BundleWorkspace({ bundle, availableItems, userRole }: BundleWorkspaceProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [selectedAddId, setSelectedAddId] = React.useState<string>('');

  const isPeneliti = userRole === 'STAF_PENELITI';
  const isPengarsip = userRole === 'STAF_PENGARSIP';
  
  const isEditable = isPeneliti && (bundle.status === BundleStatus.DRAFT_BUNDLE || bundle.status === BundleStatus.RE_EXAMINE);
  const canFinalize = isPeneliti && bundle.itemCount > 0 && (bundle.status === BundleStatus.DRAFT_BUNDLE || bundle.status === BundleStatus.RE_EXAMINE);
  const canReturn = (isPengarsip || isPeneliti) && bundle.status === BundleStatus.READY_TO_ARCHIVE;

  const handleAddItem = () => {
    if (!selectedAddId) return;

    startTransition(async () => {
      try {
        const result = await addItemToBundleAction(bundle.id, selectedAddId);
        if (result.success) {
          toast.success('Berkas berhasil ditambahkan ke bundle');
          setSelectedAddId('');
          router.refresh();
        } else {
          toast.error(result.error || 'Gagal menambahkan berkas');
        }
      } catch (error: any) {
        toast.error(error.message || 'Terjadi kesalahan');
      }
    });
  };

  const handleRemoveItem = (permohonanId: string, nomorBerkas: string) => {
    if (confirm(`Apakah Anda yakin ingin mengeluarkan berkas ${nomorBerkas} dari bundle ini?`)) {
      startTransition(async () => {
        try {
          const result = await removeItemFromBundleAction(bundle.id, permohonanId);
          if (result.success) {
            toast.success(`Berkas ${nomorBerkas} berhasil dikeluarkan dari bundle`);
            router.refresh();
          } else {
            toast.error(result.error || 'Gagal mengeluarkan berkas');
          }
        } catch (error: any) {
          toast.error(error.message || 'Terjadi kesalahan');
        }
      });
    }
  };

  const handleFinalize = () => {
    if (confirm('Apakah Anda yakin ingin memfinalisasi bundle ini? Status berkas akan diubah menjadi READY_TO_ARCHIVE.')) {
      startTransition(async () => {
        try {
          const result = await finalizeBundleAction(bundle.id);
          if (result.success) {
            toast.success('Bundle berhasil difinalisasi');
            router.refresh();
          } else {
            toast.error(result.error || 'Gagal memfinalisasi bundle');
          }
        } catch (error: any) {
          toast.error(error.message || 'Terjadi kesalahan');
        }
      });
    }
  };

  const handleReturnToExamine = () => {
    if (confirm('Apakah Anda yakin ingin mengembalikan bundle ini ke tahap Penelitian berkas (RE_EXAMINE)?')) {
      startTransition(async () => {
        try {
          const result = await reExamineBundleAction(bundle.id);
          if (result.success) {
            toast.success('Bundle berhasil dikembalikan ke penelitian');
            router.refresh();
          } else {
            toast.error(result.error || 'Gagal mengembalikan bundle');
          }
        } catch (error: any) {
          toast.error(error.message || 'Terjadi kesalahan');
        }
      });
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Header Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-[#DDDDDD] shadow-sm md:col-span-2">
          <CardHeader className="pb-3 border-b border-[#F7F7F7]">
            <CardTitle className="text-base font-bold flex items-center gap-2 text-[#222222]">
              <Package className="h-5 w-5 text-[#2563EB]" />
              Informasi Bundle
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-xs text-[#717171] font-semibold">Nomor Bundle</p>
              <p className="font-bold text-[#222222] mt-0.5">{bundle.bundleNumber}</p>
            </div>
            <div>
              <p className="text-xs text-[#717171] font-semibold">Jenis Pelayanan</p>
              <p className="font-bold text-[#222222] mt-0.5">{bundle.serviceType.replace(/_/g, ' ')}</p>
            </div>
            <div>
              <p className="text-xs text-[#717171] font-semibold">Jumlah Berkas</p>
              <p className="font-bold text-[#2563EB] mt-0.5">{bundle.itemCount} / 20 Berkas</p>
            </div>
            <div>
              <p className="text-xs text-[#717171] font-semibold flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-[#2563EB]" /> Dibuat Pada
              </p>
              <p className="font-semibold text-[#222222] mt-0.5">
                {new Date(bundle.createdAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#717171] font-semibold flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-[#2563EB]" /> Status Bundle
              </p>
              <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700 uppercase mt-0.5 tracking-wider">
                {bundle.status.replace(/_/g, ' ')}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Workspace Actions */}
        <Card className="border-[#DDDDDD] shadow-sm">
          <CardHeader className="pb-3 border-b border-[#F7F7F7]">
            <CardTitle className="text-base font-bold text-[#222222]">Tindakan Alur Kerja</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 flex flex-col gap-3 justify-center">
            {canFinalize && (
              <Button
                onClick={handleFinalize}
                disabled={isPending}
                className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold rounded-lg h-11 shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
                Finalisasi Bundle
              </Button>
            )}

            {canReturn && (
              <Button
                onClick={handleReturnToExamine}
                disabled={isPending}
                variant="outline"
                className="w-full border-[#EF4444] text-[#EF4444] hover:bg-[#EF4444]/5 hover:border-[#EF4444] font-semibold rounded-lg h-11 flex items-center justify-center gap-1.5"
              >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowLeftRight className="h-5 w-5" />}
                Kembalikan ke Penelitian
              </Button>
            )}

            {bundle.status === BundleStatus.READY_TO_ARCHIVE && (
              <Link
                href={bundle.coverLetterUrl || '#'}
                target="_blank"
                className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-semibold rounded-lg h-11 flex items-center justify-center gap-1.5 transition-colors text-sm"
              >
                <Download className="h-5 w-5" />
                Cetak Surat Pengantar (PDF)
              </Link>
            )}

            {!canFinalize && !canReturn && bundle.status !== BundleStatus.READY_TO_ARCHIVE && (
              <p className="text-xs text-[#717171] text-center font-medium py-4">
                Tidak ada tindakan lanjutan yang tersedia pada status ini.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 2. Add More Items Section (If Editable) */}
      {isEditable && bundle.itemCount < 20 && availableItems.length > 0 && (
        <Card className="border-[#DDDDDD] shadow-sm">
          <CardHeader className="pb-3 border-b border-[#F7F7F7]">
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <Plus className="h-4 w-4 text-[#2563EB]" /> Tambah Berkas ke Bundle
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1 space-y-1">
              <label className="text-xs font-semibold text-[#717171]">Pilih Berkas Antrean</label>
              <Select value={selectedAddId} onValueChange={(val) => setSelectedAddId(val || '')}>
                <SelectTrigger className="h-11 border-[#DDDDDD] rounded-lg">
                  <SelectValue placeholder="Pilih berkas dari antrean untuk dimasukkan..." />
                </SelectTrigger>
                <SelectContent>
                  {availableItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.nomorBerkas} - {item.oldOwnerName || 'Tanpa Nama'} (NOP: {formatNop(item.nop)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleAddItem}
              disabled={isPending || !selectedAddId}
              className="bg-[#10B981] hover:bg-[#059669] text-white font-semibold h-11 px-6 rounded-lg flex items-center gap-1.5 w-full sm:w-auto"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Tambahkan
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 3. Bundle Items Table (Desktop) */}
      <div className="hidden md:block bg-white border border-[#DDDDDD] rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#DDDDDD] bg-[#F7F7F7]">
          <h2 className="text-sm font-bold text-[#222222] flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-[#2563EB]" /> Daftar Berkas dalam Bundle
          </h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="border-b border-[#DDDDDD] hover:bg-transparent">
              <TableHead className="font-bold text-[#222222] w-[140px]">No. Berkas</TableHead>
              <TableHead className="font-bold text-[#222222]">NOP</TableHead>
              <TableHead className="font-bold text-[#222222]">Nama Pemilik Asal</TableHead>
              <TableHead className="font-bold text-[#222222]">Luas Objek Asal</TableHead>
              <TableHead className="font-bold text-[#222222] w-[140px]">Status Berkas</TableHead>
              {isEditable && <TableHead className="font-bold text-[#222222] text-right w-[100px]">Aksi</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {bundle.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isEditable ? 6 : 5} className="h-32 text-center text-[#717171] font-semibold">
                  Belum ada berkas di dalam bundle ini. Tambahkan berkas dari antrean di atas.
                </TableCell>
              </TableRow>
            ) : (
              bundle.items.map((item) => (
                <TableRow key={item.id} className="border-b border-[#DDDDDD] hover:bg-transparent">
                  <TableCell className="font-bold text-[#222222]">
                    <Link href={`/permohonan/${item.id}`} className="hover:underline text-[#2563EB]">
                      {item.nomorBerkas}
                    </Link>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-[#222222]">{formatNop(item.nop)}</TableCell>
                  <TableCell className="text-[#222222] font-semibold">{item.oldOwnerName || '-'}</TableCell>
                  <TableCell className="text-xs text-[#717171]">
                    T: {item.oldLandArea ? `${item.oldLandArea} m²` : '-'} | B: {item.oldBuildingArea ? `${item.oldBuildingArea} m²` : '-'}
                  </TableCell>
                  <TableCell>
                    <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700 uppercase tracking-wider">
                      {item.status.replace(/_/g, ' ')}
                    </span>
                  </TableCell>
                  {isEditable && (
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        onClick={() => handleRemoveItem(item.id, item.nomorBerkas)}
                        disabled={isPending}
                        className="text-[#EF4444] hover:text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg p-2 h-9 w-9"
                        title="Keluarkan dari Bundle"
                      >
                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MinusCircle className="h-4 w-4" />}
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Bundle Items Cards (Mobile) */}
      <div className="md:hidden space-y-4">
        <div className="bg-[#F7F7F7] border border-[#DDDDDD] rounded-xl px-6 py-4 shadow-sm flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#222222] flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-[#2563EB]" /> Daftar Berkas dalam Bundle
          </h2>
        </div>
        {bundle.items.length === 0 ? (
          <div className="bg-white border border-[#DDDDDD] rounded-xl p-8 text-center text-[#717171] font-semibold">
            Belum ada berkas di dalam bundle ini. Tambahkan berkas dari antrean di atas.
          </div>
        ) : (
          bundle.items.map((item) => (
            <div 
              key={item.id}
              className="bg-white border border-[#DDDDDD] rounded-xl p-4 shadow-sm flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-[#2563EB] text-sm">
                    <Link href={`/permohonan/${item.id}`} className="hover:underline">
                      {item.nomorBerkas}
                    </Link>
                  </p>
                  <p className="text-[10px] text-[#717171] mt-0.5">
                    NOP: <span className="font-mono">{formatNop(item.nop)}</span>
                  </p>
                </div>
                <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700 uppercase tracking-wider flex-shrink-0">
                  {item.status.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 border-t border-[#F7F7F7] pt-2 text-xs">
                <div>
                  <p className="text-[#717171] font-semibold text-[10px]">Pemilik Asal</p>
                  <p className="font-semibold text-[#222222] mt-0.5 truncate">
                    {item.oldOwnerName || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-[#717171] font-semibold text-[10px]">Luas Objek Asal</p>
                  <p className="text-[#717171] mt-0.5 text-[11px] truncate">
                    T: {item.oldLandArea ? `${item.oldLandArea} m²` : '-'} | B: {item.oldBuildingArea ? `${item.oldBuildingArea} m²` : '-'}
                  </p>
                </div>
              </div>

              {isEditable && (
                <div className="flex items-center justify-end border-t border-[#F7F7F7] pt-2">
                  <Button
                    variant="ghost"
                    onClick={() => handleRemoveItem(item.id, item.nomorBerkas)}
                    disabled={isPending}
                    className="text-[#EF4444] hover:text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg p-2 h-9 w-9 flex items-center justify-center transition-colors border border-transparent hover:border-[#EF4444]/20"
                    title="Keluarkan dari Bundle"
                  >
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MinusCircle className="h-4 w-4" />}
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
