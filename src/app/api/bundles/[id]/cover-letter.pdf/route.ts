// src/app/api/bundles/[id]/cover-letter.pdf/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { BundleRepository } from '@/repositories/bundle.repository';
import { ServiceType } from '@prisma/client';

function formatNop(nop: string): string {
  const nums = nop.replace(/[^0-9]/g, '');
  if (nums.length !== 18) return nop;
  return `${nums.substring(0, 2)}.${nums.substring(2, 4)}.${nums.substring(4, 7)}.${nums.substring(7, 10)}.${nums.substring(10, 13)}-${nums.substring(13, 17)}.${nums.substring(17, 18)}`;
}

function formatServiceType(type: ServiceType): string {
  return type.replace(/_/g, ' ');
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { id } = await params;
    const bundle = await BundleRepository.findById(id);

    if (!bundle) {
      return new Response('Bundle not found', { status: 404 });
    }

    const createdDate = new Date(bundle.createdAt);
    const year = createdDate.getFullYear();

    // Generate Cover Letter Number: 973/SEQUENCE-UPT.PD.WIL.IV/YEAR
    const parts = bundle.bundleNumber.split('-');
    const sequence = parts[2] || '00001';
    const coverLetterNumber = `973/${sequence}-UPT.PD.WIL.IV/${year}`;

    // Compute Yearly Sequence Counters for Mutasi Habis
    const isMutasiHabis = bundle.serviceType === ServiceType.MUTASI_HABIS_UPDATE || bundle.serviceType === ServiceType.MUTASI_HABIS_REGULER;
    const counterMap = new Map<string, { noTanah: number; noBangunan: number | null }>();

    if (isMutasiHabis) {
      const startOfYear = new Date(year, 0, 1);
      const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);

      // Fetch all Mutasi Habis records in the same year in ascending order of creation
      const allMutasiHabis = await prisma.permohonan.findMany({
        where: {
          serviceType: {
            in: [ServiceType.MUTASI_HABIS_UPDATE, ServiceType.MUTASI_HABIS_REGULER]
          },
          createdAt: {
            gte: startOfYear,
            lte: endOfYear
          }
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      let tanahCounter = 0;
      let bangunanCounter = 0;

      for (const p of allMutasiHabis) {
        tanahCounter++;
        const noTanah = tanahCounter;

        const oldB = p.oldBuildingArea ?? 0;
        const newB = p.details?.[0]?.newBuildingArea ?? 0;
        const isBuildingChanged = oldB !== newB;
        const hasBuilding = oldB > 0 || newB > 0;

        let noBangunan: number | null = null;
        if (isBuildingChanged && hasBuilding) {
          bangunanCounter++;
          noBangunan = bangunanCounter;
        }

        counterMap.set(p.id, { noTanah, noBangunan });
      }
    }

    // Sort items by oldest first for consecutive layout listing
    const items = [...bundle.items].reverse();

    // Render print-ready HTML
    const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Surat Pengantar - ${bundle.bundleNumber}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
    
    body {
      font-family: 'Outfit', 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f3f4f6;
      color: #222222;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .no-print-bar {
      background-color: #ffffff;
      border-bottom: 1px solid #dddddd;
      padding: 12px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 14px;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.15s ease;
      border: 1px solid transparent;
    }

    .btn-primary {
      background-color: #2563EB;
      color: white;
    }
    .btn-primary:hover {
      background-color: #1D4ED8;
    }

    .btn-secondary {
      background-color: white;
      border-color: #dddddd;
      color: #222222;
    }
    .btn-secondary:hover {
      background-color: #f7f7f7;
    }

    /* Named page definitions for mixed orientation */
    @page portrait-layout {
      size: A4 portrait;
      margin: 15mm;
    }

    @page landscape-layout {
      size: A4 landscape;
      margin: 10mm;
    }

    .portrait-page {
      page: portrait-layout;
      background-color: white;
      width: 210mm;
      min-height: 297mm;
      margin: 20px auto;
      padding: 20mm;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      box-sizing: border-box;
      page-break-after: always;
    }

    .landscape-page {
      page: landscape-layout;
      background-color: white;
      width: 297mm;
      min-height: 210mm;
      margin: 20px auto;
      padding: 15mm;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      box-sizing: border-box;
      page-break-before: always;
    }

    /* Kop Surat */
    .kop-container {
      display: flex;
      align-items: center;
      border-bottom: 3px double #222222;
      padding-bottom: 12px;
      margin-bottom: 20px;
    }

    .kop-logo {
      width: 80px;
      height: 80px;
      margin-right: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .kop-text {
      flex: 1;
      text-align: center;
      margin-right: 40px; /* offset the logo to center text */
    }

    .kop-text h1 {
      font-size: 15px;
      font-weight: 700;
      margin: 0 0 2px 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .kop-text h2 {
      font-size: 18px;
      font-weight: 800;
      margin: 0 0 4px 0;
      text-transform: uppercase;
    }

    .kop-text p {
      font-size: 11px;
      margin: 0 0 2px 0;
      color: #555555;
    }

    /* Letter Grid details */
    .letter-details {
      display: flex;
      justify-content: space-between;
      font-size: 13.5px;
      margin-bottom: 24px;
    }

    .letter-left {
      width: 60%;
    }

    .letter-right {
      text-align: right;
      font-weight: 500;
    }

    .detail-table-mini {
      width: 100%;
      border-collapse: collapse;
      margin-top: 4px;
    }
    .detail-table-mini td {
      padding: 3px 0;
      vertical-align: top;
    }
    .lbl-col {
      width: 100px;
    }
    .colon-col {
      width: 12px;
    }

    .recipient-block {
      margin-top: 15px;
      font-size: 13.5px;
      line-height: 1.5;
    }

    .body-content {
      font-size: 13.5px;
      line-height: 1.6;
      margin-top: 20px;
      text-align: justify;
    }

    .middle-table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }
    .middle-table th {
      border: 1px solid #222222;
      background-color: #f7f7f7;
      padding: 8px;
      font-weight: 700;
      text-align: center;
    }
    .middle-table td {
      border: 1px solid #222222;
      padding: 8px;
      text-align: center;
    }

    .sig-block-right {
      margin-top: 30px;
      display: flex;
      justify-content: flex-end;
      font-size: 13.5px;
      page-break-inside: avoid;
    }

    .sig-box {
      width: 280px;
      text-align: center;
    }

    /* Landscape Attachment Styles */
    .lampiran-header {
      font-size: 11px;
      margin-bottom: 15px;
      border-bottom: 1px solid #dddddd;
      padding-bottom: 6px;
      display: flex;
      justify-content: space-between;
    }

    .lampiran-title {
      text-align: center;
      font-size: 14px;
      font-weight: 700;
      margin-bottom: 15px;
      text-transform: uppercase;
    }

    .landscape-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9px;
      table-layout: auto;
    }

    .landscape-table th, .landscape-table td {
      border: 1px solid #222222;
      padding: 4px 3px;
      vertical-align: middle;
    }

    .landscape-table th {
      background-color: #f7f7f7;
      font-weight: 700;
      text-align: center;
      text-transform: uppercase;
    }

    .sub-head {
      font-size: 8px;
      font-weight: 700;
      text-align: center;
    }

    .text-center {
      text-align: center;
    }
    .text-right {
      text-align: right;
    }

    @media print {
      body {
        background-color: white;
      }
      .no-print-bar {
        display: none !important;
      }
      .portrait-page {
        margin: 0;
        padding: 0;
        box-shadow: none;
        width: 100%;
      }
      .landscape-page {
        margin: 0;
        padding: 0;
        box-shadow: none;
        width: 100%;
      }
    }
  </style>
</head>
<body>

  <div class="no-print-bar">
    <div style="display: flex; align-items: center; gap: 12px;">
      <span style="font-weight: 700; font-size: 16px; color: #2563EB;">ARCHITAX</span>
      <span style="color: #dddddd;">|</span>
      <span style="font-size: 14px; font-weight: 500; color: #717171;">Pratinjau Surat Pengantar & Lampiran</span>
    </div>
    <div style="display: flex; gap: 10px;">
      <button onclick="window.print()" class="btn btn-primary">
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/></svg>
        Cetak Dokumen
      </button>
      <button onclick="window.close()" class="btn btn-secondary">
        Tutup Halaman
      </button>
    </div>
  </div>

  <!-- PAGE 1: PORTRAIT RECOMMENDATION LETTER -->
  <div class="portrait-page">
    <div class="kop-container">
      <div class="kop-logo">
        <!-- High-quality stylized SVG coat of arms of Kabupaten Tangerang -->
        <svg viewBox="0 0 100 100" width="80" height="80">
          <path d="M50 15 L80 30 L80 65 C80 80, 50 90, 50 90 C50 90, 20 80, 20 65 L20 30 Z" fill="#0D5C3A" stroke="#E2B13C" stroke-width="3"/>
          <path d="M50 20 L75 32 L75 62 C75 74, 50 83, 50 83 C50 83, 25 74, 25 62 L25 32 Z" fill="#188454"/>
          <!-- Brick Fort representation -->
          <rect x="40" y="45" width="20" height="25" fill="#E2B13C" rx="1"/>
          <rect x="44" y="52" width="12" height="18" fill="#5F4613"/>
          <circle cx="50" cy="35" r="8" fill="#F8E587" stroke="#E2B13C" stroke-width="1.5"/>
          <!-- Brick crenellations -->
          <rect x="38" y="42" width="6" height="5" fill="#E2B13C"/>
          <rect x="47" y="42" width="6" height="5" fill="#E2B13C"/>
          <rect x="56" y="42" width="6" height="5" fill="#E2B13C"/>
          <!-- Crown representation on top -->
          <path d="M35 15 L40 5 L50 12 L60 5 L65 15 Z" fill="#E2B13C" stroke="#222" stroke-width="1"/>
        </svg>
      </div>
      <div class="kop-text">
        <h1 style="font-size: 16px; font-weight: 700; color: #111;">Pemerintah Kabupaten Tangerang</h1>
        <h2 style="font-size: 19px; font-weight: 800; color: #0D5C3A; margin: 2px 0;">Badan Pendapatan Daerah</h2>
        <p>Gedung Pendapatan Daerah Komplek Perkantoran Tigaraksa</p>
        <p>Telp. (021) 599 88333 Fax. (021) 599 88333</p>
        <p style="font-size: 9.5px; font-style: italic;">Website: bapendatangerangkab.go.id | Email: bapenda@tangerangkab.go.id</p>
      </div>
    </div>

    <div class="letter-details">
      <div class="letter-left">
        <table class="detail-table-mini">
          <tr>
            <td class="lbl-col">Nomor</td>
            <td class="colon-col">:</td>
            <td><strong>${coverLetterNumber}</strong></td>
          </tr>
          <tr>
            <td>Lampiran</td>
            <td>:</td>
            <td>1 Berkas (Detail Terlampir)</td>
          </tr>
          <tr>
            <td>Hal</td>
            <td>:</td>
            <td>Rekomendasi Permohonan ${formatServiceType(bundle.serviceType)} SPPT Tahun ${year}</td>
          </tr>
        </table>
      </div>
      <div class="letter-right">
        Tigaraksa, ${createdDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
      </div>
    </div>

    <div class="recipient-block">
      <strong>Yth. Kepala Badan Pendapatan Daerah</strong><br/>
      Cq. Kepala Bidang Pendataan, Penilaian, dan Penetapan Pajak Daerah<br/>
      di -<br/>
      <strong style="text-decoration: underline; margin-left: 20px;">T E M P A T</strong>
    </div>

    <div class="body-content">
      <p>Dipermaklumkan dengan hormat, bersama ini kami sampaikan data permohonan ${formatServiceType(bundle.serviceType)} SPPT PBB Tahun ${year} pada pelayanan tatap muka UPTD Wilayah IV sebagai berikut:</p>
      
      <table class="middle-table">
        <thead>
          <tr>
            <th style="width: 15%;">NO AGENDA</th>
            <th style="width: 45%;">JENIS</th>
            <th style="width: 15%;">JUMLAH</th>
            <th style="width: 25%;">KETERANGAN</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>${sequence}</strong></td>
            <td>${formatServiceType(bundle.serviceType)}</td>
            <td><strong>${bundle.itemCount} Berkas</strong></td>
            <td>Rincian Berkas Terlampir</td>
          </tr>
        </tbody>
      </table>

      <p>Sehubungan dengan hal ini, bahwa berkas permohonan ${formatServiceType(bundle.serviceType)} SPPT PBB tersebut sudah melalui proses penelitian/verifikasi dan diarsipkan sebagaimana mestinya (data terlampir).</p>
      
      <p>Demikian surat rekomendasi ini kami sampaikan, atas perhatiannya diucapkan terima kasih.</p>
    </div>

    <div class="sig-block-right">
      <div class="sig-box">
        <p style="margin-bottom: 75px;">
          Kepala UPTD<br/>
          Pajak Daerah Wilayah IV
        </p>
        <strong style="text-decoration: underline; font-size: 14px;">ASEP SUANDI, SH., M.Si</strong>
        <p style="margin: 4px 0 0 0; font-size: 11px; color: #555;">NIP. 19800630 200801 1 006</p>
      </div>
    </div>
  </div>

  <!-- PAGE 2: LANDSCAPE DETAILED ATTACHMENT TABLE -->
  <div class="landscape-page">
    <div class="lampiran-header">
      <div>LAMPIRAN REKOMENDASI BERKAS ${bundle.serviceType}</div>
      <div>
        Nomor Pengantar: ${coverLetterNumber} | Tanggal: ${createdDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
      </div>
    </div>

    <div class="lampiran-title">
      DAFTAR LAMPIRAN RINCIAN BERKAS PERMOHONAN ${formatServiceType(bundle.serviceType)}
    </div>

    <table class="landscape-table">
      <thead>
        <tr>
          <th rowspan="2" style="width: 3%;">NO</th>
          <th rowspan="2" style="width: 9%;">NO PEL</th>
          ${isMutasiHabis ? `
          <th colspan="2" style="width: 8%;">NO BUNDEL FORMULIR</th>
          ` : ''}
          <th rowspan="2" style="width: 14%;">NOP</th>
          <th rowspan="2" style="width: 10%;">WP LAMA</th>
          <th rowspan="2" style="width: 10%;">WP BARU</th>
          <th colspan="4" style="width: 16%;">LETAK OBJEK INI (ASAL)</th>
          <th colspan="4" style="width: 16%;">LETAK OBJEK SEHARUSNYA (MUTASI)</th>
          <th colspan="2" style="width: 8%;">LUAS TANAH</th>
          <th colspan="2" style="width: 8%;">LUAS BANGUNAN</th>
          <th rowspan="2" style="width: 8%;">KEPEMILIKAN</th>
          <th rowspan="2" style="width: 8%;">KET.</th>
        </tr>
        <tr>
          ${isMutasiHabis ? `
          <th class="sub-head">Bumi</th>
          <th class="sub-head">Bangunan</th>
          ` : ''}
          <th class="sub-head">Jalan</th>
          <th class="sub-head">Blok</th>
          <th class="sub-head">RT</th>
          <th class="sub-head">RW</th>
          <th class="sub-head">Jalan</th>
          <th class="sub-head">Blok</th>
          <th class="sub-head">RT</th>
          <th class="sub-head">RW</th>
          <th class="sub-head">Saat Ini</th>
          <th class="sub-head">Seharusnya</th>
          <th class="sub-head">Saat Ini</th>
          <th class="sub-head">Seharusnya</th>
        </tr>
      </thead>
      <tbody>
        ${items.map((item, idx) => {
          const detail = item.details?.[0];
          const cData = counterMap.get(item.id);

          // Format counter values matching Tangerang standard (numbers directly)
          const bumiVal = cData?.noTanah ?? '-';
          const bgnVal = cData?.noBangunan ?? '-';

          // Get Keterangan UPTD LT / UPTD LT & LB
          const hasBuilding = (item.oldBuildingArea && item.oldBuildingArea > 0) || (detail?.newBuildingArea && detail.newBuildingArea > 0);
          const ketVal = hasBuilding ? 'UPTD LT & LB' : 'UPTD LT';

          return `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td>${item.nomorPelayan || item.nomorBerkas}</td>
          ${isMutasiHabis ? `
          <td class="text-center" style="font-weight: bold; background-color: #fbfbfb;">${bumiVal}</td>
          <td class="text-center" style="font-weight: bold; background-color: #fbfbfb;">${bgnVal}</td>
          ` : ''}
          <td style="font-family: monospace; font-size: 9.5px; font-weight: bold;" class="text-center">${formatNop(item.nop)}</td>
          <td>${item.oldOwnerName || '-'}</td>
          <td>${detail?.newOwnerName || '-'}</td>
          
          <!-- Letak Objek Ini (Asal) -->
          <td>${item.oldPropertyStreet || '-'}</td>
          <td>${item.oldPropertyBlock || '-'}</td>
          <td class="text-center">${item.oldPropertyRt || '-'}</td>
          <td class="text-center">${item.oldPropertyRw || '-'}</td>
          
          <!-- Letak Objek Seharusnya (Mutasi) -->
          <td>${detail?.newPropertyStreet || '-'}</td>
          <td>${detail?.newPropertyBlock || '-'}</td>
          <td class="text-center">${detail?.newPropertyRt || '-'}</td>
          <td class="text-center">${detail?.newPropertyRw || '-'}</td>
          
          <!-- Luas Tanah -->
          <td class="text-right">${item.oldLandArea ? `${item.oldLandArea}` : '0'}</td>
          <td class="text-right" style="font-weight: bold;">${detail?.newLandArea ? `${detail.newLandArea}` : '0'}</td>
          
          <!-- Luas Bangunan -->
          <td class="text-right">${item.oldBuildingArea ? `${item.oldBuildingArea}` : '0'}</td>
          <td class="text-right" style="font-weight: bold;">${detail?.newBuildingArea ? `${detail.newBuildingArea}` : '0'}</td>
          
          <td>${detail?.ownershipProof || '-'}</td>
          <td class="text-center" style="font-weight: 500;">${ketVal}</td>
        </tr>
          `;
        }).join('')}
      </tbody>
    </table>

    <div class="sig-block-right" style="margin-top: 25px;">
      <div class="sig-box">
        <p style="margin-bottom: 50px;">
          Kepala UPTD<br/>
          Pajak Daerah Wilayah IV
        </p>
        <strong style="text-decoration: underline;">ASEP SUANDI, SH., M.Si</strong>
        <p style="margin: 2px 0 0 0; font-size: 9.5px;">NIP. 19800630 200801 1 006</p>
      </div>
    </div>
  </div>

</body>
</html>`;

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': 'inline',
      },
    });
  } catch (error: any) {
    console.error('Cover Letter API error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
