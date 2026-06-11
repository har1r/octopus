// src/components/clay-dashboard-client.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

interface ClayDashboardClientProps {
  initialUserName: string;
  userRole: string;
  dbItems: any[];
}

function formatTimeAgo(dateInput: string | Date) {
  const date = new Date(dateInput);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function ClayDashboardClient({ initialUserName, userRole, dbItems }: ClayDashboardClientProps) {
  const router = useRouter();
  const [showHero, setShowHero] = React.useState(true);
  const [aiQuery, setAiQuery] = React.useState('');
  const [activeTab, setActiveTab] = React.useState<'all' | 'recents' | 'favorites'>('all');
  const [tableSearch, setTableSearch] = React.useState('');

  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [searchFocused, setSearchFocused] = React.useState(false);
  const [aiFocused, setAiFocused] = React.useState(false);
  const [toggleHovered, setToggleHovered] = React.useState(false);

  const firstName = initialUserName.split(' ')[0] || 'Mufti';

  const handleAiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (aiQuery.trim()) {
      router.push(`/ai?q=${encodeURIComponent(aiQuery.trim())}`);
    }
  };

  const handleAiKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (aiQuery.trim()) {
        router.push(`/ai?q=${encodeURIComponent(aiQuery.trim())}`);
      }
    }
  };

  const canWrite = ['STAF_PENGINPUT', 'STAF_PENELITI'].includes(userRole);

  // Filter actual database items based on table search
  const filteredDbItems = dbItems.filter(item =>
    item.nomorBerkas.toLowerCase().includes(tableSearch.toLowerCase()) ||
    (item.oldOwnerName && item.oldOwnerName.toLowerCase().includes(tableSearch.toLowerCase())) ||
    item.nop.toLowerCase().includes(tableSearch.toLowerCase())
  );

  const handleSelectAll = () => {
    if (selectedIds.length === filteredDbItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredDbItems.map(item => item.id));
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Red circle M avatar style helper
  const renderRedAvatar = (initial: string) => (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#EF4444',
        color: '#ffffff',
        width: '16px',
        height: '16px',
        borderRadius: '50%',
        fontSize: '8.5px',
        fontWeight: 'bold',
        marginRight: '6px',
        flexShrink: 0,
      }}
    >
      {initial}
    </div>
  );

  const renderCheckbox = (checked: boolean, onChange: () => void) => (
    <span
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '16px',
        height: '16px',
        borderRadius: '4px',
        border: checked ? '1px solid #2563EB' : '1px solid #D1D5DB',
        backgroundColor: checked ? '#2563EB' : '#ffffff',
        cursor: 'pointer',
        transition: 'all 150ms ease-out',
      }}
    >
      {checked && (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </span>
  );

  // SVGs
  const SculptorIcon = (
    <div style={{ position: 'relative', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <span style={{
        position: 'absolute',
        width: '14px',
        height: '14px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, rgba(37,99,235,0) 70%)',
        animation: 'ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite',
      }} />
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
        <defs>
          <radialGradient id="sculptor-grad" cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="50%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </radialGradient>
        </defs>
        <circle cx="12" cy="12" r="8" fill="url(#sculptor-grad)" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.15))' }} />
        <path d="M12 9v6M9 12h6" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />
      </svg>
    </div>
  );

  const FileGridIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256" style={{ color: '#9CA3AF', flexShrink: 0 }}>
      <path d="M80,40V216H48a8,8,0,0,1-8-8V48a8,8,0,0,1,8-8Z" opacity="0.2"></path>
      <path d="M184,112a8,8,0,0,1-8,8H112a8,8,0,0,1,0-16h64A8,8,0,0,1,184,112Zm-8,24H112a8,8,0,0,0,0,16h64a8,8,0,0,0,0-16Zm48-88V208a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V48A16,16,0,0,1,48,32H208A16,16,0,0,1,224,48ZM48,208H72V48H48Zm160,0V48H88V208H208Z"></path>
    </svg>
  );

  const StarOutlineIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256" style={{ color: '#9CA3AF', flexShrink: 0 }}>
      <path d="M239.18,97.26A16.38,16.38,0,0,0,224.92,86l-59-4.76L143.14,26.15a16.36,16.36,0,0,0-30.27,0L90.11,81.23,31.08,86a16.46,16.46,0,0,0-9.37,28.86l45,38.83L53,211.75a16.38,16.38,0,0,0,24.5,17.82L128,198.49l50.53,31.08A16.4,16.4,0,0,0,203,211.75l-13.76-58.07,45-38.83A16.43,16.43,0,0,0,239.18,97.26Zm-15.34,5.47-48.7,42a8,8,0,0,0-2.56,7.91l14.88,62.8a.37.37,0,0,1-.17.48c-.18.14-.23.11-.38,0l-54.72-33.65a8,8,0,0,0-8.38,0L69.09,215.94c-.15.09-.19.12-.38,0a.37.37,0,0,1-.17-.48l14.88-62.8a8,8,0,0,0-2.56-7.91l-48.7-42c-.12-.1-.23-.19-.13-.5s.18-.27.33-.29l63.92-5.16A8,8,0,0,0,103,91.86l24.62-59.61c.08-.17.11-.25.35-.25s.27.08.35.25L153,91.86a8,8,0,0,0,6.75,4.92l63.92,5.16c.15,0,.24,0,.33.29S224,102.63,223.84,102.73Z" />
    </svg>
  );

  const FindLeadsIcon = (
    <div style={{ width: '24px', height: '24px', borderRadius: '6px', backgroundColor: '#eefff1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#078a52" strokeWidth="2.5">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    </div>
  );

  const ImportDataIcon = (
    <div style={{ width: '24px', height: '24px', borderRadius: '6px', backgroundColor: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7934f0" strokeWidth="2.5">
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
        <path d="M5 21h14" />
      </svg>
    </div>
  );

  const CreateCampaignIcon = (
    <div style={{ width: '24px', height: '24px', borderRadius: '6px', backgroundColor: '#fff3ed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c34e1b" strokeWidth="2.5">
        <path d="M11 5L6 9H2v6h4l5 4V5z" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
      </svg>
    </div>
  );

  const StartTemplateIcon = (
    <div style={{ width: '24px', height: '24px', borderRadius: '6px', backgroundColor: '#ecf6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0382f7" strokeWidth="2.5">
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
        <path d="M14.5 9.5L12 12l-2.5-2.5" />
      </svg>
    </div>
  );

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
    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" viewBox="0 0 256 256" style={{ color: '#111827', flexShrink: 0 }}>
      <path d="M216.49,104.49l-80,80a12,12,0,0,1-17,0l-80-80a12,12,0,0,1,17-17L128,159l71.51-71.52a12,12,0,0,1,17,17Z" />
    </svg>
  );

  const DotsThreeHorizontalIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256" style={{ flexShrink: 0 }}>
      <path d="M144,128a16,16,0,1,1-16-16A16,16,0,0,1,144,128ZM60,112a16,16,0,1,0,16,16A16,16,0,0,0,60,112Zm136,0a16,16,0,1,0,16,16A16,16,0,0,0,196,112Z" />
    </svg>
  );

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <style>{`
        @keyframes ping {
          75%, 100% {
            transform: scale(2.2);
            opacity: 0;
          }
        }
      `}</style>

      {/* 1. Header Greeting & Show Less Toggle */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          width: '100%',
          gap: '16px',
          marginBottom: '24px',
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1010px', width: '100%' }}>
          <h1
            style={{
              fontSize: '22px',
              lineHeight: '28px',
              letterSpacing: '-0.55px',
              fontWeight: '700',
              color: '#111827',
              margin: 0,
            }}
          >
            Hey {firstName}, ready to get started?
          </h1>

          {showHero && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
              {/* 2. AI Prompt Bar */}
              <div
                style={{
                  position: 'relative',
                  height: '40px',
                  width: '520px',
                  maxWidth: '100%',
                  overflow: 'hidden',
                  borderRadius: '6px',
                  background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 50%, #e2e8f0 100%)',
                  padding: '1px',
                  display: 'flex',
                  boxShadow: aiFocused ? '0 0 0 3px rgba(37, 99, 235, 0.15), 0 4px 12px rgba(37, 99, 235, 0.08)' : 'none',
                  transition: 'all 200ms ease-out',
                }}
              >
                <form
                  onSubmit={handleAiSubmit}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    width: '100%',
                    height: '100%',
                    alignItems: 'center',
                    gap: '6px',
                    overflow: 'hidden',
                    borderRadius: '5px',
                    backgroundColor: '#ffffff',
                    padding: '0 8px',
                  }}
                >
                  {SculptorIcon}
                  <input
                    type="text"
                    id="base-ui-:reh:"
                    placeholder="Ask me anything about Architax or describe what you'd like to do..."
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    onKeyDown={handleAiKeyDown}
                    onFocus={() => setAiFocused(true)}
                    onBlur={() => setAiFocused(false)}
                    style={{
                      width: '100%',
                      border: 'none',
                      outline: 'none',
                      backgroundColor: 'transparent',
                      fontSize: '14px',
                      color: '#111827',
                      fontFamily: 'inherit',
                    }}
                  />
                  <button
                    type="submit"
                    disabled={!aiQuery.trim()}
                    aria-label="Submit"
                    style={{
                      width: '24px',
                      height: '24px',
                      minWidth: '24px',
                      borderRadius: '4px',
                      border: 'none',
                      backgroundColor: '#2563EB',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: aiQuery.trim() ? 'pointer' : 'default',
                      opacity: aiQuery.trim() ? 1 : 0.5,
                      transition: 'opacity 150ms ease-out, background-color 150ms ease-out',
                    }}
                    onMouseEnter={(e) => {
                      if (aiQuery.trim()) e.currentTarget.style.backgroundColor = '#1D4ED8';
                    }}
                    onMouseLeave={(e) => {
                      if (aiQuery.trim()) e.currentTarget.style.backgroundColor = '#2563EB';
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256" style={{ width: '12px', height: '12px', flexShrink: 0 }}>
                      <path d="M208.49,120.49a12,12,0,0,1-17,0L140,69V216a12,12,0,0,1-24,0V69L64.49,120.49a12,12,0,0,1-17-17l72-72a12,12,0,0,1,17,0l72,72A12,12,0,0,1,208.49,120.49Z" />
                    </svg>
                  </button>
                </form>
              </div>

              {/* 3. 4 Action Cards in horizontal flex container */}
              <div
                style={{
                  margin: '0 -32px',
                  padding: '0 32px 16px 32px',
                  overflowX: 'auto',
                  scrollbarWidth: 'none',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'stretch', gap: '16px' }}>
                  {/* Card 1: Find leads */}
                  <div
                    onClick={() => router.push('/permohonan')}
                    style={{
                      width: '240px',
                      maxWidth: '240px',
                      minWidth: '240px',
                      flexShrink: 0,
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      padding: '16px',
                      backgroundColor: '#F9FAFB',
                      cursor: 'pointer',
                      transition: 'all 150ms ease-out',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#CBD5E1';
                      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#E5E7EB';
                      e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
                    }}
                  >
                    {FindLeadsIcon}
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0', letterSpacing: '-0.015em' }}>Find leads</h4>
                      <p style={{ fontSize: '12px', color: '#6B7280', margin: 0, lineHeight: 1.4 }}>Find people, companies, jobs and more.</p>
                    </div>
                  </div>

                  {/* Card 2: Import data */}
                  <div
                    onClick={() => router.push('/arsip')}
                    style={{
                      width: '240px',
                      maxWidth: '240px',
                      minWidth: '240px',
                      flexShrink: 0,
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      padding: '16px',
                      backgroundColor: '#F9FAFB',
                      cursor: 'pointer',
                      transition: 'all 150ms ease-out',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#CBD5E1';
                      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#E5E7EB';
                      e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
                    }}
                  >
                    {ImportDataIcon}
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0', letterSpacing: '-0.015em' }}>Import data</h4>
                      <p style={{ fontSize: '12px', color: '#6B7280', margin: 0, lineHeight: 1.4 }}>Import your existing list from CRM or CSV.</p>
                    </div>
                  </div>

                  {/* Card 3: Create a campaign */}
                  <div
                    onClick={() => router.push('/bundle')}
                    style={{
                      width: '240px',
                      maxWidth: '240px',
                      minWidth: '240px',
                      flexShrink: 0,
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      padding: '16px',
                      backgroundColor: '#F9FAFB',
                      cursor: 'pointer',
                      transition: 'all 150ms ease-out',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#CBD5E1';
                      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#E5E7EB';
                      e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
                    }}
                  >
                    {CreateCampaignIcon}
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0', letterSpacing: '-0.015em' }}>Create a campaign</h4>
                      <p style={{ fontSize: '12px', color: '#6B7280', margin: 0, lineHeight: 1.4 }}>Build and automate your outreach campaigns.</p>
                    </div>
                  </div>

                  {/* Card 4: Start from template */}
                  <div
                    onClick={() => router.push('/permohonan/new')}
                    style={{
                      width: '240px',
                      maxWidth: '240px',
                      minWidth: '240px',
                      flexShrink: 0,
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      padding: '16px',
                      backgroundColor: '#F9FAFB',
                      cursor: 'pointer',
                      transition: 'all 150ms ease-out',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#CBD5E1';
                      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#E5E7EB';
                      e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
                    }}
                  >
                    {StartTemplateIcon}
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0', letterSpacing: '-0.015em' }}>Start from template</h4>
                      <p style={{ fontSize: '12px', color: '#6B7280', margin: 0, lineHeight: 1.4 }}>Choose from pre-built workflows to get started.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowHero(!showHero)}
          onMouseEnter={() => setToggleHovered(true)}
          onMouseLeave={() => setToggleHovered(false)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '28px',
            padding: '0 8px',
            borderRadius: '6px',
            border: '1px solid #2563EB',
            backgroundColor: toggleHovered ? '#EFF6FF' : '#ffffff',
            color: '#2563EB',
            fontSize: '12px',
            fontWeight: '500',
            gap: '6px',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            width: 'fit-content',
            transition: 'all 150ms ease-out',
          }}
        >
          {showHero ? 'Show less' : 'Show more'}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256" style={{ width: '14px', height: '14px', flexShrink: 0 }}>
            <path d={showHero ? "M216.49,168.49a12,12,0,0,1-17,0L128,97,56.49,168.49a12,12,0,0,1-17-17l80-80a12,12,0,0,1,17,0l80,80A12,12,0,0,1,216.49,168.49Z" : "M208.49,104.49l-80,80a12,12,0,0,1-17,0l-80-80a12,12,0,0,1,17-17L128,159l71.51-71.52a12,12,0,0,1,17,17Z"} />
          </svg>
        </button>
      </div>

      {/* 4. Tabs Section (Segmented Pills Control) */}
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
          onClick={() => setActiveTab('all')}
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
            transition: 'all 150ms ease-out',
            backgroundColor: activeTab === 'all' ? '#ffffff' : 'transparent',
            color: activeTab === 'all' ? '#111827' : '#6B7280',
            boxShadow: activeTab === 'all' ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none',
          }}
          onMouseEnter={(e) => {
            if (activeTab !== 'all') e.currentTarget.style.color = '#111827';
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'all') e.currentTarget.style.color = '#6B7280';
          }}
        >
          All files
        </div>
        <div
          onClick={() => setActiveTab('recents')}
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
            transition: 'all 150ms ease-out',
            backgroundColor: activeTab === 'recents' ? '#ffffff' : 'transparent',
            color: activeTab === 'recents' ? '#111827' : '#6B7280',
            boxShadow: activeTab === 'recents' ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none',
          }}
          onMouseEnter={(e) => {
            if (activeTab !== 'recents') e.currentTarget.style.color = '#111827';
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'recents') e.currentTarget.style.color = '#6B7280';
          }}
        >
          Recents
        </div>
        <div
          onClick={() => setActiveTab('favorites')}
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
            transition: 'all 150ms ease-out',
            backgroundColor: activeTab === 'favorites' ? '#ffffff' : 'transparent',
            color: activeTab === 'favorites' ? '#111827' : '#6B7280',
            boxShadow: activeTab === 'favorites' ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none',
          }}
          onMouseEnter={(e) => {
            if (activeTab !== 'favorites') e.currentTarget.style.color = '#111827';
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'favorites') e.currentTarget.style.color = '#6B7280';
          }}
        >
          Favorites
        </div>
      </div>

      {/* 5. Header Toolbar Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          alignItems: 'center',
          height: '64px',
          width: '100%',
          userSelect: 'none',
        }}
      >
        <h4 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: 0, letterSpacing: '-0.02em' }}>
          All Files
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
              border: searchFocused ? '1px solid #2563EB' : '1px solid #E5E7EB',
              backgroundColor: '#ffffff',
              padding: '0 8px 0 32px',
              boxShadow: searchFocused ? '0 0 0 2px rgba(37,99,235,0.15)' : 'none',
              transition: 'all 150ms ease-out',
            }}
          >
            <div style={{ position: 'absolute', left: '10px', display: 'flex', alignItems: 'center' }}>
              {SearchIcon}
            </div>
            <input
              type="text"
              placeholder="Search"
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
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

          {canWrite && (
            <button
              onClick={() => router.push('/permohonan/new')}
              style={{
                height: '32px',
                padding: '0 12px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#2563EB',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: '600',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer',
                transition: 'background-color 150ms ease-out',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1D4ED8'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
            >
              {PlusIcon} New
            </button>
          )}
        </div>
      </div>

      {/* 6. Filters Row */}
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
          {/* Owner filter chip */}
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
              <p style={{ margin: 0, fontSize: '12px', fontWeight: '500', color: '#111827' }}>Owner</p>
            </div>
            <button
              type="button"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '0 6px',
                fontSize: '12px',
                fontWeight: '400',
                color: '#111827',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                height: '100%',
                transition: 'background-color 150ms ease-out',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(17, 24, 39, 0.05)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              All
              {CaretDownIcon}
            </button>
          </div>

          {/* Filters toggle button */}
          <button
            type="button"
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
              backgroundColor: 'transparent',
              cursor: 'pointer',
              borderRadius: '4px',
              transition: 'background-color 150ms ease-out',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(17, 24, 39, 0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            {FilterIcon} Filters
          </button>
        </div>
      </div>

      {/* 7. Spreadsheet style Fixed Table */}
      <div
        style={{
          margin: '0 -32px',
          overflowX: 'auto',
          borderTop: '1px solid #E5E7EB',
          borderBottom: '1px solid #E5E7EB',
          backgroundColor: '#ffffff',
        }}
      >
        <div style={{ minWidth: '950px' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              tableLayout: 'fixed',
            }}
          >
            <colgroup>
              <col style={{ width: '32px' }} />
              <col style={{ width: '24px' }} />
              <col style={{ width: 'auto' }} />
              <col style={{ width: '100px' }} />
              <col style={{ width: '150px' }} />
              <col style={{ width: '160px' }} />
              <col style={{ width: '75px' }} />
              <col style={{ width: '32px' }} />
              <col style={{ width: '32px' }} />
            </colgroup>

            <thead>
              <tr
                style={{
                  backgroundColor: '#ffffff',
                  borderBottom: '1px solid #E5E7EB',
                  height: '34px',
                  fontSize: '11px',
                  fontWeight: '600',
                  color: '#6B7280',
                  userSelect: 'none',
                }}
              >
                <th>{/* spacer */}</th>
                <th style={{ verticalAlign: 'middle' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {renderCheckbox(
                      selectedIds.length === filteredDbItems.length && filteredDbItems.length > 0,
                      handleSelectAll
                    )}
                  </div>
                </th>
                <th style={{ padding: '0 8px', verticalAlign: 'middle' }}>Name</th>
                <th style={{ padding: '0 8px', verticalAlign: 'middle' }}>Favorite</th>
                <th style={{ padding: '0 8px', verticalAlign: 'middle' }}>Last opened by me</th>
                <th style={{ padding: '0 8px', verticalAlign: 'middle' }}>Owner</th>
                <th style={{ padding: '0 8px', verticalAlign: 'middle' }}>Access</th>
                <th>{/* Dots */}</th>
                <th>{/* spacer */}</th>
              </tr>
            </thead>

            <tbody>
              {/* Mock Row 1: Clay Starter Table */}
              <tr
                style={{
                  height: '46px',
                  fontSize: '13px',
                  color: '#111827',
                  borderBottom: '1px solid #F3F4F6',
                  transition: 'background-color 150ms ease-out',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <td>{/* spacer */}</td>
                <td style={{ verticalAlign: 'middle' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {renderCheckbox(selectedIds.includes('mock-starter'), () => handleSelectRow('mock-starter'))}
                  </div>
                </td>
                <td style={{ padding: '0 8px', verticalAlign: 'middle', fontWeight: '600', color: '#111827' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {FileGridIcon}
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Clay Starter Table</span>
                  </div>
                </td>
                <td style={{ padding: '0 8px', verticalAlign: 'middle' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {StarOutlineIcon}
                  </div>
                </td>
                <td style={{ padding: '0 8px', verticalAlign: 'middle', color: '#6B7280' }}>
                  5 hours ago
                </td>
                <td style={{ padding: '0 8px', verticalAlign: 'middle' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {renderRedAvatar('M')}
                    <span style={{ color: '#6B7280' }}>Mufti Harir</span>
                  </div>
                </td>
                <td style={{ padding: '0 8px', verticalAlign: 'middle', color: '#6B7280' }}>
                  Edit
                </td>
                <td style={{ verticalAlign: 'middle', textAlign: 'center', color: '#9CA3AF', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {DotsThreeHorizontalIcon}
                  </div>
                </td>
                <td>{/* spacer */}</td>
              </tr>

              {/* Dynamic DB rows */}
              {filteredDbItems.length === 0 ? (
                activeTab === 'all' && (
                  <tr style={{ height: '46px' }}>
                    <td></td>
                    <td></td>
                    <td colSpan={5} style={{ fontSize: '13px', color: '#9CA3AF', padding: '0 8px', verticalAlign: 'middle' }}>
                      No additional database files found.
                    </td>
                    <td></td>
                    <td></td>
                  </tr>
                )
              ) : (
                filteredDbItems.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <tr
                      key={item.id}
                      style={{
                        height: '46px',
                        fontSize: '13px',
                        color: '#111827',
                        borderBottom: '1px solid #F3F4F6',
                        transition: 'background-color 150ms ease-out',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td>{/* spacer */}</td>
                      <td style={{ verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {renderCheckbox(isSelected, () => handleSelectRow(item.id))}
                        </div>
                      </td>
                      <td
                        style={{
                          padding: '0 8px',
                          verticalAlign: 'middle',
                          fontWeight: '600',
                          color: '#2563EB',
                          cursor: 'pointer',
                        }}
                        onClick={() => router.push(`/permohonan/${item.id}`)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                          {FileGridIcon}
                          <span style={{ textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.nomorBerkas}
                          </span>
                          <span
                            style={{
                              marginLeft: '6px',
                              fontSize: '9px',
                              fontWeight: '700',
                              backgroundColor: '#EFF6FF',
                              color: '#1D4ED8',
                              padding: '1px 5px',
                              borderRadius: '4px',
                              border: '1px solid #DBEAFE',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {item.serviceType.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '0 8px', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {StarOutlineIcon}
                        </div>
                      </td>
                      <td style={{ padding: '0 8px', verticalAlign: 'middle', color: '#6B7280' }}>
                        {formatTimeAgo(item.updatedAt || item.createdAt)}
                      </td>
                      <td style={{ padding: '0 8px', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {renderRedAvatar(firstName[0])}
                          <span style={{ color: '#6B7280' }}>{initialUserName}</span>
                        </div>
                      </td>
                      <td style={{ padding: '0 8px', verticalAlign: 'middle', color: '#6B7280' }}>
                        {canWrite ? 'Edit' : 'Read'}
                      </td>
                      <td
                        style={{ verticalAlign: 'middle', textAlign: 'center', color: '#9CA3AF', cursor: 'pointer' }}
                        onClick={() => router.push(`/permohonan/${item.id}`)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {DotsThreeHorizontalIcon}
                        </div>
                      </td>
                      <td>{/* spacer */}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination summary */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 4px 0 4px',
          fontSize: '12px',
          color: '#6B7280',
          userSelect: 'none',
        }}
      >
        <span>Showing {filteredDbItems.length + 1} items</span>
        <button
          onClick={() => router.push('/permohonan')}
          style={{
            background: 'none',
            border: 'none',
            color: '#2563EB',
            fontWeight: '600',
            cursor: 'pointer',
            fontFamily: 'inherit',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#1D4ED8'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#2563EB'}
        >
          View all applications list &rarr;
        </button>
      </div>
    </div>
  );
}
