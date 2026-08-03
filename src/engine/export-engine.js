/**
 * Client Export Engine Module
 * Interfaces with the Node.js Express Chromium Puppeteer Server (/api/export/*)
 * for Pixel-Perfect Chromium Native PNG, JPG, PDF, and Social Media ZIP exports.
 * Uses real-time SSE progress streaming connected directly to the top loading toast.
 */

export class ExportEngine {
    constructor() {
        const origin = (typeof window !== 'undefined' && window.location && window.location.origin && window.location.origin.startsWith('http')) ? window.location.origin : 'http://localhost:3000';
        this.serverUrl = `${origin}/api/export`;
        this.toast = null;
        this.initLoadingToast();
    }

    initLoadingToast() {
        if (document.querySelector('#export-loading-toast')) return;

        const toast = document.createElement('div');
        toast.id = 'export-loading-toast';
        toast.className = 'fixed top-5 left-1/2 -translate-x-1/2 z-50 pointer-events-none opacity-0 -translate-y-4 transition-all duration-300 ease-out';
        toast.innerHTML = `
            <div id="export-toast-card" class="flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border bg-slate-900/95 text-white border-slate-700/80 backdrop-blur-md min-w-[360px] max-w-md">
                
                <!-- Animated Spinner Icon -->
                <div class="relative flex items-center justify-center w-8 h-8 flex-shrink-0">
                    <div id="export-toast-spinner" class="absolute inset-0 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin"></div>
                    <i id="export-toast-icon" class="fa-solid fa-file-image text-sm text-emerald-400"></i>
                </div>

                <!-- Info Text -->
                <div class="flex-1 text-left min-w-0">
                    <div id="export-toast-title" class="text-xs font-extrabold tracking-wide uppercase text-slate-100 truncate">Mengekspor Infografis...</div>
                    <div id="export-toast-desc" class="text-[11px] text-slate-400 truncate">Memproses layout & dokumen...</div>
                </div>

                <!-- Live Pulse Dot -->
                <span class="flex h-2.5 w-2.5 relative flex-shrink-0">
                    <span id="export-toast-pulse" class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span id="export-toast-dot" class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
            </div>
        `;
        document.body.appendChild(toast);
        this.toast = toast;

        this.updateToastTheme();
    }

    updateToastTheme() {
        const card = document.querySelector('#export-toast-card');
        const title = document.querySelector('#export-toast-title');
        const desc = document.querySelector('#export-toast-desc');
        if (!card) return;

        const root = document.documentElement;
        let isLight = root.classList.contains('light');
        if (!isLight && !root.classList.contains('dark')) {
            isLight = !window.matchMedia('(prefers-color-scheme: dark)').matches;
        }

        if (isLight) {
            card.className = 'flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border bg-white/95 text-slate-900 border-slate-200 backdrop-blur-md min-w-[360px] max-w-md';
            if (title) title.className = 'text-xs font-extrabold tracking-wide uppercase text-slate-900 truncate';
            if (desc) desc.className = 'text-[11px] text-slate-600 truncate';
        } else {
            card.className = 'flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border bg-slate-900/95 text-white border-slate-700/80 backdrop-blur-md min-w-[360px] max-w-md';
            if (title) title.className = 'text-xs font-extrabold tracking-wide uppercase text-slate-100 truncate';
            if (desc) desc.className = 'text-[11px] text-slate-400 truncate';
        }
    }

    updateToastText(titleText, descText) {
        const titleEl = document.querySelector('#export-toast-title');
        const descEl = document.querySelector('#export-toast-desc');
        if (titleEl && titleText) titleEl.textContent = titleText;
        if (descEl && descText) descEl.textContent = descText;
    }

