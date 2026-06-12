// src/app/permohonan/[id]/page.tsx
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { PermohonanService } from '@/services/permohonan.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowLeft, Edit3, FileText, Home, Layers, Phone, ShieldCheck, User, Check, ClipboardList, Archive, Truck, CheckCircle2, AlertTriangle, Activity } from 'lucide-react';
import { ApplicationStatus } from '@prisma/client';

function getStepIndex(status: ApplicationStatus): number {
  switch (status) {
    case 'REVISION':
    case 'SUBMITTED':
      return 1;
    case 'DRAFT_BUNDLE':
      return 2;
    case 'READY_TO_ARCHIVE':
      return 3;
    case 'READY_TO_SHIP':
    case 'SENT_TO_CENTER':
      return 4;
    case 'COMPLETED':
      return 5;
    case 'RE_EXAMINE':
      return 2;
    case 'REJECTED':
    case 'REJECTED_PERMANENT':
      return -1;
    default:
      return 1;
  }
}

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

  const stepIndex = getStepIndex(permohonan.status);
  const steps = [
    { label: 'Pendaftaran', desc: 'Draf & Input Berkas', icon: ClipboardList },
    { label: 'Penelitian', desc: 'Verifikasi & Bundling', icon: Layers },
    { label: 'Arsip Scan', desc: 'Unggah Scan Berkas', icon: Archive },
    { label: 'Pengiriman', desc: 'Kirim ke Pusat', icon: Truck },
    { label: 'Selesai', desc: 'Permohonan Terbit', icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-6 w-full pb-12 font-sans">
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
            <h1 className="text-xl font-bold text-[#222222]">
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
          {isEditable && (
            <Link
              href={`/permohonan/${permohonan.id}/edit`}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold rounded-lg h-10 px-4 shadow-sm flex items-center gap-1.5 text-sm transition-colors"
            >
              <Edit3 className="h-4 w-4" /> Edit Berkas
            </Link>
          )}
        </div>
      </div>

      {/* Visual Progress Stepper */}
      <Card className="border-[#DDDDDD] shadow-sm">
        <CardHeader className="pb-3 border-b border-[#F7F7F7]">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-[#222222]">
            <Activity className="h-4 w-4 text-[#2563EB]" />
            Progres Permohonan
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {stepIndex === -1 ? (
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 text-rose-700 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-rose-500 animate-bounce" />
              <div>
                <p className="text-sm font-bold">Berkas Ditolak (Rejected)</p>
                <p className="text-xs">Berkas permohonan ini ditolak secara permanen oleh Peneliti.</p>
              </div>
            </div>
          ) : (
            <div className="relative flex items-center justify-between w-full mt-2 mb-1">
              {/* Connection Line Container */}
              <div className="absolute left-[10%] right-[10%] top-1/4 -translate-y-1/2 h-0.5 bg-[#F3F4F6] z-0">
                {/* Active Colored Line */}
                <div
                  className="h-full bg-[#2563EB] transition-all duration-500 ease-in-out"
                  style={{ width: `${((stepIndex - 1) / (steps.length - 1)) * 100}%` }}
                />
              </div>

              {/* Step Nodes */}
              {steps.map((step, idx) => {
                const currentStep = idx + 1;
                const isCompleted = currentStep < stepIndex;
                const isActive = currentStep === stepIndex;
                const StepIcon = step.icon;

                return (
                  <div key={idx} className="relative z-10 flex flex-col items-center flex-1">
                    {/* Circle Node */}
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center border transition-all duration-300 ${isCompleted
                        ? 'bg-[#2563EB] border-[#2563EB] text-white shadow-xs scale-100'
                        : isActive
                          ? 'bg-white border-[#2563EB] text-[#2563EB] ring-4 ring-blue-50/50 scale-105 shadow-sm'
                          : 'bg-white border-[#E5E7EB] text-[#9CA3AF]'
                        }`}
                    >
                      {isCompleted ? (
                        <Check className="h-4 w-4 stroke-[3]" />
                      ) : (
                        <StepIcon className="h-4 w-4" />
                      )}
                    </div>

                    {/* Step Titles */}
                    <span className={`text-[10px] font-semibold mt-2 transition-colors ${isActive ? 'text-[#2563EB]' : isCompleted ? 'text-[#374151]' : 'text-[#9CA3AF]'
                      }`}>
                      {step.label}
                    </span>
                    <span className="text-[9px] text-[#9CA3AF] mt-0.5 hidden sm:block text-center font-normal">
                      {step.desc}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grid Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Core Info */}
        <Card className="border-[#DDDDDD] shadow-sm md:col-span-2">
          <CardHeader className="pb-3 border-b border-[#F7F7F7]">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-[#222222]">
              <Layers className="h-4 w-4 text-[#2563EB]" />
              Detail Informasi Layanan
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
            <div>
              <p className="text-xs text-[#717171] font-semibold">Jenis Pelayanan</p>
              <p className="font-semibold text-[#222222] mt-1">{permohonan.serviceType.replace(/_/g, ' ')}</p>
            </div>
            <div>
              <p className="text-xs text-[#717171] font-semibold">Nomor Objek Pajak (NOP)</p>
              <p className="font-mono font-semibold text-[#222222] mt-1">{formatNop(permohonan.nop)}</p>
            </div>
            <div>
              <p className="text-xs text-[#717171] font-semibold">Nomor Pelayanan</p>
              <p className="font-semibold text-[#222222] mt-1">{permohonan.nomorPelayan || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-[#717171] font-semibold">No. HP Pemohon</p>
              <p className="font-semibold text-[#222222] mt-1">{permohonan.applicantPhone || '-'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Status Tracker */}
        <Card className="border-[#DDDDDD] shadow-sm">
          <CardHeader className="pb-3 border-b border-[#F7F7F7]">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-[#222222]">
              <ShieldCheck className="h-4 w-4 text-[#2563EB]" />
              Keterlacakan Berkas
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 text-sm space-y-3">
            <div>
              <p className="text-xs text-[#717171] font-semibold">Status Alur Kerja</p>
              <p className="font-bold text-xs uppercase tracking-wider text-[#2563EB] mt-0.5">
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
              <User className="h-4 w-4 text-[#2563EB]" />
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

      {/* Details (For Mutasi Sebagian and Objek Pajak Baru) */}
      {(permohonan.serviceType === 'MUTASI_SEBAGIAN' || permohonan.serviceType === 'OBJEK_PAJAK_BARU') && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-[#222222] flex items-center gap-2">
            <Home className="h-5 w-5 text-[#2563EB]" />
            {permohonan.serviceType === 'OBJEK_PAJAK_BARU' ? 'Detail Objek Pajak Baru' : 'Daftar Pecahan Objek Pajak Baru'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {permohonan.details.map((detail, idx) => (
              <Card key={idx} className="border-[#DDDDDD] shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-[#2563EB]" />
                <CardHeader className="pb-2 border-b border-[#F7F7F7]">
                  <CardTitle className="text-sm font-bold">
                    {permohonan.serviceType === 'OBJEK_PAJAK_BARU' ? 'Data Objek Baru' : `Pecahan #${idx + 1}`}
                  </CardTitle>
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
                    <p className="font-semibold text-xs text-[#2563EB]">{detail.ownershipProof}</p>
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

