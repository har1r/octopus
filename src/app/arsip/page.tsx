// src/app/arsip/page.tsx
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { BundleService } from '@/services/bundle.service';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { ArrowLeft, ArrowRight, Calendar } from 'lucide-react';
import { BundleStatus } from '@prisma/client';

export const metadata = {
  title: 'Pengarsipan Berkas - Architax PBB',
};

interface PageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function ArchivingLandingPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  // Enforce STAF_PENGARSIP or SUPERVISOR role
  const allowed = ['STAF_PENGARSIP', 'SUPERVISOR'];
  if (!allowed.includes(session.user.role)) {
    redirect('/forbidden');
  }

  const { page } = await searchParams;
  const currentPage = parseInt(page || '1', 10);
  const limit = 10;

  // Retrieve only READY_TO_ARCHIVE status bundles
  const result = await BundleService.findFiltered({
    status: BundleStatus.READY_TO_ARCHIVE,
    page: currentPage,
    limit,
  });

  const items = result.success && result.data ? result.data.items : [];
  const total = result.success && result.data ? result.data.total : 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-display tracking-tight">Antrean Pengarsipan Bundle</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Daftar bundle berkas yang telah difinalisasi peneliti dan siap untuk diunggah scan arsipnya
          </p>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm shadow-slate-100/50 overflow-hidden overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50/50 border-b border-slate-100">
            <TableRow className="border-b border-slate-100 hover:bg-slate-50/50">
              <TableHead className="font-bold text-slate-500 text-[10px] uppercase tracking-wider w-[160px] py-3">No. Bundle</TableHead>
              <TableHead className="font-bold text-slate-500 text-[10px] uppercase tracking-wider py-3">Jenis Pelayanan</TableHead>
              <TableHead className="font-bold text-slate-500 text-[10px] uppercase tracking-wider w-[140px] py-3">Jumlah Berkas</TableHead>
              <TableHead className="font-bold text-slate-500 text-[10px] uppercase tracking-wider w-[160px] py-3">Status Bundle</TableHead>
              <TableHead className="font-bold text-slate-500 text-[10px] uppercase tracking-wider w-[180px] py-3">
                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Tanggal Finalisasi</span>
              </TableHead>
              <TableHead className="font-bold text-slate-500 text-[10px] uppercase tracking-wider text-right w-[150px] py-3">Mulai Arsip</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-slate-400 font-bold text-sm">
                  Tidak ada bundle berkas dalam antrean pengarsipan saat ini.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id} className="border-b border-slate-100 hover:bg-slate-50/30 transition-colors duration-150">
                  <TableCell className="font-bold text-slate-900 font-display">{item.bundleNumber}</TableCell>
                  <TableCell className="font-bold text-xs text-slate-800">
                    {item.serviceType.replace(/_/g, ' ')}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-extrabold text-[#FF385C] bg-[#FF385C]/5 px-2.5 py-1 rounded-full border border-[#FF385C]/10 select-none">
                      {item.itemCount} Berkas
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border border-blue-100 bg-blue-50/70 text-blue-700 uppercase tracking-wider select-none">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                      READY TO ARCHIVE
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-slate-500 font-semibold">
                    {new Date(item.updatedAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/arsip/${item.id}`}
                      className="bg-gradient-to-r from-[#FF385C] to-[#E31C5F] hover:from-[#E31C5F] hover:to-[#C1113C] text-white text-xs font-bold rounded-xl h-9 px-4 shadow-md shadow-[#FF385C]/10 active:scale-[0.97] transition-all duration-150 cursor-pointer inline-flex items-center gap-1"
                    >
                      Mulai Arsip <ArrowRight className="h-4 w-4" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Server Side Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-slate-100 bg-white">
            <p className="text-xs text-slate-500 font-bold select-none">
              Menampilkan {items.length} dari {total} bundle
            </p>
            <div className="flex items-center gap-3">
              <Link
                href={currentPage <= 1 ? '#' : `/arsip?page=${currentPage - 1}`}
                className={`border border-slate-200 hover:bg-slate-50 hover:text-slate-900 rounded-xl h-9 px-4 font-bold text-xs flex items-center gap-1.5 text-slate-700 transition-all duration-150 active:scale-95 cursor-pointer shadow-sm ${
                  currentPage <= 1 ? 'pointer-events-none opacity-50 bg-slate-50/20' : ''
                }`}
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Sebelumnya
              </Link>
              <span className="text-xs font-extrabold text-slate-800 font-display select-none">
                {currentPage} / {totalPages}
              </span>
              <Link
                href={currentPage >= totalPages ? '#' : `/arsip?page=${currentPage + 1}`}
                className={`border border-slate-200 hover:bg-slate-50 hover:text-slate-900 rounded-xl h-9 px-4 font-bold text-xs flex items-center gap-1.5 text-slate-700 transition-all duration-150 active:scale-95 cursor-pointer shadow-sm ${
                  currentPage >= totalPages ? 'pointer-events-none opacity-50 bg-slate-50/20' : ''
                }`}
              >
                Selanjutnya <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
