const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.goto('http://localhost:8080', { waitUntil: 'networkidle0' });

    await page.click('#tab-ws-social');
    await new Promise(r => setTimeout(r, 500));

    // Select Template 2 V2
    await page.evaluate(() => window.app.handleSocialPreview('template-2-v2'));
    await new Promise(r => setTimeout(r, 2000));

    const frame1Handle = await page.$('#preview-social-slide1');
    const frame1 = await frame1Handle.contentFrame();

    console.log('--- FRAME 1 URL & TITLE ---');
    console.log(await frame1.evaluate(() => window.location.href));

    console.log('--- BEFORE CIPATUJAH BINDING ---');
    console.log('valTotalPenduduk:', await frame1.evaluate(() => document.querySelector('#valTotalPenduduk')?.textContent));
    console.log('headerTitle:', await frame1.evaluate(() => document.querySelector('[data-bind="valKabupaten"]')?.textContent));

    // Execute handleModeChange in page context
    await page.evaluate(() => window.app.handleModeChange('Kecamatan', 'CIPATUJAH'));
    await new Promise(r => setTimeout(r, 1000));

    console.log('--- AFTER CIPATUJAH BINDING ---');
    console.log('valTotalPenduduk:', await frame1.evaluate(() => document.querySelector('#valTotalPenduduk')?.textContent));
    console.log('headerTitle:', await frame1.evaluate(() => document.querySelector('[data-bind="valKabupaten"]')?.textContent));

    await browser.close();
})();
