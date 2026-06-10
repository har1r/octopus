'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { UserRole } from '@prisma/client';
import {
  BarChart3,
  BookOpen,
  ChevronDown,
  ChevronRight,
  FileCheck,
  FileClock,
  FileSpreadsheet,
  FileText,
  FolderLock,
  FolderSync,
  Grid3X3,
  LayoutDashboard,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  Truck,
} from 'lucide-react';
import { ArchitaxLogo } from '@/components/shared/logo';

/*
 * Clay Design Tokens (inline for portability)
 * source: DESIGN_CLAY.md
 */
const C = {
  surfaceSoft:    '#faf5e8',   // sidebar background
  surfaceCard:    '#f5f0e0',   // hover / sub-item bg
  surfaceStrong:  '#ebe6d6',   // active item bg
  hairline:       '#e5e5e5',   // 1px borders
  hairlineSoft:   '#f0f0f0',   // dividers inside nav
  ink:            '#0a0a0a',   // active text
  bodyStrong:     '#1a1a1a',   // username, nav text active
  body:           '#3a3a3a',   // default text
  muted:          '#6a6a6a',   // section labels, inactive nav
  mutedSoft:      '#9a9a9a',   // captions
  pink:           '#ff4d8b',   // Architax brand accent (active pill, avatar)
  mint:           '#a4d4c5',   // online dot
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

interface SubMenuItem { name: string; href: string; }
interface MenuItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  allowedRoles: UserRole[];
  badge?: string;
  children?: SubMenuItem[];
  sectionLabel?: string;
}

// ─── Menu Definition ──────────────────────────────────────────────────────────

const menuItems: MenuItem[] = [
  {
    sectionLabel: 'Ringkasan',
    name: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard className="h-[17px] w-[17px]" />,
    allowedRoles: ['STAF_PENGINPUT', 'STAF_PENELITI', 'STAF_PENGARSIP', 'STAF_PENGIRIM', 'STAF_PEMANTAU', 'SUPERVISOR'],
  },
  {
    sectionLabel: 'Permohonan',
    name: 'Permohonan Saya',
    href: '/permohonan',
    icon: <FileText className="h-[17px] w-[17px]" />,
    allowedRoles: ['STAF_PENGINPUT'],
  },
  {
    name: 'Revisi Permohonan',
    href: '/permohonan/revisi',
    icon: <FileClock className="h-[17px] w-[17px]" />,
    allowedRoles: ['STAF_PENGINPUT'],
  },
  {
    sectionLabel: 'Penelitian',
    name: 'Antrean Validasi',
    href: '/permohonan/queue',
    icon: <FileCheck className="h-[17px] w-[17px]" />,
    allowedRoles: ['STAF_PENELITI'],
  },
  {
    name: 'Bundling Berkas',
    href: '/bundle',
    icon: <Package className="h-[17px] w-[17px]" />,
    allowedRoles: ['STAF_PENELITI'],
    children: [
      { name: 'Daftar Bundle', href: '/bundle' },
      { name: 'Riwayat Bundle', href: '/bundle/history' },
    ],
  },
  {
    sectionLabel: 'Pengarsipan',
    name: 'Pengarsipan',
    href: '/arsip',
    icon: <FileSpreadsheet className="h-[17px] w-[17px]" />,
    allowedRoles: ['STAF_PENGARSIP'],
  },
  {
    sectionLabel: 'Pengiriman',
    name: 'Manifest Pengiriman',
    href: '/manifest',
    icon: <FolderSync className="h-[17px] w-[17px]" />,
    allowedRoles: ['STAF_PENGIRIM'],
    children: [
      { name: 'Manifest', href: '/manifest' },
      { name: 'Pengiriman', href: '/manifest/shipping' },
    ],
  },
  {
    sectionLabel: 'Monitoring',
    name: 'Monitoring Berkas',
    href: '/monitoring',
    icon: <Grid3X3 className="h-[17px] w-[17px]" />,
    allowedRoles: ['STAF_PEMANTAU', 'SUPERVISOR'],
  },
  {
    sectionLabel: 'Manajemen',
    name: 'Analytics',
    href: '/analytics',
    icon: <BarChart3 className="h-[17px] w-[17px]" />,
    allowedRoles: ['SUPERVISOR'],
  },
  {
    name: 'Audit Log',
    href: '/audit',
    icon: <FolderLock className="h-[17px] w-[17px]" />,
    allowedRoles: ['SUPERVISOR'],
  },
];

