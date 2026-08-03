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
- **Runtime Environment**: Node.js.
- **Web Framework**: Express.js.
- **Headless Browser Engine**: Puppeteer dengan Headless Chromium Server-Side.
- **Archiver / Utility**: JSZip & Archiver module.

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

---

# Single Source of Truth (SSOT) Data

- **Sumber Data Resmi**: `FINAL BUKU PROFIL PERKEMBANGAN KEPENDUDUKAN TASIKMALAYA 2025.pdf`
- **Tahun Basis Data**: Semester II / DKB 2025.
- **Total Wilayah**: 39 Kecamatan, 351 Desa/Kelurahan.
- **Total Populasi Kabupaten**: 1.973.411 Jiwa.
- **Total Kepala Keluarga**: 725.793 KK.
