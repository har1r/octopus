'use client';

import * as React from 'react';
import { Bell, ChevronDown, LogOut, Search, Settings, User } from 'lucide-react';
import { logoutAction } from '@/actions/auth.actions';
import { cn } from '@/lib/utils';
import { UserRole } from '@prisma/client';

/*
 * Clay Design Tokens
 */
const C = {
  canvas:       '#fffaf0',   /* top-nav bg — Clay canvas */
  surfaceSoft:  '#faf5e8',   /* navbar bg — surface-soft */
  surfaceCard:  '#f5f0e0',   /* hover states */
  hairline:     '#e5e5e5',   /* 1px borders */
  hairlineSoft: '#f0f0f0',   /* dividers */
  ink:          '#0a0a0a',
  bodyStrong:   '#1a1a1a',
  body:         '#3a3a3a',
  muted:        '#6a6a6a',
  mutedSoft:    '#9a9a9a',
  pink:         '#ff4d8b',   /* Architax accent */
  mint:         '#a4d4c5',   /* online dot */
} as const;

interface Notification {
  id: string;
  title: string;
  body: string;
  time: string;
  unread: boolean;
}

interface AppNavbarProps {
  userName: string;
  userRole: UserRole;
  mobileMenuButton: React.ReactNode;
}

const roleLabelMap: Record<string, string> = {
  STAF_PENGINPUT: 'Staf Penginput',
  STAF_PENELITI:  'Staf Peneliti',
  STAF_PENGARSIP: 'Staf Pengarsip',
  STAF_PENGIRIM:  'Staf Pengirim',
  STAF_PEMANTAU:  'Staf Pemantau',
  SUPERVISOR:     'Supervisor',
};

const mockNotifications: Notification[] = [
  { id: '1', title: 'Permohonan Baru', body: 'Berkas BRK-2026-00142 menunggu validasi.', time: '2 mnt lalu', unread: true },
  { id: '2', title: 'Revisi Diminta',  body: 'BRK-2026-00138 dikembalikan untuk revisi.', time: '14 mnt lalu', unread: true },
  { id: '3', title: 'Bundle Siap Kirim', body: 'BND-2026-00021 siap dikirim ke pusat.', time: '1 jam lalu', unread: false },
];

