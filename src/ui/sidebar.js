/**
 * Sidebar UI Module (Phase 7 Refactor & Phase 8 Clean Data Status & Social Export Grid)
 * Clean, structured sections with dynamic Template Discovery from manifest.json files,
 * active Semester & Tahun status badge in Social Media workspace, full PNG/JPG/PDF/ZIP exports,
 * 100% Clickable Template Cards, and equalized "AKTIF" badge & "Aktif / Pilih" button states for Media Sosial.
 * Automatically triggers live data updates upon Mode and District changes.
 */
import { DatasetManagerUI } from './dataset-manager-ui.js';
import { TemplateRegistry } from '../engine/template-registry.js';

const KECAMATAN_CODE_MAP = {
    'CIPATUJAH': '320601',
    'KARANGNUNGGAL': '320602',
    'CIKALONG': '320603',
    'PANCATENGAH': '320604',
    'CIKATOMAS': '320605',
    'CIBALONG': '320606',
    'PARUNGPONTENG': '320607',
    'BANTARKALONG': '320608',
    'BOJONGASIH': '320609',
    'CULAMEGA': '320610',
    'BOJONGGAMBIR': '320611',
    'SODONGHILIR': '320612',
    'TARAJU': '320613',
    'SALAWU': '320614',
    'PUSPAHIANG': '320615',
    'TANJUNGJAYA': '320616',
    'SUKARAJA': '320617',
    'SALOPA': '320618',
    'JATIWARAS': '320619',
    'CINEAM': '320620',
    'KARANGJAYA': '320621',
    'MANONJAYA': '320622',
    'GUNUNGTANJUNG': '320623',
    'SINGAPARNA': '320624',
    'MANGUNREJA': '320625',
    'SUKARAME': '320626',
    'CIGALONTANG': '320627',
    'LEUWISARI': '320628',
    'PADAKEMBANG': '320629',
    'SARIWANGI': '320630',
    'SUKARATU': '320631',
    'CISAYONG': '320632',
    'SUKAHENING': '320633',
    'RAJAPOLAH': '320634',
    'JAMANIS': '320635',
    'CIAWI': '320636',
    'KADIPATEN': '320637',
    'PAGERAGEUNG': '320638',
    'PAGEURAGEUNG': '320638',
    'SUKARESIK': '320639'
};

export function formatKecamatanLabel(dName) {
    if (!dName) return '';
    const cleanName = String(dName).toUpperCase().replace(/^KECAMATAN\s+/i, '').trim();
    const code = KECAMATAN_CODE_MAP[cleanName] || '320600';
    return `${code} — ${cleanName}`;
}

export class SidebarUI {
    constructor(options = {}) {
        this.container = options.container;
        this.templates = options.templates || [];
        this.districts = options.districts || [];
        this.onTemplateChange = options.onTemplateChange || (() => {});
        this.onModeChange = options.onModeChange || (() => {});
        this.onDistrictChange = options.onDistrictChange || (() => {});
        this.onFileUpload = options.onFileUpload || (() => {});
        this.onGenerate = options.onGenerate || (() => {});
        this.onExportPNG = options.onExportPNG || (() => {});
        this.onExportJPG = options.onExportJPG || (() => {});
        this.onExportPDF = options.onExportPDF || (() => {});
        this.onExportZIP = options.onExportZIP || (() => {});
        this.onExportSocial = options.onExportSocial || (() => {});
        this.onWorkspaceChange = options.onWorkspaceChange || (() => {});

        this.activeWorkspace = 'full'; // 'full' (Infografis Lengkap) | 'social' (Media Sosial)
        this.currentMode = 'Kabupaten'; // 'Kabupaten' | 'Kecamatan'
        this.selectedTemplateId = 'template-1';
        this.selectedDistrict = 'SINGAPARNA';

        // Dynamic Year & Semester State
        this.selectedYear = 2025;
        this.selectedSemester = 2;

        // Log History Entries (Download Infografis Only)
        this.logs = options.logs || [];

        this.datasetManagerUI = new DatasetManagerUI();
        this.templateRegistry = new TemplateRegistry();

        // Full Infographics: Templates 1, 2, 3 (Compact Layout) are ALL ACTIVE
        this.fullTemplates = [
            { id: 'template-1', name: 'Template 1', desc: 'Single Page Standard', version: 'V1.0', status: 'AKTIF', badgeClass: 'v2-badge-active', ratio: 'A4 Single', icon: 'fa-file-invoice', disabled: false },
            { id: 'template-2', name: 'Template 2', desc: 'Kabupaten & 39 Kec', version: 'V1.0', status: 'AKTIF', badgeClass: 'v2-badge-active', ratio: 'Makro Page', icon: 'fa-table-list', disabled: false },
            { id: 'template-3', name: 'Template 3', desc: 'Compact Summary', version: 'V1.0', status: 'AKTIF', badgeClass: 'v2-badge-active', ratio: 'Compact', icon: 'fa-box-archive', disabled: false }
        ];

        // Dynamic Template Discovery from TemplateRegistry / manifest.json
        this.socialTemplates = this.templateRegistry.getSocialTemplates();

        this.render();
    }

