// src/components/tables/validation-queue.tsx
'use client';

import * as React from 'react';
import { Permohonan, ServiceType, ApplicationStatus } from '@prisma/client';
import { requestRevisionAction, rejectPermohonanAction } from '@/actions/permohonan.actions';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Eye, Edit3, XOctagon, Loader2, Package, Check } from 'lucide-react';
import Link from 'next/link';

interface ValidationQueueProps {
  initialItems: Permohonan[];
}

function formatNop(nop: string): string {
  const nums = nop.replace(/[^0-9]/g, '');
  if (nums.length !== 18) return nop;
  return `${nums.substring(0, 2)}.${nums.substring(2, 4)}.${nums.substring(4, 7)}.${nums.substring(7, 10)}.${nums.substring(10, 13)}-${nums.substring(13, 17)}.${nums.substring(17, 18)}`;
}

export function ValidationQueue({ initialItems }: ValidationQueueProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [activeTab, setActiveTab] = React.useState<string>('ALL');
  const [isPending, startTransition] = React.useTransition();

  // Filter items based on active tab
  const filteredItems = React.useMemo(() => {
    if (activeTab === 'ALL') return initialItems;
    return initialItems.filter((item) => item.serviceType === activeTab);
  }, [initialItems, activeTab]);

  // Handle row selection
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map((item) => item.id));
    }
  };

  const handleRevision = (id: string, nomorBerkas: string) => {
    const note = prompt(`Masukkan catatan revisi / alasan perbaikan untuk berkas ${nomorBerkas}:`);
    if (note === null) return; // cancelled
    if (note.trim() === '') {
      alert('Catatan revisi wajib diisi agar staf penginput tahu bagian mana yang harus diperbaiki.');
      return;
    }

    startTransition(async () => {
      try {
        const result = await requestRevisionAction(id, note.trim());
        if (result.success) {
          toast.success(`Berkas ${nomorBerkas} dikembalikan untuk revisi`);
          setSelectedIds(prev => prev.filter(item => item !== id));
          router.refresh();
        } else {
          toast.error(result.error || 'Gagal mengajukan revisi');
        }
      } catch (error: any) {
        toast.error(error.message || 'Terjadi kesalahan');
      }
    });
  };

  const handleReject = (id: string, nomorBerkas: string) => {
    if (confirm(`Apakah Anda yakin ingin REJECT berkas ${nomorBerkas}?`)) {
      startTransition(async () => {
        try {
          const result = await rejectPermohonanAction(id);
          if (result.success) {
            toast.success(`Berkas ${nomorBerkas} berhasil direject`);
            setSelectedIds(prev => prev.filter(item => item !== id));
            router.refresh();
          } else {
            toast.error(result.error || 'Gagal mereject berkas');
          }
        } catch (error: any) {
          toast.error(error.message || 'Terjadi kesalahan');
        }
      });
    }
  };

  // We will call a bundle action when the user clicks 'Buat Bundle' in the floating bar
  // We'll define the mock/real action and import it in Phase 5, but for now we create a transition handler
  const handleCreateBundle = () => {
    if (selectedIds.length === 0) return;
    if (selectedIds.length > 20) {
      toast.error('Satu bundle maksimal berisi 20 berkas permohonan.');
      return;
    }

    // BR-001 Validation: check if all selected items have the same service type
    const selectedItems = initialItems.filter(item => selectedIds.includes(item.id));
    const firstType = selectedItems[0]?.serviceType;
    const allSameType = selectedItems.every(item => item.serviceType === firstType);

    if (!allSameType) {
      toast.error('BR-001: Satu bundle hanya boleh berisi berkas dengan jenis pelayanan yang sama.');
      return;
    }

    // We redirect to a new bundle creation page with query params of selected IDs
    const params = new URLSearchParams();
    selectedIds.forEach(id => params.append('ids', id));
    router.push(`/bundle/new?${params.toString()}`);
  };

  return (
    <div className="space-y-6 relative pb-20">
      {/* Quick Filter Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex flex-wrap h-auto bg-white border border-[#DDDDDD] p-1 rounded-xl shadow-sm gap-1">
          <TabsTrigger value="ALL" className="font-semibold text-xs py-2 px-3 rounded-lg data-[state=active]:bg-[#2563EB] data-[state=active]:text-white">
            Semua ({initialItems.length})
          </TabsTrigger>
          <TabsTrigger value={ServiceType.OBJEK_PAJAK_BARU} className="font-semibold text-xs py-2 px-3 rounded-lg data-[state=active]:bg-[#2563EB] data-[state=active]:text-white">
            Objek Pajak Baru ({initialItems.filter(i => i.serviceType === ServiceType.OBJEK_PAJAK_BARU).length})
          </TabsTrigger>
          <TabsTrigger value={ServiceType.MUTASI_SEBAGIAN} className="font-semibold text-xs py-2 px-3 rounded-lg data-[state=active]:bg-[#2563EB] data-[state=active]:text-white">
            Mutasi Sebagian ({initialItems.filter(i => i.serviceType === ServiceType.MUTASI_SEBAGIAN).length})
          </TabsTrigger>
          <TabsTrigger value={ServiceType.MUTASI_HABIS_UPDATE} className="font-semibold text-xs py-2 px-3 rounded-lg data-[state=active]:bg-[#2563EB] data-[state=active]:text-white">
            Mutasi Habis (Update) ({initialItems.filter(i => i.serviceType === ServiceType.MUTASI_HABIS_UPDATE).length})
          </TabsTrigger>
          <TabsTrigger value={ServiceType.MUTASI_HABIS_REGULER} className="font-semibold text-xs py-2 px-3 rounded-lg data-[state=active]:bg-[#2563EB] data-[state=active]:text-white">
            Mutasi Habis (Reguler) ({initialItems.filter(i => i.serviceType === ServiceType.MUTASI_HABIS_REGULER).length})
          </TabsTrigger>
          <TabsTrigger value={ServiceType.PEMBETULAN} className="font-semibold text-xs py-2 px-3 rounded-lg data-[state=active]:bg-[#2563EB] data-[state=active]:text-white">
            Pembetulan ({initialItems.filter(i => i.serviceType === ServiceType.PEMBETULAN).length})
          </TabsTrigger>
          <TabsTrigger value={ServiceType.PENGAKTIFAN} className="font-semibold text-xs py-2 px-3 rounded-lg data-[state=active]:bg-[#2563EB] data-[state=active]:text-white">
            Pengaktifan ({initialItems.filter(i => i.serviceType === ServiceType.PENGAKTIFAN).length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Queue Table (Desktop) */}
      <div className="hidden md:block bg-white border border-[#DDDDDD] rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-[#F7F7F7]">
            <TableRow className="border-b border-[#DDDDDD] hover:bg-[#F7F7F7]">
              <TableHead className="w-12 text-center">
                <input
                  type="checkbox"
                  checked={filteredItems.length > 0 && selectedIds.length === filteredItems.length}
                  onChange={toggleSelectAll}
                  disabled={isPending}
                  className="rounded border-[#DDDDDD] text-[#2563EB] focus:ring-[#2563EB]"
                />
              </TableHead>
              <TableHead className="font-bold text-[#222222] w-[140px]">No. Berkas</TableHead>
              <TableHead className="font-bold text-[#222222]">Jenis Layanan</TableHead>
              <TableHead className="font-bold text-[#222222] w-[200px]">NOP</TableHead>
              <TableHead className="font-bold text-[#222222]">Pemilik Lama</TableHead>
              <TableHead className="font-bold text-[#222222] w-[140px]">Tanggal Masuk</TableHead>
              <TableHead className="font-bold text-[#222222] text-right w-[150px]">Validasi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-[#717171] font-semibold">
                  Tidak ada permohonan dalam antrean untuk jenis layanan ini.
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => {
                const isSelected = selectedIds.includes(item.id);

                return (
                  <TableRow 
                    key={item.id} 
                    className={`border-b border-[#DDDDDD] transition-colors ${
                      isSelected ? 'bg-[#2563EB]/5 hover:bg-[#2563EB]/10' : 'hover:bg-[#F7F7F7]/50'
                    }`}
                  >
                    <TableCell className="text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(item.id)}
                        disabled={isPending}
                        className="rounded border-[#DDDDDD] text-[#2563EB] focus:ring-[#2563EB]"
                      />
                    </TableCell>
                    <TableCell className="font-bold text-[#222222]">{item.nomorBerkas}</TableCell>
                    <TableCell className="font-semibold text-xs text-[#222222]">
                      {item.serviceType.replace(/_/g, ' ')}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-[#222222]">
                      {formatNop(item.nop)}
                    </TableCell>
                    <TableCell className="text-[#222222] font-semibold">
                      {item.oldOwnerName || '-'}
                    </TableCell>
                    <TableCell className="text-xs text-[#717171]">
                      {new Date(item.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/permohonan/${item.id}`}
                          className="text-[#717171] hover:text-[#222222] hover:bg-[#F7F7F7] rounded-lg p-2 h-9 w-9 inline-flex items-center justify-center transition-colors"
                          title="Lihat Detail"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Button
                          variant="ghost"
                          onClick={() => handleRevision(item.id, item.nomorBerkas)}
                          disabled={isPending}
                          className="text-[#F59E0B] hover:text-[#F59E0B] hover:bg-[#F59E0B]/10 rounded-lg p-2 h-9 w-9"
                          title="Minta Revisi"
                        >
                          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Edit3 className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => handleReject(item.id, item.nomorBerkas)}
                          disabled={isPending}
                          className="text-[#EF4444] hover:text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg p-2 h-9 w-9"
                          title="Tolak Berkas (Reject)"
                        >
                          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <XOctagon className="h-4 w-4" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Queue Cards (Mobile) */}
      <div className="md:hidden space-y-4">
        {filteredItems.length === 0 ? (
          <div className="bg-white border border-[#DDDDDD] rounded-xl p-8 text-center text-[#717171] font-semibold">
            Tidak ada permohonan dalam antrean untuk jenis layanan ini.
          </div>
        ) : (
          filteredItems.map((item) => {
            const isSelected = selectedIds.includes(item.id);
            return (
              <div 
                key={item.id}
                className={`bg-white border rounded-xl p-4 shadow-sm flex flex-col gap-3 transition-colors ${
                  isSelected ? 'border-[#2563EB] bg-[#2563EB]/5' : 'border-[#DDDDDD]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(item.id)}
                      disabled={isPending}
                      className="rounded border-[#DDDDDD] text-[#2563EB] focus:ring-[#2563EB] mt-1"
                    />
                    <div>
                      <p className="font-bold text-[#222222] text-sm">{item.nomorBerkas}</p>
                      <p className="text-[10px] text-[#717171] mt-0.5">
                        NOP: <span className="font-mono">{formatNop(item.nop)}</span>
                      </p>
                    </div>
                  </div>
                  <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700 uppercase tracking-wider">
                    {item.serviceType.replace(/_/g, ' ')}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 border-t border-[#F7F7F7] pt-2 text-xs">
                  <div>
                    <p className="text-[#717171] font-semibold text-[10px]">Pemilik Lama</p>
                    <p className="font-bold text-[#222222] mt-0.5">{item.oldOwnerName || '-'}</p>
                  </div>
                  <div>
                    <p className="text-[#717171] font-semibold text-[10px]">Tanggal Masuk</p>
                    <p className="font-semibold text-[#222222] mt-0.5">
                      {new Date(item.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-end gap-2 border-t border-[#F7F7F7] pt-2">
                  <Link
                    href={`/permohonan/${item.id}`}
                    className="text-[#717171] hover:text-[#222222] hover:bg-[#F7F7F7] border border-[#DDDDDD] rounded-lg p-2 h-9 w-9 inline-flex items-center justify-center transition-colors"
                    title="Lihat Detail"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  <Button
                    variant="ghost"
                    onClick={() => handleRevision(item.id, item.nomorBerkas)}
                    disabled={isPending}
                    className="text-[#F59E0B] hover:text-[#F59E0B] hover:bg-[#F59E0B]/10 border border-[#DDDDDD] rounded-lg p-2 h-9 w-9"
                    title="Minta Revisi"
                  >
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Edit3 className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleReject(item.id, item.nomorBerkas)}
                    disabled={isPending}
                    className="text-[#EF4444] hover:text-[#EF4444] hover:bg-[#EF4444]/10 border border-[#DDDDDD] rounded-lg p-2 h-9 w-9"
                    title="Tolak Berkas (Reject)"
                  >
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <XOctagon className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#222222] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 z-50 border border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-[#2563EB] flex items-center justify-center text-xs font-bold text-white">
              {selectedIds.length}
            </span>
            <span className="text-sm font-bold">Berkas Dipilih</span>
          </div>

          <div className="h-6 w-px bg-white/20" />

          <Button
            onClick={handleCreateBundle}
            disabled={selectedIds.length > 20}
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-lg h-9 px-4 flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <Package className="h-4 w-4" />
            Buat Bundle {selectedIds.length > 20 && '(Maks 20)'}
          </Button>
        </div>
      )}
    </div>
  );
}
