# API ROUTE SPECIFICATION (API.md)

> **Catatan untuk AI Agent (Antigravity):** Dokumen ini mendefinisikan standar *Route Handlers* menggunakan **Next.js 15 (App Router)** (`app/api/.../route.ts`). Patuhi struktur *request/response* (JSON), status HTTP, dan lapis keamanan (RBAC & Rate Limiting). Dilarang keras membuat endpoint untuk mengubah/menghapus koleksi `AuditLog`. Pastikan Anda tidak merusak rute ini saat mengkonfigurasi atau memperbaiki tampilan antarmuka (Tailwind CSS/UI).

---

## 1. KONVENSI STANDAR & KEAMANAN (GLOBAL STANDARDS)

* **Base Path:** `/api/v1/...`
* **Format Request/Response:** `application/json` (kecuali endpoint upload yang menggunakan `multipart/form-data`).
* **Autentikasi:** Endpoint internal wajib dilindungi oleh *Middleware* Next.js yang memvalidasi *Session Token* / JWT (melalui HTTP-only cookies).
* **Standar HTTP Status Codes:**
  * `200 OK` (Berhasil ambil/update data)
  * `201 Created` (Berhasil membuat data baru)
  * `400 Bad Request` (Galat validasi payload, ex: Zod Validation Error)
  * `401 Unauthorized` (Sesi tidak valid/kadaluwarsa)
  * `403 Forbidden` (Role tidak memiliki izin/RBAC diblokir)
  * `404 Not Found` (Data tidak ditemukan)
  * `429 Too Many Requests` (Terkena Rate Limiting, terutama public API)
  * `500 Internal Server Error` (Galat server/database)

---

## 2. API ENDPOINTS: AUTENTIKASI & USER

### `POST /api/v1/auth/login`
* **Deskripsi:** Autentikasi staf dan pembuatan session token.
* **Akses:** Publik (Rate limited).
* **Payload:** `{ "username": "...", "password": "..." }`
* **Response `200`:** Mengeset HTTP-only cookie dan mengembalikan profil *user* (tanpa *password hash*).

### `POST /api/v1/auth/logout`
* **Deskripsi:** Menghapus sesi kredensial.
* **Akses:** *Authenticated*.

---

## 3. API ENDPOINTS: PERMOHONAN (INPUT & VALIDASI)

### `POST /api/v1/permohonan`
* **Deskripsi:** Menyimpan data permohonan baru dari `STAF_PENGINPUT` / form publik.
* **Akses:** `STAF_PENGINPUT`, Publik.
* **Payload:** Objek JSON menyesuaikan `JenisPelayanan`. Wajib tervalidasi skema Zod (termasuk *masking* 18 digit NOP). Khusus `Mutasi Sebagian`, payload wajib menyertakan array `dataPecahan`.
* **Response `201`:** `{ "message": "Success", "data": { "nomorBerkas": "...", "status": "SUBMITTED" } }`

### `GET /api/v1/permohonan`
* **Deskripsi:** Mengambil daftar antrean permohonan. Mendukung *query params* (status, jenisPelayanan, limit, page).
* **Akses:** `STAF_PENELITI`, `STAF_PENGARSIP`, `STAF_PENGIRIM`, `STAF_PEMANTAU`, `SUPERVISOR`.

### `PUT /api/v1/permohonan/:id/status`
* **Deskripsi:** Mengubah status tunggal (khusus untuk eksekusi `REVISION` atau `REJECTED`).
* **Akses:** `STAF_PENELITI`.
* **Validasi Mutlak:** Menolak *request* (`400 Bad Request`) jika `bundleId` pada permohonan tersebut tidak `null` (Interlocking Rule).
* **Payload:** `{ "status": "REVISION", "catatanRevisi": "..." }`
* **Side-Effect:** Mencatat ke `AuditLog`. Memicu *webhook* Fonnte API untuk notifikasi WhatsApp pemohon.

---

## 4. API ENDPOINTS: BUNDLING (PENGELOMPOKKAN)

### `POST /api/v1/bundles`
* **Deskripsi:** Membuat bundle baru dari permohonan yang berstatus `SUBMITTED`.
* **Akses:** `STAF_PENELITI`.
* **Payload:** `{ "permohonanIds": ["id1", "id2"], "jenisPelayanan": "..." }`
* **Validasi:** Maksimal 20 ID. Seluruh ID harus memiliki `jenisPelayanan` yang seragam.
* **Response `201`:** Menghasilkan `nomorBundle` dan merubah status semua permohonan ke `DRAFT_BUNDLE`.

