// src/components/forms/permohonan-form.tsx
'use client';

import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { permohonanSchema } from '@/validators/permohonan.validator';
import { z } from 'zod';
import { createPermohonanAction, updatePermohonanAction } from '@/actions/permohonan.actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { ServiceType, Permohonan } from '@prisma/client';

// ── CUSTOM INPUT COMPONENT WITH HOVER/FOCUS & OPTIONAL INLINE ICON ───────────
interface StyledInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  icon?: React.ReactNode;
}

const StyledInput = React.forwardRef<HTMLInputElement, StyledInputProps>(
  ({ error, icon, ...props }, ref) => {
    const [focused, setFocused] = React.useState(false);
    const [hovered, setHovered] = React.useState(false);

    return (
      <div style={{ position: 'relative', width: '100%' }}>
        {icon && (
          <span
            style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              alignItems: 'center',
              color: error ? '#EF4444' : focused ? '#2563EB' : '#9CA3AF',
              pointerEvents: 'none',
              transition: 'color 100ms',
            }}
          >
            {icon}
          </span>
        )}
        <input
          ref={ref}
          onFocus={() => setFocused(true)}
          onBlur={(e) => {
            setFocused(false);
            if (props.onBlur) props.onBlur(e);
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            height: '34px',
            width: '100%',
            paddingLeft: icon ? '32px' : '10px',
            paddingRight: '10px',
            borderRadius: '6px',
            border: `1px solid ${error ? '#EF4444' : focused ? '#2563EB' : hovered ? '#9CA3AF' : '#E5E7EB'}`,
            boxShadow: focused ? '0 0 0 2px rgba(37,99,235,0.06)' : 'none',
            fontSize: '12.5px',
            color: '#111827',
            backgroundColor: '#ffffff',
            outline: 'none',
            transition: 'all 100ms',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            ...props.style,
          }}
          {...props}
        />
      </div>
    );
  }
);
StyledInput.displayName = 'StyledInput';

// ── CUSTOM SELECT COMPONENT ──────────────────────────────────────────────────
interface StyledSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}

const StyledSelect = React.forwardRef<HTMLSelectElement, StyledSelectProps>(
  ({ error, children, ...props }, ref) => {
    const [focused, setFocused] = React.useState(false);
    const [hovered, setHovered] = React.useState(false);

    return (
      <select
        ref={ref}
        onFocus={() => setFocused(true)}
        onBlur={(e) => {
          setFocused(false);
          if (props.onBlur) props.onBlur(e);
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          height: '34px',
          width: '100%',
          padding: '0 10px',
          borderRadius: '6px',
          border: `1px solid ${error ? '#EF4444' : focused ? '#2563EB' : hovered ? '#9CA3AF' : '#E5E7EB'}`,
          boxShadow: focused ? '0 0 0 2px rgba(37,99,235,0.06)' : 'none',
          fontSize: '12.5px',
          color: '#111827',
          backgroundColor: '#ffffff',
          outline: 'none',
          transition: 'all 100ms',
          appearance: 'none',
          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='3 4.5 6 7.5 9 4.5'/></svg>")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 10px center',
          paddingRight: '30px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          ...props.style,
        }}
        {...props}
      >
        {children}
      </select>
    );
  }
);
StyledSelect.displayName = 'StyledSelect';

// ── CUSTOM BUTTON ────────────────────────────────────────────────────────────
interface StyledButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'dashed';
}

function StyledButton({ variant = 'primary', children, ...props }: StyledButtonProps) {
  const [hovered, setHovered] = React.useState(false);
  const [pressed, setPressed] = React.useState(false);

  const getStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: hovered ? '#1D4ED8' : '#2563EB',
          color: '#ffffff',
          border: 'none',
        };
      case 'secondary':
        return {
          backgroundColor: hovered ? '#EFF6FF' : '#ffffff',
          color: '#2563EB',
          border: '1px solid #2563EB',
        };
      case 'danger':
        return {
          backgroundColor: hovered ? '#EFF6FF' : '#ffffff',
          color: '#2563EB',
          border: '1px solid #2563EB',
        };
      case 'dashed':
        return {
          backgroundColor: hovered ? 'rgba(37,99,235,0.02)' : 'transparent',
          color: '#2563EB',
          border: `1.5px dashed ${hovered ? '#2563EB' : '#2563EB'}`,
        };
    }
  };

  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        height: '32px',
        padding: '0 12px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: 'bold',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        transition: 'all 120ms',
        transform: pressed ? 'scale(0.97)' : 'none',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        userSelect: 'none',
        ...getStyles(),
        ...props.style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}

