// src/components/shared/logo.tsx
import * as React from 'react';

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export function ArchitaxLogo({ size = 40, className, ...props }: LogoProps) {
  return (
    <div className="relative flex items-center justify-center select-none active:scale-95 transition-transform duration-200">
      {/* Dynamic ambient backdrop glow */}
      <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-[#2563EB]/30 to-[#06B6D4]/20 blur-xl opacity-70 animate-pulse pointer-events-none" />
      
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="blue-deep" x1="0" y1="0" x2="100" y2="100">
            <stop offset="0%" stopColor="#1E40AF" />
            <stop offset="100%" stopColor="#1E3A8A" />
          </linearGradient>
          
          <linearGradient id="blue-vibrant" x1="0" y1="0" x2="100" y2="100">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>

          <linearGradient id="gold-bright" x1="0" y1="0" x2="100" y2="100">
            <stop offset="0%" stopColor="#FFC837" />
            <stop offset="100%" stopColor="#FF8008" />
          </linearGradient>

          <linearGradient id="glass-light" x1="0" y1="0" x2="100" y2="100">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.1" />
          </linearGradient>
          
          {/* Drop Shadows */}
          <filter id="drop-shadow-3d" x="-20%" y="-20%" width="140%" height="140%" filterUnits="userSpaceOnUse">
            <feDropShadow dx="0" dy="6" stdDeviation="4" floodColor="#1E3A8A" floodOpacity="0.35" />
          </filter>
        </defs>

        {/* Background Grid Hexagon (Representing property boundary grid) */}
        <polygon
          points="50,5 89,27 89,73 50,95 11,73 11,27"
          stroke="url(#blue-vibrant)"
          strokeWidth="1.5"
          strokeDasharray="4 2"
          className="opacity-30"
          fill="none"
        />

        {/* 3D Isometric Cube Structure */}
        {/* Left Side (Dark/Shadowed) */}
        <path
          d="M50 90 L15 70 L15 30 L50 50 Z"
          fill="url(#blue-deep)"
          filter="url(#drop-shadow-3d)"
        />

        {/* Right Side (Vibrant/Lit) */}
        <path
          d="M50 90 L85 70 L85 30 L50 50 Z"
          fill="url(#blue-vibrant)"
        />

        {/* Top Side (Gold/Warm Highlight representing valuation/tax growth) */}
        <path
          d="M50 10 L85 30 L50 50 L15 30 Z"
          fill="url(#gold-bright)"
        />

        {/* Archive Layer Details - White overlay lines forming sheets of document */}
        <path
          d="M50 10 L50 90"
          stroke="#FFFFFF"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.3"
        />
        
        {/* Floating Glass/Document sheets cutting through the center (representing digital workflow) */}
        <path
          d="M25 45 L50 58 L75 45"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.9"
        />

        <path
          d="M25 57 L50 70 L75 57"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.75"
        />

        <path
          d="M25 69 L50 82 L75 69"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.5"
        />

        {/* Core highlight dot */}
        <circle cx="50" cy="50" r="3" fill="#FFFFFF" className="animate-ping" style={{ transformOrigin: '50px 50px' }} />
        <circle cx="50" cy="50" r="2.5" fill="#FFFFFF" />
      </svg>
    </div>
  );
}
