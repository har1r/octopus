// src/app/permohonan/page.tsx
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { PermohonanService } from '@/services/permohonan.service';
import { PermohonanFilters as TableFilters } from '@/components/tables/permohonan-filters';
import { DeletePermohonanButton } from '@/components/shared/delete-permohonan-button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Plus, Edit3, ArrowLeft, ArrowRight, Eye } from 'lucide-react';
import { ServiceType, ApplicationStatus } from '@prisma/client';

export const metadata = {
  title: 'Daftar Permohonan - Architax PBB',
};

// Formats number input into NOP mask: XX.XX.XXX.XXX.XXX-XXXX.X
function formatNop(nop: string): string {
  const nums = nop.replace(/[^0-9]/g, '');
  if (nums.length !== 18) return nop;
  return `${nums.substring(0, 2)}.${nums.substring(2, 4)}.${nums.substring(4, 7)}.${nums.substring(7, 10)}.${nums.substring(10, 13)}-${nums.substring(13, 17)}.${nums.substring(17, 18)}`;
}

// Renders a high-fidelity semantic status badge
function renderStatusBadge(status: ApplicationStatus) {
  let bg = '';
  let text = '';
  let dotColor = '';

  switch (status) {
    case 'COMPLETED':
    case 'READY_TO_SHIP':
      bg = 'bg-emerald-50 text-emerald-700 border-emerald-100/80';
      dotColor = 'bg-emerald-500';
      break;
    case 'REVISION':
    case 'RE_EXAMINE':
      bg = 'bg-amber-50/70 text-amber-700 border-amber-100';
      dotColor = 'bg-amber-500';
      break;
    case 'REJECTED':
    case 'REJECTED_PERMANENT':
      bg = 'bg-rose-50 text-rose-700 border-rose-100';
      dotColor = 'bg-rose-500';
      break;
    case 'SUBMITTED':
    case 'DRAFT_BUNDLE':
    case 'READY_TO_ARCHIVE':
    case 'SENT_TO_CENTER':
    default:
      bg = 'bg-blue-50/70 text-blue-700 border-blue-100';
      dotColor = 'bg-blue-500';
      break;
  }

  const isPulse = status === 'REVISION' || status === 'RE_EXAMINE' || status === 'SUBMITTED';

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
    nop?: string;
    serviceType?: string;
    status?: string;
  }>;
}

