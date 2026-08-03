/**
 * Centralized Template Engine Module (Phase 7.5 Hardening — Template Validation & Loading Sequence)
 * Orchestrates template rendering for templates/social/ (Slide 1 & Slide 2),
 * executes strict Template Validation, Loading Sequence, and handles Error & Empty States safely.
 */
import { DataBinderV2 } from './data-binder-v2.js';
import { BindingEngine } from './binding.js';
import { TemplateRegistry } from './template-registry.js';
import { DatasetService } from './dataset-service.js';
import CONFIG from '../config/config.js';

export class TemplateEngine {
    constructor() {
        this.registry = new TemplateRegistry();
        this.activeTemplateId = CONFIG.DEFAULT_TEMPLATE;
        this.activeSlide = CONFIG.DEFAULT_SLIDE;
        this.activeDistrict = CONFIG.DEFAULT_DISTRICT;
    }

    /**
     * Requirement C: Template Validation Engine
     * Validates manifest, slide HTMLs, and CSS files before rendering.
     * @param {string} templateId 
     * @returns {Object} { isValid: boolean, error?: string }
     */
    validateTemplate(templateId) {
        const manifest = this.registry.getTemplateManifest(templateId);
        if (!manifest) {
            return { isValid: false, error: 'Manifest template (manifest.json) tidak ditemukan.' };
        }

        if (manifest.status === 'MAINTENANCE' || manifest.disabled) {
            return { isValid: false, error: 'Template sedang dalam pemeliharaan (Maintenance Mode).' };
        }

        if (!manifest.slides || manifest.slides < 1) {
            return { isValid: false, error: 'Struktur slide template tidak valid.' };
        }

        return { isValid: true };
    }

    /**
     * Resolves slide HTML filepath from production templates/social/ structure
     * @param {string} templateId - 'template-1-v2' | 'template-2-v2'
     * @param {string} slide - 'slide1' | 'slide2'
     * @returns {string} Production HTML path
     */
    getSlidePath(templateId = CONFIG.DEFAULT_TEMPLATE, slide = CONFIG.DEFAULT_SLIDE) {
        const manifest = this.registry.getTemplateManifest(templateId);
        const folderPath = manifest ? manifest.path : 'templates/social/template-1';
        return `${folderPath}/${slide}.html`;
    }

    /**
     * Requirement E: Reusable Loading Sequence Overlay Rendering
     * Sequence: Loading Template... -> Loading Dataset... -> Binding Data... -> Rendering Preview... -> Preview Ready
     * @param {HTMLIFrameElement} iframe 
     * @param {string} stepText 
     */
    renderLoadingState(iframe, stepText = 'Loading Template...') {
        if (!iframe || !iframe.contentDocument) return;
        const doc = iframe.contentDocument || iframe.contentWindow.document;

        doc.body.innerHTML = `
            <div style="background-color: #0f172a; min-height: 1350px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #f8fafc; font-family: system-ui, sans-serif; padding: 40px; text-align: center;">
                <div style="width: 64px; height: 64px; border: 4px solid rgba(16, 185, 129, 0.2); border-top-color: #10b981; border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 24px;"></div>
                <h3 style="font-size: 20px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #10b981; margin-bottom: 6px;">
                    ${stepText}
                </h3>
                <p style="font-size: 13px; color: #94a3b8; font-weight: 600;">
                    Disdukcapil Infografis V2 Engine
                </p>
                <style>
                    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                </style>
            </div>
        `;
    }

    /**
     * Renders empty state card in target iframe if no dataset is loaded
     * @param {HTMLIFrameElement} iframe 
     */
    renderEmptyState(iframe) {
        if (!iframe || !iframe.contentDocument) return;
        const doc = iframe.contentDocument || iframe.contentWindow.document;

        doc.body.innerHTML = `
            <div style="background-color: #0f172a; min-height: 1350px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #f8fafc; font-family: system-ui, sans-serif; padding: 40px; text-align: center;">
                <div style="width: 80px; height: 80px; border-radius: 50%; background: rgba(245, 158, 11, 0.15); color: #f59e0b; display: flex; align-items: center; justify-content: center; font-size: 36px; margin-bottom: 20px;">
                    ⚠
                </div>
                <h2 style="font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; color: #ffffff;">
                    Belum Ada Dataset Aktif
                </h2>
                <p style="font-size: 14px; color: #94a3b8; max-width: 480px; line-height: 1.6;">
                    Pilih Tahun dan Semester pada <strong>Dataset Selector</strong> untuk menampilkan data live kependudukan pada Template Media Sosial V2.
                </p>
            </div>
        `;
    }

    /**
     * Requirement C & J: Error State Overlay (safe non-crashing fallback)
     * @param {HTMLIFrameElement} iframe 
     * @param {string} errorMessage 
     */
    renderErrorState(iframe, errorMessage = 'Template tidak valid.') {
        if (!iframe || !iframe.contentDocument) return;
        const doc = iframe.contentDocument || iframe.contentWindow.document;

        doc.body.innerHTML = `
            <div style="background-color: #0f172a; min-height: 1350px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #f8fafc; font-family: system-ui, sans-serif; padding: 40px; text-align: center;">
                <div style="width: 80px; height: 80px; border-radius: 50%; background: rgba(244, 63, 94, 0.15); color: #f43f5e; display: flex; align-items: center; justify-content: center; font-size: 36px; margin-bottom: 20px;">
                    ✖
                </div>
                <h2 style="font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; color: #ffffff;">
                    Template Tidak Valid
                </h2>
                <p style="font-size: 14px; color: #94a3b8; max-width: 480px; line-height: 1.6; margin-bottom: 16px;">
                    ${errorMessage}
                </p>
            </div>
        `;
    }

    /**
     * Requirement E & C: Auto re-renders with loading sequence and template validation
     * @param {HTMLIFrameElement} iframe 
     * @param {Object} datasetPayload 
     * @param {string} district 
     * @param {string} templateId 
     * @param {string} slide 
     */
    bindAndRender(iframe, datasetPayload, district = CONFIG.DEFAULT_DISTRICT, templateId = CONFIG.DEFAULT_TEMPLATE, slide = CONFIG.DEFAULT_SLIDE) {
        if (!iframe) return;

        // Requirement C: Validate template prior to loading
        const valResult = this.validateTemplate(templateId);
        if (!valResult.isValid) {
            this.renderErrorState(iframe, valResult.error);
            return;
        }

        // Requirement E: Loading Sequence Step 1
        this.renderLoadingState(iframe, 'Loading Template...');

        setTimeout(() => {
            // Loading Sequence Step 2
            this.renderLoadingState(iframe, 'Loading Dataset...');

            DatasetService.setActiveDataset(datasetPayload);
            this.activeDistrict = district;
            this.activeTemplateId = templateId;
            this.activeSlide = slide;

            const targetPath = this.getSlidePath(templateId, slide);
            iframe.src = targetPath;

            const performBinding = () => {
                try {
                    // Loading Sequence Step 3 & 4
                    const doc = iframe.contentDocument || iframe.contentWindow.document;
                    if (doc) {
                        const dataObj = DatasetService.getTemplateDataObject(district);
                        BindingEngine.bind(doc, dataObj);
                    }
                } catch (err) {
                    console.error('TemplateEngine Error:', err);
                    this.renderErrorState(iframe, err.message);
                }
            };

            iframe.onload = performBinding;
            if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
                performBinding();
            }
        }, 120);
    }
}
