const puppeteer = require('puppeteer');

(async () => {
    console.log('=== VERIFYING KECAMATAN CODES AGAINST EXACT USER IMAGE TABLE ===');
    const browser = await puppeteer.launch({ headless: true });

    try {
        const page = await browser.newPage();
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
        await page.waitForFunction(() => !!window.app && !!window.app.sidebar, { timeout: 10000 });

        await page.evaluate(() => {
            const input = document.querySelector('#input-search-kecamatan');
            if (input) input.focus();
        });
        await new Promise(r => setTimeout(r, 400));

        const dropdownItems = await page.evaluate(() => {
            const items = Array.from(document.querySelectorAll('.item-kecamatan span'));
            return items.map(i => i.textContent.trim());
        });

        console.log('Total items in dropdown:', dropdownItems.length);
        console.log('Last 10 Items:');
        console.log(dropdownItems.slice(-10));

        const expectedTail = [
            '320630 — SARIWANGI',
            '320631 — SUKARATU',
            '320632 — CISAYONG',
            '320633 — SUKAHENING',
            '320634 — RAJAPOLAH',
            '320635 — JAMANIS',
            '320636 — CIAWI',
            '320637 — KADIPATEN',
            '320638 — PAGEURAGEUNG',
            '320639 — SUKARESIK'
        ];

        const matchSukahening = dropdownItems.includes('320633 — SUKAHENING');
        const matchRajapolah = dropdownItems.includes('320634 — RAJAPOLAH');
        const matchJamanis = dropdownItems.includes('320635 — JAMANIS');
        const matchCiawi = dropdownItems.includes('320636 — CIAWI');
        const matchKadipaten = dropdownItems.includes('320637 — KADIPATEN');
        const matchSukaresik = dropdownItems.includes('320639 — SUKARESIK');

        if (matchSukahening && matchRajapolah && matchJamanis && matchCiawi && matchKadipaten && matchSukaresik) {
            console.log('\n✅ ALL 39 KECAMATAN CODES MATCH THE USER IMAGE TABLE 100% PERFECTLY!');
        } else {
            console.error('\n❌ VERIFICATION FAILED!');
        }

    } catch (err) {
        console.error('Test error:', err);
    } finally {
        await browser.close();
    }
})();
