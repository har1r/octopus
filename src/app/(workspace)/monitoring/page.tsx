// src/app/monitoring/page.tsx
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
import { Eye, Activity, Calendar, CheckCircle, Package } from 'lucide-react';
import { BundleStatus } from '@prisma/client';

export const metadata = {
  title: 'Monitoring Berkas Pusat - Architax PBB',
};

interface PageProps {
  searchParams: Promise<{
    page?: string;
    status?: string;
  }>;
}

export default async function MonitoringLandingPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  // Enforce STAF_PEMANTAU or SUPERVISOR role
  const allowed = ['STAF_PEMANTAU', 'SUPERVISOR'];
  if (!allowed.includes(session.user.role)) {
    redirect('/forbidden');
  }

  const { page, status } = await searchParams;
  const currentPage = parseInt(page || '1', 10);
  const limit = 10;

  // Set filter status based on tab selection
  let filterStatuses: BundleStatus[] = [BundleStatus.SENT_TO_CENTER, BundleStatus.COMPLETED];
  if (status === 'SENT_TO_CENTER') {
    filterStatuses = [BundleStatus.SENT_TO_CENTER];
  } else if (status === 'COMPLETED') {
    filterStatuses = [BundleStatus.COMPLETED];
  }

  // Retrieve filtered bundles
  const result = await BundleService.findFiltered({
    statuses: filterStatuses,
    page: currentPage,
    limit,
  });

  // Retrieve ALL stats (no pagination)
  const allResult = await BundleService.findFiltered({
    statuses: [BundleStatus.SENT_TO_CENTER, BundleStatus.COMPLETED],
    limit: 1000,
  });
  const allItems = allResult.success && allResult.data ? allResult.data.items : [];
  const totalSent = allItems.filter(i => i.status === BundleStatus.SENT_TO_CENTER).length;
  const totalCompleted = allItems.filter(i => i.status === BundleStatus.COMPLETED).length;

  const items = result.success && result.data ? result.data.items : [];
  const total = result.success && result.data ? result.data.total : 0;
  const totalPages = Math.ceil(total / limit);

  const tabs = [
    { label: 'Semua Bundle', value: undefined, count: totalSent + totalCompleted },
    { label: 'Dikirim ke Pusat', value: 'SENT_TO_CENTER', count: totalSent },
    { label: 'Selesai', value: 'COMPLETED', count: totalCompleted },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#222222]">Monitoring Alur Berkas</h1>
        <p className="text-xs text-[#717171] mt-1">
          Pantau bundle berkas yang dikirim ke pusat, verifikasi status tiap berkas, dan selesaikan bundle.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-[#DDDDDD] rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
            <Activity className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-xs text-[#717171] font-semibold uppercase tracking-wider">Dikirim ke Pusat</p>
            <p className="text-2xl font-extrabold text-[#222222] mt-0.5">{totalSent}</p>
            <p className="text-xs text-[#717171]">bundle aktif</p>
          </div>
        </div>
        <div className="bg-white border border-[#DDDDDD] rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-[#717171] font-semibold uppercase tracking-wider">Selesai</p>
            <p className="text-2xl font-extrabold text-[#222222] mt-0.5">{totalCompleted}</p>
            <p className="text-xs text-[#717171]">bundle completed</p>
          </div>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex border-b border-[#DDDDDD] gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = status === tab.value || (!status && !tab.value);
          const href = tab.value ? `/monitoring?status=${tab.value}` : '/monitoring';
          return (
            <Link
              key={tab.label}
              href={href}
              className={`px-4 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'border-[#2563EB] text-[#2563EB]'
                  : 'border-transparent text-[#717171] hover:text-[#222222] hover:border-[#DDDDDD]'
              }`}
            >
              {tab.label}
              <span className={`ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                isActive ? 'bg-[#2563EB]/10 text-[#2563EB]' : 'bg-[#F0F0F0] text-[#717171]'
              }`}>
                {tab.count}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Table — Desktop */}
      <div className="hidden md:block bg-white border border-[#DDDDDD] rounded-xl shadow-sm overflow-hidden overflow-x-auto">
        <Table>
          <TableHeader className="bg-[#F7F7F7]">
            <TableRow className="border-b border-[#DDDDDD] hover:bg-[#F7F7F7]">
              <TableHead className="font-bold text-[#222222] w-[160px]">No. Bundle</TableHead>
              <TableHead className="font-bold text-[#222222]">Jenis Pelayanan</TableHead>
              <TableHead className="font-bold text-[#222222] w-[130px] text-center">Jumlah Berkas</TableHead>
              <TableHead className="font-bold text-[#222222] w-[170px]">Status Bundle</TableHead>
              <TableHead className="font-bold text-[#222222] w-[150px]">
                <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Tanggal Update</span>
              </TableHead>
              <TableHead className="font-bold text-[#222222] text-right w-[150px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-40 text-center">
                  <div className="flex flex-col items-center gap-2 text-[#717171]">
                    <Activity className="h-8 w-8 text-[#DDDDDD]" />
                    <p className="font-semibold text-sm">Tidak ada bundle dalam kategori ini.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id} className="border-b border-[#DDDDDD] hover:bg-[#F7F7F7]/50 transition-colors">
                  <TableCell className="font-bold text-[#222222]">{item.bundleNumber}</TableCell>
                  <TableCell className="font-semibold text-xs text-[#222222]">
                    {item.serviceType.replace(/_/g, ' ')}
                  </TableCell>
                  <TableCell className="text-center font-bold text-[#2563EB]">
                    {item.itemCount} Berkas
                  </TableCell>
                  <TableCell>
                    {item.status === BundleStatus.COMPLETED ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border border-green-200 bg-green-50 text-green-700 uppercase tracking-wider">
                        <CheckCircle className="h-3 w-3" /> Selesai
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border border-indigo-200 bg-indigo-50 text-indigo-700 uppercase tracking-wider">
                        <Activity className="h-3 w-3" /> Dikirim ke Pusat
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-[#717171]">
                    {new Date(item.updatedAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/monitoring/${item.id}`}
                      className={`inline-flex items-center justify-center gap-1.5 text-xs font-bold rounded-lg h-9 px-4 border transition-colors cursor-pointer ${
                        item.status === BundleStatus.COMPLETED
                          ? 'border-[#DDDDDD] hover:bg-[#F7F7F7] text-[#222222]'
                          : 'bg-[#2563EB] border-transparent hover:bg-[#1D4ED8] text-white'
                      }`}
                    >
                      {item.status === BundleStatus.COMPLETED ? (
                        <><Eye className="h-3.5 w-3.5" /> Lihat Detail</>
                      ) : (
                        <><Package className="h-3.5 w-3.5" /> Detail & Proses</>
                      )}
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Cards — Mobile */}
      <div className="md:hidden space-y-3">
        {items.length === 0 ? (
          <div className="bg-white border border-[#DDDDDD] rounded-xl p-10 text-center">
            <Activity className="h-8 w-8 text-[#DDDDDD] mx-auto mb-2" />
            <p className="font-semibold text-sm text-[#717171]">Tidak ada bundle dalam kategori ini.</p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-[#DDDDDD] rounded-xl p-4 shadow-sm flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-[#222222] text-sm">{item.bundleNumber}</p>
                  <p className="text-xs text-[#717171] mt-0.5">{item.serviceType.replace(/_/g, ' ')}</p>
                </div>
                {item.status === BundleStatus.COMPLETED ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border border-green-200 bg-green-50 text-green-700 uppercase tracking-wider flex-shrink-0">
                    <CheckCircle className="h-3 w-3" /> Selesai
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border border-indigo-200 bg-indigo-50 text-indigo-700 uppercase tracking-wider flex-shrink-0">
                    <Activity className="h-3 w-3" /> Dikirim
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between border-t border-[#F7F7F7] pt-3">
                <div className="flex items-center gap-3 text-xs text-[#717171]">
                  <span className="font-bold text-[#2563EB]">{item.itemCount} Berkas</span>
                  <span>
                    {new Date(item.updatedAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <Link
                  href={`/monitoring/${item.id}`}
                  className={`inline-flex items-center justify-center gap-1.5 text-xs font-bold rounded-lg h-8 px-3 border transition-colors cursor-pointer ${
                    item.status === BundleStatus.COMPLETED
                      ? 'border-[#DDDDDD] hover:bg-[#F7F7F7] text-[#222222]'
                      : 'bg-[#2563EB] border-transparent hover:bg-[#1D4ED8] text-white'
                  }`}
                >
                  {item.status === BundleStatus.COMPLETED ? (
                    <><Eye className="h-3.5 w-3.5" /> Detail</>
                  ) : (
                    <><Package className="h-3.5 w-3.5" /> Proses</>
                  )}
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-[#DDDDDD] pt-4">
          <div className="text-xs text-[#717171] font-semibold">
            Halaman {currentPage} dari {totalPages} · {total} bundle
          </div>
          <div className="flex gap-2">
            <Link
              href={currentPage <= 1 ? '#' : `/monitoring?page=${currentPage - 1}${status ? `&status=${status}` : ''}`}
              className={`border border-[#DDDDDD] text-xs font-bold rounded-lg h-9 px-3 flex items-center transition-colors ${
                currentPage <= 1 ? 'pointer-events-none opacity-40' : 'hover:bg-[#F7F7F7]'
              }`}
            >
              ← Sebelumnya
            </Link>
            <Link
              href={currentPage >= totalPages ? '#' : `/monitoring?page=${currentPage + 1}${status ? `&status=${status}` : ''}`}
              className={`border border-[#DDDDDD] text-xs font-bold rounded-lg h-9 px-3 flex items-center transition-colors ${
                currentPage >= totalPages ? 'pointer-events-none opacity-40' : 'hover:bg-[#F7F7F7]'
              }`}
            >
              Berikutnya →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
