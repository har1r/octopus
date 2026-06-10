# DATABASE SCHEMA SPECIFICATION (DATABASE.md)

> **Catatan untuk AI Agent (Antigravity):** Dokumen ini adalah spesifikasi mutlak untuk lapisan data (*Data Layer*) menggunakan **Prisma ORM (v5+)** dengan target **MongoDB Atlas**. Pastikan seluruh model, tipe komposit (*Composite Types*), indeks, dan relasi diimplementasikan tepat seperti skema di bawah ini. Saat melakukan penyesuaian atau perbaikan visual pada komponen UI layout/Tailwind CSS, **jangan pernah mengubah struktur skema database atau menghapus field yang diperlukan oleh logika bisnis**.

---

## 1. KONFIGURASI DATABASE & PRISMA CLIENT

Skema database dirancang khusus menggunakan fitur dokumen bersarang (*embedded documents*) MongoDB melalui kata kunci `type` pada Prisma untuk menangani data struktural seperti riwayat lampiran berupa **Array of Objects** dan data dinamis pecahan.

```prisma
datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}
```

---

## 2. DEFINISI ENUMERASI (ENUMERATIONS)

```prisma
enum Role {
  STAF_PENGINPUT
  STAF_PENELITI
  STAF_PENGARSIP
  STAF_PENGIRIM
  STAF_PEMANTAU
  SUPERVISOR
}

enum JenisPelayanan {
  OBJEK_PAJAK_BARU
  MUTASI_SEBAGIAN
  MUTASI_HABIS_UPDATE
  MUTASI_HABIS_REGULER
  PEMBETULAN
  PENGAKTIFAN
}

enum StatusPermohonan {
  SUBMITTED
  REVISION
  REJECTED
  REJECTED_PERMANENT
  DRAFT_BUNDLE
  READY_TO_ARCHIVE
  READY_TO_SHIP
  SENT_TO_CENTER
  COMPLETED
}

enum StatusBundle {
  DRAFT_BUNDLE
  READY_TO_ARCHIVE
  RE_EXAMINE
  READY_TO_SHIP
  SENT_TO_CENTER
  COMPLETED
}
```

---

## 3. TIPE KOMPOSIT / EMBEDDED TYPES (MONGODB SPECIFIC)

### 3.1. Tipe Lampiran Berkas (Array of Objects Requirement)
Sesuai aturan bisnis, file lampiran wajib disimpan dalam skema *array of objects* di dalam dokumen permohonan induk.

```prisma
type Attachment {
  fileUrl    String
  fileType   String   // Contoh: "SCAN_PERMOHONAN", "BUKTI_MANIFEST"
  fileSize   Int      // Ukuran dalam Bytes untuk validasi DoS
  uploadedAt DateTime @default(now())
}
```

### 3.2. Tipe Data Pecahan (Untuk Pelayanan Mutasi Sebagian)
Digunakan sebagai array dinamis pada formulir sub-form detail mutasi sebagian.

```prisma
type DataPecahan {
  namaPemilikBaru      String
  jalanPemilikBaru     String
  blokPemilikBaru      String
  rtPemilikBaru        String
  rwPemilikBaru        String
  kecamatanPemilikBaru String
  kelurahanPemilikBaru String
  
  jalanObjekBaru       String
  blokObjekBaru        String
  rtObjekBaru          String
  rwObjekBaru          String
  kecamatanObjekBaru   String
  kelurahanObjekBaru   String
  luasTanahBaru        Float
  luasBangunanBaru     Float
  buktiKepemilikan     String
}
```

---

## 4. MODEL DATA UTAMA (PRISMA MODELS)

### 4.1. Model User & Autentikasi
```prisma
model User {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  username  String   @unique
  password  String   // Wajib di-hash menggunakan bcrypt/Argon2id di tingkat server
  namaStaf  String
  role      Role
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}
```

