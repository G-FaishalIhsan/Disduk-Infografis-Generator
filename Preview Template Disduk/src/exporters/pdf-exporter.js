/**
 * PDF Exporter Driver Module (Phase 9 — Social Export Engine V2)
 * Renders all slides of the template into a multi-page PDF (each page 1080x1350 px ratio)
 * in 1 single Puppeteer browser session.
 * Receives ONLY ExportContext and executes backend Puppeteer capture.
 */

export class PdfExporter {
    /**
     * Executes multi-page PDF export for all slides in the ExportContext
     * @param {Object} exportContext - Standardized ExportContext
     * @returns {Promise<Object>} Object containing blob & filename
     */
    async export(exportContext) {
        if (!exportContext || !exportContext.htmlSlides || exportContext.htmlSlides.length === 0) {
            throw new Error('ExportContext atau htmlSlides tidak valid.');
        }

        const filename = exportContext.filenames.pdf || 'infografis.pdf';
        const templatePath = exportContext.manifest ? exportContext.manifest.path : 'templates/social/template-1';
        const origin = (typeof window !== 'undefined' && window.location && window.location.origin && window.location.origin.startsWith('http')) ? window.location.origin : 'http://localhost:3000';
        const serverUrl = `${origin}/api/export/social/pdf`;

        const response = await fetch(serverUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                htmlSlides: exportContext.htmlSlides,
                filename,
                options: {
                    width: 1080,
                    height: 1350,
                    theme: exportContext.theme,
                    templatePath
                }
            })
        });

        if (!response.ok) {
            const errJson = await response.json().catch(() => ({}));
            throw new Error(errJson.error || `Server PDF render error (${response.status})`);
        }

        const blob = await response.blob();
        return { blob, filename };
    }
}
