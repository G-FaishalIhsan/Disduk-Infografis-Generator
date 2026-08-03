# 🏛️ ARCHITECTURE SPECIFICATION — VERSI 2 (V2)

## 1. Overview
Arsitektur V2 menggunakan pola **Decoupled Plug-and-Play Template Registry System**. Semua komponen V2 berjalan berdampingan secara *additive* dengan sistem V1.

## 2. High-Level Diagram

```
[ Frontend Portal V1 & V2 ]
         │
         ├──► V1 Pipeline (Static Endpoint /api/export/*)
         │         │
         │         ▼
         │    [ V1 Templates 1, 2, 3 ] ──► [ Puppeteer V1 Engine ] ──► [ V1 Single Page Output ]
         │
         └──► V2 Pipeline (Dynamic Registry /api/v2/*)
                   │
                   ▼
              [ Template Registry Manifest ]
              ├── Template 1 V2 (Active - Carousel 2-Slide)
              ├── Template 2 V2 (Active - Carousel 2-Slide Makro)
              └── Template 3 V2 (Maintenance - Plug & Play Ready)
                   │
                   ▼
              [ Puppeteer V2 Engine ] ──► [ Multi-Slide ZIP / PDF Output ]
```

## 3. Key Design Patterns
- **Plug-and-Play Template Registry**: Pendaftaran template baru berbasis JSON manifes tanpa refactor backend.
- **Isolated Workspace**: Pengembangan prototipe dan template baru dilakukan di folder terisolasi.
- **Unified Normalized Payload**: Data binding V2 menggunakan JSON payload standar yang identik.
