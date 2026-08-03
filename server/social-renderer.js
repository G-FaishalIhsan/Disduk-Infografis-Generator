/**
 * Dedicated Social Media Chromium Section Renderer Module (Phase 9 — Production Social Export Engine V2)
 * Chromium-powered rendering service capturing 1080x1350 px social media slides for PNG, JPG, and multi-page PDF.
 * Uses 1 single pre-warmed Puppeteer browser instance for maximum rendering speed and styling parity.
 * NO modifications made to V1 Renderer.
 */

import { browserManager } from './browser-manager.js';

export class SocialChromiumRenderer {
    /**
     * Prepares Puppeteer page with viewport 1080x1350, injects HTML content with correct base URL,
     * and performs strict render completion checks before capturing.
     */
    async setupPageAndNavigate(browser, html, options = {}) {
        const page = await browser.newPage();

        const viewportWidth = options.width || 1080;
        const viewportHeight = options.height || 1350;
        const deviceScaleFactor = options.deviceScaleFactor || 2;

        await page.setViewport({
            width: viewportWidth,
            height: viewportHeight,
            deviceScaleFactor: deviceScaleFactor
        });

        // Inject template path base URL tag so ./style.css resolves to template's local style.css
        let processedHtml = html;
        const port = process.env.PORT || 3000;
        if (options.templatePath) {
            const cleanPath = options.templatePath.replace(/^\/+|\/+$/g, '');
            const baseTag = `<base href="http://localhost:${port}/${cleanPath}/">`;
            if (processedHtml.includes('<base ')) {
                processedHtml = processedHtml.replace(/<base[^>]*>/i, baseTag);
            } else {
                processedHtml = processedHtml.replace('<head>', `<head>${baseTag}`);
            }
        }

        // Set HTML content directly via page.setContent
        try {
            await page.setContent(processedHtml, {
                waitUntil: ['domcontentloaded', 'networkidle0'],
                timeout: 12000
            });
        } catch (e) {
            // Fallback if networkidle0 times out on CDN requests
            await page.setContent(processedHtml, {
                waitUntil: 'domcontentloaded',
                timeout: 20000
            });
        }

        // Strict Render Completion Checks (Rule 7) & Stylesheet Overrides
        await page.evaluate(async (themeOption) => {
            // 1. Theme Application
            if (themeOption) {
                document.documentElement.classList.remove('light', 'dark');
                if (themeOption === 'dark') {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.add('light');
                }
            }

            // 2. Body & Canvas Fit Overrides for exact 1080x1350 capture without dark outer margins
            const style = document.createElement('style');
            style.textContent = `
                *, *::before, *::after { transition: none !important; animation: none !important; }
                body { margin: 0 !important; padding: 0 !important; overflow: hidden !important; display: flex !important; justify-content: center !important; align-items: center !important; background: transparent !important; }
                .social-canvas, .ig-frame { margin: 0 !important; border-radius: 0 !important; box-shadow: none !important; }
            `;
            document.head.appendChild(style);

            // 3. Wait for Fonts including FontAwesome (with 2s fallback timeout)
            if (document.fonts) {
                try {
                    await Promise.race([
                        Promise.all([
                            document.fonts.load('900 16px "Font Awesome 6 Free"').catch(() => {}),
                            document.fonts.load('400 16px "Font Awesome 6 Free"').catch(() => {}),
                            document.fonts.load('400 16px "Font Awesome 6 Brands"').catch(() => {}),
                            document.fonts.ready.catch(() => {})
                        ]),
                        new Promise(r => setTimeout(r, 2000))
                    ]);
                } catch (e) {}
            }

            // 4. Wait for all Images to decode
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

            // 5. Force Chart.js settlement if present
            if (window.Chart && window.Chart.instances) {
                try {
                    Object.values(window.Chart.instances).forEach(chart => {
                        if (chart.options) chart.options.animation = false;
                        chart.update('none');
                    });
                } catch (e) {}
            }
        }, options.theme);

        // Delay to ensure Chart.js canvas rasterization settlement
        await new Promise(r => setTimeout(r, 350));

        return page;
    }

