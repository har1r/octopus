// src/components/clay-dashboard-client.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ApplicationStatus, BundleStatus, ManifestStatus, ServiceType } from '@prisma/client';
import {
  Edit3,
  Eye,
  Star,
  Activity,
  CheckCircle,
  Calendar,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Flame,
  Upload,
  Trash2,
  Loader2,
  CheckCircle2,
  Package,
  ArrowLeftRight,
  Check,
  FileSearch,
  Layers,
  MapPin,
  Truck,
  ShieldCheck,
  CheckSquare,
  ArrowRight,
  ArrowLeft,
  Plus,
  AlertCircle,
  FileText,
  MoreVertical
} from 'lucide-react';
import { DeletePermohonanButton } from '@/components/shared/delete-permohonan-button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

// Actions
import { approveBundleArchivingAction, reExamineBundleAction, completeBundleAction } from '@/actions/bundle.actions';
import { uploadScanFileAction, deleteScanFileAction, togglePermohonanCompletionAction, deletePermohonanAction } from '@/actions/permohonan.actions';
import {
  createManifestAction,
  addBundleToManifestAction,
  removeBundleFromManifestAction,
  uploadSignedProofAction,
  approveManifestAction
} from '@/actions/manifest.actions';

interface ClayDashboardClientProps {
  initialUserName: string;
  userRole: string;
  dbItems: any[];
  extraData?: any;
}

function formatNop(nop: string): string {
  const nums = nop.replace(/[^0-9]/g, '');
  if (nums.length !== 18) return nop;
  return `${nums.substring(0, 2)}.${nums.substring(2, 4)}.${nums.substring(4, 7)}.${nums.substring(7, 10)}.${nums.substring(10, 13)}-${nums.substring(13, 17)}.${nums.substring(17, 18)}`;
}

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

