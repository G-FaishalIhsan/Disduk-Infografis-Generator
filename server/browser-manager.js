/**
 * Browser Manager Module
 * Manages a singleton Puppeteer Chromium browser with pre-warming.
 */

import puppeteer from 'puppeteer';

class BrowserManager {
    constructor() {
        this.browser = null;
        this.isInitializing = false;
    }

    async init() {
        return this.getBrowser();
    }

    async getBrowser() {
        if (this.browser && this.browser.isConnected()) {
            return this.browser;
        }

        if (this.isInitializing) {
            await new Promise(resolve => setTimeout(resolve, 150));
            return this.getBrowser();
        }

        this.isInitializing = true;
        try {
            console.log('[BrowserManager] Launching Chromium...');
            this.browser = await puppeteer.launch({
                headless: 'new',
                protocolTimeout: 60000, // 60s protocol timeout to prevent premature kills
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu',
                    '--font-render-hinting=max',
                    '--force-color-profile=srgb',
                    '--disable-extensions'
                ]
            });
            console.log('[BrowserManager] Chromium ready.');
        } catch (err) {
            console.error('[BrowserManager] Failed to launch Chromium:', err);
            throw err;
        } finally {
            this.isInitializing = false;
        }

        return this.browser;
    }

    async closeBrowser() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }
}

export const browserManager = new BrowserManager();