export function AppNavbar({ userName, userRole, mobileMenuButton }: AppNavbarProps) {
  const [searchFocused, setSearchFocused] = React.useState(false);
  const [searchValue, setSearchValue]     = React.useState('');
  const [notifOpen, setNotifOpen]         = React.useState(false);
  const [userMenuOpen, setUserMenuOpen]   = React.useState(false);

  const notifRef   = React.useRef<HTMLDivElement>(null);
  const userMenuRef = React.useRef<HTMLDivElement>(null);
  const unreadCount = mockNotifications.filter(n => n.unread).length;

  const initials = userName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  // Click-outside to close
  React.useEffect(() => {
    const h = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // ⌘K shortcut
  React.useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('navbar-search')?.focus();
      }
    };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, []);

  return (
    /*
     * Navbar — Clay top-nav spec:
     * bg: canvas (#fffaf0), height: 60px (≈ Clay 64px),
     * border-bottom: 1px hairline #e5e5e5, NO shadow
     */
    <header
      style={{
        height: 60,
        backgroundColor: C.canvas,
        borderBottom: `1px solid ${C.hairline}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        flexShrink: 0,
        gap: 16,
        zIndex: 40,
        position: 'relative',
      }}
    >

      {/* ── Left: Mobile toggle + tagline ───────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        {mobileMenuButton}
        <div className="hidden sm:block" style={{ minWidth: 0 }}>
          {/* Clay title-sm: Inter 16px / 600 */}
          <p style={{ fontSize: 14, fontWeight: 600, color: C.bodyStrong, lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Sistem Alur Kerja PBB
          </p>
          {/* Clay caption-uppercase */}
          <p style={{ fontSize: 11, fontWeight: 600, color: C.mutedSoft, letterSpacing: '0.08em', textTransform: 'uppercase', lineHeight: 1.3 }}>
            Architax · {roleLabelMap[userRole] ?? userRole}
          </p>
        </div>
      </div>

      {/* ── Center: Search ─────────────────────────── */}
      {/*
       * Clay text-input spec:
       * height 44px, bg canvas, hairline border 1px,
       * rounded-md (12px), focus: border → ink, ring pink
       */}
      <div
        className="hidden md:flex items-center gap-2"
        style={{
          height: 44,
          borderRadius: 12,
          border: `1px solid ${searchFocused ? C.ink : C.hairline}`,
          backgroundColor: C.canvas,
          padding: '0 12px',
          width: searchFocused ? 320 : 256,
          transition: 'width 300ms ease-out, border-color 200ms ease-out, box-shadow 200ms ease-out',
          boxShadow: searchFocused ? `0 0 0 3px rgba(255,77,139,0.12)` : 'none',
        }}
      >
        <Search
          className="h-3.5 w-3.5 flex-shrink-0"
          style={{ color: searchFocused ? C.ink : C.mutedSoft, transition: 'color 200ms' }}
        />
        <input
          id="navbar-search"
          type="text"
          placeholder="Cari permohonan, bundle..."
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          style={{
            flex: 1, background: 'transparent',
            fontSize: 14, fontWeight: 400, color: C.ink,
            outline: 'none', border: 'none', minWidth: 0,
          }}
        />
        {searchValue ? (
          <button
            onClick={() => setSearchValue('')}
            style={{ color: C.mutedSoft, background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}
          >
            ✕
          </button>
        ) : (
          /* Clay kbd shortcut — surface-card bg */
          <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
            {['⌘', 'K'].map(k => (
              <kbd
                key={k}
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  height: 18, minWidth: 18, padding: '0 4px',
                  borderRadius: 4, fontSize: 9, fontWeight: 700,
                  backgroundColor: C.surfaceCard, border: `1px solid ${C.hairline}`,
                  color: C.muted, fontFamily: 'inherit',
                }}
              >
                {k}
              </kbd>
            ))}
          </div>
        )}
      </div>

      {/* ── Right: Actions ─────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setNotifOpen(p => !p); setUserMenuOpen(false); }}
            aria-label="Notifikasi"
            className="clay-press"
            style={{
              height: 40, width: 40,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 8,
              border: 'none', cursor: 'pointer',
              backgroundColor: notifOpen ? C.surfaceCard : 'transparent',
              color: notifOpen ? C.ink : C.muted,
              transition: 'background-color 120ms, color 120ms',
              position: 'relative',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.backgroundColor = C.surfaceCard;
              (e.currentTarget as HTMLElement).style.color = C.ink;
            }}
            onMouseLeave={e => {
              if (!notifOpen) {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                (e.currentTarget as HTMLElement).style.color = C.muted;
              }
            }}
          >
            <Bell className="h-[18px] w-[18px]" />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute', top: 7, right: 7,
                  height: 14, width: 14, borderRadius: 9999,
                  backgroundColor: C.pink, color: '#fff',
                  fontSize: 8, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `2px solid ${C.canvas}`,
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown — Clay product-mockup-card style */}
          {notifOpen && (
            <div
              className="animate-in fade-in slide-in-from-top-2 duration-200"
              style={{
                position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                width: 300,
                backgroundColor: C.canvas,
                border: `1px solid ${C.hairline}`,
                borderRadius: 16, /* Clay rounded.lg */
                zIndex: 50, overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(10,10,10,0.08)',
              }}
            >
              {/* Header */}
              <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.hairlineSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>Notifikasi</p>
                {unreadCount > 0 && (
                  <span
                    style={{
                      fontSize: 10, fontWeight: 700, padding: '2px 8px',
                      borderRadius: 9999,
                      backgroundColor: C.surfaceCard, color: C.muted,
                      border: `1px solid ${C.hairline}`,
                    }}
                  >
                    {unreadCount} belum dibaca
                  </span>
                )}
              </div>

              {/* Notification items */}
              <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                {mockNotifications.map((n, i) => (
                  <button
                    key={n.id}
                    style={{
                      width: '100%', textAlign: 'left',
                      padding: '12px 16px',
                      backgroundColor: n.unread ? C.surfaceSoft : C.canvas,
                      borderBottom: i < mockNotifications.length - 1 ? `1px solid ${C.hairlineSoft}` : 'none',
                      border: 'none', cursor: 'pointer',
                      transition: 'background-color 100ms',
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = C.surfaceCard}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = n.unread ? C.surfaceSoft : C.canvas}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      {n.unread && (
                        <span style={{ marginTop: 5, height: 7, width: 7, borderRadius: 9999, backgroundColor: C.pink, flexShrink: 0 }} />
                      )}
                      <div style={{ marginLeft: n.unread ? 0 : 17 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{n.title}</p>
                        <p style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{n.body}</p>
                        <p style={{ fontSize: 11, color: C.mutedSoft, marginTop: 4, fontWeight: 500 }}>{n.time}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Footer */}
              <div style={{ padding: '10px 16px', borderTop: `1px solid ${C.hairlineSoft}`, textAlign: 'center' }}>
                <button style={{ fontSize: 12, fontWeight: 600, color: C.muted, background: 'none', border: 'none', cursor: 'pointer' }}>
                  Lihat semua notifikasi
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Hairline divider */}
        <div style={{ height: 20, width: 1, backgroundColor: C.hairline, margin: '0 4px' }} />

        {/* User Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => { setUserMenuOpen(p => !p); setNotifOpen(false); }}
            className="clay-press"
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              height: 40, padding: '0 8px 0 6px',
              borderRadius: 8,
              border: 'none', cursor: 'pointer',
              backgroundColor: userMenuOpen ? C.surfaceCard : 'transparent',
              transition: 'background-color 120ms',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = C.surfaceCard}
            onMouseLeave={e => {
              if (!userMenuOpen) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
            }}
          >
            {/* Avatar */}
            <div className="relative">
              <div
                style={{
                  height: 28, width: 28, borderRadius: 9999,
                  background: `linear-gradient(135deg, ${C.pink} 0%, #c0113b 100%)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0,
                }}
              >
                {initials}
              </div>
              <span
                style={{
                  position: 'absolute', bottom: 0, right: 0,
                  height: 8, width: 8, borderRadius: 9999,
                  backgroundColor: C.mint,
                  border: `1.5px solid ${C.canvas}`,
                }}
              />
            </div>
            <div className="hidden sm:block" style={{ textAlign: 'left' }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: C.bodyStrong, lineHeight: 1.2 }}>{userName.split(' ')[0]}</p>
              <p style={{ fontSize: 10, fontWeight: 500, color: C.mutedSoft, lineHeight: 1.2 }}>{roleLabelMap[userRole] ?? userRole}</p>
            </div>
            <ChevronDown
              className={cn('h-3.5 w-3.5 transition-transform duration-200', userMenuOpen ? 'rotate-180' : '')}
              style={{ color: C.mutedSoft }}
            />
          </button>

          {/* User Dropdown */}
          {userMenuOpen && (
            <div
              className="animate-in fade-in slide-in-from-top-2 duration-200"
              style={{
                position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                width: 220,
                backgroundColor: C.canvas,
                border: `1px solid ${C.hairline}`,
                borderRadius: 16,
                zIndex: 50, overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(10,10,10,0.08)',
              }}
            >
              {/* Identity panel */}
              <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.hairlineSoft}` }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: C.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName}</p>
                <p style={{ fontSize: 11, fontWeight: 500, color: C.muted, marginTop: 2 }}>{roleLabelMap[userRole] ?? userRole}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6 }}>
                  <span style={{ height: 7, width: 7, borderRadius: 9999, backgroundColor: C.mint }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: C.mint }}>Online</span>
                </div>
              </div>

              {/* Menu items */}
              <div style={{ padding: '4px 0' }}>
                {[
                  { icon: User, label: 'Profil Saya' },
                  { icon: Settings, label: 'Pengaturan' },
                ].map(({ icon: Icon, label }) => (
                  <button
                    key={label}
                    disabled
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                      padding: '9px 16px',
                      fontSize: 13, fontWeight: 500, color: C.muted,
                      background: 'none', border: 'none', cursor: 'not-allowed',
                      textAlign: 'left',
                    }}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                    <span style={{ marginLeft: 'auto', fontSize: 10, color: C.mutedSoft }}>Segera</span>
                  </button>
                ))}
              </div>

              {/* Logout — Clay btn-clay-danger style */}
              <div style={{ padding: '4px 0', borderTop: `1px solid ${C.hairlineSoft}` }}>
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="clay-press"
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                      padding: '9px 16px',
                      fontSize: 13, fontWeight: 600,
                      color: '#9d174d',      /* Clay badge-rejected text */
                      background: 'none', border: 'none', cursor: 'pointer',
                      textAlign: 'left',
                      borderRadius: '0 0 16px 16px',
                      transition: 'background-color 120ms',
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#fce7f3'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'}
                  >
                    <LogOut className="h-4 w-4" />
                    Keluar dari Sistem
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
