// src/app/login/page.tsx
import { Metadata } from 'next';
import { LoginForm } from '@/components/forms/login-form';
import { ArchitaxLogo } from '@/components/shared/logo';

export const metadata: Metadata = {
  title: 'Login - Architax PBB',
  description: 'Regional Tax Document Workflow Management Application',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans overflow-x-hidden antialiased" style={{ backgroundColor: '#fffaf0' }}>
      {/* LEFT SIDE: Visual Showcase (Hidden on Mobile) */}
      <div className="hidden md:flex md:w-[42%] lg:w-[48%] bg-[#0B0F19] relative flex-col justify-between p-12 text-white overflow-hidden border-r border-slate-800">
        {/* Background Grid & Gradient Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_120%,#FF385C_0%,rgba(11,15,25,0)_65%)] opacity-40 pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
        
        {/* Top Logo and Name */}
        <div className="flex items-center gap-3 relative z-10">
          <ArchitaxLogo size={38} />
          <span className="text-xl font-extrabold font-display tracking-tight text-white">
            Archi<span className="text-[#FF385C]">tax</span>
            <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700 ml-2">v1.0</span>
          </span>
        </div>

        {/* Center Mockup Workflow Panel */}
        <div className="relative my-auto py-12 flex flex-col items-center justify-center z-10 w-full">
          {/* Decorative large glow behind the cards */}
          <div className="absolute w-80 h-80 rounded-full bg-[#FF385C]/10 blur-3xl -top-12 -left-12 pointer-events-none" />
          
          <div className="w-full max-w-sm space-y-4">
            {/* Card 1: Tahap Penelitian */}
            <div className="backdrop-blur-md bg-white/[0.03] border border-white/10 rounded-2xl p-5 shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Tahap 2: Penelitian</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 mr-1.5 animate-pulse" />
                  Proses Validasi
                </span>
              </div>
              <p className="text-sm font-bold text-white truncate font-display">NOP: 32.73.120.004.008-0112.0</p>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-400 font-medium">
                <span>WP: PT Sinar Abadi Utama</span>
                <span>SLA: 2 Hari</span>
              </div>
            </div>

            {/* Card 2: Tahap Bundling (Active/Main Focus Card) */}
            <div className="backdrop-blur-md bg-white/[0.06] border border-white/20 rounded-2xl p-5 shadow-2xl transform translate-x-6 hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-300">Tahap 4: Bundling Berkas</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FF385C]/15 text-[#FF5A79] border border-[#FF385C]/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FF385C] mr-1.5 animate-pulse" />
                  Siap Kirim
                </span>
              </div>
              <p className="text-sm font-bold text-white truncate font-display">Bundle #BND-2026-0089</p>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-300 font-medium">
                <span>Total: 12 Berkas Pelayanan</span>
                <span>Staf Pelaksana</span>
              </div>
            </div>

            {/* Card 3: Tahap Pengarsipan */}
            <div className="backdrop-blur-md bg-white/[0.03] border border-white/10 rounded-2xl p-5 shadow-2xl transform translate-x-2 hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Tahap 5: Pengarsipan</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mr-1.5" />
                  Terunggah (100%)
                </span>
              </div>
              <p className="text-sm font-bold text-white truncate font-display">Box Arsip PBB - Rak A.12</p>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-400 font-medium">
                <span>WP: Ir. H. M. Sadikin</span>
                <span>Salinan Digital</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Tagline Info */}
        <div className="relative z-10">
          <h3 className="text-base font-bold font-display text-white mb-1.5">PBB Document Workflow Management</h3>
          <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
            Sistem manajemen terintegrasi untuk melacak, memvalidasi, membundel, dan mengarsipkan berkas pelayanan Pajak Bumi dan Bangunan (PBB) Daerah secara sistematis.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Clay canvas login panel */}
      <div
        className="flex-1 flex items-center justify-center p-6 sm:p-10"
        style={{ backgroundColor: '#faf5e8' }}
      >
        {/*
         * Login card — Clay hero-illustration-card / product-mockup-card hybrid:
         * bg surface-card (#f5f0e0), border: 1px hairline #e5e5e5,
         * rounded-xl (24px), NO heavy shadow
         */}
        <div
          className="w-full flex flex-col"
          style={{
            maxWidth: 420,
            backgroundColor: '#fffaf0',
            border: '1px solid #e5e5e5',
            borderRadius: 24,
            padding: '40px 36px',
            boxShadow: '0 2px 16px rgba(10,10,10,0.06)',
          }}
        >
          {/* Brand header */}
          <div className="flex flex-col items-center text-center" style={{ marginBottom: 32 }}>
            <ArchitaxLogo size={52} className="mb-4" />
            {/* Clay display font: Plus Jakarta Sans 800 + tight tracking */}
            <h1
              className="font-display"
              style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.045em', color: '#0a0a0a', lineHeight: 1.1 }}
            >
              Archi<span style={{ color: '#ff4d8b' }}>tax</span>
            </h1>
            {/* Clay caption-uppercase badge */}
            <span
              style={{
                display: 'inline-block', marginTop: 10,
                fontSize: 10, fontWeight: 700,
                letterSpacing: '0.12em', textTransform: 'uppercase',
                color: '#ff4d8b',
                backgroundColor: '#fce7f3',
                border: '1px solid #fbcfe8',
                padding: '3px 12px', borderRadius: 9999,
              }}
            >
              PBB Services Platform
            </span>
          </div>

          {/* Section heading */}
          <div style={{ marginBottom: 24 }}>
            <h2
              className="font-display"
              style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.035em', color: '#0a0a0a', lineHeight: 1.2 }}
            >
              Selamat Datang Kembali
            </h2>
            <p style={{ fontSize: 13, color: '#6a6a6a', marginTop: 6, lineHeight: 1.55 }}>
              Masukkan kredensial akun Anda untuk mengakses sistem pengarsipan.
            </p>
          </div>

          {/* Form */}
          <LoginForm />

          {/* Footer */}
          <div
            style={{
              marginTop: 28,
              paddingTop: 20,
              borderTop: '1px solid #e5e5e5',
              textAlign: 'center',
              fontSize: 11, fontWeight: 500, color: '#9a9a9a',
              lineHeight: 1.6,
            }}
          >
            &copy; {new Date().getFullYear()} Architax Regional PBB.<br />
            Seluruh hak cipta dilindungi.
          </div>
        </div>
      </div>
    </div>
  );
}

