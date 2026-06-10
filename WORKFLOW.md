# ARCHITAX WORKFLOW SPECIFICATION (WORKFLOW.md)

> **Catatan untuk AI Agent (Antigravity):** Dokumen ini mendefinisikan State Machine, transisi data, peran pengguna (RBAC), serta logika rollback sistem secara mutlak. Semua perubahan status di database wajib mengikuti aturan dalam berkas ini. Pastikan integrasi Tailwind CSS untuk penanda status (badge) menggunakan skema warna yang konsisten sesuai DESIGN.md / PRD.md agar tidak berantakan.

---

## 1. GLOBAL STATE MACHINE MATRIX

Sistem Architax mengelola siklus hidup data permohonan melalui status-status berikut. Setiap transisi dipicu oleh aksi pengguna dengan peran tertentu atau otomatisasi sistem.

| # | Nama Status | Level Objek | Deskripsi | Aktor Utama |
|---|---|---|---|---|
| 1 | `SUBMITTED` | Permohonan | Data selesai diinput oleh staf penginput / pemohon. Belum divalidasi. | `STAF_PENGINPUT` |
| 2 | `REVISION` | Permohonan | Berkas dikembalikan ke penginput karena ada kesalahan data. | `STAF_PENELITI` |
| 3 | `REJECTED` | Permohonan | Berkas ditolak secara permanen di tahap penelitian. | `STAF_PENELITI` |
| 4 | `REJECTED_PERMANENT` | Permohonan | Ditolak otomatis oleh sistem karena melewati SLA tahun berjalan. | `SISTEM (Auto)` |
| 5 | `DRAFT_BUNDLE` | Bundle / Data | Permohonan telah divalidasi dan dimasukkan ke dalam kelompok bundle. | `STAF_PENELITI` |
| 6 | `READY_TO_ARCHIVE` | Bundle | Kelompok data dikunci, Surat Pengantar diterbitkan dan dicetak. | `STAF_PENELITI` |
| 7 | `RE_EXAMINE` | Bundle | Bundle dikembalikan dari pengarsipan atau pengiriman karena ada galat. | `STAF_PENGARSIP` / `STAF_PENGIRIM` |
| 8 | `READY_TO_SHIP` | Bundle | Seluruh file scan permohonan dalam bundle telah diunggah 100%. | `STAF_PENGARSIP` |
| 9 | `SENT_TO_CENTER` | Bundle / Data | Manifest pengiriman bertanda tangan diunggah, data dikirim ke Kantor Pusat. | `STAF_PENGIRIM` |
| 10| `COMPLETED` | Bundle / Data | Seluruh permohonan selesai diproses di pusat dan diarsip secara statis. | `STAF_PEMANTAU` |

---

## 2. DETAIL ALUR PER TAHAPAN (STAGE-BY-STAGE BREAKDOWN)

### TAHAP 1: INPUT STAGE (PENGINPUTAN)
* **Aktor:** `STAF_PENGINPUT` / Pemohon Publik
* **Kondisi Awal:** Form Kosong / Data Baru
* **Aksi Utama:** `Kirim Permohonan`
* **Validasi Sistem:**
    * Pemeriksaan kelengkapan field dinamis berbasis *Jenis Pelayanan* yang dipilih.
    * *Masking* otomatis NOP wajib tepat 18 digit (`XX.XX.XXX.XXX.XXX-XXXX.X`).
    * Tidak ada fitur upload file apa pun pada tahapan ini.
* **Kondisi Akhir:** Record tersimpan di database dengan status permohonan = **`SUBMITTED`**.

### TAHAP 2 & 3: EXAMINATION & BUNDLING STAGE (PENELITIAN & PENGELOMPOKKAN)
* **Aktor:** `STAF_PENELITI`
* **Kondisi Awal:** Antrean Permohonan berstatus **`SUBMITTED`** atau **`RE_EXAMINE`**.

#### A. Logika Khertas Kerja Mutasi Sebagian
* Jika Jenis Pelayanan = `Mutasi Sebagian`, sistem memunculkan overlay/view Kertas Kerja.
* **Aturan Matematika (Computed Fields):**
    * `Luas Tanah Sisa = Luas Tanah Induk - SUM(Luas Tanah Pecahan)`
    * `Luas Bangunan Sisa = MAX(0, Luas Bangunan Induk - SUM(Luas Bangunan Pecahan))`
* **Sistem Pencegahan Galat (Blocker):** Jika `Luas Tanah Sisa < 0`, sistem memicu *validation error* dan memblokir aksi lanjut ke bundle. Jika luas bangunan minus, otomatis dikunci di angka `0`.

