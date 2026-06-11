// src/components/forms/login-form.tsx
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginInput } from '@/validators/auth.validator';
import { loginAction } from '@/actions/auth.actions';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2, Lock, User } from 'lucide-react';

/*
 * Clay Design Tokens — Login Form
 * Spec: text-input (44px, canvas bg, hairline border 1px, rounded-md 12px)
 *       button-primary (44px, near-black bg, rounded-md 12px)
 */

export function LoginForm() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();
  const [focusedField, setFocusedField] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  });

  const onSubmit = (data: LoginInput) => {
    startTransition(async () => {
      try {
        const result = await loginAction(data);
        if (result && !result.success) {
          toast.error(result.error || 'Terjadi kesalahan');
        }
      } catch (error: any) {
        toast.error(error.message || 'Gagal login');
      }
    });
  };

  /* Shared input wrapper style — White + Blue System */
  const inputWrapperStyle = (fieldName: string): React.CSSProperties => ({
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    height: 40,
    borderRadius: 8,
    border: `1px solid ${focusedField === fieldName ? '#2563eb' : '#e2e8f0'}`,
    backgroundColor: '#ffffff',
    boxShadow: focusedField === fieldName ? '0 0 0 3px rgba(37,99,235,0.12)' : 'none',
    transition: 'border-color 200ms ease-out, box-shadow 200ms ease-out',
    overflow: 'hidden',
  });

  /* Shared input field style */
  const inputFieldStyle: React.CSSProperties = {
    flex: 1,
    height: '100%',
    background: 'transparent',
    border: 'none',
    outline: 'none',
    fontSize: 13.5,
    fontWeight: 400,
    color: '#0f172a',
    paddingRight: 12,
  };

  /* Label style */
  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 10.5,
    fontWeight: 700,
    letterSpacing: '0.07em',
    textTransform: 'uppercase',
    color: '#64748b',
    marginBottom: 5,
  };

  /* Icon style */
  const iconStyle = (fieldName: string): React.CSSProperties => ({
    color: focusedField === fieldName ? '#2563eb' : '#94a3b8',
    transition: 'color 200ms',
    flexShrink: 0,
    margin: '0 9px 0 11px',
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Username field ─────────────────────────── */}
      <div>
        <label htmlFor="username" style={labelStyle}>Username</label>
        <div style={inputWrapperStyle('username')}>
          <User className="h-4 w-4" style={iconStyle('username')} />
          <input
            id="username"
            type="text"
            placeholder="Masukkan username Anda"
            {...register('username')}
            onFocus={() => setFocusedField('username')}
            onBlur={() => setFocusedField(null)}
            disabled={isPending}
            style={{
              ...inputFieldStyle,
              paddingLeft: 0,
              opacity: isPending ? 0.6 : 1,
              cursor: isPending ? 'not-allowed' : 'text',
            }}
          />
        </div>
        {errors.username && (
          <p style={{ fontSize: 12, fontWeight: 600, color: '#ef4444', marginTop: 5, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 10 }}>⚠</span>
            {errors.username.message}
          </p>
        )}
      </div>

      {/* ── Password field ─────────────────────────── */}
      <div>
        <label htmlFor="password" style={labelStyle}>Password</label>
        <div style={inputWrapperStyle('password')}>
          <Lock className="h-4 w-4" style={iconStyle('password')} />
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Masukkan password Anda"
            {...register('password')}
            onFocus={() => setFocusedField('password')}
            onBlur={() => setFocusedField(null)}
            disabled={isPending}
            style={{
              ...inputFieldStyle,
              paddingLeft: 0,
              paddingRight: 44,
              opacity: isPending ? 0.6 : 1,
              cursor: isPending ? 'not-allowed' : 'text',
            }}
          />
          {/* Password visibility toggle — 44px touch target */}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isPending}
            style={{
              position: 'absolute', right: 0,
              height: '100%', width: 44,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'none', border: 'none', cursor: isPending ? 'not-allowed' : 'pointer',
              color: '#9a9a9a',
              transition: 'color 150ms',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#0a0a0a'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#9a9a9a'}
            aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && (
          <p style={{ fontSize: 12, fontWeight: 600, color: '#ef4444', marginTop: 5, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 10 }}>⚠</span>
            {errors.password.message}
          </p>
        )}
      </div>

      {/*
       * ── Submit Button ─────────────────────────────
       * Clay button-primary spec:
       * bg #0a0a0a (near-black ink), text white, height 44px,
       * rounded-md (12px), Inter 14px / 600,
       * active:scale-[0.98] clay-press micro-interaction
       */}
      <button
        type="submit"
        disabled={isPending}
        className="arch-press"
        style={{
          height: 40,
          borderRadius: 8,
          backgroundColor: isPending ? '#e2e8f0' : '#2563eb',
          color: isPending ? '#94a3b8' : '#ffffff',
          fontSize: 13.5, fontWeight: 600,
          border: 'none', cursor: isPending ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          width: '100%',
          marginTop: 4,
          transition: 'background-color 150ms ease-out, box-shadow 150ms ease-out',
        }}
        onMouseEnter={e => {
          if (!isPending) {
            (e.currentTarget as HTMLElement).style.backgroundColor = '#1d4ed8';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(37,99,235,0.3)';
          }
        }}
        onMouseLeave={e => {
          if (!isPending) {
            (e.currentTarget as HTMLElement).style.backgroundColor = '#2563eb';
            (e.currentTarget as HTMLElement).style.boxShadow = 'none';
          }
        }}
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Memproses...
          </>
        ) : (
          'Masuk ke Akun'
        )}
      </button>
    </form>
  );
}
