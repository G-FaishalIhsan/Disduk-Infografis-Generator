# 📑 PRODUCT REQUIREMENTS DOCUMENT (PRD) — VERSI 2 (V2)

## 1. Vision & Purpose
Versi 2 (V2) bertujuan menambahkan dukungan publikasi **Social Media Carousel (Instagram Feed 4:5 | 1080 × 1350 px)** secara modular dan bertahap (*Incremental Upgrade*), tanpa mengubah stabilitas core V1.

## 2. Core V2 Scope
- **Template 1 V2**: Carousel 2-Slide Social Media (Skala teks besar mobile-friendly, Donut Chart Gender, Donut Kategori Usia KTP).
- **Template 2 V2**: Carousel 2-Slide Makro Kabupaten (Overview Makro & Tabel Rincian 39 Kecamatan Desain Asli).
- **Template 3 V2**: *Status: Maintenance* (Akan ditambahkan di masa depan menggunakan arsitektur Plug-and-Play Template Registry).

## 3. Architecture Constraints
- **Zero Breaking Change**: Ekspor V1 (`/api/export/png`, `/jpg`, `/pdf`) harus tetap bekerja 100%.
- **Minimal Change Architecture**: Semua penambahan bersifat ADDITIVE (folder terisolasi dan rute V2 baru).
- **Page-Break Compliance**: Setiap slide carousel bernilai 1-halaman presisi murni (`1080 × 1350 px`).
