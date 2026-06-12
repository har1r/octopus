// src/app/bundle/history/page.tsx
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { BundleService } from '@/services/bundle.service';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Eye, Calendar, History } from 'lucide-react';
import { BundleStatus } from '@prisma/client';

export const metadata = {
  title: 'Riwayat Bundle - Architax PBB',
};

function getStatusBadgeClass(status: BundleStatus) {
  switch (status) {
    case 'COMPLETED':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'SENT_TO_CENTER':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    default:
      return 'bg-zinc-50 text-zinc-700 border-zinc-200';
  }
}

interface PageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function BundleHistoryPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  if (session.user.role !== 'STAF_PENELITI' && session.user.role !== 'SUPERVISOR') {
    redirect('/forbidden');
  }

  const { page } = await searchParams;
  const currentPage = parseInt(page || '1', 10);
  const limit = 10;

  // Fetch only SENT_TO_CENTER or COMPLETED bundles
  // In our simplified repository list, we fetch all but we can filter here or in service
  const result = await BundleService.findFiltered({
    page: currentPage,
    limit,
  });

  const allItems = result.success && result.data ? result.data.items : [];
  
  // Filter for completed/sent to center bundle histories
  const items = allItems.filter(
    item => item.status === BundleStatus.SENT_TO_CENTER || item.status === BundleStatus.COMPLETED
  );
  
  const total = items.length;

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-[#222222] text-white rounded-xl p-6 shadow-sm flex items-start gap-4">
        <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center text-white flex-shrink-0">
          <History className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Riwayat Pengiriman Bundle</h1>
          <p className="text-xs text-white/70 mt-1 max-w-2xl leading-relaxed">
            Halaman ini menampilkan riwayat seluruh bundle berkas yang telah dikirim ke pusat (SENT TO CENTER) atau telah selesai (COMPLETED) diarsipkan secara permanen.
          </p>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-[#DDDDDD] rounded-xl shadow-sm overflow-hidden overflow-x-auto">
        <Table>
          <TableHeader className="bg-[#F7F7F7]">
            <TableRow className="border-b border-[#DDDDDD] hover:bg-[#F7F7F7]">
              <TableHead className="font-bold text-[#222222] w-[160px]">No. Bundle</TableHead>
              <TableHead className="font-bold text-[#222222]">Jenis Pelayanan</TableHead>
              <TableHead className="font-bold text-[#222222] w-[140px]">Jumlah Berkas</TableHead>
              <TableHead className="font-bold text-[#222222] w-[160px]">Status Bundle</TableHead>
              <TableHead className="font-bold text-[#222222] w-[140px] flex items-center gap-1">
                <Calendar className="h-4 w-4" /> Tanggal Buat
              </TableHead>
              <TableHead className="font-bold text-[#222222] text-right w-[100px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-[#717171] font-semibold">
                  Belum ada riwayat pengiriman bundle yang selesai.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id} className="border-b border-[#DDDDDD] hover:bg-[#F7F7F7]/50">
                  <TableCell className="font-bold text-[#222222]">{item.bundleNumber}</TableCell>
                  <TableCell className="font-semibold text-xs text-[#222222]">
                    {item.serviceType.replace(/_/g, ' ')}
                  </TableCell>
                  <TableCell className="font-bold text-[#2563EB]">
                    {item.itemCount} Berkas
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${getStatusBadgeClass(item.status)}`}>
                      {item.status.replace(/_/g, ' ')}
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
                    <Link
                      href={`/bundle/${item.id}`}
                      className={cn(
                        buttonVariants({ variant: 'ghost' }),
                        "text-[#2563EB] hover:text-[#1D4ED8] hover:bg-[#2563EB]/5 rounded-lg p-2 h-9 w-9 flex items-center justify-center cursor-pointer"
                      )}
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
      </div>
    </div>
  );
}
