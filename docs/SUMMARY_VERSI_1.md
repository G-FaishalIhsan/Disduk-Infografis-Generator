# 📋 SUMMARY VERSI 1 (V1 PRODUCTION BASELINE)

## Overview
Versi 1 (V1) adalah baseline stabil dari aplikasi **Generator Infografis Disdukcapil Kabupaten Tasikmalaya**.

## Fitur Utama V1
1. **Portal UI Frontend (`index.html`)**: Dashboard interaktif untuk memilih template, mengunggah data kependudukan (Excel / PDF), dan menampilkan pratinjau live dalam iframe.
2. **Template Produksi (V1)**:
   - `templates/template-1/`: Template Infografis Single Page (Kecamatan / Desa).
   - `templates/template-2/`: Template Infografis Makro Kabupaten & Tabel 39 Kecamatan.
   - `templates/template-3/`: Template Infografis Compact (Status: Maintenance).
3. **Backend Export Engine (`server/server.js`)**:
   - Berbasis Express API & Puppeteer Headless Chromium.
   - Mengisi data secara dinamis ke atribut `data-bind` dan ID HTML.
   - Menghasilkan ekspor PNG, JPG, dan PDF 1-Halaman presisi murni.

## Status Keandalan V1
- Fast Rendering: Browser Pool Singleton (`browserManager.js`) dengan waktu render ~1.2 detik per halaman.
- High Resolution: Ekspor PNG HiDPI tanpa distorsi gambar atau teks terpotong.
- Single Page Compliance: Aturan CSS strict container `1080x1350 px` menjamin ekspor PDF tepat 1 halaman (`Pages: 1`).