    showLoadingToast(format) {
        if (!this.toast) this.initLoadingToast();
        this.updateToastTheme();

        const titleEl = document.querySelector('#export-toast-title');
        const descEl = document.querySelector('#export-toast-desc');
        const iconEl = document.querySelector('#export-toast-icon');
        const spinnerEl = document.querySelector('#export-toast-spinner');
        const pulseEl = document.querySelector('#export-toast-pulse');
        const dotEl = document.querySelector('#export-toast-dot');

        const fmt = (format || 'png').toUpperCase();
        if (titleEl) titleEl.textContent = `Mengekspor File ${fmt}...`;
        if (descEl) descEl.textContent = `Merender dokumen ${fmt} HiDPI...`;

        if (iconEl && spinnerEl && pulseEl && dotEl) {
            if (format === 'pdf') {
                iconEl.className = 'fa-solid fa-file-pdf text-sm text-rose-400';
                spinnerEl.className = 'absolute inset-0 rounded-full border-2 border-rose-500/20 border-t-rose-400 animate-spin';
                pulseEl.className = 'animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75';
                dotEl.className = 'relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500';
            } else if (format === 'jpg' || format === 'jpeg') {
                iconEl.className = 'fa-solid fa-image text-sm text-amber-400';
                spinnerEl.className = 'absolute inset-0 rounded-full border-2 border-amber-500/20 border-t-amber-400 animate-spin';
                pulseEl.className = 'animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75';
                dotEl.className = 'relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500';
            } else if (format === 'social') {
                iconEl.className = 'fa-solid fa-share-nodes text-sm text-indigo-400';
                spinnerEl.className = 'absolute inset-0 rounded-full border-2 border-indigo-500/20 border-t-indigo-400 animate-spin';
                pulseEl.className = 'animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75';
                dotEl.className = 'relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500';
            } else {
                iconEl.className = 'fa-solid fa-file-image text-sm text-emerald-400';
                spinnerEl.className = 'absolute inset-0 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin';
                pulseEl.className = 'animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75';
                dotEl.className = 'relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500';
            }
        }

        this.toast.classList.remove('opacity-0', '-translate-y-4', 'pointer-events-none');
        this.toast.classList.add('opacity-100', 'translate-y-0');
    }

    hideLoadingToast() {
        if (!this.toast) return;
        this.toast.classList.add('opacity-0', '-translate-y-4', 'pointer-events-none');
        this.toast.classList.remove('opacity-100', 'translate-y-0');
    }

    async exportPNG(iframeElement, filename = 'infografis-disdukcapil.png', payloadData = {}) {
        return this.sendExportRequest('png', filename, payloadData, iframeElement);
    }

    async exportJPG(iframeElement, filename = 'infografis-disdukcapil.jpg', payloadData = {}) {
        return this.sendExportRequest('jpg', filename, payloadData, iframeElement);
    }

    async exportPDF(iframeElement, filename = 'infografis-disdukcapil.pdf', payloadData = {}) {
        return this.sendExportRequest('pdf', filename, payloadData, iframeElement);
    }

