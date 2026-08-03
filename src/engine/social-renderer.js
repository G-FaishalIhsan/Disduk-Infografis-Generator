/**
 * Social Renderer Module (Phase 9 — Social Export Engine V2)
 * Pure Renderer abstraction communicating with Puppeteer backend endpoints.
 * Responsibilities:
 * - Render HTML string to PNG
 * - Render HTML string to JPG
 * - Render array of HTML slides to multi-page PDF
 * Ensures render completion checks and styling parity.
 */

export class SocialRenderer {
    constructor(baseUrl = 'http://localhost:3000') {
        this.baseUrl = baseUrl;
    }

    /**
     * Renders a single HTML string to PNG Blob via Puppeteer
     * @param {string} html 
     * @param {Object} options 
     * @returns {Promise<Blob>}
     */
    async renderPNG(html, options = {}) {
        const response = await fetch(`${this.baseUrl}/api/export/social/png`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ html, options })
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || `Social PNG Render Failed (${response.status})`);
        }

        return await response.blob();
    }

    /**
     * Renders a single HTML string to JPG Blob via Puppeteer
     * @param {string} html 
     * @param {Object} options 
     * @returns {Promise<Blob>}
     */
    async renderJPG(html, options = {}) {
        const response = await fetch(`${this.baseUrl}/api/export/social/jpg`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ html, options })
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || `Social JPG Render Failed (${response.status})`);
        }

        return await response.blob();
    }

    /**
     * Renders an array of slide HTML strings into a multi-page PDF Blob via 1 Puppeteer browser session
     * @param {Array<string>} htmlSlides 
     * @param {Object} options 
     * @returns {Promise<Blob>}
     */
    async renderPDFPages(htmlSlides, options = {}) {
        const response = await fetch(`${this.baseUrl}/api/export/social/pdf`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ htmlSlides, options })
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || `Social PDF Render Failed (${response.status})`);
        }

        return await response.blob();
    }
}
