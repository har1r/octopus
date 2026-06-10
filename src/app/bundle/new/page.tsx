// src/app/bundle/new/page.tsx
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { PermohonanRepository } from '@/repositories/permohonan.repository';
import { CreateBundleClient } from '@/components/forms/create-bundle-client';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { ApplicationStatus } from '@prisma/client';

export const metadata = {
  title: 'Buat Bundle Baru - Architax PBB',
};

function formatNop(nop: string): string {
  const nums = nop.replace(/[^0-9]/g, '');
  if (nums.length !== 18) return nop;
  return `${nums.substring(0, 2)}.${nums.substring(2, 4)}.${nums.substring(4, 7)}.${nums.substring(7, 10)}.${nums.substring(10, 13)}-${nums.substring(13, 17)}.${nums.substring(17, 18)}`;
}

interface PageProps {
  searchParams: Promise<{
    ids?: string | string[];
  }>;
}

export default async function NewBundlePage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  if (session.user.role !== 'STAF_PENELITI') {
    redirect('/forbidden');
  }

  const { ids: queryIds } = await searchParams;
  let ids: string[] = [];
  if (queryIds) {
    ids = Array.isArray(queryIds) ? queryIds : [queryIds];
  }

  if (ids.length === 0) {
    redirect('/permohonan/queue');
  }

  const items = await PermohonanRepository.findManyByIds(ids);

  // Validations
  let errorMessage = '';
  if (items.length !== ids.length) {
    errorMessage = 'Beberapa berkas permohonan tidak ditemukan.';
  } else if (items.length > 20) {
    errorMessage = 'Satu bundle maksimal berisi 20 berkas permohonan.';
  } else {
    // BR-001 validation
    const firstType = items[0]?.serviceType;
    const hasDifferentType = items.some(item => item.serviceType !== firstType);
    if (hasDifferentType) {
      errorMessage = 'BR-001: Semua berkas permohonan dalam satu bundle wajib memiliki jenis pelayanan yang sama.';
    }

    // Check status
    const invalidStatusItem = items.find(item => item.bundleId || item.status !== ApplicationStatus.SUBMITTED);
    if (invalidStatusItem) {
      errorMessage = `Berkas ${invalidStatusItem.nomorBerkas} tidak valid (sudah terikat bundle lain atau status bukan SUBMITTED).`;
    }
  }

  return (
    <div className="space-y-6 max-w-4xl pb-12 font-sans">
      <div>
        <h1 className="text-2xl font-bold text-[#222222]">Konfirmasi Bundling Berkas</h1>
        <p className="text-xs text-[#717171]">
          Kelompokkan berkas permohonan yang telah divalidasi ke dalam satu bundle dokumen resmi
        </p>
      </div>

      {errorMessage ? (
        <Card className="border-rose-200 bg-rose-50 text-rose-800">
          <CardContent className="pt-6 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0" />
            <div>
              <p className="font-bold text-sm">Validasi Bundling Gagal</p>
              <p className="text-xs text-rose-700 mt-1 leading-relaxed">{errorMessage}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-emerald-200 bg-emerald-50 text-emerald-800">
          <CardContent className="pt-6 flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="font-bold text-sm">Validasi Bundling Berhasil</p>
              <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                Seluruh {items.length} berkas yang dipilih memiliki jenis pelayanan yang sama (<strong>{items[0].serviceType.replace(/_/g, ' ')}</strong>) dan berstatus SUBMITTED.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Items List */}
      <div className="bg-white border border-[#DDDDDD] rounded-xl shadow-sm overflow-hidden overflow-x-auto">
        <div className="px-6 py-4 border-b border-[#DDDDDD] bg-[#F7F7F7]">
          <h2 className="text-sm font-bold text-[#222222] flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-[#FF385C]" /> Daftar Berkas Masuk Bundle
          </h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="border-b border-[#DDDDDD] hover:bg-transparent">
              <TableHead className="font-bold text-[#222222] w-[140px]">No. Berkas</TableHead>
              <TableHead className="font-bold text-[#222222]">Jenis Layanan</TableHead>
              <TableHead className="font-bold text-[#222222] w-[200px]">NOP</TableHead>
              <TableHead className="font-bold text-[#222222]">Pemilik Lama</TableHead>
              <TableHead className="font-bold text-[#222222] text-right">Luas Tanah asal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id} className="border-b border-[#DDDDDD] hover:bg-transparent">
                <TableCell className="font-bold text-[#222222]">{item.nomorBerkas}</TableCell>
                <TableCell className="text-xs font-semibold text-[#717171]">{item.serviceType.replace(/_/g, ' ')}</TableCell>
                <TableCell className="font-mono text-xs text-[#222222]">{formatNop(item.nop)}</TableCell>
                <TableCell className="text-[#222222] font-medium">{item.oldOwnerName || '-'}</TableCell>
                <TableCell className="text-right font-semibold text-[#222222]">{item.oldLandArea ? `${item.oldLandArea} m²` : '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Confirmation Actions */}
      <div className="flex items-center justify-end">
        <CreateBundleClient ids={ids} itemsCount={items.length} hasErrors={!!errorMessage} />
      </div>
    </div>
  );
}
