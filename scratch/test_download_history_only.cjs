const puppeteer = require('puppeteer');

(async () => {
    console.log('=== VERIFYING SIDEBAR LOG HISTORY EXCLUSIVELY FOR INFOGRAPHIC DOWNLOADS ===');
    const browser = await puppeteer.launch({ headless: true });

    try {
        const page = await browser.newPage();
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
        await page.waitForFunction(() => !!window.app && !!window.app.sidebar, { timeout: 10000 });

        // 1. Initial state check: Empty history text
        const initialLogText = await page.evaluate(() => {
            const container = document.querySelector('#sidebar-log-container');
            return container ? container.textContent.trim() : '';
        });
        console.log('Initial Download History State:', initialLogText);

        // 2. Perform download actions (Click PNG export in V1 & ZIP export in V2)
        console.log('Triggering PNG download click...');
        await page.evaluate(() => {
            const btnPng = document.querySelector('#btn-export-png');
            if (btnPng) btnPng.click();
        });
        await new Promise(r => setTimeout(r, 400));

        const logsAfterPng = await page.evaluate(() => {
            const items = Array.from(document.querySelectorAll('#sidebar-log-container > div'));
            return items.map(i => i.textContent.trim());
        });
        console.log('Logs after PNG Download click:', logsAfterPng);

        // 3. Switch to Social Workspace & click ZIP download
        console.log('Switching to Social Workspace and triggering ZIP download click...');
        await page.evaluate(() => {
            window.app.sidebar.activeWorkspace = 'social';
            window.app.sidebar.render();
            const btnZip = document.querySelector('#btn-export-social-zip');
            if (btnZip) btnZip.click();
        });
        await new Promise(r => setTimeout(r, 400));

        const logsAfterZip = await page.evaluate(() => {
            const items = Array.from(document.querySelectorAll('#sidebar-log-container > div'));
            return items.map(i => i.textContent.trim());
        });
        console.log('Logs after ZIP Download click:', logsAfterZip);

        const isDownloadOnly = logsAfterZip.every(l => l.includes('Mengunduh'));

        if (initialLogText.includes('Belum ada riwayat unduhan') && logsAfterZip.length === 2 && isDownloadOnly) {
            console.log('\n✅ VERIFICATION PASSED: LOG HISTORY IS NOW FOCUSED EXCLUSIVELY ON INFOGRAPHIC DOWNLOADS FOR BOTH WORKSPACES!');
        } else {
            console.error('\n❌ VERIFICATION FAILED!');
        }

    } catch (err) {
        console.error('Test error:', err);
    } finally {
        await browser.close();
    }
})();
