/**
 * ZIP Exporter Driver Module (Phase 9 — Social Export Engine V2)
 * Bundles all slides of the template as PNG files into a ZIP archive using in-memory JSZip.
 * Puppeteer is ONLY used to render PNG images for each slide; JSZip performs compression in memory.
 * Receives ONLY ExportContext and produces the compressed ZIP blob.
 */

export class ZipExporter {
    /**
     * Executes ZIP export bundling all slide PNGs in the ExportContext
     * @param {Object} exportContext - Standardized ExportContext
     * @param {Function} progressCallback - Optional progress update callback (slideIndex, totalSlides)
     * @returns {Promise<Object>} Object containing blob & filename
     */
    async export(exportContext, progressCallback = () => {}) {
        if (!exportContext || !exportContext.htmlSlides || exportContext.htmlSlides.length === 0) {
            throw new Error('ExportContext atau htmlSlides tidak valid.');
        }

        const JSZipLib = window.JSZip || (typeof JSZip !== 'undefined' ? JSZip : null);
        if (!JSZipLib) {
            throw new Error('Library JSZip tidak ditemukan. Pastikan JSZip dimuat.');
        }

        const zip = new JSZipLib();
        const totalSlides = exportContext.htmlSlides.length;
        const templatePath = exportContext.manifest ? exportContext.manifest.path : 'templates/social/template-1';
        const origin = (typeof window !== 'undefined' && window.location && window.location.origin && window.location.origin.startsWith('http')) ? window.location.origin : 'http://localhost:3000';
        const serverUrl = `${origin}/api/export/social/png`;

        for (let i = 0; i < totalSlides; i++) {
            const slideIndex = i + 1;
            const html = exportContext.htmlSlides[i];
            const slideFilename = exportContext.filenames.zipSlides[i] || `slide_${slideIndex}.png`;

            progressCallback(slideIndex, totalSlides, `Merender Slide ${slideIndex}/${totalSlides}...`);

            const response = await fetch(serverUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    html,
                    filename: slideFilename,
                    options: {
                        width: 1080,
                        height: 1350,
                        deviceScaleFactor: 2,
                        theme: exportContext.theme,
                        templatePath
                    }
                })
            });

            if (!response.ok) {
                const errJson = await response.json().catch(() => ({}));
                throw new Error(errJson.error || `Gagal merender Slide ${slideIndex} untuk ZIP (${response.status})`);
            }

            const arrayBuffer = await response.arrayBuffer();
            zip.file(slideFilename, arrayBuffer);
        }

        progressCallback(totalSlides, totalSlides, 'Mengompresi file ZIP...');
        const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
        const filename = exportContext.filenames.zip || 'infografis_carousel.zip';

        return { blob: zipBlob, filename };
    }
}
