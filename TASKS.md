# TASK TRACKER (TASKS.md)

> **Path Arsip:** `C:\Users\Pavilion\Desktop\archivtax\TASKS.md`
> **Konteks:** Daftar periksa komprehensif dari awal hingga akhir. Beri tanda `[x]` untuk melacak progres pengembangan.

## 🏗️ FASE 1: SETUP & INFRASTRUKTUR
- [x] Inisialisasi Next.js 15 (App Router) & TypeScript.
- [x] Inisialisasi Prisma & hubungkan ke MongoDB Atlas.
- [x] Konfigurasi `tailwind.config.ts` (Palet warna Airbnb: Coral `#FF385C`, dll).
- [x] Siapkan struktur folder (components, lib, hooks, app/api).

## 🗄️ FASE 2: DATABASE LAYER
- [x] Definisikan `enum` (Role, JenisPelayanan, Status) di `schema.prisma`.
- [x] Definisikan *Embedded Types* (`Attachment`, `DataPecahan`).
- [x] Definisikan model utama (`User`, `Permohonan`, `Bundle`, `Manifest`).
- [x] Definisikan model utilitas (`SequenceCounter`, `AuditLog`).
- [x] Push skema ke database dan jalankan *seeder* awal.

## 🔌 FASE 3: BACKEND API & SECURITY
- [x] Setup Auth Middleware & enkripsi *password* (bcrypt).
- [x] Buat API CRUD dasar (`POST` / `GET` Permohonan).
- [x] Buat API Bundling & Lock (`POST /bundles`, `PUT /bundles/:id/lock`).
- [x] Buat API Eksepsi/Rollback (`PUT /permohonan/:id/status`, `remove-item`).
- [x] Buat *endpoint* Upload (Scan Arsip & Manifest).
- [x] Integrasikan *webhook* WhatsApp via Fonnte API.

## 🎨 FASE 4: UI/UX DASAR & APP SHELL
- [x] Bangun komponen *Button* & *Input* standar sesuai panduan `DESIGN.md`.
- [x] Bangun tata letak global (Sidebar, Header, Kontainer Utama).
- [x] Pastikan navigasi menyusut menjadi *hamburger menu* di *mobile*.
- [x] Buat *Global Toast Notification System* (Sukses/Error).

## 📝 FASE 5: FORMULIR & BUNDLING (TAHAP 1-4)
- [x] Hubungkan Form Tahap 1 dengan Zod & *React Hook Form*.
- [x] Implementasi *masking* 18 digit untuk kolom NOP.
- [x] Bangun *Card UI* dinamis untuk array `dataPecahan` (Mutasi Sebagian).
- [x] Bangun Kertas Kerja (Matematika *Computed Fields* & validasi sisa tanah).
- [x] Bangun tabel antrean dengan *Floating Action Bar* (Bulk select maks 20).
- [x] Implementasi *Interlocking Modal* (Peringatan saat revisi data ter-bundle).

## 📁 FASE 6: UPLOAD, KANBAN & DASHBOARD (TAHAP 5-7)
- [x] Bangun *Split-Screen View* untuk fitur pengarsipan.
- [x] Hubungkan *Micro-Dropzone* agar bisa *upload* PDF per baris data.
- [x] Bangun fitur *Kanban Drag-and-Drop* untuk memindahkan Bundle ke Manifest.
- [x] Buat *Dashboard Supervisor* (Metric Cards, Line/Bar Charts).
- [x] Buat Portal Lacak Publik dengan pembatasan data (*Data Masking*).

## 🚀 FASE 7: FINALISASI & DEPLOYMENT
- [x] Setup *Cron Job* SLA untuk transisi otomatis ke `REJECTED_PERMANENT`.
- [x] Terapkan *Rate Limiter* di *endpoint* Publik.
- [x] Uji coba *End-to-End* (Mulai dari *Input* sampai status *Completed*).
- [x] Validasi *Read-Only strictness* pada tabel Audit Log.
- [x] *Deployment* ke *Production*.