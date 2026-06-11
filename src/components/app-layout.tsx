// src/components/app-layout.tsx
'use client';

import * as React from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { AppNavbar } from '@/components/app-navbar';
import { UserRole } from '@prisma/client';

interface AppLayoutProps {
  children: React.ReactNode;
  userName: string;
  userRole: UserRole;
}

const COLLAPSED_KEY = 'archivtax_sidebar_collapsed';

export function AppLayout({ children, userName, userRole }: AppLayoutProps) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const saved = localStorage.getItem(COLLAPSED_KEY);
    if (saved === 'true') setCollapsed(true);
    setMounted(true);

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleToggleCollapse = () => {
    setCollapsed(prev => {
      const next = !prev;
      localStorage.setItem(COLLAPSED_KEY, String(next));
      return next;
    });
  };

  if (!mounted) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#ffffff' }} />
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        backgroundColor: '#ffffff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      {/* Sidebar (Desktop) */}
      {!isMobile && (
        <div style={{ height: '100%', flexShrink: 0, position: 'relative' }}>
          <AppSidebar
            userRole={userRole}
            userName={userName}
            collapsed={collapsed}
            onToggle={handleToggleCollapse}
          />
        </div>
      )}

      {/* Sidebar Mobile Overlay / Drawer */}
      {isMobile && mobileOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            display: 'flex',
          }}
        >
          {/* Backdrop */}
          <div
            onClick={() => setMobileOpen(false)}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.4)',
              backdropFilter: 'blur(4px)',
            }}
          />
          {/* Drawer Container */}
          <div
            style={{
              position: 'relative',
              height: '100%',
              zIndex: 51,
              boxShadow: '4px 0 24px rgba(15, 23, 42, 0.15)',
            }}
          >
            <AppSidebar
              userRole={userRole}
              userName={userName}
              collapsed={false}
              onToggle={() => setMobileOpen(false)}
              onMobileClose={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Container Column */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minWidth: 0,
          backgroundColor: '#ffffff',
        }}
      >
        {/* Navbar Header (Height 46px) */}
        <AppNavbar
          userName={userName}
          userRole={userRole}
          mobileMenuButton={
            isMobile ? (
              <button
                onClick={() => setMobileOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 30,
                  width: 30,
                  borderRadius: 6,
                  border: '1px solid #E5E7EB',
                  backgroundColor: '#ffffff',
                  color: '#6B7280',
                  cursor: 'pointer',
                  marginRight: 8,
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              </button>
            ) : null
          }
        />

        {/* Content Area Viewport - padding: 24px 32px, white bg */}
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            backgroundColor: '#ffffff',
            padding: '24px 32px',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
