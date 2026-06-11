// src/components/app-sidebar.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserRole } from '@prisma/client';

interface MenuItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  allowedRoles: UserRole[];
  badge?: React.ReactNode;
}

interface AppSidebarProps {
  userRole: UserRole;
  userName: string;
  collapsed: boolean;
  onToggle: () => void;
  onMobileClose?: () => void;
}

export function AppSidebar({ userRole, userName, collapsed, onToggle, onMobileClose }: AppSidebarProps) {
  const pathname = usePathname();

  // Clay Concentric Circles Logo SVG
  const ClayLogo = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" stroke="#FF52C2" strokeWidth="2.5" />
      <circle cx="12" cy="12" r="7.5" stroke="#8B5CF6" strokeWidth="2.5" />
      <circle cx="12" cy="12" r="5" stroke="#3BD3FD" strokeWidth="2.5" />
      <circle cx="12" cy="12" r="2.5" fill="#F58C50" />
    </svg>
  );

  // Custom SVG Icons
  const HomeIcon = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );

  const FindLeadsIcon = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );

  const SignalsIcon = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12h5l2 9 4-18 3 12h5" />
    </svg>
  );

  const AdsIcon = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 5L6 9H2v6h4l5 4V5z" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  );

  const CampaignsIcon = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );

  const ClaygentsIcon = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a10 10 0 0 1 8 4h-8V2zM12 22a10 10 0 0 1-8-4h8v4zM2 12a10 10 0 0 1 4-8v8H2zM22 12a10 10 0 0 1-4 8v-8h4z" />
    </svg>
  );

  const FunctionsIcon = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );

  const McpIcon = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
      <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
      <line x1="6" y1="6" x2="6.01" y2="6" />
      <line x1="6" y1="18" x2="6.01" y2="18" />
    </svg>
  );

  const ExportsIcon = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );

  const TrashIcon = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );

  const SettingsIcon = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );

  const AiContextIcon = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="M12 6v12" />
      <path d="M8 10h8" />
      <path d="M8 14h8" />
    </svg>
  );

  const ResourcesIcon = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5v-15z" />
    </svg>
  );

  // Amber Upgrade Badge style
  const UpgradeBadge = (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '2px',
        backgroundColor: '#FEF3C7',
        color: '#B45309',
        fontSize: '9px',
        fontWeight: 'bold',
        padding: '1px 5px',
        borderRadius: '9999px',
        marginLeft: 'auto',
      }}
    >
      🔗 Upgrade
    </span>
  );

  // Indigo Beta Badge style
  const BetaBadge = (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        backgroundColor: '#EEF2FF',
        color: '#4F46E5',
        fontSize: '9px',
        fontWeight: 'bold',
        padding: '1px 5px',
        borderRadius: '9999px',
        border: '1px solid #C7D2FE',
        marginLeft: 'auto',
      }}
    >
      Beta
    </span>
  );

  const ALL_ROLES = [
    UserRole.STAF_PENGINPUT,
    UserRole.STAF_PENELITI,
    UserRole.STAF_PENGARSIP,
    UserRole.STAF_PENGIRIM,
    UserRole.STAF_PEMANTAU,
    UserRole.SUPERVISOR,
  ];

  // Menu items mapping
  const primaryNavItems: MenuItem[] = [
    { name: 'Home', href: '/dashboard', icon: HomeIcon, allowedRoles: ALL_ROLES },
    { name: 'Find leads', href: '/permohonan', icon: FindLeadsIcon, allowedRoles: ALL_ROLES },
  ];

  const orchestrationNavItems: MenuItem[] = [
    {
      name: 'Signals',
      href: userRole === 'STAF_PENELITI' ? '/permohonan/queue' : userRole === 'STAF_PENGINPUT' ? '/permohonan/revisi' : '/permohonan',
      icon: SignalsIcon,
      allowedRoles: ALL_ROLES,
    },
    { name: 'Ads', href: '/manifest', icon: AdsIcon, allowedRoles: ALL_ROLES, badge: UpgradeBadge },
    { name: 'Campaigns', href: '/bundle', icon: CampaignsIcon, allowedRoles: ALL_ROLES },
    { name: 'Claygents', href: '/ai', icon: ClaygentsIcon, allowedRoles: ALL_ROLES },
    { name: 'Functions', href: '/monitoring', icon: FunctionsIcon, allowedRoles: ALL_ROLES },
    { name: 'MCP', href: '/analytics', icon: McpIcon, allowedRoles: ALL_ROLES, badge: BetaBadge },
  ];

  const bottomNavItems: MenuItem[] = [
    { name: 'Exports', href: '/arsip', icon: ExportsIcon, allowedRoles: ALL_ROLES },
    { name: 'Trash', href: '/audit', icon: TrashIcon, allowedRoles: ALL_ROLES },
    { name: 'Settings', href: '/audit', icon: SettingsIcon, allowedRoles: ALL_ROLES },
    { name: 'AI context', href: '/ai', icon: AiContextIcon, allowedRoles: ALL_ROLES },
    { name: 'Resources', href: '/permohonan', icon: ResourcesIcon, allowedRoles: ALL_ROLES },
  ];

  const renderLinkItem = (item: MenuItem) => {
    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'));

    return (
      <Link
        key={item.name}
        href={item.href}
        onClick={onMobileClose}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: collapsed ? '0' : '8px',
          padding: '6px 12px',
          margin: '2px 8px',
          borderRadius: '5px',
          fontSize: '12.5px',
          fontWeight: 500,
          color: isActive ? '#1D4ED8' : '#4b5563',
          backgroundColor: isActive ? '#EFF6FF' : 'transparent',
          textDecoration: 'none',
          transition: 'all 120ms',
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = '#f3f4f6';
            e.currentTarget.style.color = '#111827';
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#4b5563';
          }
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: isActive ? '#1D4ED8' : '#6B7280' }}>
          {item.icon}
        </span>
        {!collapsed && (
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {item.name}
          </span>
        )}
        {!collapsed && item.badge}
      </Link>
    );
  };

  return (
    <aside
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: collapsed ? '56px' : '200px',
        height: '100%',
        backgroundColor: '#ffffff',
        borderRight: '1px solid #E5E7EB',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        overflowY: 'auto',
        transition: 'width 200ms ease-in-out',
      }}
    >
      {/* Sidebar Header Logo & Toggle Button at the top */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          height: '46px',
          padding: collapsed ? '0' : '0 12px 0 16px',
          borderBottom: '1px solid #F3F4F6',
          flexShrink: 0,
          justifyContent: collapsed ? 'center' : 'space-between',
        }}
      >
        {!collapsed ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {ClayLogo}
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#111827',
                  letterSpacing: '-0.02em',
                }}
              >
                Architax
              </span>
            </div>
            {/* Collapse toggle button on expanded */}
            <button
              onClick={onToggle}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'none',
                border: 'none',
                color: '#6B7280',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
                transition: 'background-color 100ms',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F3F4F6')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              title="Collapse sidebar"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          </>
        ) : (
          /* When collapsed, show only the logo as a button that re-opens the sidebar */
          <button
            onClick={onToggle}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '4px',
              transition: 'background-color 100ms',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F3F4F6')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            title="Expand sidebar"
          >
            {ClayLogo}
          </button>
        )}
      </div>

      {/* Primary Navigation */}
      <div style={{ marginTop: '12px' }}>
        {primaryNavItems.map(renderLinkItem)}
      </div>

      {/* Orchestration Section */}
      <div style={{ marginTop: '16px' }}>
        {!collapsed && (
          <p
            style={{
              fontSize: '10px',
              fontWeight: 'bold',
              color: '#9CA3AF',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              padding: '0 20px',
              margin: '0 0 6px 0',
            }}
          >
            Orchestration
          </p>
        )}
        {orchestrationNavItems.map(renderLinkItem)}
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Bottom Section Navigation */}
      <div style={{ paddingBottom: '12px', borderTop: '1px solid #F3F4F6', paddingTop: '8px' }}>
        {bottomNavItems.map(renderLinkItem)}
      </div>
    </aside>
  );
}
