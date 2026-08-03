/**
 * JPG Exporter Driver Module (Phase 9 — Social Export Engine V2)
 * Renders active slide or specified HTML to a 1080x1350 px JPEG image with 95% quality and white background.
 * Receives ONLY ExportContext and executes backend Puppeteer capture.
 */

export class JpgExporter {
    /**
     * Executes JPG export for the active slide or target slide index
     * @param {Object} exportContext - Standardized ExportContext
     * @param {number} slideIndex - 1-based slide index (default 1)
     * @returns {Promise<Object>} Object containing blob & filename
     */
    async export(exportContext, slideIndex = 1) {
        if (!exportContext || !exportContext.htmlSlides) {
            throw new Error('ExportContext atau htmlSlides tidak valid.');
        }

        const idx = Math.max(1, Math.min(slideIndex, exportContext.htmlSlides.length)) - 1;
        const html = exportContext.htmlSlides[idx];
        const filename = exportContext.filenames.jpg[idx] || `slide_${slideIndex}.jpg`;
        const templatePath = exportContext.manifest ? exportContext.manifest.path : 'templates/social/template-1';

        const origin = (typeof window !== 'undefined' && window.location && window.location.origin && window.location.origin.startsWith('http')) ? window.location.origin : 'http://localhost:3000';
        const serverUrl = `${origin}/api/export/social/jpg`;

        const response = await fetch(serverUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                html,
                filename,
                options: {
                    width: 1080,
                    height: 1350,
                    quality: 95,
                    theme: exportContext.theme,
                    templatePath
                }
            })
        });

        if (!response.ok) {
            const errJson = await response.json().catch(() => ({}));
            throw new Error(errJson.error || `Server JPG render error (${response.status})`);
        }

        const blob = await response.blob();
        return { blob, filename };
    }
}