// ── BRANDED CARD CONTAINER ───────────────────────────────────────────────────
interface StyledCardProps {
  title: string;
  description?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function StyledCard({ title, description, icon, children }: StyledCardProps) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: '1px solid #E5E7EB',
        borderRadius: '6px',
        backgroundColor: '#ffffff',
        marginBottom: '20px',
        overflow: 'hidden',
        boxShadow: hovered ? '0 4px 12px rgba(17,24,39,0.03)' : 'none',
        transition: 'box-shadow 150ms ease-in-out',
      }}
    >
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid #F3F4F6',
          backgroundColor: '#FAFAFA',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', color: '#2563EB' }}>
          {icon}
        </span>
        <div>
          <h3 style={{ fontSize: '12.5px', fontWeight: 'bold', color: '#374151', margin: 0 }}>
            {title}
          </h3>
          {description && (
            <p style={{ fontSize: '10.5px', color: '#6B7280', margin: '2px 0 0 0' }}>
              {description}
            </p>
          )}
        </div>
      </div>
      <div style={{ padding: '20px' }}>
        {children}
      </div>
    </div>
  );
}

// ── GRID WRAPPER FOR FORM FIELDS ──────────────────────────────────────────────
interface FormFieldProps {
  label: string;
  span?: number;
  error?: string;
  children: React.ReactNode;
}

