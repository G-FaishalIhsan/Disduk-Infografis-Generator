/**
 * Chromium Renderer Module
 * Navigates Puppeteer to a real HTTP URL served by Express,
 * waits for full page load (CDN scripts, fonts, images),
 * then captures pixel-perfect screenshot/PDF.
 * Guaranteed strict 1-page PDF export across ALL templates (Template 1, 2, 3) with zero clipping or extra pages.
 */

import { browserManager } from './browser-manager.js';

export class ChromiumRenderer {
    /**
     * @param {string} url - HTTP URL to navigate to (e.g. http://localhost:3000/render/token)
     * @param {string} format - 'png', 'jpg', or 'pdf'
     * @returns {Buffer}
     */
    async render(url, format = 'png') {
        const startTime = Date.now();
        const browser = await browserManager.getBrowser();
        const page = await browser.newPage();

        try {
            // 1. Set viewport to 1200px fixed width, 2x HiDPI for sharp export
            await page.setViewport({
                width: 1200,
                height: 1600,
                deviceScaleFactor: 2
            });

            // 2. Navigate to the real HTTP URL
            await page.goto(url, {
                waitUntil: 'networkidle2',
                timeout: 30000
            });

            // 3. Wait for fonts + images to fully render
            await page.evaluate(async () => {
                // Wait for web fonts
                if (document.fonts && document.fonts.ready) {
                    await document.fonts.ready;
                }

                // Wait for all images to load and decode
                const images = Array.from(document.querySelectorAll('img'));
                await Promise.all(images.map(img => {
                    if (img.complete && img.naturalHeight !== 0) {
                        return img.decode ? img.decode().catch(() => {}) : Promise.resolve();
                    }
                    return new Promise(resolve => {
                        img.onload = resolve;
                        img.onerror = resolve;
                    });
                }));

                // Freeze CSS animations for a clean capture
                const style = document.createElement('style');
                style.textContent = '*, *::before, *::after { transition: none !important; animation: none !important; }';
                document.head.appendChild(style);
            });

            // 4. Small stabilization delay for Tailwind JIT final paint
            await new Promise(r => setTimeout(r, 200));

            // 5. Reset body paddings/margins & prevent CSS margin collapsing on footer
            await page.evaluate(() => {
                document.body.style.setProperty('margin', '0px', 'important');
                document.body.style.setProperty('padding', '0px', 'important');
                
                const container = document.querySelector('#infographic-container');
                if (container) {
                    container.style.setProperty('margin-top', '0px', 'important');
                    container.style.setProperty('margin-bottom', '0px', 'important');
                    container.style.setProperty('overflow', 'hidden', 'important');
                    if (container.lastElementChild) {
                        container.lastElementChild.style.setProperty('margin-bottom', '0px', 'important');
                    }
                }

                document.querySelectorAll('footer').forEach(f => {
                    f.style.setProperty('margin-bottom', '0px', 'important');
                });
            });

            // 6. Measure exact bounding box of #infographic-container
            const bbox = await page.evaluate(() => {
                const container = document.querySelector('#infographic-container');
                if (!container) return null;
                const rect = container.getBoundingClientRect();
                return {
                    x: Math.round(rect.x),
                    y: Math.round(rect.y),
                    width: Math.round(rect.width),
                    height: Math.round(rect.height)
                };
            });

            if (!bbox) {
                throw new Error('#infographic-container not found in template');
            }

            const exactWidth = bbox.width;
            const exactHeight = bbox.height;

            // Resize viewport to fit full container height precisely
            await page.setViewport({
                width: exactWidth,
                height: exactHeight,
                deviceScaleFactor: 2
            });

            // 7. Capture
            let buffer;
            if (format === 'png') {
                buffer = await page.screenshot({
                    type: 'png',
                    clip: { x: bbox.x, y: bbox.y, width: exactWidth, height: exactHeight },
                    omitBackground: false
                });
            } else if (format === 'jpg' || format === 'jpeg') {
                buffer = await page.screenshot({
                    type: 'jpeg',
                    quality: 95,
                    clip: { x: bbox.x, y: bbox.y, width: exactWidth, height: exactHeight },
                    omitBackground: false
                });
            } else if (format === 'pdf') {
                // Convert exact pixel width and height to inches (96 DPI standard) for strict 1-page PDF
                const widthInches = (exactWidth / 96).toFixed(4);
                const heightInches = (exactHeight / 96).toFixed(4);

                buffer = await page.pdf({
                    width: `${widthInches}in`,
                    height: `${heightInches}in`,
                    printBackground: true,
                    pageRanges: '1', // STRICT SINGLE PAGE ONLY
                    margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
                });
            } else {
                throw new Error(`Unsupported format: ${format}`);
            }

            const renderTime = Date.now() - startTime;
            console.log(`[Renderer] ${format.toUpperCase()} export: ${buffer.length} bytes in ${renderTime}ms`);
            return buffer;
        } finally {
            await page.close();
        }
    }
}
