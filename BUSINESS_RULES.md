# BUSINESS RULES SPECIFICATION (BUSINESS_RULES.md)

> **Catatan untuk AI Agent (Antigravity):** Dokumen ini adalah spesifikasi mutlak mengenai *Business Logic*, kalkulasi matematis, batasan kuantitas, dan aturan data tingkat backend/frontend. Anda **wajib** mengimplementasikan fungsi-fungsi ini sesuai presisi yang tertulis. Saat Anda menyusun atau memperbaiki layout (Tailwind CSS) yang berantakan, **jangan pernah mengubah atau merusak logika fungsionalitas yang sudah berjalan dengan baik**. 

---

## 1. ATURAN VALIDASI DATA & INPUT (DATA VALIDATION RULES)

### 1.1. Aturan Masking & Format NOP
* **Kewajiban:** Setiap kolom Nomor Objek Pajak (NOP) pada semua jenis pelayanan wajib menggunakan sistem masking di sisi antarmuka (*frontend*).
* **Format Mutlak:** `XX.XX.XXX.XXX.XXX-XXXX.X` (Total 18 digit angka eksak, dipisahkan oleh titik dan strip sesuai pola).
* **Pencegahan:** Sistem tidak boleh menerima input huruf (alfabet) atau jumlah digit yang kurang/lebih dari 18 angka.

### 1.2. Logika Matematika "Mutasi Sebagian" (Computed Fields)
* **Konteks:** Pemecahan 1 Objek Induk menjadi beberapa Objek Pecahan (disimpan dalam format *array of objects* di backend, bukan *single object*).
* **Kalkulasi Sisa Tanah:**
  * Rumus: `Luas Tanah Sisa = Luas Tanah Induk - SUM(Luas Tanah Pecahan)`
  * *Blocker Rule:* Jika hasil kalkulasi `< 0` (minus), sistem wajib menampilkan *error validation* dan memblokir pengiriman formulir.
* **Kalkulasi Sisa Bangunan:**
  * Rumus: `Luas Bangunan Sisa = Luas Bangunan Induk - SUM(Luas Bangunan Pecahan)`
  * *Auto-Lock Rule:* Jika total pecahan luas bangunan melebihi induk (hasil minus), nilai `Luas Bangunan Sisa` tidak boleh error, melainkan **otomatis dikunci pada angka 0** (`Math.max(0, sisa)`).

---

## 2. ATURAN PENGELOMPOKKAN & MANIFEST (BUNDLING & SHIPPING RULES)

### 2.1. Batasan Kapasitas Bundle
* Minimum isi bundle: `1 data permohonan`.
* Maksimum isi bundle: `20 data permohonan`.
* Sistem (terutama fitur *Bulk Select*) harus mengunci (*disable*) seleksi data ke-21.

### 2.2. Aturan Homogenitas Bundle
* **Satu Bundle = Satu Jenis Pelayanan.**
* Sistem backend dan frontend tidak boleh mengizinkan permohonan *Objek Pajak Baru* digabung dengan *Pembetulan* atau pelayanan lainnya di dalam ID Bundle yang sama.

### 2.3. Interlocking Modal Rule (Anti-Bypass Eksepsi)
* Jika sebuah permohonan sudah memiliki relasi dengan `ID Bundle` (berada di dalam bundle), aksi untuk `Minta Revisi` atau `Tolak Permanen` **diharamkan** secara fungsional.
* Pengguna wajib mengeklik fungsi `Keluarkan dari Bundle` terlebih dahulu untuk memutus relasi data, baru setelahnya status data tersebut boleh diubah.

### 2.4. Aturan Pembaruan Manifest Pengiriman
* Jika sebuah bundle dikeluarkan dari manifest pengiriman yang sudah ada (Kondisi *Rollback*), file *scan* bukti manifest lama **wajib dihapus (delete) dari server/storage**, bukan sekadar ditimpa.
* Sistem harus memaksa `STAF_PENGIRIM` untuk mengunggah ulang bukti manifest fisik yang baru dengan validasi status `❌ Belum Ada File` muncul kembali.

---

## 3. ATURAN PENOMORAN & SEQUENCE COUNTERS

