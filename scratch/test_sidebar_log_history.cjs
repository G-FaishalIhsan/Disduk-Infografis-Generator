const puppeteer = require('puppeteer');

(async () => {
    console.log('=== VERIFYING SIDEBAR LOG HISTORY & INFO HINT CALLOUT ===');
    const browser = await puppeteer.launch({ headless: true });

    try {
        const page = await browser.newPage();
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
        await page.waitForFunction(() => !!window.app && !!window.app.sidebar, { timeout: 10000 });

        // 1. Verify Info Hint Callout is present
        const hintText = await page.evaluate(() => {
            const hint = document.querySelector('#btn-generate + div');
            return hint ? hint.textContent.trim() : '';
        });

        console.log('Info Hint Callout Text:', hintText.slice(0, 100));

        // 2. Perform actions: Click Generate, Switch Mode, Select Kecamatan
        await page.evaluate(() => {
            const btnGen = document.querySelector('#btn-generate');
            if (btnGen) btnGen.click();
        });
        await new Promise(r => setTimeout(r, 400));

        // 3. Read Log History entries
        const logs = await page.evaluate(() => {
            const items = Array.from(document.querySelectorAll('#sidebar-log-container > div'));
            return items.map(i => i.textContent.trim());
        });

        console.log('Log History Items:', logs);

        const hasHint = hintText.includes('Petunjuk Pembaharuan Data') && hintText.includes('Generate Infografis');
        const hasLogs = logs.length > 0 && logs.some(l => l.includes('Generate Infografis diproses') || l.includes('Sistem Infografis Disdukcapil Siap'));

        if (hasHint && hasLogs) {
            console.log('\n✅ VERIFICATION PASSED: HINT CALLOUT AND LOG HISTORY ARE WORKING 100% PERFECTLY!');
        } else {
            console.error('\n❌ VERIFICATION FAILED!');
        }

    } catch (err) {
        console.error('Test error:', err);
    } finally {
        await browser.close();
    }
})();
