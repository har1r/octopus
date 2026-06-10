// src/components/forms/permohonan-form.tsx
'use client';

import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { permohonanSchema } from '@/validators/permohonan.validator';
import { z } from 'zod';
import { createPermohonanAction, updatePermohonanAction } from '@/actions/permohonan.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { ServiceType, Permohonan } from '@prisma/client';
import { Loader2, Plus, Trash2, FileText, User, Home, Layers, ArrowLeft } from 'lucide-react';

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

export function PermohonanForm({ initialData }: PermohonanFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

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

  const selectedServiceType = watch('serviceType');
  const watchNop = watch('nop');

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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-4xl pb-12">
      {/* Header and Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="border-[#DDDDDD] hover:bg-[#F7F7F7] h-10 w-10 p-0 rounded-lg"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-[#222222]">
              {initialData ? 'Perbaiki Permohonan' : 'Form Permohonan Baru'}
            </h1>
            <p className="text-xs text-[#717171]">
              {initialData ? `Nomor Berkas: ${initialData.nomorBerkas}` : 'Isi formulir pendaftaran pelayanan PBB di bawah ini'}
            </p>
          </div>
        </div>
      </div>

      {/* 1. Core Service Info Card */}
      <Card className="border-[#DDDDDD] shadow-sm">
        <CardHeader className="pb-4 border-b border-[#F7F7F7]">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Layers className="h-5 w-5 text-[#FF385C]" />
            Informasi Layanan & NOP
          </CardTitle>
          <CardDescription>Tentukan jenis pelayanan dan isi NOP Objek Pajak</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Jenis Pelayanan</Label>
            <Select
              disabled={isPending || !!initialData}
              value={selectedServiceType}
              onValueChange={(val) => {
                setValue('serviceType', val as ServiceType, { shouldValidate: true });
                if (val !== ServiceType.MUTASI_SEBAGIAN) {
                  setValue('details', []);
                } else if (fields.length === 0) {
                  // Add 1 default detail item for mutasi sebagian
                  append({
                    newOwnerName: '', newOwnerStreet: '', newOwnerBlock: '', newOwnerRt: '', newOwnerRw: '', newOwnerDistrict: '', newOwnerVillage: '',
                    newPropertyStreet: '', newPropertyBlock: '', newPropertyRt: '', newPropertyRw: '', newPropertyDistrict: '', newPropertyVillage: '',
                    newLandArea: 0, newBuildingArea: 0, ownershipProof: ''
                  });
                }
              }}
            >
              <SelectTrigger className="h-11 border-[#DDDDDD] rounded-lg focus:ring-[#FF385C]">
                <SelectValue placeholder="Pilih Jenis Pelayanan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ServiceType.OBJEK_PAJAK_BARU}>Objek Pajak Baru</SelectItem>
                <SelectItem value={ServiceType.MUTASI_SEBAGIAN}>Mutasi Sebagian</SelectItem>
                <SelectItem value={ServiceType.MUTASI_HABIS_UPDATE}>Mutasi Habis (Update)</SelectItem>
                <SelectItem value={ServiceType.MUTASI_HABIS_REGULER}>Mutasi Habis (Reguler)</SelectItem>
                <SelectItem value={ServiceType.PEMBETULAN}>Pembetulan</SelectItem>
                <SelectItem value={ServiceType.PENGAKTIFAN}>Pengaktifan</SelectItem>
              </SelectContent>
            </Select>
            {errors.serviceType && (
              <p className="text-xs text-[#EF4444]">{errors.serviceType.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Nomor Objek Pajak (NOP)</Label>
            <Input
              type="text"
              placeholder="00.00.000.000.000-0000.0"
              value={watchNop}
              onChange={handleNopChange}
              disabled={isPending}
              className="h-11 border-[#DDDDDD] rounded-lg focus-visible:ring-[#FF385C]"
            />
            {errors.nop && (
              <p className="text-xs text-[#EF4444]">{errors.nop.message}</p>
            )}
          </div>

          {/* Conditional Nomor Pelayan */}
          {selectedServiceType !== ServiceType.PENGAKTIFAN && (
            <div className="space-y-2 md:col-span-2">
              <Label className="text-sm font-semibold">Nomor Pelayan</Label>
              <Input
                type="text"
                placeholder="Masukkan Nomor Pelayan"
                {...register('nomorPelayan')}
                disabled={isPending}
                className="h-11 border-[#DDDDDD] rounded-lg focus-visible:ring-[#FF385C]"
              />
              {errors.nomorPelayan && (
                <p className="text-xs text-[#EF4444]">{errors.nomorPelayan.message}</p>
              )}
            </div>
          )}

          <div className="space-y-2 md:col-span-2">
            <Label className="text-sm font-semibold">Nomor Handphone Pemohon (Untuk Notifikasi WA)</Label>
            <Input
              type="text"
              placeholder="Contoh: 081234567890"
              {...register('applicantPhone')}
              disabled={isPending}
              className="h-11 border-[#DDDDDD] rounded-lg focus-visible:ring-[#FF385C]"
            />
          </div>
        </CardContent>
      </Card>

      {/* 2. Original Property Details (Unless New Object) */}
      {selectedServiceType !== ServiceType.OBJEK_PAJAK_BARU && (
        <Card className="border-[#DDDDDD] shadow-sm">
          <CardHeader className="pb-4 border-b border-[#F7F7F7]">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <User className="h-5 w-5 text-[#FF385C]" />
              Data Objek Pajak / Pemilik Asal
            </CardTitle>
            <CardDescription>Masukkan rincian data pemilik lama dan luas objek saat ini</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Owner Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label className="text-sm font-semibold">Nama Pemilik Lama</Label>
                <Input
                  type="text"
                  placeholder="Nama Lengkap"
                  {...register('oldOwnerName')}
                  disabled={isPending}
                  className="h-11 border-[#DDDDDD] rounded-lg focus-visible:ring-[#FF385C]"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-sm font-semibold">Alamat Pemilik Lama</Label>
                <Input
                  type="text"
                  placeholder="Jalan / Dukuh"
                  {...register('oldOwnerStreet')}
                  disabled={isPending}
                  className="h-11 border-[#DDDDDD] rounded-lg focus-visible:ring-[#FF385C]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Blok</Label>
                <Input
                  type="text"
                  placeholder="Blok"
                  {...register('oldOwnerBlock')}
                  disabled={isPending}
                  className="h-11 border-[#DDDDDD] rounded-lg focus-visible:ring-[#FF385C]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">RT</Label>
                  <Input
                    type="text"
                    placeholder="00"
                    {...register('oldOwnerRt')}
                    disabled={isPending}
                    className="h-11 border-[#DDDDDD] rounded-lg focus-visible:ring-[#FF385C]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">RW</Label>
                  <Input
                    type="text"
                    placeholder="00"
                    {...register('oldOwnerRw')}
                    disabled={isPending}
                    className="h-11 border-[#DDDDDD] rounded-lg focus-visible:ring-[#FF385C]"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Kecamatan</Label>
                <Input
                  type="text"
                  placeholder="Kecamatan"
                  {...register('oldOwnerDistrict')}
                  disabled={isPending}
                  className="h-11 border-[#DDDDDD] rounded-lg focus-visible:ring-[#FF385C]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Kelurahan / Desa</Label>
                <Input
                  type="text"
                  placeholder="Kelurahan / Desa"
                  {...register('oldOwnerVillage')}
                  disabled={isPending}
                  className="h-11 border-[#DDDDDD] rounded-lg focus-visible:ring-[#FF385C]"
                />
              </div>
            </div>

            <hr className="border-[#DDDDDD]" />

            {/* Property Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label className="text-sm font-semibold">Letak Objek Pajak</Label>
                <Input
                  type="text"
                  placeholder="Jalan Letak Objek"
                  {...register('oldPropertyStreet')}
                  disabled={isPending}
                  className="h-11 border-[#DDDDDD] rounded-lg focus-visible:ring-[#FF385C]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Blok Objek</Label>
                <Input
                  type="text"
                  placeholder="Blok"
                  {...register('oldPropertyBlock')}
                  disabled={isPending}
                  className="h-11 border-[#DDDDDD] rounded-lg focus-visible:ring-[#FF385C]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">RT Objek</Label>
                  <Input
                    type="text"
                    placeholder="00"
                    {...register('oldPropertyRt')}
                    disabled={isPending}
                    className="h-11 border-[#DDDDDD] rounded-lg focus-visible:ring-[#FF385C]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">RW Objek</Label>
                  <Input
                    type="text"
                    placeholder="00"
                    {...register('oldPropertyRw')}
                    disabled={isPending}
                    className="h-11 border-[#DDDDDD] rounded-lg focus-visible:ring-[#FF385C]"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Kecamatan Objek</Label>
                <Input
                  type="text"
                  placeholder="Kecamatan"
                  {...register('oldPropertyDistrict')}
                  disabled={isPending}
                  className="h-11 border-[#DDDDDD] rounded-lg focus-visible:ring-[#FF385C]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Kelurahan Objek</Label>
                <Input
                  type="text"
                  placeholder="Kelurahan"
                  {...register('oldPropertyVillage')}
                  disabled={isPending}
                  className="h-11 border-[#DDDDDD] rounded-lg focus-visible:ring-[#FF385C]"
                />
              </div>
            </div>

            <hr className="border-[#DDDDDD]" />

            {/* Land/Building Sizes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Luas Tanah Asal (m²)</Label>
                <Input
                  type="number"
                  step="any"
                  {...register('oldLandArea')}
                  disabled={isPending}
                  className="h-11 border-[#DDDDDD] rounded-lg focus-visible:ring-[#FF385C]"
                />
                {errors.oldLandArea && (
                  <p className="text-xs text-[#EF4444]">{errors.oldLandArea.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Luas Bangunan Asal (m²)</Label>
                <Input
                  type="number"
                  step="any"
                  {...register('oldBuildingArea')}
                  disabled={isPending}
                  className="h-11 border-[#DDDDDD] rounded-lg focus-visible:ring-[#FF385C]"
                />
                {errors.oldBuildingArea && (
                  <p className="text-xs text-[#EF4444]">{errors.oldBuildingArea.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 3. Dynamic Pecahan Cards (For Mutasi Sebagian Only) */}
      {selectedServiceType === ServiceType.MUTASI_SEBAGIAN && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#222222] flex items-center gap-2">
              <Home className="h-5 w-5 text-[#FF385C]" />
              Rincian Pecahan Objek Pajak Baru
            </h3>
          </div>

          {errors.details && !Array.isArray(errors.details) && (
            <p className="text-xs text-[#EF4444] font-semibold">{(errors.details as any).message}</p>
          )}

          <div className="space-y-4">
            {fields.map((field, index) => {
              const detailErrors = errors.details?.[index];

              return (
                <Card key={field.id} className="border-[#DDDDDD] bg-gray-50/60 rounded-xl shadow-xs relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#FF385C]" />
                  <CardHeader className="pb-2 border-b border-[#DDDDDD]/60 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-bold text-[#222222]">Pecahan #{index + 1}</CardTitle>
                      <CardDescription className="text-xs text-[#717171]">Masukkan data objek pecahan baru</CardDescription>
                    </div>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => remove(index)}
                        className="text-[#EF4444]/80 hover:text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg p-2 h-9 w-9 flex items-center justify-center transition-colors"
                        title="Hapus Pecahan"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    {/* New Owner */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2 md:col-span-2">
                        <Label className="text-xs font-bold text-[#222222]">Nama Pemilik Baru</Label>
                        <Input
                          type="text"
                          placeholder="Nama Pemilik Baru"
                          {...register(`details.${index}.newOwnerName`)}
                          disabled={isPending}
                          className="h-11 border-[#DDDDDD] bg-white rounded-lg focus-visible:ring-[#FF385C]"
                        />
                        {detailErrors?.newOwnerName && (
                          <p className="text-xs text-[#EF4444]">{detailErrors.newOwnerName.message}</p>
                        )}
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label className="text-xs font-bold text-[#222222]">Alamat Pemilik Baru</Label>
                        <Input
                          type="text"
                          placeholder="Jalan Pemilik Baru"
                          {...register(`details.${index}.newOwnerStreet`)}
                          disabled={isPending}
                          className="h-11 border-[#DDDDDD] bg-white rounded-lg focus-visible:ring-[#FF385C]"
                        />
                        {detailErrors?.newOwnerStreet && (
                          <p className="text-xs text-[#EF4444]">{detailErrors.newOwnerStreet.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-[#222222]">Blok</Label>
                        <Input
                          type="text"
                          placeholder="Blok"
                          {...register(`details.${index}.newOwnerBlock`)}
                          disabled={isPending}
                          className="h-11 border-[#DDDDDD] bg-white rounded-lg focus-visible:ring-[#FF385C]"
                        />
                        {detailErrors?.newOwnerBlock && (
                          <p className="text-xs text-[#EF4444]">{detailErrors.newOwnerBlock.message}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-[#222222]">RT</Label>
                          <Input
                            type="text"
                            placeholder="00"
                            {...register(`details.${index}.newOwnerRt`)}
                            disabled={isPending}
                            className="h-11 border-[#DDDDDD] bg-white rounded-lg focus-visible:ring-[#FF385C]"
                          />
                          {detailErrors?.newOwnerRt && (
                            <p className="text-xs text-[#EF4444]">{detailErrors.newOwnerRt.message}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-[#222222]">RW</Label>
                          <Input
                            type="text"
                            placeholder="00"
                            {...register(`details.${index}.newOwnerRw`)}
                            disabled={isPending}
                            className="h-11 border-[#DDDDDD] bg-white rounded-lg focus-visible:ring-[#FF385C]"
                          />
                          {detailErrors?.newOwnerRw && (
                            <p className="text-xs text-[#EF4444]">{detailErrors.newOwnerRw.message}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-[#222222]">Kecamatan</Label>
                        <Input
                          type="text"
                          placeholder="Kecamatan"
                          {...register(`details.${index}.newOwnerDistrict`)}
                          disabled={isPending}
                          className="h-11 border-[#DDDDDD] bg-white rounded-lg focus-visible:ring-[#FF385C]"
                        />
                        {detailErrors?.newOwnerDistrict && (
                          <p className="text-xs text-[#EF4444]">{detailErrors.newOwnerDistrict.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-[#222222]">Kelurahan</Label>
                        <Input
                          type="text"
                          placeholder="Kelurahan"
                          {...register(`details.${index}.newOwnerVillage`)}
                          disabled={isPending}
                          className="h-11 border-[#DDDDDD] bg-white rounded-lg focus-visible:ring-[#FF385C]"
                        />
                        {detailErrors?.newOwnerVillage && (
                          <p className="text-xs text-[#EF4444]">{detailErrors.newOwnerVillage.message}</p>
                        )}
                      </div>
                    </div>

                    <hr className="border-[#DDDDDD]/60" />

                    {/* New Location */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2 md:col-span-2">
                        <Label className="text-xs font-bold text-[#222222]">Letak Objek Baru</Label>
                        <Input
                          type="text"
                          placeholder="Jalan Objek Baru"
                          {...register(`details.${index}.newPropertyStreet`)}
                          disabled={isPending}
                          className="h-11 border-[#DDDDDD] bg-white rounded-lg focus-visible:ring-[#FF385C]"
                        />
                        {detailErrors?.newPropertyStreet && (
                          <p className="text-xs text-[#EF4444]">{detailErrors.newPropertyStreet.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-[#222222]">Blok Objek Baru</Label>
                        <Input
                          type="text"
                          placeholder="Blok"
                          {...register(`details.${index}.newPropertyBlock`)}
                          disabled={isPending}
                          className="h-11 border-[#DDDDDD] bg-white rounded-lg focus-visible:ring-[#FF385C]"
                        />
                        {detailErrors?.newPropertyBlock && (
                          <p className="text-xs text-[#EF4444]">{detailErrors.newPropertyBlock.message}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-[#222222]">RT Objek Baru</Label>
                          <Input
                            type="text"
                            placeholder="00"
                            {...register(`details.${index}.newPropertyRt`)}
                            disabled={isPending}
                            className="h-11 border-[#DDDDDD] bg-white rounded-lg focus-visible:ring-[#FF385C]"
                          />
                          {detailErrors?.newPropertyRt && (
                            <p className="text-xs text-[#EF4444]">{detailErrors.newPropertyRt.message}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-[#222222]">RW Objek Baru</Label>
                          <Input
                            type="text"
                            placeholder="00"
                            {...register(`details.${index}.newPropertyRw`)}
                            disabled={isPending}
                            className="h-11 border-[#DDDDDD] bg-white rounded-lg focus-visible:ring-[#FF385C]"
                          />
                          {detailErrors?.newPropertyRw && (
                            <p className="text-xs text-[#EF4444]">{detailErrors.newPropertyRw.message}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-[#222222]">Kecamatan Objek Baru</Label>
                        <Input
                          type="text"
                          placeholder="Kecamatan"
                          {...register(`details.${index}.newPropertyDistrict`)}
                          disabled={isPending}
                          className="h-11 border-[#DDDDDD] bg-white rounded-lg focus-visible:ring-[#FF385C]"
                        />
                        {detailErrors?.newPropertyDistrict && (
                          <p className="text-xs text-[#EF4444]">{detailErrors.newPropertyDistrict.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-[#222222]">Kelurahan Objek Baru</Label>
                        <Input
                          type="text"
                          placeholder="Kelurahan"
                          {...register(`details.${index}.newPropertyVillage`)}
                          disabled={isPending}
                          className="h-11 border-[#DDDDDD] bg-white rounded-lg focus-visible:ring-[#FF385C]"
                        />
                        {detailErrors?.newPropertyVillage && (
                          <p className="text-xs text-[#EF4444]">{detailErrors.newPropertyVillage.message}</p>
                        )}
                      </div>
                    </div>

                    <hr className="border-[#DDDDDD]/60" />

                    {/* Pecahan Size & Proof */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-[#222222]">Luas Tanah Pecahan (m²)</Label>
                        <Input
                          type="number"
                          step="any"
                          {...register(`details.${index}.newLandArea`)}
                          disabled={isPending}
                          className="h-11 border-[#DDDDDD] bg-white rounded-lg focus-visible:ring-[#FF385C]"
                        />
                        {detailErrors?.newLandArea && (
                          <p className="text-xs text-[#EF4444]">{detailErrors.newLandArea.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-[#222222]">Luas Bangunan Pecahan (m²)</Label>
                        <Input
                          type="number"
                          step="any"
                          {...register(`details.${index}.newBuildingArea`)}
                          disabled={isPending}
                          className="h-11 border-[#DDDDDD] bg-white rounded-lg focus-visible:ring-[#FF385C]"
                        />
                        {detailErrors?.newBuildingArea && (
                          <p className="text-xs text-[#EF4444]">{detailErrors.newBuildingArea.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-[#222222]">Bukti Kepemilikan</Label>
                        <Input
                          type="text"
                          placeholder="Cth: Sertifikat Hak Milik No. 123"
                          {...register(`details.${index}.ownershipProof`)}
                          disabled={isPending}
                          className="h-11 border-[#DDDDDD] bg-white rounded-lg focus-visible:ring-[#FF385C]"
                        />
                        {detailErrors?.ownershipProof && (
                          <p className="text-xs text-[#EF4444]">{detailErrors.ownershipProof.message}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Add Button styled with dashed border secondary indicator at the bottom of the list */}
          <Button
            type="button"
            variant="outline"
            onClick={() => append({
              newOwnerName: '', newOwnerStreet: '', newOwnerBlock: '', newOwnerRt: '', newOwnerRw: '', newOwnerDistrict: '', newOwnerVillage: '',
              newPropertyStreet: '', newPropertyBlock: '', newPropertyRt: '', newPropertyRw: '', newPropertyDistrict: '', newPropertyVillage: '',
              newLandArea: 0, newBuildingArea: 0, ownershipProof: ''
            })}
            className="w-full py-6 border-2 border-dashed border-[#DDDDDD] hover:border-[#FF385C] hover:bg-[#FF385C]/5 text-[#717171] hover:text-[#FF385C] flex items-center justify-center gap-2 font-bold rounded-xl transition-all duration-200"
          >
            <Plus className="h-5 w-5" /> Tambah Pecahan Baru
          </Button>
        </div>
      )}

      {/* Submit Action */}
      <div className="pt-4 flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={() => router.back()}
          className="border-[#DDDDDD] hover:bg-[#F7F7F7] h-11 px-6 rounded-lg font-semibold"
        >
          Batal
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="bg-[#FF385C] hover:bg-[#E31C5F] text-white h-11 px-8 rounded-lg font-semibold shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            initialData ? 'Perbarui Permohonan' : 'Kirim Permohonan'
          )}
        </Button>
      </div>
    </form>
  );
}
