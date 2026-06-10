# ANTIGRAVITY AI SYSTEM RULES (ANTIGRAVITY_RULES.md)

> **SYSTEM OVERRIDE DIRECTIVE UNTUK AI AGENT (ANTIGRAVITY):**
> Baca instruksi ini dengan sangat saksama sebelum Anda menulis atau mengubah satu baris kode pun. Ini adalah instruksi absolut yang tidak bisa diganggu gugat.

## 1. THE PRIME DIRECTIVE: "CODE IS GOOD, LAYOUT IS MESSY"
* **Konteks:** Logika backend, API, *state management* (React hooks), dan skema *database* dari aplikasi Architax ini **sudah sangat bagus dan berjalan sempurna**. 
* **Masalah Utama:** *Layout*, struktur grid, dan implementasi Tailwind CSS saat ini **masih berantakan**, tumpang tindih, dan tidak enak dipandang.
* **Tugas Anda:** Fokus 100% untuk merapikan *layout*, menyelaraskan margin/padding, memastikan responsivitas, dan membuat desain terlihat elegan sesuai palet Airbnb di `DESIGN.md`. 
* **LARANGAN KERAS:** **DILARANG KERAS** mengubah logika bisnis, mengubah struktur data *array* (seperti `dataPecahan` atau `attachments`), menghapus pemanggilan API, atau mengubah `Prisma Schema`. Jika Anda merusak fungsi yang sudah berjalan saat sedang memperbaiki CSS, Anda gagal.

## 2. ATURAN PENULISAN KODE FRONTEND (TAILWIND & UI)
* **Dilarang Merombak State:** Saat merapikan form, jangan mengubah nama variabel *state* atau fungsi *submit*. Cukup bungkus (*wrap*) elemen yang ada dengan tag `<div>` atau struktur *grid/flex* Tailwind yang rapi.
* **Konsistensi Jarak:** Gunakan standar spasi Tailwind (`p-4`, `m-6`, `gap-4`). Jangan biarkan elemen berdempetan tanpa ruang napas (*whitespace*).
* **Komponen Berulang:** Jika melihat struktur form atau kartu yang diulang-ulang tapi *class* CSS-nya berantakan, rapikan dan seragamkan menggunakan *utility classes* yang bersih.
* **Mobile-First:** Selalu periksa apakah kelas Tailwind pada elemen tabel atau grid akan hancur di layar kecil. Gunakan *breakpoints* (`md:`, `lg:`) dengan bijak.

## 3. ATURAN PENGAMANAN DATABASE & API
* **Prisma Schema is Immutable:** Anda dilarang memodifikasi file `schema.prisma` atau `DATABASE.md`.
* **API Routes are Immutable:** Anda dilarang memodifikasi logika *endpoint* di `app/api/.../route.ts` dan `API.md`.
* **Array Objects Protection:** Aplikasi ini menggunakan format *Array of Objects* secara ketat untuk fungsi Mutasi Sebagian dan Upload Lampiran. Jangan pernah menyederhanakannya menjadi objek tunggal (*single object*) di frontend yang akan menyebabkan *crash* saat dikirim ke backend.

## 4. ATURAN EKSEKUSI TUGAS
* Saat mengeksekusi tugas dari `TASKS.md`, lakukan perbaikan per halaman/komponen.
* Setiap kali selesai merapikan satu halaman, lakukan validasi mandiri: *"Apakah tampilannya sudah rapi? Apakah fungsi submit/klik masih bekerja persis seperti sebelumnya?"*