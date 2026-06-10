# FULL IMPLEMENTATION PLAN (IMPLEMENTATION_PLAN.md)

> **Path Arsip:** `C:\Users\Pavilion\Desktop\archivtax\IMPLEMENTATION_PLAN.md`
> **Konteks:** Dokumen ini adalah peta jalan (*roadmap*) absolut untuk membangun Architax dari titik nol (proyek kosong) hingga menjadi aplikasi *production-ready*. Implementasi dibagi ke dalam 7 fase berurutan yang mencakup *Backend*, *Frontend*, hingga *Deployment*.

## PHASE 1: INISIALISASI PROYEK & INFRASTRUKTUR DASAR
* **Objektif:** Membangun fondasi *tech stack* (Next.js 15, TypeScript, Tailwind, Prisma) dan mengatur struktur direktori kerja.
* **Langkah:**
  1. Buat proyek Next.js 15 menggunakan App Router (`npx create-next-app@latest`).
  2. Inisialisasi Prisma ORM (`npx prisma init`) dan hubungkan ke *cluster* MongoDB Atlas via `DATABASE_URL`.
  3. Konfigurasi `tailwind.config.ts` untuk menerapkan palet warna Airbnb-Inspired (Rausch Coral `#FF385C`, Emerald `#10B981`) sesuai `DESIGN.md`.
  4. Siapkan struktur *folder* modular (contoh: `/app`, `/components`, `/lib/prisma`, `/hooks`, `/types`).

## PHASE 2: DATA LAYER & STATE MACHINE (BACKEND TAHAP 1)
* **Objektif:** Menerjemahkan spesifikasi `DATABASE.md` ke dalam skema fisik dan memastikan konektivitas database stabil.
* **Langkah:**
  1. Tulis seluruh model (`User`, `Permohonan`, `Bundle`, `Manifest`, `SequenceCounter`, `AuditLog`) di `schema.prisma`.
  2. Jalankan `npx prisma generate` dan `npx prisma db push` ke MongoDB.
  3. Buat *seeder* script awal untuk memasukkan data `SequenceCounter` (dimulai dari angka 1) dan akun `SUPERVISOR` *default*.
  4. Siapkan *utility function* sentral untuk mencatat `AuditLog` agar bisa dipanggil ulang oleh semua *endpoint*.

## PHASE 3: CORE API & AUTENTIKASI (BACKEND TAHAP 2)
* **Objektif:** Membangun *Route Handlers* sesuai `API.md` dan mengamankan aplikasi dengan kontrol akses (RBAC).
* **Langkah:**
  1. Implementasi sistem autentikasi (JWT/NextAuth) dan *Middleware* untuk memproteksi *route* internal.
  2. Buat *endpoint* CRUD dasar: `POST /permohonan`, `GET /permohonan`.
  3. Buat *endpoint* Bundling dengan logika *interlocking*: `POST /bundles`, `PUT /bundles/:id/lock`, `PUT /bundles/:id/remove-item`.
  4. Integrasikan *webhook* Fonnte API untuk notifikasi WhatsApp yang dipicu saat ada perubahan status.

## PHASE 4: GLOBAL UI/UX & APP SHELL (FRONTEND TAHAP 1)
* **Objektif:** Membangun kerangka tata letak yang rapi, responsif, dan konsisten sebelum memasukkan data dinamis.
* **Langkah:**
  1. Buat *Persistent Sidebar* berbasis *Role* dan *Header* (App Shell) di `app/layout.tsx`.
  2. Bangun komponen atomik yang dapat digunakan ulang (*Reusable Components*): `TextInput`, `Button`, `Badge`, `ToastNotification`, dan `ModalBackdrop`.
  3. Pastikan implementasi desain *Mobile-First* berjalan mulus (Sidebar menjadi *hamburger menu* di layar `< 768px`).

## PHASE 5: WORKFLOW IMPLEMENTATION (TAHAP 1 - 4)
* **Objektif:** Menyelesaikan antarmuka interaktif untuk penginputan, validasi, dan pengelompokkan berkas.
* **Langkah:**
  1. **Form Input (Tahap 1):** Hubungkan form ke `react-hook-form` & `zod`. Integrasikan `react-input-mask` untuk NOP.
  2. **Mutasi Sebagian:** Implementasi *Array Form* dinamis (`useFieldArray`) dengan tampilan struktur *Cards* abu-abu.
  3. **Kertas Kerja:** Bangun *overlay* komparasi dengan logika *computed fields* (cegah sisa tanah minus).
  4. **Bundling (Tahap 3-4):** Buat tabel antrean dengan *Quick-Filter Tabs* dan *Floating Action Bar* (maksimal 20 item).

## PHASE 6: UPLOADS & ADVANCED FEATURES (TAHAP 5 - 7)
* **Objektif:** Menyelesaikan alur lampiran dokumen, Kanban *drag-and-drop*, dan pemantauan akhir.
* **Langkah:**
  1. **Arsip (Tahap 5):** Buat UI *Split-Screen* dan integrasikan *Micro-Dropzone* multi-upload ke AWS S3 / GridFS.
  2. **Manifest (Tahap 6):** Implementasi papan *Kanban* untuk *drag-and-drop* bundle ke manifest pengiriman.
  3. **Dashboard (Tahap 7):** Buat *Linear Progress Bar* untuk pelacakan per berkas dan halaman *Portal Lacak Publik* tanpa login.

## PHASE 7: QA, SECURITY & DEPLOYMENT
* **Objektif:** Menguji sistem secara menyeluruh dan meluncurkan aplikasi ke lingkungan *production*.
* **Langkah:**
  1. Siapkan *Cron Job* (misal via Vercel Cron) untuk mengeksekusi `REJECTED_PERMANENT` pada data yang melebihi SLA tahun kalender.
  2. Implementasi *Rate Limiting* (`@upstash/ratelimit`) pada *Public API Tracking*.
  3. Lakukan QA: Uji *rollback* (`RE_EXAMINE`), uji *interlocking modal*, dan uji responsivitas layout.
  4. *Deploy* ke *hosting platform* (Vercel/VPS) dan konfigurasi *Environment Variables*.