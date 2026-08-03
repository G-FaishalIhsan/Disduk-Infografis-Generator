// ===================================================================
// SOCIAL MEDIA EXPORT
// STATUS : MAINTENANCE
// Fitur ini dinonaktifkan sementara.
// Akan didesain ulang menggunakan template Social Media terpisah
// dengan Chromium Renderer Production.
// ===================================================================

/**
 * Social Media Export Modal UI Component
 * Dedicated UI modal for choosing social media platform aspect ratios (1:1, 4:5, 9:16, 16:9, Native)
 * and triggering section-by-section ZIP export.
 * Completely theme-aware (Light and Night/Dark mode).
 * Isolated from Full Export workflow.
 */

export class SocialExportModal {
    constructor(options = {}) {
        this.onExport = options.onExport || (() => {});
        this.selectedPlatform = 'native'; // 'native' | '1:1' | '4:5' | '9:16' | '16:9'
        this.modalElement = null;
        this.init();
    }

    init() {
        if (document.querySelector('#social-export-modal')) {
            this.modalElement = document.querySelector('#social-export-modal');
            return;
        }

        const modal = document.createElement('div');
        modal.id = 'social-export-modal';
        modal.className = 'fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 opacity-0 pointer-events-none transition-opacity duration-300';
        modal.innerHTML = `
            <div id="social-modal-card" class="bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl flex flex-col max-w-lg w-full text-left space-y-5 transform scale-95 transition-all duration-300 text-white">
                
                <!-- Modal Header -->
                <div id="social-modal-header" class="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div class="flex items-center gap-3">
                        <div class="p-2.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
                            <i class="fa-solid fa-share-nodes text-lg"></i>
                        </div>
                        <div>
                            <h3 id="social-modal-title" class="text-sm font-extrabold uppercase tracking-wide text-white">Export Social Media (.ZIP)</h3>
                            <p id="social-modal-sub" class="text-[11px] text-slate-400">Potong setiap slide kontoh & kemas menjadi paket file PNG Siap Upload.</p>
                        </div>
                    </div>
                    <button id="btn-close-social-modal" class="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition">
                        <i class="fa-solid fa-xmark text-sm"></i>
                    </button>
                </div>

                <!-- Platform Aspect Ratio Selector -->
                <div class="space-y-2">
                    <label id="social-modal-label" class="block text-xs font-extrabold uppercase tracking-wider text-slate-300">
                        1. Pilih Format & Rasio Gambar:
                    </label>
                    <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        <button data-ratio="native" class="btn-platform-opt p-3 rounded-xl border border-indigo-500 bg-indigo-600/20 text-white text-xs font-bold flex flex-col items-center justify-center gap-1 transition shadow-md">
                            <i class="fa-solid fa-crop-simple text-amber-400 text-base"></i>
                            <span class="text-[11px]">Asli (Native)</span>
                            <span class="text-[9px] text-slate-400 font-normal">Tinggi Marker Slide</span>
                        </button>
                        <button data-ratio="1:1" class="btn-platform-opt p-3 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-bold flex flex-col items-center justify-center gap-1 transition">
                            <i class="fa-brands fa-instagram text-pink-400 text-base"></i>
                            <span class="text-[11px]">Feed Square (1:1)</span>
                            <span class="text-[9px] text-slate-400 font-normal">1080 x 1080 px</span>
                        </button>
                        <button data-ratio="4:5" class="btn-platform-opt p-3 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-bold flex flex-col items-center justify-center gap-1 transition">
                            <i class="fa-brands fa-instagram text-purple-400 text-base"></i>
                            <span class="text-[11px]">Feed Portrait (4:5)</span>
                            <span class="text-[9px] text-slate-400 font-normal">1080 x 1350 px</span>
                        </button>
                        <button data-ratio="9:16" class="btn-platform-opt p-3 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-bold flex flex-col items-center justify-center gap-1 transition">
                            <i class="fa-brands fa-tiktok text-cyan-400 text-base"></i>
                            <span class="text-[11px]">Story / Reels (9:16)</span>
                            <span class="text-[9px] text-slate-400 font-normal">1080 x 1920 px</span>
                        </button>
                        <button data-ratio="16:9" class="btn-platform-opt p-3 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-bold flex flex-col items-center justify-center gap-1 transition col-span-2 sm:col-span-1">
                            <i class="fa-brands fa-x-twitter text-sky-400 text-base"></i>
                            <span class="text-[11px]">Banner (16:9)</span>
                            <span class="text-[9px] text-slate-400 font-normal">1200 x 675 px</span>
                        </button>
                    </div>
                </div>

                <!-- Progress status container -->
                <div id="social-progress-container" class="hidden p-3.5 rounded-xl bg-slate-800/90 border border-slate-700 space-y-2">
                    <div class="flex items-center justify-between text-xs font-bold">
                        <span id="social-progress-status" class="text-indigo-400 flex items-center gap-2">
                            <i class="fa-solid fa-spinner animate-spin"></i> Merender section...
                        </span>
                        <span id="social-progress-percent" class="text-slate-300 font-mono">0%</span>
                    </div>
                    <div class="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
                        <div id="social-progress-bar" class="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-200 w-0"></div>
                    </div>
                </div>

                <!-- Modal Footer Actions -->
                <div id="social-modal-footer" class="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                    <button id="btn-cancel-social-modal" class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition">
                        Batal
                    </button>
                    <button id="btn-confirm-social-export" class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-extrabold shadow-lg shadow-indigo-900/40 flex items-center gap-2 transition transform active:scale-95">
                        <i class="fa-solid fa-file-zipper text-amber-300"></i> Unduh Paket ZIP
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        this.modalElement = modal;

        this.attachEvents();
    }

    attachEvents() {
        const closeBtn = this.modalElement.querySelector('#btn-close-social-modal');
        const cancelBtn = this.modalElement.querySelector('#btn-cancel-social-modal');
        const confirmBtn = this.modalElement.querySelector('#btn-confirm-social-export');
        const platformOpts = this.modalElement.querySelectorAll('.btn-platform-opt');

        const closeModal = () => this.hide();
        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

        platformOpts.forEach(btn => {
            btn.addEventListener('click', () => {
                const isLight = document.documentElement.classList.contains('light');
                const defaultBorder = isLight ? 'border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100' : 'border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-800';
                
                platformOpts.forEach(b => {
                    b.className = `btn-platform-opt p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition ${defaultBorder}`;
                });

                btn.className = 'btn-platform-opt p-3 rounded-xl border border-indigo-500 bg-indigo-600/20 text-indigo-400 font-bold flex flex-col items-center justify-center gap-1 transition shadow-md';
                this.selectedPlatform = btn.getAttribute('data-ratio');
            });
        });

        confirmBtn.addEventListener('click', () => {
            this.onExport(this.selectedPlatform);
        });

        this.modalElement.addEventListener('click', (e) => {
            if (e.target === this.modalElement) this.hide();
        });
    }

    show() {
        if (!this.modalElement) this.init();
        this.updateTheme();
        const card = this.modalElement.querySelector('#social-modal-card');
        this.modalElement.classList.remove('opacity-0', 'pointer-events-none');
        if (card) {
            card.classList.remove('scale-95');
            card.classList.add('scale-100');
        }
    }

    hide() {
        if (!this.modalElement) return;
        const card = this.modalElement.querySelector('#social-modal-card');
        this.modalElement.classList.add('opacity-0', 'pointer-events-none');
        if (card) {
            card.classList.remove('scale-100');
            card.classList.add('scale-95');
        }
        this.resetProgress();
    }

    updateProgress(statusText, percent) {
        const progressContainer = this.modalElement.querySelector('#social-progress-container');
        const statusEl = this.modalElement.querySelector('#social-progress-status');
        const percentEl = this.modalElement.querySelector('#social-progress-percent');
        const barEl = this.modalElement.querySelector('#social-progress-bar');

        if (progressContainer) progressContainer.classList.remove('hidden');
        if (statusEl) statusEl.innerHTML = `<i class="fa-solid fa-spinner animate-spin"></i> ${statusText}`;
        if (percentEl) percentEl.textContent = `${Math.round(percent)}%`;
        if (barEl) barEl.style.width = `${Math.min(100, Math.max(0, percent))}%`;
    }

    resetProgress() {
        const progressContainer = this.modalElement.querySelector('#social-progress-container');
        if (progressContainer) progressContainer.classList.add('hidden');
    }

    updateTheme() {
        if (!this.modalElement) return;
        const card = this.modalElement.querySelector('#social-modal-card');
        const header = this.modalElement.querySelector('#social-modal-header');
        const title = this.modalElement.querySelector('#social-modal-title');
        const sub = this.modalElement.querySelector('#social-modal-sub');
        const label = this.modalElement.querySelector('#social-modal-label');
        const footer = this.modalElement.querySelector('#social-modal-footer');
        const cancelBtn = this.modalElement.querySelector('#btn-cancel-social-modal');
        const progressContainer = this.modalElement.querySelector('#social-progress-container');
        const platformOpts = this.modalElement.querySelectorAll('.btn-platform-opt');

        if (!card) return;

        const root = document.documentElement;
        let isLight = root.classList.contains('light');
        if (!isLight && !root.classList.contains('dark')) {
            isLight = !window.matchMedia('(prefers-color-scheme: dark)').matches;
        }

        if (isLight) {
            card.className = 'bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl flex flex-col max-w-lg w-full text-left space-y-5 transform scale-100 transition-all duration-300 text-slate-800';
            if (header) header.className = 'flex items-center justify-between pb-3 border-b border-slate-200';
            if (title) title.className = 'text-sm font-extrabold uppercase tracking-wide text-slate-900';
            if (sub) sub.className = 'text-[11px] text-slate-500';
            if (label) label.className = 'block text-xs font-extrabold uppercase tracking-wider text-slate-700';
            if (footer) footer.className = 'flex items-center justify-end gap-2 pt-3 border-t border-slate-200';
            if (cancelBtn) cancelBtn.className = 'px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition';
            if (progressContainer) progressContainer.className = progressContainer.className.replace('bg-slate-800/90 border-slate-700', 'bg-slate-100 border-slate-200');

            platformOpts.forEach(btn => {
                const ratio = btn.getAttribute('data-ratio');
                if (ratio === this.selectedPlatform) {
                    btn.className = 'btn-platform-opt p-3 rounded-xl border border-indigo-500 bg-indigo-50 text-indigo-700 font-bold flex flex-col items-center justify-center gap-1 transition shadow-md';
                } else {
                    btn.className = 'btn-platform-opt p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex flex-col items-center justify-center gap-1 transition';
                }
            });
        } else {
            card.className = 'bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl flex flex-col max-w-lg w-full text-left space-y-5 transform scale-100 transition-all duration-300 text-white';
            if (header) header.className = 'flex items-center justify-between pb-3 border-b border-slate-800';
            if (title) title.className = 'text-sm font-extrabold uppercase tracking-wide text-white';
            if (sub) sub.className = 'text-[11px] text-slate-400';
            if (label) label.className = 'block text-xs font-extrabold uppercase tracking-wider text-slate-300';
            if (footer) footer.className = 'flex items-center justify-end gap-2 pt-3 border-t border-slate-800';
            if (cancelBtn) cancelBtn.className = 'px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition';
            if (progressContainer) progressContainer.className = progressContainer.className.replace('bg-slate-100 border-slate-200', 'bg-slate-800/90 border-slate-700');

            platformOpts.forEach(btn => {
                const ratio = btn.getAttribute('data-ratio');
                if (ratio === this.selectedPlatform) {
                    btn.className = 'btn-platform-opt p-3 rounded-xl border border-indigo-500 bg-indigo-600/20 text-white font-bold flex flex-col items-center justify-center gap-1 transition shadow-md';
                } else {
                    btn.className = 'btn-platform-opt p-3 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-bold flex flex-col items-center justify-center gap-1 transition';
                }
            });
        }
    }
}
