/**
 * Server Template Loader Module
 * Loads template HTML, enforces path traversal security, injects data JSON,
 * and injects the same canvas-fixed-layout CSS the client preview uses.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const ALLOWED_TEMPLATES = new Set(['template-1', 'template-2', 'template-3']);

export class ServerTemplateLoader {
    constructor(staticBaseUrl = 'http://localhost:3000') {
        this.staticBaseUrl = staticBaseUrl;
    }

    loadTemplate(templateId, data) {
        // Security: Whitelist validation
        if (!ALLOWED_TEMPLATES.has(templateId)) {
            throw new Error(`Invalid or unauthorized template ID: ${templateId}`);
        }

        const templatePath = path.join(projectRoot, 'templates', templateId, 'index.html');
        if (!fs.existsSync(templatePath)) {
            throw new Error(`Template file not found: ${templatePath}`);
        }

        let html = fs.readFileSync(templatePath, 'utf8');

        // Resolve ALL image paths to absolute HTTP URLs so Puppeteer can fetch them.
        // Handles: /img/, ../img/, ../../img/, img/
        // ponytail: file:// blocked from about:blank origin in Chromium, must use HTTP
        html = html.replace(
            /(?:\.\.\/)*\/?img\//g,
            `${this.staticBaseUrl}/img/`
        );

        // Inject the SAME canvas-fixed-layout CSS the client preview injects
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

        // Inject data payload + canvas CSS
        const dataInjectionScript = `
            <script>
                window.__INITIAL_DATA__ = ${JSON.stringify(data)};
                function __applyInitialData() {
                    if (window.updateTemplateData && window.__INITIAL_DATA__) {
                        window.updateTemplateData(window.__INITIAL_DATA__);
                    }
                }
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', __applyInitialData);
                } else {
                    __applyInitialData();
                }
            </script>
        `;

        html = html.replace('</head>', `${canvasFixStyle}${dataInjectionScript}</head>`);
        return html;
    }
}