### 3.1. Global Sequence Counter Tahunan
* Sistem wajib memiliki koleksi/tabel konter mandiri di database (misal: `SequenceCounter`) untuk mengelola penomoran yang *auto-increment*.
* **Reset Rule:** Seluruh konter umum (Nomor Bundle, Nomor Surat Pengantar Umum, Nomor Manifest) wajib di-reset kembali ke angka `1` secara otomatis setiap **1 Januari pukul 00:00**.

### 3.2. Aturan Khusus Surat Pengantar Mutasi Habis Update / Reguler
* Pembuatan surat pengantar untuk jenis Mutasi Habis memanfaatkan konter internal khusus untuk `No Tanah` dan `No Bangunan`.
* **Sifat Konter:** Berkelanjutan secara global, tidak di-reset ketika membuat bundle baru. Hanya di-reset saat pergantian tahun kalender.
* **Kondisi Generate No Tanah:** **Wajib** digenerate dan increment untuk setiap permohonan tanpa terkecuali.
* **Kondisi Generate No Bangunan:** * Jika `Luas Bangunan Lama != Luas Bangunan Baru` -> Generate & Increment No Bangunan.
  * Jika `Luas Bangunan Lama == Luas Bangunan Baru` ATAU tidak ada bangunan -> Field No Bangunan di database dikosongkan (`null` atau string kosong), dan *counter* bangunan **tidak boleh bertambah**.

---

## 4. ATURAN BATAS WAKTU (SLA & EXPIRATION RULES)

### 4.1. SLA Tahun Berjalan untuk Revisi
* **Target:** Semua permohonan dengan status `REVISION`.
* **Tenggat Waktu:** Batas maksimal pemohon memperbaiki berkas adalah akhir tahun berjalan (`31 Desember 23:59:59` pada tahun permohonan tersebut diajukan).
* **Cron Job / Schedulers:** Sistem wajib memiliki *job scheduler* otomatis yang berjalan di latar belakang. Jika tenggat waktu terlewati dan status belum berubah, sistem secara paksa (*force-update*) mengubah status menjadi `REJECTED_PERMANENT`.

---

## 5. ATURAN LAMPIRAN FILE (ATTACHMENT & STORAGE RULES)

### 5.1. Struktur Data Upload (Array Requirement)
* Lampiran file arsip (scan berkas) wajib disimpan menggunakan struktur data **Array of Objects** `[{ fileUrl: string, type: string, ... }]`, bukan *single object*, untuk mendukung skalabilitas multi-dokumen pada satu permohonan (jika dibutuhkan di kemudian hari) dan sesuai persyaratan API backend.
* Upload di Tahap 5 bersifat individual untuk tiap permohonan (bukan 1 file gabungan dalam 1 bundle).

### 5.2. Limitasi & Keamanan Ekstensi File
* **Arsip/Scan Berkas (Tahap 5):** HANYA menerima format `.pdf`.
* **Bukti Manifest (Tahap 6):** HANYA menerima format gambar `.jpg`, `.jpeg`, `.png`.
* **Maksimum Ukuran File:** Dibatasi rentang `2MB - 5MB` per file. Server akan memutus (*reject*) permintaan *upload* jika melebihi *payload size* tersebut untuk menghindari ancaman *Storage Exhaustion (DoS)*.

---

## 6. ATURAN JEJAK DIGITAL (AUDIT LOG RULES)

### 6.1. Sifat *Immutable* (Tidak Bisa Diubah)
* Data pada koleksi `AuditLog` di database bersifat **Read-Only**.
* Dilarang keras menyediakan API Endpoint (`PUT`, `PATCH`, `DELETE`) untuk tabel Audit Log.
* Bahkan *role* `SUPERVISOR` atau `ADMIN` sekalipun tidak memiliki hak akses sistem untuk menghapus atau mengubah catatan log yang sudah tercipta.

### 6.2. Aturan Pencatatan (What to Log)
Setiap mutasi status data atau aksi kritikal (seperti membuat bundle, mengeluarkan berkas, menyetujui tahap akhir) wajib menuliskan entri baru di log dengan skema minimum:
* Waktu kejadian (Timestamp).
* Identifier Aktor (ID Akun & Nama Staf).
* Peran Aktor (Role).
* Deskripsi Aksi yang eksplisit (Contoh: *"STAF_PENGIRIM [Nama] mengeluarkan berkas [NOP] dari Manifest [No Manifest]"*).
