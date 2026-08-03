/**
 * Main Application Controller (Phase 10.1 — Data Lifecycle Separation V1 & V2)
 * Orchestrates Workspace State Isolation, Auto-Loading, Sidebar UI, Template Loader, Data Binding,
 * AutoFitter, Preview Engine, Export Service V1 (Full Workspace), and Social Export Engine V2 (Social Workspace).
 */
import { SidebarUI } from './ui/sidebar.js';
import { PdfParser } from './parsers/pdf-parser.js';
import { TemplateLoader } from './engine/template-loader.js';
import { DataBinder } from './engine/data-binder.js';
import { DataBinderV2 } from './engine/data-binder-v2.js';
import { AutoFitter } from './engine/auto-fitter.js';
import { ExportEngine } from './engine/export-engine.js';
import { SocialExportEngine } from './engine/social-export-engine.js';
import { PreviewEngine } from './engine/preview-engine.js';
import { DatasetService } from './engine/dataset-service.js';
import { DatasetManager } from './excel/datasetManager.js';
import { ThemeController } from './ui/theme-controller.js';

export class App {
    constructor() {
        // App Mode & Workspace Controls
        this.activeWorkspace = 'full'; // 'full' (Infografis Lengkap V1) | 'social' (Media Sosial V2)
        this.currentMode = 'Kabupaten'; // 'Kabupaten' | 'Kecamatan'
        this.selectedTemplateId = 'template-1';
        this.selectedSocialTemplateId = 'template-1-v2';
        this.selectedDistrict = 'SINGAPARNA';

        // Core Engines & Tools
        this.pdfParser = new PdfParser();
        this.templateLoader = new TemplateLoader();
        this.dataBinderV1 = new DataBinder();
        this.dataBinder = DataBinderV2;
        this.autoFitter = new AutoFitter();
        this.exportService = new ExportEngine(); // V1 ExportEngine
        this.datasetManager = new DatasetManager();
        this.socialExportEngine = new SocialExportEngine({ app: this }); // V2 SocialExportEngine
        this.themeController = new ThemeController({
            onChange: () => {
                if (this.exportService) this.exportService.updateToastTheme();
                if (this.sidebar && this.sidebar.socialExportModal) this.sidebar.socialExportModal.updateTheme();
            }
        });

        // UI & Frame References
        this.iframeElement = null;
        this.fullWrapper = null;
        this.socialWrapper = null;
        this.previewEngine = null;
        this.sidebar = null;

        // ======================================================
        // FULL WORKSPACE STATE (V1)
        // Source: PdfParser (Hierarchical JSON)
        // Ownership: V1 Only — Never modified by Excel/DatasetManager
        // ======================================================
        this.activeFullData = null;

        // ======================================================
        // SOCIAL WORKSPACE STATE (V2)
        // Source: DatasetManager (Flat Excel Payload)
        // Ownership: V2 Only — Never modified by PdfParser
        // ======================================================
        this.activeSocialDataset = null;

        this.lastExactUnscaledHeight = 1600;

        this.init();
    }

    /**
     * Phase 10.1 Structured App Initialization Lifecycle
     */
    async init() {
        this.initializeFullWorkspace();
        this.initializeSocialWorkspace();
        this.initializeServices();
        this.initializeUI();
        this.bindEvents();

        // Initial Render based on active workspace
        if (this.activeWorkspace === 'social') {
            await this.handleSocialPreview(this.selectedSocialTemplateId);
        } else {
            await this.renderCurrentState();
        }
    }

    /**
     * 1. Initialize V1 Full Workspace State (Hierarchical PDF JSON)
     */
    initializeFullWorkspace() {
        const targetRegion = this.currentMode === 'Kabupaten' ? 'KABUPATEN' : this.selectedDistrict;
        this.activeFullData = targetRegion === 'KABUPATEN'
            ? this.pdfParser.getKabupatenData()
            : this.pdfParser.getDistrictData(targetRegion);
    }

