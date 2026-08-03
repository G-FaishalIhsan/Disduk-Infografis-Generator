# 📚 PROJECT KNOWLEDGE BASE

**Project:** Generator Infografis Disdukcapil Kabupaten Tasikmalaya  
**Peran:** Principal Software Architect, Product Owner, System Analyst, Technical Lead  
**Versi Basis:** V1.0 Production Baseline  

---

# Project Overview

- **Nama Project**: Generator Infografis Disdukcapil Kabupaten Tasikmalaya
- **Tujuan**: Memfasilitasi pembuatan, penyesuaian (*preview* interaktif), dan pengeksporan infografis profil kependudukan (Kabupaten Tasikmalaya dan 39 Kecamatan) secara otomatis, akurat, dan siap cetak/publikasi berdasarkan data resmi dinas.
- **Problem Statement**: Proses penyusunan infografis kependudukan sebelumnya dilakukan secara manual yang memakan waktu, rentan kesalahan pengetikan angka statistik, serta menghasilkan kualitas dokumen cetak/PDF yang tidak konsisten antar-wilayah.
- **Target User**: 
  1. Petugas Data & Informasi Disdukcapil Kabupaten Tasikmalaya.
  2. Administrator Kecamatan & Pengelola Media Informasi Instansi.
  3. Pimpinan / Pembuat Kebijakan Publik Instansi Pemerintah.
- **Scope**: 
  - Pengolahan data kependudukan skala Kabupaten Tasikmalaya dan 39 Kecamatan.
  - *Live Preview Canvas* interaktif berbasis peramban web.
  - Render visual 3 pilihan template infografis (*Template 1, Template 2, Template 3*).
  - Ekspor hasil infografis ke format PNG (HiDPI 2.5x), JPG, dan PDF 1-Halaman berbasis Puppeteer Headless Chromium.
- **Value Proposition**: 
  - **100% Akurasi Data**: Terhubung langsung dengan dokumen *Single Source of Truth (SSOT)* Profil Kependudukan 2025.
  - **Pixel-Perfect Renderer**: Hasil ekspor menggunakan Headless Chromium asli, menghasilkan cetakan tajam tanpa distorsi atau *text clipping*.
  - **Zero Overlap & Single-Page PDF**: Menjamin ekspor PDF konsisten tepat 1 halaman tanpa *page overflow*.

---

# Tech Stack

### 1. Frontend (Web Application UI)
- **Core Architecture**: HTML5, Vanilla JavaScript (ES Modules / ESM), CSS3.
- **Styling & Framework**: Tailwind CSS (Utility-First System), Custom Vanilla CSS.
- **Typography & Icons**: Google Fonts (Inter, Roboto), FontAwesome 6 Pro/Free Icons.
- **Visualization**: Chart.js (Chart engine dalam iframe template untuk Grafik Piramida Penduduk, Agama, Pendidikan, & Status Perkawinan).
- **PDF Parsing Capability**: PDF.js (Parser dokumen PDF di sisi browser).

### 2. Backend (Export Engine Server)
- **Runtime Environment**: Node.js (v25.6.0).
- **Web Framework**: Express.js (v4.18.2).
- **Headless Browser Engine**: Puppeteer (v21.6.0) dengan Headless Chromium Server-Side.
- **Archiver / Utility**: Archiver module.

### 3. Server & Infrastructure
- **Frontend Server**: `http-server` (Running on `http://localhost:8080`).
- **Backend API Server**: `express` (Running on `http://localhost:3000`).

---

# System Architecture

Sistem menggunakan arsitektur **Single Source of Truth (SSOT) & Decoupled Rendering Engine**:

```
[ PDF SSOT 2025 ]
       │
       ▼
[ Population Schema / PDF Parser ] ──► [ Data Normalizer ]
                                              │
                                              ▼
[ Live Preview Canvas ] ◄── [ Template HTML ] ◄── [ Data Binder ]
         │
         ▼
[ Backend Express API ] ──► [ Puppeteer Headless Chromium ] ──► [ PNG / JPG / PDF Export ]
```

