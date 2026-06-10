# PRODUCT REQUIREMENT DOCUMENT (PRD) - ARCHITAX

> **Catatan untuk AI Agent (Antigravity):** Dokumen ini adalah sumber kebenaran utama (*Single Source of Truth*) untuk spesifikasi sistem Architax. Harap patuhi seluruh alur logika, batasan sistem, dan spesifikasi teknologi yang tertulis di sini. Pastikan implementasi layout dan Tailwind CSS dilakukan dengan sangat rapi, terstruktur, dan tidak berantakan.

---

## A. WORKFLOW PROCESS (ALUR KERJA)

### 1. Tahap Penginputan (Input Stage)
* Pemohon atau **STAF_PENGINPUT** mengisi data pada formulir permohonan digital berdasarkan berkas fisik yang diajukan.
* **Jenis Pelayanan:** Objek Pajak Baru, Mutasi Sebagian, Mutasi Habis Update, Mutasi Habis Reguler, Pembetulan, atau Pengaktifan.
* **Ketentuan:** Tanpa melakukan unggah (*upload*) dokumen/lampiran apa pun di tahap ini.
* **Status Perubahan:** Setelah dikirim secara digital, status berubah menjadi **`SUBMITTED`**.

### 2. Tahap Penelitian & Validasi (Examination Stage)
* **STAF_PENELITI** memeriksa secara menyeluruh kelengkapan dan kebenaran data pada antrean berstatus **`SUBMITTED`**.
* **Aturan Bisnis Khusus Kertas Kerja Mutasi Sebagian:** STAF_PENELITI wajib menyusun dan menginput data Kertas Kerja Mutasi Sebagian ke dalam sistem sebelum data diproses ke tahap berikutnya (`DRAFT_BUNDLE`).
    * **Tujuan Laporan Kertas Kerja:** Menunjukkan perhitungan pemecahan matematis, rincian objek pajak baru, dan sisa luas tanah/bangunan pada objek induk.
    * **Logika Perhitungan & Validasi (Computed Fields):**
        * `Luas Tanah Sisa = Luas Tanah Induk - SUM(Luas Tanah Pecahan)`
        * `Luas Bangunan Sisa = MAX(0, Luas Bangunan Induk - SUM(Luas Bangunan Pecahan))`
    * **Validasi Ganda:** Sistem akan memicu *validation error* jika `Luas Tanah Sisa < 0`. Jika total luas bangunan pecahan melebihi induk, sisa luas bangunan otomatis terkunci di angka 0.
    * **Komponen Tampilan Kertas Kerja:** Data objek induk sebelum mutasi, daftar seluruh objek pecahan, rekapitulasi total luas, perhitungan sisa, dan hasil akhir komparasi.

### 3. Tahap Pengelompokkan Data (Bundling Stage)
* Data yang lengkap dan benar dikelompokkan ke dalam satu **Bundle**.
* **Karakteristik & Validasi Bundle:**
    * **Satu Jenis Pelayanan:** Tidak boleh dicampur.
    * **Kapasitas:** Maksimal 20 data permohonan per bundle.
    * **Sifat Fleksibel:** Selama status belum `DRAFT_BUNDLE`, data bisa dikeluarkan/dimasukkan. Slot kosong bisa diisi data permohonan baru sejenis.
* **Penerbitan Surat Pengantar:**
    * Sistem otomatis menerbitkan satu Surat Pengantar dengan *template* sesuai jenis pelayanan. Dicetak dan ditempel pada fisik bundle. Status berubah menjadi **`READY_TO_ARCHIVE`**.
* **Penomoran:** Menggunakan mekanisme *Global Sequence Counter* (Nomor Bundle, No Surat Pengantar, No Manifest) berbasis tahunan (reset 1 Januari 00:00).
* **Aturan Bisnis Khusus Mutasi Habis Update:**
    * Memiliki template surat khusus berbasis No Tanah dan No Bangunan.
    * **No Tanah:** Wajib digenerate untuk setiap permohonan.
    * **No Bangunan:** Hanya digenerate jika `Luas Lama != Luas Baru`. Jika sama/tidak ada bangunan, dikosongkan.
    * **Counter:** Berkelanjutan dan hanya di-reset tiap pergantian tahun (tidak di-reset per bundle).

