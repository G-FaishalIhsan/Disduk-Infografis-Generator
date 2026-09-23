<div align="center">

  <img src="img/logo_disduk.png" alt="Logo Disdukcapil Tasikmalaya" width="100" />

  # 📊 Generator Infografis Disdukcapil Tasikmalaya

  ### *Sistem Generator & Visualisasi Data Demografi Kependudukan Berbasis Web & Export Engine HiDPI*

  [![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
  [![Express](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
  [![Puppeteer](https://img.shields.io/badge/Puppeteer-HiDPI_Render-40B5A4?style=for-the-badge&logo=puppeteer&logoColor=white)](https://pptr.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38BDF8?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Version](https://img.shields.io/badge/Version-2.0.0--Release-10B981?style=for-the-badge)](#)
  [![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](#)

  <p align="center">
    <a href="#-fitur-utama">Fitur Utama</a> •
    <a href="#-ruang-kerja-workspace">Ruang Kerja</a> •
    <a href="#-arsitektur--pipeline-sistem">Arsitektur</a> •
    <a href="#-teknologi-yang-digunakan">Teknologi</a> •
    <a href="#-cara-instalasi--memulai">Instalasi</a> •
    <a href="#-saran-pengembangan--roadmap-enterprise">Saran Pengembangan</a>
  </p>

</div>

---

## 📖 Tentang Project

**Generator Infografis Disdukcapil** adalah platform web modern yang dirancang untuk menghasilkan infografis kependudukan secara otomatis, presisi, dan indah untuk **Dinas Kependudukan dan Pencatatan Sipil (Disdukcapil) Kabupaten Tasikmalaya**. 

Aplikasi ini mengubah data demografi mentah (PDF Profil Kependudukan & File Excel `JUMDUK`) menjadi laporan grafis tingkat pemerintah (*Government-grade Infographics*) serta materi publikasi media sosial berbasis **Carousel Instagram (4:5)** secara *pixel-perfect* dan siap cetak 300 DPI.

---

## ✨ Fitur Utama

- 🎨 **Sistem Tema Lengkap (Mode Terang ☀️ & Mode Gelap 🌙)**:
  Bisa berganti tema secara otomatis mengikuti preferensi OS (*System Mode*) atau diatur secara manual dengan *UI Transition* yang mulus.

- 🏙️ **Dukungan 39 Kecamatan Resmi Kabupaten Tasikmalaya**:
  Filter wilayah instan untuk seluruh kecamatan dengan pengurutan kode wilayah resmi (dari `320601 — CIPATUJAH` hingga `320639 — SUKARESIK`).

- 🖨️ **Engine Render Backend Puppeteer (300 DPI HiDPI Output)**:
  Proses rendering ekspor **PNG**, **JPG**, dan **PDF Vektor V3** dikerjakan di backend server menggunakan Headless Chromium asli, menghasilkan gambar yang tajam tanpa pecah saat dicetak.

- 📦 **Paket Ekspor ZIP Carousel Media Sosial**:
  Khusus template media sosial V2, hasil gambar tiap slide dikemas otomatis ke dalam file `.ZIP` resolusi tinggi disertai indikator progress *real-time* via **Server-Sent Events (SSE)**.

- 🌐 **Responsive Template Preview Hub**:
  Galeri interaktif terpisah di `/preview/index.html` untuk menguji semua template V1 & V2 dengan fitur *Device Viewport Switcher* (Desktop, Tablet 768px, Mobile 375px), pengatur skala *Auto-Fit*, dan penampil slide *Side-by-Side*.

- 📜 **Riwayat Unduhan Real-Time (Log History)**:
  Merekam setiap aktivitas pengunduhan infografis secara *real-time* dengan cap waktu (*timestamp*) dan tombol pembersih riwayat.

---

## 🚀 Ruang Kerja (Workspace)

Aplikasi memiliki **2 Ruang Kerja Utama**:

| Ruang Kerja | Format & Rasio | Deskripsi & Kegunaan |
|---|---|---|
| 📄 **Full Infografis (V1)** | **A4 Single Page & Makro Page (1200px Width)** | Untuk laporan cetak resmi, dokumen PDF A4, dan tabel makro kependudukan 39 Kecamatan. |
| 📱 **Media Sosial Carousel (V2)** | **Instagram Feed 4:5 Ratio (1080×1350 px)** | Untuk postingan edukasi publik di Instagram & Facebook dengan format multi-slide (Slide 1 Cover & Slide 2 Visualisasi). |

---

## 🛠️ Arsitektur & Pipeline Sistem

```text
┌───────────────────────────────┐
│ Dokumen PDF Profil / Excel    │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│     Parsing & Normalisasi     │ (pdf-parser.js & excelNormalizer.js)
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│        AnalyticsEngine        │ (Single Source of Truth / Perhitungan Statistik)
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│          DataBinder           │ (Pengikatan Otomatis ke Atribut data-bind Template)
└───────┬───────────────────────┘
        │
        ├───────────────────────────────────────┐
        ▼                                       ▼
┌───────────────────────────────┐   ┌───────────────────────────────┐
│    AutoFitter Preview Engine  │   │   Backend Puppeteer Renderer  │
│     (Screen Live Preview)     │   │   (PNG / JPG / PDF / ZIP SSE) │
└───────────────────────────────┘   └───────────────────────────────┘
```

---

## 💻 Teknologi yang Digunakan

### Frontend
- **HTML5 & Vanilla JavaScript ES6+**
- **Tailwind CSS 3.x** (Styling & Design System Tokens)
- **Chart.js** (Grafik Lingkaran/Donut & Bar Demografi)
- **FontAwesome 6.4** (Ikonografi UI)

### Backend
- **Node.js** (Runtime Server)
- **Express.js** (REST API & Static File Serving)
- **Puppeteer** (Headless Chromium PDF/Image Renderer)
- **JSZip** (Kompresi Paket Ekspor Carousel)
- **SheetJS (xlsx)** (Parser Data Excel JUMDUK)

---

## ⚡ Cara Instalasi & Memulai

### 1. Prasyarat
Pastikan komputer Anda sudah terinstal:
- [Node.js](https://nodejs.org/) versi 18 atau yang lebih baru.

### 2. Kloning Repository & Instal Dependensi
```bash
# Clone repository ini
git clone https://github.com/G-FaishalIhsan/Disduk-Infografis-Generator.git

# Masuk ke direktori project
cd Disduk-Infografis-Generator

# Instal seluruh dependensi
npm install
```

### 3. Menjalankan Aplikasi
```bash
# Jalankan server lokal (Default port 3000)
npm start
```

Buka browser Anda dan akses:
- 🌐 **Aplikasi Utama**: [http://localhost:3000](http://localhost:3000)
- 🖼️ **Preview Template Hub**: [http://localhost:3000/preview/index.html](http://localhost:3000/preview/index.html)

---

## 📁 Struktur Folder Project

```text
Disduk-Infografis-Generator/
├── index.html                   # Halaman Utama Generator Infografis
├── style.css                    # Design System & Token Warna (Light/Dark Mode)
├── Preview Template Disduk/     # Responsive Preview Hub Standalone
│   ├── index.html               # Gallery & Preview Showcase Web App
│   ├── v1/                      # Salinan Template V1 Standalone
│   └── v2/                      # Salinan Template V2 Standalone
├── server/                      # Engine Backend Node.js & Puppeteer
│   ├── server.js                # Express API Routes & SSE Progress
│   ├── renderer.js              # Chromium Renderer V1
│   └── social-renderer.js       # Chromium Renderer V2 Carousel
├── src/                         # Core Frontend Logic & Module
│   ├── app.js                   # Application Controller Utama
│   ├── engine/                  # AnalyticsEngine, DataBinder, & AutoFitter
│   ├── excel/                   # DatasetManager & Excel Normalizer
│   ├── exporters/               # Client Exporter Drivers (PNG, JPG, PDF, ZIP)
│   └── ui/                      # SidebarUI, DatasetManagerUI, ThemeController
├── templates/                   # Template HTML & CSS Source
│   ├── template-1/              # Template V1 Standard A4
│   ├── template-2/              # Template V1 Makro 39 Kecamatan
│   ├── template-3/              # Template V1 Compact Summary
│   └── social/                  # Template V2 Carousel Media Sosial (Template 1, 2, 3)
└── data/                        # Dataset JSON Kependudukan Terstruktur
```

---

## 💡 Saran Pengembangan & Roadmap Enterprise

Berikut adalah saran pengembangan dan peta jalan (*roadmap*) tingkat lanjut untuk meningkatkan kualitas dan performa aplikasi ke standar *Enterprise*:

### ⚡ 1. Optimasi Performa Jaringan & Beban Aset (Full Offline Ready)
- **Self-Host & Bundling Aset Lokal (Vite / ESBuild)**: Mengompilasi seluruh stylesheet Tailwind CSS, ikon FontAwesome (`.woff2`), dan font Inter secara lokal di server untuk memotong ukuran transfer jaringan dari **>5 MB menjadi <300 KB**, halaman *load* instan (<1 detik), dan **100% Full Offline Ready**.
- **Web Worker untuk Heavy Parsing**: Memindahkan pemrosesan ekstraksi file Excel besar dan kalkulasi `AnalyticsEngine` ke Web Worker (*background thread*) agar UI utama tidak pernah terasa *freeze/lag*.
- **Lazy Loading Iframe Preview**: Render iframe template secara *on-demand* untuk menghemat penggunaan RAM browser.

### 🗄️ 2. Arsitektur Database & Deployment
Dua opsi pilihan database yang dapat disesuaikan dengan skala infrastruktur dinas:
- **Opsi A: SQLite *(Paling Praktis)***: Database *serverless* 1 file lokal, 0 instalasi (sangat praktis untuk PC operasional staf).
- **Opsi B: MySQL / MariaDB *(Standar Enterprise)***: Database RDBMS *client-server* standar industri instansi untuk server pusat.
- **Deployment Kontainerisasi (Docker & Docker-Compose)**: Pengemasan aplikasi Node.js, Puppeteer Engine, dan Database ke dalam kontainer Docker terisolasi (`docker-compose up -d`).
- **Object Storage (S3 / MinIO)**: Penyimpanan berkas ekspor hasil render (PNG, PDF, ZIP) secara terpusat.

### 🔒 3. Keamanan & Hak Akses (RBAC)
- **Autentikasi & RBAC (Role-Based Access Control)**: Membedakan peran Admin, Staf Pengolah Data, dan Operator Medsos.
- **Backend Rate Limiting**: Proteksi endpoint ekspor Puppeteer dari serangan *request overload rendering*.

### 🖨️ 4. Skalabilitas Engine Render Puppeteer
- **Puppeteer Cluster Worker Pool**: Antrean pemrosesan paralel agar ekspor simultan oleh banyak pengguna berjalan stabil tanpa *timeout*.

### 🎨 5. Fitur Interaktif & Pengalaman Pengguna (UI/UX)
- **Inline WYSIWYG Text Editor**: Kustomisasi teks/catatan highlight secara langsung di atas canvas preview.
- **Custom Color Palette Switcher**: Pilihan skema warna instansi (*Emerald Green, Royal Indigo, Classic Teal, Executive Gold*).
- **Mode Cetak Hemat Tinta (Print-Friendly Ink Saver)**: Mengubah background berwarna/gelap menjadi putih bersih untuk hemat tinta printer kantor.

### 🚀 6. Fitur Inovatif Tingkat Lanjut
- 🗺️ **Peta Tematik Interaktif (GIS / Choropleth Map)**: Visualisasi sebaran demografi 39 kecamatan berbasis GeoJSON + Leaflet.js.
- 🤖 **Narasi Teks Otomatis Berbasis AI**: Generasi otomatis 1-2 paragraf ringkasan cerita analisis kependudukan untuk rilis pers Humas / pidato pimpinan.
- 📢 **Auto-Publish ke Instagram / Facebook (Meta Graph API)**: Posting otomatis paket Carousel dari web ke akun resmi Disdukcapil.
- 📱 **QR Code Verifikasi Keabsahan Dokumen Resmi**: QR Code unik di setiap ekspor infografis A4 yang dapat di-scan dari HP warga/pejabat untuk memverifikasi keaslian dokumen.
- 📊 **Modul Analisis Komparasi Antar-Kecamatan & Periode**: Perbandingan 2 kecamatan (*Singaparna vs Cipatujah*) atau 2 periode data secara berdampingan.

### 🧪 7. Otomatisasi CI/CD & Testing Pipeline
- **GitHub Actions Workflow**: Otomatisasi pengujian regresi visual (*Visual Regression Testing*) dan *auto-deployment* ke server pementasan (*Staging Server*) setiap kali ada pembaruan kode pada branch `main`.

---

## 🤝 Kontribusi & Lisensi

Dikembangkan untuk **Disdukcapil Kabupaten Tasikmalaya**. 

Project ini dilisensikan di bawah **[MIT License](LICENSE)**. Bebas dikembangkan dan disesuaikan untuk kebutuhan analisis kependudukan daerah lainnya.

<div align="center">
  <br />
  <p><b>Disdukcapil Kabupaten Tasikmalaya © 2026</b></p>
  <p><i>"Melayani dengan Hati, Membahagiakan Masyarakat"</i></p>
</div>