export function ClayDashboardClient({ initialUserName, userRole, dbItems, extraData }: ClayDashboardClientProps) {
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  const getOwnerName = (item: any) => {
    return item.details?.[0]?.newOwnerName || item.oldOwnerName || '-';
  };

  // General dashboard controls
  const [activeTab, setActiveTab] = React.useState<'all' | 'recents' | 'favorites'>('all');
  const [tableSearch, setTableSearch] = React.useState('');
  const [searchFocused, setSearchFocused] = React.useState(false);
  const [favoriteIds, setFavoriteIds] = React.useState<string[]>([]);
  const [openActionId, setOpenActionId] = React.useState<string | null>(null);

  // STAF_PENELITI filters
  const [selectedServiceType, setSelectedServiceType] = React.useState<string>('All');
  const [selectedStatus, setSelectedStatus] = React.useState<string>('All');

  // Pagination State for Penginput and Peneliti dashboards
  const [currentPagePenginput, setCurrentPagePenginput] = React.useState(1);
  const [currentPagePeneliti, setCurrentPagePeneliti] = React.useState(1);

  React.useEffect(() => {
    setCurrentPagePenginput(1);
  }, [activeTab, tableSearch]);

  React.useEffect(() => {
    setCurrentPagePeneliti(1);
  }, [selectedServiceType, selectedStatus, tableSearch]);

  // STAF_PENGARSIP active bundle index
  const [activeBundleIndex, setActiveBundleIndex] = React.useState<number>(0);
  const [rowUploadingId, setRowUploadingId] = React.useState<string | null>(null);

  // STAF_PENGIRIM drag & drop kanban state
  const [draggedId, setDraggedId] = React.useState<string | null>(null);
  const [proofUploading, setProofUploading] = React.useState(false);

  // STAF_PEMANTAU active bundle index
  const [activeMonitorIndex, setActiveMonitorIndex] = React.useState<number>(0);

  React.useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('architax_favorites');
      if (stored) {
        try {
          setFavoriteIds(JSON.parse(stored));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  const toggleFavorite = (id: string) => {
    setFavoriteIds((prev) => {
      const next = prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id];
      localStorage.setItem('architax_favorites', JSON.stringify(next));
      return next;
    });
  };

  const handleDelete = (id: string, nomorBerkas: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus berkas ${nomorBerkas}?`)) {
      startTransition(async () => {
        try {
          const result = await deletePermohonanAction(id);
          if (result.success) {
            toast.success(`Berkas ${nomorBerkas} berhasil dihapus`);
            router.refresh();
          } else {
            toast.error(result.error || 'Gagal menghapus berkas');
          }
        } catch (error: any) {
          toast.error(error.message || 'Terjadi kesalahan');
        }
      });
    }
  };

  if (!mounted) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-[#2563EB]" />
        <span className="text-xs text-[#717171] font-semibold">Memuat Workspace Dashboard...</span>
      </div>
    );
  }

  // --- 1. STAF_PENGINPUT Dashboard Renderer ---
  const renderPenginputDashboard = () => {
    // Filter and sort items based on activeTab
    let items = [...dbItems];
    if (activeTab === 'recents') {
      items.sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
    } else if (activeTab === 'favorites') {
      items = items.filter(item => favoriteIds.includes(item.id));
    }

    // Filter by table search
    const filteredItems = items.filter(item => {
      const owner = getOwnerName(item);
      return item.nomorBerkas.toLowerCase().includes(tableSearch.toLowerCase()) ||
        (owner !== '-' && owner.toLowerCase().includes(tableSearch.toLowerCase())) ||
        item.nop.toLowerCase().includes(tableSearch.toLowerCase());
    });

    const itemsPerPage = 10;
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const paginatedItems = filteredItems.slice(
      (currentPagePenginput - 1) * itemsPerPage,
      currentPagePenginput * itemsPerPage
    );

    return (
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-2xl font-bold text-[#111827] tracking-tight">Hey, ready to get started?</h1>
          <p className="text-xs text-[#717171] mt-1">Kelola dokumen permohonan baru dan revisi draf berkas secara terpusat.</p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 rounded-lg p-1 bg-[#F3F4F6] border border-[#E5E7EB] w-fit select-none">
          {['all', 'recents', 'favorites'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`rounded-md px-3 py-1 text-xs font-semibold capitalize transition-all ${activeTab === tab
                ? 'bg-white text-[#111827] shadow-sm'
                : 'text-[#6B7280] hover:text-[#111827]'
                }`}
            >
              {tab === 'all' ? 'All files' : tab}
            </button>
          ))}
        </div>

        {/* Table Toolbar */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#111827]">Permohonan Saya</h2>
          <div className="flex items-center gap-2">
            <div className={`relative flex items-center h-8 rounded-lg border px-3 transition-all bg-white ${searchFocused ? 'border-[#CBD5E1] ring-2 ring-blue-50' : 'border-[#E5E7EB]'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256" className="text-[#9CA3AF] mr-2">
                <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
              </svg>
              <input
                type="text"
                placeholder="Search"
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="border-none outline-none text-xs text-[#111827] w-48 bg-transparent"
              />
            </div>
            <button
              onClick={() => router.push('/permohonan/new')}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold h-8 px-4 rounded-lg inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" /> Buat Permohonan
            </button>
          </div>
        </div>

        {/* Table View */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden shadow-sm overflow-x-auto">
          <table className="w-full border-collapse text-left table-fixed min-w-[900px]">
            <colgroup>
              <col style={{ width: '32px' }} />
              <col style={{ width: '160px' }} />
              <col style={{ width: '140px' }} />
              <col style={{ width: '180px' }} />
              <col style={{ width: '160px' }} />
              <col style={{ width: '180px' }} />
              <col style={{ width: '130px' }} />
              <col style={{ width: '120px' }} />
              <col style={{ width: '90px' }} />
              <col style={{ width: '32px' }} />
            </colgroup>
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB] h-11 text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
                <th></th>
                <th className="px-2 align-middle">No. Berkas</th>
                <th className="px-2 align-middle">No. Pelayanan</th>
                <th className="px-2 align-middle">NOP</th>
                <th className="px-2 align-middle">Jenis Layanan</th>
                <th className="px-2 align-middle">Pemilik Baru</th>
                <th className="px-2 align-middle">Status</th>
                <th className="px-2 align-middle">Tanggal Input</th>
                <th className="px-2 align-middle text-right">Aksi</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr className="h-16 border-b border-[#F3F4F6]">
                  <td></td>
                  <td colSpan={8} className="text-center text-xs text-[#9CA3AF] font-bold">Tidak ada permohonan ditemukan.</td>
                  <td></td>
                </tr>
              ) : (
                paginatedItems.map((item) => {
                  const isDraftEditable = item.status === ApplicationStatus.SUBMITTED || item.status === ApplicationStatus.REVISION;
                  const isFav = favoriteIds.includes(item.id);
                  return (
                    <tr key={item.id} className="h-14 border-b border-[#F3F4F6] text-xs hover:bg-[#F9FAFB] transition-colors">
                      <td></td>
                      <td className="px-2 align-middle font-semibold">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => toggleFavorite(item.id)} className="cursor-pointer">
                            <Star className={`h-3.5 w-3.5 ${isFav ? 'text-amber-400 fill-amber-400' : 'text-slate-300 hover:text-amber-400'}`} />
                          </button>
                          <span className="text-[#2563EB]">
                            {item.nomorBerkas}
                          </span>
                        </div>
                      </td>
                      <td className="px-2 align-middle font-semibold">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[#2563EB]">
                            {item.nomorPelayan}
                          </span>
                        </div>
                      </td>
                      <td className="px-2 align-middle font-mono text-[11px] text-[#4B5563]">{formatNop(item.nop)}</td>
                      <td className="px-2 align-middle">
                        <span className="inline-block bg-[#EFF6FF] text-[#1D4ED8] px-2 py-0.5 rounded border border-[#DBEAFE] text-[9px] font-bold uppercase tracking-wider">
                          {item.serviceType.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-2 align-middle text-[#4B5563]">
                        <div className="truncate" title={getOwnerName(item)}>
                          {getOwnerName(item)}
                        </div>
                      </td>
                      <td className="px-2 align-middle">{renderStatusBadge(item.status)}</td>
                      <td className="px-2 align-middle text-[#6B7280]">{new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                      <td className="px-2 align-middle text-right relative">
                        <div className="flex items-center justify-end">
                          <button
                            onClick={() => setOpenActionId(openActionId === item.id ? null : item.id)}
                            className="border border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-slate-50 hover:text-[#111827] p-1.5 rounded-lg h-7 w-7 flex items-center justify-center cursor-pointer transition-all shadow-sm"
                            title="Aksi"
                          >
                            <MoreVertical className="h-3.5 w-3.5" />
                          </button>

                          {openActionId === item.id && (
                            <>
                              <div
                                className="fixed inset-0 z-30 cursor-default"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenActionId(null);
                                }}
                              />
                              <div className="absolute right-2 top-12 w-36 bg-white border border-[#E5E7EB] rounded-lg shadow-lg py-1.5 z-40 text-left transition-all">
                                <button
                                  onClick={() => {
                                    setOpenActionId(null);
                                    router.push(`/permohonan/${item.id}`);
                                  }}
                                  className="w-full px-3 py-1.5 text-xs text-[#111827] flex items-center gap-2 cursor-pointer transition-colors"
                                >
                                  <Eye className="h-3.5 w-3.5 text-[#111827]" />
                                  Lihat Detail
                                </button>
                                {isDraftEditable && (
                                  <>
                                    <button
                                      onClick={() => {
                                        setOpenActionId(null);
                                        router.push(`/permohonan/${item.id}/edit`);
                                      }}
                                      className="w-full px-3 py-1.5 text-xs text-[#111827] flex items-center gap-2 cursor-pointer transition-colors border-t border-[#F3F4F6]"
                                    >
                                      <Edit3 className="h-3.5 w-3.5 text-[#111827]" />
                                      Edit / Revisi
                                    </button>
                                    <button
                                      onClick={() => {
                                        setOpenActionId(null);
                                        handleDelete(item.id, item.nomorBerkas);
                                      }}
                                      className="w-full px-3 py-1.5 text-xs text-[#111827] flex items-center gap-2 cursor-pointer transition-colors border-t border-[#F3F4F6]"
                                    >
                                      <Trash2 className="h-3.5 w-3.5 text-[#111827]" />
                                      Hapus Draft
                                    </button>
                                  </>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                      <td></td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-[#E5E7EB] bg-[#F9FAFB] px-6 py-3.5 select-none">
              <div className="text-xs text-[#6B7280]">
                Menampilkan <span className="font-semibold text-[#111827]">{((currentPagePenginput - 1) * itemsPerPage) + 1}</span> sampai{' '}
                <span className="font-semibold text-[#111827]">{Math.min(currentPagePenginput * itemsPerPage, filteredItems.length)}</span> dari{' '}
                <span className="font-semibold text-[#111827]">{filteredItems.length}</span> berkas
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPagePenginput <= 1}
                  onClick={() => setCurrentPagePenginput(prev => Math.max(prev - 1, 1))}
                  className={`border border-[#D1D5DB] rounded-md h-8 px-3 font-semibold text-xs flex items-center gap-1 transition-all duration-150 select-none ${currentPagePenginput <= 1
                      ? 'pointer-events-none opacity-40 bg-gray-50'
                      : 'bg-white hover:bg-[#F9FAFB] text-[#374151] cursor-pointer active:scale-95'
                    }`}
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Sebelumnya
                </button>
                <div className="text-xs text-[#374151] font-semibold">
                  {currentPagePenginput} / {totalPages}
                </div>
                <button
                  type="button"
                  disabled={currentPagePenginput >= totalPages}
                  onClick={() => setCurrentPagePenginput(prev => Math.min(prev + 1, totalPages))}
                  className={`border border-[#D1D5DB] rounded-md h-8 px-3 font-semibold text-xs flex items-center gap-1 transition-all duration-150 select-none ${currentPagePenginput >= totalPages
                      ? 'pointer-events-none opacity-40 bg-gray-50'
                      : 'bg-white hover:bg-[#F9FAFB] text-[#374151] cursor-pointer active:scale-95'
                    }`}
                >
                  Selanjutnya <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // --- 2. STAF_PENELITI Dashboard Renderer ---
  const renderPenelitiDashboard = () => {
    // Filter by SUBMITTED state (research queue)
    let items = dbItems.filter(item => item.status === ApplicationStatus.SUBMITTED);

    // Apply Layanan filter
    if (selectedServiceType !== 'All') {
      items = items.filter(item => item.serviceType === selectedServiceType);
    }

    // Apply table search
    const filteredItems = items.filter(item => {
      const owner = getOwnerName(item);
      return item.nomorBerkas.toLowerCase().includes(tableSearch.toLowerCase()) ||
        (owner !== '-' && owner.toLowerCase().includes(tableSearch.toLowerCase())) ||
        item.nop.toLowerCase().includes(tableSearch.toLowerCase());
    });

    const itemsPerPage = 10;
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const paginatedItems = filteredItems.slice(
      (currentPagePeneliti - 1) * itemsPerPage,
      currentPagePeneliti * itemsPerPage
    );

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#111827] tracking-tight">Antrean Permohonan Masuk</h1>
          <p className="text-xs text-[#717171] mt-1">Lakukan analisis data, kalkulasi pemecahan sisa, penyusunan bundle berkas, dan penanganan eksepsi.</p>
        </div>

        {/* Filters and Search toolbar */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Owner Segmented Layanan Filter Chip (Height 24px) */}
              <div className="flex h-6 items-center rounded border border-[#E5E7EB] bg-white overflow-hidden select-none shadow-sm">
                <div className="px-2.5 flex items-center h-full border-r border-[#E5E7EB] bg-[#F9FAFB]">
                  <span className="text-[10px] font-bold text-[#374151] uppercase tracking-wider">Layanan</span>
                </div>
                {['All', 'MUTASI_SEBAGIAN', 'MUTASI_PENUH', 'OBJEK_PAJAK_BARU'].map((type) => {
                  const isSelected = selectedServiceType === type;
                  return (
                    <button
                      key={type}
                      onClick={() => setSelectedServiceType(type)}
                      className={`border-none px-3 h-full text-[10px] font-bold cursor-pointer transition-colors ${isSelected
                        ? 'bg-[#EFF6FF] text-[#1D4ED8] border-r border-[#EFF6FF]'
                        : 'bg-white text-[#4B5563] hover:bg-slate-50 border-r border-[#E5E7EB] last:border-r-0'
                        }`}
                    >
                      {type === 'All' ? 'SEMUA' : type.replace(/_/g, ' ')}
                    </button>
                  );
                })}
              </div>

              {/* Status Toggle Button (Borderless style) */}
              <div className="flex items-center gap-1 bg-[#F9FAFB] rounded px-2 py-0.5 border border-transparent">
                <span className="text-[10px] font-bold text-[#717171] mr-1.5 uppercase tracking-wider">Status:</span>
                {['All', 'SUBMITTED', 'DRAFT_BUNDLE', 'RE_EXAMINE'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`border-none bg-transparent px-2.5 py-1 text-xs font-semibold cursor-pointer rounded transition-all ${selectedStatus === status
                      ? 'text-[#2563EB] font-bold bg-[#EFF6FF]'
                      : 'text-[#6B7280] hover:text-[#111827]'
                      }`}
                  >
                    {status === 'All' ? 'Semua' : status.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Box */}
            <div className={`relative flex items-center h-8 rounded-lg border px-3 transition-all bg-white ${searchFocused ? 'border-[#CBD5E1] ring-2 ring-blue-50' : 'border-[#E5E7EB]'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256" className="text-[#9CA3AF] mr-2">
                <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
              </svg>
              <input
                type="text"
                placeholder="Cari Berkas..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="border-none outline-none text-xs text-[#111827] w-44 bg-transparent"
              />
            </div>
          </div>
        </div>

        {/* Table Queue */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden shadow-sm overflow-x-auto">
          <table className="w-full border-collapse text-left table-fixed min-w-[900px]">
            <colgroup>
              <col style={{ width: '32px' }} />
              <col style={{ width: '160px' }} />
              <col style={{ width: '160px' }} />
              <col style={{ width: '180px' }} />
              <col style={{ width: '200px' }} />
              <col style={{ width: '130px' }} />
              <col style={{ width: '130px' }} />
              <col style={{ width: '100px' }} />
              <col style={{ width: '32px' }} />
            </colgroup>
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB] h-11 text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
                <th></th>
                <th className="px-2 align-middle">No. Berkas</th>
                <th className="px-2 align-middle">Jenis Layanan</th>
                <th className="px-2 align-middle">NOP</th>
                <th className="px-2 align-middle">Pemilik Baru</th>
                <th className="px-2 align-middle">Status</th>
                <th className="px-2 align-middle">Tanggal Masuk</th>
                <th className="px-2 align-middle text-right">Aksi</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr className="h-16 border-b border-[#F3F4F6]">
                  <td></td>
                  <td colSpan={7} className="text-center text-xs text-[#9CA3AF] font-bold">Tidak ada permohonan masuk dalam antrean.</td>
                  <td></td>
                </tr>
              ) : (
                paginatedItems.map((item) => (
                  <tr key={item.id} className="h-14 border-b border-[#F3F4F6] text-xs hover:bg-[#F9FAFB] transition-colors">
                    <td></td>
                    <td className="px-2 align-middle font-semibold">
                      <span onClick={() => router.push(`/permohonan/${item.id}`)} className="text-[#2563EB] hover:underline cursor-pointer">
                        {item.nomorBerkas}
                      </span>
                    </td>
                    <td className="px-2 align-middle">
                      <span className="inline-block bg-[#EFF6FF] text-[#1D4ED8] px-2 py-0.5 rounded border border-[#DBEAFE] text-[9px] font-bold uppercase tracking-wider">
                        {item.serviceType.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-2 align-middle font-mono text-[11px] text-[#4B5563]">{formatNop(item.nop)}</td>
                    <td className="px-2 align-middle text-[#4B5563]">
                      <div className="truncate" title={getOwnerName(item)}>
                        {getOwnerName(item)}
                      </div>
                    </td>
                    <td className="px-2 align-middle">{renderStatusBadge(item.status)}</td>
                    <td className="px-2 align-middle text-[#6B7280]">{new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td className="px-2 align-middle text-right">
                      <button
                        onClick={() => router.push(`/permohonan/${item.id}`)}
                        className="bg-[#2563EB] text-white text-[10px] font-bold h-7 px-3 rounded-lg inline-flex items-center gap-1 transition-colors cursor-pointer hover:bg-[#1D4ED8]"
                      >
                        Penelitian <ArrowRight className="h-3 w-3" />
                      </button>
                    </td>
                    <td></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-[#E5E7EB] bg-[#F9FAFB] px-6 py-3.5 select-none">
              <div className="text-xs text-[#6B7280]">
                Menampilkan <span className="font-semibold text-[#111827]">{((currentPagePeneliti - 1) * itemsPerPage) + 1}</span> sampai{' '}
                <span className="font-semibold text-[#111827]">{Math.min(currentPagePeneliti * itemsPerPage, filteredItems.length)}</span> dari{' '}
                <span className="font-semibold text-[#111827]">{filteredItems.length}</span> berkas
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPagePeneliti <= 1}
                  onClick={() => setCurrentPagePeneliti(prev => Math.max(prev - 1, 1))}
                  className={`border border-[#D1D5DB] rounded-md h-8 px-3 font-semibold text-xs flex items-center gap-1 transition-all duration-150 select-none ${currentPagePeneliti <= 1
                      ? 'pointer-events-none opacity-40 bg-gray-50'
                      : 'bg-white hover:bg-[#F9FAFB] text-[#374151] cursor-pointer active:scale-95'
                    }`}
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Sebelumnya
                </button>
                <div className="text-xs text-[#374151] font-semibold">
                  {currentPagePeneliti} / {totalPages}
                </div>
                <button
                  type="button"
                  disabled={currentPagePeneliti >= totalPages}
                  onClick={() => setCurrentPagePeneliti(prev => Math.min(prev + 1, totalPages))}
                  className={`border border-[#D1D5DB] rounded-md h-8 px-3 font-semibold text-xs flex items-center gap-1 transition-all duration-150 select-none ${currentPagePeneliti >= totalPages
                      ? 'pointer-events-none opacity-40 bg-gray-50'
                      : 'bg-white hover:bg-[#F9FAFB] text-[#374151] cursor-pointer active:scale-95'
                    }`}
                >
                  Selanjutnya <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // --- 3. STAF_PENGARSIP Dashboard Renderer (Split-Screen Layout) ---
  const renderPengarsipDashboard = () => {
    const bundles = dbItems;
    const selectedBundle = bundles[activeBundleIndex];

    const handleRowUpload = async (e: React.ChangeEvent<HTMLInputElement>, permohonanId: string) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Format file tidak didukung! Hanya PDF, JPG, dan PNG.');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('Ukuran file maksimal 5 MB.');
        return;
      }

      setRowUploadingId(permohonanId);
      startTransition(async () => {
        try {
          const presignRes = await fetch('/api/files/presign', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileName: file.name,
              mimeType: file.type,
              fileSize: file.size,
            }),
          });

          if (!presignRes.ok) {
            const errData = await presignRes.json();
            throw new Error(errData.error || 'Gagal memproses presigned URL');
          }

          const { uploadUrl, storageKey } = await presignRes.json();

          const uploadRes = await fetch(uploadUrl, {
            method: 'PUT',
            body: file,
            headers: { 'Content-Type': file.type },
          });

          if (!uploadRes.ok) {
            throw new Error('Gagal mengunggah file binary ke storage server');
          }

          const fileId = Math.random().toString(36).substring(2, 9);
          const metadataRes = await uploadScanFileAction(permohonanId, {
            fileId,
            fileName: file.name,
            storageKey,
            mimeType: file.type,
            fileSize: file.size,
          });

          if (metadataRes.success) {
            toast.success(`Scan ${file.name} terunggah`);
            router.refresh();
          } else {
            throw new Error(metadataRes.error || 'Gagal menyimpan metadata file');
          }
        } catch (error: any) {
          toast.error(error.message || 'Gagal mengunggah file scan');
        } finally {
          setRowUploadingId(null);
        }
      });
    };

    const handleDeleteScan = (permohonanId: string, scanId: string, fileName: string) => {
      if (confirm(`Apakah Anda yakin ingin menghapus scan file ${fileName}?`)) {
        startTransition(async () => {
          try {
            const result = await deleteScanFileAction(permohonanId, scanId);
            if (result.success) {
              toast.success(`Scan ${fileName} dihapus`);
              router.refresh();
            } else {
              toast.error(result.error || 'Gagal menghapus file');
            }
          } catch (error: any) {
            toast.error(error.message || 'Terjadi kesalahan');
          }
        });
      }
    };

    const handleApproveArchive = (bundleId: string) => {
      if (confirm('Apakah Anda yakin seluruh berkas telah lengkap diarsip? Status bundle akan diubah menjadi READY_TO_SHIP.')) {
        startTransition(async () => {
          try {
            const result = await approveBundleArchivingAction(bundleId);
            if (result.success) {
              toast.success('Pengarsipan bundle disetujui');
              router.refresh();
            } else {
              toast.error(result.error || 'Gagal menyetujui pengarsipan');
            }
          } catch (error: any) {
            toast.error(error.message || 'Terjadi kesalahan');
          }
        });
      }
    };

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#111827] tracking-tight">Workspace Pengarsipan</h1>
          <p className="text-xs text-[#717171] mt-1">Kelola pemindaian dokumen fisik dan pengunggahan file scan digital per bundle.</p>
        </div>

        {bundles.length === 0 ? (
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-12 text-center text-[#9CA3AF] font-bold text-sm shadow-sm">
            Tidak ada bundle berkas dalam antrean pengarsipan saat ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-[550px]">
            {/* LEFT SIDEBAR PANEL: Bundles List (5/12 width) */}
            <div className="lg:col-span-5 bg-white border border-[#DDDDDD] rounded-xl shadow-sm flex flex-col overflow-hidden h-[250px] lg:h-full">
              <div className="px-5 py-3.5 border-b border-[#DDDDDD] bg-[#F7F7F7] flex-shrink-0">
                <h3 className="text-xs font-bold text-[#222222] uppercase tracking-wider">Antrean Bundle ({bundles.length})</h3>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-[#DDDDDD]">
                {bundles.map((bundle, idx) => {
                  const isActive = idx === activeBundleIndex;
                  return (
                    <button
                      key={bundle.id}
                      onClick={() => setActiveBundleIndex(idx)}
                      className={`w-full text-left px-5 py-3.5 flex items-center justify-between transition-colors cursor-pointer border-l-4 ${isActive ? 'bg-[#2563EB]/5 border-l-[#2563EB]' : 'hover:bg-[#F7F7F7]/50 border-l-transparent'
                        }`}
                    >
                      <div>
                        <p className="font-bold text-sm text-[#222222]">{bundle.bundleNumber}</p>
                        <p className="text-[10px] text-[#717171] font-semibold mt-0.5 uppercase tracking-wider">{bundle.serviceType.replace(/_/g, ' ')}</p>
                      </div>
                      <span className="text-xs font-bold text-[#2563EB] bg-[#2563EB]/5 px-2.5 py-0.5 rounded-full border border-[#2563EB]/10">
                        {bundle.itemCount} Berkas
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* RIGHT WORKSPACE PANEL: Bundle Items Detail (7/12 width) */}
            <div className="lg:col-span-7 bg-white border border-[#DDDDDD] rounded-xl shadow-sm flex flex-col overflow-hidden h-[450px] lg:h-full">
              {selectedBundle ? (
                <div className="flex flex-col h-full">
                  {/* Selected Bundle Header */}
                  <div className="px-5 py-3.5 border-b border-[#DDDDDD] bg-[#F7F7F7] flex justify-between items-center flex-shrink-0">
                    <div>
                      <h3 className="text-sm font-bold text-[#222222]">{selectedBundle.bundleNumber}</h3>
                      <p className="text-[10px] text-[#717171] font-semibold mt-0.5">READY TO ARCHIVE</p>
                    </div>
                    {/* Persetujuan Final Bundle Button */}
                    <button
                      disabled={isPending || selectedBundle.items.some((item: any) => item.scanFiles.length === 0)}
                      onClick={() => handleApproveArchive(selectedBundle.id)}
                      className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white disabled:opacity-50 text-[10px] font-bold h-7 px-3 rounded-lg inline-flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                    >
                      <Check className="h-3 w-3" /> Setujui Final Bundle
                    </button>
                  </div>

                  {/* Split List View */}
                  <div className="flex-1 overflow-y-auto divide-y divide-[#E5E7EB]">
                    {selectedBundle.items.map((item: any) => {
                      const hasFile = item.scanFiles && item.scanFiles.length > 0;
                      return (
                        <div key={item.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-[#222222] truncate">{item.nomorBerkas}</p>
                            <p className="font-mono text-[10px] text-[#717171] mt-0.5">NOP: {formatNop(item.nop)}</p>
                            <p className="text-[10px] text-[#717171] mt-0.5 truncate">WP: {getOwnerName(item)}</p>
                          </div>

                          {/* Upload state status indicator */}
                          <div className="flex-shrink-0 flex items-center gap-2">
                            {hasFile ? (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 uppercase">
                                ✅ Terupload
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-2 py-0.5 rounded-full border border-rose-200 bg-rose-50 text-rose-700 uppercase">
                                ❌ Belum Ada File
                              </span>
                            )}
                          </div>

                          {/* Micro-Dropzone per Row Upload controls */}
                          <div className="flex-shrink-0 flex items-center gap-1.5">
                            {rowUploadingId === item.id ? (
                              <Loader2 className="h-4 w-4 animate-spin text-[#2563EB]" />
                            ) : (
                              <div className="relative overflow-hidden inline-block">
                                <button className="border border-dashed border-[#2563EB] bg-[#EFF6FF] text-[#1D4ED8] hover:bg-[#DBEAFE] text-[10px] font-bold px-2.5 py-1.5 rounded-lg cursor-pointer">
                                  Pilih PDF
                                </button>
                                <input
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  onChange={(e) => handleRowUpload(e, item.id)}
                                  className="absolute left-0 top-0 opacity-0 cursor-pointer w-full h-full"
                                />
                              </div>
                            )}

                            {hasFile && (
                              <button
                                onClick={() => handleDeleteScan(item.id, item.scanFiles[0].fileId, item.scanFiles[0].fileName)}
                                className="border border-[#E5E7EB] bg-transparent text-[#EF4444] hover:bg-red-50 p-1.5 rounded-lg h-7 w-7 flex items-center justify-center cursor-pointer"
                                title="Hapus Scan"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-[#717171] p-6 text-center">
                  <FileSearch className="h-12 w-12 text-[#DDDDDD] mb-2" />
                  <p className="text-sm font-bold">Pilih bundle di panel kiri</p>
                  <p className="text-xs">untuk mengelola scan dokumen arsip</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // --- 4. STAF_PENGIRIM Dashboard Renderer (Kanban Board Layout) ---
  const renderPengirimDashboard = () => {
    const readyBundles = dbItems;
    const { activeManifest, manifestBundles } = extraData || {};

    const handleCreateManifest = () => {
      startTransition(async () => {
        try {
          const result = await createManifestAction([]);
          if (result.success) {
            toast.success('Draf manifest pengiriman baru dibuat');
            router.refresh();
          } else {
            toast.error(result.error || 'Gagal membuat manifest');
          }
        } catch (error: any) {
          toast.error(error.message || 'Terjadi kesalahan');
        }
      });
    };

    const handleProofUpload = async (e: React.ChangeEvent<HTMLInputElement>, manifestId: string) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowed.includes(file.type)) {
        toast.error('Format file tidak didukung! Hanya PDF, JPG, dan PNG.');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('Ukuran file maksimal 5 MB.');
        return;
      }

      setProofUploading(true);
      startTransition(async () => {
        try {
          const presignRes = await fetch('/api/files/presign', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileName: file.name,
              mimeType: file.type,
              fileSize: file.size,
            }),
          });

          if (!presignRes.ok) {
            const errData = await presignRes.json();
            throw new Error(errData.error || 'Gagal memproses presigned URL');
          }

          const { uploadUrl, storageKey } = await presignRes.json();

          const uploadRes = await fetch(uploadUrl, {
            method: 'PUT',
            body: file,
            headers: { 'Content-Type': file.type },
          });

          if (!uploadRes.ok) {
            throw new Error('Gagal mengunggah file binary ke storage server');
          }

          const signedProofUrl = `/api/files/download?key=${storageKey}`;
          const metadataRes = await uploadSignedProofAction(manifestId, signedProofUrl);

          if (metadataRes.success) {
            toast.success(`Bukti tanda tangan ${file.name} terunggah`);
            router.refresh();
          } else {
            throw new Error(metadataRes.error || 'Gagal menyimpan bukti');
          }
        } catch (error: any) {
          toast.error(error.message || 'Gagal mengunggah bukti');
        } finally {
          setProofUploading(false);
        }
      });
    };

    const handleApproveManifest = (manifestId: string) => {
      if (confirm('Apakah Anda yakin ingin menyelesaikan pengiriman manifest ini? Seluruh bundle di dalamnya akan berstatus SENT_TO_CENTER.')) {
        startTransition(async () => {
          try {
            const result = await approveManifestAction(manifestId);
            if (result.success) {
              toast.success('Manifest berhasil disetujui untuk pengiriman');
              router.refresh();
            } else {
              toast.error(result.error || 'Gagal menyetujui manifest');
            }
          } catch (error: any) {
            toast.error(error.message || 'Terjadi kesalahan');
          }
        });
      }
    };

    const handleDragStart = (id: string, source: 'ready' | 'manifest') => {
      setDraggedId(JSON.stringify({ id, source }));
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent, target: 'ready' | 'manifest') => {
      e.preventDefault();
      if (!draggedId || !activeManifest) return;

      const { id, source } = JSON.parse(draggedId);
      setDraggedId(null);

      if (source === 'ready' && target === 'manifest') {
        startTransition(async () => {
          const res = await addBundleToManifestAction(activeManifest.id, id);
          if (res.success) toast.success('Bundle ditambahkan ke manifest');
          else toast.error(res.error || 'Gagal');
          router.refresh();
        });
      } else if (source === 'manifest' && target === 'ready') {
        startTransition(async () => {
          const res = await removeBundleFromManifestAction(activeManifest.id, id);
          if (res.success) toast.success('Bundle dikeluarkan dari manifest');
          else toast.error(res.error || 'Gagal');
          router.refresh();
        });
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#111827] tracking-tight">Workspace Pengiriman</h1>
            <p className="text-xs text-[#717171] mt-1">Kelola pengelompokkan bundle ke dalam manifest pengiriman besar secara drag-and-drop.</p>
          </div>
          {!activeManifest && (
            <button
              onClick={handleCreateManifest}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold h-8 px-4 rounded-lg inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" /> Buat Manifest
            </button>
          )}
        </div>

        {!activeManifest ? (
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-12 text-center text-[#9CA3AF] font-bold text-sm shadow-sm flex flex-col items-center gap-3">
            <p>Tidak ada draf manifest pengiriman aktif.</p>
            <button
              onClick={handleCreateManifest}
              className="bg-[#2563EB] text-white text-xs font-semibold h-9 px-6 rounded-lg cursor-pointer"
            >
              Buat Manifest &amp; Mulai Drag-and-Drop
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[520px]">
            {/* COLUMN LEFT: READY TO SHIP (Column A) */}
            <div
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'ready')}
              className="bg-white border border-[#DDDDDD] rounded-xl flex flex-col overflow-hidden h-[300px] lg:h-full shadow-sm"
            >
              <div className="px-5 py-3 border-b border-[#DDDDDD] bg-[#F7F7F7] flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#222222] uppercase tracking-wider">READY TO SHIP ({readyBundles.length})</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {readyBundles.length === 0 ? (
                  <p className="text-xs text-[#717171] italic text-center py-8">Tidak ada bundle siap kirim.</p>
                ) : (
                  readyBundles.map((bundle: any) => (
                    <div
                      key={bundle.id}
                      draggable
                      onDragStart={() => handleDragStart(bundle.id, 'ready')}
                      className="bg-white border border-[#DDDDDD] hover:border-[#2563EB] rounded-xl p-4 shadow-sm cursor-grab active:cursor-grabbing flex flex-col justify-between gap-2 transition-all"
                    >
                      <div>
                        <p className="font-bold text-sm text-[#222222]">{bundle.bundleNumber}</p>
                        <p className="text-[10px] text-[#717171] font-bold mt-0.5 uppercase tracking-wider">{bundle.serviceType.replace(/_/g, ' ')}</p>
                        <p className="text-[10px] text-[#717171] mt-1 font-semibold">{bundle.itemCount} Berkas</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* COLUMN MIDDLE: MANIFEST DRAFT (Column B) */}
            <div
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'manifest')}
              className="bg-white border border-[#DDDDDD] rounded-xl flex flex-col overflow-hidden h-[300px] lg:h-full shadow-sm"
            >
              <div className="px-5 py-3 border-b border-[#DDDDDD] bg-[#F7F7F7] flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#222222] uppercase tracking-wider">Draf Manifest ({manifestBundles.length})</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {manifestBundles.length === 0 ? (
                  <p className="text-xs text-[#717171] italic text-center py-8">Seret bundle ke sini untuk memasukkan ke manifest.</p>
                ) : (
                  manifestBundles.map((bundle: any) => (
                    <div
                      key={bundle.id}
                      draggable
                      onDragStart={() => handleDragStart(bundle.id, 'manifest')}
                      className="bg-white border border-[#DDDDDD] hover:border-red-400 rounded-xl p-4 shadow-sm cursor-grab active:cursor-grabbing flex flex-col justify-between gap-2 transition-all"
                    >
                      <div>
                        <p className="font-bold text-sm text-[#222222]">{bundle.bundleNumber}</p>
                        <p className="text-[10px] text-[#717171] font-bold mt-0.5 uppercase tracking-wider">{bundle.serviceType.replace(/_/g, ' ')}</p>
                        <p className="text-[10px] text-[#717171] mt-1 font-semibold">{bundle.itemCount} Berkas</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* COLUMN RIGHT: ACTIONS & UPLOADS */}
            <div className="flex flex-col gap-5 h-auto lg:h-full">
              <Card className="border-[#DDDDDD] shadow-sm flex flex-col">
                <CardHeader className="pb-3 border-b border-[#F7F7F7]">
                  <CardTitle className="text-xs font-bold flex items-center gap-1.5 text-[#222222] uppercase tracking-wider">
                    <Truck className="h-4 w-4 text-[#2563EB]" /> Detail Pengiriman
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4 text-xs">
                  <div>
                    <p className="text-[10px] text-[#717171] font-bold uppercase tracking-wider">Nomor Manifest</p>
                    <p className="font-bold text-[#222222] mt-0.5 text-sm">{activeManifest.manifestNumber}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#717171] font-bold uppercase tracking-wider">Status Manifest</p>
                    <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700 uppercase mt-0.5 tracking-wider">
                      {activeManifest.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <hr className="border-[#F7F7F7]" />

                  {/* Upload Tanda Tangan */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#222222] uppercase tracking-wider">Unggah Bukti Manifest Bertanda Tangan</label>
                    {activeManifest.signedProofUrl ? (
                      <div className="flex items-center justify-between p-2 border border-emerald-200 bg-emerald-50 rounded-lg text-emerald-800">
                        <span className="text-[10px] font-bold truncate flex items-center gap-1">
                          <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" /> Bukti Terupload
                        </span>
                        <label className="cursor-pointer text-emerald-700 hover:text-emerald-800 hover:bg-emerald-100/50 p-1.5 h-7 w-7 rounded-md flex items-center justify-center">
                          <Upload className="h-4 w-4" />
                          <input
                            type="file"
                            onChange={(e) => handleProofUpload(e, activeManifest.id)}
                            accept=".pdf,.jpg,.jpeg,.png"
                            disabled={proofUploading}
                            className="hidden"
                          />
                        </label>
                      </div>
                    ) : (
                      <div className="border border-dashed border-[#DDDDDD] hover:bg-[#F7F7F7]/50 rounded-lg p-4 text-center cursor-pointer relative transition-colors">
                        <input
                          type="file"
                          onChange={(e) => handleProofUpload(e, activeManifest.id)}
                          accept=".pdf,.jpg,.jpeg,.png"
                          disabled={proofUploading}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Upload className="h-5 w-5 text-[#2563EB] mx-auto mb-1" />
                        <p className="text-[10px] font-bold text-[#222222] uppercase">Unggah Tanda Tangan (JPG/PNG)</p>
                        {proofUploading && (
                          <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-lg">
                            <Loader2 className="h-4 w-4 animate-spin text-[#2563EB]" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <hr className="border-[#F7F7F7]" />

                  {/* Cetakan lembar tanda terima action */}
                  {activeManifest.signedProofUrl && (
                    <button
                      onClick={() => handleApproveManifest(activeManifest.id)}
                      disabled={isPending || manifestBundles.length === 0}
                      className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white disabled:opacity-50 text-[10px] font-bold h-10 rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer uppercase tracking-wider"
                    >
                      <ShieldCheck className="h-4 w-4" /> Kirim Manifest (SENT TO CENTER)
                    </button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    );
  };

  // --- 5. STAF_PEMANTAU Dashboard Renderer ---
  const renderPemantauDashboard = () => {
    const bundles = dbItems;
    const selectedBundle = bundles[activeMonitorIndex];

    const handleToggleCompletion = (permohonanId: string, nomorBerkas: string) => {
      if (confirm(`Apakah Anda yakin menyelesaikan permohonan ${nomorBerkas}?\nTindakan ini bersifat PERMANEN dan akan mengirimkan WhatsApp otomatis ke Pemohon.`)) {
        startTransition(async () => {
          try {
            const result = await togglePermohonanCompletionAction(permohonanId);
            if (result.success) {
              toast.success(`Berkas ${nomorBerkas} berstatus COMPLETED`);
              router.refresh();
            } else {
              toast.error(result.error || 'Gagal');
            }
          } catch (error: any) {
            toast.error(error.message || 'Terjadi kesalahan');
          }
        });
      }
    };

    const handleCompleteBundle = (bundleId: string) => {
      if (confirm('Apakah Anda yakin menyelesaikan bundle ini? Status bundle akan diubah secara permanen menjadi COMPLETED.')) {
        startTransition(async () => {
          try {
            const result = await completeBundleAction(bundleId);
            if (result.success) {
              toast.success('Bundle berhasil diselesaikan (COMPLETED)');
              router.refresh();
            } else {
              toast.error(result.error || 'Gagal menyelesaikan bundle');
            }
          } catch (error: any) {
            toast.error(error.message || 'Terjadi kesalahan');
          }
        });
      }
    };

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#111827] tracking-tight">Hub Pemantauan Berkas</h1>
          <p className="text-xs text-[#717171] mt-1">Pantau penyelesaian fisik berkas dan terbitkan status final permohonan.</p>
        </div>

        {bundles.length === 0 ? (
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-12 text-center text-[#9CA3AF] font-bold text-sm shadow-sm">
            Tidak ada bundle pengiriman yang dipantau saat ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-[550px]">
            {/* LEFT COLUMN: Bundles under monitoring with progress bar */}
            <div className="lg:col-span-5 bg-white border border-[#DDDDDD] rounded-xl shadow-sm flex flex-col overflow-hidden h-[250px] lg:h-full">
              <div className="px-5 py-3.5 border-b border-[#DDDDDD] bg-[#F7F7F7] flex-shrink-0">
                <h3 className="text-xs font-bold text-[#222222] uppercase tracking-wider">Daftar Bundle</h3>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-[#DDDDDD]">
                {bundles.map((bundle, idx) => {
                  const isActive = idx === activeMonitorIndex;
                  const totalCount = bundle.items.length;
                  const completedCount = bundle.items.filter((item: any) => item.status === ApplicationStatus.COMPLETED).length;
                  const percent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

                  return (
                    <button
                      key={bundle.id}
                      onClick={() => setActiveMonitorIndex(idx)}
                      className={`w-full text-left px-5 py-3.5 flex flex-col gap-2 transition-colors cursor-pointer border-l-4 ${isActive ? 'bg-[#2563EB]/5 border-l-[#2563EB]' : 'hover:bg-[#F7F7F7]/50 border-l-transparent'
                        }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <p className="font-bold text-sm text-[#222222]">{bundle.bundleNumber}</p>
                          <p className="text-[9px] text-[#717171] font-bold mt-0.5 uppercase tracking-wider">{bundle.serviceType.replace(/_/g, ' ')}</p>
                        </div>
                        <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                          {completedCount}/{totalCount} Selesai
                        </span>
                      </div>

                      {/* Coral Linear Progress Bar */}
                      <div className="w-full">
                        <div className="w-full bg-[#E5E7EB] h-1 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${percent}%`, backgroundColor: '#FF6B6B' }}
                            className="h-full rounded-full transition-all duration-300"
                          />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* RIGHT COLUMN: Interactive Status Switch & Final Golden Archive Button */}
            <div className="lg:col-span-7 bg-white border border-[#DDDDDD] rounded-xl shadow-sm flex flex-col overflow-hidden h-[450px] lg:h-full">
              {selectedBundle ? (
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="px-5 py-3.5 border-b border-[#DDDDDD] bg-[#F7F7F7] flex justify-between items-center flex-shrink-0">
                    <div>
                      <h3 className="text-sm font-bold text-[#222222]">{selectedBundle.bundleNumber}</h3>
                      <p className="text-[10px] text-[#717171] font-semibold mt-0.5">MONITORING PHYSICAL ALUR</p>
                    </div>

                    {/* Golden Archive Button (Active when progress is 100%) */}
                    {selectedBundle.status !== BundleStatus.COMPLETED ? (
                      <button
                        disabled={isPending || selectedBundle.items.some((item: any) => item.status !== ApplicationStatus.COMPLETED)}
                        onClick={() => handleCompleteBundle(selectedBundle.id)}
                        style={{
                          background: selectedBundle.items.every((item: any) => item.status === ApplicationStatus.COMPLETED)
                            ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
                            : '#E5E7EB',
                          color: selectedBundle.items.every((item: any) => item.status === ApplicationStatus.COMPLETED)
                            ? '#ffffff'
                            : '#9CA3AF',
                          border: selectedBundle.items.every((item: any) => item.status === ApplicationStatus.COMPLETED)
                            ? '1px solid #B45309'
                            : '1px solid #D1D5DB',
                        }}
                        className="text-[10px] font-bold h-7 px-3.5 rounded-lg inline-flex items-center gap-1 transition-all cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
                      >
                        <CheckSquare className="h-3.5 w-3.5" /> Arsip Permanen (Golden)
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200 uppercase tracking-wider">
                        ✅ Selesai
                      </span>
                    )}
                  </div>

                  {/* List of files in the bundle with Switch */}
                  <div className="flex-1 overflow-y-auto divide-y divide-[#E5E7EB]">
                    {selectedBundle.items.map((item: any) => {
                      const isItemCompleted = item.status === ApplicationStatus.COMPLETED;
                      return (
                        <div key={item.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-[#222222] truncate">{item.nomorBerkas}</p>
                            <p className="font-mono text-[10px] text-[#717171] mt-0.5">NOP: {formatNop(item.nop)}</p>
                          </div>

                          {/* iOS style Toggle Switch */}
                          <div className="flex-shrink-0 flex items-center gap-2">
                            <span className="text-[10px] font-semibold text-[#717171]">
                              {isItemCompleted ? 'Selesai' : 'Proses'}
                            </span>
                            <Switch
                              checked={isItemCompleted}
                              disabled={isItemCompleted || isPending || selectedBundle.status === BundleStatus.COMPLETED}
                              onCheckedChange={() => handleToggleCompletion(item.id, item.nomorBerkas)}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-[#717171] p-6 text-center">
                  <FileSearch className="h-12 w-12 text-[#DDDDDD] mb-2" />
                  <p className="text-sm font-bold">Pilih bundle di panel kiri</p>
                  <p className="text-xs">untuk memantau dan mengubah status penyelesaian berkas</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // --- 6. SUPERVISOR Dashboard Renderer ---
  const renderSupervisorDashboard = () => {
    const { metrics, servicesData, slaData } = extraData || {};

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#111827] tracking-tight">Supervisor Dashboard</h1>
            <p className="text-xs text-[#717171] mt-1">Akses pengawasan menyeluruh terhadap performa operasional.</p>
          </div>
        </div>

        {/* 1. Metric Cards */}
        {metrics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-[#DDDDDD] shadow-sm">
              <CardContent className="pt-5">
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 rounded-xl bg-[#F7F7F7] border border-[#DDDDDD] flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5 text-[#717171]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#717171] uppercase tracking-wider">Total Berkas</p>
                    <p className="text-3xl font-extrabold tracking-tight text-[#222222] mt-0.5">{metrics.total}</p>
                    <p className="text-[10px] text-[#717171] font-semibold mt-1">Seluruh berkas masuk</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#DDDDDD] shadow-sm">
              <CardContent className="pt-5">
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                    <Activity className="h-5 w-5 text-[#3B82F6]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#717171] uppercase tracking-wider">Dalam Proses</p>
                    <p className="text-3xl font-extrabold tracking-tight text-[#222222] mt-0.5">{metrics.inProgress}</p>
                    <p className="text-[10px] text-[#3B82F6] font-semibold mt-1">Sedang dikerjakan/dikirim</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#DDDDDD] shadow-sm">
              <CardContent className="pt-5">
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-[#10B981]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#717171] uppercase tracking-wider">Selesai</p>
                    <p className="text-3xl font-extrabold tracking-tight text-[#222222] mt-0.5">{metrics.completed}</p>
                    <p className="text-[10px] text-[#10B981] font-semibold mt-1">Selesai secara permanen</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#DDDDDD] shadow-sm">
              <CardContent className="pt-5">
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-[#F59E0B]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#717171] uppercase tracking-wider">Rasio Revisi</p>
                    <p className="text-3xl font-extrabold tracking-tight text-[#222222] mt-0.5">{metrics.revisionRatio}%</p>
                    <p className="text-[10px] text-[#F59E0B] font-semibold mt-1">Berkas bermasalah</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 2. Charts Grid */}
        {servicesData && slaData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Service Type Bar Chart (Clay Blue) */}
            <Card className="border-[#DDDDDD] shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-[#222222] flex items-center gap-1.5 uppercase tracking-wider">
                  <BarChart3 className="h-4 w-4 text-[#2563EB]" /> Distribusi Layanan
                </CardTitle>
                <CardDescription className="text-xs">Jumlah berkas permohonan berdasarkan jenis pelayanan PBB.</CardDescription>
              </CardHeader>
              <CardContent className="h-80 pt-2">
                {servicesData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-[#717171] italic">Belum ada data permohonan.</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={servicesData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                      <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#717171', fontWeight: 600 }} interval={0} angle={-15} textAnchor="end" />
                      <YAxis tick={{ fontSize: 10, fill: '#717171' }} allowDecimals={false} />
                      <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid #DDDDDD' }} cursor={{ fill: '#F7F7F7' }} />
                      <Bar dataKey="value" name="Jumlah Berkas" fill="#2563EB" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Completion Trend Line Chart (Green Line) */}
            <Card className="border-[#DDDDDD] shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-[#222222] flex items-center gap-1.5 uppercase tracking-wider">
                  <TrendingUp className="h-4 w-4 text-[#10B981]" /> Kecepatan Penyelesaian (SLA)
                </CardTitle>
                <CardDescription className="text-xs">Jumlah berkas yang berstatus COMPLETED selama 7 hari terakhir.</CardDescription>
              </CardHeader>
              <CardContent className="h-80 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={slaData.completionTrend} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#717171', fontWeight: 600 }} />
                    <YAxis tick={{ fontSize: 10, fill: '#717171' }} allowDecimals={false} />
                    <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid #DDDDDD' }} />
                    <Line type="monotone" dataKey="jumlah" name="Berkas Selesai" stroke="#10B981" strokeWidth={2.5} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 3. Bottleneck Detector (Red Pulsing badge warning list) */}
        {slaData && (
          <Card className="border-[#DDDDDD] shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-[#222222] flex items-center gap-1.5 uppercase tracking-wider">
                <Flame className="h-4 w-4 text-[#F59E0B]" /> Bottleneck Detector
              </CardTitle>
              <CardDescription className="text-xs">Pantau antrean berkas menumpuk di setiap tahap kerja berdasarkan batas SLA.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-[#F7F7F7]">
                  <TableRow className="border-b border-[#DDDDDD] hover:bg-[#F7F7F7]">
                    <TableHead className="font-bold text-[#222222] pl-6 text-xs uppercase tracking-wider">Tahap Pemrosesan</TableHead>
                    <TableHead className="font-bold text-[#222222] text-xs uppercase tracking-wider w-[200px]">Antrean Berkas</TableHead>
                    <TableHead className="font-bold text-[#222222] text-xs uppercase tracking-wider w-[200px]">Rata-rata Waktu SLA</TableHead>
                    <TableHead className="font-bold text-[#222222] text-xs uppercase tracking-wider w-[180px] text-right pr-6">Status Hambatan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {slaData.stages.map((stage: any, idx: number) => {
                    const isBottleneck = stage.status.includes('Menumpuk') || stage.waitingCount > 5;
                    return (
                      <TableRow key={idx} className="border-b border-[#DDDDDD] hover:bg-[#F7F7F7]/30 transition-colors">
                        <TableCell className="font-bold text-[#222222] pl-6 text-xs">{stage.tahap}</TableCell>
                        <TableCell>
                          <span className={`text-xs font-bold ${isBottleneck ? 'text-rose-600' : 'text-[#222222]'}`}>
                            {stage.waitingCount} Berkas
                          </span>
                        </TableCell>
                        <TableCell className="font-semibold text-xs text-[#717171]">{stage.avgDays.toFixed(1)} Hari</TableCell>
                        <TableCell className="text-right pr-6">
                          <span
                            className={`inline-flex items-center gap-1 text-[9px] font-bold px-2.5 py-1 rounded border uppercase tracking-wider ${isBottleneck
                              ? 'border-rose-200 bg-rose-50 text-rose-700 animate-pulse'
                              : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                              }`}
                          >
                            {isBottleneck ? '⚠️ Menumpuk' : 'Lancar'}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderDefaultDashboard = () => {
    return (
      <div className="p-8 text-center text-slate-500">
        <p className="font-bold">Selamat Datang di Architax</p>
        <p className="text-xs mt-1">Silakan pilih menu sidebar untuk memulai.</p>
      </div>
    );
  };

  // Switch display output based on UserRole
  switch (userRole) {
    case 'STAF_PENGINPUT':
      return renderPenginputDashboard();
    case 'STAF_PENELITI':
      return renderPenelitiDashboard();
    case 'STAF_PENGARSIP':
      return renderPengarsipDashboard();
    case 'STAF_PENGIRIM':
      return renderPengirimDashboard();
    case 'STAF_PEMANTAU':
      return renderPemantauDashboard();
    case 'SUPERVISOR':
      return renderSupervisorDashboard();
    default:
      return renderDefaultDashboard();
  }
}