### `POST /api/v1/bundles/:id/lock`
* **Deskripsi:** Mengunci bundle, men-*generate* Surat Pengantar, dan mengubah status ke `READY_TO_ARCHIVE`.
* **Akses:** `STAF_PENELITI`.
* **Side-Effect:** Memanggil *Sequence Counter* untuk nomor surat. Khusus `Mutasi Habis`, men-*generate* `noTanah` & `noBangunan`.

### `PUT /api/v1/bundles/:id/remove-item`
* **Deskripsi:** Mengeluarkan 1 data permohonan dari bundle.
* **Akses:** `STAF_PENELITI`.
* **Payload:** `{ "permohonanId": "id1" }`
* **Side-Effect:** Set `bundleId = null` pada tabel Permohonan. *Auto-update* jumlah di Surat Pengantar. Mencatat ke `AuditLog`.

---

## 5. API ENDPOINTS: PENGARSIPAN & PENGIRIMAN (UPLOAD)

### `POST /api/v1/upload/scan/:permohonanId`
* **Deskripsi:** Mengunggah file PDF arsip per individu (Tahap 5).
* **Akses:** `STAF_PENGARSIP`.
* **Content-Type:** `multipart/form-data`.
* **Validasi:** File `.pdf`, Maks `5MB`.
* **Response `201`:** URL file yang tersimpan. Backend menambahkan entri objek ke *array* `attachments` di tabel Permohonan.

### `PUT /api/v1/bundles/:id/approve-archive`
* **Deskripsi:** Menyetujui bundle yang sudah di-scan 100%. Status -> `READY_TO_SHIP`.
* **Akses:** `STAF_PENGARSIP`.
* **Validasi:** Backend menolak (`400`) jika masih ada permohonan dalam bundle yang `attachments`-nya kosong.

### `POST /api/v1/manifests`
* **Deskripsi:** Membuat manifest dari beberapa ID Bundle (Tahap 6).
* **Akses:** `STAF_PENGIRIM`.

### `POST /api/v1/upload/manifest/:manifestId`
* **Deskripsi:** Mengunggah bukti fisik manifest bertanda tangan.
* **Akses:** `STAF_PENGIRIM`.
* **Validasi:** `.jpg`/`.png`, Maks `5MB`. Menghapus file lama jika *rollback* terjadi. Update status bundle -> `SENT_TO_CENTER`.

---

## 6. API ENDPOINTS: TRACKING & PENYELESAIAN TAHAP AKHIR

### `PUT /api/v1/permohonan/:id/complete`
* **Deskripsi:** Menggeser status 1 permohonan menjadi `COMPLETED` (Pencatatan Parsial oleh Pemantau).
* **Akses:** `STAF_PEMANTAU`.

### `PUT /api/v1/bundles/:id/finalize`
* **Deskripsi:** Tombol Emas "Arsip Permanen". Menyetujui finalisasi bundle.
* **Akses:** `STAF_PEMANTAU`.
* **Validasi:** Ditolak jika progres isi bundle belum 100% `COMPLETED`.

### `GET /api/v1/public/tracking`
* **Deskripsi:** Portal lacak masyarakat (Tanpa Login).
* **Akses:** Publik (Wajib *Rate Limiting* ekstrim: misal 10 *request* / menit / IP via `@upstash/ratelimit`).
* **Query Params:** `?nop=...&nomorPelayanan=...`
* **Validasi (Data Masking):** Backend **wajib** memotong/mem-filter atribut `namaPemilik`, `jalan`, dan `attachments` sebelum mengirim JSON ke *frontend*. Hanya mengembalikan metadata dasar dan status sistem.

---

## 7. API ENDPOINTS: DASHBOARD & AUDIT LOG

### `GET /api/v1/dashboard/stats`
* **Deskripsi:** Agregasi data analitik untuk Top Metric Cards (Supervisor).
* **Akses:** `SUPERVISOR`.

### `GET /api/v1/audit-logs`
* **Deskripsi:** Menarik jejak digital. Hanya menyediakan *method* GET. Mendukung paginasi.
* **Akses:** `SUPERVISOR`, `STAF_PENELITI`.
* **Catatan Kritis:** DILARANG membuat endpoint `POST`, `PUT`, `PATCH`, atau `DELETE` untuk rute ini.