    /**
     * 2. Initialize V2 Social Workspace State (Flat Excel Payload)
     */
    initializeSocialWorkspace() {
        this.activeSocialDataset = this.datasetManager.getDataset(2025, 2);
    }

    /**
     * 3. Initialize Shared & Abstraction Services
     */
    initializeServices() {
        if (this.activeSocialDataset) {
            DatasetService.setActiveDataset(this.activeSocialDataset);
        }
    }

    /**
     * 4. Initialize DOM Element References, Preview Engine, and Sidebar UI
     */
    initializeUI() {
        this.iframeElement = document.querySelector('#preview-iframe');
        this.fullWrapper = document.querySelector('#preview-wrapper-full');
        this.socialWrapper = document.querySelector('#preview-wrapper-social');

        // Initialize Preview Engine for Social Media Workspace
        if (this.socialWrapper) {
            this.previewEngine = new PreviewEngine({
                socialWrapper: this.socialWrapper,
                slide1Iframe: document.querySelector('#preview-social-slide1'),
                slide2Iframe: document.querySelector('#preview-social-slide2'),
                scalerContainer: document.querySelector('#social-slides-scaler')
            });
        }

        // Initialize Sidebar UI
        const sidebarContainer = document.querySelector('#sidebar-container') || document.querySelector('#sidebar');

        this.sidebar = new SidebarUI({
            container: sidebarContainer,
            templates: [
                { id: 'template-1', name: 'Template 1', ratio: 'A4 Single Page' },
                { id: 'template-2', name: 'Template 2', ratio: 'Makro 39 Kec' },
                { id: 'template-3', name: 'Template 3', ratio: 'Compact Summary' }
            ],
            districts: this.pdfParser.getDistrictList(),
            onWorkspaceChange: (ws) => this.handleWorkspaceChange(ws),
            onTemplateChange: (templateId) => this.handleTemplateChange(templateId),
            onModeChange: (mode, district) => this.handleModeChange(mode, district),
            onDistrictChange: (district) => this.handleDistrictChange(district),
            onFileUpload: (file) => this.handleFileUpload(file),
            onGenerate: () => this.handleGenerate(),
            onExportPNG: () => this.handleExport('png'),
            onExportJPG: () => this.handleExport('jpg'),
            onExportPDF: () => this.handleExport('pdf'),
            onExportZIP: () => this.handleExportZIP(),
            onExportSocial: (socialTemplateId) => this.handleSocialPreview(socialTemplateId)
        });

        // Register dataset selector callback for V2 Excel datasets
        if (this.sidebar && this.sidebar.datasetManagerUI) {
            this.sidebar.datasetManagerUI.onDatasetSelect = (datasetObj) => this.handleDatasetSelected(datasetObj);
        }
    }

    /**
     * 5. Bind Window Level Events (Resize Listener)
     */
    bindEvents() {
        window.addEventListener('resize', () => {
            if (this.activeWorkspace === 'full') {
                this.updateScale();
            }
        });
    }

    /**
     * Workspace Transition Handler (Stateless & Independent)
     */
    async handleWorkspaceChange(ws) {
        this.activeWorkspace = ws;
        const previewTitle = document.querySelector('#preview-title');

        if (ws === 'social') {
            if (previewTitle) previewTitle.textContent = 'Preview • Template Media Sosial V2 (Slide 1 & 2 Live)';
            if (this.fullWrapper) this.fullWrapper.classList.add('hidden');
            if (this.socialWrapper) this.socialWrapper.classList.remove('hidden');

            await this.handleSocialPreview(this.selectedSocialTemplateId);
        } else {
            const tmplLabel = this.selectedTemplateId === 'template-2' ? 'Template 2' : (this.selectedTemplateId === 'template-3' ? 'Template 3' : 'Template 1');
            if (previewTitle) previewTitle.textContent = `Preview • ${tmplLabel}`;
            if (this.socialWrapper) this.socialWrapper.classList.add('hidden');
            if (this.fullWrapper) this.fullWrapper.classList.remove('hidden');

            await this.renderCurrentState();
        }
    }