### Prinsip Alur Data:
1. **Data Model**: Data bersumber dari `districts_base.json` (39 Kecamatan) dan `population-schema.js` (Baseline Kabupaten).
2. **Normalizer**: `data-normalizer.js` menghitung rasio persentase dan memformat angka desimal ke standar Indonesia `id-ID` (contoh: `2.708,84`).
3. **Data Binder**: `data-binder.js` menyuntikkan objek data ke atribut `data-bind` pada elemen DOM HTML dan memutakhirkan Chart.js di dalam iframe template.
4. **Export Engine**: `export-engine.js` mengirimkan DOM state dan parameter template ke server Express backend (`/api/export/pdf`, `/png`, `/jpg`), di mana Puppeteer membuka halaman dan mengambil tangkapan layar/cetakan PDF presisi.

---

# Folder Structure

```
d:\Project\disduk Infografis 2\
├── index.html                  # Main Application UI Shell & Toolbar Header
├── package.json                # Node.js Dependencies & Scripts Configuration
├── PROJECT_KNOWLEDGE_BASE.md   # Official Knowledge Base Document
├── server/                     # Backend Export Engine
│   ├── server.js               # Express Server Endpoints & API Handlers
│   ├── pdf-renderer.js         # Puppeteer Headless Chromium Controller
│   └── social-renderer.js      # Social Export Engine (Status: Maintenance)
├── src/                        # Frontend Core Application Logic
│   ├── app.js                  # Main Application Orchestrator & Scale Handler
│   ├── engine/
│   │   ├── auto-fitter.js      # Layout Boundary & Safe Area Engine
│   │   ├── data-binder.js      # Data Binding to DOM & Chart.js Engine
│   │   ├── export-engine.js    # Client-side Export Handler (API Caller)
│   │   ├── template-loader.js  # Dynamic Template Fetcher & Loader
│   │   └── social-export-engine.js # Social Export Handler (Status: Maintenance)
│   ├── models/
│   │   ├── population-schema.js# Common Data Model & Baseline Kabupaten Data
│   │   └── data-normalizer.js  # Number Formatter (id-ID) & Percentage Calculator
│   ├── parsers/
│   │   ├── pdf-parser.js       # PDF Data Parser & Preset District Handler
│   │   └── districts_base.json # Authentic 39 Kecamatan Dataset
│   └── ui/
│       ├── sidebar.js          # Sidebar Form Controls & User Controls
│       ├── theme-controller.js # UI Dark / Light Mode Switcher
│       └── social-export-modal.js # Social Export Modal (Status: Maintenance)
└── templates/                  # Infographic HTML Templates
    ├── template-1/
    │   ├── index.html          # Template 1 Full Layout (Single Source HTML)
    │   └── style.css           # Template 1 Styles
    ├── template-2/
    │   ├── index.html          # Template 2 Full Layout
    │   └── style.css           # Template 2 Styles
    └── template-3/
        ├── index.html          # Template 3 Full Layout
        └── style.css           # Template 3 Styles
```

---

# Database

- **Status V1**: **Belum Ditentukan** (V1 tidak menggunakan basis data SQL/NoSQL terpusat; seluruh data menggunakan file terstruktur `districts_base.json` dan `population-schema.js`).
- **Status V2**: Belum Ditentukan.

---

# API

### 1. `GET /api/health`
- **Fungsi**: Memeriksa status kesehatan server backend Express dan ketersediaan engine Puppeteer Chromium.
- **Response**: `HTTP 200 OK` `{ status: "ok", puppeteer: true }`.

### 2. `POST /api/export/png`
- **Fungsi**: Menerima payload data/HTML template, merender halaman via Puppeteer, dan mengembalikan file image PNG resolusi tinggi (`deviceScaleFactor: 2.5`).
- **Response**: Buffer Gambar PNG (`image/png`).

