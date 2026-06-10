// src/components/forms/monitoring-workspace.tsx
'use client';

import * as React from 'react';
import { Bundle, Permohonan, BundleStatus, ApplicationStatus } from '@prisma/client';
import { togglePermohonanCompletionAction } from '@/actions/permohonan.actions';
import { completeBundleAction } from '@/actions/bundle.actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { 
  Loader2, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  Check, 
  FileSearch,
  CheckSquare,
  Activity,
  Phone,
  MapPin,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

function formatNop(nop: string): string {
  const clean = nop.replace(/\D/g, '');
  if (clean.length !== 18) return nop;
  return `${clean.slice(0, 2)}.${clean.slice(2, 4)}.${clean.slice(4, 7)}.${clean.slice(7, 10)}.${clean.slice(10, 13)}-${clean.slice(13, 17)}.${clean.slice(17, 18)}`;
}

interface MonitoringWorkspaceProps {
  bundle: Bundle & { items: (Permohonan & { scanFiles: any[] })[] };
  userRole: string;
}

export function MonitoringWorkspace({ bundle, userRole }: MonitoringWorkspaceProps) {
  const router = useRouter();
  const [activeItem, setActiveItem] = React.useState<number>(0);
  const [isPending, startTransition] = React.useTransition();
  const [previewKey, setPreviewKey] = React.useState<string | null>(null);

  const activePermohonan = bundle.items[activeItem];

  // Calculations
  const totalItemsCount = bundle.items.length;
  const completedItemsCount = bundle.items.filter(item => item.status === ApplicationStatus.COMPLETED).length;
  const progressPercent = totalItemsCount > 0 ? (completedItemsCount / totalItemsCount) * 100 : 0;
  
  const is100Percent = completedItemsCount === totalItemsCount;
  const isPemantau = userRole === 'STAF_PEMANTAU';
  const isBundleCompleted = bundle.status === BundleStatus.COMPLETED;

  const handleToggleCompletion = (permohonanId: string, nomorBerkas: string) => {
    if (!isPemantau) {
      toast.error('Anda tidak memiliki wewenang untuk memperbarui progress permohonan.');
      return;
    }

    if (confirm(`Apakah Anda yakin ingin menyelesaikan permohonan ${nomorBerkas}?\nTindakan ini akan mengirimkan notifikasi WhatsApp ke pemohon dan bersifat PERMANEN (tidak dapat dibatalkan).`)) {
      startTransition(async () => {
        try {
          const result = await togglePermohonanCompletionAction(permohonanId);
          if (result.success) {
            toast.success(`Permohonan ${nomorBerkas} berhasil diselesaikan (COMPLETED)`);
            router.refresh();
          } else {
            toast.error(result.error || 'Gagal menyelesaikan permohonan');
          }
        } catch (error: any) {
          toast.error(error.message || 'Terjadi kesalahan sistem');
        }
      });
    }
  };

  const handleCompleteBundle = () => {
    if (!is100Percent) {
      toast.error('Seluruh permohonan harus diselesaikan terlebih dahulu.');
      return;
    }

    if (!isPemantau) {
      toast.error('Hanya Staf Pemantau yang berwenang menyelesaikan bundle.');
      return;
    }

    if (confirm('Apakah Anda yakin ingin menyelesaikan bundle ini? Status bundle akan diubah menjadi COMPLETED.')) {
      startTransition(async () => {
        try {
          const result = await completeBundleAction(bundle.id);
          if (result.success) {
            toast.success('Bundle berhasil diselesaikan secara permanen.');
            router.push('/monitoring');
            router.refresh();
          } else {
            toast.error(result.error || 'Gagal menyelesaikan bundle');
          }
        } catch (error: any) {
          toast.error(error.message || 'Terjadi kesalahan sistem');
        }
      });
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* 1. Progress Overview Card */}
      <Card className="border-[#DDDDDD] shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-base font-bold text-[#222222]">
                Progres Penyelesaian: {bundle.bundleNumber}
              </CardTitle>
              <CardDescription>
                Tandai berkas permohonan satu per satu menjadi COMPLETED setelah diproses di sistem pusat.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#222222]">
                {completedItemsCount} / {totalItemsCount} Selesai
              </span>
              <span className="text-xs text-[#717171]">({progressPercent.toFixed(0)}%)</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={progressPercent} className="h-2.5 bg-[#DDDDDD]" style={{ '--progress-background': '#10B981' } as any} />
        </CardContent>
      </Card>

      {/* 2. Split Screen Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-[650px]">
        {/* LEFT COLUMN: Bundle Items List (4/12 width) */}
        <div className="lg:col-span-4 bg-white border border-[#DDDDDD] rounded-xl shadow-sm flex flex-col overflow-hidden h-[250px] lg:h-full">
          <div className="px-6 py-4 border-b border-[#DDDDDD] bg-[#F7F7F7] flex-shrink-0 flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#222222]">Daftar Berkas Permohonan</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-[#FF385C]/10 text-[#FF385C] rounded-md uppercase">
              {bundle.serviceType.replace(/_/g, ' ')}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-[#DDDDDD]">
            {bundle.items.map((item, idx) => {
              const isActive = idx === activeItem;
              const isItemCompleted = item.status === ApplicationStatus.COMPLETED;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveItem(idx);
                    setPreviewKey(null);
                  }}
                  className={`w-full text-left px-6 py-4 flex items-center justify-between transition-colors ${
                    isActive ? 'bg-[#FF385C]/5 border-l-4 border-l-[#FF385C]' : 'hover:bg-[#F7F7F7]/50 border-l-4 border-l-transparent'
                  }`}
                >
                  <div className="overflow-hidden pr-2">
                    <p className="font-bold text-sm text-[#222222] truncate">{item.nomorBerkas}</p>
                    <p className="text-xs text-[#717171] font-semibold mt-0.5 truncate">{item.oldOwnerName || 'Tanpa Nama'}</p>
                    <p className="font-mono text-[10px] text-[#717171] mt-0.5">NOP: {formatNop(item.nop)}</p>
                  </div>
                  <div className="flex-shrink-0">
                    {isItemCompleted ? (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 uppercase">
                        <Check className="h-2.5 w-2.5" /> Selesai
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-200 bg-indigo-50 text-indigo-700 uppercase">
                        <Activity className="h-2.5 w-2.5" /> Proses
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Detail Workspace (8/12 width) */}
        <div className="lg:col-span-8 bg-white border border-[#DDDDDD] rounded-xl shadow-sm flex flex-col overflow-hidden h-[500px] lg:h-full">
          {activePermohonan ? (
            <div className="flex flex-col h-full overflow-hidden">
              {/* Header Info */}
              <div className="px-6 py-4 border-b border-[#DDDDDD] bg-[#F7F7F7] flex justify-between items-center flex-shrink-0">
                <div>
                  <h3 className="text-sm font-bold text-[#222222]">{activePermohonan.nomorBerkas}</h3>
                  <p className="text-xs text-[#717171] font-semibold mt-0.5">NOP: {formatNop(activePermohonan.nop)}</p>
                </div>
                <div>
                  {activePermohonan.status === ApplicationStatus.COMPLETED ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-3 py-1 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 uppercase tracking-wider">
                      <CheckCircle2 className="h-3 w-3" /> COMPLETED (PERMANEN)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-3 py-1 rounded-full border border-indigo-200 bg-indigo-50 text-indigo-700 uppercase tracking-wider">
                      <Activity className="h-3 w-3" /> SENT TO CENTER
                    </span>
                  )}
                </div>
              </div>

              {/* Detail Info Panel (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* 1. Toggle Completion Card (only for Staf Pemantau) */}
                {isPemantau && (
                  <div className="p-4 border border-[#DDDDDD] bg-[#F9FAFB] rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-[#222222]">Ubah Status Penyelesaian</h4>
                      <p className="text-xs text-[#717171] mt-0.5">
                        Tandai berkas ini sebagai COMPLETED jika telah selesai diproses di KPP Pratama/Sistem Pusat.
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-[#717171]">
                        {activePermohonan.status === ApplicationStatus.COMPLETED ? 'Selesai' : 'Belum Selesai'}
                      </span>
                      <Switch
                        checked={activePermohonan.status === ApplicationStatus.COMPLETED}
                        onCheckedChange={() => handleToggleCompletion(activePermohonan.id, activePermohonan.nomorBerkas)}
                        disabled={activePermohonan.status === ApplicationStatus.COMPLETED || isPending || isBundleCompleted}
                      />
                    </div>
                  </div>
                )}

                {/* 2. Informational Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-[#DDDDDD] rounded-xl space-y-2">
                    <h5 className="text-xs font-bold text-[#717171] uppercase tracking-wider flex items-center gap-1">
                      <Layers className="h-3.5 w-3.5 text-[#FF385C]" /> Data Pemilik Lama
                    </h5>
                    <div className="text-xs space-y-1">
                      <p><strong className="text-[#222222]">Nama:</strong> {activePermohonan.oldOwnerName || '-'}</p>
                      <p><strong className="text-[#222222]">Alamat:</strong> {
                        [
                          activePermohonan.oldOwnerStreet,
                          activePermohonan.oldOwnerBlock ? `Blok ${activePermohonan.oldOwnerBlock}` : '',
                          activePermohonan.oldOwnerRt ? `RT ${activePermohonan.oldOwnerRt}` : '',
                          activePermohonan.oldOwnerRw ? `RW ${activePermohonan.oldOwnerRw}` : '',
                          activePermohonan.oldOwnerVillage,
                          activePermohonan.oldOwnerDistrict
                        ].filter(Boolean).join(', ') || '-'
                      }</p>
                      <p><strong className="text-[#222222]">Nomor HP Pemohon:</strong> {activePermohonan.applicantPhone || '-'}</p>
                    </div>
                  </div>

                  <div className="p-4 border border-[#DDDDDD] rounded-xl space-y-2">
                    <h5 className="text-xs font-bold text-[#717171] uppercase tracking-wider flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-[#FF385C]" /> Letak Objek Pajak
                    </h5>
                    <div className="text-xs space-y-1">
                      <p><strong className="text-[#222222]">Alamat OP:</strong> {
                        [
                          activePermohonan.oldPropertyStreet,
                          activePermohonan.oldPropertyBlock ? `Blok ${activePermohonan.oldPropertyBlock}` : '',
                          activePermohonan.oldPropertyRt ? `RT ${activePermohonan.oldPropertyRt}` : '',
                          activePermohonan.oldPropertyRw ? `RW ${activePermohonan.oldPropertyRw}` : '',
                          activePermohonan.oldPropertyVillage,
                          activePermohonan.oldPropertyDistrict
                        ].filter(Boolean).join(', ') || '-'
                      }</p>
                      <p><strong className="text-[#222222]">Luas Tanah:</strong> {activePermohonan.oldLandArea ? `${activePermohonan.oldLandArea} m²` : '-'}</p>
                      <p><strong className="text-[#222222]">Luas Bangunan:</strong> {activePermohonan.oldBuildingArea ? `${activePermohonan.oldBuildingArea} m²` : '-'}</p>
                    </div>
                  </div>
                </div>

                {/* 3. Mutasi Sebagian Details */}
                {activePermohonan.serviceType === 'MUTASI_SEBAGIAN' && activePermohonan.details && activePermohonan.details.length > 0 && (
                  <div className="border border-[#DDDDDD] rounded-xl overflow-hidden">
                    <div className="bg-[#F7F7F7] px-4 py-2 border-b border-[#DDDDDD]">
                      <h5 className="text-xs font-bold text-[#222222] uppercase tracking-wider">
                        Rincian Pecahan Objek Pajak Baru ({activePermohonan.details.length} Calon OP)
                      </h5>
                    </div>
                    <div className="divide-y divide-[#DDDDDD]">
                      {activePermohonan.details.map((detail: any, dIdx: number) => (
                        <div key={dIdx} className="p-4 text-xs space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#FF385C]">Calon OP #{dIdx + 1}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-[#F0F0F0] text-[#717171] rounded-md">
                              Bukti: {detail.ownershipProof}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div>
                              <p><strong className="text-[#222222]">Nama Wajib Pajak Baru:</strong> {detail.newOwnerName}</p>
                              <p><strong className="text-[#222222]">Alamat WP Baru:</strong> {
                                [
                                  detail.newOwnerStreet,
                                  detail.newOwnerBlock ? `Blok ${detail.newOwnerBlock}` : '',
                                  detail.newOwnerRt ? `RT ${detail.newOwnerRt}` : '',
                                  detail.newOwnerRw ? `RW ${detail.newOwnerRw}` : '',
                                  detail.newOwnerVillage,
                                  detail.newOwnerDistrict
                                ].filter(Boolean).join(', ')
                              }</p>
                            </div>
                            <div>
                              <p><strong className="text-[#222222]">Alamat OP Baru:</strong> {
                                [
                                  detail.newPropertyStreet,
                                  detail.newPropertyBlock ? `Blok ${detail.newPropertyBlock}` : '',
                                  detail.newPropertyRt ? `RT ${detail.newPropertyRt}` : '',
                                  detail.newPropertyRw ? `RW ${detail.newPropertyRw}` : '',
                                  detail.newPropertyVillage,
                                  detail.newPropertyDistrict
                                ].filter(Boolean).join(', ')
                              }</p>
                              <p><strong className="text-[#222222]">Luas Tanah Baru:</strong> {detail.newLandArea} m²</p>
                              <p><strong className="text-[#222222]">Luas Bangunan Baru:</strong> {detail.newBuildingArea} m²</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Scan Files */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-[#222222] uppercase tracking-wider flex items-center gap-1">
                    <FileText className="h-4 w-4 text-[#FF385C]" /> Berkas Scan Arsip
                  </h4>
                  {activePermohonan.scanFiles.length === 0 ? (
                    <p className="text-xs text-[#717171] italic">Tidak ada berkas scan yang diunggah.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {activePermohonan.scanFiles.map((file) => (
                        <div key={file.fileId} className="flex items-center justify-between p-3 border border-[#DDDDDD] rounded-xl text-xs bg-white">
                          <div className="truncate pr-2">
                            <p className="font-bold text-[#222222] truncate">{file.fileName}</p>
                            <p className="text-[10px] text-[#717171]">{(file.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                          <Button
                            variant="ghost"
                            onClick={() => setPreviewKey(file.storageKey)}
                            className="text-[#FF385C] hover:text-[#E31C5F] hover:bg-[#FF385C]/5 p-2 h-8 w-8 rounded-lg flex-shrink-0"
                            title="Preview"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 5. PDF & Image Preview Frame */}
                {previewKey && (
                  <div className="border border-[#DDDDDD] rounded-xl overflow-hidden bg-[#F7F7F7]">
                    <div className="bg-[#222222] text-white px-4 py-2 text-xs flex justify-between items-center">
                      <span className="font-bold flex items-center gap-1">
                        <FileSearch className="h-4 w-4" /> Preview Berkas Arsip
                      </span>
                      <Button
                        variant="ghost"
                        onClick={() => setPreviewKey(null)}
                        className="text-white hover:text-white hover:bg-white/10 h-7 px-2 text-[10px] rounded-md"
                      >
                        Tutup Preview
                      </Button>
                    </div>
                    <div className="h-64 flex items-center justify-center relative bg-white">
                      {previewKey.endsWith('.pdf') ? (
                        <iframe
                          src={`/api/files/download?key=${previewKey}`}
                          className="w-full h-full"
                          title="Secure PDF View"
                        />
                      ) : (
                        <img
                          src={`/api/files/download?key=${previewKey}`}
                          alt="Secure Image Preview"
                          className="max-h-full max-w-full object-contain"
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-[#717171] p-6 text-center">
              <FileSearch className="h-12 w-12 text-[#DDDDDD] mb-2" />
              <p className="text-sm font-bold">Pilih berkas di panel kiri</p>
              <p className="text-xs">untuk memvalidasi dan memproses data permohonan</p>
            </div>
          )}
        </div>
      </div>

      {/* 3. Bottom Panel Workspace Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-[#DDDDDD] p-6 rounded-xl shadow-sm flex-shrink-0">
        <div className="flex items-center gap-2">
          {is100Percent ? (
            <span className="text-xs font-bold text-[#10B981] flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" /> Lengkap (100% berkas selesai)
            </span>
          ) : (
            <span className="text-xs font-bold text-[#717171] flex items-center gap-1">
              <AlertCircle className="h-4 w-4" /> Belum Lengkap ({completedItemsCount} dari {totalItemsCount} berkas selesai)
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            href="/monitoring"
            className="flex-1 sm:flex-none border border-[#DDDDDD] hover:bg-[#F7F7F7] text-[#222222] font-semibold rounded-lg h-11 px-6 flex items-center justify-center gap-1 text-sm transition-colors"
          >
            Kembali
          </Link>

          {isPemantau && !isBundleCompleted && (
            <Button
              onClick={handleCompleteBundle}
              disabled={isPending || !is100Percent}
              className="flex-1 sm:flex-none bg-[#FF385C] hover:bg-[#E31C5F] text-white font-semibold rounded-lg h-11 px-8 flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckSquare className="h-5 w-5" />}
              Selesaikan Bundle (Final)
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
