'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import React from 'react';

const C = {
  white: '#ffffff',
  surface: '#f8fafc',
  surfaceSoft: '#f1f5f9',
  hairline: '#e2e8f0',
  ink: '#0f172a',
  bodyStrong: '#1e293b',
  body: '#334155',
  muted: '#64748b',
  mutedSoft: '#94a3b8',
  blue: '#2563eb',
  blueDark: '#1d4ed8',
  blueSoft: '#eff6ff',
  blueLight: '#dbeafe',
} as const;

interface ShortcutCardProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  href: string;
  variant?: 'primary' | 'secondary';
  hoverBorderColor?: string;
  hoverShadowColor?: string;
}

export function ShortcutCard({
  icon,
  iconBg,
  title,
  description,
  href,
  variant = 'primary',
  hoverBorderColor = C.blueLight,
  hoverShadowColor = 'rgba(37,99,235,0.12)',
}: ShortcutCardProps) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      style={{
        backgroundColor: C.white,
        border: `1px solid ${hovered ? hoverBorderColor : C.hairline}`,
        borderRadius: 10,
        padding: '20px',
        transition: 'box-shadow 200ms, border-color 200ms, transform 200ms',
        transform: hovered ? 'translateY(-1px)' : 'translateY(0)',
        boxShadow: hovered ? `0 4px 16px ${hoverShadowColor}` : 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ marginBottom: 14 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          backgroundColor: iconBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 10,
        }}>
          {icon}
        </div>
        <p style={{ fontSize: 14, fontWeight: 600, color: C.ink, marginBottom: 4, margin: '0 0 4px' }}>
          {title}
        </p>
        <p style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.55, margin: 0 }}>
          {description}
        </p>
      </div>

      {variant === 'primary' ? (
        <LinkButton href={href} variant="primary">
          {title.startsWith('Buat') ? 'Buat Form' : title.startsWith('Antrean') ? 'Buka Antrean' : title.startsWith('Unggah') ? 'Pekerjaan Arsip' : title.startsWith('Kelola') ? 'Buka Manifest' : title.startsWith('Pemantauan') ? 'Mulai Pantau' : title.startsWith('Dashboard') ? 'Buka Grafik' : 'Buka'}
          <ArrowRight style={{ width: 13, height: 13 }} />
        </LinkButton>
      ) : (
        <LinkButton href={href} variant="secondary">
          {title.startsWith('Permohonan') ? 'Lihat Daftar' : title.startsWith('Menu') ? 'Mulai Bundling' : title.startsWith('Investigasi') ? 'Lihat Audit Log' : 'Lihat'}
        </LinkButton>
      )}
    </div>
  );
}

function LinkButton({
  href,
  variant,
  children,
}: {
  href: string;
  variant: 'primary' | 'secondary';
  children: React.ReactNode;
}) {
  const [hovered, setHovered] = React.useState(false);

  if (variant === 'primary') {
    return (
      <Link
        href={href}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          height: 34, padding: '0 14px',
          backgroundColor: hovered ? C.blueDark : C.blue,
          color: '#fff',
          fontSize: 12.5, fontWeight: 600,
          borderRadius: 7, textDecoration: 'none',
          transition: 'background-color 150ms',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {children}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        height: 34, padding: '0 14px',
        backgroundColor: hovered ? C.surfaceSoft : C.white,
        color: C.ink,
        fontSize: 12.5, fontWeight: 600,
        borderRadius: 7, textDecoration: 'none',
        border: `1px solid ${hovered ? '#cbd5e1' : C.hairline}`,
        transition: 'all 150ms',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </Link>
  );
}
