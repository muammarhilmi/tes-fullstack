# Vue Fullstack JMC Admin - Sistem Informasi Manajemen Pegawai & Tunjangan

Aplikasi web fullstack berbasis **Nuxt 4 (Vue 3)** untuk pengelolaan administrasi data pegawai, tunjangan, peran pengguna (role), dan audit log aktivitas. Aplikasi ini menggunakan **Nitro Server Engine** sebagai backend API terintegrasi dan **Tabler UI** untuk antarmuka dashboard admin yang modern dan responsif.

> **Live Demo (Production):** [https://tes-fullstack-production.up.railway.app/](https://tes-fullstack-production.up.railway.app/)

---

## 🛠️ Teknologi yang Digunakan (Tech Stack)

### Frontend
- **Framework**: [Nuxt 4](https://nuxt.com/) (Vue 3 with Composition API)
- **UI Framework & Icon**: [Tabler UI v1.0.0-beta24](https://tabler.io/) & `@tabler/icons-vue`
- **Grafik & Visualisasi**: [ApexCharts](https://apexcharts.com/) (`vue3-apexcharts`)
- **Slider/Carousel**: [Swiper](https://swiperjs.com/)

### Backend & API
- **Server Engine**: Nitro Engine (Bawaan Nuxt 4)
- **Database Driver**: MySQL2 (`mysql2`)
- **Dokumentasi API**: [Scalar OpenAPI](https://scalar.com/) (`@scalar/nuxt`)

### Keamanan & Ekspor Data
- **Autentikasi**: JSON Web Token (`jsonwebtoken`) & `bcrypt` password hashing
- **Proteksi Bot**: Google reCAPTCHA v2
- **Ekspor Dokumen**: `xlsx` (Excel) & `pdfmake` (PDF)

---

## ✨ Fitur-Fitur Utama

1. **Autentikasi & Keamanan**:
   - Login terproteksi reCAPTCHA dan autentikasi sesi berbasis JWT.
   - Manajemen sesi aman dan middleware verifikasi token.
2. **Dashboard Interaktif**:
   - Statistik ringkasan data pegawai dan statistik tunjangan dengan Grafik ApexCharts.
   - Mode Gelap / Terang (Dark / Light Mode) otomatis tersimpan.
3. **Manajemen Pegawai**:
   - Pengelolaan data master pegawai, unit kerja, dan jabatan.
   - Pencarian, filtering, dan paginasi data.
4. **Manajemen Tunjangan**:
   - Pengaturan variabel dan pengalokasian tunjangan pegawai.
5. **Manajemen User & Hak Akses (Role)**:
   - Pengaturan akun pengguna dan kontrol akses berbasis peran (*Role-Based Access Control*).
6. **Activity Log**:
   - Pencatatan otomatis setiap aktivitas/transaksi sistem untuk kebutuhan audit log.
7. **Laporan & Ekspor Data**:
   - Fitur ekspor laporan data pegawai dan tunjangan ke format Excel (`.xlsx`) dan PDF.

---

## 📁 Struktur Folder Project

```text
Vue_Fullstack_JMC_Admin/
├── app/                  # Frontend Layer (Vue 3 / Nuxt 4)
│   ├── assets/           # Stylesheet CSS & Gambar
│   ├── components/       # Komponen UI Reusabel (Sidebar, Header, Breadcrumb)
│   ├── composables/      # Logika Bisnis & State Management Frontend
│   ├── data/             # Konfigurasi Menu & Static Data
│   ├── layouts/          # Layout Template (Default Dashboard, Auth)
│   ├── middleware/       # Navigation Guard Frontend
│   └── pages/            # Routing Halaman (Dashboard, Pegawai, User, Tunjangan, Log)
├── server/               # Backend Layer (Nitro Server)
│   ├── api/              # REST API Endpoints (Auth, Pegawai, Tunjangan, User, Activity)
│   ├── middleware/       # Backend Middleware (JWT Authentication)
│   └── utils/            # Helper Koneksi Database MySQL & Utility Server
└── nuxt.config.js        # Konfigurasi Utama Nuxt & Plugin
```

---

## 🚀 Panduan Memulai (Getting Started)

### 1. Instalasi Dependensi
Pastikan Node.js (v18+) sudah terinstall di komputer Anda, lalu jalankan:

```bash
npm install
```

### 2. Konfigurasi Environment (`.env`)
Salin atau buat file `.env` di direktori utama dan atur konfigurasi berikut:

```env
APP_NAME=Kepegawaian
APP_CLIENT=FWD-JMC

# Database Configuration
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASS=
DB_NAME=kepegawaian_db

# Auth & Security
JWT_SECRET=rahasia_superadmin_fwdjmc
JWT_EXPIRES_IN=8h
NUXT_PUBLIC_RECAPTCHA_SITE_KEY=6LcVWDktAAAAAEV_cOXwLx2lHxnmBDGJkCM5nh2Q
RECAPTCHA_SECRET_KEY=6LcVWDktAAAAAIbPqmxxNNRWBMrRNI0nqD4ZGIhT
```

### 3. Migrasi & Data Seeder
Setelah `.env` disesuaikan, jalankan skrip migrasi untuk menyiapkan database (tabel dan default user):

```bash
node server/migrations/run.mjs
```
*Username default:* `superadmin` / *Password default:* `Admin@123`

### 4. Jalankan Server Development
Jalankan perintah berikut untuk memulai server pengembang:

```bash
npm run dev
```
Buka browser dan akses [http://localhost:3000](http://localhost:3000).

### 5. Dokumentasi API (Scalar OpenAPI)
Dokumentasi API interaktif dapat diakses saat server berjalan pada route:
[http://localhost:3000/api](http://localhost:3000/api) atau [http://localhost:3000/_openapi](http://localhost:3000/_openapi) jika modul Scalar aktif.

### 5. Build untuk Production
Untuk membuat bundle produksi:

```bash
npm run build
```
Untuk menjalankan hasil build produksi:
```bash
npm run preview
```
