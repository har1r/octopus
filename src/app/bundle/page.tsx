// src/app/bundle/page.tsx
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
import { Eye, ArrowLeft, ArrowRight, Calendar } from 'lucide-react';
import { BundleStatus } from '@prisma/client';

export const metadata = {
  title: 'Daftar Bundle - Architax PBB',
};

// Renders a high-fidelity semantic status badge for bundle status
function renderStatusBadge(status: BundleStatus) {
  let bg = '';
  let dotColor = '';

  switch (status) {
    case 'COMPLETED':
    case 'READY_TO_SHIP':
    case 'SENT_TO_CENTER':
      bg = 'bg-emerald-50 text-emerald-700 border-emerald-100/80';
      dotColor = 'bg-emerald-500';
      break;
    case 'RE_EXAMINE':
      bg = 'bg-amber-50/70 text-amber-700 border-amber-100';
      dotColor = 'bg-amber-500';
      break;
    case 'DRAFT_BUNDLE':
    case 'READY_TO_ARCHIVE':
    default:
      bg = 'bg-blue-50/70 text-blue-700 border-blue-100';
      dotColor = 'bg-blue-500';
      break;
  }

  const isPulse = status === 'RE_EXAMINE' || status === 'DRAFT_BUNDLE';

  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${bg} select-none`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor} ${isPulse ? 'animate-pulse' : ''}`} />
      {status.replace(/_/g, ' ')}
    </span>
  );
}

interface PageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function BundleListPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  // Only allow relevant roles (Peneliti, Pengarsip, Pengirim, Pemantau, Supervisor)
  const allowedRoles = ['STAF_PENELITI', 'STAF_PENGARSIP', 'STAF_PENGIRIM', 'STAF_PEMANTAU', 'SUPERVISOR'];
  if (!allowedRoles.includes(session.user.role)) {
    redirect('/forbidden');
  }

  const { page } = await searchParams;
  const currentPage = parseInt(page || '1', 10);
  const limit = 10;

  const result = await BundleService.findFiltered({
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
          <h1 className="text-2xl font-extrabold text-slate-900 font-display tracking-tight">Daftar Bundle Berkas</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Kelola dan pantau seluruh berkas bundle yang sedang diproses dalam alur kerja
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
              <TableHead className="font-bold text-slate-500 text-[10px] uppercase tracking-wider w-[160px] py-3">
                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Tanggal Buat</span>
              </TableHead>
              <TableHead className="font-bold text-slate-500 text-[10px] uppercase tracking-wider text-right w-[100px] py-3">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-slate-400 font-bold text-sm">
                  Belum ada bundle berkas ditemukan. Buat bundle baru dari menu Antrean Validasi.
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
                    {renderStatusBadge(item.status)}
                  </TableCell>
                  <TableCell className="text-xs text-slate-500 font-semibold">
                    {new Date(item.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/bundle/${item.id}`}
                      className="text-slate-400 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 rounded-xl p-2 h-9 w-9 inline-flex items-center justify-center transition-all duration-150 active:scale-90 cursor-pointer shadow-sm shadow-slate-100"
                      title="Buka Workspace"
                    >
                      <Eye className="h-4 w-4" />
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
                href={currentPage <= 1 ? '#' : `/bundle?page=${currentPage - 1}`}
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
                href={currentPage >= totalPages ? '#' : `/bundle?page=${currentPage + 1}`}
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
