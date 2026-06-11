'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUp } from 'lucide-react';

interface DashboardHeroProps {
  userName: string;
}

export function DashboardHero({ userName }: DashboardHeroProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState('');
  const [focused, setFocused] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Ambil nama depan saja
  const firstName = userName.split(' ')[0];

  const handleSubmit = () => {
    const trimmed = query.trim();
    if (!trimmed) {
      inputRef.current?.focus();
      return;
    }
    // Navigasi ke halaman AI dengan query sebagai parameter
    router.push(`/ai?q=${encodeURIComponent(trimmed)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div style={{ marginBottom: 28 }}>
      {/* Heading */}
      <h1
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: '#0f172a',
          letterSpacing: '-0.025em',
          margin: '0 0 14px',
          lineHeight: 1.2,
        }}
      >
        Hey {firstName}, siap untuk mulai?
      </h1>

      {/* AI Input Field — mirip referensi Clay */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          backgroundColor: '#ffffff',
          border: `1px solid ${focused ? '#2563eb' : '#e2e8f0'}`,
          borderRadius: 10,
          padding: '10px 10px 10px 14px',
          maxWidth: 600,
          boxShadow: focused
            ? '0 0 0 3px rgba(37,99,235,0.1)'
            : '0 1px 4px rgba(15,23,42,0.06)',
          transition: 'border-color 200ms, box-shadow 200ms',
        }}
      >
        {/* Colorful Architax icon */}
        <div
          style={{
            flexShrink: 0,
            width: 26,
            height: 26,
            borderRadius: 6,
            background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 50%, #db2777 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder="Tanyakan sesuatu tentang Architax atau deskripsikan yang ingin Anda lakukan..."
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontSize: 13.5,
            fontWeight: 400,
            color: '#0f172a',
            minWidth: 0,
            lineHeight: 1.5,
          }}
        />

        {/* Submit arrow button */}
        <button
          onClick={handleSubmit}
          title="Kirim"
          style={{
            flexShrink: 0,
            width: 32,
            height: 32,
            borderRadius: 7,
            backgroundColor: query.trim() ? '#2563eb' : '#e2e8f0',
            border: 'none',
            cursor: query.trim() ? 'pointer' : 'default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 150ms, transform 100ms',
          }}
          onMouseEnter={e => {
            if (query.trim()) {
              (e.currentTarget as HTMLElement).style.backgroundColor = '#1d4ed8';
              (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)';
            }
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.backgroundColor = query.trim() ? '#2563eb' : '#e2e8f0';
            (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
          }}
        >
          <ArrowUp
            style={{
              width: 15,
              height: 15,
              color: query.trim() ? '#ffffff' : '#94a3b8',
              transition: 'color 150ms',
            }}
          />
        </button>
      </div>

      {/* Hint text */}
      <p
        style={{
          fontSize: 11.5,
          color: '#94a3b8',
          marginTop: 7,
          marginBottom: 0,
        }}
      >
        Tekan Enter atau klik &#8593; untuk membuka obrolan AI
      </p>
    </div>
  );
}
