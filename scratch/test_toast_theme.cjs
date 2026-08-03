const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    console.log('=== VERIFYING UI LOADING TOAST THEME SWITCHING ===');
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--allow-file-access-from-files']
    });

    try {
        const page = await browser.newPage();
        const fileUrl = 'file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/');
        await page.goto(fileUrl, { waitUntil: 'networkidle0', timeout: 15000 });

        await page.waitForFunction(() => !!window.app && !!window.app.exportService, { timeout: 10000 });

        // 1. Test Toast in Light Mode
        await page.evaluate(() => {
            window.app.themeController.setTheme('light');
            window.app.exportService.showLoadingToast('social');
            window.app.exportService.updateToastText('Mengekspor Media Sosial (75%)...', 'Merender Slide 1/2...');
        });
        await new Promise(r => setTimeout(r, 400));

        const lightToastTheme = await page.evaluate(() => {
            const card = document.querySelector('#export-toast-card');
            const title = document.querySelector('#export-toast-title');
            const desc = document.querySelector('#export-toast-desc');
            return {
                cardClass: card ? card.className : '',
                titleClass: title ? title.className : '',
                descClass: desc ? desc.className : '',
                isWhiteBg: card ? card.className.includes('bg-white') : false,
                isDarkText: title ? title.className.includes('text-slate-900') : false
            };
        });

        console.log('Light Mode Toast Theme:', lightToastTheme);

        // 2. Test Toast in Dark Mode
        await page.evaluate(() => {
            window.app.themeController.setTheme('dark');
        });
        await new Promise(r => setTimeout(r, 400));

        const darkToastTheme = await page.evaluate(() => {
            const card = document.querySelector('#export-toast-card');
            const title = document.querySelector('#export-toast-title');
            const desc = document.querySelector('#export-toast-desc');
            return {
                cardClass: card ? card.className : '',
                titleClass: title ? title.className : '',
                descClass: desc ? desc.className : '',
                isSlate900Bg: card ? card.className.includes('bg-slate-900') : false,
                isWhiteText: title ? title.className.includes('text-slate-100') : false
            };
        });

        console.log('Dark Mode Toast Theme:', darkToastTheme);

        if (lightToastTheme.isWhiteBg && lightToastTheme.isDarkText && darkToastTheme.isSlate900Bg && darkToastTheme.isWhiteText) {
            console.log('\n✅ UI LOADING TOAST THEME SWITCHING TEST PASSED 100%!');
        } else {
            console.error('\n❌ TEST FAILED!');
        }

    } catch (err) {
        console.error('Test execution error:', err);
    } finally {
        await browser.close();
    }
})();
