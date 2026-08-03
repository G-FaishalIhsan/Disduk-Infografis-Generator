/**
 * Social Export Engine Orchestrator Module (Phase 9 — Social Export Engine V2)
 * Single source of truth controlling V2 Social Media Workspace exports.
 * Executes unified export pipeline:
 * Collect Context -> Resolve Dataset -> Resolve Template -> Build Export Context -> Render HTML -> Call Export Driver -> Download -> Finish
 */

import { EXPORT_STATES, globalExportState } from './export-state.js';
import { DatasetService } from './dataset-service.js';
import { TemplateRegistry } from './template-registry.js';
import { BindingEngine } from './binding.js';
import { PngExporter } from '../exporters/png-exporter.js';
import { JpgExporter } from '../exporters/jpg-exporter.js';
import { PdfExporter } from '../exporters/pdf-exporter.js';
import { ZipExporter } from '../exporters/zip-exporter.js';

export class SocialExportEngine {
    constructor(options = {}) {
        this.app = options.app || null;
        this.templateRegistry = new TemplateRegistry();
        this.exportState = options.exportState || globalExportState;

        // Exporter Drivers
        this.pngExporter = new PngExporter();
        this.jpgExporter = new JpgExporter();
        this.pdfExporter = new PdfExporter();
        this.zipExporter = new ZipExporter();

        this._currentExportFormat = 'pdf';

        // Connect ExportState to Loading Toast UI
        this.exportState.subscribe((state, stepText, percent) => {
            const format = this._currentExportFormat || 'pdf';
            const toastService = this.app && this.app.exportService ? this.app.exportService : null;

            if (state === EXPORT_STATES.IDLE || state === EXPORT_STATES.FINISHED || state === EXPORT_STATES.ERROR) {
                if (toastService) {
                    setTimeout(() => toastService.hideLoadingToast(), 800);
                }
            } else if (state !== EXPORT_STATES.IDLE) {
                if (toastService) {
                    const fmtLabel = format === 'zip' ? 'social' : format;
                    toastService.showLoadingToast(fmtLabel);
                    toastService.updateToastText(`Mengekspor Media Sosial (${percent}%)...`, stepText);
                }
            }
        });
    }

    /**
     * Unified Export Pipeline for Social Media Workspace V2
     * @param {string} format - 'png' | 'jpg' | 'pdf' | 'zip'
     * @param {number} slideIndex - 1-based index (optional for PNG/JPG)
     */
    async executeExportPipeline(format, slideIndex = 1) {
        this._currentExportFormat = format;
        // 1. Queue Lock & Pre-checks
        if (!this.exportState.acquireLock()) {
            alert('Proses ekspor sedang berjalan. Harap tunggu hingga selesai.');
            return;
        }

        try {
            // Step A: Preparing Export
            this.exportState.setState(EXPORT_STATES.PREPARING, 'Preparing Export...', 5);

            // Step B: Resolve Dataset from DatasetService
            this.exportState.setState(EXPORT_STATES.LOADING_DATASET, 'Loading Dataset...', 15);
            const datasetPayload = DatasetService.getActiveDataset();
            if (!datasetPayload) {
                alert('Dataset belum dipilih.');
                this.exportState.setState(EXPORT_STATES.ERROR, 'Dataset belum dipilih.', 0);
                return;
            }

            // Step C: Resolve Active Template & Manifest
            this.exportState.setState(EXPORT_STATES.LOADING_TEMPLATE, 'Loading Template...', 25);
            const templateId = (this.app && this.app.selectedSocialTemplateId) 
                ? this.app.selectedSocialTemplateId 
                : 'template-1-v2';

            const manifest = this.templateRegistry.getTemplateManifest(templateId);
            if (!manifest) {
                alert('Template belum dipilih.');
                this.exportState.setState(EXPORT_STATES.ERROR, 'Template belum dipilih.', 0);
                return;
            }

            // Step D: Build Export Context
            this.exportState.setState(EXPORT_STATES.BINDING, 'Binding Data...', 40);
            const exportContext = await this.buildExportContext(templateId, manifest, datasetPayload);

            // Step E: Call Exporter Driver & Render Slides
            this.exportState.setState(EXPORT_STATES.RENDERING, 'Rendering Slide...', 60);

            let exportResult = null;

            if (format === 'png') {
                exportResult = await this.pngExporter.export(exportContext, slideIndex);
            } else if (format === 'jpg') {
                exportResult = await this.jpgExporter.export(exportContext, slideIndex);
            } else if (format === 'pdf') {
                exportResult = await this.pdfExporter.export(exportContext);
            } else if (format === 'zip') {
                this.exportState.setState(EXPORT_STATES.COMPRESSING, 'Generating Output...', 85);
                exportResult = await this.zipExporter.export(exportContext, (idx, total, text) => {
                    const pct = 60 + Math.round((idx / total) * 30);
                    this.exportState.setState(EXPORT_STATES.COMPRESSING, text, pct);
                });
            } else {
                throw new Error(`Format ekspor tidak dikenali: ${format}`);
            }

            // Step F: Trigger Download & Finish
            this.exportState.setState(EXPORT_STATES.FINISHED, 'Preparing Download...', 95);
            if (exportResult && exportResult.blob) {
                this.triggerFileDownload(exportResult.blob, exportResult.filename);
            }

            this.exportState.setState(EXPORT_STATES.FINISHED, 'Export Finished', 100);

            setTimeout(() => {
                this.exportState.reset();
            }, 1500);

        } catch (err) {
            console.error('[SocialExportEngine] Export Pipeline Error:', err);
            alert(`Export gagal. Silakan coba kembali.\nDetail: ${err.message}`);
            this.exportState.setState(EXPORT_STATES.ERROR, 'Export gagal. Silakan coba kembali.', 0);
        }
    }

