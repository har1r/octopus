// src/components/tables/permohonan-filters.tsx
'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ServiceType, ApplicationStatus } from '@prisma/client';
import { Search, RotateCcw } from 'lucide-react';

export function PermohonanFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [nop, setNop] = React.useState(searchParams.get('nop') || '');
  const [serviceType, setServiceType] = React.useState(searchParams.get('serviceType') || 'ALL');
  const [status, setStatus] = React.useState(searchParams.get('status') || 'ALL');

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (nop) params.set('nop', nop);
    if (serviceType && serviceType !== 'ALL') params.set('serviceType', serviceType);
    if (status && status !== 'ALL') params.set('status', status);
    params.set('page', '1'); // reset page to 1 on search

    router.push(`/permohonan?${params.toString()}`);
  };

  const handleReset = () => {
    setNop('');
    setServiceType('ALL');
    setStatus('ALL');
    router.push('/permohonan');
  };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm shadow-slate-100/50 flex flex-col md:flex-row gap-4 items-end">
      <div className="flex-1 space-y-1.5 w-full">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Cari NOP</label>
        <div className="relative group">
          <Input
            type="text"
            placeholder="Cari berdasarkan NOP..."
            value={nop}
            onChange={(e) => setNop(e.target.value)}
            className="h-10 border-slate-200 bg-slate-50/20 hover:bg-white focus:bg-white focus-visible:ring-4 focus-visible:ring-[#FF385C]/10 focus-visible:border-[#FF385C] rounded-xl transition-all duration-150 shadow-sm"
          />
        </div>
      </div>

      <div className="w-full md:w-48 space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Jenis Layanan</label>
        <Select value={serviceType} onValueChange={(val) => setServiceType(val || 'ALL')}>
          <SelectTrigger className="h-10 border-slate-200 bg-slate-50/20 hover:bg-white rounded-xl transition-all duration-150 focus:ring-4 focus:ring-[#FF385C]/10 focus:border-[#FF385C] font-semibold text-slate-700">
            <SelectValue placeholder="Semua" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-slate-100">
            <SelectItem value="ALL">Semua Layanan</SelectItem>
            <SelectItem value={ServiceType.OBJEK_PAJAK_BARU}>Objek Pajak Baru</SelectItem>
            <SelectItem value={ServiceType.MUTASI_SEBAGIAN}>Mutasi Sebagian</SelectItem>
            <SelectItem value={ServiceType.MUTASI_HABIS_UPDATE}>Mutasi Habis (Update)</SelectItem>
            <SelectItem value={ServiceType.MUTASI_HABIS_REGULER}>Mutasi Habis (Reguler)</SelectItem>
            <SelectItem value={ServiceType.PEMBETULAN}>Pembetulan</SelectItem>
            <SelectItem value={ServiceType.PENGAKTIFAN}>Pengaktifan</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="w-full md:w-48 space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Status</label>
        <Select value={status} onValueChange={(val) => setStatus(val || 'ALL')}>
          <SelectTrigger className="h-10 border-slate-200 bg-slate-50/20 hover:bg-white rounded-xl transition-all duration-150 focus:ring-4 focus:ring-[#FF385C]/10 focus:border-[#FF385C] font-semibold text-slate-700">
            <SelectValue placeholder="Semua" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-slate-100">
            <SelectItem value="ALL">Semua Status</SelectItem>
            <SelectItem value={ApplicationStatus.SUBMITTED}>Submitted</SelectItem>
            <SelectItem value={ApplicationStatus.REVISION}>Revision</SelectItem>
            <SelectItem value={ApplicationStatus.REJECTED}>Rejected</SelectItem>
            <SelectItem value={ApplicationStatus.REJECTED_PERMANENT}>Rejected Permanent</SelectItem>
            <SelectItem value={ApplicationStatus.DRAFT_BUNDLE}>Draft Bundle</SelectItem>
            <SelectItem value={ApplicationStatus.READY_TO_ARCHIVE}>Ready to Archive</SelectItem>
            <SelectItem value={ApplicationStatus.RE_EXAMINE}>Re-examine</SelectItem>
            <SelectItem value={ApplicationStatus.READY_TO_SHIP}>Ready to Ship</SelectItem>
            <SelectItem value={ApplicationStatus.SENT_TO_CENTER}>Sent to Center</SelectItem>
            <SelectItem value={ApplicationStatus.COMPLETED}>Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2 w-full md:w-auto">
        <Button
          type="button"
          onClick={handleSearch}
          className="flex-1 md:flex-none bg-gradient-to-r from-[#FF385C] to-[#E31C5F] hover:from-[#E31C5F] hover:to-[#C1113C] text-white h-10 px-5 rounded-xl font-bold shadow-md shadow-[#FF385C]/15 active:scale-[0.97] transition-all duration-150 flex items-center justify-center gap-1 cursor-pointer"
        >
          <Search className="h-4 w-4" /> Cari
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          className="flex-1 md:flex-none border-slate-200 hover:bg-slate-50 text-slate-700 h-10 px-5 rounded-xl font-bold active:scale-[0.97] transition-all duration-150 flex items-center justify-center gap-1 cursor-pointer"
        >
          <RotateCcw className="h-4 w-4" /> Reset
        </Button>
      </div>
    </div>
  );
}
