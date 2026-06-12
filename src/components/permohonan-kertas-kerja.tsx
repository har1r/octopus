// src/components/permohonan-kertas-kerja.tsx
'use client';

import * as React from 'react';
import { Calculator, ShieldAlert, Lock } from 'lucide-react';

interface DetailItem {
  newLandArea: number;
  newBuildingArea: number;
  newOwnerName: string;
}

interface PermohonanKertasKerjaProps {
  oldLandArea: number;
  oldBuildingArea: number;
  details: DetailItem[];
}

export function PermohonanKertasKerja({ oldLandArea, oldBuildingArea, details }: PermohonanKertasKerjaProps) {
  // Real-time calculations
  const totalLandPecahan = details.reduce((sum, item) => sum + (Number(item.newLandArea) || 0), 0);
  const totalBldgPecahan = details.reduce((sum, item) => sum + (Number(item.newBuildingArea) || 0), 0);

  const sisaLand = oldLandArea - totalLandPecahan;
  const rawSisaBldg = oldBuildingArea - totalBldgPecahan;
  const sisaBldg = Math.max(0, rawSisaBldg);
  const isLandMinus = sisaLand < 0;
  const isBldgMinus = rawSisaBldg < 0;

  return (
    <div className="w-full bg-white border border-[#DDDDDD] rounded-xl shadow-lg p-5 space-y-4 font-sans">
      <div className="border-b border-[#F3F4F6] pb-3 flex items-center gap-2">
        <Calculator className="h-5 w-5 text-[#2563EB]" />
        <div>
          <h3 className="text-sm font-bold text-[#111827]">Kertas Kerja Mutasi</h3>
          <p className="text-[10px] text-[#717171] font-semibold">Kalkulasi Pembagian Luas Objek Induk</p>
        </div>
      </div>

      <div className="space-y-4 text-xs">
        {/* Land Area Card section */}
        <div className="space-y-2">
          <p className="font-bold text-[#717171] uppercase tracking-wider text-[10px]">Pembagian Luas Tanah</p>
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-3 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-[#64748B]">Luas Induk:</span>
              <span className="font-bold text-[#0F172A]">{oldLandArea} m²</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Total Pecahan:</span>
              <span className="font-bold text-[#0F172A]">{totalLandPecahan} m²</span>
            </div>
            <hr className="border-slate-200 my-1" />
            <div className="flex justify-between items-center">
              <span className="font-semibold text-[#0F172A]">Sisa Tanah:</span>
              <span className={`font-bold text-sm ${isLandMinus ? 'text-rose-600' : 'text-emerald-600'}`}>
                {sisaLand} m²
              </span>
            </div>
            {isLandMinus && (
              <div className="text-[10px] text-rose-600 font-bold flex items-center gap-1 mt-1 bg-rose-50 border border-rose-100 p-1.5 rounded-md animate-pulse">
                <ShieldAlert className="h-3.5 w-3.5 flex-shrink-0" />
                <span>Total pecahan melebihi luas induk asal!</span>
              </div>
            )}
          </div>
        </div>

        {/* Building Area Card section */}
        <div className="space-y-2">
          <p className="font-bold text-[#717171] uppercase tracking-wider text-[10px]">Pembagian Luas Bangunan</p>
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-3 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-[#64748B]">Luas Induk:</span>
              <span className="font-bold text-[#0F172A]">{oldBuildingArea} m²</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Total Pecahan:</span>
              <span className="font-bold text-[#0F172A]">{totalBldgPecahan} m²</span>
            </div>
            <hr className="border-slate-200 my-1" />
            <div className="flex justify-between items-center">
              <span className="font-semibold text-[#0F172A]">Sisa Bangunan:</span>
              <span className="font-bold text-sm text-emerald-600">
                {sisaBldg} m²
              </span>
            </div>
            {isBldgMinus && (
              <div className="text-[10px] text-[#2563EB] font-bold flex items-center gap-1 mt-1 bg-[#2563EB]/5 border border-[#2563EB]/10 p-1.5 rounded-md">
                <Lock className="h-3.5 w-3.5 flex-shrink-0" />
                <span>Auto-Lock: Sisa dikunci pada 0 m².</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