### 4. Penanganan Data Bermasalah & Aturan Batas Waktu (Exception Handling & SLA)
* **Kondisi A (Belum Masuk Bundle):** STAF_PENELITI dapat mengubah status menjadi **`REVISION`** atau **`REJECTED`**.
* **Kondisi B (Sudah Masuk Bundle):** Wajib klik **"Keluarkan dari Bundle"** terlebih dahulu. Tombol `REVISION` atau `REJECTED` baru akan aktif setelah dikeluarkan.
* **Sisa Data dalam Bundle:** Tetap dapat diproses. Sistem *auto-update* informasi kuantitas data pada Surat Pengantar.
* **Batas Waktu Tahun Berjalan:** Status **`REVISION`** diberi waktu selama tahun berjalan untuk *resubmit*. Jika lewat, otomatis menjadi **`REJECTED_PERMANENT`**.

### 5. Tahap Pengarsipan & Penyelesaian (Archiving & Approval Stage)
* **STAF_PENGARSIP** menerima dokumen fisik (Status: **`READY_TO_ARCHIVE`**).
* **Digitalisasi (Multi-Upload Terpisah):** Pemindaian diunggah secara terpisah untuk setiap 1 data permohonan dalam bundle.
* **Validasi:** Tombol "Approve (Selesai)" aktif jika 100% data memiliki file scan.
* **Mekanisme Pengembalian (Rollback Workflow):**
    * Jika ada *error*, beri catatan dan klik "Kembalikan ke Tahap Penelitian" (status: **`RE_EXAMINE`**).
    * STAF_PENELITI mengeluarkan data bermasalah (ubah ke `REVISION`/`REJECTED`). Slot kosong bisa diisi data baru.
    * File scan yang aman tidak hilang. Surat Pengantar diperbarui otomatis. Bundle di-Approve, status menjadi **`READY_TO_SHIP`**.

### 6. Tahap Pengiriman & Penetapan (Shipping & Dispatch Stage)
* **STAF_PENGIRIM** menerima fisik berstatus **`READY_TO_SHIP`**.
* **Manifest Pengiriman:** Pengelompokan kolektif beberapa Bundle ke dalam satu Manifest digital dan dicetak.
* **Final Approval:** Setelah fisik diterima di Kantor Pusat, STAF_PENGIRIM wajib *scan* dan *upload* Manifest Bertanda Tangan.
* Tombol "Approve Pengiriman" ditekan -> status terkunci permanen menjadi **`SENT_TO_CENTER`**.
* **Penanganan Masalah (Rollback):**
    * **Kondisi A (Belum di Manifest):** Klik "Kembalikan ke Tahap Penelitian".
    * **Kondisi B (Sudah di Manifest):** Klik "Keluarkan Bundle dari Manifest". File unggahan lama dihapus, *update* daftar pengiriman, upload ulang bukti tanda terima baru. Bundle yang kembali berubah status menjadi `RE_EXAMINE`.

### 7. Tahap Pemantauan & Penyelesaian Akhir (Monitoring & Completion Stage)
* **STAF_PEMANTAU** melacak status data di Kantor Pusat (Status saat ini: **`SENT_TO_CENTER`**).
* **Pencatatan Parsial:** Menandai status selesai secara mandiri per individu. Bisa dicicil tanpa mengubah status Bundle secara keseluruhan.
* **Final System Lock:** Tombol "Approve Selesai (Arsip Permanen)" aktif jika 100% data ditandai **SELESAI**.
* Status akhir berubah menjadi **`COMPLETED`** (Selesai Sempurna), terkunci permanen, masuk ke *database* arsip statis.

---

## B. STRUCTURE FIELD INPUT FORMULIR PERMOHONAN DIGITAL

### a) DATA UTAMA PERMOHONAN (Header Form)
Wajib diisi di setiap jenis pelayanan.
1.  **Sistem & Meta Data**
    * Nomor berkas (Auto-generated)
    * Jenis pelayanan (Dropdown: *Objek Pajak Baru, Mutasi Sebagian, Mutasi Habis Update, Mutasi Habis Reguler, Pembetulan, Pengaktifan*)
    * Nomor pelayan (Manual input. *Bypass/Hidden* jika pelayanan = Pengaktifan)
    * Nomor objek pajak (NOP) (Input text, masking: `18 digit`)