### 4.2. Model Permohonan (Data Utama Form)
```prisma
model Permohonan {
  id             String           @id @default(auto()) @map("_id") @db.ObjectId
  nomorBerkas    String           @unique // Auto-generated string unik oleh sistem
  jenisPelayanan JenisPelayanan
  nomorPelayan   String?          // null/hidden jika jenis pelayanan PENGAKTIFAN
  nop            String           // Masking format 18 digit di frontend

  // Data Pemilik Lama (Subjek Pajak Eksisting)
  namaPemilikLama      String?
  jalanPemilikLama     String?
  blokPemilikLama      String?
  rtPemilikLama        String?
  rwPemilikLama        String?
  kecamatanPemilikLama String?
  kelurahanPemilikLama String?

  // Data Objek Pajak Lama (Eksisting)
  jalanObjekLama       String?
  blokObjekLama        String?
  rtObjekLama          String?
  rwObjekLama          String?
  kecamatanObjekLama   String?
  kelurahanObjekLama   String?
  luasTanahLama        Float?
  luasBangunanLama     Float?

  // Data Objek Baru Tunggal (Untuk pelayanan non-Mutasi Sebagian)
  namaPemilikBaru      String?
  jalanPemilikBaru     String?
  blokPemilikBaru      String?
  rtPemilikBaru        String?
  rwPemilikBaru        String?
  kecamatanPemilikBaru String?
  kelurahanPemilikBaru String?
  jalanObjekBaru       String?
  blokObjekBaru        String?
  rtObjekBaru          String?
  rwObjekBaru          String?
  kecamatanObjekBaru   String?
  kelurahanObjekBaru   String?
  luasTanahBaru        Float?
  luasBangunanBaru     Float?
  buktiKepemilikan     String?

  // Array Objek Pecahan Dinamis (Khusus Jenis Pelayanan MUTASI_SEBAGIAN)
  dataPecahan          DataPecahan[]

  // Array Lampiran Berkas Digital (Tahap 5) - Array of Objects
  attachments          Attachment[]

  // Relasi & Status Workflow
  status               StatusPermohonan @default(SUBMITTED)
  catatanRevisi        String?          // Berisi detail error dari STAF_PENELITI / PENGARSIP
  slaSisaWaktu         DateTime?        // Diperhitungkan hingga akhir tahun berjalan

  // Relasi Ke Bundle (Optional, Terikat saat Tahap Bundling)
  bundleId             String?          @db.ObjectId
  bundle               Bundle?          @relation(fields: [bundleId], references: [id])

  createdAt            DateTime         @default(now())
  updatedAt            DateTime         @updatedAt

  // Strategi Indexing Penting MongoDB Atlas
  @@index([nop])
  @@index([status])
  @@index([nomorBerkas])
  @@map("permohonan")
}
```

### 4.3. Model Bundle
```prisma
model Bundle {
  id                 String           @id @default(auto()) @map("_id") @db.ObjectId
  nomorBundle        Int              // Didapat dari Global Sequence Counter Tahunan
  nomorSuratPengantar Int             // Didapat dari Global Sequence Counter Tahunan
  tahunKalender      Int              // Untuk keperluan validasi reset counter
  jenisPelayanan     JenisPelayanan   // Aturan Homogenitas: 1 Bundle = 1 Jenis Pelayanan
  status             StatusBundle     @default(DRAFT_BUNDLE)
  
  // Fitur Penomoran Khusus Surat Pengantar Mutasi Habis Update (Kondisional)
  noTanahCounter     Int?             
  noBangunanCounter  Int?             

  // Relasi Relasional
  daftarPermohonan   Permohonan[]     // Relasi satu-ke-banyak (Maksimal 20 data permohonan)
  
  // Relasi Ke Manifest Pengiriman (Optional)
  manifestId         String?          @db.ObjectId
  manifest           Manifest?        @relation(fields: [manifestId], references: [id])

  createdAt          DateTime         @default(now())
  updatedAt          DateTime         @updatedAt

  @@index([status])
  @@map("bundles")
}
```

### 4.4. Model Manifest Pengiriman
```prisma
model Manifest {
  id                 String       @id @default(auto()) @map("_id") @db.ObjectId
  nomorManifest      Int          // Didapat dari Global Sequence Counter Tahunan
  tahunKalender      Int
  isApproved         Boolean      @default(false)
  
  // File Scan Bukti Tanda Terima Manifest (Hanya diunggah di Tahap 6)
  buktiManifestScan  Attachment[] // Disimpan dalam skema array objek terpadu
  
  // Relasi ke kelompok Bundle final
  daftarBundle       Bundle[]

  createdAt          DateTime     @default(now())
  updatedAt          DateTime     @updatedAt

  @@map("manifests")
}
```

### 4.5. Model Global Sequence Counter
Mengelola sistem *auto-increment* terpusat yang otomatis di-reset menjadi 1 setiap tanggal 1 Januari pukul 00:00.
```prisma
model SequenceCounter {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  tahun         Int      @unique
  counterBundle Int      @default(0)
  counterSurat  Int      @default(0)
  counterManifest Int    @default(0)
  counterTanah  Int      @default(0)  // Counter berkelanjutan Mutasi Habis
  counterBangunan Int    @default(0)  // Counter berkelanjutan Mutasi Habis

  @@map("sequence_counters")
}
```

### 4.6. Model Audit Log (Immutable History)
Skema pencatatan riwayat digital transaksi sistem. API endpoint pengubahan/penghapusan untuk model ini dilarang keras.
```prisma
model AuditLog {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  timestamp   DateTime @default(now())
  stafId      String   @db.ObjectId
  namaStaf    String
  role        Role
  aksi        String   // Contoh: "Mengeluarkan Berkas NOP XXX dari Bundle Y"

  @@index([stafId])
  @@index([timestamp])
  @@map("audit_logs")
}
```
