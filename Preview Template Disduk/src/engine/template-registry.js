/**
 * Template Registry Module (Phase 7 Foundation — Stabilization)
 * Dynamically scans and loads template manifests from templates/social/
 * and provides template discovery for the application.
 */

export class TemplateRegistry {
    constructor() {
        this.manifests = new Map();
        this.initDefaultRegistry();
    }

    /**
     * Initializes default registered manifests from templates/social/
     */
    initDefaultRegistry() {
        const t1Manifest = {
            id: 'template-1-v2',
            name: 'Template 1 V2',
            version: '2.0.0',
            status: 'AKTIF',
            badgeClass: 'v2-badge-active',
            slides: 2,
            ratio: '4:5 (1080x1350)',
            category: 'social',
            engine: 'TemplateEngineV2',
            description: 'Carousel 2-Slide Standard',
            icon: 'fa-images',
            disabled: false,
            path: 'templates/social/template-1'
        };

        const t2Manifest = {
            id: 'template-2-v2',
            name: 'Template 2 V2',
            version: '2.0.0',
            status: 'AKTIF',
            badgeClass: 'v2-badge-active',
            slides: 2,
            ratio: '4:5 (1080x1350)',
            category: 'social',
            engine: 'TemplateEngineV2',
            description: 'Makro Carousel 39 Kec',
            icon: 'fa-table',
            disabled: false,
            path: 'templates/social/template-2'
        };

        const t3Manifest = {
            id: 'template-3-v2',
            name: 'Template 3 V2',
            version: '2.0.0',
            status: 'AKTIF',
            badgeClass: 'v2-badge-active',
            slides: 2,
            ratio: '4:5 (1080x1350)',
            category: 'social',
            engine: 'TemplateEngineV2',
            description: 'Interactive Charts & Tables',
            icon: 'fa-chart-pie',
            disabled: false,
            path: 'templates/social/template-3'
        };

        this.register(t1Manifest);
        this.register(t2Manifest);
        this.register(t3Manifest);
    }

    /**
     * Registers a new template manifest dynamically
     * @param {Object} manifest 
     */
    register(manifest) {
        if (manifest && manifest.id) {
            this.manifests.set(manifest.id, manifest);
        }
    }

    /**
     * Retrieves all registered social media templates
     * @returns {Array<Object>}
     */
    getSocialTemplates() {
        return Array.from(this.manifests.values());
    }

    /**
     * Retrieves a single template manifest by ID
     * @param {string} templateId 
     * @returns {Object|null}
     */
    getTemplateManifest(templateId) {
        return this.manifests.get(templateId) || null;
    }
}
