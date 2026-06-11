// src/app/permohonan/[id]/page.tsx
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { PermohonanService } from '@/services/permohonan.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowLeft, Edit3, FileText, Home, Layers, Phone, ShieldCheck, User } from 'lucide-react';
import { ApplicationStatus } from '@prisma/client';

export const metadata = {
  title: 'Detail Permohonan - Architax PBB',
};

// Formats number input into NOP mask: XX.XX.XXX.XXX.XXX-XXXX.X
function formatNop(nop: string): string {
  const nums = nop.replace(/[^0-9]/g, '');
  if (nums.length !== 18) return nop;
  return `${nums.substring(0, 2)}.${nums.substring(2, 4)}.${nums.substring(4, 7)}.${nums.substring(7, 10)}.${nums.substring(10, 13)}-${nums.substring(13, 17)}.${nums.substring(17, 18)}`;
}

function getStatusBadgeClass(status: ApplicationStatus) {
  switch (status) {
    case 'COMPLETED':
    case 'READY_TO_SHIP':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'REVISION':
    case 'RE_EXAMINE':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'REJECTED':
    case 'REJECTED_PERMANENT':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'SUBMITTED':
    case 'DRAFT_BUNDLE':
    case 'READY_TO_ARCHIVE':
    case 'SENT_TO_CENTER':
    default:
      return 'bg-blue-50 text-blue-700 border-blue-200';
  }
}

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PermohonanDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const { id } = await params;
  const result = await PermohonanService.findById(id);

  if (!result.success || !result.data) {
    redirect('/permohonan');
  }

  const permohonan = result.data;

  // Enforce access control: penginput can only view their own
  if (session.user.role === 'STAF_PENGINPUT' && permohonan.createdById !== session.user.id) {
    redirect('/forbidden');
  }

  const isEditable =
    session.user.role === 'STAF_PENGINPUT' &&
    (permohonan.status === ApplicationStatus.SUBMITTED || permohonan.status === ApplicationStatus.REVISION);

  return (
    <div className="space-y-6 max-w-4xl pb-12 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/permohonan"
            className="border border-[#DDDDDD] hover:bg-[#F7F7F7] text-[#222222] h-10 w-10 p-0 rounded-lg flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#222222]">
              Berkas {permohonan.nomorBerkas}
            </h1>
            <p className="text-xs text-[#717171]">
              Tanggal Input:{' '}
              {new Date(permohonan.createdAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center text-xs font-bold px-3 py-1.5 rounded-full border uppercase tracking-wider ${getStatusBadgeClass(permohonan.status)}`}>
            {permohonan.status.replace(/_/g, ' ')}
          </span>
          {isEditable && (
            <Link
              href={`/permohonan/${permohonan.id}/edit`}
              className="bg-[#FF385C] hover:bg-[#E31C5F] text-white font-semibold rounded-lg h-10 px-4 shadow-sm flex items-center gap-1.5 text-sm transition-colors"
            >
              <Edit3 className="h-4 w-4" /> Edit Berkas
            </Link>
          )}
        </div>
      </div>

      {/* Grid Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Core Info */}
        <Card className="border-[#DDDDDD] shadow-sm md:col-span-2">
          <CardHeader className="pb-3 border-b border-[#F7F7F7]">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-[#222222]">
              <Layers className="h-4 w-4 text-[#FF385C]" />
              Detail Informasi Layanan
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-[#717171] font-semibold">Jenis Pelayanan</p>
              <p className="font-bold text-[#222222] mt-0.5">{permohonan.serviceType.replace(/_/g, ' ')}</p>
            </div>
            <div>
              <p className="text-xs text-[#717171] font-semibold">Nomor Objek Pajak (NOP)</p>
              <p className="font-mono font-bold text-[#222222] mt-0.5">{formatNop(permohonan.nop)}</p>
            </div>
            {permohonan.nomorPelayan && (
              <div>
                <p className="text-xs text-[#717171] font-semibold">Nomor Pelayan</p>
                <p className="font-bold text-[#222222] mt-0.5">{permohonan.nomorPelayan}</p>
              </div>
            )}
            {permohonan.applicantPhone && (
              <div>
                <p className="text-xs text-[#717171] font-semibold flex items-center gap-1">
                  <Phone className="h-3 w-3 text-[#FF385C]" /> HP Pemohon
                </p>
                <p className="font-semibold text-[#222222] mt-0.5">{permohonan.applicantPhone}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Tracker */}
        <Card className="border-[#DDDDDD] shadow-sm">
          <CardHeader className="pb-3 border-b border-[#F7F7F7]">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-[#222222]">
              <ShieldCheck className="h-4 w-4 text-[#FF385C]" />
              Keterlacakan Berkas
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 text-sm space-y-3">
            <div>
              <p className="text-xs text-[#717171] font-semibold">Status Alur Kerja</p>
              <p className="font-bold text-xs uppercase tracking-wider text-[#FF385C] mt-0.5">
                {permohonan.status.replace(/_/g, ' ')}
              </p>
            </div>
            {permohonan.bundleId && (
              <div>
                <p className="text-xs text-[#717171] font-semibold">Terikat dalam Bundle ID</p>
                <p className="font-mono text-xs font-semibold text-[#222222] mt-0.5 truncate">
                  {permohonan.bundleId}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Owner Info (if not Objek Pajak Baru) */}
      {permohonan.serviceType !== 'OBJEK_PAJAK_BARU' && (
        <Card className="border-[#DDDDDD] shadow-sm">
          <CardHeader className="pb-3 border-b border-[#F7F7F7]">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-[#222222]">
              <User className="h-4 w-4 text-[#FF385C]" />
              Rincian Objek Pajak & Pemilik Asal
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#717171]">Identitas Pemilik Lama</h4>
              <div>
                <p className="text-xs text-[#717171]">Nama Lengkap</p>
                <p className="font-semibold text-[#222222]">{permohonan.oldOwnerName || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-[#717171]">Alamat</p>
                <p className="text-[#222222]">
                  {permohonan.oldOwnerStreet || '-'} {permohonan.oldOwnerBlock ? `Blok ${permohonan.oldOwnerBlock}` : ''}{' '}
                  {permohonan.oldOwnerRt ? `RT ${permohonan.oldOwnerRt}` : ''} {permohonan.oldOwnerRw ? `RW ${permohonan.oldOwnerRw}` : ''}{' '}
                  {permohonan.oldOwnerVillage ? `Kel. ${permohonan.oldOwnerVillage}` : ''} {permohonan.oldOwnerDistrict ? `Kec. ${permohonan.oldOwnerDistrict}` : ''}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#717171]">Letak Objek & Luas</h4>
              <div>
                <p className="text-xs text-[#717171]">Letak Objek Pajak</p>
                <p className="text-[#222222]">
                  {permohonan.oldPropertyStreet || '-'} {permohonan.oldPropertyBlock ? `Blok ${permohonan.oldPropertyBlock}` : ''}{' '}
                  {permohonan.oldPropertyRt ? `RT ${permohonan.oldPropertyRt}` : ''} {permohonan.oldPropertyRw ? `RW ${permohonan.oldPropertyRw}` : ''}{' '}
                  {permohonan.oldPropertyVillage ? `Kel. ${permohonan.oldPropertyVillage}` : ''} {permohonan.oldPropertyDistrict ? `Kec. ${permohonan.oldPropertyDistrict}` : ''}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-[#717171]">Luas Tanah</p>
                  <p className="font-semibold text-[#222222]">{permohonan.oldLandArea ? `${permohonan.oldLandArea} m²` : '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-[#717171]">Luas Bangunan</p>
                  <p className="font-semibold text-[#222222]">{permohonan.oldBuildingArea ? `${permohonan.oldBuildingArea} m²` : '-'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Details (For Mutasi Sebagian) */}
      {permohonan.serviceType === 'MUTASI_SEBAGIAN' && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-[#222222] flex items-center gap-2">
            <Home className="h-5 w-5 text-[#FF385C]" />
            Daftar Pecahan Objek Pajak Baru
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {permohonan.details.map((detail, idx) => (
              <Card key={idx} className="border-[#DDDDDD] shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-[#FF385C]" />
                <CardHeader className="pb-2 border-b border-[#F7F7F7]">
                  <CardTitle className="text-sm font-bold">Pecahan #{idx + 1}</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-3 text-sm">
                  <div>
                    <p className="text-xs text-[#717171] font-semibold">Pemilik Baru</p>
                    <p className="font-bold text-[#222222]">{detail.newOwnerName}</p>
                    <p className="text-xs text-[#717171] mt-0.5">
                      {detail.newOwnerStreet} Blok {detail.newOwnerBlock} RT {detail.newOwnerRt} RW {detail.newOwnerRw}, {detail.newOwnerVillage}, {detail.newOwnerDistrict}
                    </p>
                  </div>
                  <hr className="border-[#F7F7F7]" />
                  <div>
                    <p className="text-xs text-[#717171] font-semibold">Letak Objek Pecahan</p>
                    <p className="text-[#222222]">{detail.newPropertyStreet} Blok {detail.newPropertyBlock} RT {detail.newPropertyRt} RW {detail.newPropertyRw}, {detail.newPropertyVillage}, {detail.newPropertyDistrict}</p>
                  </div>
                  <hr className="border-[#F7F7F7]" />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-[#717171] font-semibold">Luas Tanah</p>
                      <p className="font-semibold text-[#222222]">{Number(detail.newLandArea)} m²</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#717171] font-semibold">Luas Bangunan</p>
                      <p className="font-semibold text-[#222222]">{Number(detail.newBuildingArea)} m²</p>
                    </div>
                  </div>
                  <hr className="border-[#F7F7F7]" />
                  <div>
                    <p className="text-xs text-[#717171] font-semibold">Bukti Kepemilikan</p>
                    <p className="font-semibold text-xs text-[#FF385C]">{detail.ownershipProof}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
