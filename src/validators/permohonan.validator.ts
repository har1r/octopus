// src/validators/permohonan.validator.ts
import { z } from 'zod';
import { ServiceType } from '@prisma/client';

export const detailPermohonanSchema = z.object({
  newOwnerName: z.string().min(1, 'Nama pemilik baru wajib diisi'),
  newOwnerStreet: z.string().min(1, 'Jalan pemilik baru wajib diisi'),
  newOwnerBlock: z.string().min(1, 'Blok pemilik baru wajib diisi'),
  newOwnerRt: z.string().min(1, 'RT pemilik baru wajib diisi'),
  newOwnerRw: z.string().min(1, 'RW pemilik baru wajib diisi'),
  newOwnerDistrict: z.string().min(1, 'Kecamatan pemilik baru wajib diisi'),
  newOwnerVillage: z.string().min(1, 'Kelurahan pemilik baru wajib diisi'),

  newPropertyStreet: z.string().min(1, 'Jalan objek baru wajib diisi'),
  newPropertyBlock: z.string().min(1, 'Blok objek baru wajib diisi'),
  newPropertyRt: z.string().min(1, 'RT objek baru wajib diisi'),
  newPropertyRw: z.string().min(1, 'RW objek baru wajib diisi'),
  newPropertyDistrict: z.string().min(1, 'Kecamatan objek baru wajib diisi'),
  newPropertyVillage: z.string().min(1, 'Kelurahan objek baru wajib diisi'),

  newLandArea: z.coerce.number().min(0.1, 'Luas tanah baru wajib diisi'),
  newBuildingArea: z.coerce.number().min(0, 'Luas bangunan baru wajib diisi'),
  ownershipProof: z.string().min(1, 'Bukti kepemilikan wajib diisi'),
});

export const permohonanSchema = z.object({
  nop: z.string()
    .transform(val => val.replace(/[^0-9]/g, ''))
    .refine(val => val.length === 18, {
      message: 'NOP wajib berisi tepat 18 digit angka',
    }),
  serviceType: z.nativeEnum(ServiceType),
  nomorPelayan: z.string().optional().nullable(),
  
  oldOwnerName: z.string().optional().nullable(),
  oldOwnerStreet: z.string().optional().nullable(),
  oldOwnerBlock: z.string().optional().nullable(),
  oldOwnerRt: z.string().optional().nullable(),
  oldOwnerRw: z.string().optional().nullable(),
  oldOwnerDistrict: z.string().optional().nullable(),
  oldOwnerVillage: z.string().optional().nullable(),

  oldPropertyStreet: z.string().optional().nullable(),
  oldPropertyBlock: z.string().optional().nullable(),
  oldPropertyRt: z.string().optional().nullable(),
  oldPropertyRw: z.string().optional().nullable(),
  oldPropertyDistrict: z.string().optional().nullable(),
  oldPropertyVillage: z.string().optional().nullable(),

  oldLandArea: z.coerce.number().optional().nullable(),
  oldBuildingArea: z.coerce.number().optional().nullable(),
  
  applicantPhone: z.string().optional().nullable(),
  details: z.array(detailPermohonanSchema).default([]),
}).superRefine((data, ctx) => {
  // BR-011: check nomorPelayan unless PENGAKTIFAN
  if (data.serviceType !== ServiceType.PENGAKTIFAN) {
    if (!data.nomorPelayan || data.nomorPelayan.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['nomorPelayan'],
        message: 'Nomor Pelayan wajib diisi untuk jenis layanan ini',
      });
    }
  }

  // BR-008 & BR-009: land / building validation for MUTASI_SEBAGIAN
  if (data.serviceType === ServiceType.MUTASI_SEBAGIAN) {
    const oldLand = data.oldLandArea || 0;
    const oldBldg = data.oldBuildingArea || 0;
    
    if (data.details.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['details'],
        message: 'Mutasi sebagian wajib memiliki minimal 1 pecahan',
      });
    }

    let sumLand = 0;
    let sumBldg = 0;
    for (const detail of data.details) {
      sumLand += detail.newLandArea;
      sumBldg += detail.newBuildingArea;
    }

    if (sumLand > oldLand) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['oldLandArea'],
        message: `Total luas tanah pecahan (${sumLand} m²) melebihi luas tanah asal (${oldLand} m²)`,
      });
    }
    if (sumBldg > oldBldg) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['oldBuildingArea'],
        message: `Total luas bangunan pecahan (${sumBldg} m²) melebihi luas bangunan asal (${oldBldg} m²)`,
      });
    }
  }
});

export type PermohonanInput = z.infer<typeof permohonanSchema>;
