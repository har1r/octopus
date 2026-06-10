// src/components/kanban/shipping-kanban.tsx
'use client';

import * as React from 'react';
import { Bundle, Manifest, ManifestStatus } from '@prisma/client';
import { 
  addBundleToManifestAction, 
  removeBundleFromManifestAction, 
  uploadSignedProofAction, 
  approveManifestAction 
} from '@/actions/manifest.actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { 
  Loader2, 
  FileText, 
  ArrowRight, 
  ArrowLeft, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  ShieldCheck, 
  Eye, 
  FileSearch, 
  Truck 
} from 'lucide-react';

interface ShippingKanbanProps {
  manifest: Manifest;
  manifestBundles: Bundle[];
  availableBundles: Bundle[];
}

export function ShippingKanban({ manifest, manifestBundles, availableBundles }: ShippingKanbanProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [draggedId, setDraggedId] = React.useState<string | null>(null);
  const [previewKey, setPreviewKey] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Column A: Ready to Ship bundles (not in this manifest)
  const readyColumn = availableBundles;
  
  // Column B: Bundles in active manifest
  const manifestColumn = manifestBundles;

  // Move bundle from Column A to Column B
  const moveRight = (bundleId: string) => {
    startTransition(async () => {
      try {
        const result = await addBundleToManifestAction(manifest.id, bundleId);
        if (result.success) {
          toast.success('Bundle ditambahkan ke manifest');
          router.refresh();
        } else {
          toast.error(result.error || 'Gagal menambahkan bundle');
        }
      } catch (error: any) {
        toast.error(error.message || 'Terjadi kesalahan');
      }
    });
  };

  // Move bundle from Column B to Column A (triggers Shipping Rollback!)
  const moveLeft = (bundleId: string, bundleNumber: string) => {
    if (confirm(`Apakah Anda yakin ingin mengeluarkan bundle ${bundleNumber} dari manifest? Bukti tanda tangan yang ada akan dihapus dan status bundle akan diturunkan ke RE_EXAMINE.`)) {
      startTransition(async () => {
        try {
          const result = await removeBundleFromManifestAction(manifest.id, bundleId);
          if (result.success) {
            toast.success(`Bundle ${bundleNumber} berhasil dikeluarkan (Demoted to RE_EXAMINE)`);
            router.refresh();
          } else {
            toast.error(result.error || 'Gagal mengeluarkan bundle');
          }
        } catch (error: any) {
          toast.error(error.message || 'Terjadi kesalahan');
        }
      });
    }
  };

  // HTML5 Drag and Drop handlers
  const handleDragStart = (id: string, source: 'ready' | 'manifest') => {
    setDraggedId(JSON.stringify({ id, source }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, target: 'ready' | 'manifest') => {
    e.preventDefault();
    if (!draggedId) return;

    const { id, source } = JSON.parse(draggedId);
    setDraggedId(null);

    if (source === 'ready' && target === 'manifest') {
      moveRight(id);
    } else if (source === 'manifest' && target === 'ready') {
      const bundleNumber = manifestBundles.find(b => b.id === id)?.bundleNumber || '';
      moveLeft(id, bundleNumber);
    }
  };

  // Proof Upload handler (calls simulated storage URL)
  const handleProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    startTransition(async () => {
      try {
        // Step 1: Request presign
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

        // Step 2: Upload file binary
        const uploadRes = await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type },
        });

        if (!uploadRes.ok) {
          throw new Error('Gagal mengunggah file binary ke storage server');
        }

        // Step 3: Complete upload metadata save on Manifest
        const signedProofUrl = `/api/files/download?key=${storageKey}`;
        const metadataRes = await uploadSignedProofAction(manifest.id, signedProofUrl);

        if (metadataRes.success) {
          toast.success(`Bukti tanda tangan ${file.name} berhasil diunggah`);
          router.refresh();
        } else {
          throw new Error(metadataRes.error || 'Gagal menyimpan metadata bukti');
        }
      } catch (error: any) {
        toast.error(error.message || 'Gagal mengunggah bukti');
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    });
  };

  const handleApproveManifest = () => {
    if (!manifest.signedProofUrl) {
      toast.error('Harap unggah bukti manifest bertanda tangan terlebih dahulu.');
      return;
    }

    if (confirm('Apakah Anda yakin ingin menyetujui manifest ini? Seluruh bundle di dalamnya akan berstatus SENT_TO_CENTER.')) {
      startTransition(async () => {
        try {
          const result = await approveManifestAction(manifest.id);
          if (result.success) {
            toast.success('Manifest berhasil disetujui untuk pengiriman');
            router.push('/manifest');
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

  return (
    <div className="space-y-6 font-sans">
      {/* Alert if changed and missing proof */}
      {manifestBundles.length > 0 && !manifest.signedProofUrl && manifest.status === ManifestStatus.DRAFT && (
        <Card className="border-amber-200 bg-amber-50 text-amber-800 flex-shrink-0">
          <CardContent className="pt-6 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="font-bold text-sm">⚠ Bukti Tanda Tangan Diperlukan</p>
              <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                Isi manifest telah berubah atau belum ditandatangani. Silakan cetak dokumen manifest dan unggah kembali bukti tanda tangan Anda.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Kanban Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[520px]">
        {/* COLUMN A: READY TO SHIP */}
        <div 
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'ready')}
          className="bg-white border border-[#DDDDDD] rounded-xl flex flex-col overflow-hidden h-[300px] lg:h-full shadow-sm"
        >
          <div className="px-6 py-4 border-b border-[#DDDDDD] bg-[#F7F7F7] flex-shrink-0 flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#222222]">READY TO SHIP ({readyColumn.length})</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {readyColumn.length === 0 ? (
              <p className="text-xs text-[#717171] italic text-center py-8">Tidak ada bundle siap kirim.</p>
            ) : (
              readyColumn.map(bundle => (
                <div
                  key={bundle.id}
                  draggable
                  onDragStart={() => handleDragStart(bundle.id, 'ready')}
                  className="bg-white border border-[#DDDDDD] hover:border-[#FF385C] rounded-xl p-4 shadow-sm cursor-grab active:cursor-grabbing flex flex-col justify-between gap-3 group relative transition-colors"
                >
                  <div>
                    <p className="font-bold text-sm text-[#222222]">{bundle.bundleNumber}</p>
                    <p className="text-xs text-[#717171] font-semibold mt-0.5">{bundle.serviceType.replace(/_/g, ' ')}</p>
                    <p className="text-[10px] text-[#717171] font-medium mt-1">{bundle.itemCount} Berkas</p>
                  </div>
                  <Button
                    onClick={() => moveRight(bundle.id)}
                    className="sm:hidden absolute top-2 right-2 text-[#717171] hover:text-[#FF385C]"
                    variant="ghost"
                    size="sm"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <button
                    onClick={() => moveRight(bundle.id)}
                    className="hidden sm:flex self-end items-center gap-1 text-[10px] font-bold text-[#FF385C] opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Pindahkan <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* COLUMN B: ACTIVE MANIFEST */}
        <div 
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'manifest')}
          className="bg-white border border-[#DDDDDD] rounded-xl flex flex-col overflow-hidden h-[300px] lg:h-full shadow-sm"
        >
          <div className="px-6 py-4 border-b border-[#DDDDDD] bg-[#F7F7F7] flex-shrink-0 flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#222222]">Manifest Baru ({manifestColumn.length})</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {manifestColumn.length === 0 ? (
              <p className="text-xs text-[#717171] italic text-center py-8">Seret bundle ke sini untuk memasukkan ke manifest.</p>
            ) : (
              manifestColumn.map(bundle => (
                <div
                  key={bundle.id}
                  draggable
                  onDragStart={() => handleDragStart(bundle.id, 'manifest')}
                  className="bg-white border border-[#DDDDDD] hover:border-[#EF4444] rounded-xl p-4 shadow-sm cursor-grab active:cursor-grabbing flex flex-col justify-between gap-3 group relative transition-colors"
                >
                  <div>
                    <p className="font-bold text-sm text-[#222222]">{bundle.bundleNumber}</p>
                    <p className="text-xs text-[#717171] font-semibold mt-0.5">{bundle.serviceType.replace(/_/g, ' ')}</p>
                    <p className="text-[10px] text-[#717171] font-medium mt-1">{bundle.itemCount} Berkas</p>
                  </div>
                  <Button
                    onClick={() => moveLeft(bundle.id, bundle.bundleNumber)}
                    className="sm:hidden absolute top-2 right-2 text-[#717171] hover:text-[#EF4444]"
                    variant="ghost"
                    size="sm"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <button
                    onClick={() => moveLeft(bundle.id, bundle.bundleNumber)}
                    className="hidden sm:flex self-end items-center gap-1 text-[10px] font-bold text-[#EF4444] opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ArrowLeft className="h-3 w-3" /> Keluarkan
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* SIDEBAR PANEL: SHIPPING ACTIONS & UPLOADS */}
        <div className="flex flex-col gap-6 h-auto lg:h-full lg:overflow-y-auto">
          {/* Manifest Info & Actions */}
          <Card className="border-[#DDDDDD] shadow-sm">
            <CardHeader className="pb-3 border-b border-[#F7F7F7]">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-[#222222]">
                <Truck className="h-4 w-4 text-[#FF385C]" /> Detail Manifest
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 text-sm">
              <div>
                <p className="text-xs text-[#717171] font-semibold">Nomor Manifest</p>
                <p className="font-bold text-[#222222] mt-0.5">{manifest.manifestNumber}</p>
              </div>
              <div>
                <p className="text-xs text-[#717171] font-semibold">Status Manifest</p>
                <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700 uppercase mt-0.5 tracking-wider">
                  {manifest.status.replace(/_/g, ' ')}
                </span>
              </div>

              <hr className="border-[#F7F7F7]" />

              {/* Upload signed proof */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#222222]">Unggah Bukti Manifest Bertanda Tangan</label>
                {manifest.signedProofUrl ? (
                  <div className="flex items-center justify-between p-2 border border-emerald-200 bg-emerald-50 rounded-lg text-emerald-800">
                    <span className="text-xs font-semibold truncate flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" /> Bukti Terupload
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          const key = manifest.signedProofUrl?.split('key=').pop() || '';
                          if (key) setPreviewKey(key);
                        }}
                        className="text-emerald-700 hover:text-emerald-800 hover:bg-emerald-100/50 p-1.5 h-8 w-8 rounded-md"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <label className="cursor-pointer text-emerald-700 hover:text-emerald-800 hover:bg-emerald-100/50 p-1.5 h-8 w-8 rounded-md flex items-center justify-center">
                        <Upload className="h-4 w-4" />
                        <input
                          type="file"
                          onChange={handleProofUpload}
                          accept=".pdf,.jpg,.jpeg,.png"
                          disabled={isPending}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="border border-dashed border-[#DDDDDD] hover:bg-[#F7F7F7]/50 rounded-lg p-4 text-center cursor-pointer relative transition-colors">
                    <input
                      type="file"
                      onChange={handleProofUpload}
                      accept=".pdf,.jpg,.jpeg,.png"
                      disabled={isPending}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload className="h-5 w-5 text-[#FF385C] mx-auto mb-1" />
                    <p className="text-xs font-bold text-[#222222]">Unggah File Tanda Tangan</p>
                    {isPending && (
                      <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-lg">
                        <Loader2 className="h-4 w-4 animate-spin text-[#FF385C]" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <hr className="border-[#F7F7F7]" />

              <Button
                onClick={handleApproveManifest}
                disabled={isPending || !manifest.signedProofUrl || manifestColumn.length === 0}
                className="w-full bg-[#FF385C] hover:bg-[#E31C5F] text-white font-semibold rounded-lg h-10 shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                Kirim Manifest (Approve)
              </Button>
            </CardContent>
          </Card>

          {/* Secure Signed Proof Preview Frame */}
          {previewKey && (
            <div className="border border-[#DDDDDD] rounded-xl overflow-hidden bg-[#F7F7F7] flex-shrink-0 shadow-sm">
              <div className="bg-[#222222] text-white px-4 py-2 text-[10px] flex justify-between items-center">
                <span className="font-bold flex items-center gap-1">
                  <FileSearch className="h-3.5 w-3.5" /> Preview Bukti Manifest
                </span>
                <Button
                  variant="ghost"
                  onClick={() => setPreviewKey(null)}
                  className="text-white hover:text-white hover:bg-white/10 h-6 px-1.5 text-[9px] rounded-md"
                >
                  Tutup
                </Button>
              </div>
              <div className="h-48 flex items-center justify-center relative">
                {previewKey.endsWith('.pdf') ? (
                  <iframe
                    src={`/api/files/download?key=${previewKey}`}
                    className="w-full h-full"
                    title="Signed Proof View"
                  />
                ) : (
                  <img
                    src={`/api/files/download?key=${previewKey}`}
                    alt="Signed Proof View"
                    className="max-h-full max-w-full object-contain"
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
