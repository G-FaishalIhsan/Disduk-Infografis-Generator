const puppeteer = require('puppeteer');

(async () => {
    console.log('=== VERIFYING KECAMATAN LABEL FORMAT "320614 — SINGAPARNA" IN BOTH WORKSPACES ===');
    const browser = await puppeteer.launch({ headless: true });

    try {
        const page = await browser.newPage();
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
        await page.waitForFunction(() => !!window.app && !!window.app.sidebar, { timeout: 10000 });

        // 1. Verify Full Infographics Workspace (V1) label format
        console.log('Checking Workspace 1 (Full Infografis)...');
        const v1Label = await page.evaluate(() => {
            const input = document.querySelector('#input-search-kecamatan');
            return input ? input.value : '';
        });
        console.log('V1 Selected District Input Value:', v1Label);

        // 2. Switch to Social Media Workspace (V2)
        console.log('Checking Workspace 2 (Media Sosial)...');
        await page.evaluate(() => {
            window.app.sidebar.activeWorkspace = 'social';
            window.app.sidebar.render();
        });
        await new Promise(r => setTimeout(r, 300));

        const v2Label = await page.evaluate(() => {
            const input = document.querySelector('#input-search-kecamatan');
            return input ? input.value : '';
        });
        console.log('V2 Selected District Input Value:', v2Label);

        // 3. Verify searching by code '320601' or name 'cipatujah'
        const searchResults = await page.evaluate(() => {
            const input = document.querySelector('#input-search-kecamatan');
            if (input) {
                input.focus();
                input.value = '320601';
                input.dispatchEvent(new Event('input', { bubbles: true }));
            }
            const items = Array.from(document.querySelectorAll('.item-kecamatan'));
            return items.map(i => i.textContent.trim());
        });

        console.log('Search Results for "320601":', searchResults);

        if (v1Label.includes('320624 — SINGAPARNA') && v2Label.includes('320624 — SINGAPARNA') && searchResults.some(s => s.includes('320601 — CIPATUJAH'))) {
            console.log('\n✅ KECAMATAN LABEL FORMAT "3206XX — NAMA_KECAMATAN" VERIFIED PERFECTLY IN BOTH WORKSPACES!');
        } else {
            console.error('\n❌ VERIFICATION FAILED!');
        }

    } catch (err) {
        console.error('Test error:', err);
    } finally {
        await browser.close();
    }
})();
