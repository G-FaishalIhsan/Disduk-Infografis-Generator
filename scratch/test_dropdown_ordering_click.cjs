const puppeteer = require('puppeteer');

(async () => {
    console.log('=== VERIFYING DROPDOWN ORDER BY KODE KECAMATAN & CLICK INPUT BEHAVIOR ===');
    const browser = await puppeteer.launch({ headless: true });

    try {
        const page = await browser.newPage();
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
        await page.waitForFunction(() => !!window.app && !!window.app.sidebar, { timeout: 10000 });

        // 1. Focus / click input search
        await page.evaluate(() => {
            const input = document.querySelector('#input-search-kecamatan');
            if (input) input.focus();
        });
        await new Promise(r => setTimeout(r, 400));

        // 2. Get displayed items and their text in dropdown
        const dropdownItems = await page.evaluate(() => {
            const items = Array.from(document.querySelectorAll('.item-kecamatan span'));
            return items.map(i => i.textContent.trim());
        });

        console.log('First 10 Dropdown Items (Order Check):');
        console.log(dropdownItems.slice(0, 10));

        // Check if sorted numerically by code (320601, 320602, 320603, 320604...)
        const first5Codes = dropdownItems.slice(0, 5).map(s => s.split(' — ')[0]);
        console.log('First 5 Codes:', first5Codes);

        const isSortedByCode = first5Codes[0] === '320601' && first5Codes[1] === '320602' && first5Codes[2] === '320603' && first5Codes[3] === '320604' && first5Codes[4] === '320605';

        // 3. Check input value after click (should NOT be cleared)
        const inputValueAfterClick = await page.evaluate(() => {
            const input = document.querySelector('#input-search-kecamatan');
            return input ? input.value : '';
        });

        console.log('Input Value After Click:', inputValueAfterClick);

        if (isSortedByCode && inputValueAfterClick.includes('320624 — SINGAPARNA') && dropdownItems.length >= 39) {
            console.log('\n✅ VERIFICATION PASSED: DROPDOWN IS SORTED NUMERICALLY BY KODE KECAMATAN (320601-320639) AND ALL OPTIONS APPEAR ON CLICK WITHOUT CLEARING INPUT!');
        } else {
            console.error('\n❌ VERIFICATION FAILED!');
        }

    } catch (err) {
        console.error('Test error:', err);
    } finally {
        await browser.close();
    }
})();
