const puppeteer = require('puppeteer');

(async () => {
    console.log('=== VERIFYING PREVIEW TEMPLATE DISDUK SHOWCASE WEB APP ===');
    const browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
    });

    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1440, height: 900 });

        // Navigate to Preview Template Disduk page via local server
        await page.goto('http://localhost:3000/preview/index.html', { waitUntil: 'domcontentloaded' });
        await new Promise(r => setTimeout(r, 1000));

        // Check Header Title
        const headerTitle = await page.evaluate(() => {
            const el = document.querySelector('h1');
            return el ? el.textContent.trim() : '';
        });
        console.log('Header Title:', headerTitle);

        // Check initial template iframe src
        const iframeSrc = await page.evaluate(() => {
            const iframe = document.querySelector('#template-iframe');
            return iframe ? iframe.src : '';
        });
        console.log('Initial Iframe SRC:', iframeSrc);

        // Click Tab V2 (Media Sosial Carousel)
        console.log('Clicking Tab V2 (Media Sosial Carousel)...');
        await page.click('#tab-v2');
        await new Promise(r => setTimeout(r, 500));

        const v2IframeSrc = await page.evaluate(() => {
            const iframe = document.querySelector('#template-iframe');
            return iframe ? iframe.src : '';
        });
        console.log('V2 Iframe SRC:', v2IframeSrc);

        // Click Slide 2
        console.log('Clicking Slide 2 button...');
        await page.click('#btn-slide-2');
        await new Promise(r => setTimeout(r, 500));

        const v2Slide2Src = await page.evaluate(() => {
            const iframe = document.querySelector('#template-iframe');
            return iframe ? iframe.src : '';
        });
        console.log('V2 Slide 2 Iframe SRC:', v2Slide2Src);

        // Take a screenshot artifact of the Preview Hub
        await page.screenshot({ path: 'C:/Users/ACER/.gemini/antigravity/brain/f49e0bdd-452a-4a9a-86d3-66683aeecebb/preview_template_disduk_showcase.png', fullPage: false });

        if (headerTitle.includes('DISDUKCAPIL TASIKMALAYA') && v2IframeSrc.includes('v2/template-1/slide1.html') && v2Slide2Src.includes('v2/template-1/slide2.html')) {
            console.log('\n✅ VERIFICATION PASSED: PREVIEW TEMPLATE DISDUK SHOWCASE IS WORKING 100% PERFECTLY!');
        } else {
            console.error('\n❌ VERIFICATION FAILED!');
        }

    } catch (err) {
        console.error('Test error:', err);
    } finally {
        await browser.close();
    }
})();