    addLog(message) {
        const time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        this.logs.unshift({ time, message });
        if (this.logs.length > 25) this.logs.pop();
        this.renderLogContainer();
    }

    renderLogContainer() {
        if (!this.container) return;
        const container = this.container.querySelector('#sidebar-log-container');
        if (!container) return;
        if (this.logs.length === 0) {
            container.innerHTML = `<div class="text-[10px] text-slate-400 italic text-center py-2">Belum ada riwayat unduhan</div>`;
            return;
        }
        container.innerHTML = this.logs.map(log => `
            <div class="text-[10px] flex items-start gap-1.5 py-1 border-b last:border-0 border-slate-700/30">
                <span class="font-mono text-[9px] text-emerald-400 font-bold flex-shrink-0 mt-0.5">${log.time}</span>
                <span class="text-slate-300 flex-1 leading-tight text-[10px]">${log.message}</span>
            </div>
        `).join('');
    }

    /**
     * Dynamically updates the active dataset info (Semester & Tahun)
     */
    updateActiveDatasetInfo(datasetObj) {
        if (!datasetObj) return;
        this.selectedYear = datasetObj.year || 2025;
        this.selectedSemester = datasetObj.semester || 2;

        const sourceLabel = this.container.querySelector('#sidebar-dataset-source-label');
        if (sourceLabel) {
            sourceLabel.textContent = `Dataset JUMDUK Sem ${this.selectedSemester} ${this.selectedYear}`;
        }

        const socialPeriod = this.container.querySelector('#sidebar-social-dataset-period');
        if (socialPeriod) {
            socialPeriod.textContent = `Sem ${this.selectedSemester} — Tahun ${this.selectedYear}`;
        }
    }

    render() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="p-4 flex flex-col h-full overflow-y-auto border-r transition-colors duration-250 space-y-4"
                 style="background-color: var(--color-bg-sidebar); border-color: var(--color-border-subtle); color: var(--color-text-main);">
                
                <!-- BRAND HEADER -->
                <div class="flex items-center gap-2.5 pb-3 border-b" style="border-color: var(--color-border-subtle);">
                    <img src="img/logo_disduk.png" alt="Logo Disdukcapil" class="w-8 h-8 object-contain"/>
                    <div>
                        <h1 class="text-xs font-extrabold tracking-wider leading-tight uppercase" style="color: var(--color-text-main);">Generator Infografis</h1>
                        <p class="text-[9px] font-bold tracking-wider uppercase text-emerald-500">Disdukcapil Kab. Tasikmalaya</p>
                    </div>
                </div>

