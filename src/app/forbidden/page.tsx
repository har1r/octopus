// src/app/forbidden/page.tsx
import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F7F7F7] px-4 font-sans text-center">
      <div className="max-w-md w-full bg-white border border-[#DDDDDD] rounded-2xl p-8 shadow-xl flex flex-col items-center">
        <div className="h-16 w-16 rounded-full bg-[#EF4444]/10 flex items-center justify-center text-[#EF4444] mb-6">
          <ShieldAlert className="h-10 w-10" />
        </div>
        <h1 className="text-2xl font-bold text-[#222222] mb-2">Akses Ditolak (403)</h1>
        <p className="text-sm text-[#717171] mb-8">
          Anda tidak memiliki izin yang cukup untuk mengakses halaman ini. Jika Anda rasa ini adalah kesalahan, silakan hubungi administrator Anda.
        </p>
        <div className="w-full flex flex-col gap-3">
          <Link
            href="/dashboard"
            className="w-full bg-[#FF385C] hover:bg-[#E31C5F] text-white font-semibold flex items-center justify-center h-11 rounded-lg text-sm transition-colors shadow-sm"
          >
            Kembali ke Dashboard
          </Link>
          <Link
            href="/login"
            className="w-full border border-[#DDDDDD] hover:bg-[#F7F7F7] text-[#222222] font-semibold flex items-center justify-center h-11 rounded-lg text-sm transition-colors"
          >
            Kembali ke Login
          </Link>
        </div>
      </div>
    </div>
  );
}
