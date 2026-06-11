// src/app/permohonan/revisi/page.tsx
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { PermohonanService } from '@/services/permohonan.service';
import { DeletePermohonanButton } from '@/components/shared/delete-permohonan-button';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Edit3, ArrowLeft, ArrowRight, Eye, AlertCircle } from 'lucide-react';
import { ApplicationStatus } from '@prisma/client';

export const metadata = {
  title: 'Revisi Berkas - Architax PBB',
};

function formatNop(nop: string): string {
  const nums = nop.replace(/[^0-9]/g, '');
  if (nums.length !== 18) return nop;
  return `${nums.substring(0, 2)}.${nums.substring(2, 4)}.${nums.substring(4, 7)}.${nums.substring(7, 10)}.${nums.substring(10, 13)}-${nums.substring(13, 17)}.${nums.substring(17, 18)}`;
}

interface PageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function RevisiPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  // Only STAF_PENGINPUT has access to their own revision list
  if (session.user.role !== 'STAF_PENGINPUT') {
    redirect('/forbidden');
  }

  const { page } = await searchParams;
  const currentPage = parseInt(page || '1', 10);
  const limit = 10;

  const result = await PermohonanService.findFiltered({
    createdById: session.user.id,
    status: ApplicationStatus.REVISION,
    page: currentPage,
    limit,
  });

  const items = result.success && result.data ? result.data.items : [];
  const total = result.success && result.data ? result.data.total : 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 shadow-sm flex items-start gap-4">
        <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 flex-shrink-0">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-amber-800">
            Daftar Berkas Perlu Revisi
          </h1>
          <p className="text-xs text-amber-700 mt-1 max-w-2xl leading-relaxed">
            Halaman ini menampilkan seluruh berkas permohonan Anda yang dikembalikan oleh Staf Peneliti.
            Silakan perbaiki data berkas tersebut sesuai dengan catatan revisi agar dapat divalidasi ulang.
          </p>
        </div>
      </div>

      {/* Table Card (Desktop) */}
      <div className="hidden md:block bg-white border border-[#DDDDDD] rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-[#F7F7F7]">
            <TableRow className="border-b border-[#DDDDDD] hover:bg-[#F7F7F7]">
              <TableHead className="font-bold text-[#222222] w-[140px]">No. Berkas</TableHead>
              <TableHead className="font-bold text-[#222222]">Jenis Layanan</TableHead>
              <TableHead className="font-bold text-[#222222] w-[200px]">NOP</TableHead>
              <TableHead className="font-bold text-[#222222]">Pemilik Asal</TableHead>
              <TableHead className="font-bold text-[#222222] w-[140px]">Status</TableHead>
              <TableHead className="font-bold text-[#222222] w-[140px]">Tanggal Input</TableHead>
              <TableHead className="font-bold text-[#222222] text-right w-[120px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-[#717171] font-semibold">
                  Hebat! Tidak ada berkas yang perlu direvisi saat ini.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id} className="border-b border-[#DDDDDD] hover:bg-[#F7F7F7]/50">
                  <TableCell className="font-bold text-[#222222]">{item.nomorBerkas}</TableCell>
                  <TableCell className="font-semibold text-xs text-[#222222]">
                    {item.serviceType.replace(/_/g, ' ')}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-[#222222]">
                    {formatNop(item.nop)}
                  </TableCell>
                  <TableCell className="text-[#222222] font-semibold">
                    {item.oldOwnerName || '-'}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full border border-amber-200 bg-amber-50 text-amber-700 uppercase tracking-wide">
                      REVISION
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-[#717171]">
                    {new Date(item.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/permohonan/${item.id}/edit`}
                        className="text-[#F59E0B] hover:text-[#F59E0B] hover:bg-[#F59E0B]/10 rounded-lg p-2 h-9 w-9 inline-flex items-center justify-center transition-colors"
                        title="Perbaiki Berkas"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Link>
                      <DeletePermohonanButton id={item.id} nomorBerkas={item.nomorBerkas} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Card List (Mobile) */}
      <div className="md:hidden space-y-4">
        {items.length === 0 ? (
          <div className="bg-white border border-[#DDDDDD] rounded-xl p-8 text-center text-[#717171] font-semibold">
            Hebat! Tidak ada berkas yang perlu direvisi saat ini.
          </div>
        ) : (
          items.map((item) => (
            <div 
              key={item.id}
              className="bg-white border border-[#DDDDDD] rounded-xl p-4 shadow-sm flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="overflow-hidden">
                  <p className="font-bold text-[#222222] text-sm truncate">{item.nomorBerkas}</p>
                  <p className="text-[10px] text-[#717171] mt-0.5">
                    NOP: <span className="font-mono">{formatNop(item.nop)}</span>
                  </p>
                </div>
                <span className="inline-flex items-center text-[9px] font-bold px-2.5 py-0.5 rounded-full border border-amber-200 bg-amber-50 text-amber-700 uppercase tracking-wider flex-shrink-0">
                  REVISION
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 border-t border-[#F7F7F7] pt-2 text-xs">
                <div>
                  <p className="text-[#717171] font-semibold text-[10px]">Jenis Layanan</p>
                  <p className="font-semibold text-[#222222] mt-0.5 text-[11px] truncate">
                    {item.serviceType.replace(/_/g, ' ')}
                  </p>
                </div>
                <div>
                  <p className="text-[#717171] font-semibold text-[10px]">Pemilik Asal</p>
                  <p className="font-bold text-[#222222] mt-0.5 truncate">{item.oldOwnerName || '-'}</p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-[#F7F7F7] pt-2 text-xs">
                <span className="text-[#717171] text-[10px]">
                  {new Date(item.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
                <div className="flex items-center gap-1.5">
                  <Link
                    href={`/permohonan/${item.id}/edit`}
                    className="text-[#F59E0B] hover:text-[#F59E0B] hover:bg-[#F59E0B]/10 border border-[#DDDDDD] rounded-lg p-2 h-9 w-9 inline-flex items-center justify-center transition-colors"
                    title="Perbaiki Berkas"
                  >
                    <Edit3 className="h-4 w-4" />
                  </Link>
                  <DeletePermohonanButton id={item.id} nomorBerkas={item.nomorBerkas} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Server Side Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border border-[#DDDDDD] bg-white rounded-xl shadow-sm">
          <p className="text-xs text-[#717171] font-semibold">
            Menampilkan {items.length} dari {total} permohonan
          </p>
          <div className="flex items-center gap-2">
            <Link
              href={`/permohonan/revisi?page=${currentPage - 1}`}
              className={`border border-[#DDDDDD] rounded-lg h-9 px-3 font-semibold text-xs flex items-center gap-1 text-[#222222] transition-colors ${
                currentPage <= 1 ? 'pointer-events-none opacity-50' : 'hover:bg-[#F7F7F7]'
              }`}
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Sebelumnya
            </Link>
            <span className="text-xs font-bold text-[#222222]">
              {currentPage} / {totalPages}
            </span>
            <Link
              href={`/permohonan/revisi?page=${currentPage + 1}`}
              className={`border border-[#DDDDDD] rounded-lg h-9 px-3 font-semibold text-xs flex items-center gap-1 text-[#222222] transition-colors ${
                currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'hover:bg-[#F7F7F7]'
              }`}
            >
              Selanjutnya <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