### 3. `POST /api/export/jpg`
- **Fungsi**: Menerima payload data/HTML template dan mengembalikan file image JPG.
- **Response**: Buffer Gambar JPG (`image/jpeg`).

### 4. `POST /api/export/pdf`
- **Fungsi**: Menerima payload data/HTML template dan merender dokumen PDF presisi 1 Halaman (`printBackground: true`, `pageRanges: '1'`).
- **Response**: Buffer Dokumen PDF (`application/pdf`).

### 5. `POST /api/export/social-progress`
- **Fungsi**: Endpoint ekspor media sosial.
- **Status saat ini**: `HTTP 503 Service Unavailable` (Fitur dalam status *Maintenance*).

---

# Business Rules

1. **Single Source of Truth (SSOT)**: Seluruh nilai data kependudukan harus bersumber dan 100% identik dengan laporan resmi **`FINAL BUKU PROFIL PERKEMBANGAN KEPENDUDUKAN TASIKMALAYA 2025.pdf`**.
2. **Strict PDF 1-Page Constraint**: Hasil ekspor PDF dari seluruh template WAJIB tepat **1 halaman** tanpa adanya pencetakan halaman kedua yang kosong (*zero page overflow*).
3. **No Visual Clipping / Distorsi**: Hasil ekspor PNG/JPG/PDF tidak boleh terpotong (*clipped*), blur, atau mengalami distorsi font/layout.
4. **Isolasi Fitur Ekspor Existing**: Fitur ekspor PNG, JPG, dan PDF yang sudah stabil di V1 **DILARANG DIUBAH ATAU DIRUSAK**.
5. **No HTML2Canvas For Primary Production Export**: Penggunaan `html2canvas` dilarang untuk ekspor utama production; ekspor harus menggunakan Headless Chromium Puppeteer backend.

---

# Functional Requirements

1. **Mode Kabupaten & Kecamatan**: Pengguna dapat memilih mode wilayah (Kabupaten Tasikmalaya atau salah satu dari 39 Kecamatan).
2. **Pemilihan Template**: Pengguna dapat berganti antara Template 1, Template 2, dan Template 3 secara *real-time*.
3. **Dynamic Data Binding**: Data kependudukan (Total Penduduk, Laki-laki, Perempuan, Sex Ratio, Luas Wilayah, Kepadatan, Jumlah KK, Usia, Pendidikan, Agama, Status Perkawinan, Dokumen KTP/Akta) ter-bind otomatis ke canvas preview.
4. **Upload & Parse PDF File**: Pengguna dapat mengunggah file PDF profil kependudukan baru untuk memperbarui data secara dinamis.
5. **Ekspor PNG, JPG, PDF**: Pengguna dapat mengunduh infografis dalam format PNG, JPG, dan PDF 1-halaman secara instan.
6. **Theme Switcher**: Pengguna dapat beralih antara Mode Terang (Light Mode) dan Mode Gelap (Dark Mode) pada antarmuka aplikasi.

---

# Non Functional Requirements

1. **Performa Ekspor**: Waktu pemprosesan ekspor PDF/PNG backend oleh Puppeteer tidak boleh melebihi 3 detik per dokumen (rata-rata saat ini ~1.2 detik).
2. **Presisi Visual**: Ekspor gambar menggunakan skala resolusi tinggi `deviceScaleFactor: 2.5` (HiDPI).
3. **Sensitivitas Layar (Responsif)**: Tampilan preview canvas menyesuaikan skala otomatis (*auto-fit*) terhadap lebar peramban pengguna.
4. **Zero Memory Leak**: Browser instance Puppeteer harus ditutup/dikelola secara efisien agar tidak menyebabkan lonjakan konsumsi RAM server.

---

# User Flow