    /**
     * Renders a single social media slide to PNG buffer
     */
    async renderSocialPNG(html, options = {}) {
        const browser = await browserManager.getBrowser();
        const page = await this.setupPageAndNavigate(browser, html, options);

        try {
            const buffer = await page.screenshot({
                type: 'png',
                fullPage: false,
                omitBackground: false
            });
            return buffer;
        } finally {
            await page.close();
        }
    }

    /**
     * Renders a single social media slide to JPG buffer with quality 95
     */
    async renderSocialJPG(html, options = {}) {
        const browser = await browserManager.getBrowser();
        const page = await this.setupPageAndNavigate(browser, html, options);

        try {
            const quality = options.quality || 95;
            const buffer = await page.screenshot({
                type: 'jpeg',
                quality: quality,
                fullPage: false,
                omitBackground: false
            });
            return buffer;
        } finally {
            await page.close();
        }
    }

    /**
     * Renders multiple slide HTML strings into a multi-page PDF in 1 single Puppeteer session (Rule 4)
     */
    async renderSocialPDF(htmlSlides, options = {}) {
        if (!Array.isArray(htmlSlides) || htmlSlides.length === 0) {
            throw new Error('htmlSlides harus berupa array HTML non-kosong.');
        }

        const browser = await browserManager.getBrowser();
        const page = await browser.newPage();

        try {
            await page.setViewport({
                width: options.width || 1080,
                height: options.height || 1350,
                deviceScaleFactor: 2
            });

            const pdfBuffers = [];

            for (let i = 0; i < htmlSlides.length; i++) {
                let html = htmlSlides[i];
                if (options.templatePath) {
                    const cleanPath = options.templatePath.replace(/^\/+|\/+$/g, '');
                    const port = process.env.PORT || 3000;
                    const baseTag = `<base href="http://localhost:${port}/${cleanPath}/">`;
                    if (html.includes('<base ')) {
                        html = html.replace(/<base[^>]*>/i, baseTag);
                    } else {
                        html = html.replace('<head>', `<head>${baseTag}`);
                    }
                }

                await page.setContent(html, {
                    waitUntil: 'domcontentloaded',
                    timeout: 20000
                });

                await page.evaluate(async (themeOption) => {
                    if (themeOption) {
                        document.documentElement.classList.remove('light', 'dark');
                        if (themeOption === 'dark') {
                            document.documentElement.classList.add('dark');
                        } else {
                            document.documentElement.classList.add('light');
                        }
                    }

                    const style = document.createElement('style');
                    style.textContent = `
                        *, *::before, *::after { transition: none !important; animation: none !important; }
                        body { margin: 0 !important; padding: 0 !important; overflow: hidden !important; display: flex !important; justify-content: center !important; align-items: center !important; background: transparent !important; }
                        .social-canvas, .ig-frame { margin: 0 !important; border-radius: 0 !important; box-shadow: none !important; }
                    `;
                    document.head.appendChild(style);

                    if (document.fonts && document.fonts.ready) {
                        try { await document.fonts.ready; } catch (e) {}
                    }

                    const images = Array.from(document.querySelectorAll('img'));
                    await Promise.all(images.map(img => {
                        if (img.complete && img.naturalHeight !== 0) {
                            return img.decode ? img.decode().catch(() => {}) : Promise.resolve();
                        }
                        return new Promise(r => { img.onload = r; img.onerror = r; });
                    }));
                }, options.theme);

                await new Promise(r => setTimeout(r, 200));

                const pagePdf = await page.pdf({
                    width: '1080px',
                    height: '1350px',
                    printBackground: true,
                    margin: { top: 0, right: 0, bottom: 0, left: 0 }
                });

                pdfBuffers.push(pagePdf);
            }

            if (pdfBuffers.length === 1) {
                return pdfBuffers[0];
            }

            return Buffer.concat(pdfBuffers);

        } finally {
            await page.close();
        }
    }
}