    /**
     * Builds standardized ExportContext required by exporters
     */
    async buildExportContext(templateId, manifest, datasetPayload) {
        const metadata = datasetPayload.metadata || {};
        const year = metadata.year || 2025;
        const semester = metadata.semester || 2;
        const mode = (this.app && this.app.currentMode) || 'Kabupaten';
        const rawDistrict = (this.app && this.app.selectedDistrict) || 'SINGAPARNA';

        const isKecamatanMode = mode === 'Kecamatan';
        const cleanDistrict = rawDistrict.toLowerCase().replace(/[^a-z0-9]/g, '');

        // Standardized Template Key Name (template-1-v2 -> template1)
        const tmplClean = templateId.replace(/-v2$/i, '').replace(/[^a-z0-9]/g, '');

        const slideCount = manifest.slides || 2;
        const folderPath = manifest.path || 'templates/social/template-1';

        // Detect Active Theme
        const theme = this.detectActiveTheme();

        // Standardized Filenames per Rule 9
        const filenames = {
            png: [],
            jpg: [],
            pdf: '',
            zip: '',
            zipSlides: []
        };

        const yearSemStr = `${year}_sem${semester}`;

        for (let i = 1; i <= slideCount; i++) {
            if (isKecamatanMode) {
                filenames.png.push(`${tmplClean}_${yearSemStr}_${cleanDistrict}_slide${i}.png`);
                filenames.jpg.push(`${tmplClean}_${yearSemStr}_${cleanDistrict}_slide${i}.jpg`);
                filenames.zipSlides.push(`${tmplClean}_${yearSemStr}_${cleanDistrict}_slide${i}.png`);
            } else {
                filenames.png.push(`${tmplClean}_${yearSemStr}_slide${i}.png`);
                filenames.jpg.push(`${tmplClean}_${yearSemStr}_slide${i}.jpg`);
                filenames.zipSlides.push(`${tmplClean}_${yearSemStr}_slide${i}.png`);
            }
        }

        if (isKecamatanMode) {
            filenames.pdf = `${tmplClean}_${yearSemStr}_${cleanDistrict}.pdf`;
            filenames.zip = `${tmplClean}_${yearSemStr}_${cleanDistrict}.zip`;
        } else {
            filenames.pdf = `${tmplClean}_${yearSemStr}.pdf`;
            filenames.zip = `${tmplClean}_${yearSemStr}.zip`;
        }

        // Fetch & Prepare Bound HTML string for each slide
        const htmlSlides = [];
        const targetRegion = isKecamatanMode ? rawDistrict : 'KABUPATEN';

        for (let i = 1; i <= slideCount; i++) {
            const slideSrc = `${folderPath}/slide${i}.html`;
            const rawHtml = await this.fetchHtmlTemplate(slideSrc);

            // Determine data object for slide (Slide 2 for Template 2 V2 fixed to Kabupaten topic)
            const isTemplate2Slide2 = (templateId === 'template-2-v2' || templateId === 'template-2') && i === 2;
            const regionForSlide = isTemplate2Slide2 ? 'KABUPATEN' : targetRegion;

            const boundHtml = this.bindDatasetToHtml(rawHtml, datasetPayload, regionForSlide, theme);
            htmlSlides.push(boundHtml);
        }

        return {
            templateId,
            manifest,
            dataset: datasetPayload,
            year,
            semester,
            district: isKecamatanMode ? cleanDistrict : null,
            mode,
            theme,
            slides: slideCount,
            htmlSlides,
            filenames
        };
    }

    /**
     * Binds dataset payload and theme snapshot directly into HTML string DOM
     */
    bindDatasetToHtml(rawHtml, datasetPayload, region, theme) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(rawHtml, 'text/html');

        // 1. Inject Theme Snapshot into <html> tag
        if (doc.documentElement) {
            doc.documentElement.classList.remove('light', 'dark');
            if (theme === 'dark') {
                doc.documentElement.classList.add('dark');
            } else {
                doc.documentElement.classList.add('light');
            }
        }

        // 2. Perform Binding using DataBinderV2 Single Source of Truth
        const dataObj = DatasetService.getTemplateDataObject(region);
        BindingEngine.bind(doc, dataObj);

        // 3. Serialize back to complete HTML document string
        return '<!DOCTYPE html>\n' + doc.documentElement.outerHTML;
    }

    /**
     * Fetches raw template HTML string from server
     */
    async fetchHtmlTemplate(path) {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`Gagal memuat file template: ${path} (${response.status})`);
        }
        return await response.text();
    }

    /**
     * Detects current active UI theme (light, dark, or system)
     */
    detectActiveTheme() {
        if (document.documentElement.classList.contains('dark')) {
            return 'dark';
        }
        return 'light';
    }

    /**
     * Triggers file download in browser using temporary <a> element
     */
    triggerFileDownload(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 5000);
    }

    // Public API Methods

    async exportPNG(slideIndex = 1) {
        await this.executeExportPipeline('png', slideIndex);
    }

    async exportJPG(slideIndex = 1) {
        await this.executeExportPipeline('jpg', slideIndex);
    }

    async exportPDF() {
        await this.executeExportPipeline('pdf');
    }

    async exportZIP() {
        await this.executeExportPipeline('zip');
    }
}
