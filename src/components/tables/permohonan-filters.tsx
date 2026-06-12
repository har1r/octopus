// src/components/tables/permohonan-filters.tsx
'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ServiceType, ApplicationStatus, UserRole } from '@prisma/client';

interface PermohonanFiltersProps {
  userRole: UserRole;
  canWrite: boolean;
}

export function PermohonanFilters({ userRole, canWrite }: PermohonanFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [nop, setNop] = React.useState(searchParams.get('nop') || '');
  const [serviceType, setServiceType] = React.useState(searchParams.get('serviceType') || 'ALL');
  const [status, setStatus] = React.useState(searchParams.get('status') || 'ALL');

  const [searchFocused, setSearchFocused] = React.useState(false);
  const [resetHovered, setResetHovered] = React.useState(false);
  const [newBtnHovered, setNewBtnHovered] = React.useState(false);
  const [layananHovered, setLayananHovered] = React.useState(false);
  const [statusHovered, setStatusHovered] = React.useState(false);

  // Sync state with URL params
  React.useEffect(() => {
    setNop(searchParams.get('nop') || '');
    setServiceType(searchParams.get('serviceType') || 'ALL');
    setStatus(searchParams.get('status') || 'ALL');
  }, [searchParams]);

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (nop.trim()) {
      params.set('nop', nop.trim());
    } else {
      params.delete('nop');
    }
    params.set('page', '1');
    router.push(`/permohonan?${params.toString()}`);
  };

  const handleServiceTypeChange = (val: string | null) => {
    const selectedVal = val || 'ALL';
    setServiceType(selectedVal);
    const params = new URLSearchParams(searchParams.toString());
    if (selectedVal !== 'ALL') {
      params.set('serviceType', selectedVal);
    } else {
      params.delete('serviceType');
    }
    params.set('page', '1');
    router.push(`/permohonan?${params.toString()}`);
  };

  const handleStatusChange = (val: string | null) => {
    const selectedVal = val || 'ALL';
    setStatus(selectedVal);
    const params = new URLSearchParams(searchParams.toString());
    if (selectedVal !== 'ALL') {
      params.set('status', selectedVal);
    } else {
      params.delete('status');
    }
    params.set('page', '1');
    router.push(`/permohonan?${params.toString()}`);
  };

  const handleReset = () => {
    setNop('');
    setServiceType('ALL');
    setStatus('ALL');
    router.push('/permohonan');
  };

  // Clay icons
  const SearchIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256" style={{ color: '#9CA3AF', flexShrink: 0 }}>
      <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
    </svg>
  );

  const PlusIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256" style={{ flexShrink: 0 }}>
      <path d="M228,128a12,12,0,0,1-12,12H140v76a12,12,0,0,1-24,0V140H40a12,12,0,0,1,0-24h76V40a12,12,0,0,1,24,0v76h76A12,12,0,0,1,228,128Z" />
    </svg>
  );

  const FilterIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256" style={{ color: '#111827', flexShrink: 0 }}>
      <path d="M204,136a12,12,0,0,1-12,12H64a12,12,0,0,1,0-24H192A12,12,0,0,1,204,136Zm28-60H24a12,12,0,0,0,0,24H232a12,12,0,0,0,0-24Zm-80,96H104a12,12,0,0,0,0,24h48a12,12,0,0,0,0-24Z" />
    </svg>
  );

  const CaretDownIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" viewBox="0 0 256 256" style={{ color: '#111827', flexShrink: 0, marginLeft: '4px' }}>
      <path d="M216.49,104.49l-80,80a12,12,0,0,1-17,0l-80-80a12,12,0,0,1,17-17L128,159l71.51-71.52a12,12,0,0,1,17,17Z" />
    </svg>
  );

  const RotateCcwIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
    </svg>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

      {/* 1. Tabs Section (Segmented Pills Control) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
          borderRadius: '6px',
          padding: '1px',
          backgroundColor: '#F3F4F6',
          border: '1px solid #E5E7EB',
          width: 'fit-content',
          marginBottom: '24px',
          userSelect: 'none',
        }}
      >
        <div
          style={{
            borderRadius: '4px',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '28px',
            padding: '0 12px',
            fontSize: '13px',
            fontWeight: '500',
            backgroundColor: '#ffffff',
            color: '#111827',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          }}
        >
          All
        </div>
        <div
          style={{
            borderRadius: '4px',
            cursor: 'default',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '28px',
            padding: '0 12px',
            fontSize: '13px',
            fontWeight: '500',
            backgroundColor: 'transparent',
            color: '#6B7280',
          }}
        >
          Recents
        </div>
        <div
          style={{
            borderRadius: '4px',
            cursor: 'default',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '28px',
            padding: '0 12px',
            fontSize: '13px',
            fontWeight: '500',
            backgroundColor: 'transparent',
            color: '#6B7280',
          }}
        >
          Favorites
        </div>
      </div>

      {/* 2. Header Toolbar Row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '64px',
          width: '100%',
          userSelect: 'none',
        }}
      >
        <h4
          style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#111827',
            margin: 0,
            letterSpacing: '-0.02em',
          }}
        >
          {userRole === 'STAF_PENGINPUT' ? 'Permohonan Saya' : 'Semua Permohonan'}
        </h4>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Search Box */}
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              height: '32px',
              borderRadius: '6px',
              border: searchFocused ? '1px solid #CBD5E1' : '1px solid #E5E7EB',
              backgroundColor: '#ffffff',
              padding: '0 8px 0 32px',
              boxShadow: 'none',
              transition: 'all 150ms ease-out',
            }}
          >
            <div style={{ position: 'absolute', left: '10px', display: 'flex', alignItems: 'center' }}>
              {SearchIcon}
            </div>
            <input
              type="text"
              placeholder="Search NOP"
              value={nop}
              onChange={(e) => setNop(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => {
                setSearchFocused(false);
                handleSearch();
              }}
              style={{
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                fontSize: '13px',
                color: '#111827',
                width: '180px',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* New Button */}
          {canWrite && (
            <Link
              href="/permohonan/new"
              onMouseEnter={() => setNewBtnHovered(true)}
              onMouseLeave={() => setNewBtnHovered(false)}
              style={{
                height: '32px',
                padding: '0 12px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: newBtnHovered ? '#1D4ED8' : '#2563EB',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: '600',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer',
                transition: 'background-color 150ms ease-out',
                textDecoration: 'none',
              }}
            >
              {PlusIcon} Buat Permohonan
            </Link>
          )}
        </div>
      </div>

      {/* 3. Filters Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          height: '46px',
          borderTop: '1px solid #E5E7EB',
          width: '100%',
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>

          {/* Dropdown Jenis Layanan */}
          <div
            style={{
              display: 'flex',
              height: '24px',
              alignItems: 'center',
              borderRadius: '4px',
              border: '1px solid #E5E7EB',
              backgroundColor: '#ffffff',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '0 6px', display: 'flex', alignItems: 'center', height: '100%', borderRight: '1px solid #E5E7EB' }}>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: '500', color: '#111827' }}>Layanan</p>
            </div>
            <Select value={serviceType} onValueChange={handleServiceTypeChange}>
              <SelectTrigger
                onMouseEnter={() => setLayananHovered(true)}
                onMouseLeave={() => setLayananHovered(false)}
                className="[&>svg:last-child]:hidden"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '0 6px',
                  fontSize: '12px',
                  fontWeight: '400',
                  color: '#111827',
                  border: 'none',
                  backgroundColor: layananHovered ? 'rgba(17, 24, 39, 0.05)' : 'transparent',
                  cursor: 'pointer',
                  height: '100%',
                  borderRadius: '0px',
                  boxShadow: 'none',
                  transition: 'background-color 150ms ease-out',
                }}
              >
                <SelectValue placeholder="All" />
                {CaretDownIcon}
              </SelectTrigger>
              <SelectContent className="rounded-md border-slate-200 text-xs">
                <SelectItem value="ALL">All</SelectItem>
                <SelectItem value={ServiceType.OBJEK_PAJAK_BARU}>Objek Pajak Baru</SelectItem>
                <SelectItem value={ServiceType.MUTASI_SEBAGIAN}>Mutasi Sebagian</SelectItem>
                <SelectItem value={ServiceType.MUTASI_HABIS_UPDATE}>Mutasi Habis (Update)</SelectItem>
                <SelectItem value={ServiceType.MUTASI_HABIS_REGULER}>Mutasi Habis (Reguler)</SelectItem>
                <SelectItem value={ServiceType.PEMBETULAN}>Pembetulan</SelectItem>
                <SelectItem value={ServiceType.PENGAKTIFAN}>Pengaktifan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Dropdown Status */}
          <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger
              onMouseEnter={() => setStatusHovered(true)}
              onMouseLeave={() => setStatusHovered(false)}
              className="[&>svg:last-child]:hidden"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                height: '24px',
                padding: '0 6px',
                fontSize: '12px',
                fontWeight: '500',
                color: '#111827',
                border: 'none',
                backgroundColor: statusHovered ? 'rgba(17, 24, 39, 0.05)' : 'transparent',
                cursor: 'pointer',
                borderRadius: '4px',
                boxShadow: 'none',
                transition: 'background-color 150ms ease-out',
              }}
            >
              {FilterIcon}
            </SelectTrigger>
            <SelectContent className="rounded-md border-slate-200 text-xs">
              <SelectItem value="ALL">All</SelectItem>
              <SelectItem value={ApplicationStatus.SUBMITTED}>Submitted</SelectItem>
              <SelectItem value={ApplicationStatus.REVISION}>Revision</SelectItem>
              <SelectItem value={ApplicationStatus.REJECTED}>Rejected</SelectItem>
              <SelectItem value={ApplicationStatus.REJECTED_PERMANENT}>Rejected Permanent</SelectItem>
              <SelectItem value={ApplicationStatus.DRAFT_BUNDLE}>Draft Bundle</SelectItem>
              <SelectItem value={ApplicationStatus.READY_TO_ARCHIVE}>Ready to Archive</SelectItem>
              <SelectItem value={ApplicationStatus.RE_EXAMINE}>Re-examine</SelectItem>
              <SelectItem value={ApplicationStatus.READY_TO_SHIP}>Ready to Ship</SelectItem>
              <SelectItem value={ApplicationStatus.SENT_TO_CENTER}>Sent to Center</SelectItem>
              <SelectItem value={ApplicationStatus.COMPLETED}>Completed</SelectItem>
            </SelectContent>
          </Select>

          {/* Reset Filters */}
          {(nop || serviceType !== 'ALL' || status !== 'ALL') && (
            <button
              type="button"
              onClick={handleReset}
              onMouseEnter={() => setResetHovered(true)}
              onMouseLeave={() => setResetHovered(false)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                height: '24px',
                padding: '0 8px',
                fontSize: '12px',
                fontWeight: '500',
                color: '#6B7280',
                border: 'none',
                backgroundColor: resetHovered ? 'rgba(17, 24, 39, 0.05)' : 'transparent',
                cursor: 'pointer',
                borderRadius: '4px',
                transition: 'background-color 150ms ease-out',
              }}
            >
              {RotateCcwIcon} Reset Filters
            </button>
          )}

        </div>
      </div>
    </div>
  );
}