2.  **Data Pemilik Lama (Subjek Pajak Eksisting)**
    * Nama, Jalan, Blok, RT/RW, Kecamatan/Desa/Kelurahan.
3.  **Data Objek Pajak Lama (Eksisting)**
    * Jalan, Blok, RT/RW, Kecamatan/Desa/Kelurahan.
    * Luas tanah lama (Desimal)
    * Luas bangunan lama (Desimal)

### b) DATA OBJEK BARU / PECAHAN (Sub-Form / Detail Form)
Tabel dinamis (array) untuk *Mutasi Sebagian*, form tunggal untuk pelayanan lain.
1.  **Data Pemilik Baru (Subjek Pajak Baru)**
    * Nama, Jalan, Blok, RT/RW, Kecamatan/Desa/Kelurahan.
2.  **Data Objek Pajak Baru**
    * Jalan, Blok, RT/RW, Kecamatan/Desa/Kelurahan.
    * Luas tanah baru (Desimal)
    * Luas bangunan baru (Desimal)
    * Bukti Kepemilikan (Text: No Akta / Sertifikat)

### c) DETAIL FIELD BERDASARKAN JENIS PELAYANAN
1.  **Objek Pajak Baru:** Meta Data + NOP + Objek/Pemilik Baru.
2.  **Mutasi Sebagian:** Meta Data + NOP + Pemilik/Objek Lama + (Array) Pemilik/Objek Baru + Kepemilikan.
3.  **Mutasi Habis Update:** Meta Data + NOP + Pemilik/Objek Lama + Pemilik/Objek Baru + Kepemilikan.
4.  **Mutasi Habis Reguler:** Sama persis dengan Mutasi Habis Update.
5.  **Pembetulan:** Sama persis dengan Mutasi Habis Update.
6.  **Pengaktifan:** Meta Data + NOP + Pemilik/Objek Lama + Bukti Kepemilikan.

---

## C. TECH STACK SPECIFICATION

* **Framework:** Next.js 15 (App Router)
* **Language:** TypeScript
* **Database ORM:** Prisma ORM v5+
* **Database Target:** MongoDB Atlas (*Rekomendasi: Indeks pada NOP, AuditLog, dan Counter Koleksi*)
* **Third-Party API:** Fonnte API Gateway (WhatsApp Business Solution)
* **Styling Requirement:** Tailwind CSS (Harus terstruktur, rapi, dan modular untuk menghindari *layout* yang berantakan).

---

## D. UI-UX DESIGN SPECIFICATIONS

### 1. Skema Warna & Identitas Visual (Airbnb-Inspired Palette)
* **Background Utama:** Putih Bersih (`#FFFFFF`) untuk kanvas, Abu-abu Ultra-Terang (`#F7F7F7`) untuk *background* aplikasi.
* **Teks Utama:** Dark Charcoal (`#222222`) untuk keterbacaan tajam.
* **Aksen Utama:** Rausch Coral (`#FF385C`) secara minimalis (untuk tombol kritis/utama).
* **Border:** Light Gray (`#DDDDDD`) tipis dan bersih.
* **Warna Status:**
    * Hijau Lembut (`#10B981`): `COMPLETED`, `APPROVED`, Sukses upload.
    * Oranye Lembut (`#F59E0B`): `REVISION`, `RE_EXAMINE`, SLA peringatan.
    * Merah Muted (`#EF4444`): `REJECTED`, Hapus/Keluarkan berkas.

### 2. Tata Letak Global & Navigasi
* **Persistent Sidebar:** Kiri, background putih, efek *rounded corners* pada menu aktif.
* **Dynamic Nav (RBAC):** Otomatis menyesuaikan *role* (STAF_PENGINPUT, PENELITI, PENGARSIP, PENGIRIM, PEMANTAU, SUPERVISOR) via Next.js 15 Layout.