export default async function PermohonanListPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const { page, nop, serviceType, status } = await searchParams;

  const userRole = session.user.role;
  const createdById = userRole === 'STAF_PENGINPUT' ? session.user.id : undefined;

  const currentPage = parseInt(page || '1', 10);
  const limit = 10;

  // Fetch filtered lists
  const result = await PermohonanService.findFiltered({
    createdById,
    nop,
    serviceType: serviceType as ServiceType,
    status: status as ApplicationStatus,
    page: currentPage,
    limit,
  });

  const items = result.success && result.data ? result.data.items : [];
  const total = result.success && result.data ? result.data.total : 0;
  const totalPages = Math.ceil(total / limit);

  // Checks if user is permitted to write/edit/delete
  const canWrite = ['STAF_PENGINPUT', 'STAF_PENELITI'].includes(userRole);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-display tracking-tight">
            {userRole === 'STAF_PENGINPUT' ? 'Permohonan Saya' : 'Semua Permohonan'}
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Kelola dan pantau seluruh alur berkas permohonan PBB
          </p>
        </div>
        {canWrite && (
          <Link
            href="/permohonan/new"
            className="bg-gradient-to-r from-[#FF385C] to-[#E31C5F] hover:from-[#E31C5F] hover:to-[#C1113C] text-white font-bold rounded-xl h-11 px-5 shadow-md shadow-[#FF385C]/15 flex items-center justify-center gap-1.5 self-start text-sm transition-all duration-150 active:scale-[0.97] cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5" /> Buat Permohonan
          </Link>
        )}
      </div>

      {/* Filters */}
      <TableFilters />

      {/* Table Card (Desktop) */}
      <div className="hidden md:block bg-white border border-slate-100 rounded-2xl shadow-sm shadow-slate-100/50 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50 border-b border-slate-100">
            <TableRow className="border-b border-slate-100 hover:bg-slate-50/50">
              <TableHead className="font-bold text-slate-500 text-[10px] uppercase tracking-wider w-[140px] py-3">No. Berkas</TableHead>
              <TableHead className="font-bold text-slate-500 text-[10px] uppercase tracking-wider py-3">Jenis Layanan</TableHead>
              <TableHead className="font-bold text-slate-500 text-[10px] uppercase tracking-wider w-[200px] py-3">NOP</TableHead>
              <TableHead className="font-bold text-slate-500 text-[10px] uppercase tracking-wider py-3">Pemilik Asal</TableHead>
              <TableHead className="font-bold text-slate-500 text-[10px] uppercase tracking-wider w-[160px] py-3">Status</TableHead>
              <TableHead className="font-bold text-slate-500 text-[10px] uppercase tracking-wider w-[140px] py-3">Tanggal Input</TableHead>
              <TableHead className="font-bold text-slate-500 text-[10px] uppercase tracking-wider text-right w-[120px] py-3">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-slate-400 font-bold text-sm">
                  Tidak ada permohonan ditemukan.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => {
                const isDraftEditable =
                  userRole === 'STAF_PENGINPUT' &&
                  (item.status === ApplicationStatus.SUBMITTED || item.status === ApplicationStatus.REVISION);

                return (
                  <TableRow key={item.id} className="border-b border-slate-100 hover:bg-slate-50/30 transition-colors duration-150">
                    <TableCell className="font-bold text-slate-900 font-display">{item.nomorBerkas}</TableCell>
                    <TableCell className="font-bold text-xs text-slate-800">
                      {item.serviceType.replace(/_/g, ' ')}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-800">
                      {formatNop(item.nop)}
                    </TableCell>
                    <TableCell className="text-slate-800 font-semibold text-xs">
                      {item.oldOwnerName || '-'}
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
                      <div className="flex items-center justify-end gap-1.5">
                        {isDraftEditable ? (
                          <>
                            <Link
                              href={`/permohonan/${item.id}/edit`}
                              className="text-amber-500 hover:text-white hover:bg-amber-500 border border-amber-200 hover:border-amber-500 rounded-xl p-2 h-9 w-9 inline-flex items-center justify-center transition-all duration-150 active:scale-90 cursor-pointer shadow-sm shadow-amber-500/5"
                              title="Edit Revisi"
                            >
                              <Edit3 className="h-4 w-4" />
                            </Link>
                            <DeletePermohonanButton id={item.id} nomorBerkas={item.nomorBerkas} />
                          </>
                        ) : (
                          <Link
                            href={`/permohonan/${item.id}`}
                            className="text-slate-400 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 rounded-xl p-2 h-9 w-9 inline-flex items-center justify-center transition-all duration-150 active:scale-90 cursor-pointer shadow-sm shadow-slate-100"
                            title="Lihat Detail"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Card List (Mobile) */}
      <div className="md:hidden space-y-4">
        {items.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center text-slate-400 font-bold">
            Tidak ada permohonan ditemukan.
          </div>
        ) : (
          items.map((item) => {
            const isDraftEditable =
              userRole === 'STAF_PENGINPUT' &&
              (item.status === ApplicationStatus.SUBMITTED || item.status === ApplicationStatus.REVISION);

            return (
              <div
                key={item.id}
                className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm shadow-slate-100/40 flex flex-col gap-4 hover:border-slate-200 transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="overflow-hidden">
                    <p className="font-extrabold text-slate-900 text-sm font-display truncate">{item.nomorBerkas}</p>
                    <p className="text-[10px] text-slate-500 font-medium mt-1">
                      NOP: <span className="font-mono">{formatNop(item.nop)}</span>
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    {renderStatusBadge(item.status)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 border-t border-slate-50 pt-3 text-xs">
                  <div>
                    <p className="text-slate-400 font-bold text-[9px] uppercase tracking-wider">Jenis Layanan</p>
                    <p className="font-bold text-slate-800 mt-0.5 text-xs truncate">
                      {item.serviceType.replace(/_/g, ' ')}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-bold text-[9px] uppercase tracking-wider">Pemilik Asal</p>
                    <p className="font-bold text-slate-800 mt-0.5 text-xs truncate">{item.oldOwnerName || '-'}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-50 pt-3 text-xs">
                  <span className="text-slate-400 text-[10px] font-semibold">
                    {new Date(item.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {isDraftEditable ? (
                      <>
                        <Link
                          href={`/permohonan/${item.id}/edit`}
                          className="text-amber-500 hover:text-white hover:bg-amber-500 border border-amber-200 rounded-xl p-2 h-9 w-9 inline-flex items-center justify-center transition-all duration-150 active:scale-90 cursor-pointer shadow-sm shadow-amber-500/5"
                          title="Edit Revisi"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Link>
                        <DeletePermohonanButton id={item.id} nomorBerkas={item.nomorBerkas} />
                      </>
                    ) : (
                      <Link
                        href={`/permohonan/${item.id}`}
                        className="text-slate-400 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 rounded-xl p-2 h-9 w-9 inline-flex items-center justify-center transition-all duration-150 active:scale-90 cursor-pointer shadow-sm shadow-slate-100"
                        title="Lihat Detail"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Server Side Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border border-slate-100 bg-white rounded-2xl shadow-sm shadow-slate-100/30">
          <p className="text-xs text-slate-500 font-bold select-none">
            Menampilkan {items.length} dari {total} permohonan
          </p>
          <div className="flex items-center gap-3">
            <Link
              href={`/permohonan?${new URLSearchParams({
                page: String(currentPage - 1),
                ...(nop ? { nop } : {}),
                ...(serviceType ? { serviceType } : {}),
                ...(status ? { status } : {}),
              }).toString()}`}
              className={`border border-slate-200 hover:bg-slate-50 hover:text-slate-900 rounded-xl h-9 px-4 font-bold text-xs flex items-center gap-1.5 text-slate-700 transition-all duration-150 active:scale-95 cursor-pointer shadow-sm ${currentPage <= 1 ? 'pointer-events-none opacity-50 bg-slate-50/20' : ''
                }`}
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Sebelumnya
            </Link>
            <span className="text-xs font-extrabold text-slate-800 font-display select-none">
              {currentPage} / {totalPages}
            </span>
            <Link
              href={`/permohonan?${new URLSearchParams({
                page: String(currentPage + 1),
                ...(nop ? { nop } : {}),
                ...(serviceType ? { serviceType } : {}),
                ...(status ? { status } : {}),
              }).toString()}`}
              className={`border border-slate-200 hover:bg-slate-50 hover:text-slate-900 rounded-xl h-9 px-4 font-bold text-xs flex items-center gap-1.5 text-slate-700 transition-all duration-150 active:scale-95 cursor-pointer shadow-sm ${currentPage >= totalPages ? 'pointer-events-none opacity-50 bg-slate-50/20' : ''
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

