# Panduan Deploy System Manajemen Restoran (RESTO UNIKOM)

Dokumen ini berisi panduan lengkap langkah demi langkah untuk mendepresikan aplikasi **RESTO UNIKOM**:
- **Database**: Neon PostgreSQL
- **Backend**: Render
- **Frontend**: Netlify

---

## 1. Persiapan Database (Neon PostgreSQL)

1. **Buat Akun & Project di Neon**:
   - Buka [Neon.tech](https://neon.tech/) dan login/daftar.
   - Klik **Create Project**, beri nama misal `resto-unikom-db`.
   - Pilih region terdekat (misal `Asia Pacific (Singapore)`).

2. **Dapatkan Connection String (DATABASE_URL)**:
   - Setelah project dibuat, di dashboard Neon ambil **Connection String**.
   - Pastikan opsi **Pooled connection** atau **Direct connection** dengan `?sslmode=require` diaktifkan.
   - Contoh format:
     ```text
     postgresql://<user>:<password>@ep-xyz-123456.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
     ```

3. **Migrasi Schema & Seed Data Awal ke Neon**:
   - Buka terminal di folder `backend` komputer Anda.
   - Atur environment variable `DATABASE_URL` sementara atau update file `backend/.env` dengan URL Neon:
     ```bash
     # Di folder backend
     npx prisma db push
     npm run seed
     ```
   - Schema database dan data awal (akun pegawai: manager, kasir, pelayan, chef & daftar menu) kini sudah masuk ke Neon.

---

## 2. Deploy Backend (Render)

1. **Push Repository ke GitHub**:
   - Pastikan seluruh perubahan kode sudah di-commit dan di-push ke repository GitHub Anda.

2. **Buat Service Baru di Render**:
   - Buka [Render.com](https://render.com/) dan login.
   - Klik **New +** -> **Web Service**.
   - Hubungkan repository GitHub `RPL-Resto-Unikom`.

3. **Konfigurasi Web Service**:
   - **Name**: `resto-unikom-backend` (atau nama lain pilihan Anda)
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `npm start`

4. **Atur Environment Variables (Advanced -> Environment Variables)**:
   - `NODE_ENV` = `production`
   - `DATABASE_URL` = `<Connection string Neon PostgreSQL Anda>`
   - `JWT_SECRET` = `<Secret key rahasia Anda, misal: resto_unikom_secret_2026>`
   - `PORT` = `10000` (atau biarkan default Render)

5. **Deploy**:
   - Klik **Create Web Service**.
   - Tunggu proses build hingga status menjadi `Live`.
   - Catat URL backend Anda (misal: `https://resto-unikom-backend.onrender.com`).
   - Cek endpoint healthcheck: `https://resto-unikom-backend.onrender.com/api/health`.

---

## 3. Deploy Frontend (Netlify)

1. **Buat Site Baru di Netlify**:
   - Buka [Netlify.com](https://www.netlify.com/) dan login.
   - Klik **Add new site** -> **Import an existing project**.
   - Hubungkan dengan akun GitHub Anda dan pilih repository `RPL-Resto-Unikom`.

2. **Konfigurasi Site Settings**:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist` (atau `dist`)

3. **Atur Environment Variables**:
   - Ke **Site settings** -> **Environment variables** (atau saat setup awal).
   - Tambahkan key berikut:
     - `VITE_API_BASE_URL` = `https://<nama-backend-render-anda>.onrender.com/api`
     *(Pastikan menggunakan URL backend Render Anda yang berakhiran `/api`)*.

4. **Deploy Site**:
   - Klik **Deploy site**.
   - Setelah selesai, Netlify akan memberikan URL live frontend (misal: `https://resto-unikom.netlify.app`).

---

## 4. Pengujian & Verifikasi

1. **Akses URL Frontend Netlify**:
   - Buka `https://resto-unikom.netlify.app/customer`
   - Pilih meja dan uji pesan menu.
2. **Login Pegawai**:
   - Buka `/login`
   - Login menggunakan akun bawaan yang telah di-seed:
     - Manager: `username: manager`, `password: password123`
     - Kasir: `username: kasir`, `password: password123`
     - Pelayan: `username: pelayan`, `password: password123`
     - Chef: `username: chef`, `password: password123`
3. **Pemberitahuan CORS**:
   - Backend Express telah dikonfigurasi dengan middleware `cors()`, sehingga request dari domain Netlify akan diterima tanpa masalah CORS.