    /**
     * DEDICATED SOCIAL MEDIA ZIP EXPORT via Native Chromium Backend & SSE Progress
     */
    async exportSocialZip(iframeElement, payloadData = {}, platformRatio = 'native') {
        const templateId = payloadData.templateId || 'template-1';
        const data = payloadData.data || {};
        const regionName = data.metadata?.nama_wilayah || 'Tasikmalaya';
        const filename = `Infografis-Disdukcapil-${regionName.replace(/[^a-zA-Z0-9-]/g, '_')}-SocialMedia.zip`;

        this.showLoadingToast('social');
        this.updateToastText('Memulai Social Media Export...', 'Menghubungkan ke Chromium Server...');

        return new Promise((resolve, reject) => {
            fetch(`${this.serverUrl}/social-progress`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    templateId,
                    data,
                    platformRatio,
                    filename
                })
            }).then(response => {
                if (!response.ok) throw new Error(`Server error: ${response.status}`);
                
                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let buffer = '';

                const readChunk = () => {
                    reader.read().then(({ done, value }) => {
                        if (value) {
                            buffer += decoder.decode(value, { stream: true });
                            const chunks = buffer.split('\n\n');
                            buffer = chunks.pop(); // keep trailing incomplete part

                            for (const chunk of chunks) {
                                if (chunk.startsWith('data: ')) {
                                    try {
                                        const json = JSON.parse(chunk.slice(6));
                                        if (json.status === 'progress') {
                                            this.updateToastText(json.stepText, `Proses ${json.percent || 0}%`);
                                        } else if (json.status === 'complete') {
                                            this.updateToastText('Selesai! Mengunduh Paket ZIP...', '100%');
                                            fetch(json.downloadUrl)
                                                .then(res => res.blob())
                                                .then(blob => {
                                                    const blobUrl = window.URL.createObjectURL(blob);
                                                    this.triggerDownload(blobUrl, filename);
                                                    setTimeout(() => {
                                                        window.URL.revokeObjectURL(blobUrl);
                                                        this.hideLoadingToast();
                                                    }, 1000);
                                                    resolve();
                                                })
                                                .catch(err => {
                                                    this.hideLoadingToast();
                                                    alert(`Gagal mengunduh file ZIP: ${err.message}`);
                                                    reject(err);
                                                });
                                        } else if (json.status === 'error') {
                                            throw new Error(json.error);
                                        }
                                    } catch (e) {
                                        console.warn('[SSE Chunk Parse Warning]:', e.message);
                                    }
                                }
                            }
                        }

                        if (!done) {
                            readChunk();
                        }
                    }).catch(err => {
                        this.hideLoadingToast();
                        alert(`Export Social Media Gagal: ${err.message}`);
                        reject(err);
                    });
                };

                readChunk();
            }).catch(err => {
                console.error('[ExportEngine Client] Social Export Failed:', err);
                this.hideLoadingToast();
                alert(`Export Social Media Gagal: ${err.message}`);
                reject(err);
            });
        });
    }

    async sendExportRequest(format, filename, payloadData, iframeElement) {
        const templateId = payloadData.templateId || 'template-1';
        const data = payloadData.data || {};

        this.showLoadingToast(format);
        console.log(`[ExportEngine Client] Requesting Chromium Server export for ${format.toUpperCase()} (${templateId})...`);

        try {
            const response = await fetch(`${this.serverUrl}/${format}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    templateId,
                    data,
                    filename
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Server responded with status ${response.status}`);
            }

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            this.triggerDownload(downloadUrl, filename);
            console.log(`[ExportEngine Client] ${format.toUpperCase()} export complete.`);
        } catch (err) {
            console.warn(`[ExportEngine Client] Chromium Backend Export failed (${err.message}). Falling back to Client Mode...`);
            await this.fallbackClientExport(iframeElement, format, filename);
        } finally {
            setTimeout(() => this.hideLoadingToast(), 500);
        }
    }

    async fallbackClientExport(iframeElement, format, filename) {
        if (!iframeElement) return;
        const iframeWin = iframeElement.contentWindow;
        const iframeDoc = iframeElement.contentDocument || iframeWin.document;
        const container = iframeDoc.querySelector('#infographic-container') || iframeDoc.body;

        if (window.html2canvas) {
            const canvas = await window.html2canvas(container, {
                scale: 2.5,
                useCORS: true,
                allowTaint: false,
                backgroundColor: '#ffffff',
                logging: false,
                windowWidth: 1200,
                width: 1200
            });

            if (format === 'pdf') {
                const imgData = canvas.toDataURL('image/jpeg', 0.98);
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'pt',
                    format: [canvas.width / 2.5, canvas.height / 2.5]
                });
                pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width / 2.5, canvas.height / 2.5);
                pdf.save(filename);
            } else {
                const mime = format === 'png' ? 'image/png' : 'image/jpeg';
                const dataUrl = canvas.toDataURL(mime, 0.98);
                this.triggerDownload(dataUrl, filename);
            }
        }
    }

    triggerDownload(dataUrl, filename) {
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}
