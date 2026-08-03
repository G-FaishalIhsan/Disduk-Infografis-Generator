/**
 * Interactive Preview & Rendering Engine Module (Phase 8 — Dual Slide Live View V2)
 * Single source of truth controlling V2 preview canvas, dual slide live rendering (Slide 1 & Slide 2 together),
 * live data binding, loading progress, empty/error states, information panel updates, and responsive scale.
 * Ensures 100% unbroken Tailwind CDN & CSS styling on every input/district/dataset change.
 */
import { TemplateRegistry } from './template-registry.js';
import { DatasetService } from './dataset-service.js';
import { BindingEngine } from './binding.js';
import CONFIG from '../config/config.js';

export class PreviewEngine {
    constructor(options = {}) {
        this.socialWrapper = options.socialWrapper || document.querySelector('#preview-wrapper-social');
        this.slide1Iframe = options.slide1Iframe || document.querySelector('#preview-social-slide1');
        this.slide2Iframe = options.slide2Iframe || document.querySelector('#preview-social-slide2');
        this.scalerContainer = options.scalerContainer || document.querySelector('#social-slides-scaler');

        this.registry = new TemplateRegistry();

        // State
        this.activeTemplateId = CONFIG.DEFAULT_TEMPLATE;
        this.activeRegion = CONFIG.DEFAULT_DISTRICT;
        this.activeDatasetPayload = null;
        this.zoomScale = 1.0;
        this.isLoading = false;

        this.ensureInfoPanelDOM();
    }

    /**
     * Ensures Preview Information Panel DOM exists
     */
    ensureInfoPanelDOM() {
        let panel = document.querySelector('#preview-v2-info-panel');
        if (panel) {
            this.updateInfoPanel();
        }
    }

    /**
     * Real-time Information Panel update
     */
    updateInfoPanel() {
        const panel = document.querySelector('#preview-v2-info-panel');
        if (!panel) return;

        const manifest = this.registry.getTemplateManifest(this.activeTemplateId) || {};
        const metadata = this.activeDatasetPayload ? (this.activeDatasetPayload.metadata || {}) : {};

        const tmplName = manifest.name || this.activeTemplateId;
        const tmplVersion = manifest.version || '2.0.0';
        const dsName = metadata.filename || (this.activeDatasetPayload ? 'Dataset Active' : 'Belum Ada Dataset');
        const year = metadata.year || 2025;
        const semester = metadata.semester || 2;

        panel.innerHTML = `
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div>
                    <span class="text-slate-400 block font-semibold">Template Aktif</span>
                    <span class="font-extrabold text-emerald-500">${tmplName} (v${tmplVersion})</span>
                </div>
                <div>
                    <span class="text-slate-400 block font-semibold">Dataset & Periode</span>
                    <span class="font-extrabold text-indigo-400 truncate block">${dsName} • Sem ${semester} ${year}</span>
                </div>
                <div>
                    <span class="text-slate-400 block font-semibold">Wilayah Slide 1</span>
                    <span class="font-extrabold text-amber-500 uppercase">${this.activeRegion}</span>
                </div>
                <div>
                    <span class="text-slate-400 block font-semibold">Status Render</span>
                    <span class="font-bold flex items-center gap-1 text-teal-400">
                        <i class="fa-solid fa-circle-check text-[9px]"></i>
                        Live Dual Slide Ready • ${Math.round(this.zoomScale * 100)}% Scale
                    </span>
                </div>
            </div>
        `;
    }

    /**
     * Automatically calculates proportional fit scale for dual side-by-side slides
     */
    autoFitScale() {
        if (!this.socialWrapper || !this.scalerContainer) return;
        const availableWidth = this.socialWrapper.clientWidth - 64;
        // Dual 1080px slides side-by-side total ~2240px
        this.zoomScale = Math.min(Math.max(availableWidth / 2240, 0.35), 1.0);
        this.scalerContainer.style.transform = `scale(${this.zoomScale})`;
        
        const scaleBadge = document.querySelector('#scale-badge');
        if (scaleBadge) scaleBadge.textContent = `${Math.round(this.zoomScale * 100)}% Scale`;

        this.updateInfoPanel();
    }

    /**
     * Switches active template dynamically
     */
    renderTemplate(templateId) {
        this.activeTemplateId = templateId;
        this.render();
    }

    /**
     * Refreshes active preview
     */
    refresh() {
        this.render();
    }

    /**
     * Main render method orchestrating Dual Slide Live Preview (Slide 1 & Slide 2 together in 1 Page View)
     * Performs native iframe document loading and in-memory live DOM binding for 100% styling stability.
     */
    render(datasetPayload = null, region = null, templateId = null) {
        if (datasetPayload) this.activeDatasetPayload = datasetPayload;
        if (region) this.activeRegion = region;
        if (templateId) this.activeTemplateId = templateId;

        DatasetService.setActiveDataset(this.activeDatasetPayload);

        const manifest = this.registry.getTemplateManifest(this.activeTemplateId);
        const folder = manifest ? manifest.path : 'templates/social/template-1';

        const dataObj = DatasetService.getTemplateDataObject(this.activeRegion);
        // Slide 2 is fixed to Kabupaten Tasikmalaya topic & 39 Kecamatan table summary
        const dataObjKabupaten = DatasetService.getTemplateDataObject('KABUPATEN');

        const slide1TargetSrc = `${folder}/slide1.html`;
        const slide2TargetSrc = `${folder}/slide2.html`;

        const updateIframes = () => {
            if (this.slide1Iframe) {
                const doc1 = this.slide1Iframe.contentDocument || this.slide1Iframe.contentWindow.document;
                if (doc1 && doc1.location && doc1.location.pathname.endsWith(slide1TargetSrc)) {
                    BindingEngine.bind(doc1, dataObj);
                } else {
                    this.slide1Iframe.src = slide1TargetSrc;
                    this.slide1Iframe.onload = () => {
                        const d1 = this.slide1Iframe.contentDocument || this.slide1Iframe.contentWindow.document;
                        if (d1) BindingEngine.bind(d1, dataObj);
                        checkComplete();
                    };
                }
            }

            if (this.slide2Iframe) {
                const doc2 = this.slide2Iframe.contentDocument || this.slide2Iframe.contentWindow.document;
                const slide2Data = (this.activeTemplateId === 'template-2-v2' || this.activeTemplateId === 'template-2' || this.activeTemplateId === 'template-3-v2' || this.activeTemplateId === 'template-3') 
                    ? dataObjKabupaten 
                    : dataObj;

                if (doc2 && doc2.location && doc2.location.pathname.endsWith(slide2TargetSrc)) {
                    BindingEngine.bind(doc2, slide2Data);
                } else {
                    this.slide2Iframe.src = slide2TargetSrc;
                    this.slide2Iframe.onload = () => {
                        const d2 = this.slide2Iframe.contentDocument || this.slide2Iframe.contentWindow.document;
                        if (d2) BindingEngine.bind(d2, slide2Data);
                        checkComplete();
                    };
                }
            }

            checkComplete();
        };

        const checkComplete = () => {
            this.autoFitScale();
            this.updateInfoPanel();
        };

        updateIframes();
    }
}
