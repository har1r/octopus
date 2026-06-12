# SPESIFIKASI DESAIN UI/UX & ANTARMUKA PENGGUNA (ARCHITAX_UI_UX_DESIGN.md)

Dokumen ini mendefinisikan panduan visual lengkap, struktur tata letak (*layout*), arsitektur halaman dashboard berdasarkan Peran Pengguna (RBAC), serta interaksi mikro (*micro-interactions*) pada aplikasi **Architax PBB** yang menyelaraskan **Clay Design System** secara utuh.

---

## 1. PANDUAN VISUAL UTAMA & TOKEN DESAIN

Sistem visual Architax didasarkan pada estetika premium, bersih, dan kontras tinggi untuk kenyamanan kerja staf dinas dalam waktu lama.

### 1.1. Palet Warna (Color System)
*   **Kanvas & Permukaan Utama:** Putih murni (`#ffffff`) digunakan untuk kartu (*cards*), tabel, dan form input.
*   **Latar Belakang Dasar:** Abu-abu ultra-terang (`#F8FAFC` atau `bg-slate-50`) untuk memberikan kontras pada kartu.
*   **Warna Teks Utama:** Charcoal Gelap (`#0F172A` atau `text-slate-900`) untuk keterbacaan tingkat tinggi.
*   **Warna Teks Sekunder/Muted:** Abu-abu sedang (`#64748B` atau `text-slate-500`) untuk sub-judul, label sekunder, dan deskripsi.
*   **Warna Aksen Utama (Clay Blue):** Biru solid `#2563EB` (hover: `#1D4ED8`) menggantikan warna pink Airbnb sebelumnya untuk nuansa korporat/pemerintahan yang lebih formal dan tepercaya.
*   **Warna Status Semantik:**
    *   *Sukses / Selesai:* Hijau Lembut (Latar: `#EFF6FF` atau `#E6F4EA`, Teks: `#1D4ED8` atau `#137333`).
    *   *Peringatan / Perbaikan:* Kuning Amber (Latar: `#FEF7E0`, Teks: `#B06000`).
    *   *Ditolak / Bahaya:* Merah Coral (Latar: `#FCE8E6` atau `#FEE2E2`, Teks: `#C5221F` atau `#991b1b`).

### 1.2. Tipografi (Typography)
*   **Font Utama:** **Inter** (`Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`).
*   **Judul Halaman (H1/H2):** Bold (`fontWeight: 700`), `letterSpacing: '-0.02em'` atau `-0.55px`, warna teks gelap `#111827`.
*   **Teks Input & Label:** Ukuran `12px` / `13px` dengan `fontWeight: 500` (Medium).

---

## 2. ARSITEKTUR SIDEBAR & SISTEM NAVIGASI GLOBAL

Aplikasi menggunakan tata letak layar terbagi (*split-screen*) dengan **Sidebar Kiri Kunci (Persistent Sidebar)** bertinggi penuh (`min-h-screen`) dan lebar tetap (`w-64`).

*   **Responsivitas Sidebar:** Di layar desktop (`>= 1024px`), sidebar tetap diam di kiri. Di layar mobile/tablet (`< 1024px`), sidebar tersembunyi secara default dan dapat dimunculkan melayang melalui tombol menu hamburger di bilah navigasi atas (Navbar).
*   **Navigasi Berbasis Peran:** Daftar menu navigasi disaring secara dinamis di backend berdasarkan peran pengguna (`UserRole`) yang terenkripsi dalam token JWT sesi.

---

## 3. DASHBOARD & FITUR PADA MASING-MASING PERAN PENGGUNA

### 3.1. Peran: STAF_PENGINPUT
Dashboard bagi Staf Penginput difokuskan pada penginputan dokumen baru secara cepat dan manajemen draf berkas yang dikembalikan (revisi).

#### Halaman yang Tersedia:
1.  **Halaman Utama (Permohonan Saya):**
    *   *Fitur Utama:* Menampilkan tabel daftar permohonan yang telah diinput secara personal.
    *   *Pills Tab Control:* Menyaring data permohonan (`All`, `Recents`, `Favorites`).
    *   *Aksi:* Tombol **"Buat Permohonan"** warna biru Clay `#2563EB` yang mengarah ke formulir input baru.
2.  **Formulir Permohonan Baru (`/permohonan/new`):**
    *   *Form Pintar (Conditional Rendering):* Field form disesuaikan secara otomatis saat *Jenis Pelayanan* dipilih. Field yang tidak relevan akan disembunyikan.
    *   *Masking NOP:* Bidang NOP diformat instan saat diketik (`XX.XX.XXX.XXX.XXX-XXXX.X`).
    *   *UX Mutasi Sebagian:* Menampilkan sub-form data pecahan dalam bentuk kartu-kartu abu-abu lembut terpisah. Staf dapat menambah pecahan secara dinamis dengan tombol border putus-putus (`border-dashed`).