function FormField({ label, span = 6, error, children }: FormFieldProps) {
  return (
    <div
      style={{
        gridColumn: `span ${span}`,
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
      }}
    >
      <label
        style={{
          fontSize: '10px',
          fontWeight: 'bold',
          color: '#4B5563',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {label}
      </label>
      {children}
      {error && (
        <span
          style={{
            fontSize: '10.5px',
            fontWeight: 500,
            color: '#EF4444',
            marginTop: '2px',
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
}

interface PermohonanFormProps {
  initialData?: Permohonan & { details: any[] };
}

// Formats number input into NOP mask: XX.XX.XXX.XXX.XXX-XXXX.X
function formatNop(value: string): string {
  const nums = value.replace(/[^0-9]/g, '').substring(0, 18);
  let formatted = '';
  if (nums.length > 0) formatted += nums.substring(0, 2);
  if (nums.length > 2) formatted += '.' + nums.substring(2, 4);
  if (nums.length > 4) formatted += '.' + nums.substring(4, 7);
  if (nums.length > 7) formatted += '.' + nums.substring(7, 10);
  if (nums.length > 10) formatted += '.' + nums.substring(10, 13);
  if (nums.length > 13) formatted += '-' + nums.substring(13, 17);
  if (nums.length > 17) formatted += '.' + nums.substring(17, 18);
  return formatted;
}

const serviceTypeLabels: Record<string, string> = {
  OBJEK_PAJAK_BARU: 'Objek Pajak Baru',
  MUTASI_SEBAGIAN: 'Mutasi Sebagian',
  MUTASI_HABIS_UPDATE: 'Mutasi Habis (Update)',
  MUTASI_HABIS_REGULER: 'Mutasi Habis (Reguler)',
  PEMBETULAN: 'Pembetulan',
  PENGAKTIFAN: 'Pengaktifan',
};

export function PermohonanForm({ initialData }: PermohonanFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<z.input<typeof permohonanSchema>>({
    resolver: zodResolver(permohonanSchema),
    defaultValues: initialData
      ? {
        nop: formatNop(initialData.nop),
        serviceType: initialData.serviceType,
        nomorPelayan: initialData.nomorPelayan || '',
        oldOwnerName: initialData.oldOwnerName || '',
        oldOwnerStreet: initialData.oldOwnerStreet || '',
        oldOwnerBlock: initialData.oldOwnerBlock || '',
        oldOwnerRt: initialData.oldOwnerRt || '',
        oldOwnerRw: initialData.oldOwnerRw || '',
        oldOwnerDistrict: initialData.oldOwnerDistrict || '',
        oldOwnerVillage: initialData.oldOwnerVillage || '',
        oldPropertyStreet: initialData.oldPropertyStreet || '',
        oldPropertyBlock: initialData.oldPropertyBlock || '',
        oldPropertyRt: initialData.oldPropertyRt || '',
        oldPropertyRw: initialData.oldPropertyRw || '',
        oldPropertyDistrict: initialData.oldPropertyDistrict || '',
        oldPropertyVillage: initialData.oldPropertyVillage || '',
        oldLandArea: initialData.oldLandArea || 0,
        oldBuildingArea: initialData.oldBuildingArea || 0,
        applicantPhone: initialData.applicantPhone || '',
        details: initialData.details.map(d => ({
          newOwnerName: d.newOwnerName,
          newOwnerStreet: d.newOwnerStreet,
          newOwnerBlock: d.newOwnerBlock,
          newOwnerRt: d.newOwnerRt,
          newOwnerRw: d.newOwnerRw,
          newOwnerDistrict: d.newOwnerDistrict,
          newOwnerVillage: d.newOwnerVillage,
          newPropertyStreet: d.newPropertyStreet,
          newPropertyBlock: d.newPropertyBlock,
          newPropertyRt: d.newPropertyRt,
          newPropertyRw: d.newPropertyRw,
          newPropertyDistrict: d.newPropertyDistrict,
          newPropertyVillage: d.newPropertyVillage,
          newLandArea: d.newLandArea,
          newBuildingArea: d.newBuildingArea,
          ownershipProof: d.ownershipProof,
        })),
      }
      : {
        nop: '',
        serviceType: ServiceType.OBJEK_PAJAK_BARU,
        nomorPelayan: '',
        oldOwnerName: '',
        oldOwnerStreet: '',
        oldOwnerBlock: '',
        oldOwnerRt: '',
        oldOwnerRw: '',
        oldOwnerDistrict: '',
        oldOwnerVillage: '',
        oldPropertyStreet: '',
        oldPropertyBlock: '',
        oldPropertyRt: '',
        oldPropertyRw: '',
        oldPropertyDistrict: '',
        oldPropertyVillage: '',
        oldLandArea: 0,
        oldBuildingArea: 0,
        applicantPhone: '',
        details: [],
      },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'details',
  });

  const watchServiceType = watch('serviceType');
  const watchNop = watch('nop');
  const watchApplicantPhone = watch('applicantPhone');
  const watchDetails = watch('details');

  const isNopValid = watchNop ? watchNop.replace(/[^0-9]/g, '').length === 18 : false;
  const isPhoneValid = watchApplicantPhone ? watchApplicantPhone.trim().length >= 9 : false;

  // Handle NOP formatting
  const handleNopChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatNop(e.target.value);
    setValue('nop', formatted, { shouldValidate: true });
  };

  const onSubmit = (data: z.input<typeof permohonanSchema>) => {
    startTransition(async () => {
      try {
        let result;
        if (initialData) {
          result = await updatePermohonanAction(initialData.id, data);
        } else {
          result = await createPermohonanAction(data);
        }

        if (result.success) {
          toast.success(initialData ? 'Permohonan berhasil diperbarui' : 'Permohonan berhasil disimpan');
          router.push('/permohonan');
          router.refresh();
        } else {
          toast.error(result.error || 'Gagal memproses permohonan');
        }
      } catch (error: any) {
        toast.error(error.message || 'Terjadi kesalahan sistem');
      }
    });
  };

  // Custom Inline Vector SVG Icons
  const LayananIcon = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" />
      <rect x="14" y="3" width="7" height="5" />
      <rect x="14" y="12" width="7" height="9" />
      <rect x="3" y="16" width="7" height="5" />
    </svg>
  );

  const UserIcon = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );

  const PecahanHeaderIcon = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );

  const NopInputIcon = (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <line x1="7" y1="8" x2="17" y2="8" />
      <line x1="7" y1="12" x2="17" y2="12" />
      <line x1="7" y1="16" x2="13" y2="16" />
    </svg>
  );

  const PhoneInputIcon = (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
   );

  const UserInputIcon = (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );

  const MapPinInputIcon = (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );

  const SizeInputIcon = (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="9" y1="3" x2="9" y2="21" />
      <line x1="15" y1="3" x2="15" y2="21" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="3" y1="15" x2="21" y2="15" />
    </svg>
  );

  const DocumentInputIcon = (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      style={{
        maxWidth: '1120px',
        margin: '0 auto',
        paddingBottom: '40px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      {/* Header and Back Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <StyledButton
          type="button"
          variant="secondary"
          onClick={() => router.back()}
          style={{ width: '32px', height: '32px', padding: 0 }}
          title="Kembali"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </StyledButton>
        <div>
          <h1
            style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#111827',
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            {initialData ? 'Perbaiki Permohonan' : 'Form Permohonan Baru'}
          </h1>
          <p style={{ fontSize: '11px', color: '#6B7280', margin: '2px 0 0 0' }}>
            {initialData ? `Nomor Berkas: ${initialData.nomorBerkas}` : 'Isi formulir pendaftaran pelayanan PBB di bawah ini'}
          </p>
        </div>
      </div>

      {/* Main Workspace Split Layout */}
      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: 'flex-start',
          gap: '24px',
        }}
      >
        {/* Left Side Column: Interactive Forms */}
        <div style={{ flex: 1, width: '100%', minWidth: 0 }}>
          {/* Card 1: Core Service Info */}
          <StyledCard
            title="Informasi Layanan & NOP"
            description="Tentukan jenis pelayanan dan isi NOP Objek Pajak"
            icon={LayananIcon}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '16px' }}>
              <FormField label="Jenis Pelayanan" span={6} error={errors.serviceType?.message}>
                <StyledSelect
                  disabled={isPending || !!initialData}
                  value={watchServiceType}
                  error={errors.serviceType?.message}
                  onChange={(e) => {
                    const val = e.target.value as ServiceType;
                    setValue('serviceType', val, { shouldValidate: true });
                    if (val !== ServiceType.MUTASI_SEBAGIAN) {
                      setValue('details', []);
                    } else if (fields.length === 0) {
                      append({
                        newOwnerName: '', newOwnerStreet: '', newOwnerBlock: '', newOwnerRt: '', newOwnerRw: '', newOwnerDistrict: '', newOwnerVillage: '',
                        newPropertyStreet: '', newPropertyBlock: '', newPropertyRt: '', newPropertyRw: '', newPropertyDistrict: '', newPropertyVillage: '',
                        newLandArea: 0, newBuildingArea: 0, ownershipProof: ''
                      });
                    }
                  }}
                >
                  <option value={ServiceType.OBJEK_PAJAK_BARU}>Objek Pajak Baru</option>
                  <option value={ServiceType.MUTASI_SEBAGIAN}>Mutasi Sebagian</option>
                  <option value={ServiceType.MUTASI_HABIS_UPDATE}>Mutasi Habis (Update)</option>
                  <option value={ServiceType.MUTASI_HABIS_REGULER}>Mutasi Habis (Reguler)</option>
                  <option value={ServiceType.PEMBETULAN}>Pembetulan</option>
                  <option value={ServiceType.PENGAKTIFAN}>Pengaktifan</option>
                </StyledSelect>
              </FormField>

              <FormField label="Nomor Objek Pajak (NOP)" span={6} error={errors.nop?.message}>
                <StyledInput
                  type="text"
                  placeholder="00.00.000.000.000-0000.0"
                  value={watchNop}
                  onChange={handleNopChange}
                  disabled={isPending}
                  error={errors.nop?.message}
                  icon={NopInputIcon}
                />
              </FormField>

              {/* Conditional Nomor Pelayan */}
              {watchServiceType !== ServiceType.PENGAKTIFAN && (
                <FormField label="Nomor Pelayan" span={12} error={errors.nomorPelayan?.message}>
                  <StyledInput
                    type="text"
                    placeholder="Masukkan Nomor Pelayan"
                    {...register('nomorPelayan')}
                    disabled={isPending}
                    error={errors.nomorPelayan?.message}
                    icon={DocumentInputIcon}
                  />
                </FormField>
              )}

              <FormField label="Nomor Handphone Pemohon (Untuk Notifikasi WA)" span={12} error={errors.applicantPhone?.message}>
                <StyledInput
                  type="text"
                  placeholder="Contoh: 081234567890"
                  {...register('applicantPhone')}
                  disabled={isPending}
                  error={errors.applicantPhone?.message}
                  icon={PhoneInputIcon}
                />
              </FormField>
            </div>
          </StyledCard>

          {/* Card 2: Original Property Details */}
          {watchServiceType !== ServiceType.OBJEK_PAJAK_BARU && (
            <StyledCard
              title="Data Objek Pajak / Pemilik Asal"
              description="Masukkan rincian data pemilik lama dan luas objek saat ini"
              icon={UserIcon}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Owner Section */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '16px' }}>
                  <FormField label="Nama Pemilik Lama" span={12} error={errors.oldOwnerName?.message}>
                    <StyledInput
                      type="text"
                      placeholder="Nama Lengkap"
                      {...register('oldOwnerName')}
                      disabled={isPending}
                      error={errors.oldOwnerName?.message}
                      icon={UserInputIcon}
                    />
                  </FormField>

                  <FormField label="Alamat Pemilik Lama" span={12} error={errors.oldOwnerStreet?.message}>
                    <StyledInput
                      type="text"
                      placeholder="Jalan / Dukuh"
                      {...register('oldOwnerStreet')}
                      disabled={isPending}
                      error={errors.oldOwnerStreet?.message}
                      icon={MapPinInputIcon}
                    />
                  </FormField>

                  <FormField label="Blok" span={6} error={errors.oldOwnerBlock?.message}>
                    <StyledInput
                      type="text"
                      placeholder="Blok"
                      {...register('oldOwnerBlock')}
                      disabled={isPending}
                      error={errors.oldOwnerBlock?.message}
                    />
                  </FormField>

                  <div style={{ gridColumn: 'span 6', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <FormField label="RT" span={1} error={errors.oldOwnerRt?.message}>
                      <StyledInput
                        type="text"
                        placeholder="00"
                        {...register('oldOwnerRt')}
                        disabled={isPending}
                        error={errors.oldOwnerRt?.message}
                      />
                    </FormField>
                    <FormField label="RW" span={1} error={errors.oldOwnerRw?.message}>
                      <StyledInput
                        type="text"
                        placeholder="00"
                        {...register('oldOwnerRw')}
                        disabled={isPending}
                        error={errors.oldOwnerRw?.message}
                      />
                    </FormField>
                  </div>

                  <FormField label="Kecamatan" span={6} error={errors.oldOwnerDistrict?.message}>
                    <StyledInput
                      type="text"
                      placeholder="Kecamatan"
                      {...register('oldOwnerDistrict')}
                      disabled={isPending}
                      error={errors.oldOwnerDistrict?.message}
                    />
                  </FormField>

                  <FormField label="Kelurahan / Desa" span={6} error={errors.oldOwnerVillage?.message}>
                    <StyledInput
                      type="text"
                      placeholder="Kelurahan / Desa"
                      {...register('oldOwnerVillage')}
                      disabled={isPending}
                      error={errors.oldOwnerVillage?.message}
                    />
                  </FormField>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid #F3F4F6', margin: '4px 0' }} />

                {/* Property Layout */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '16px' }}>
                  <FormField label="Letak Objek Pajak" span={12} error={errors.oldPropertyStreet?.message}>
                    <StyledInput
                      type="text"
                      placeholder="Jalan Letak Objek"
                      {...register('oldPropertyStreet')}
                      disabled={isPending}
                      error={errors.oldPropertyStreet?.message}
                      icon={MapPinInputIcon}
                    />
                  </FormField>

                  <FormField label="Blok Objek" span={6} error={errors.oldPropertyBlock?.message}>
                    <StyledInput
                      type="text"
                      placeholder="Blok"
                      {...register('oldPropertyBlock')}
                      disabled={isPending}
                      error={errors.oldPropertyBlock?.message}
                    />
                  </FormField>

                  <div style={{ gridColumn: 'span 6', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <FormField label="RT Objek" span={1} error={errors.oldPropertyRt?.message}>
                      <StyledInput
                        type="text"
                        placeholder="00"
                        {...register('oldPropertyRt')}
                        disabled={isPending}
                        error={errors.oldPropertyRt?.message}
                      />
                    </FormField>
                    <FormField label="RW Objek" span={1} error={errors.oldPropertyRw?.message}>
                      <StyledInput
                        type="text"
                        placeholder="00"
                        {...register('oldPropertyRw')}
                        disabled={isPending}
                        error={errors.oldPropertyRw?.message}
                      />
                    </FormField>
                  </div>

                  <FormField label="Kecamatan Objek" span={6} error={errors.oldPropertyDistrict?.message}>
                    <StyledInput
                      type="text"
                      placeholder="Kecamatan"
                      {...register('oldPropertyDistrict')}
                      disabled={isPending}
                      error={errors.oldPropertyDistrict?.message}
                    />
                  </FormField>

                  <FormField label="Kelurahan Objek" span={6} error={errors.oldPropertyVillage?.message}>
                    <StyledInput
                      type="text"
                      placeholder="Kelurahan"
                      {...register('oldPropertyVillage')}
                      disabled={isPending}
                      error={errors.oldPropertyVillage?.message}
                    />
                  </FormField>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid #F3F4F6', margin: '4px 0' }} />

                {/* Land/Building Sizes */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '16px' }}>
                  <FormField label="Luas Tanah Asal (m²)" span={6} error={errors.oldLandArea?.message}>
                    <StyledInput
                      type="number"
                      step="any"
                      {...register('oldLandArea')}
                      disabled={isPending}
                      error={errors.oldLandArea?.message}
                      icon={SizeInputIcon}
                    />
                  </FormField>

                  <FormField label="Luas Bangunan Asal (m²)" span={6} error={errors.oldBuildingArea?.message}>
                    <StyledInput
                      type="number"
                      step="any"
                      {...register('oldBuildingArea')}
                      disabled={isPending}
                      error={errors.oldBuildingArea?.message}
                      icon={SizeInputIcon}
                    />
                  </FormField>
                </div>
              </div>
            </StyledCard>
          )}

          {/* Card 3: Dynamic Pecahan Cards (For Mutasi Sebagian Only) */}
          {watchServiceType === ServiceType.MUTASI_SEBAGIAN && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #E5E7EB', paddingBottom: '8px' }}>
                <span style={{ display: 'flex', alignItems: 'center', color: '#2563EB' }}>
                  {PecahanHeaderIcon}
                </span>
                <h3 style={{ fontSize: '13px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                  Rincian Pecahan Objek Pajak Baru
                </h3>
              </div>

              {errors.details && !Array.isArray(errors.details) && (
                <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#EF4444', margin: 0 }}>
                  {(errors.details as any).message}
                </p>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {fields.map((field, index) => {
                  const detailErrors = errors.details?.[index];

                  return (
                    <div
                      key={field.id}
                      style={{
                        border: '1px solid #E5E7EB',
                        borderRadius: '6px',
                        backgroundColor: '#FCFCFD',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      {/* Left accent color bar */}
                      <div
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: '3px',
                          backgroundColor: '#2563EB',
                        }}
                      />

                      {/* Header Row */}
                      <div
                        style={{
                          padding: '12px 16px 12px 20px',
                          borderBottom: '1px solid #F3F4F6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div>
                          <h4 style={{ fontSize: '12px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                            Pecahan #{index + 1}
                          </h4>
                          <p style={{ fontSize: '10.5px', color: '#6B7280', margin: '2px 0 0 0' }}>
                            Masukkan data objek pecahan baru
                          </p>
                        </div>

                        {fields.length > 1 && (
                          <StyledButton
                            type="button"
                            variant="danger"
                            onClick={() => remove(index)}
                            style={{ height: '26px', padding: '0 8px' }}
                            title="Hapus Pecahan"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                            Hapus
                          </StyledButton>
                        )}
                      </div>

                      {/* Fields Container */}
                      <div style={{ padding: '16px 16px 16px 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* New Owner */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '16px' }}>
                          <FormField label="Nama Pemilik Baru" span={12} error={detailErrors?.newOwnerName?.message}>
                            <StyledInput
                              type="text"
                              placeholder="Nama Pemilik Baru"
                              {...register(`details.${index}.newOwnerName`)}
                              disabled={isPending}
                              error={detailErrors?.newOwnerName?.message}
                              icon={UserInputIcon}
                            />
                          </FormField>

                          <FormField label="Alamat Pemilik Baru" span={12} error={detailErrors?.newOwnerStreet?.message}>
                            <StyledInput
                              type="text"
                              placeholder="Jalan Pemilik Baru"
                              {...register(`details.${index}.newOwnerStreet`)}
                              disabled={isPending}
                              error={detailErrors?.newOwnerStreet?.message}
                              icon={MapPinInputIcon}
                            />
                          </FormField>

                          <FormField label="Blok" span={6} error={detailErrors?.newOwnerBlock?.message}>
                            <StyledInput
                              type="text"
                              placeholder="Blok"
                              {...register(`details.${index}.newOwnerBlock`)}
                              disabled={isPending}
                              error={detailErrors?.newOwnerBlock?.message}
                            />
                          </FormField>

                          <div style={{ gridColumn: 'span 6', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <FormField label="RT" span={1} error={detailErrors?.newOwnerRt?.message}>
                              <StyledInput
                                type="text"
                                placeholder="00"
                                {...register(`details.${index}.newOwnerRt`)}
                                disabled={isPending}
                                error={detailErrors?.newOwnerRt?.message}
                              />
                            </FormField>
                            <FormField label="RW" span={1} error={detailErrors?.newOwnerRw?.message}>
                              <StyledInput
                                type="text"
                                placeholder="00"
                                {...register(`details.${index}.newOwnerRw`)}
                                disabled={isPending}
                                error={detailErrors?.newOwnerRw?.message}
                              />
                            </FormField>
                          </div>

                          <FormField label="Kecamatan" span={6} error={detailErrors?.newOwnerDistrict?.message}>
                            <StyledInput
                              type="text"
                              placeholder="Kecamatan"
                              {...register(`details.${index}.newOwnerDistrict`)}
                              disabled={isPending}
                              error={detailErrors?.newOwnerDistrict?.message}
                            />
                          </FormField>

                          <FormField label="Kelurahan" span={6} error={detailErrors?.newOwnerVillage?.message}>
                            <StyledInput
                              type="text"
                              placeholder="Kelurahan"
                              {...register(`details.${index}.newOwnerVillage`)}
                              disabled={isPending}
                              error={detailErrors?.newOwnerVillage?.message}
                            />
                          </FormField>
                        </div>

                        <hr style={{ border: 'none', borderTop: '1px solid #E5E7EB', margin: '4px 0' }} />

                        {/* New Location */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '16px' }}>
                          <FormField label="Letak Objek Baru" span={12} error={detailErrors?.newPropertyStreet?.message}>
                            <StyledInput
                              type="text"
                              placeholder="Jalan Objek Baru"
                              {...register(`details.${index}.newPropertyStreet`)}
                              disabled={isPending}
                              error={detailErrors?.newPropertyStreet?.message}
                              icon={MapPinInputIcon}
                            />
                          </FormField>

                          <FormField label="Blok Objek Baru" span={6} error={detailErrors?.newPropertyBlock?.message}>
                            <StyledInput
                              type="text"
                              placeholder="Blok"
                              {...register(`details.${index}.newPropertyBlock`)}
                              disabled={isPending}
                              error={detailErrors?.newPropertyBlock?.message}
                            />
                          </FormField>

                          <div style={{ gridColumn: 'span 6', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <FormField label="RT Objek Baru" span={1} error={detailErrors?.newPropertyRt?.message}>
                              <StyledInput
                                type="text"
                                placeholder="00"
                                {...register(`details.${index}.newPropertyRt`)}
                                disabled={isPending}
                                error={detailErrors?.newPropertyRt?.message}
                              />
                            </FormField>
                            <FormField label="RW Objek Baru" span={1} error={detailErrors?.newPropertyRw?.message}>
                              <StyledInput
                                type="text"
                                placeholder="00"
                                {...register(`details.${index}.newPropertyRw`)}
                                disabled={isPending}
                                error={detailErrors?.newPropertyRw?.message}
                              />
                            </FormField>
                          </div>

                          <FormField label="Kecamatan Objek Baru" span={6} error={detailErrors?.newPropertyDistrict?.message}>
                            <StyledInput
                              type="text"
                              placeholder="Kecamatan"
                              {...register(`details.${index}.newPropertyDistrict`)}
                              disabled={isPending}
                              error={detailErrors?.newPropertyDistrict?.message}
                            />
                          </FormField>

                          <FormField label="Kelurahan Objek Baru" span={6} error={detailErrors?.newPropertyVillage?.message}>
                            <StyledInput
                              type="text"
                              placeholder="Kelurahan"
                              {...register(`details.${index}.newPropertyVillage`)}
                              disabled={isPending}
                              error={detailErrors?.newPropertyVillage?.message}
                            />
                          </FormField>
                        </div>

                        <hr style={{ border: 'none', borderTop: '1px solid #E5E7EB', margin: '4px 0' }} />

                        {/* Pecahan Size & Proof */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '16px' }}>
                          <FormField label="Luas Tanah Pecahan (m²)" span={4} error={detailErrors?.newLandArea?.message}>
                            <StyledInput
                              type="number"
                              step="any"
                              {...register(`details.${index}.newLandArea`, { valueAsNumber: true })}
                              disabled={isPending}
                              error={detailErrors?.newLandArea?.message}
                              icon={SizeInputIcon}
                            />
                          </FormField>

                          <FormField label="Luas Bangunan Pecahan (m²)" span={4} error={detailErrors?.newBuildingArea?.message}>
                            <StyledInput
                              type="number"
                              step="any"
                              {...register(`details.${index}.newBuildingArea`, { valueAsNumber: true })}
                              disabled={isPending}
                              error={detailErrors?.newBuildingArea?.message}
                              icon={SizeInputIcon}
                            />
                          </FormField>

                          <FormField label="Bukti Kepemilikan" span={4} error={detailErrors?.ownershipProof?.message}>
                            <StyledInput
                              type="text"
                              placeholder="Cth: SHM No. 123"
                              {...register(`details.${index}.ownershipProof`)}
                              disabled={isPending}
                              error={detailErrors?.ownershipProof?.message}
                              icon={DocumentInputIcon}
                            />
                          </FormField>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <StyledButton
                type="button"
                variant="dashed"
                onClick={() => append({
                  newOwnerName: '', newOwnerStreet: '', newOwnerBlock: '', newOwnerRt: '', newOwnerRw: '', newOwnerDistrict: '', newOwnerVillage: '',
                  newPropertyStreet: '', newPropertyBlock: '', newPropertyRt: '', newPropertyRw: '', newPropertyDistrict: '', newPropertyVillage: '',
                  newLandArea: 0, newBuildingArea: 0, ownershipProof: ''
                })}
                style={{ width: '100%', height: '36px' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Tambah Pecahan Baru
              </StyledButton>
            </div>
          )}
        </div>

        {/* Right Side Column: Sticky Verification Inspector Panel */}
        <div
          style={{
            width: isMobile ? '100%' : '300px',
            flexShrink: 0,
            position: isMobile ? 'static' : 'sticky',
            top: '20px',
          }}
        >
          <div
            style={{
              border: '1px solid #E5E7EB',
              borderRadius: '6px',
              backgroundColor: '#ffffff',
              padding: '16px',
              boxShadow: '0 4px 12px rgba(17,24,39,0.02)',
            }}
          >
            <h3
              style={{
                fontSize: '11px',
                fontWeight: 'bold',
                color: '#374151',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                margin: '0 0 12px 0',
                borderBottom: '1px solid #F3F4F6',
                paddingBottom: '8px',
              }}
            >
              Ringkasan Permohonan
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#9CA3AF', textTransform: 'uppercase', display: 'block' }}>
                  Jenis Pelayanan
                </span>
                <span
                  style={{
                    display: 'inline-block',
                    marginTop: '4px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    backgroundColor: '#EFF6FF',
                    color: '#1D4ED8',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    border: '1px solid #dbeafe',
                  }}
                >
                  {serviceTypeLabels[watchServiceType] || watchServiceType.replace(/_/g, ' ')}
                </span>
              </div>

              <div>
                <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#9CA3AF', textTransform: 'uppercase', display: 'block' }}>
                  Nomor Objek Pajak (NOP)
                </span>
                <span style={{ fontSize: '12.5px', fontFamily: 'monospace', fontWeight: 'bold', color: watchNop ? '#111827' : '#9CA3AF', wordBreak: 'break-all' }}>
                  {watchNop || 'Belum diisi'}
                </span>
              </div>

              <div>
                <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#9CA3AF', textTransform: 'uppercase', display: 'block' }}>
                  HP Pemohon
                </span>
                <span style={{ fontSize: '12px', color: watchApplicantPhone ? '#111827' : '#9CA3AF' }}>
                  {watchApplicantPhone || 'Belum diisi'}
                </span>
              </div>

              {watchServiceType === ServiceType.MUTASI_SEBAGIAN && (
                <div>
                  <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#9CA3AF', textTransform: 'uppercase', display: 'block' }}>
                    Jumlah Pecahan
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#111827' }}>
                    {watchDetails?.length || 0} Objek Baru
                  </span>
                </div>
              )}
            </div>

            {/* Form Validation Checklist */}
            <div
              style={{
                padding: '10px',
                backgroundColor: '#FAFAFA',
                borderRadius: '6px',
                marginBottom: '20px',
                border: '1px solid #F3F4F6',
              }}
            >
              <span style={{ fontSize: '9.5px', fontWeight: 'bold', color: '#6B7280', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                Checklist Formulir
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* NOP Checklist */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
                  {isNopValid ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', border: '1.5px solid #D1D5DB', display: 'inline-block', flexShrink: 0 }} />
                  )}
                  <span style={{ color: isNopValid ? '#10B981' : '#6B7280', fontWeight: isNopValid ? 600 : 400 }}>
                    NOP Valid (18 digit)
                  </span>
                </div>

                {/* HP Checklist */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
                  {isPhoneValid ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', border: '1.5px solid #D1D5DB', display: 'inline-block', flexShrink: 0 }} />
                  )}
                  <span style={{ color: isPhoneValid ? '#10B981' : '#6B7280', fontWeight: isPhoneValid ? 600 : 400 }}>
                    No. HP Diisi
                  </span>
                </div>
              </div>
            </div>

            {/* Buttons Panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <StyledButton
                type="submit"
                disabled={isPending}
                style={{ width: '100%', height: '34px', justifyContent: 'center' }}
              >
                {isPending ? (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-spin" style={{ marginRight: '6px' }}>
                      <line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" />
                      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" /><line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
                      <line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" />
                      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" /><line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
                    </svg>
                    Menyimpan...
                  </>
                ) : (
                  initialData ? 'Perbarui Permohonan' : 'Kirim Permohonan'
                )}
              </StyledButton>

              <StyledButton
                type="button"
                variant="secondary"
                disabled={isPending}
                onClick={() => router.back()}
                style={{ width: '100%', height: '34px', justifyContent: 'center' }}
              >
                Batal
              </StyledButton>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
