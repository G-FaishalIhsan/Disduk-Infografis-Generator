const puppeteer = require('puppeteer');

(async () => {
    console.log('=== VERIFYING FAVICON LOGO DISDUKCAPIL IN TAB ===');
    const browser = await puppeteer.launch({ headless: true });
    try {
        const page = await browser.newPage();
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

        const faviconHref = await page.evaluate(() => {
            const iconEl = document.querySelector('link[rel="icon"]');
            return iconEl ? iconEl.getAttribute('href') : null;
        });

        console.log('Favicon Href:', faviconHref);

        if (faviconHref && faviconHref.includes('logo_disduk.png')) {
            console.log('✅ FAVICON LOGO DISDUKCAPIL SUCCESSFULLY ADDED!');
        } else {
            console.error('❌ FAVICON NOT FOUND');
        }
    } catch (err) {
        console.error('Favicon verification error:', err);
    } finally {
        await browser.close();
    }
})();