3.  **Halaman Edit / Revisi (`/permohonan/[id]/edit`):**
    *   *UX Khusus:* Aktif hanya jika berkas berstatus `REVISION`. Menampilkan catatan revisi (alasan dari peneliti) di kotak alert oranye tebal sebelum form edit agar staf tahu bagian mana yang harus diperbaiki.

---

### 3.2. Peran: STAF_PENELITI
Pusat kerja Peneliti berfokus pada analisis data, kalkulasi kertas kerja pemecahan, penyusunan Bundle, dan penanganan eksepsi.

#### Halaman yang Tersedia:
1.  **Antrean Permohonan Masuk (`/permohonan`):**
    *   *Fitur Utama:* Menampilkan semua berkas masuk berstatus `SUBMITTED`.
    *   *Owner Filter Chip:* Menggunakan filter tersegmen tinggi 24px untuk menyaring data berdasarkan Layanan.
    *   *Filters Toggle Button:* Tombol filter minimalis tanpa border untuk menyaring berdasarkan Status.
2.  **Detail Penelitian & Kertas Kerja (`/permohonan/[id]`):**
    *   *UX Kertas Kerja:* Ditampilkan sebagai overlay mengambang di kanan layar (khusus pelayanan Mutasi Sebagian). Melakukan penjumlahan data pecahan secara instan. Menampilkan peringatan teks merah jika kalkulasi luas sisa minus.
    *   *Aksi Interlocking:* Tombol "Minta Revisi" dan "Tolak Berkas" dinonaktifkan jika berkas sudah masuk ke dalam bundle (`DRAFT_BUNDLE` atau `READY_TO_ARCHIVE`).
3.  **Halaman Workspace Bundling (`/bundle`):**
    *   *UX Seleksi Massal (Bulk Select):* Staf mencentang berkas di baris tabel, memicu munculnya **Floating Action Bar** di bagian bawah tengah layar.
    *   *Kunci Bundle:* Tombol "Buat Bundle & Kunci" memicu penerbitan Surat Pengantar dengan format otomatis berbasis counter tahunan.

---

### 3.3. Peran: STAF_PENGARSIP
Fokus pada pemindaian dokumen fisik dan pengunggahan file scan digital.

#### Halaman yang Tersedia:
1.  **Workspace Pengarsipan (`/arsip`):**
    *   *Split-Screen Layout:* Layar kiri memuat daftar bundle berstatus `READY_TO_ARCHIVE`. Layar kanan menampilkan daftar permohonan di dalam bundle yang dipilih.
    *   *Micro-Dropzone per Baris:* Setiap baris berkas di tabel memiliki dropzone file mandiri. Staf cukup menyeret/memilih PDF berkas fisik ke baris tersebut.
    *   *Aksi:* Status berubah dari merah (`❌ Belum Ada File`) menjadi hijau (`✅ Terupload`). Tombol persetujuan final bundle dikunci hingga semua berkas dalam bundle sukses diunggah 100%.

---

### 3.4. Peran: STAF_PENGIRIM
Mengelola pengelompokkan bundle ke dalam manifest pengiriman besar untuk dikirimkan secara fisik ke Kantor Pusat.

#### Halaman yang Tersedia:
1.  **Workspace Pengiriman (`/manifest`):**
    *   *Kanban Board Layout:* Kolom Kiri berisi tumpukan kartu Bundle berstatus `READY_TO_SHIP`. Kolom Kanan berisi draf Manifest Pengiriman baru. Staf memindahkan bundle dengan cara diseret (*drag-and-drop*).
    *   *Aksi:* Setelah manifest dikirim, sistem menerbitkan cetakan lembar tanda terima. Staf mengunggah foto/scan manifest bertanda tangan (JPG/PNG) untuk mengubah status bundle menjadi `SENT_TO_CENTER`.

---

### 3.5. Peran: STAF_PEMANTAU
Memantau penyelesaian fisik berkas dan menerbitkan status final permohonan.

#### Halaman yang Tersedia:
1.  **Hub Pemantauan Berkas (`/monitoring`):**
    *   *Fitur Progres Linear:* Setiap baris bundle memiliki bar progres linier tipis berwarna Coral untuk memantau rasio berkas yang selesai.
    *   *Inline Status Switch:* Pemantau dapat mengubah status data permohonan secara instan dari `PROSES` ke `SELESAI` via switch toggle iOS di baris data tanpa perlu masuk halaman edit.
    *   *Arsip Permanen:* Tombol arsip permanen menyala emas ketika progres penyelesaian mencapai 100%.

