const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    console.log('--- TESTING TEMPLATE 1 FULL WORKSPACE PERSEBARAN WILAYAH ---');
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 1800 });

    console.log('Navigating to http://localhost:8080...');
    await page.goto('http://localhost:8080', { waitUntil: 'networkidle0' });

    // Full Infografis workspace is active by default with Template 1
    await new Promise(r => setTimeout(r, 2000));

    const iframeHandle = await page.$('#preview-iframe');
    const frame = await iframeHandle.contentFrame();

    const persebaranState = await frame.evaluate(() => {
        const container = document.querySelector('#persebaranBarsContainer');
        const barsCount = container ? container.querySelectorAll('div > div.w-full').length : 0;
        const barTexts = container ? Array.from(container.querySelectorAll('.flex.justify-between')).map(el => el.textContent.trim().replace(/\s+/g, ' ')) : [];
        const topName = document.querySelector('#valTopDesaName')?.textContent.trim();
        const topCount = document.querySelector('#valTopDesaCount')?.textContent.trim();
        const lowName = document.querySelector('#valLowDesaName')?.textContent.trim();
        const lowCount = document.querySelector('#valLowDesaCount')?.textContent.trim();

        return { barsCount, barTexts, topName, topCount, lowName, lowCount };
    });

    console.log('=================== PERSEBARAN WILAYAH STATE ===================');
    console.log(JSON.stringify(persebaranState, null, 2));

    // Take screenshot of Persebaran card
    const cardElement = await frame.$('[data-export-slide="persebaran-umur"]') || await frame.$('body');
    if (cardElement) {
        const artifactDir = 'C:\\Users\\ACER\\.gemini\\antigravity\\brain\\f49e0bdd-452a-4a9a-86d3-66683aeecebb';
        await cardElement.screenshot({ path: path.join(artifactDir, 'fixed_t1_persebaran_wilayah.png') });
        console.log('\nSaved fixed_t1_persebaran_wilayah.png');
    }

    await browser.close();
    console.log('--- TEST COMPLETED SUCCESSFULLY ---');
})();
