# 📐 DECISION LOG (ARCHITECTURAL DECISIONS)

## ADR-001: Minimal Change Architecture & Zero Breaking Changes
- **Date**: 2026-07-26
- **Status**: Approved
- **Context**: Project V1 already runs stably in production. V2 requires additional features for social media carousels.
- **Decision**: All V2 development must be purely ADDITIVE. Core V1 files (`server/server.js`, `templates/template-1/`, `templates/template-2/`, `index.html`, `/img/`, `/assets/`) are frozen and untouched.
- **Consequences**: V1 functions continue to work with 100% backward compatibility.

---

## ADR-002: Template 3 Future Compatibility & Workspace Separation
- **Date**: 2026-07-26
- **Status**: Approved & Updated
- **Context**: 
  - **Infografis Lengkap (Workspace 1)**: Template 3 (Compact Layout) berstatus **Active** dan 100% dapat digunakan.
  - **Media Sosial (Workspace 2)**: Template 3 V2 berstatus **Maintenance / Coming Soon** karena desain versi carousel 4:5 belum selesai.
- **Decision**: 
  1. The V2 architecture is designed using a **Plug-and-Play Template Registry Pattern** (`templates-manifest.json`).
  2. All V2 templates consume a standardized, normalized JSON data payload contract.
  3. When Template 3 V2 is completed in the future, adding it to Workspace 2 will only require placing its HTML files in `templates/template-3-v2/` and updating its status in the JSON manifest to `"status": "active"`.
  4. **Adding Template 3 V2 in the future will NOT require major refactoring, engine changes, route rewrites, or structural breaking changes to V1 or V2.**
- **Consequences**: Seamless future extensibility without maintenance risk.

---

## ADR-003: Storage Directory Isolation
- **Date**: 2026-07-26
- **Status**: Approved
- **Context**: Preparation for future dataset caching, export temporary buffers, and server logging.
- **Decision**: Create a dedicated `storage/` directory with `datasets/`, `exports/`, and `logs/` subdirectories. Keep these folders empty and prepared without modifying any current V1 file paths.
- **Consequences**: Clean separation of dynamic runtime data from application source code.