#### B. Aturan Pembuatan Bundle (Mekanisme Bundling)
* Staf memilih berkas melalui fitur *Bulk Select* via *Floating Action Bar*.
* **Validasi Interlocking Bundle:**
    * Satu Bundle **WAJIB** berisi 1 Jenis Pelayanan yang sama (Sistem menyaring via *Quick-Filter Tabs*).
    * Kapasitas maksimal satu bundle adalah **20 data permohonan**.
* **Transisi Status 1 (DRAFT_BUNDLE):** Ketika data dimasukkan ke kelompok, status internal berubah menjadi `DRAFT_BUNDLE`. Selama dalam status ini, data bersifat fleksibel (bisa dikeluarkan/dimasukkan kembali).
* **Transisi Status 2 (READY_TO_ARCHIVE):** Ketika kelompok data dikunci, sistem memicu pembuatan **Surat Pengantar** menggunakan *Global Sequence Counter* berbasis nomor urut tahunan (format di-reset setiap 1 Januari 00:00). Status bundle dan seluruh permohonan di dalamnya berganti menjadi **`READY_TO_ARCHIVE`**.

#### C. Ketentuan Khusus Surat Pengantar Mutasi Habis Update
* Menggunakan runtutan No Tanah dan No Bangunan melalui counter global tahunan berkelanjutan.
* `No Tanah`: Wajib digenerate untuk tiap permohonan di dalam bundle.
* `No Bangunan`: Hanya digenerate jika `Luas Bangunan Lama != Luas Bangunan Baru`. Jika sama atau tidak ada bangunan, field dikosongkan.

---

## 3. MEKANISME PENANGANAN EKSEPSI & SLA (EXCEPTION HANDLING)

### Kondisi Data Bermasalah di Tahap Penelitian
1.  **Jika Berkas Belum Masuk Bundle:**
    * `STAF_PENELITI` dapat langsung mengeklik aksi `Minta Revisi` (mengubah status data menjadi **`REVISION`**) atau `Tolak Permanen` (mengubah status menjadi **`REJECTED`**).
2.  **Jika Berkas Sudah Masuk Bundle (`DRAFT_BUNDLE` / `READY_TO_ARCHIVE`):**
    * Sistem menerapkan **Interlocking Modals**. Tombol revisi/tolak terkunci.
    * Staf wajib mengeklik **"Keluarkan dari Bundle"** terlebih dahulu.
    * Setelah berkas dikeluarkan, informasi kuantitas pada Surat Pengantar otomatis diperbarui (*auto-update* jumlah riil berkas sisa). Berkas sisa dalam bundle tetap aman berjalan ke tahap berikutnya.
    * Berkas yang keluar kini dapat diubah statusnya menjadi **`REVISION`** atau **`REJECTED`**.

### Aturan Batas Waktu Otomatis (SLA Automation)
* Setiap berkas berstatus **`REVISION`** diberikan batas waktu perbaikan oleh pemohon selama tahun kalender berjalan.
* **Pemicu Otomatis (Cron Job):** Pada tanggal 31 Desember pukul 23:59:59, seluruh berkas yang masih berstatus **`REVISION`** dan belum di-*resubmit* akan diubah otomatis oleh sistem menjadi **`REJECTED_PERMANENT`**.

---

## 4. TAHAP PENGARSIPAN & PENGIRIMAN (ROLLBACK WORKFLOW)

### TAHAP 5: ARCHIVING STAGE
* **Aktor:** `STAF_PENGARSIP`
* **Kondisi Awal:** Menerima fisik bundle dengan status **`READY_TO_ARCHIVE`**.
* **Proses Digitalisasi:** Scan dilakukan per dokumen individu. File diunggah secara terpisah menggunakan komponen *File Dropzone* mini pada setiap baris data permohonan di dalam tabel *Split-Screen View*.
* **Pencegahan Bypass:** Tombol `Approve (Selesai)` pada level bundle terkunci secara mutlak selama ada baris berkas yang berstatus `❌ Belum Ada File`. Tombol baru aktif saat seluruh berkas 100% berubah menjadi `✅ Terupload`.
* **Aksi Sukses:** Status bundle bergeser ke **`READY_TO_SHIP`**.

