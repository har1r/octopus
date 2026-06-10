// src/app/dashboard/page.tsx
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowRight, 
  CheckCircle, 
  ClipboardList, 
  FileText, 
  FolderSync, 
  Grid, 
  History, 
  PackagePlus, 
  TrendingUp, 
  Upload 
} from 'lucide-react';

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const user = session.user;

  // Define role specific instructions and shortcuts
  const renderRoleShortcuts = () => {
    switch (user.role) {
      case 'STAF_PENGINPUT':
        return (
          <>
            <Card className="group border-[#DDDDDD] hover:border-[#FF385C]/40 hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-md rounded-xl overflow-hidden bg-white">
              <CardHeader className="pb-2">
                <FileText className="h-8 w-8 text-[#FF385C] mb-2 transition-transform duration-300 group-hover:scale-110" />
                <CardTitle className="text-lg font-bold text-[#222222]">Buat Permohonan Baru</CardTitle>
                <CardDescription className="text-xs text-[#717171]">Mulai proses pendaftaran objek pajak atau mutasi baru.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <Link 
                  href="/permohonan/new" 
                  className="w-full bg-[#FF385C] hover:bg-[#E31C5F] text-white font-bold flex items-center justify-center gap-1.5 h-11 rounded-lg text-xs tracking-wide uppercase transition-all shadow-sm active:scale-[0.98]"
                >
                  Buat Form <ArrowRight className="h-4 w-4" />
                </Link>
              </CardContent>
            </Card>

            <Card className="group border-[#DDDDDD] hover:border-[#F59E0B]/40 hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-md rounded-xl overflow-hidden bg-white">
              <CardHeader className="pb-2">
                <ClipboardList className="h-8 w-8 text-[#F59E0B] mb-2 transition-transform duration-300 group-hover:scale-110" />
                <CardTitle className="text-lg font-bold text-[#222222]">Permohonan Saya</CardTitle>
                <CardDescription className="text-xs text-[#717171]">Pantau daftar berkas permohonan yang telah Anda input.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <Link 
                  href="/permohonan"
                  className="w-full border border-[#DDDDDD] hover:bg-[#F7F7F7] text-[#222222] hover:border-[#222222] font-bold flex items-center justify-center h-11 rounded-lg text-xs tracking-wide uppercase transition-all active:scale-[0.98]"
                >
                  Lihat Daftar
                </Link>
              </CardContent>
            </Card>
          </>
        );

      case 'STAF_PENELITI':
        return (
          <>
            <Card className="group border-[#DDDDDD] hover:border-[#FF385C]/40 hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-md rounded-xl overflow-hidden bg-white">
              <CardHeader className="pb-2">
                <ClipboardList className="h-8 w-8 text-[#FF385C] mb-2 transition-transform duration-300 group-hover:scale-110" />
                <CardTitle className="text-lg font-bold text-[#222222]">Antrean Validasi</CardTitle>
                <CardDescription className="text-xs text-[#717171]">Periksa berkas permohonan SUBMITTED dari staf penginput.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <Link 
                  href="/permohonan/queue" 
                  className="w-full bg-[#FF385C] hover:bg-[#E31C5F] text-white font-bold flex items-center justify-center gap-1.5 h-11 rounded-lg text-xs tracking-wide uppercase transition-all shadow-sm active:scale-[0.98]"
                >
                  Buka Antrean <ArrowRight className="h-4 w-4" />
                </Link>
              </CardContent>
            </Card>

            <Card className="group border-[#DDDDDD] hover:border-[#10B981]/40 hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-md rounded-xl overflow-hidden bg-white">
              <CardHeader className="pb-2">
                <PackagePlus className="h-8 w-8 text-[#10B981] mb-2 transition-transform duration-300 group-hover:scale-110" />
                <CardTitle className="text-lg font-bold text-[#222222]">Menu Bundling</CardTitle>
                <CardDescription className="text-xs text-[#717171]">Kelompokkan permohonan yang tervalidasi ke dalam bundle baru.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <Link 
                  href="/bundle"
                  className="w-full border border-[#DDDDDD] hover:bg-[#F7F7F7] text-[#222222] hover:border-[#10B981] font-bold flex items-center justify-center h-11 rounded-lg text-xs tracking-wide uppercase transition-all active:scale-[0.98]"
                >
                  Mulai Bundling
                </Link>
              </CardContent>
            </Card>
          </>
        );

      case 'STAF_PENGARSIP':
        return (
          <>
            <Card className="group border-[#DDDDDD] hover:border-[#FF385C]/40 hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-md rounded-xl overflow-hidden bg-white">
              <CardHeader className="pb-2">
                <Upload className="h-8 w-8 text-[#FF385C] mb-2 transition-transform duration-300 group-hover:scale-110" />
                <CardTitle className="text-lg font-bold text-[#222222]">Unggah Scan Arsip</CardTitle>
                <CardDescription className="text-xs text-[#717171]">Upload dokumen hasil scan permohonan dalam bundle.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <Link 
                  href="/arsip" 
                  className="w-full bg-[#FF385C] hover:bg-[#E31C5F] text-white font-bold flex items-center justify-center gap-1.5 h-11 rounded-lg text-xs tracking-wide uppercase transition-all shadow-sm active:scale-[0.98]"
                >
                  Pekerjaan Arsip <ArrowRight className="h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          </>
        );

      case 'STAF_PENGIRIM':
        return (
          <>
            <Card className="group border-[#DDDDDD] hover:border-[#FF385C]/40 hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-md rounded-xl overflow-hidden bg-white">
              <CardHeader className="pb-2">
                <FolderSync className="h-8 w-8 text-[#FF385C] mb-2 transition-transform duration-300 group-hover:scale-110" />
                <CardTitle className="text-lg font-bold text-[#222222]">Kelola Manifest</CardTitle>
                <CardDescription className="text-xs text-[#717171]">Buat manifest pengiriman berkas bundle ke kantor pusat.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <Link 
                  href="/manifest" 
                  className="w-full bg-[#FF385C] hover:bg-[#E31C5F] text-white font-bold flex items-center justify-center gap-1.5 h-11 rounded-lg text-xs tracking-wide uppercase transition-all shadow-sm active:scale-[0.98]"
                >
                  Buka Manifest <ArrowRight className="h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          </>
        );

      case 'STAF_PEMANTAU':
        return (
          <>
            <Card className="group border-[#DDDDDD] hover:border-[#FF385C]/40 hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-md rounded-xl overflow-hidden bg-white">
              <CardHeader className="pb-2">
                <Grid className="h-8 w-8 text-[#FF385C] mb-2 transition-transform duration-300 group-hover:scale-110" />
                <CardTitle className="text-lg font-bold text-[#222222]">Pemantauan Berkas</CardTitle>
                <CardDescription className="text-xs text-[#717171]">Pantau progress pengurusan berkas di pusat secara real-time.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <Link 
                  href="/monitoring" 
                  className="w-full bg-[#FF385C] hover:bg-[#E31C5F] text-white font-bold flex items-center justify-center gap-1.5 h-11 rounded-lg text-xs tracking-wide uppercase transition-all shadow-sm active:scale-[0.98]"
                >
                  Mulai Pantau <ArrowRight className="h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          </>
        );

      case 'SUPERVISOR':
        return (
          <>
            <Card className="group border-[#DDDDDD] hover:border-[#FF385C]/40 hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-md rounded-xl overflow-hidden bg-white">
              <CardHeader className="pb-2">
                <TrendingUp className="h-8 w-8 text-[#FF385C] mb-2 transition-transform duration-300 group-hover:scale-110" />
                <CardTitle className="text-lg font-bold text-[#222222]">Dashboard Analitis</CardTitle>
                <CardDescription className="text-xs text-[#717171]">Buka grafik performa, statistik berkas, dan SLA review.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <Link 
                  href="/analytics" 
                  className="w-full bg-[#FF385C] hover:bg-[#E31C5F] text-white font-bold flex items-center justify-center gap-1.5 h-11 rounded-lg text-xs tracking-wide uppercase transition-all shadow-sm active:scale-[0.98]"
                >
                  Buka Grafik <ArrowRight className="h-4 w-4" />
                </Link>
              </CardContent>
            </Card>

            <Card className="group border-[#DDDDDD] hover:border-[#717171]/40 hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-md rounded-xl overflow-hidden bg-white">
              <CardHeader className="pb-2">
                <History className="h-8 w-8 text-[#717171] mb-2 transition-transform duration-300 group-hover:scale-110" />
                <CardTitle className="text-lg font-bold text-[#222222]">Investigasi Audit</CardTitle>
                <CardDescription className="text-xs text-[#717171]">Telusuri log riwayat aktivitas seluruh pengguna sistem.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <Link 
                  href="/audit"
                  className="w-full border border-[#DDDDDD] hover:bg-[#F7F7F7] text-[#222222] hover:border-[#222222] font-bold flex items-center justify-center h-11 rounded-lg text-xs tracking-wide uppercase transition-all active:scale-[0.98]"
                >
                  Lihat Audit Log
                </Link>
              </CardContent>
            </Card>
          </>
        );
    }
  };

  return (
    <div className="space-y-8 max-w-5xl font-sans">
      {/* Greetings block */}
      <div className="bg-white border-l-4 border-l-[#FF385C] border-y border-r border-[#DDDDDD] rounded-r-2xl rounded-l-md p-8 shadow-sm">
        <h1 className="text-3xl font-extrabold text-[#222222] tracking-tight">
          Selamat Datang, {user.name} 👋
        </h1>
        <p className="text-[#717171] mt-2 max-w-2xl text-sm leading-relaxed font-medium">
          Anda masuk sebagai <strong className="text-[#FF385C] uppercase font-bold">{user.role.replace('_', ' ')}</strong>.
          Gunakan panel sidebar kiri atau tombol shortcut di bawah ini untuk mengelola alur kerja dokumen regional PBB.
        </p>
      </div>

      {/* Shortcuts grid */}
      <div>
        <h3 className="text-base font-bold text-[#222222] uppercase tracking-wider mb-4">Akses Cepat</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderRoleShortcuts()}
        </div>
      </div>
    </div>
  );
}
