/**
 * Template Loader Engine
 * Dynamically loads and sandboxes templates inside the preview iframe.
 * Ensures absolute asset URL resolution and 1200px fixed desktop canvas.
 * Guarantees synchronous document writing and reliable promise resolution.
 */

export class TemplateLoader {
    constructor() {
        this.templates = [
            { id: 'template-1', name: 'Template 1 - Clean Emerald Modern Card', thumbnail: 'templates/template-1/thumbnail.png' },
            { id: 'template-2', name: 'Template 2 - Gradient Vibrant Dashboard', thumbnail: 'templates/template-2/thumbnail.png' },
            { id: 'template-3', name: 'Template 3 - Chart.js Interactive Infographic', thumbnail: 'templates/template-3/thumbnail.png' }
        ];
        this.activeTemplateId = 'template-1';
        this.cache = {};
    }

    getAvailableTemplates() {
        return this.templates;
    }

    async loadTemplate(templateId, iframeElement) {
        if (!iframeElement) return null;
        this.activeTemplateId = templateId;

        let htmlContent = this.cache[templateId];

        if (!htmlContent) {
            try {
                const response = await fetch(`templates/${templateId}/index.html`);
                if (!response.ok) throw new Error(`HTTP error ${response.status}`);
                htmlContent = await response.text();
                this.cache[templateId] = htmlContent;
            } catch (err) {
                console.error(`Failed to load production template templates/${templateId}/index.html:`, err);
                throw err;
            }
        }

        // Normalize image paths to absolute origin URLs so html2canvas & iframe render identically
        const origin = window.location.origin;
        let processedHtml = htmlContent.replace(/(\/|\.\.\/)*img\//g, `${origin}/img/`);

        // Inject fixed desktop width & print styles into head
        const canvasFixStyle = `
            <style id="canvas-fixed-layout">
                *, *::before, *::after {
                    box-sizing: border-box !important;
                }
                html, body {
                    margin: 0 !important;
                    padding: 0 !important;
                    background-color: #f1f5f9;
                    min-width: 1200px !important;
                    width: 1200px !important;
                    box-sizing: border-box !important;
                    overflow-x: hidden !important;
                }
                #infographic-container {
                    width: 1200px !important;
                    max-width: 1200px !important;
                    margin-left: auto !important;
                    margin-right: auto !important;
                    box-sizing: border-box !important;
                }
                header, section, footer, main {
                    width: 100% !important;
                    max-width: 100% !important;
                    box-sizing: border-box !important;
                }
                i.fa-solid, i.fa-brands, i.fas, i.far, i.fa {
                    display: inline-flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    line-height: 1 !important;
                    vertical-align: middle !important;
                }
            </style>
        `;
        processedHtml = processedHtml.replace('</head>', `${canvasFixStyle}</head>`);

        // Write into iframe
        const doc = iframeElement.contentDocument || iframeElement.contentWindow.document;
        doc.open();
        doc.write(processedHtml);
        doc.close();

        return new Promise((resolve) => {
            const finish = () => resolve(doc);
            if (doc.fonts && doc.fonts.ready) {
                doc.fonts.ready.then(finish).catch(finish);
            } else {
                setTimeout(finish, 50);
            }
        });
    }
}