#### Alur Rollback dari Tahap Pengarsipan (`RE_EXAMINE`)
* Jika ditemukan kesalahan data individu oleh Staf Pengarsip:
    1.  Staf memberikan catatan galat dan mengeklik **"Kembalikan ke Tahap Penelitian"**.
    2.  Status bundle berubah menjadi **`RE_EXAMINE`**.
    3.  `STAF_PENELITI` menerima kembali bundle tersebut, lalu mengeluarkan berkas yang bermasalah (mengubahnya ke status `REVISION` / `REJECTED`).
    4.  Slot kosong yang ditinggalkan boleh diisi oleh berkas permohonan baru yang sejenis (maksimal tetap 20 berkas).
    5.  Berkas aman yang tersisa tidak kehilangan file scan yang sudah diunggah sebelumnya. Surat pengantar otomatis di-update, bundle dikirim kembali ke pengarsipan, dan staf pengarsip hanya perlu mengunggah file scan milik berkas baru saja.

---

### TAHAP 6: SHIPPING STAGE (PENGIRIMAN)
* **Aktor:** `STAF_PENGIRIM`
* **Kondisi Awal:** Bundle berstatus **`READY_TO_SHIP`**.
* **Proses Manifest:** Beberapa bundle final digabungkan ke dalam satu **Manifest Pengiriman** digital menggunakan antarmuka *Drag-and-Drop Kanban Board*. Sistem menerbitkan nomor daftar pengiriman menggunakan counter tahunan global.
* **Penyelesaian Akhir:** Setelah berkas fisik sampai di Kantor Pusat dan lembar manifest ditandatangani, staf memindai bukti manifest bertandatangan tersebut dan mengunggahnya ke sistem. Tombol `Approve Pengiriman` aktif, status bundle dan data di dalamnya terkunci permanen menjadi **`SENT_TO_CENTER`**.

#### Alur Rollback dari Tahap Pengiriman
1.  **Sebelum Masuk Manifest:** Staf Pengirim bisa langsung klik tombol `"Kembalikan ke Tahap Penelitian"` pada detail bundle. Status bundle kembali menjadi **`RE_EXAMINE`**.
2.  **Setelah Masuk Manifest:** Staf wajib mengeklik aksi `"Keluarkan Bundle dari Manifest"`.
    * Sistem memicu efek *fade-out* pada UI, menghapus file manifest lama di backend, dan memunculkan *alert banner* kuning: `⚠️ Isi manifes berubah. Silakan cetak ulang manifes fisik dan unggah kembali bukti tanda tangan yang baru.`
    * Bundle yang dikeluarkan kemudian dikembalikan ke `STAF_PENELITI` dengan status **`RE_EXAMINE`**.

---

## 5. TAHAP PEMANTAUAN & FINALIASI ARSIP

### TAHAP 7: MONITORING & COMPLETION STAGE
* **Aktor:** `STAF_PEMANTAU`
* **Kondisi Awal:** Data berada di dalam bundle berstatus **`SENT_TO_CENTER`**.
* **Pencatatan Parsial:** Staf memantau perkembangan fisik di kantor pusat. Jika dokumen hasil dari satu permohonan terbit, staf langsung menggeser *Inline Toggle/Switch* dari posisi `PROSES` ke `SELESAI`. Pencatatan ini dicicil bertahap tanpa memengaruhi berkas lain dalam bundle.
* **Final System Lock:** Komponen *Linear Progress Bar* warna Coral khas Airbnb akan bertambah seiring peningkatan rasio berkas selesai. Tombol emas `"Arsip Permanen"` hanya akan aktif menyala secara sistem jika progres mencapai **100% Selesai**.
* **Kondisi Akhir:** Ketika tombol ditekan, status seluruh data berubah menjadi **`COMPLETED`** (Selesai Sempurna), data dikunci mati 100% dan masuk ke database arsip statis sistem.

---

## 6. INTEGRASI NOTIFIKASI EVENT (FONNTE API BACKEND TRIGGERS)

Setiap terjadi perubahan status kritis, backend sistem secara otomatis menembak API Fonnte untuk mengirimkan pembaruan status ke WhatsApp Pemohon:

```
[Event: Minta Revisi]
Status Berkas -> REVISION
Trigger API -> Fonnte kirim WhatsApp ke nomor pemohon berisi Catatan Perbaikan & info SLA Tahun Berjalan.
UI Response -> Toast Notification muncul di kanan bawah staf peneliti.

[Event: Approve Akhir / Selesai Sempurna]
Status Berkas -> COMPLETED
Trigger API -> Fonnte kirim WhatsApp ke nomor pemohon menginfokan bahwa dokumen hasil pajak telah terbit dan dapat diambil.
UI Response -> Toast Notification sukses.
```
