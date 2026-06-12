// src/components/shared/analytics-dashboard.tsx
'use client';

import * as React from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  LineChart, 
  Line 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  FileText, 
  Activity, 
  CheckCircle, 
  AlertTriangle,
  Loader2,
  TrendingUp,
  BarChart3,
  Flame
} from 'lucide-react';

interface AnalyticsDashboardProps {
  metrics: {
    total: number;
    inProgress: number;
    completed: number;
    revisionRatio: number;
  };
  servicesData: {
    serviceType: string;
    name: string;
    value: number;
  }[];
  slaData: {
    completionTrend: {
      date: string;
      jumlah: number;
    }[];
    stages: {
      tahap: string;
      avgDays: number;
      waitingCount: number;
      status: string;
    }[];
  };
}

export function AnalyticsDashboard({ metrics, servicesData, slaData }: AnalyticsDashboardProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-[#2563EB]" />
        <span className="text-xs text-[#717171] font-semibold">Memuat Grafik Analitik...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Top Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 — Total Berkas */}
        <Card className="border-[#DDDDDD] shadow-sm">
          <CardContent className="pt-5">
            <div className="flex items-center gap-4">
              <div className="h-11 w-11 rounded-xl bg-[#F7F7F7] border border-[#DDDDDD] flex items-center justify-center flex-shrink-0">
                <FileText className="h-5 w-5 text-[#717171]" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#717171] uppercase tracking-wider">Total Berkas</p>
                <p className="text-3xl font-extrabold tracking-tight text-[#222222] mt-0.5">{metrics.total}</p>
                <p className="text-[10px] text-[#717171] font-semibold mt-1">Seluruh berkas masuk</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metric 2 — Dalam Proses */}
        <Card className="border-[#DDDDDD] shadow-sm">
          <CardContent className="pt-5">
            <div className="flex items-center gap-4">
              <div className="h-11 w-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                <Activity className="h-5 w-5 text-[#3B82F6]" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#717171] uppercase tracking-wider">Dalam Proses</p>
                <p className="text-3xl font-extrabold tracking-tight text-[#222222] mt-0.5">{metrics.inProgress}</p>
                <p className="text-[10px] text-[#3B82F6] font-semibold mt-1">Sedang dikerjakan/dikirim</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metric 3 — Selesai */}
        <Card className="border-[#DDDDDD] shadow-sm">
          <CardContent className="pt-5">
            <div className="flex items-center gap-4">
              <div className="h-11 w-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-[#10B981]" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#717171] uppercase tracking-wider">Selesai</p>
                <p className="text-3xl font-extrabold tracking-tight text-[#222222] mt-0.5">{metrics.completed}</p>
                <p className="text-[10px] text-[#10B981] font-semibold mt-1">Selesai secara permanen</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metric 4 — Rasio Revisi */}
        <Card className="border-[#DDDDDD] shadow-sm">
          <CardContent className="pt-5">
            <div className="flex items-center gap-4">
              <div className="h-11 w-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-[#F59E0B]" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#717171] uppercase tracking-wider">Rasio Revisi</p>
                <p className="text-3xl font-extrabold tracking-tight text-[#222222] mt-0.5">{metrics.revisionRatio}%</p>
                <p className="text-[10px] text-[#F59E0B] font-semibold mt-1">Berkas bermasalah</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Service Type Bar Chart */}
        <Card className="border-[#DDDDDD] shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-[#222222] flex items-center gap-1.5">
              <BarChart3 className="h-4 w-4 text-[#2563EB]" /> Distribusi Jenis Pelayanan
            </CardTitle>
            <CardDescription className="text-xs">
              Jumlah berkas permohonan berdasarkan jenis pelayanan PBB.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80 pt-2">
            {servicesData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-[#717171] italic">
                Belum ada data permohonan.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={servicesData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 9, fill: '#717171', fontWeight: 600 }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fontSize: 10, fill: '#717171' }} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid #DDDDDD' }}
                    cursor={{ fill: '#F7F7F7' }}
                  />
                  <Bar dataKey="value" name="Jumlah Berkas" fill="#2563EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Completion Trend Line Chart */}
        <Card className="border-[#DDDDDD] shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-[#222222] flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-[#10B981]" /> Tren Penyelesaian Harian
            </CardTitle>
            <CardDescription className="text-xs">
              Jumlah berkas yang berstatus COMPLETED selama 7 hari terakhir.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={slaData.completionTrend} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#717171', fontWeight: 600 }} />
                <YAxis tick={{ fontSize: 10, fill: '#717171' }} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid #DDDDDD' }} />
                <Line 
                  type="monotone" 
                  dataKey="jumlah" 
                  name="Berkas Selesai" 
                  stroke="#10B981" 
                  strokeWidth={2.5} 
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 3. Bottleneck Detector */}
      <Card className="border-[#DDDDDD] shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm font-bold text-[#222222] flex items-center gap-1.5">
            <Flame className="h-4 w-4 text-[#F59E0B]" /> Detektor Hambatan Alur Kerja (Bottleneck)
          </CardTitle>
          <CardDescription className="text-xs">
            Pantau rata-rata waktu pemrosesan dan jumlah antrean berkas pada setiap tahapan alur kerja PBB.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-[#F7F7F7]">
              <TableRow className="border-b border-[#DDDDDD] hover:bg-[#F7F7F7]">
                <TableHead className="font-bold text-[#222222] pl-6">Tahap Pemrosesan</TableHead>
                <TableHead className="font-bold text-[#222222] w-[200px]">Antrean Berkas</TableHead>
                <TableHead className="font-bold text-[#222222] w-[200px]">Rata-rata Waktu SLA</TableHead>
                <TableHead className="font-bold text-[#222222] w-[180px] text-right pr-6">Status Hambatan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {slaData.stages.map((stage, idx) => {
                const isBottleneck = stage.status.startsWith('⚠');
                return (
                  <TableRow key={idx} className="border-b border-[#DDDDDD] hover:bg-[#F7F7F7]/30 transition-colors">
                    <TableCell className="font-bold text-[#222222] pl-6 text-xs">{stage.tahap}</TableCell>
                    <TableCell>
                      <span className={`text-xs font-bold ${isBottleneck ? 'text-rose-600' : 'text-[#222222]'}`}>
                        {stage.waitingCount} Berkas
                      </span>
                    </TableCell>
                    <TableCell className="font-semibold text-xs text-[#717171]">{stage.avgDays.toFixed(1)} Hari</TableCell>
                    <TableCell className="text-right pr-6">
                      <span 
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${
                          isBottleneck
                            ? 'border-rose-200 bg-rose-50 text-rose-700 animate-pulse' 
                            : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {isBottleneck ? 'Menumpuk' : 'Lancar'}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
