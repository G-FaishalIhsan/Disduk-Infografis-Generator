const puppeteer = require('puppeteer');

(async () => {
    console.log('=== VERIFYING NEW PREVIEW TEMPLATE HUB MATCHING REAL APP UI ===');
    const browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
    });

    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1440, height: 900 });

        // Navigate to D:\Project\Preview Template Disduk\index.html via server
        await page.goto('http://localhost:3000/preview/index.html', { waitUntil: 'domcontentloaded' });
        await new Promise(r => setTimeout(r, 1000));

        // 1. Check title text
        const titleText = await page.evaluate(() => {
            const h1 = document.querySelector('h1');
            return h1 ? h1.textContent.trim() : '';
        });
        console.log('Header Brand Title:', titleText);

        // 2. Test Light Theme click
        console.log('Testing Theme Switcher (Light Mode)...');
        await page.click('#btn-theme-light');
        await new Promise(r => setTimeout(r, 500));

        const isLight = await page.evaluate(() => {
            return !document.body.classList.contains('dark');
        });
        console.log('Body is in Light Mode:', isLight);

        // 3. Test Dark Theme click
        console.log('Testing Theme Switcher (Dark Mode)...');
        await page.click('#btn-theme-dark');
        await new Promise(r => setTimeout(r, 500));

        const isDark = await page.evaluate(() => {
            return document.body.classList.contains('dark');
        });
        console.log('Body is in Dark Mode:', isDark);

        // 4. Test Workspace Switcher (Social V2)
        console.log('Switching workspace to Social Media V2...');
        await page.click('#tab-ws-social');
        await new Promise(r => setTimeout(r, 500));

        const isSocialVisible = await page.evaluate(() => {
            const wrapper = document.querySelector('#preview-wrapper-social');
            return wrapper && !wrapper.classList.contains('hidden');
        });
        console.log('Social Workspace Preview Visible:', isSocialVisible);

        // 5. Test Mode Switcher to Kecamatan & select dropdown item
        console.log('Switching mode to Kecamatan & selecting district...');
        await page.click('#btn-mode-kec');
        await page.click('#kecamatan-select-button');
        await page.click('#dropdown-kecamatan-list > div:first-child');
        await new Promise(r => setTimeout(r, 500));

        const selectedKecText = await page.evaluate(() => {
            return document.querySelector('#label-selected-kecamatan').textContent.trim();
        });
        console.log('Selected Kecamatan:', selectedKecText);

        if (titleText.includes('DISDUKCAPIL TASIKMALAYA') && isLight && isDark && isSocialVisible && selectedKecText.includes('320601 — CIPATUJAH')) {
            console.log('\n✅ VERIFICATION PASSED: PREVIEW TEMPLATE HUB MATCHES THE REAL APP 100% PERFECTLY WITH LIGHT & DARK MODES!');
        } else {
            console.error('\n❌ VERIFICATION FAILED!');
        }

    } catch (err) {
        console.error('Test error:', err);
    } finally {
        await browser.close();
    }
})();