```
[ Pengguna Membuka Aplikasi (http://localhost:8080) ]
                        │
                        ▼
[ Pilih Mode Wilayah (Kabupaten / Kecamatan) & Template (1/2/3) ]
                        │
                        ▼
[ Sistem Memuat Template & Membind Data Kependudukan ke Canvas Preview ]
                        │
                        ▼
[ Live Preview Canvas Menampilkan Infografis Presisi (Auto-Fit Scale) ]
                        │
                        ▼
[ Pengguna Mengklik Tombol Ekspor (PNG / JPG / PDF) ]
                        │
                        ▼
[ Backend Express & Puppeteer Merender Halaman di Server ]
                        │
                        ▼
[ File Terunduh Otomatis ke Komputer Pengguna ]
```

---

# Feature List

### Existing (Selesai & Production Baseline)
- ✅ Mode Kabupaten Tasikmalaya (Baseline Data 2025).
- ✅ Mode 39 Kecamatan (Dataset Autentik 39 Kecamatan).
- ✅ Live Preview Canvas dengan Auto-Scale Responsif.
- ✅ Template 1, Template 2, dan Template 3.
- ✅ Ekspor PNG HiDPI (2.5x).
- ✅ Ekspor JPG.
- ✅ Ekspor PDF 1-Halaman Presisi.
- ✅ Data Normalizer (Standardisasi format desimal `id-ID` & persentase).
- ✅ Auto-Fitter Engine (Pemeriksa batas aman elemen visual).
- ✅ Theme Switcher UI (Light/Dark mode).
- ✅ PDF File Upload & Client Parser.

### Planned (Rencana V2)
- ⏳ Belum Ditentukan.

---

# Template System

- **Template 1**: Infografis Modern Layout dengan Piramida Penduduk, Widget Dokumen Adminduk, Chart Agama, dan Vitalitas.
- **Template 2**: Infografis Minimalis Clean Layout dengan fokus pada Distribusi Pendidikan & Status Perkawinan.
- **Template 3**: Infografis Compact Data-Rich Layout dengan visualisasi Kepadatan Penduduk & Persebaran Wilayah.
- **Mekanisme Binding**: Template memuat atribut `data-bind` pada elemen HTML dan mengaitkan fungsi `updateTemplateData()` untuk grafik Chart.js.

---

# Export Engine

- **Engine Backend**: Node.js + Express + Puppeteer Headless Chromium (`server/pdf-renderer.js`).
- **Skala Renderer**: `viewport: { width: 1200, height: 1600, deviceScaleFactor: 2.5 }`.
- **Pengaturan PDF**: `format: 'A4'`, `printBackground: true`, `pageRanges: '1'`, `margin: { top: 0, right: 0, bottom: 0, left: 0 }`.
- **Hasil Uji Verifikasi**: 100% 1-Halaman tanpa pembagian halaman (*zero overflow*).

---

# PDF Parser

- **Module**: `src/parsers/pdf-parser.js` dan `PDF.js`.
- **Fungsi**: Membaca file PDF profil kependudukan yang diunggah pengguna, mengurutkan string tabel, dan memetakan nilai ke skema `PopulationSchema`.

---

# Dashboard

- Belum Ditentukan.

---

# Admin Module

- Belum Ditentukan.

---

# Security

1. **No Unsafe Execution**: Bebas dari fungsi `eval()` atau injeksi kode dinamis.
2. **DOM XSS Prevention**: Pengikatan nilai teks menggunakan `.textContent` murni, bukan `.innerHTML` tidak terikat.
3. **Isolated File Execution**: Proses rendering Puppeteer berjalan pada lingkungan terisolasi dengan opsi `--no-sandbox`.

---

# Performance

- **Waktu Respon Health API**: `< 2 ms`.
- **Waktu Ekspor PDF**: `~1.20 detik`.
- **Konsumsi Memori Backend**: `~45 MB` (Sangat efisien).
- **Skala Preview**: Responsif tanpa mengganggu alur layout DOM luar (`scalerElement.style.height = exactHeight * scale`).

---

# Known Issues

- **V1 Production Baseline**: **TIDAK ADA KNOWN ISSUES (0 BUG)**.
  - Bug ruang kosong di bawah preview (*blank space bug*) telah diperbaiki 100%.
  - Bug pembengkakan tinggi iframe saat berganti template telah diperbaiki 100%.
  - Akurasi data PDF SSOT telah divalidasi 100% pada Phase 10.

