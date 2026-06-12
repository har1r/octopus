// src/app/permohonan/page.tsx
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { PermohonanService } from '@/services/permohonan.service';
import { PermohonanFilters as TableFilters } from '@/components/tables/permohonan-filters';
import { DeletePermohonanButton } from '@/components/shared/delete-permohonan-button';
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

// Renders a high-fidelity semantic status badge in Clay style
function renderStatusBadge(status: ApplicationStatus) {
  let bg = '';
  let dotColor = '';

  switch (status) {
    case 'COMPLETED':
    case 'READY_TO_SHIP':
      bg = 'bg-emerald-50/80 text-emerald-800 border-emerald-200/60';
      dotColor = 'bg-emerald-500';
      break;
    case 'REVISION':
    case 'RE_EXAMINE':
      bg = 'bg-amber-50/80 text-amber-800 border-amber-200/60';
      dotColor = 'bg-amber-500';
      break;
    case 'REJECTED':
    case 'REJECTED_PERMANENT':
      bg = 'bg-rose-50/80 text-rose-800 border-rose-200/60';
      dotColor = 'bg-rose-500';
      break;
    case 'SUBMITTED':
    case 'DRAFT_BUNDLE':
    case 'READY_TO_ARCHIVE':
    case 'SENT_TO_CENTER':
    default:
      bg = 'bg-blue-50/80 text-blue-800 border-blue-200/60';
      dotColor = 'bg-blue-500';
      break;
  }

  const isPulse = status === 'REVISION' || status === 'RE_EXAMINE' || status === 'SUBMITTED';

  return (
    <span className={`inline-flex items-center gap-1.5 text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${bg} select-none`}>
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
    <div className="space-y-5">
      {/* Filters, Header, and Search Toolbar */}
      <TableFilters userRole={userRole} canWrite={canWrite} />

      {/* Table (Desktop) */}
      <div className="hidden md:block -mx-8 border-b border-slate-200 bg-white overflow-x-auto">
        <div className="min-w-[950px]">
          <table className="w-full border-collapse text-left table-fixed">
            <colgroup>
              <col style={{ width: '32px' }} />
              <col style={{ width: 'auto' }} />
              <col style={{ width: '180px' }} />
              <col style={{ width: '200px' }} />
              <col style={{ width: '160px' }} />
              <col style={{ width: '140px' }} />
              <col style={{ width: '140px' }} />
              <col style={{ width: '100px' }} />
              <col style={{ width: '32px' }} />
            </colgroup>
            <thead>
              <tr className="bg-white border-b border-slate-200 h-[34px] text-[11px] font-semibold text-slate-500 uppercase tracking-wider select-none">
                <th>{/* spacer */}</th>
                <th className="px-2 py-0 align-middle h-[34px]">No. Berkas</th>
                <th className="px-2 py-0 align-middle h-[34px]">Jenis Layanan</th>
                <th className="px-2 py-0 align-middle h-[34px]">NOP</th>
                <th className="px-2 py-0 align-middle h-[34px]">Pemilik Asal</th>
                <th className="px-2 py-0 align-middle h-[34px]">Status</th>
                <th className="px-2 py-0 align-middle h-[34px]">Tanggal Input</th>
                <th className="px-2 py-0 align-middle h-[34px] text-right">Aksi</th>
                <th>{/* spacer */}</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr className="h-[46px] border-b border-slate-100">
                  <td></td>
                  <td colSpan={7} className="text-center text-slate-400 font-bold text-sm align-middle h-[46px]">
                    Tidak ada permohonan ditemukan.
                  </td>
                  <td></td>
                </tr>
              ) : (
                items.map((item) => {
                  const isDraftEditable =
                    userRole === 'STAF_PENGINPUT' &&
                    (item.status === ApplicationStatus.SUBMITTED || item.status === ApplicationStatus.REVISION);

                  return (
                    <tr
                      key={item.id}
                      className="h-[46px] text-[13px] text-slate-900 border-b border-slate-100 hover:bg-[#F9FAFB] transition-colors duration-150"
                    >
                      <td>{/* spacer */}</td>
                      <td className="px-2 py-0 align-middle h-[46px] font-semibold text-blue-600">
                        <Link href={`/permohonan/${item.id}`} className="hover:underline inline-flex items-center gap-1.5">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256" className="text-slate-400 h-4 w-4 flex-shrink-0">
                            <path d="M80,40V216H48a8,8,0,0,1-8-8V48a8,8,0,0,1,8-8Z" opacity="0.2"></path>
                            <path d="M184,112a8,8,0,0,1-8,8H112a8,8,0,0,1,0-16h64A8,8,0,0,1,184,112Zm-8,24H112a8,8,0,0,0,0,16h64a8,8,0,0,0,0-16Zm48-88V208a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V48A16,16,0,0,1,48,32H208A16,16,0,0,1,224,48ZM48,208H72V48H48Zm160,0V48H88V208H208Z"></path>
                          </svg>
                          {item.nomorBerkas}
                        </Link>
                      </td>
                      <td className="px-2 py-0 align-middle h-[46px] font-medium text-slate-800">
                        <span className="inline-block bg-[#EFF6FF] text-[#1D4ED8] px-2 py-0.5 rounded border border-[#DBEAFE] text-[10px] font-bold uppercase tracking-wider">
                          {item.serviceType.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-2 py-0 align-middle h-[46px] font-mono text-xs text-slate-600">
                        {formatNop(item.nop)}
                      </td>
                      <td className="px-2 py-0 align-middle h-[46px] text-slate-700 font-semibold text-xs">
                        {item.oldOwnerName || '-'}
                      </td>
                      <td className="px-2 py-0 align-middle h-[46px]">
                        {renderStatusBadge(item.status)}
                      </td>
                      <td className="px-2 py-0 align-middle h-[46px] text-xs text-slate-500 font-semibold">
                        {new Date(item.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-2 py-0 align-middle h-[46px] text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isDraftEditable ? (
                            <>
                              <Link
                                href={`/permohonan/${item.id}/edit`}
                                className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 border border-amber-200 rounded-lg p-2 h-8 w-8 inline-flex items-center justify-center transition-all duration-150 active:scale-95 cursor-pointer shadow-xs"
                                title="Edit Revisi"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </Link>
                              <DeletePermohonanButton id={item.id} nomorBerkas={item.nomorBerkas} />
                            </>
                          ) : (
                            <Link
                              href={`/permohonan/${item.id}`}
                              className="text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-slate-200 rounded-lg p-2 h-8 w-8 inline-flex items-center justify-center transition-all duration-150 active:scale-95 cursor-pointer shadow-xs"
                              title="Lihat Detail"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Link>
                          )}
                        </div>
                      </td>
                      <td>{/* spacer */}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Card List (Mobile) */}
      <div className="md:hidden space-y-3">
        {items.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-slate-400 font-bold">
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
                className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col gap-3 hover:border-slate-300 transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="overflow-hidden">
                    <Link href={`/permohonan/${item.id}`} className="font-bold text-blue-600 text-sm hover:underline block truncate">
                      {item.nomorBerkas}
                    </Link>
                    <p className="text-[10px] text-slate-500 font-medium mt-1">
                      NOP: <span className="font-mono">{formatNop(item.nop)}</span>
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    {renderStatusBadge(item.status)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-2.5 text-xs">
                  <div>
                    <p className="text-slate-400 font-bold text-[9px] uppercase tracking-wider">Jenis Layanan</p>
                    <p className="font-bold text-slate-700 mt-0.5 text-xs truncate">
                      {item.serviceType.replace(/_/g, ' ')}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-bold text-[9px] uppercase tracking-wider">Pemilik Asal</p>
                    <p className="font-bold text-slate-700 mt-0.5 text-xs truncate">{item.oldOwnerName || '-'}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs">
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
                          className="text-amber-600 hover:bg-amber-50 border border-amber-200 rounded-lg p-1.5 h-8 w-8 inline-flex items-center justify-center transition-all duration-150 active:scale-95 cursor-pointer shadow-xs"
                          title="Edit Revisi"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </Link>
                        <DeletePermohonanButton id={item.id} nomorBerkas={item.nomorBerkas} />
                      </>
                    ) : (
                      <Link
                        href={`/permohonan/${item.id}`}
                        className="text-slate-500 hover:bg-slate-50 border border-slate-200 rounded-lg p-1.5 h-8 w-8 inline-flex items-center justify-center transition-all duration-150 active:scale-95 cursor-pointer shadow-xs"
                        title="Lihat Detail"
                      >
                        <Eye className="h-3.5 w-3.5" />
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border border-slate-200 bg-white rounded-lg shadow-sm">
          <p className="text-xs text-slate-500 font-medium select-none">
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
              className={`border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-md h-8 px-3 font-semibold text-xs flex items-center gap-1.5 transition-all duration-150 active:scale-95 shadow-xs cursor-pointer ${currentPage <= 1 ? 'pointer-events-none opacity-50 bg-slate-50/20' : ''
                }`}
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Sebelumnya
            </Link>
            <span className="text-xs font-bold text-slate-800 select-none">
              {currentPage} / {totalPages}
            </span>
            <Link
              href={`/permohonan?${new URLSearchParams({
                page: String(currentPage + 1),
                ...(nop ? { nop } : {}),
                ...(serviceType ? { serviceType } : {}),
                ...(status ? { status } : {}),
              }).toString()}`}
              className={`border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-md h-8 px-3 font-semibold text-xs flex items-center gap-1.5 transition-all duration-150 active:scale-95 shadow-xs cursor-pointer ${currentPage >= totalPages ? 'pointer-events-none opacity-50 bg-slate-50/20' : ''
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

