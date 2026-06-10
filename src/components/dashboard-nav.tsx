'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { UserRole } from '@prisma/client';
import { 
  BarChart3, 
  BookOpen, 
  FileCheck, 
  FileClock, 
  FileSpreadsheet, 
  FileText, 
  FolderLock, 
  FolderSync, 
  Grid3X3, 
  LayoutDashboard, 
  Package, 
  Truck, 
} from 'lucide-react';

interface MenuItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  allowedRoles: UserRole[];
}

const menuItems: MenuItem[] = [
  // ALL ROLES
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
    allowedRoles: ['STAF_PENGINPUT', 'STAF_PENELITI', 'STAF_PENGARSIP', 'STAF_PENGIRIM', 'STAF_PEMANTAU', 'SUPERVISOR'],
  },
  // STAF_PENGINPUT
  {
    name: 'Permohonan Saya',
    href: '/permohonan',
    icon: <FileText className="h-5 w-5" />,
    allowedRoles: ['STAF_PENGINPUT'],
  },
  {
    name: 'Revisi',
    href: '/permohonan/revisi',
    icon: <FileClock className="h-5 w-5" />,
    allowedRoles: ['STAF_PENGINPUT'],
  },
  // STAF_PENELITI
  {
    name: 'Antrean Validasi',
    href: '/permohonan/queue',
    icon: <FileCheck className="h-5 w-5" />,
    allowedRoles: ['STAF_PENELITI'],
  },
  {
    name: 'Bundling',
    href: '/bundle',
    icon: <Package className="h-5 w-5" />,
    allowedRoles: ['STAF_PENELITI'],
  },
  {
    name: 'Riwayat Bundle',
    href: '/bundle/history',
    icon: <BookOpen className="h-5 w-5" />,
    allowedRoles: ['STAF_PENELITI'],
  },
  // STAF_PENGARSIP
  {
    name: 'Pengarsipan',
    href: '/arsip',
    icon: <FileSpreadsheet className="h-5 w-5" />,
    allowedRoles: ['STAF_PENGARSIP'],
  },
  // STAF_PENGIRIM
  {
    name: 'Manifest',
    href: '/manifest',
    icon: <FolderSync className="h-5 w-5" />,
    allowedRoles: ['STAF_PENGIRIM'],
  },
  {
    name: 'Pengiriman',
    href: '/manifest/shipping',
    icon: <Truck className="h-5 w-5" />,
    allowedRoles: ['STAF_PENGIRIM'],
  },
  // STAF_PEMANTAU / SUPERVISOR
  {
    name: 'Monitoring',
    href: '/monitoring',
    icon: <Grid3X3 className="h-5 w-5" />,
    allowedRoles: ['STAF_PEMANTAU', 'SUPERVISOR'],
  },
  // SUPERVISOR
  {
    name: 'Analytics',
    href: '/analytics',
    icon: <BarChart3 className="h-5 w-5" />,
    allowedRoles: ['SUPERVISOR'],
  },
  {
    name: 'Audit Log',
    href: '/audit',
    icon: <FolderLock className="h-5 w-5" />,
    allowedRoles: ['SUPERVISOR'],
  },
];

interface DashboardNavProps {
  userRole: UserRole;
}

export function DashboardNav({ userRole }: DashboardNavProps) {
  const pathname = usePathname();
  const filteredMenu = menuItems.filter(item => item.allowedRoles.includes(userRole));

  return (
    <nav className="p-4 space-y-1">
      {filteredMenu.map((item, idx) => {
        const isActive = (() => {
          if (pathname === item.href) return true;
          const isSubPath = item.href !== '/dashboard' && pathname.startsWith(item.href + '/');
          if (!isSubPath) return false;
          
          // Check if there is a more specific menu item matching the current pathname
          const hasMoreSpecificMatch = filteredMenu.some(otherItem => 
            otherItem.href !== item.href && 
            otherItem.href.startsWith(item.href + '/') &&
            (pathname === otherItem.href || pathname.startsWith(otherItem.href + '/'))
          );
          return !hasMoreSpecificMatch;
        })();

        return (
          <Link
            key={idx}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-3 text-sm font-bold rounded-lg transition-all duration-200 group",
              isActive 
                ? "bg-[#F7F7F7] text-[#FF385C] border-l-4 border-[#FF385C] pl-2 shadow-sm" 
                : "text-[#717171] hover:bg-[#F7F7F7]/50 hover:text-[#222222] border-l-4 border-transparent pl-3"
            )}
          >
            <span className={cn(
              "transition-colors duration-200", 
              isActive ? "text-[#FF385C]" : "text-[#717171] group-hover:text-[#222222]"
            )}>
              {item.icon}
            </span>
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