                <!-- SECTION 1: WORKSPACE SELECTOR -->
                <div>
                    <div class="sidebar-section-title">
                        <i class="fa-solid fa-shapes text-emerald-500"></i> Workspace
                    </div>
                    <div class="grid grid-cols-2 gap-1 p-1 rounded-lg border" style="background-color: var(--color-bg-surface-elevated); border-color: var(--color-border-subtle);">
                        <button id="tab-ws-full" class="py-1.5 px-2 rounded text-[11px] font-extrabold transition flex items-center justify-center gap-1.5 ${this.activeWorkspace === 'full' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}">
                            <i class="fa-solid fa-file-contract"></i> Full Infografis
                        </button>
                        <button id="tab-ws-social" class="py-1.5 px-2 rounded text-[11px] font-extrabold transition flex items-center justify-center gap-1.5 ${this.activeWorkspace === 'social' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}">
                            <i class="fa-solid fa-share-nodes"></i> Media Sosial
                        </button>
                    </div>
                </div>

                <!-- SECTION 2: TEMPLATE SELECTOR (Equalized AKTIF badge & Aktif / Pilih button state) -->
                <div>
                    <div class="sidebar-section-title">
                        <i class="fa-solid fa-layer-group text-emerald-500"></i> Template
                    </div>
                    <div class="space-y-1.5">
                        ${(this.activeWorkspace === 'full' ? this.fullTemplates : this.socialTemplates).map(t => `
                            <div data-template-id="${t.id}" 
                                 class="tmpl-card-compact cursor-pointer transition-all duration-150 hover:border-emerald-500/70 hover:shadow-md ${this.selectedTemplateId === t.id ? 'selected ring-1 ring-emerald-500/50' : ''} ${t.disabled ? 'opacity-50 cursor-not-allowed' : ''}">
                                <div class="flex items-center gap-2 min-w-0 flex-1">
                                    <div class="w-6 h-6 rounded flex-shrink-0 flex items-center justify-center text-xs font-bold ${t.disabled ? 'bg-slate-700 text-slate-400' : 'bg-emerald-500/20 text-emerald-500'}">
                                        <i class="fa-solid ${t.icon}"></i>
                                    </div>
                                    <div class="min-w-0">
                                        <div class="flex items-center gap-1.5">
                                            <h4 class="text-[11px] font-extrabold truncate" style="color: var(--color-text-main);">${t.name}</h4>
                                            <span class="v2-badge ${t.badgeClass}">${t.status}</span>
                                        </div>
                                        <p class="text-[9px] font-medium truncate" style="color: var(--color-text-muted);">${t.desc || t.description || ''} • ${t.ratio}</p>
                                    </div>
                                </div>
                                <div class="flex-shrink-0">
                                    <span class="text-[10px] font-extrabold px-2.5 py-1 rounded-md transition-all shadow-sm ${t.disabled ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : (this.selectedTemplateId === t.id ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-200 hover:bg-slate-600')}">
                                        ${t.disabled ? 'Maint' : (this.selectedTemplateId === t.id ? 'Aktif' : 'Pilih')}
                                    </span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- SECTION 3: DATASET STATUS (With Active Semester & Tahun Info for Media Sosial) -->
                <div>
                    <div class="sidebar-section-title">
                        <i class="fa-solid fa-database text-rose-500"></i> Dataset
                    </div>
                    ${this.activeWorkspace === 'full' ? `
                        <div class="p-3 rounded-lg border space-y-1.5 shadow-sm" style="background-color: var(--color-bg-surface); border-color: var(--color-border-subtle);">
                            <div class="flex items-center justify-between">
                                <span class="text-[11px] font-extrabold flex items-center gap-1.5" style="color: var(--color-text-main);">
                                    <i class="fa-solid fa-server text-emerald-500"></i> Status Sumber Data
                                </span>
                                <span class="v2-badge v2-badge-active">Terhubung</span>
                            </div>
                            <p id="sidebar-dataset-source-label" class="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                                <i class="fa-solid fa-circle-check"></i> Buku Profil Tasikmalaya 2025
                            </p>
                        </div>
                    ` : `
                        <div class="p-3 rounded-lg border space-y-2 shadow-sm" style="background-color: var(--color-bg-surface); border-color: var(--color-border-subtle);">
                            <div class="flex items-center justify-between">
                                <span class="text-[11px] font-extrabold flex items-center gap-1.5" style="color: var(--color-text-main);">
                                    <i class="fa-solid fa-file-excel text-emerald-500"></i> Dataset Infografis
                                </span>
                                <span class="v2-badge v2-badge-active">Ready</span>
                            </div>
                            
                            <!-- Dynamic Active Dataset Status Info Badge (Semester & Tahun for Media Sosial) -->
                            <div class="p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold flex items-center justify-between">
                                <span class="flex items-center gap-1 text-slate-300">
                                    <i class="fa-solid fa-calendar-check text-emerald-400 text-xs"></i> Periode Data:
                                </span>
                                <span id="sidebar-social-dataset-period" class="font-extrabold text-emerald-400 uppercase">
                                    Sem ${this.selectedSemester} — Tahun ${this.selectedYear}
                                </span>
                            </div>

                            <button id="btn-open-dataset-manager" class="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[10px] font-extrabold flex items-center justify-center gap-1.5 transition shadow-sm">
                                <i class="fa-solid fa-sliders"></i> Pilih Dataset Infografis
                            </button>
                        </div>
                    `}
                </div>

                <!-- SECTION 4: KONFIGURASI -->
                <div class="space-y-2">
                    <div class="sidebar-section-title">
                        <i class="fa-solid fa-sliders text-indigo-500"></i> Konfigurasi
                    </div>
                    
                    <!-- Mode Selector -->
                    <div class="grid grid-cols-2 gap-1 p-0.5 rounded-lg border" style="background-color: var(--color-bg-surface-elevated); border-color: var(--color-border-subtle);">
                        <button id="btn-mode-kabupaten" class="py-1 px-2 rounded text-[11px] font-bold transition flex items-center justify-center gap-1 ${this.currentMode === 'Kabupaten' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}">
                            <i class="fa-solid fa-city"></i> Kabupaten
                        </button>
                        <button id="btn-mode-kecamatan" class="py-1 px-2 rounded text-[11px] font-bold transition flex items-center justify-center gap-1 ${this.currentMode === 'Kecamatan' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}">
                            <i class="fa-solid fa-map-location-dot"></i> Kecamatan
                        </button>
                    </div>

                    <!-- Searchable Kecamatan Select -->
                    <div id="container-kecamatan" class="${this.currentMode === 'Kecamatan' ? 'opacity-100 pointer-events-auto' : 'opacity-50 pointer-events-none'} transition-all">
                        <div class="relative w-full" id="kecamatan-custom-select">
                            <div id="kecamatan-select-button" class="w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold cursor-pointer border transition shadow-sm"
                                 style="background-color: var(--color-bg-surface); border-color: var(--color-border-strong); color: var(--color-text-main);">
                                <div class="flex items-center gap-1.5 flex-1 min-w-0">
                                    <i class="fa-solid fa-magnifying-glass text-slate-400 text-[10px] flex-shrink-0"></i>
                                    <input id="input-search-kecamatan" type="text" placeholder="Cari / Pilih Kecamatan..." 
                                           class="w-full bg-transparent focus:outline-none text-[11px] font-semibold truncate"
                                           style="color: var(--color-text-main);"
                                           value="${formatKecamatanLabel(this.selectedDistrict)}" autocomplete="off" />
                                </div>
                                <i id="icon-kecamatan-arrow" class="fa-solid fa-chevron-down text-slate-400 text-[9px] ml-1 flex-shrink-0 transition-transform duration-200"></i>
                            </div>

                            <div id="dropdown-kecamatan-list" class="hidden absolute left-0 right-0 top-full mt-1 max-h-48 overflow-y-auto border rounded-lg shadow-xl z-40 p-1 space-y-0.5 custom-scrollbar"
                                 style="background-color: var(--color-bg-surface); border-color: var(--color-border-strong); color: var(--color-text-main);">
                            </div>
                        </div>
                    </div>
                </div>

                <!-- SECTION 5: GENERATE -->
                <div class="space-y-2">
                    <button id="btn-generate" class="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg font-extrabold text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-1.5 transition transform active:scale-95">
                        <i class="fa-solid fa-wand-magic-sparkles"></i> Generate Infografis
                    </button>
                    
                    <!-- Info Hint Callout -->
                    <div class="p-2.5 rounded-lg border text-[10px] space-y-1" style="background-color: var(--color-bg-surface-elevated); border-color: var(--color-border-subtle);">
                        <div class="flex items-center gap-1.5 font-bold text-amber-400">
                            <i class="fa-solid fa-circle-info text-xs"></i>
                            <span>Petunjuk Pembaharuan Data</span>
                        </div>
                        <p class="text-slate-400 leading-snug text-[10px]">
                            Jika data pada infografis tidak otomatis berubah setelah memilih konfigurasi, silakan klik tombol <strong class="text-emerald-400 font-bold">Generate Infografis</strong> di atas.
                        </p>
                    </div>
                </div>

                <!-- SECTION 6: EXPORT -->
                <div>
                    <div class="sidebar-section-title">
                        <i class="fa-solid fa-download text-emerald-500"></i> Ekspor & Unduh
                    </div>
                    
                    <div class="space-y-1.5">
                        ${this.activeWorkspace === 'full' ? `
                            <div class="grid grid-cols-3 gap-1">
                                <button id="btn-export-png" class="py-1.5 px-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-[10px] font-bold flex items-center justify-center gap-1 transition shadow-sm">
                                    <i class="fa-solid fa-file-image"></i> PNG
                                </button>
                                <button id="btn-export-jpg" class="py-1.5 px-2 bg-teal-700 hover:bg-teal-600 text-white rounded text-[10px] font-bold flex items-center justify-center gap-1 transition shadow-sm">
                                    <i class="fa-solid fa-image"></i> JPG
                                </button>
                                <button id="btn-export-pdf" class="py-1.5 px-2 bg-indigo-700 hover:bg-indigo-600 text-white rounded text-[10px] font-bold flex items-center justify-center gap-1 transition shadow-sm">
                                    <i class="fa-solid fa-file-pdf"></i> PDF
                                </button>
                            </div>
                        ` : `
                            <div class="grid grid-cols-1 gap-1.5">
                                <button id="btn-export-social-zip" class="w-full py-2.5 px-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg text-xs font-extrabold flex items-center justify-center gap-2 transition shadow-md active:scale-95">
                                    <i class="fa-solid fa-file-zipper text-amber-300"></i> Unduh Paket ZIP Carousel
                                </button>
                            </div>
                        `}
                    </div>
                </div>

                <!-- SECTION 7: LOG HISTORY -->
                <div class="space-y-2 pt-2 border-t" style="border-color: var(--color-border-subtle);">
                    <div class="flex items-center justify-between">
                        <div class="sidebar-section-title">
                            <i class="fa-solid fa-clock-rotate-left text-amber-400"></i> Riwayat Unduhan
                        </div>
                        <button id="btn-clear-logs" class="text-[9px] text-slate-400 hover:text-red-400 font-bold transition flex items-center gap-1">
                            <i class="fa-solid fa-trash-can text-[9px]"></i> Hapus
                        </button>
                    </div>
                    
                    <div id="sidebar-log-container" class="space-y-1 max-h-36 overflow-y-auto custom-scrollbar p-2 rounded-lg border" style="background-color: var(--color-bg-surface-elevated); border-color: var(--color-border-subtle);">
                        ${this.logs.length === 0 ? `
                            <div class="text-[10px] text-slate-400 italic text-center py-2">Belum ada riwayat unduhan</div>
                        ` : this.logs.map(log => `
                            <div class="text-[10px] flex items-start gap-1.5 py-1 border-b last:border-0 border-slate-700/30">
                                <span class="font-mono text-[9px] text-emerald-400 font-bold flex-shrink-0 mt-0.5">${log.time}</span>
                                <span class="text-slate-300 flex-1 leading-tight text-[10px]">${log.message}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

            </div>
        `;

        this.attachEvents();
    }

    attachEvents() {
        // Clear Logs Trigger
        const btnClearLogs = this.container.querySelector('#btn-clear-logs');
        if (btnClearLogs) {
            btnClearLogs.onclick = (e) => {
                e.stopPropagation();
                this.logs = [];
                this.renderLogContainer();
            };
        }

        // Workspace Tabs
        const tabFull = this.container.querySelector('#tab-ws-full');
        const tabSocial = this.container.querySelector('#tab-ws-social');

        if (tabFull) {
            tabFull.onclick = () => {
                this.activeWorkspace = 'full';
                this.selectedTemplateId = 'template-1';
                this.render();
                this.onWorkspaceChange('full');
            };
        }

        if (tabSocial) {
            tabSocial.onclick = () => {
                this.activeWorkspace = 'social';
                this.selectedTemplateId = 'template-1-v2';
                this.render();
                this.onWorkspaceChange('social');
            };
        }

        // Entire Template Card Clickable Event
        this.container.querySelectorAll('.tmpl-card-compact').forEach(card => {
            card.onclick = () => {
                const tmplId = card.getAttribute('data-template-id');
                if (!tmplId) return;

                const templateList = this.activeWorkspace === 'full' ? this.fullTemplates : this.socialTemplates;
                const template = templateList.find(t => t.id === tmplId);
                if (template && template.disabled) return;

                this.selectedTemplateId = tmplId;
                this.render();

                if (this.activeWorkspace === 'full') {
                    this.onTemplateChange(tmplId);
                } else {
                    this.onExportSocial(tmplId);
                }
            };
        });

        // Dataset Manager Modal Trigger
        const btnOpenDm = this.container.querySelector('#btn-open-dataset-manager');
        if (btnOpenDm) {
            btnOpenDm.onclick = () => {
                if (this.datasetManagerUI) {
                    this.datasetManagerUI.show();
                }
            };
        }

        // Mode Selector (Kabupaten / Kecamatan)
        const btnKab = this.container.querySelector('#btn-mode-kabupaten');
        const btnKec = this.container.querySelector('#btn-mode-kecamatan');

        if (btnKab) {
            btnKab.onclick = () => {
                this.currentMode = 'Kabupaten';
                this.render();
                this.onModeChange('Kabupaten', this.selectedDistrict);
            };
        }

        if (btnKec) {
            btnKec.onclick = () => {
                this.currentMode = 'Kecamatan';
                this.render();
                this.onModeChange('Kecamatan', this.selectedDistrict);
            };
        }

        // Searchable Kecamatan Custom Select
        this.initKecamatanSelect();

        // Action Buttons
        const btnGen = this.container.querySelector('#btn-generate');
        if (btnGen) {
            btnGen.onclick = () => {
                this.onGenerate();
            };
        }

        // EXPORT LOGGING (DOWNLOAD INFOGRAFIS ONLY)
        const getTargetLabel = () => {
            return this.currentMode === 'Kecamatan' ? formatKecamatanLabel(this.selectedDistrict) : 'Kabupaten Tasikmalaya';
        };

        const btnPng = this.container.querySelector('#btn-export-png');
        if (btnPng) {
            btnPng.onclick = () => {
                this.addLog(`Mengunduh PNG — ${getTargetLabel()}`);
                this.onExportPNG();
            };
        }

        const btnJpg = this.container.querySelector('#btn-export-jpg');
        if (btnJpg) {
            btnJpg.onclick = () => {
                this.addLog(`Mengunduh JPG — ${getTargetLabel()}`);
                this.onExportJPG();
            };
        }

        const btnPdf = this.container.querySelector('#btn-export-pdf');
        if (btnPdf) {
            btnPdf.onclick = () => {
                this.addLog(`Mengunduh PDF — ${getTargetLabel()}`);
                this.onExportPDF();
            };
        }

        const btnZip = this.container.querySelector('#btn-export-social-zip');
        if (btnZip) {
            btnZip.onclick = () => {
                const tmpl = this.selectedTemplateId === 'template-2-v2' ? 'Template 2 V2' : 'Template 1 V2';
                this.addLog(`Mengunduh Paket ZIP Carousel — ${tmpl} (${getTargetLabel()})`);
                this.onExportZIP();
            };
        }
    }

    initKecamatanSelect() {
        const selectBtn = this.container.querySelector('#kecamatan-select-button');
        const inputSearch = this.container.querySelector('#input-search-kecamatan');
        const dropdown = this.container.querySelector('#dropdown-kecamatan-list');
        const arrow = this.container.querySelector('#icon-kecamatan-arrow');

        if (!selectBtn || !inputSearch || !dropdown) return;

        const sortedDistricts = [...this.districts].sort((a, b) => {
            const codeA = KECAMATAN_CODE_MAP[a.toUpperCase()] || '999999';
            const codeB = KECAMATAN_CODE_MAP[b.toUpperCase()] || '999999';
            return codeA.localeCompare(codeB);
        });

        const populateDropdown = (filterText = '') => {
            const currentSelectedLabel = formatKecamatanLabel(this.selectedDistrict).toLowerCase();
            const isExactCurrentLabel = filterText.toLowerCase().trim() === currentSelectedLabel;
            
            const cleanFilter = isExactCurrentLabel ? '' : filterText.toLowerCase().replace('kecamatan', '').replace('—', '').replace('-', '').trim();
            const filtered = sortedDistricts.filter(d => formatKecamatanLabel(d).toLowerCase().includes(cleanFilter));

            if (filtered.length === 0) {
                dropdown.innerHTML = `<div class="px-3 py-2 text-[10px] text-slate-400 font-semibold italic text-center">Kecamatan tidak ditemukan</div>`;
                return;
            }

            dropdown.innerHTML = filtered.map(d => `
                <div data-district="${d}" 
                     class="item-kecamatan px-2.5 py-1.5 text-[11px] font-semibold rounded cursor-pointer transition flex items-center justify-between ${this.selectedDistrict === d ? 'bg-emerald-600 text-white font-bold' : 'hover:bg-slate-700 hover:text-white'}">
                    <span>${formatKecamatanLabel(d)}</span>
                    ${this.selectedDistrict === d ? '<i class="fa-solid fa-check text-[10px]"></i>' : ''}
                </div>
            `).join('');

            dropdown.querySelectorAll('.item-kecamatan').forEach(item => {
                item.onclick = (e) => {
                    e.stopPropagation();
                    const dName = item.getAttribute('data-district');
                    this.selectedDistrict = dName;
                    this.currentMode = 'Kecamatan'; // Auto switch mode to Kecamatan
                    inputSearch.value = formatKecamatanLabel(dName);
                    dropdown.classList.add('hidden');
                    if (arrow) arrow.style.transform = 'rotate(0deg)';
                    this.onModeChange('Kecamatan', dName);
                    this.onDistrictChange(dName);
                    this.render();
                };
            });
        };

        const toggleDropdown = (show) => {
            if (show) {
                dropdown.classList.remove('hidden');
                if (arrow) arrow.style.transform = 'rotate(180deg)';
                populateDropdown(inputSearch.value);
            } else {
                dropdown.classList.add('hidden');
                if (arrow) arrow.style.transform = 'rotate(0deg)';
            }
        };

        selectBtn.onclick = (e) => {
            e.stopPropagation();
            const isHidden = dropdown.classList.contains('hidden');
            toggleDropdown(isHidden);
        };

        inputSearch.onclick = (e) => {
            e.stopPropagation();
            toggleDropdown(true);
        };

        inputSearch.onfocus = () => {
            toggleDropdown(true);
        };

        inputSearch.oninput = (e) => {
            toggleDropdown(true);
            populateDropdown(e.target.value);
        };

        document.addEventListener('click', (e) => {
            if (!this.container.contains(e.target)) {
                toggleDropdown(false);
            }
        });
    }
}
