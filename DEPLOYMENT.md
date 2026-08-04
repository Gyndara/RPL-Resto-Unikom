# Panduan Deploy System Manajemen Restoran (RESTO UNIKOM)

Dokumen ini berisi panduan lengkap langkah demi langkah untuk mendepresikan aplikasi **RESTO UNIKOM**:
- **Database**: Neon PostgreSQL (Gratis, Tanpa Kartu Kredit)
- **Backend Options**: 
  - **Option A (Rekomendasi Utama Tanpa Kartu Kredit)**: Vercel / Koyeb
  - **Option B**: Render
- **Frontend**: Netlify (Gratis, Tanpa Kartu Kredit)

---

## 1. Persiapan Database (Neon PostgreSQL - Gratis & Tanpa Kartu Kredit)

1. **Buat Akun & Project di Neon**:
   - Buka [Neon.tech](https://neon.tech/) dan login/daftar pakai GitHub. **(Tanpa minta kartu kredit)**.
   - Klik **Create Project**, beri nama misal `resto-unikom-db`.
   - Pilih region `Asia Pacific (Singapore)`.

2. **Dapatkan Connection String (DATABASE_URL)**:
   - Di dashboard Neon, ambil **Connection String**.
   - Contoh format:
     ```text
     postgresql://<user>:<password>@ep-xyz-123456.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
     ```

3. **Migrasi Schema & Seed Data Awal ke Neon**:
   - Buka terminal di folder `backend` komputer Anda.
   - Atur environment variable `DATABASE_URL` atau isi di file `backend/.env` dengan URL Neon Anda:
     ```bash
     # Di folder backend
     npx prisma db push
     npm run seed
     ```

---

## 2. Deploy Backend (Opsi A: Vercel - GRATIS & TANPA KARTU KREDIT)

Vercel mendukung backend Node.js / Express secara gratis tanpa perlu kartu kredit.

1. **Buka [Vercel.com](https://vercel.com/)**:
   - Sign up / Login dengan akun **GitHub** Anda.

2. **Import Project**:
   - Klik **Add New...** -> **Project**.
   - Pilih repository GitHub `RPL-Resto-Unikom`.

3. **Konfigurasi Project**:
   - **Framework Preset**: `Other`
   - **Root Directory**: Klik Edit, pilih folder `backend`.
   - Expand **Environment Variables**, tambahkan:
     - `DATABASE_URL` = `<Connection string Neon PostgreSQL Anda>`
     - `JWT_SECRET` = `resto_unikom_secret_key_2026`
     - `NODE_ENV` = `production`

4. **Deploy**:
   - Klik **Deploy**.
   - Setelah selesai, catat URL Backend dari Vercel Anda (misal: `https://rpl-resto-unikom-backend.vercel.app`).
   - Cek endpoint healthcheck: `https://rpl-resto-unikom-backend.vercel.app/api/health`.

---

## 2.1 Deploy Backend (Opsi Alternatif: Koyeb - GRATIS & TANPA KARTU KREDIT)

Koyeb menyediakan web service Node.js gratis tanpa memerlukan kartu kredit.

1. Buka [Koyeb.com](https://koyeb.com) dan login dengan GitHub.
2. Klik **Create App** -> pilih **GitHub**.
3. Pilih repo `RPL-Resto-Unikom`, set **Work Directory** ke `backend`.
4. Build Command: `npm install && npx prisma generate`, Run Command: `npm start`.
5. Tambahkan Environment Variable (`DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production`).
6. Deploy dan dapatkan URL backend Koyeb Anda.

---

## 3. Deploy Frontend (Netlify - GRATIS & TANPA KARTU KREDIT)

1. **Buat Site Baru di Netlify**:
   - Buka [Netlify.com](https://www.netlify.com/) dan login dengan GitHub **(Tanpa Kartu Kredit)**.
   - Klik **Add new site** -> **Import an existing project**.
   - Pilih repository `RPL-Resto-Unikom`.

2. **Konfigurasi Site Settings**:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist` (atau `dist`)

3. **Atur Environment Variables**:
   - Ke **Site settings** -> **Environment variables**:
     - `VITE_API_BASE_URL` = `https://<nama-backend-anda>.vercel.app/api` (URL backend Vercel/Koyeb yang didapat dari Langkah 2).

4. **Deploy**:
   - Klik **Deploy site**. Netlify akan memberikan URL live frontend Anda (misal: `https://resto-unikom.netlify.app`).

---

## 4. Pengujian & Verifikasi

1. **Akses Website**: Buka URL Netlify (misal: `https://resto-unikom.netlify.app/customer`).
2. **Login Pegawai**:
   - Manager: `username: manager`, `password: password123`
   - Kasir: `username: kasir`, `password: password123`
   - Pelayan: `username: pelayan`, `password: password123`
   - Chef: `username: chef`, `password: password123`
