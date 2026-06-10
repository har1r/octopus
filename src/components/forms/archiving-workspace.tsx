// src/components/forms/archiving-workspace.tsx
'use client';

import * as React from 'react';
import { Bundle, Permohonan, BundleStatus } from '@prisma/client';
import { approveBundleArchivingAction, reExamineBundleAction } from '@/actions/bundle.actions';
import { uploadScanFileAction, deleteScanFileAction } from '@/actions/permohonan.actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { 
  Loader2, 
  Upload, 
  Trash2, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  ArrowLeftRight, 
  Check, 
  FileSearch 
} from 'lucide-react';
import Link from 'next/link';

function formatNop(nop: string): string {
  const clean = nop.replace(/\D/g, '');
  if (clean.length !== 18) return nop;
  return `${clean.slice(0, 2)}.${clean.slice(2, 4)}.${clean.slice(4, 7)}.${clean.slice(7, 10)}.${clean.slice(10, 13)}-${clean.slice(13, 17)}.${clean.slice(17, 18)}`;
}

interface ArchivingWorkspaceProps {
  bundle: Bundle & { items: (Permohonan & { scanFiles: any[] })[] };
  userRole: string;
}

export function ArchivingWorkspace({ bundle, userRole }: ArchivingWorkspaceProps) {
  const router = useRouter();
  const [activeItem, setActiveItem] = React.useState<number>(0);
  const [isPending, startTransition] = React.useTransition();
  const [previewKey, setPreviewKey] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const activePermohonan = bundle.items[activeItem];

  // Calculate upload progress
  const totalItemsCount = bundle.items.length;
  const uploadedItemsCount = bundle.items.filter(item => item.scanFiles.length > 0).length;
  const progressPercent = totalItemsCount > 0 ? (uploadedItemsCount / totalItemsCount) * 100 : 0;
  
  const is100Percent = uploadedItemsCount === totalItemsCount;
  const isPengarsip = userRole === 'STAF_PENGARSIP';

  // Handle simulated file upload via presigned URL pattern
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activePermohonan) return;

    // Client-side validations (BR-022 & BR-023)
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Format file tidak didukung! Hanya PDF, JPG, dan PNG.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 5 MB.');
      return;
    }

    startTransition(async () => {
      try {
        // Step 1: Request simulated presigned upload URL
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

        // Step 2: Upload file binary directly to uploadUrl
        const uploadRes = await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type },
        });

        if (!uploadRes.ok) {
          throw new Error('Gagal mengunggah file binary ke storage server');
        }

        // Step 3: Complete upload metadata save on Permohonan
        const fileId = Math.random().toString(36).substring(2, 9);
        const metadataRes = await uploadScanFileAction(activePermohonan.id, {
          fileId,
          fileName: file.name,
          storageKey,
          mimeType: file.type,
          fileSize: file.size,
        });

        if (metadataRes.success) {
          toast.success(`File ${file.name} berhasil diunggah`);
          router.refresh();
        } else {
          throw new Error(metadataRes.error || 'Gagal menyimpan metadata file');
        }
      } catch (error: any) {
        toast.error(error.message || 'Gagal mengunggah file scan');
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    });
  };

  const handleDeleteScan = (scanId: string, fileName: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus scan file ${fileName}?`)) {
      startTransition(async () => {
        try {
          const result = await deleteScanFileAction(activePermohonan.id, scanId);
          if (result.success) {
            toast.success(`Scan ${fileName} berhasil dihapus`);
            if (previewKey && activePermohonan.scanFiles.find(f => f.fileId === scanId)?.storageKey === previewKey) {
              setPreviewKey(null);
            }
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

  const handleApproveArchive = () => {
    if (!is100Percent) return;
    if (confirm('Apakah Anda yakin seluruh berkas telah lengkap diarsip? Status bundle akan diubah menjadi READY_TO_SHIP.')) {
      startTransition(async () => {
        try {
          const result = await approveBundleArchivingAction(bundle.id);
          if (result.success) {
            toast.success('Pengarsipan bundle disetujui');
            router.push('/arsip');
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

  const handleReturnToPeneliti = () => {
    if (confirm('Apakah Anda yakin ingin mengembalikan bundle ini ke tahap Penelitian berkas (RE_EXAMINE)?')) {
      startTransition(async () => {
        try {
          const result = await reExamineBundleAction(bundle.id);
          if (result.success) {
            toast.success('Bundle berhasil dikembalikan ke penelitian');
            router.push('/arsip');
            router.refresh();
          } else {
            toast.error(result.error || 'Gagal mengembalikan bundle');
          }
        } catch (error: any) {
          toast.error(error.message || 'Terjadi kesalahan');
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
                Progres Pengarsipan: {bundle.bundleNumber}
              </CardTitle>
              <CardDescription>
                Unggah hasil scan kelengkapan untuk seluruh berkas di bawah ini
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#222222]">
                {uploadedItemsCount} / {totalItemsCount} Terarsip
              </span>
              <span className="text-xs text-[#717171]">({progressPercent.toFixed(0)}%)</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={progressPercent} className="h-2.5 bg-[#DDDDDD]" style={{ '--progress-background': '#FF385C' } as any} />
        </CardContent>
      </Card>

      {/* 2. Split Screen Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-auto lg:h-[550px]">
        {/* LEFT SCREEN: Bundle Items List */}
        <div className="bg-white border border-[#DDDDDD] rounded-xl shadow-sm flex flex-col overflow-hidden h-[250px] lg:h-full">
          <div className="px-6 py-4 border-b border-[#DDDDDD] bg-[#F7F7F7] flex-shrink-0">
            <h3 className="text-sm font-bold text-[#222222]">Daftar Berkas Permohonan</h3>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-[#DDDDDD]">
            {bundle.items.map((item, idx) => {
              const isActive = idx === activeItem;
              const isUploaded = item.scanFiles.length > 0;

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
                  <div>
                    <p className="font-bold text-sm text-[#222222]">{item.nomorBerkas}</p>
                    <p className="text-xs text-[#717171] font-semibold mt-0.5">{item.oldOwnerName || 'Tanpa Nama'}</p>
                    <p className="font-mono text-[10px] text-[#717171] mt-0.5">NOP: {formatNop(item.nop)}</p>
                  </div>
                  <div>
                    {isUploaded ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 uppercase">
                        <Check className="h-3 w-3" /> Terupload
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-200 bg-rose-50 text-rose-700 uppercase">
                        Belum Upload
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT SCREEN: Upload & Previews */}
        <div className="bg-white border border-[#DDDDDD] rounded-xl shadow-sm flex flex-col overflow-hidden h-[400px] lg:h-full">
          {activePermohonan ? (
            <div className="flex flex-col h-full">
              {/* Active Item Title Header */}
              <div className="px-6 py-4 border-b border-[#DDDDDD] bg-[#F7F7F7] flex justify-between items-center flex-shrink-0">
                <div>
                  <h3 className="text-sm font-bold text-[#222222]">{activePermohonan.nomorBerkas}</h3>
                  <p className="text-xs text-[#717171] font-semibold mt-0.5">Pemilik: {activePermohonan.oldOwnerName || '-'}</p>
                </div>
              </div>

              {/* Upload Workspace Scroll Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* 1. Upload box */}
                {isPengarsip && (
                  <div className="border-2 border-dashed border-[#DDDDDD] rounded-xl p-6 text-center hover:bg-[#F7F7F7]/50 transition-colors relative">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      disabled={isPending}
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload className="h-8 w-8 text-[#FF385C] mx-auto mb-2" />
                    <p className="text-sm font-bold text-[#222222]">Klik atau Seret Berkas Di Sini</p>
                    <p className="text-xs text-[#717171] mt-1">Hanya mendukung format PDF, JPG, dan PNG (Maksimal 5 MB)</p>
                    {isPending && (
                      <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-xl">
                        <Loader2 className="h-6 w-6 animate-spin text-[#FF385C]" />
                      </div>
                    )}
                  </div>
                )}

                {/* 2. File list */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-[#222222] uppercase tracking-wider">Dokumen Terupload</h4>
                  {activePermohonan.scanFiles.length === 0 ? (
                    <p className="text-xs text-[#717171] italic py-2">Belum ada dokumen scan terunggah.</p>
                  ) : (
                    <div className="space-y-2">
                      {activePermohonan.scanFiles.map((file) => (
                        <div key={file.fileId} className="flex items-center justify-between p-3 border border-[#DDDDDD] rounded-xl text-sm">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <FileText className="h-5 w-5 text-[#FF385C] flex-shrink-0" />
                            <div className="truncate">
                              <p className="font-bold text-[#222222] truncate">{file.fileName}</p>
                              <p className="text-[10px] text-[#717171] font-medium">
                                {(file.fileSize / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <Button
                              variant="ghost"
                              onClick={() => setPreviewKey(file.storageKey)}
                              className="text-[#FF385C] hover:text-[#E31C5F] hover:bg-[#FF385C]/5 p-2 h-9 w-9 rounded-lg"
                              title="Preview File"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {isPengarsip && (
                              <Button
                                variant="ghost"
                                onClick={() => handleDeleteScan(file.fileId, file.fileName)}
                                disabled={isPending}
                                className="text-[#EF4444] hover:text-[#EF4444] hover:bg-[#EF4444]/5 p-2 h-9 w-9 rounded-lg"
                                title="Hapus File"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3. Secure File Preview Frame */}
                {previewKey && (
                  <div className="border border-[#DDDDDD] rounded-xl overflow-hidden bg-[#F7F7F7]">
                    <div className="bg-[#222222] text-white px-4 py-2 text-xs flex justify-between items-center">
                      <span className="font-bold flex items-center gap-1">
                        <FileSearch className="h-4 w-4" /> Preview Dokumen
                      </span>
                      <Button
                        variant="ghost"
                        onClick={() => setPreviewKey(null)}
                        className="text-white hover:text-white hover:bg-white/10 h-7 px-2 text-[10px] rounded-md"
                      >
                        Tutup Preview
                      </Button>
                    </div>
                    <div className="h-64 flex items-center justify-center relative">
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
              <p className="text-xs">untuk melihat scan file dan mengunggah dokumen arsip</p>
            </div>
          )}
        </div>
      </div>

      {/* 3. Bottom Panel Workspace Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-[#DDDDDD] p-6 rounded-xl shadow-sm flex-shrink-0">
        <div className="flex items-center gap-2">
          {is100Percent ? (
            <span className="text-xs font-bold text-[#10B981] flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" /> Lengkap (100% scan terupload)
            </span>
          ) : (
            <span className="text-xs font-bold text-[#EF4444] flex items-center gap-1">
              <AlertCircle className="h-4 w-4" /> Belum Lengkap (Ada berkas kosong)
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {isPengarsip && (
            <Button
              onClick={handleReturnToPeneliti}
              disabled={isPending}
              variant="outline"
              className="flex-1 sm:flex-none border-[#EF4444] text-[#EF4444] hover:bg-[#EF4444]/5 font-semibold rounded-lg h-11 px-6 flex items-center justify-center gap-1.5"
            >
              <ArrowLeftRight className="h-5 w-5" />
              Kembalikan ke Peneliti
            </Button>
          )}
          {isPengarsip && (
            <Button
              onClick={handleApproveArchive}
              disabled={isPending || !is100Percent}
              className="flex-1 sm:flex-none bg-[#FF385C] hover:bg-[#E31C5F] text-white font-semibold rounded-lg h-11 px-8 flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-5 w-5" />}
              Setujui Arsip Bundle
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
