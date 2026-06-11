// src/components/app-navbar.tsx
'use client';

import * as React from 'react';
import { logoutAction } from '@/actions/auth.actions';
import { UserRole } from '@prisma/client';

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

const mockNotifications: Notification[] = [
  { id: '1', title: 'Permohonan Baru', body: 'Berkas BRK-2026-00142 menunggu validasi.', time: '2 mnt lalu', unread: true },
  { id: '2', title: 'Revisi Diminta', body: 'BRK-2026-00138 dikembalikan untuk revisi.', time: '14 mnt lalu', unread: true },
];

export function AppNavbar({ userName, userRole, mobileMenuButton }: AppNavbarProps) {
  const [notifOpen, setNotifOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);

  const notifRef = React.useRef<HTMLDivElement>(null);
  const userMenuRef = React.useRef<HTMLDivElement>(null);
  const unreadCount = mockNotifications.filter(n => n.unread).length;

  // Click-outside listner
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Custom SVG Icons
  const GridIcon = (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );

  const HelpIcon = (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );

  const BellIcon = (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );

  const LogOutIcon = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );

  return (
    <header
      style={{
        height: '46px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #F3F4F6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        flexShrink: 0,
        zIndex: 40,
        position: 'relative',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      {/* Left items (mobile toggle wrapper) */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {mobileMenuButton}
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Right Aligned Area */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Blue Upgrade Button */}
        <button
          style={{
            backgroundColor: '#2563EB',
            color: '#ffffff',
            border: 'none',
            borderRadius: '4px',
            height: '26px',
            padding: '0 10px',
            fontSize: '11px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            transition: 'background-color 100ms',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1d4ed8')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2563EB')}
        >
          ⚡ Upgrade your plan
        </button>

        {/* Grid Icon */}
        <button
          style={{
            background: 'none',
            border: 'none',
            color: '#6B7280',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            padding: 0,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#111827')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#6B7280')}
          title="Grid"
        >
          {GridIcon}
        </button>

        {/* Help Icon */}
        <button
          style={{
            background: 'none',
            border: 'none',
            color: '#6B7280',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            padding: 0,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#111827')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#6B7280')}
          title="Bantuan"
        >
          {HelpIcon}
        </button>

        {/* Bell Notifications */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }} ref={notifRef}>
          <button
            onClick={() => {
              setNotifOpen((p) => !p);
              setUserMenuOpen(false);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: notifOpen ? '#1D4ED8' : '#6B7280',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: 0,
              position: 'relative',
            }}
            onMouseEnter={(e) => {
              if (!notifOpen) e.currentTarget.style.color = '#111827';
            }}
            onMouseLeave={(e) => {
              if (!notifOpen) e.currentTarget.style.color = '#6B7280';
            }}
            title="Notifikasi"
          >
            {BellIcon}
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  backgroundColor: '#EF4444',
                  color: '#ffffff',
                  width: '6px',
                  height: '6px',
                  borderRadius: '999px',
                }}
              />
            )}
          </button>

          {/* Notifications Dropdown */}
          {notifOpen && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '24px',
                width: '260px',
                backgroundColor: '#ffffff',
                border: '1px solid #E5E7EB',
                borderRadius: '6px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                zIndex: 50,
                padding: '4px 0',
              }}
            >
              <div style={{ padding: '8px 12px', borderBottom: '1px solid #F3F4F6', fontSize: '11px', fontWeight: 'bold', color: '#111827' }}>
                Notifications
              </div>
              {mockNotifications.map((n) => (
                <div
                  key={n.id}
                  style={{
                    padding: '8px 12px',
                    borderBottom: '1px solid #F3F4F6',
                    fontSize: '11px',
                    backgroundColor: n.unread ? '#EFF6FF' : '#ffffff',
                  }}
                >
                  <p style={{ fontWeight: 'bold', color: '#111827', margin: 0 }}>{n.title}</p>
                  <p style={{ color: '#4B5563', margin: '2px 0 0 0', lineHeight: 1.3 }}>{n.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Red circle "M" avatar dropdown */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }} ref={userMenuRef}>
          <button
            onClick={() => {
              setUserMenuOpen((p) => !p);
              setNotifOpen(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#EF4444', // Red avatar background
              color: '#ffffff',
              border: 'none',
              borderRadius: '9999px',
              height: '24px',
              width: '24px',
              fontSize: '11px',
              fontWeight: 'bold',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            M
          </button>

          {/* User Profile Dropdown */}
          {userMenuOpen && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '28px',
                width: '180px',
                backgroundColor: '#ffffff',
                border: '1px solid #E5E7EB',
                borderRadius: '6px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                zIndex: 50,
                padding: '4px 0',
              }}
            >
              <div style={{ padding: '8px 12px', borderBottom: '1px solid #F3F4F6' }}>
                <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {userName}
                </p>
                <p style={{ fontSize: '9.5px', color: '#6B7280', margin: '2px 0 0 0' }}>
                  {userRole}
                </p>
              </div>

              <form action={logoutAction} style={{ margin: 0 }}>
                <button
                  type="submit"
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    color: '#EF4444',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fef2f2')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  {LogOutIcon}
                  Sign out
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
