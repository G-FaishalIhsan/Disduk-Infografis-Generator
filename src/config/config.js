/**
 * Global Configuration Module (Phase 7.5 Hardening — Centralized Configuration)
 * Centralizes default application parameters, versions, ratio standards, and export settings
 * to eliminate hardcoded values across multiple files.
 */

export const CONFIG = {
    DEFAULT_THEME: 'system',
    DEFAULT_TEMPLATE: 'template-1-v2',
    DEFAULT_SLIDE: 'slide1',
    DEFAULT_DISTRICT: 'SINGAPARNA',
    EXPORT_SCALE: 2.0,
    PNG_QUALITY: 0.95,
    SUPPORTED_RATIO: '1080x1350',
    DATASET_VERSION: '1.0',
    CURRENT_ENGINE_VERSION: '2.0.0',
    ORGANIZATION_NAME: 'DISDUKCAPIL KABUPATEN TASIKMALAYA'
};

export default CONFIG;
