// src/app/audit/page.tsx
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { FolderLock, Calendar, User, ShieldAlert, Activity, Clock } from 'lucide-react';

export const metadata = {
  title: 'Log Audit Keamanan - Architax PBB',
};

interface PageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

// Map action codes to readable labels and colors
const actionConfig: Record<string, { label: string; color: string }> = {
  CREATE: { label: 'Buat Permohonan', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  UPDATE: { label: 'Ubah Data', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  DELETE: { label: 'Hapus Data', color: 'bg-red-50 border-red-200 text-red-700' },
  REVISION: { label: 'Minta Revisi', color: 'bg-amber-50 border-amber-200 text-amber-700' },
  REJECT: { label: 'Tolak Berkas', color: 'bg-rose-50 border-rose-200 text-rose-700' },
  RESUBMIT: { label: 'Kirim Ulang', color: 'bg-sky-50 border-sky-200 text-sky-700' },
  CREATE_BUNDLE: { label: 'Buat Bundle', color: 'bg-violet-50 border-violet-200 text-violet-700' },
  ADD_BUNDLE_ITEM: { label: 'Tambah ke Bundle', color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
  REMOVE_BUNDLE_ITEM: { label: 'Keluarkan dari Bundle', color: 'bg-orange-50 border-orange-200 text-orange-700' },
  FINALIZE_BUNDLE: { label: 'Finalisasi Bundle', color: 'bg-teal-50 border-teal-200 text-teal-700' },
  RE_EXAMINE_BUNDLE: { label: 'Kembalikan ke Penelitian', color: 'bg-fuchsia-50 border-fuchsia-200 text-fuchsia-700' },
  APPROVE_ARCHIVE_BUNDLE: { label: 'Setujui Pengarsipan', color: 'bg-green-50 border-green-200 text-green-700' },
  COMPLETE_BUNDLE: { label: 'Selesaikan Bundle', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  UPLOAD_SCAN: { label: 'Unggah Scan', color: 'bg-cyan-50 border-cyan-200 text-cyan-700' },
  DELETE_SCAN: { label: 'Hapus Scan', color: 'bg-red-50 border-red-200 text-red-700' },
  COMPLETE_PERMOHONAN: { label: 'Selesaikan Permohonan', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
};

function getActionStyle(action: string) {
  return actionConfig[action] ?? { label: action, color: 'bg-[#F7F7F7] border-[#DDDDDD] text-[#717171]' };
}

export default async function AuditLogPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  if (session.user.role !== 'SUPERVISOR') {
    redirect('/forbidden');
  }

  const { page } = await searchParams;
  const currentPage = parseInt(page || '1', 10);
  const limit = 20;
  const skip = (currentPage - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.auditLog.count(),
  ]);

  const totalPages = Math.ceil(total / limit);

  // Quick stats
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayCount = await prisma.auditLog.count({ where: { createdAt: { gte: todayStart } } });
  const uniqueActors = new Set(items.map(i => i.userId)).size;

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#222222] flex items-center gap-2">
            <FolderLock className="h-6 w-6 text-[#2563EB]" /> Log Audit Keamanan
          </h1>
          <p className="text-xs text-[#717171] mt-1">
            Catatan aktivitas sistem yang bersifat kekal (immutable), transparan, dan dapat diaudit kapan saja.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-2 rounded-lg flex-shrink-0">
          <ShieldAlert className="h-4 w-4" />
          Mode Audit: Aktif & Terkunci
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#DDDDDD] rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-[#2563EB]/10 flex items-center justify-center flex-shrink-0">
            <Activity className="h-5 w-5 text-[#2563EB]" />
          </div>
          <div>
            <p className="text-xs text-[#717171] font-semibold uppercase tracking-wider">Total Log</p>
            <p className="text-2xl font-extrabold text-[#222222] mt-0.5">{total.toLocaleString('id-ID')}</p>
            <p className="text-xs text-[#717171]">entri aktivitas</p>
          </div>
        </div>
        <div className="bg-white border border-[#DDDDDD] rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
            <Clock className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-xs text-[#717171] font-semibold uppercase tracking-wider">Aktivitas Hari Ini</p>
            <p className="text-2xl font-extrabold text-[#222222] mt-0.5">{todayCount}</p>
            <p className="text-xs text-[#717171]">log tercatat</p>
          </div>
        </div>
        <div className="bg-white border border-[#DDDDDD] rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
            <User className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-[#717171] font-semibold uppercase tracking-wider">Aktor Aktif</p>
            <p className="text-2xl font-extrabold text-[#222222] mt-0.5">{uniqueActors}</p>
            <p className="text-xs text-[#717171]">pada halaman ini</p>
          </div>
        </div>
      </div>

      {/* Audit Table — Desktop */}
      <div className="hidden md:block bg-white border border-[#DDDDDD] rounded-xl shadow-sm overflow-hidden overflow-x-auto">
        <div className="px-6 py-3 border-b border-[#DDDDDD] bg-[#F7F7F7] flex items-center justify-between">
          <p className="text-xs font-bold text-[#222222]">
            Menampilkan {skip + 1}–{Math.min(skip + limit, total)} dari {total.toLocaleString('id-ID')} entri
          </p>
          <span className="text-[10px] font-bold text-[#717171] uppercase tracking-wide">Read-Only · Immutable</span>
        </div>
        <Table>
          <TableHeader className="bg-[#F7F7F7]">
            <TableRow className="border-b border-[#DDDDDD] hover:bg-[#F7F7F7]">
              <TableHead className="font-bold text-[#222222] w-[190px]">
                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Waktu</span>
              </TableHead>
              <TableHead className="font-bold text-[#222222] w-[160px]">
                <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> Pengguna</span>
              </TableHead>
              <TableHead className="font-bold text-[#222222] w-[130px]">Role</TableHead>
              <TableHead className="font-bold text-[#222222] w-[200px]">Aktivitas</TableHead>
              <TableHead className="font-bold text-[#222222] w-[120px]">Entitas</TableHead>
              <TableHead className="font-bold text-[#222222]">ID Entitas</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-40 text-center">
                  <div className="flex flex-col items-center gap-2 text-[#717171]">
                    <FolderLock className="h-8 w-8 text-[#DDDDDD]" />
                    <p className="font-semibold text-sm">Belum ada catatan aktivitas audit.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              items.map((log) => {
                const { label, color } = getActionStyle(log.action);
                return (
                  <TableRow key={log.id} className="border-b border-[#DDDDDD] hover:bg-[#F7F7F7]/40 transition-colors text-xs">
                    <TableCell className="text-[#717171] font-semibold tabular-nums">
                      {new Date(log.createdAt).toLocaleString('id-ID', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </TableCell>
                    <TableCell className="font-bold text-[#222222]">{log.userName}</TableCell>
                    <TableCell>
                      <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F7F7F7] border border-[#DDDDDD] text-[#717171] uppercase tracking-wide">
                        {log.userRole.replace(/_/g, ' ')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center font-bold px-2 py-0.5 rounded-md border text-[10px] uppercase tracking-wide ${color}`}>
                        {label}
                      </span>
                    </TableCell>
                    <TableCell className="font-semibold text-[#222222]">{log.entityType}</TableCell>
                    <TableCell className="font-mono text-[#717171] select-all truncate max-w-[200px]" title={log.entityId}>
                      {log.entityId}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Audit Cards — Mobile */}
      <div className="md:hidden space-y-3">
        {items.length === 0 ? (
          <div className="bg-white border border-[#DDDDDD] rounded-xl p-10 text-center">
            <FolderLock className="h-8 w-8 text-[#DDDDDD] mx-auto mb-2" />
            <p className="font-semibold text-sm text-[#717171]">Belum ada catatan aktivitas audit.</p>
          </div>
        ) : (
          items.map((log) => {
            const { label, color } = getActionStyle(log.action);
            return (
              <div key={log.id} className="bg-white border border-[#DDDDDD] rounded-xl p-4 shadow-sm space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-[#222222] text-sm">{log.userName}</p>
                    <p className="text-[10px] text-[#717171] font-semibold uppercase tracking-wide mt-0.5">
                      {log.userRole.replace(/_/g, ' ')}
                    </p>
                  </div>
                  <span className={`inline-flex items-center font-bold px-2 py-0.5 rounded-md border text-[10px] uppercase tracking-wide flex-shrink-0 ${color}`}>
                    {label}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-[#F7F7F7] pt-2 text-xs text-[#717171]">
                  <span className="font-semibold">{log.entityType}</span>
                  <span className="tabular-nums">
                    {new Date(log.createdAt).toLocaleString('id-ID', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </span>
                </div>
                <p className="font-mono text-[10px] text-[#AAAAAA] truncate" title={log.entityId}>
                  ID: {log.entityId}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-[#DDDDDD] pt-4">
          <div className="text-xs text-[#717171] font-semibold">
            Halaman {currentPage} dari {totalPages} · {total.toLocaleString('id-ID')} entri total
          </div>
          <div className="flex gap-2">
            <Link
              href={currentPage <= 1 ? '#' : `/audit?page=${currentPage - 1}`}
              className={`border border-[#DDDDDD] text-xs font-bold rounded-lg h-9 px-3 flex items-center transition-colors ${
                currentPage <= 1 ? 'pointer-events-none opacity-40' : 'hover:bg-[#F7F7F7]'
              }`}
            >
              ← Sebelumnya
            </Link>
            <Link
              href={currentPage >= totalPages ? '#' : `/audit?page=${currentPage + 1}`}
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
