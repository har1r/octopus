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
    <div
      className="min-h-screen flex flex-col md:flex-row font-sans overflow-x-hidden antialiased"
      style={{ backgroundColor: '#f8fafc' }}
    >
      {/* LEFT SIDE: Visual Showcase (Hidden on Mobile) */}
      <div
        className="hidden md:flex md:w-[42%] lg:w-[48%] relative flex-col justify-between p-12 text-white overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #1e3a8a 0%, #1d4ed8 45%, #2563eb 100%)',
          borderRight: '1px solid #1d4ed8',
        }}
      >
        {/* Background pattern */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 80% 0%, rgba(255,255,255,0.08) 0%, transparent 60%), radial-gradient(circle at 20% 100%, rgba(255,255,255,0.05) 0%, transparent 50%)',
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        {/* Top Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <ArchitaxLogo size={36} />
          <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.03em', color: '#fff' }}>
            Archi<span style={{ color: '#93c5fd' }}>tax</span>
            <span
              style={{
                fontSize: 10, fontWeight: 600, color: '#93c5fd',
                backgroundColor: 'rgba(255,255,255,0.1)',
                padding: '2px 8px', borderRadius: 9999,
                border: '1px solid rgba(255,255,255,0.15)',
                marginLeft: 8, verticalAlign: 'middle',
              }}
            >
              v1.0
            </span>
          </span>
        </div>

        {/* Center Mockup Workflow Panel */}
        <div className="relative my-auto py-10 flex flex-col items-center justify-center z-10 w-full">
          <div className="absolute w-72 h-72 rounded-full pointer-events-none" style={{ background: 'rgba(255,255,255,0.04)', filter: 'blur(60px)', top: '-30px', left: '-30px' }} />

          <div className="w-full max-w-sm space-y-3.5">
            {/* Card 1: Tahap Penelitian */}
            <div
              style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 12,
                padding: '16px 18px',
                backdropFilter: 'blur(12px)',
                transition: 'transform 200ms',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 9.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)' }}>
                  Tahap 2: Penelitian
                </span>
                <span
                  style={{
                    fontSize: 10.5, fontWeight: 600,
                    color: '#fbbf24',
                    backgroundColor: 'rgba(251,191,36,0.12)',
                    border: '1px solid rgba(251,191,36,0.25)',
                    padding: '2px 8px', borderRadius: 9999,
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                  }}
                >
                  <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: '#fbbf24', display: 'inline-block' }} />
                  Proses Validasi
                </span>
              </div>
              <p style={{ fontSize: 12.5, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                NOP: 32.73.120.004.008-0112.0
              </p>
              <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>
                <span>WP: PT Sinar Abadi Utama</span>
                <span>SLA: 2 Hari</span>
              </div>
            </div>

            {/* Card 2: Bundling (Featured) */}
            <div
              style={{
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 12,
                padding: '16px 18px',
                backdropFilter: 'blur(12px)',
                marginLeft: 20,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 9.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.6)' }}>
                  Tahap 4: Bundling Berkas
                </span>
                <span
                  style={{
                    fontSize: 10.5, fontWeight: 600,
                    color: '#86efac',
                    backgroundColor: 'rgba(134,239,172,0.12)',
                    border: '1px solid rgba(134,239,172,0.25)',
                    padding: '2px 8px', borderRadius: 9999,
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                  }}
                >
                  <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: '#86efac', display: 'inline-block' }} />
                  Siap Kirim
                </span>
              </div>
              <p style={{ fontSize: 12.5, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Bundle #BND-2026-0089
              </p>
              <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>
                <span>Total: 12 Berkas Pelayanan</span>
                <span>Staf Pelaksana</span>
              </div>
            </div>

            {/* Card 3: Pengarsipan */}
            <div
              style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 12,
                padding: '16px 18px',
                backdropFilter: 'blur(12px)',
                marginLeft: 8,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 9.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)' }}>
                  Tahap 5: Pengarsipan
                </span>
                <span
                  style={{
                    fontSize: 10.5, fontWeight: 600,
                    color: '#6ee7b7',
                    backgroundColor: 'rgba(110,231,183,0.12)',
                    border: '1px solid rgba(110,231,183,0.2)',
                    padding: '2px 8px', borderRadius: 9999,
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                  }}
                >
                  <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: '#6ee7b7', display: 'inline-block' }} />
                  Terunggah (100%)
                </span>
              </div>
              <p style={{ fontSize: 12.5, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Box Arsip PBB - Rak A.12
              </p>
              <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>
                <span>WP: Ir. H. M. Sadikin</span>
                <span>Salinan Digital</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Tagline */}
        <div className="relative z-10">
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 6 }}>
            PBB Document Workflow Management
          </h3>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, maxWidth: 340 }}>
            Sistem manajemen terintegrasi untuk melacak, memvalidasi, membundel, dan mengarsipkan
            berkas pelayanan Pajak Bumi dan Bangunan (PBB) Daerah secara sistematis.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Login panel — putih bersih */}
      <div
        className="flex-1 flex items-center justify-center p-6 sm:p-10"
        style={{ backgroundColor: '#f8fafc' }}
      >
        <div
          className="w-full flex flex-col"
          style={{
            maxWidth: 400,
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 14,
            padding: '36px 32px',
            boxShadow: '0 2px 20px rgba(15,23,42,0.07)',
          }}
        >
          {/* Brand header */}
          <div className="flex flex-col items-center text-center" style={{ marginBottom: 28 }}>
            <ArchitaxLogo size={48} className="mb-3" />
            <h1
              className="font-display"
              style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', color: '#0f172a', lineHeight: 1.1, margin: 0 }}
            >
              Archi<span style={{ color: '#2563eb' }}>tax</span>
            </h1>
            <span
              style={{
                display: 'inline-block', marginTop: 8,
                fontSize: 10, fontWeight: 700,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                color: '#2563eb',
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                padding: '3px 10px', borderRadius: 9999,
              }}
            >
              PBB Services Platform
            </span>
          </div>

          {/* Section heading */}
          <div style={{ marginBottom: 22 }}>
            <h2
              className="font-display"
              style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.025em', color: '#0f172a', lineHeight: 1.2, margin: 0 }}
            >
              Selamat Datang Kembali
            </h2>
            <p style={{ fontSize: 12.5, color: '#64748b', marginTop: 5, lineHeight: 1.55 }}>
              Masukkan kredensial akun Anda untuk mengakses sistem pengarsipan.
            </p>
          </div>

          {/* Form */}
          <LoginForm />

          {/* Footer */}
          <div
            style={{
              marginTop: 24,
              paddingTop: 18,
              borderTop: '1px solid #f1f5f9',
              textAlign: 'center',
              fontSize: 10.5, fontWeight: 500, color: '#94a3b8',
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