---

# Future Improvements

- Belum Ditentukan.

---

# Development Roadmap

- **Phase 0 - V1 Baseline**: Selesai & Production Ready (26 Juli 2026).
- **Phase V2 Development**: Belum Ditentukan.

---

# Change Log

- **V1.0.0 (26 Juli 2026)**:
  - Peluncuran baseline awal Generator Infografis Disdukcapil Kabupaten Tasikmalaya.
  - Implementasi Mode Kabupaten & 39 Kecamatan.
  - Implementasi Ekspor PNG, JPG, dan PDF 1-Halaman via Puppeteer.
  - Perbaikan bug tinggi canvas preview dan ruang kosong bawah.
  - Audit & Sinkronisasi Data 100% terhadap PDF SSOT Profil Kependudukan 2025.

---

# Risk

| Kategori Risiko | Tingkat Risiko | Mitigasi Yang Telah Diterapkan |
|-----------------|----------------|--------------------------------|
| **PDF Overflow (> 1 Hal)** | Low | Dikunci dengan parameter `pageRanges: '1'` dan pengujian otomatis `check_all_pdf.cjs`. |
| **Data Mismatch** | Low | Seluruh baseline terikat pada dokumen PDF SSOT 2025. |
| **Puppeteer Timeout** | Low | Server Express memiliki retry mechanism & timeout 30 detik. |

---

# Technical Debt

- **Low**: Kode Social Media Export saat ini disimpan dalam status *Maintenance* (HTTP 503) untuk pengembangan di versi mendatang.

---

# Things That Must Never Change

1. **Fasilitas Ekspor PNG, JPG, dan PDF 1-Halaman Existing**: Dilarang diubah, dirusak, atau diturunkan kualitasnya.
2. **Kepatuhan Terhadap Single Source of Truth (SSOT)**: Data harus tetap 100% akurat sesuai dokumen resmi Disdukcapil.
3. **Batasan PDF 1 Halaman**: Ekspor PDF wajib 1 halaman penuh tanpa adanya pembagian ke halaman 2.
4. **Backend Headless Chromium Renderer**: Pengeksporan utama tidak boleh menggunakan `html2canvas` browser murni.

---

# Development Guidelines

1. **Minimal Invasive Changes**: Setiap perubahan kode harus seminimal dan seterisolasi mungkin.
2. **Audit Sebelum Mengubah**: Selalu inspeksi kode dan jalankan pengujian sebelum dan sesudah melakukan perubahan.
3. **Test-Driven Verification**: Jalankan skrip uji otomatis `check_all_pdf.cjs` setelah setiap perubahan yang menyentuh data atau template.

---

# Coding Standards

1. **Gunakan JavaScript ES Modules (ESM)** untuk file frontend (`import`/`export`).
2. **Format Desimal Indonesia**: Selalu gunakan `Intl.NumberFormat('id-ID')` untuk angka numerik publik.
3. **Namaan Variabel**: Gunakan `camelCase` untuk variabel/fungsi JS, `snake_case` untuk properti skema JSON kependudukan, dan `kebab-case` untuk ID/Class HTML DOM.
4. **Desain Tailwind**: Gunakan warna HSL/slate yang harmonis dan profesional sesuai standar instansi pemerintah.

---

# Summary

**Project Knowledge Base** ini menyajikan gambaran utuh dan resmi mengenai arsitektur, data, flow, serta batasan teknis dari **Generator Infografis Disdukcapil Kabupaten Tasikmalaya V1**. 

Seluruh sistem V1 telah berjalan **100% stabil, 100% akurat dengan PDF SSOT 2025, serta bebas dari bug regresi**. Dokumen Knowledge Base ini kini resmi menjadi landasan dasar (*baseline*) utama sebelum kita mulai merencanakan dan mengembangkan **Versi 2 (V2)**!
