# FRONTEND ARCHITECTURE & DESIGN SYSTEM (DESIGN.md)

> **PERINGATAN KERAS UNTUK AI AGENT (ANTIGRAVITY):** > Fungsionalitas aplikasi (Logika, API, Database) **sudah berjalan dengan sangat baik**. Masalah utama yang harus Anda perbaiki dan patuhi di sini adalah **LAYOUT DAN TAILWIND CSS YANG BERANTAKAN**. Dokumen ini adalah panduan arsitektur frontend. Anda dilarang keras mengubah fungsi logika saat sedang merapikan layout. Pastikan struktur komponen rapi, margin/padding konsisten, dan desain responsif berjalan mulus tanpa merusak *state* atau fungsi *submit*.

---

## 1. PENDEKATAN STYLING (TAILWIND CSS STRICT RULES)

Aplikasi Architax menggunakan **Tailwind CSS** secara eksklusif. Dilarang menggunakan *inline styles* (`style={{...}}`) kecuali untuk kalkulasi dinamis yang mutlak diperlukan (misal: *progress bar width*).

### 1.1. Aturan Penulisan Kelas (Class Rules)
* Gunakan utilitas standar Tailwind. Hindari pembuatan *custom CSS* di file global kecuali untuk `@apply` pada komponen dasar yang sangat sering diulang.
* Jaga konsistensi *spacing*. Gunakan skala 4 poin Tailwind (misal: `p-4`, `m-6`, `gap-8`). Jangan mencampuradukkan skala arbitrer (seperti `p-[17px]`).
* Gunakan ekstensi seperti `tailwind-merge` dan `clsx` (atau komponen `cn` buatan) untuk menggabungkan kelas CSS dinamis agar terhindar dari konflik *style*.

### 1.2. Palet Warna Utama (Sesuai Konsep Airbnb-Inspired)
Wajib dikonfigurasi pada `tailwind.config.ts`:
* **Background Utama:** `bg-white` (`#FFFFFF`) untuk kanvas form/tabel.
* **Background Dasar/Aplikasi:** `bg-gray-50` / `#F7F7F7` agar mata staf tidak cepat lelah.
* **Teks Utama:** `text-gray-900` (`#222222` / Dark Charcoal) untuk *readability*.
* **Teks Sekunder/Label:** `text-gray-500` untuk label input dan meta teks.
* **Aksen Utama (Primary Action):** `bg-[#FF385C]` (Rausch Coral). Gunakan utilitas `hover:bg-[#E31C5F]` untuk efek interaksi.

### 1.3. Warna Status & State (Semantic Colors)
* **Sukses/Completed:** `text-emerald-500` / `bg-emerald-100` (`#10B981`).
* **Peringatan/Revisi:** `text-amber-500` / `bg-amber-100` (`#F59E0B`).
* **Bahaya/Ditolak/Hapus:** `text-red-500` / `bg-red-100` (`#EF4444`).
* **Proses Netral:** `text-slate-600` / `bg-slate-100` (`#4A5568`).
* **Border & Garis Pemisah:** `border-gray-200` (`#DDDDDD`) yang tipis (`border`, bukan `border-2`).

---

## 2. KOMPONEN UI GLOBAL (ATOMIC DESIGN)

### 2.1. Form Inputs & Masking
* **Input Text/Number:** Desain bersih, border abu-abu tipis, *rounded-md* (`rounded-lg`), *focus ring* warna Coral tipis (`focus:ring-1 focus:ring-[#FF385C] focus:border-[#FF385C]`).
* **Masking NOP:** Input wajib terintegrasi dengan *library masking* (seperti `react-input-mask` atau sejenisnya) untuk pola `XX.XX.XXX.XXX.XXX-XXXX.X`. Tampilan tidak boleh rusak saat divalidasi.
* **Error State:** Jika validasi Zod gagal, border menjadi merah (`border-red-500`) dan pesan galat muncul di bawah input dengan teks merah kecil (`text-sm text-red-500`).

### 2.2. Buttons (Tombol)
* **Primary Button:** Latar Coral, teks putih, *font-medium*, *rounded-md*, *shadow-sm*.
* **Secondary/Ghost Button:** Latar transparan, teks Charcoal, border abu-abu tipis, *hover* abu-abu terang (`hover:bg-gray-100`).
* **Danger Button:** Latar Merah Muted, untuk aksi *destructive* seperti "Keluarkan dari Bundle".
* **Disabled State:** Wajib memiliki `opacity-50` dan `cursor-not-allowed`.

### 2.3. Modal & Overlay
* **Backdrop:** Abu-abu transparan dengan efek *blur* ringan (`bg-gray-900/50 backdrop-blur-sm`).
* **Container:** Putih murni, *rounded-xl*, bayangan lembut (`shadow-xl`), wajib di tengah layar (menggunakan Flexbox/Grid *centering*).
* **Z-Index:** Pastikan tidak ada konflik z-index antara *sidebar*, *header*, dan *modal*.

---

## 3. STRUKTUR LAYOUT HALAMAN (PAGE LAYOUTS)

### 3.1. Dashboard Internal Staf
Memanfaatkan `app/layout.tsx` (Next.js App Router).
* **Sidebar Kiri (Persistent):** Lebar statis (misal `w-64` pada desktop). *Hidden* pada mobile (diganti *hamburger menu*). Berisi navigasi *role-based*. Efek menu aktif menggunakan *rounded corners* dan latar belakang aksen sangat tipis.
* **Main Content Area:** Mengisi sisa layar (`flex-1`). Memiliki *padding* seragam (`p-4 md:p-6 lg:p-8`). Memiliki *header* atas berisi nama *user* / avatar dan *breadcrumb*.

### 3.2. Public Tracking Portal (Unauthenticated)
* **Tata Letak:** Minimalis, terpusat (*centered layout*). Tidak ada *sidebar*.
* **Hero Section:** *Container* besar di tengah layar untuk *input pencarian* ganda (No Pelayanan & NOP).
* **Background:** Putih bersih atau *subtle gradient* yang tidak mendistraksi.

---

## 4. RESPONSIVENESS & MOBILE ADAPTATION

Aplikasi WAJIB menggunakan pendekatan **Mobile-First**.
* **Breakpoint Tailwind Utama:** `md` (`768px`) dan `lg` (`1024px`).
* **Formulir:** *Single column* (`flex-col`) pada ukuran layar standar, otomatis berubah menjadi grid (*multi-column*, misal `md:grid md:grid-cols-2`) pada `md` ke atas.
* **Tabel Data:** Tabel penuh (HTML `<table>`) pada desktop. Pada mobile (`< 768px`), tabel wajib disembunyikan dan diganti dengan desain **Card List** (menggunakan *mapping* array yang sama ke komponen kartu vertikal) agar tidak terjadi *horizontal scrolling* yang berantakan.