    /**
     * V2 Dataset Change Handler (Updates V2 Social State only)
     */
    async handleDatasetSelected(datasetObj) {
        if (!datasetObj) return;
        this.activeSocialDataset = datasetObj;
        DatasetService.setActiveDataset(datasetObj);
        
        if (this.sidebar) {
            this.sidebar.updateActiveDatasetInfo(datasetObj);
        }

        if (this.activeWorkspace === 'social') {
            await this.handleSocialPreview(this.selectedSocialTemplateId);
        }
    }

    /**
     * V2 Social Preview Handler
     */
    async handleSocialPreview(socialTemplateId) {
        this.selectedSocialTemplateId = socialTemplateId;

        const previewTitle = document.querySelector('#preview-title');
        const tmplLabel = socialTemplateId === 'template-2-v2' ? 'Template 2 V2' : 'Template 1 V2';
        if (previewTitle) previewTitle.textContent = `Preview • ${tmplLabel} (Slide 1 & 2 Live)`;

        const targetRegion = this.currentMode === 'Kabupaten' ? 'KABUPATEN' : this.selectedDistrict;
        
        if (this.previewEngine) {
            this.previewEngine.render(
                this.activeSocialDataset,
                targetRegion,
                socialTemplateId
            );
        }
    }

    async handleTemplateChange(templateId) {
        this.selectedTemplateId = templateId;
        const previewTitle = document.querySelector('#preview-title');
        const tmplLabel = templateId === 'template-2' ? 'Template 2' : (templateId === 'template-3' ? 'Template 3' : 'Template 1');
        if (previewTitle) previewTitle.textContent = `Preview • ${tmplLabel}`;

        if (this.activeWorkspace === 'full') {
            await this.renderCurrentState();
        }
    }

    async handleModeChange(mode, district) {
        this.currentMode = mode;
        if (district) this.selectedDistrict = district;

        if (this.activeWorkspace === 'social') {
            await this.handleSocialPreview(this.selectedSocialTemplateId);
        } else {
            await this.renderCurrentState();
        }
    }

    async handleDistrictChange(district) {
        this.selectedDistrict = district;
        if (this.activeWorkspace === 'social') {
            await this.handleSocialPreview(this.selectedSocialTemplateId);
        } else {
            await this.renderCurrentState();
        }
    }

    async handleFileUpload(file) {
        await this.pdfParser.parsePdfFile(file);
        await this.renderCurrentState();
    }

    /**
     * V1 Full Workspace Render Handler (Uses activeFullData strictly)
     */
    async renderCurrentState() {
        if (this.activeWorkspace === 'social') return;

        if (this.iframeElement) {
            this.iframeElement.style.height = 'auto';
        }

        const targetRegion = this.currentMode === 'Kabupaten' ? 'KABUPATEN' : this.selectedDistrict;
        this.activeFullData = targetRegion === 'KABUPATEN'
            ? this.pdfParser.getKabupatenData()
            : this.pdfParser.getDistrictData(targetRegion);

        const doc = await this.templateLoader.loadTemplate(this.selectedTemplateId, this.iframeElement);
        if (!doc) return;

        this.dataBinderV1.bind(doc, this.activeFullData);

        const container = doc.querySelector('#infographic-container') || doc.body;
        const validationReport = this.autoFitter.fit(container);

        if (validationReport && !validationReport.isValid) {
            console.warn('AutoFitter detected and resolved boundary issues:', validationReport.issues);
        }

        setTimeout(() => {
            const containerEl = doc.querySelector('#infographic-container') || doc.body;
            const exactUnscaledHeight = Math.ceil(containerEl.getBoundingClientRect().height);
            this.lastExactUnscaledHeight = exactUnscaledHeight > 100 ? exactUnscaledHeight : 1600;

            this.iframeElement.style.height = `${this.lastExactUnscaledHeight}px`;
            this.updateScale();
        }, 150);
    }