### 3. Komponen UI per Tahap
* **Tahap 1 & 2:** Form cerdas (sembunyikan field tak relevan). NOP masking: `XX.XX.XXX.XXX.XXX-XXXX.X`. Card abu-abu untuk Mutasi Sebagian (dinamis tambah/hapus). Kertas Kerja *Overlay* *real-time*.
* **Tahap 3 & 4:** *Quick-Filter Tabs*, *Floating Action Bar* (Bulk select konter s.d 20). *Interlocking Modals* (wajib keluarkan dari bundle sebelum revisi).
* **Tahap 5:** *Split-Screen Detail View*. *File Dropzone* mini per baris. Badge merah (❌) -> hijau (✅) setelah *upload*, fitur *instant preview* PDF.
* **Tahap 6:** *Drag-and-Drop Kanban Board* (Bundle Siap Kirim vs Manifest Baru). *Alert Banner* kuning jika isi manifest diubah.
* **Tahap 7:** *Linear Progress Bar* warna Coral per Bundle. *Inline Toggle/Switch* (PROSES ➡️ SELESAI).

### 4. Halaman Statistik & Pengawasan (Supervisor Hub)
* **Top Metric Stat Cards:** Total Berkas Masuk, Dalam Proses, Selesai Sempurna, Rasio Revisi/Ditolak.
* **Minimalist Charts:** Bar Chart (Coral) untuk jenis pelayanan, Line Chart (Hijau) untuk kecepatan waktu penyelesaian.
* **Bottleneck Detector:** Tabel dengan badge `⚠️ Menumpuk` jika SLA terlewati. Global Dropdown Filter.

### 5. Notification Layer (Fonnte API)
* Notifikasi WA otomatis ke pemohon saat aksi kritis (Minta Revisi / Approve Akhir).
* *Toast Notification* di sudut kanan bawah (`💬 WhatsApp Notifikasi berhasil...`).

### 6. Public Tracking Portal (Tanpa Login)
* *Hero Search Container* (Cek resi via No Pelayanan + NOP). Masking input NOP.
* *Public Stepper UI*:
    * `SUBMITTED`/`DRAFT_BUNDLE` $
ightarrow$ ⏳ Diterima & Diteliti (`#F59E0B`)
    * `READY_TO_ARCHIVE`/`RE_EXAMINE` $
ightarrow$ 📋 Proses Digitalisasi (`#4A5568`)
    * `READY_TO_SHIP`/`SENT_TO_CENTER` $
ightarrow$ 🚚 Dikirim ke Pusat (`#3B82F6`)
    * `REVISION` $
ightarrow$ ⚠️ Butuh Perbaikan + Alert Banner Catatan Revisi & Countdown Waktu.
    * `REJECTED`/`REJECTED_PERMANENT` $
ightarrow$ ❌ Ditolak Permanen (`#EF4444`)
    * `COMPLETED` $
ightarrow$ ✅ Selesai Sempurna (`#10B981`)
* **Zero Personal Data Exposure:** Nama dan Alamat disembunyikan.

---

## E. NON-FUNCTIONAL REQUIREMENTS: RESPONSIVENESS

1.  **Mobile-First & Breakpoints:** Wajib menggunakan utility-first classes (Tailwind CSS). Tahap 1 (Form) & Public Tracking WAJIB 100% responsif. Mobile `< 768px` harus *stacked layout*. Touch target tombol minimal `44x44px`.
2.  **Adaptasi Komponen:** Tabel berubah menjadi *List Card Layout* di mobile. Supervisor dashboard jadi 1 kolom grid di mobile. Grafik harus *fluid/responsive*. *Drag-and-Drop* diganti dengan tombol *dropdown action* khusus di mobile.

---

## F. SECURITY & DATA PROTECTION REQUIREMENTS

1.  **RBAC & Autentikasi:** Hash password dengan bcrypt (salt 10-12) / Argon2id. Proteksi level server (Middleware Next.js). Token JWT *Secure, HttpOnly, SameSite=Strict*.
2.  **Data Layer Security:** Enkripsi *in-transit* (TLS 1.2+). Parameterized query (Prisma) anti-SQL Injection. Sanitasi *Server-side* (Zod/Joi) anti-XSS.
3.  **File Upload:** Batasan ektensi (hanya PDF, JPG/PNG). Max ukuran 2MB - 5MB per file. Disimpan di Cloud Storage/GridFS dengan *Presigned URLs*, BUKAN di folder publik.
4.  **Public API:** *Rate Limiter* (@upstash/ratelimit) anti-Bruteforce. *Data Masking* ketat sebelum *response* JSON.
5.  **Audit Log:** Catat *Timestamp*, ID Staf, Nama, Role, dan Aksi secara mutlak. Bersifat *Read-Only* tanpa akses edit/delete bahkan untuk Supervisor.