// ─── Role metadata ────────────────────────────────────────────────────────────

const roleLabelMap: Record<string, string> = {
  STAF_PENGINPUT: 'Staf Penginput',
  STAF_PENELITI: 'Staf Peneliti',
  STAF_PENGARSIP: 'Staf Pengarsip',
  STAF_PENGIRIM: 'Staf Pengirim',
  STAF_PEMANTAU: 'Staf Pemantau',
  SUPERVISOR: 'Supervisor',
};

/*
 * Role badge colors using Clay brand palette:
 * — pill shape, cream-adjacent fills, saturated text
 */
const roleBadgeMap: Record<string, { bg: string; text: string; border: string }> = {
  STAF_PENGINPUT: { bg: '#dbeafe', text: '#1e40af', border: '#bfdbfe' },
  STAF_PENELITI:  { bg: '#ede9fe', text: '#5b21b6', border: '#ddd6fe' },
  STAF_PENGARSIP: { bg: '#fef3c7', text: '#92400e', border: '#fde68a' },
  STAF_PENGIRIM:  { bg: '#ccfbf1', text: '#115e59', border: '#99f6e4' },
  STAF_PEMANTAU:  { bg: '#e0e7ff', text: '#3730a3', border: '#c7d2fe' },
  SUPERVISOR:     { bg: '#fce7f3', text: '#9d174d', border: '#fbcfe8' },
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface AppSidebarProps {
  userRole: UserRole;
  userName: string;
  collapsed: boolean;
  onToggle: () => void;
  onMobileClose?: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function AppSidebar({ userRole, userName, collapsed, onToggle, onMobileClose }: AppSidebarProps) {
  const pathname = usePathname();
  const filteredMenu = menuItems.filter(item => item.allowedRoles.includes(userRole));

  const [expandedItems, setExpandedItems] = React.useState<Set<string>>(() => {
    const initial = new Set<string>();
    filteredMenu.forEach(item => {
      if (item.children) {
        const childActive = item.children.some(c => pathname === c.href || pathname.startsWith(c.href + '/'));
        if (childActive) initial.add(item.href);
      }
    });
    return initial;
  });

  const toggleExpanded = (href: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      next.has(href) ? next.delete(href) : next.add(href);
      return next;
    });
  };

  const isItemActive = (item: MenuItem): boolean => {
    if (item.children) return item.children.some(c => pathname === c.href || pathname.startsWith(c.href + '/'));
    if (pathname === item.href) return true;
    if (item.href === '/dashboard') return false;
    const isSubPath = pathname.startsWith(item.href + '/');
    if (!isSubPath) return false;
    const hasMoreSpecific = filteredMenu.some(other =>
      other.href !== item.href &&
      other.href.startsWith(item.href + '/') &&
      (pathname === other.href || pathname.startsWith(other.href + '/'))
    );
    return !hasMoreSpecific;
  };

  // Build display list injecting section headers
  const displayItems: (MenuItem & { _isSection?: never } | { _isSection: true; label: string; key: string })[] = [];
  const seenSections = new Set<string>();
  filteredMenu.forEach(item => {
    if (item.sectionLabel && !seenSections.has(item.sectionLabel)) {
      seenSections.add(item.sectionLabel);
      displayItems.push({ _isSection: true, label: item.sectionLabel, key: `section-${item.sectionLabel}` });
    }
    displayItems.push(item);
  });

  const initials = userName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const roleBadge = roleBadgeMap[userRole] ?? { bg: C.surfaceCard, text: C.body, border: C.hairline };

  return (
    /*
     * Sidebar surface → Clay surface-soft (#faf5e8)
     * Separator → 1px hairline (#e5e5e5) — NO shadow
     * Width transition → cubic-bezier smooth
     */
    <aside
      style={{ backgroundColor: C.surfaceSoft, borderRight: `1px solid ${C.hairline}` }}
      className={cn(
        'h-full flex flex-col flex-shrink-0',
        'transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden',
        collapsed ? 'w-[64px]' : 'w-[240px]',
      )}
    >
      {/* ── Brand / Logo ──────────────────────────────── */}
      <div
        style={{ borderBottom: `1px solid ${C.hairline}`, height: 60 }}
        className={cn(
          'flex items-center flex-shrink-0',
          collapsed ? 'justify-center px-3' : 'px-4 gap-3'
        )}
      >
        <div className="flex-shrink-0">
          <ArchitaxLogo size={28} />
        </div>
        {!collapsed && (
          /* Clay display font: Plus Jakarta Sans 800, tight tracking */
          <span
            className="font-display whitespace-nowrap overflow-hidden"
            style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.04em', color: C.ink }}
          >
            Archi<span style={{ color: C.pink }}>tax</span>
          </span>
        )}
      </div>

      {/* ── Navigation ────────────────────────────────── */}
      <nav className={cn('flex-1 overflow-y-auto py-2', collapsed ? 'px-1.5' : 'px-2.5')}>
        {displayItems.map((item) => {
          // Section header
          if ('_isSection' in item && item._isSection) {
            if (collapsed) return null;
            return (
              <p
                key={item.key}
                className="clay-caption-upper select-none"
                style={{
                  color: C.mutedSoft,
                  padding: '16px 10px 4px',
                  marginTop: 4,
                }}
              >
                {item.label}
              </p>
            );
          }

          const menuItem = item as MenuItem;
          const active = isItemActive(menuItem);
          const hasChildren = !!menuItem.children?.length;
          const isExpanded = expandedItems.has(menuItem.href);

          /* Shared nav-item styles */
          const itemBase: React.CSSProperties = {
            borderRadius: 8, /* Clay rounded.sm = 8px for nav items */
            minHeight: 40,   /* WCAG touch target */
            padding: collapsed ? '10px 8px' : '10px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: collapsed ? 0 : 10,
            justifyContent: collapsed ? 'center' : 'flex-start',
            width: '100%',
            cursor: 'pointer',
            transition: 'background-color 120ms ease-out, transform 120ms ease-out',
            fontSize: 14,
            fontWeight: 500,
            letterSpacing: 0,
            border: 'none',
            textDecoration: 'none',
          };

          const activeStyles: React.CSSProperties = {
            backgroundColor: C.surfaceStrong,
            color: C.ink,
          };
          const inactiveStyles: React.CSSProperties = {
            backgroundColor: 'transparent',
            color: C.muted,
          };

          if (hasChildren) {
            return (
              <div key={menuItem.href}>
                <button
                  onClick={() => {
                    if (collapsed) {
                      onToggle();
                      setTimeout(() => setExpandedItems(prev => new Set(prev).add(menuItem.href)), 310);
                    } else {
                      toggleExpanded(menuItem.href);
                    }
                  }}
                  title={collapsed ? menuItem.name : undefined}
                  className="group clay-press"
                  style={{
                    ...itemBase,
                    ...(active ? activeStyles : inactiveStyles),
                  }}
                  onMouseEnter={e => {
                    if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = C.surfaceCard;
                  }}
                  onMouseLeave={e => {
                    if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                  }}
                >
                  {/* Active indicator pill */}
                  {active && !collapsed && (
                    <span
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 3,
                        height: '55%',
                        borderRadius: '0 3px 3px 0',
                        backgroundColor: C.pink,
                      }}
                    />
                  )}
                  <span style={{ color: active ? C.pink : C.muted, flexShrink: 0, transition: 'color 120ms' }}>
                    {menuItem.icon}
                  </span>
                  {!collapsed && (
                    <>
                      <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {menuItem.name}
                      </span>
                      <ChevronDown
                        className={cn('h-3.5 w-3.5 flex-shrink-0 transition-transform duration-200', isExpanded ? 'rotate-180' : '')}
                        style={{ color: C.mutedSoft }}
                      />
                    </>
                  )}
                </button>

                {/* Sub-menu */}
                {!collapsed && isExpanded && (
                  <div
                    style={{ marginLeft: 12, paddingLeft: 10, borderLeft: `1px solid ${C.hairlineSoft}`, marginBottom: 2 }}
                    className="space-y-0.5 mt-0.5"
                  >
                    {menuItem.children!.map(child => {
                      const childActive = pathname === child.href || pathname.startsWith(child.href + '/');
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={onMobileClose}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '7px 10px',
                            borderRadius: 6,
                            fontSize: 13,
                            fontWeight: childActive ? 600 : 500,
                            color: childActive ? C.ink : C.muted,
                            backgroundColor: childActive ? C.surfaceCard : 'transparent',
                            textDecoration: 'none',
                            minHeight: 36,
                            transition: 'background-color 100ms',
                          }}
                          onMouseEnter={e => {
                            if (!childActive) (e.currentTarget as HTMLElement).style.backgroundColor = C.surfaceCard;
                          }}
                          onMouseLeave={e => {
                            if (!childActive) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                          }}
                        >
                          <ChevronRight className="h-3 w-3 flex-shrink-0" style={{ color: C.mutedSoft, opacity: 0.6 }} />
                          {child.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={menuItem.href}
              href={menuItem.href}
              onClick={onMobileClose}
              title={collapsed ? menuItem.name : undefined}
              className="relative clay-press block"
              style={{ ...itemBase, ...(active ? activeStyles : inactiveStyles) }}
              onMouseEnter={e => {
                if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = C.surfaceCard;
              }}
              onMouseLeave={e => {
                if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
              }}
            >
              {/* Active left-edge pill indicator */}
              {active && !collapsed && (
                <span
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 3,
                    height: '55%',
                    borderRadius: '0 3px 3px 0',
                    backgroundColor: C.pink,
                  }}
                />
              )}
              <span style={{ color: active ? C.pink : C.muted, flexShrink: 0, transition: 'color 120ms' }}>
                {menuItem.icon}
              </span>
              {!collapsed && (
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {menuItem.name}
                </span>
              )}
              {!collapsed && menuItem.badge && (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: 9999,
                    backgroundColor: C.pink,
                    color: '#fff',
                    marginLeft: 'auto',
                  }}
                >
                  {menuItem.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── User Footer ───────────────────────────────── */}
      <div
        style={{ borderTop: `1px solid ${C.hairline}`, backgroundColor: C.surfaceCard }}
        className={cn('flex-shrink-0', collapsed ? 'p-2.5 flex justify-center' : 'p-3')}
      >
        {collapsed ? (
          <div
            title={`${userName} · ${roleLabelMap[userRole] ?? userRole}`}
            style={{
              height: 36, width: 36,
              borderRadius: 9999,
              background: `linear-gradient(135deg, ${C.pink} 0%, #c0113b 100%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 12, fontWeight: 700,
              cursor: 'default', flexShrink: 0,
            }}
          >
            {initials}
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            {/* Avatar + online dot */}
            <div className="relative flex-shrink-0">
              <div
                style={{
                  height: 36, width: 36, borderRadius: 9999,
                  background: `linear-gradient(135deg, ${C.pink} 0%, #c0113b 100%)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 12, fontWeight: 700,
                }}
              >
                {initials}
              </div>
              {/* Online dot — Clay brand-mint */}
              <span
                style={{
                  position: 'absolute', bottom: 0, right: 0,
                  height: 10, width: 10, borderRadius: 9999,
                  backgroundColor: C.mint,
                  border: `2px solid ${C.surfaceCard}`,
                }}
              />
            </div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: C.bodyStrong, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.3 }}>
                {userName}
              </p>
              {/* Role badge — Clay badge-pill style */}
              <span
                style={{
                  display: 'inline-block',
                  marginTop: 2,
                  fontSize: 10, fontWeight: 600,
                  padding: '1px 7px',
                  borderRadius: 9999,
                  lineHeight: 1.6,
                  backgroundColor: roleBadge.bg,
                  color: roleBadge.text,
                  border: `1px solid ${roleBadge.border}`,
                }}
              >
                {roleLabelMap[userRole] ?? userRole}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Collapse Toggle ───────────────────────────── */}
      <button
        onClick={onToggle}
        style={{
          height: 40,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 6,
          flexShrink: 0,
          width: '100%',
          cursor: 'pointer',
          fontSize: 12, fontWeight: 500,
          color: C.muted,
          backgroundColor: 'transparent',
          borderTop: `1px solid ${C.hairline}`,
          borderLeft: 'none',
          borderRight: 'none',
          borderBottom: 'none',
          transition: 'background-color 120ms, color 120ms',
          paddingLeft: collapsed ? 0 : 16,
          paddingRight: collapsed ? 0 : 16,
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.backgroundColor = C.surfaceCard;
          (e.currentTarget as HTMLElement).style.color = C.bodyStrong;
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
          (e.currentTarget as HTMLElement).style.color = C.muted;
        }}
        className="clay-press"
      >
        {collapsed
          ? <PanelLeftOpen className="h-4 w-4" />
          : <><PanelLeftClose className="h-4 w-4" /><span>Perkecil Panel</span></>
        }
      </button>
    </aside>
  );
}