    updateScale() {
        if (!this.iframeElement || this.activeWorkspace === 'social') return;

        const parent = this.iframeElement.parentElement;
        if (!parent) return;

        const containerWidth = parent.clientWidth - 48;
        const targetWidth = 1200;

        if (containerWidth > 0 && containerWidth < targetWidth) {
            const scale = containerWidth / targetWidth;
            this.iframeElement.style.transform = `scale(${scale})`;
            this.iframeElement.style.transformOrigin = 'top center';
            this.iframeElement.style.width = `${targetWidth}px`;

            const scaledHeight = Math.ceil(this.lastExactUnscaledHeight * scale);
            parent.style.height = `${scaledHeight + 40}px`;
        } else {
            this.iframeElement.style.transform = 'none';
            this.iframeElement.style.width = '100%';
            parent.style.height = 'auto';
        }
    }

    async handleGenerate() {
        if (this.activeWorkspace === 'social') {
            await this.handleSocialPreview(this.selectedSocialTemplateId);
        } else {
            await this.renderCurrentState();
        }
    }

    async handleExport(format) {
        if (this.activeWorkspace === 'social') {
            // V2 Social Export Engine
            if (format === 'png') await this.socialExportEngine.exportPNG(1);
            else if (format === 'jpg') await this.socialExportEngine.exportJPG(1);
            else if (format === 'pdf') await this.socialExportEngine.exportPDF();
        } else {
            // V1 Export Engine
            const targetRegion = this.currentMode === 'Kabupaten' ? 'KABUPATEN' : this.selectedDistrict;
            const filename = `INFOGRAFIS_${targetRegion}_${Date.now()}`;
            const payloadData = {
                templateId: this.selectedTemplateId,
                data: this.activeFullData || (targetRegion === 'KABUPATEN'
                    ? this.pdfParser.getKabupatenData()
                    : this.pdfParser.getDistrictData(targetRegion))
            };

            if (format === 'png') {
                await this.exportService.exportPNG(this.iframeElement, `${filename}.png`, payloadData);
            } else if (format === 'jpg') {
                await this.exportService.exportJPG(this.iframeElement, `${filename}.jpg`, payloadData);
            } else if (format === 'pdf') {
                await this.exportService.exportPDF(this.iframeElement, `${filename}.pdf`, payloadData);
            }
        }
    }

    async handleExportZIP() {
        if (this.activeWorkspace === 'social') {
            // V2 Social Export Engine ZIP
            await this.socialExportEngine.exportZIP();
        } else {
            // V1 Export Engine
            const slide1Frame = document.querySelector('#preview-social-slide1');
            const slide2Frame = document.querySelector('#preview-social-slide2');

            if (!slide1Frame || !slide2Frame) {
                alert('Slide pratinjau belum siap.');
                return;
            }

            const doc1 = slide1Frame.contentDocument || slide1Frame.contentWindow.document;
            const doc2 = slide2Frame.contentDocument || slide2Frame.contentWindow.document;

            const el1 = doc1.querySelector('.slide-canvas') || doc1.body;
            const el2 = doc2.querySelector('.slide-canvas') || doc2.body;

            const modeStr = this.currentMode === 'Kabupaten' ? 'KABUPATEN' : this.selectedDistrict;
            const filename = `CAROUSEL_SOCIAL_${modeStr}_${Date.now()}`;

            if (this.exportService.exportCarouselZip) {
                await this.exportService.exportCarouselZip([el1, el2], filename);
            }
        }
    }
}

// Auto-instantiate application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    if (!window.app) {
        window.app = new App();
    }
});
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    if (!window.app) {
        window.app = new App();
    }
}