---

### 3.6. Peran: SUPERVISOR
Akses pengawasan menyeluruh terhadap performa operasional.

#### Halaman yang Tersedia:
1.  **Supervisor Analytics Dashboard (`/analytics`):**
    *   *Metric Cards:* Menampilkan stat total berkas masuk, selesai, rasio revisi, dan berkas menumpuk.
    *   *Clay Charts:* Grafik batang warna Clay Blue untuk grafik jenis pelayanan dan grafik garis hijau untuk visualisasi kecepatan waktu penyelesaian.
    *   *Bottleneck Detector:* Tabel peringatan dengan badge berdenyut merah (`⚠️ Menumpuk`) jika antrean di suatu tahapan melampaui batas SLA.

---

## 4. RESPONSIVITAS TABEL DATA (DESKTOP VS MOBILE)

Sistem menerapkan tata letak tabel dinamis berdasarkan ukuran layar:

```
[Ukuran Layar Desktop >= 768px]
┌────────────────────────────────────────────────────────────────────────┐
│ No. Berkas   │ Jenis Layanan  │ NOP             │ Status     │ Aksi    │  <-- HTML Table (Spreadsheet style)
├──────────────┼────────────────┼─────────────────┼────────────┼─────────┤
│ ARX-2026-001 │ Pembetulan     │ 32.73...        │ SUBMITTED  │ Edit    │
└────────────────────────────────────────────────────────────────────────┘

[Ukuran Layar Mobile < 768px]
┌──────────────────────────────────────┐
│ Nomor Berkas: ARX-2026-001           │
│ NOP: 32.73.010.002.003-0004.0        │  <-- Stacked Card Layout
│ Layanan: Pembetulan                  │
│ [Status: SUBMITTED]                  │
│ [ Tombol Aksi: Edit ]                │
└──────────────────────────────────────┘
```
Tabel HTML konvensional akan disembunyikan secara otomatis pada perangkat layar kecil untuk mencegah *horizontal scroll* yang merusak tata letak halaman.

---

## 5. KOMPONEN INTERAKTIF GLOBAL (MODAL, VALIDASI, & TOAST)

Untuk menjaga konsistensi interaksi di seluruh bagian aplikasi, komponen-komponen global berikut diatur secara seragam:

### 5.1. Komponen Input & State Galat (Form Inputs & Validation State)
*   **Batas Fokus (Focus Ring):** Saat input teks/nomor diklik (fokus), sistem tidak menggunakan neon biru bawaan browser, melainkan menggunakan border abu-abu bersih `#CBD5E1` atau ring biru Clay tipis `focus:ring-1 focus:ring-[#2563EB]`.
*   **Indikator Galat (Error State):** Jika data input melanggar validasi Zod schema, border input berubah menjadi merah (`border-red-500`) dan teks galat deskriptif muncul di bawah input dengan ukuran `11px` berwarna merah.

### 5.2. Modal Dialog & Hamparan Backdrop
*   **Backdrop Hamparan:** Menggunakan efek transparan abu-abu gelap dengan filter blur halus (`bg-gray-900/50 backdrop-blur-sm`).
*   **Wadah Modal:** Berlatar putih murni `#ffffff`, bersudut tumpul bulat (`rounded-xl` atau `rounded-lg`), dan bayangan gelap lembut (`shadow-xl`).
*   **Aksi Interlocking Modal:** Dialog konfirmasi khusus akan menghalangi alur proses jika ada kondisi prasyarat yang belum terpenuhi (seperti mencoba mengubah status berkas yang masih terikat di dalam bundle).

### 5.3. Toast Notifications (Umpan Balik Instan)
Setiap mutasi data (sukses menyimpan form, sukses mengubah status, atau error backend) wajib memicu notifikasi Toast kecil di pojok kanan bawah layar:
*   **Toast Sukses:** Memiliki ikon checklist hijau dengan warna latar putih, border kiri hijau emerald `#10B981`, dan teks deskripsi sukses yang ringkas.
*   **Toast Error:** Memiliki ikon silang merah, border kiri merah `#EF4444`, dan menampilkan pesan galat asli dari server.
*   **Notifikasi WhatsApp:** Menampilkan toast info biru (`💬 WhatsApp Notifikasi dikirim...`) saat Fonnte API terpicu sukses.

