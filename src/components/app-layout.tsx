'use client';

import * as React from 'react';
import { Menu, X } from 'lucide-react';
import { AppSidebar } from '@/components/app-sidebar';
import { AppNavbar } from '@/components/app-navbar';
import { UserRole } from '@prisma/client';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
  userName: string;
  userRole: UserRole;
}

const COLLAPSED_KEY = 'archivtax_sidebar_collapsed';

export function AppLayout({ children, userName, userRole }: AppLayoutProps) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const saved = localStorage.getItem(COLLAPSED_KEY);
    if (saved === 'true') setCollapsed(true);
    setMounted(true);
  }, []);

  const handleToggleCollapse = () => {
    setCollapsed(prev => {
      const next = !prev;
      localStorage.setItem(COLLAPSED_KEY, String(next));
      return next;
    });
  };

  return (
    /*
     * Root shell — Clay canvas (#fffaf0) as the page floor.
     * No heavy shadow, no gradient — depth comes from hairline borders.
     */
    <div className="flex h-screen overflow-hidden font-sans" style={{ backgroundColor: '#fffaf0' }}>

      {/* ── Desktop Sidebar ───────────────────────────── */}
      <div className={cn(
        'hidden md:block h-full flex-shrink-0 relative',
        !mounted && 'opacity-0'
      )}>
        <AppSidebar
          userRole={userRole}
          userName={userName}
          collapsed={collapsed}
          onToggle={handleToggleCollapse}
        />
      </div>

      {/* ── Mobile Sidebar Drawer ─────────────────────── */}
      <div
        className={cn(
          'fixed inset-0 z-50 md:hidden transition-all duration-300',
          mobileOpen ? 'pointer-events-auto' : 'pointer-events-none'
        )}
      >
        {/* Backdrop — warm dark, not cool gray */}
        <div
          onClick={() => setMobileOpen(false)}
          className={cn(
            'absolute inset-0 backdrop-blur-sm transition-opacity duration-300',
            mobileOpen ? 'opacity-100' : 'opacity-0'
          )}
          style={{ backgroundColor: 'rgba(10,26,26,0.45)' }}
        />
        {/* Drawer */}
        <div
          className={cn(
            'absolute left-0 top-0 h-full',
            'transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {/* Close button — Clay surface-card bg + hairline */}
          <div className="absolute top-3 right-[-44px] z-10">
            <button
              onClick={() => setMobileOpen(false)}
              className="h-9 w-9 flex items-center justify-center rounded-[8px] border border-[#e5e5e5] transition-all duration-150 active:scale-95 clay-press"
              style={{ backgroundColor: '#faf5e8', color: '#6a6a6a' }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <AppSidebar
            userRole={userRole}
            userName={userName}
            collapsed={false}
            onToggle={() => setMobileOpen(false)}
            onMobileClose={() => setMobileOpen(false)}
          />
        </div>
      </div>

      {/* ── Main Column ───────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Navbar — sits on surface-soft */}
        <AppNavbar
          userName={userName}
          userRole={userRole}
          mobileMenuButton={
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden h-11 w-11 flex items-center justify-center rounded-[8px] border border-[#e5e5e5] clay-press flex-shrink-0"
              style={{ color: '#6a6a6a' }}
              aria-label="Buka menu navigasi"
            >
              <Menu className="h-5 w-5" />
            </button>
          }
        />

        {/* ── Content Area — Canvas floor (#fffaf0) ── */}
        <main className="flex-1 overflow-y-auto" style={{ backgroundColor: '#fffaf0' }}>
          <div className="min-h-full p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
