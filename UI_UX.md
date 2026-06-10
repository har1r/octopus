# USER EXPERIENCE & INTERACTION DESIGN (UI_UX.md)

> **PERINGATAN KERAS UNTUK AI AGENT (ANTIGRAVITY):** > Fokus perbaiki **LAYOUT DAN CSS YANG BERANTAKAN** sesuai panduan ini tanpa merusak fungsionalitas komponen *React* dan alur data *Backend*. *State management* sudah benar, tolong buat tampilannya elegan, tidak tumpang tindih, dan memanjakan mata staf pajak.

---

## 1. ALUR PENGALAMAN PENGGUNA PER TAHAPAN

### Tahap 1 & 2: Formulir Penginputan & Penelitian
* **Conditional Rendering Form:** Formulir harus pintar. Saat `Jenis Pelayanan` dipilih via *dropdown*, field yang tidak relevan harus di-*hide* dengan transisi mulus, bukan lompatan layout yang kasar.
* **UI Mutasi Sebagian (Array Form):**
  * Data pecahan ditampilkan dalam bentuk **Card Abu-abu Lembut** (`bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4`).
  * Tombol `+ Tambah Pecahan Baru` diletakkan di bagian bawah *list* dengan gaya *Secondary Button* (bergaris putus-putus / *dashed border* untuk indikasi visual area yang bisa ditambah).
  * Tombol Hapus (Icon Trash warna Merah Muted) di sudut kanan atas setiap kartu pecahan.
* **Kertas Kerja Overlay:** *Floating container* atau *Split view* di sisi kanan layar bagi peneliti untuk melihat komparasi matematis *real-time*. Jika sisa luas minus, angka menjadi tebal dan merah.

### Tahap 3 & 4: Antrean Validasi & Bundling
* **Quick-Filter Tabs:** Menggunakan tab horizontal di atas tabel. Tab aktif bergaris bawah tebal warna Coral. Memastikan staf tidak mencampuradukkan jenis pelayanan.
* **Floating Action Bar (Bulk Select):** * Muncul melayang (*fixed bottom-8 left-1/2 transform -translate-x-1/2*) saat *checkbox* baris tabel dicentang.
  * Menampilkan *counter*: "X Berkas Terpilih (Maks 20)".
  * Jika $> 20$, *counter* berubah merah dan tombol "Buat Bundle" di-*disable*.
* **Interlocking Modal Alert:** Jika klik "Revisi" pada berkas terikat bundle, muncul *modal warning* tegas (Ikon ⚠️ besar) menghalangi aksi, dan menyediakan tombol merah "Keluarkan Berkas Dulu".

### Tahap 5: Dashboard Pengarsipan (Upload)
* **Split-Screen View:** Kiri untuk daftar bundle, Kanan (Lebar 60%) untuk detail isi bundle.
* **Micro-Dropzone per Baris:** * Di setiap baris nama wajib pajak pada tabel detail, terdapat area *dropzone* mini atau tombol "*Choose File*".
  * **Transisi Status (UX):** Saat file terpilih, badge `❌ Belum Ada` berubah menjadi *loading spinner* sesaat, lalu menjadi `✅ Terupload` (Hijau Lembut) beserta *icon* mata (Preview).
  * Tombol "Approve Bundle" di bawah tabel tetap keabu-abuan (*disabled*) hingga seluruh baris berstatus `✅`.

### Tahap 6: Manifest Pengiriman (Kanban)
* **Kanban Drag-and-Drop (Desktop):** Dua kolom berdampingan. Kiri: "Bundle Siap Kirim". Kanan: "Manifest Baru". Staf dapat menyeret kartu bundle.
* **Mobile Fallback:** Jika diakses via tablet/HP, matikan *drag-and-drop* dan munculkan tombol *dropdown* "Pindah ke Manifest" pada setiap kartu untuk menghindari *scrolling* yang bentrok dengan *touch event*.
* **Re-upload Alert Banner:** Jika terjadi *rollback*, munculkan pita kuning lebar (*banner alert*) menempel di bawah *header*: `⚠️ Isi manifes berubah. Silakan unggah ulang bukti manifes.`

### Tahap 7: Pemantauan & Finalisasi
* **Linear Progress Bar:** Di setiap kartu Bundle di halaman pemantauan, ada bar tipis panjang penuh. Lebar warna Coral bertambah progresif (misal: 4/10 berkas selesai = 40% width).
* **Inline Toggle Switch:** Staf tidak perlu membuka form edit. Sediakan tombol *switch/toggle* mirip iOS (abu-abu = PROSES, hijau = SELESAI) langsung di samping nama wajib pajak.

---

## 2. HALAMAN STATISTIK (SUPERVISOR HUB)

* **Top Metric Cards:** 4 kartu besar berjajar. Gunakan *font-weight* `bold` dan ukuran teks super besar (`text-4xl`) untuk angka agar mudah terbaca dalam sekejap.
* **Bottleneck Detector:** Tabel dengan penanda visual kuat. Jika waktu di suatu tahapan melebihi SLA internal, tambahkan *Badge* merah `⚠️ Menumpuk` dengan animasi denyut pelan (`animate-pulse`) pada indikator ikonnya untuk menarik perhatian.

---

## 3. PUBLIC TRACKING PORTAL (LACAK BERKAS)

* **Public Stepper UI:** Gunakan garis linear horizontal atau vertikal (untuk mobile).
  * Status yang sudah lewat: Lingkaran Hijau, teks abu-abu.
  * Status saat ini: Lingkaran Coral (aktif), teks Charcoal tebal.
  * Status yang belum dilewati: Lingkaran Abu-abu garis luar, teks pudar.
* **Revision Alert Card:** Jika status `REVISION`, tampilkan kotak oranye tebal berisikan catatan staf (alasan revisi) dan *countdown timer* waktu SLA tahun berjalan dalam huruf merah.

---

## 4. FEEDBACK & NOTIFICATION UX

* **Toast Notifications:** Setiap kali ada interaksi dengan backend (Simpan, Ubah Status, Hapus, Kirim WA via Fonnte API), **wajib** memunculkan *Toast* di pojok kanan bawah.
  * Sukses: Kotak bergaris hijau pinggir kiri.
  * Error/Gagal: Kotak bergaris merah pinggir kiri, menampilkan pesan *error* asli dari backend/Zod.
* Hindari penggunaan *alert()* bawaan browser.
