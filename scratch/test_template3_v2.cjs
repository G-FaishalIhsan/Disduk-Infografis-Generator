const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    console.log('--- TESTING TEMPLATE 3 V2 MEDIA SOSIAL WORKSPACE ---');
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 1800 });

    console.log('Navigating to http://localhost:8080...');
    await page.goto('http://localhost:8080', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1500));

    // Switch to Media Sosial workspace
    console.log('Switching to Media Sosial workspace...');
    await page.click('#tab-ws-social');
    await new Promise(r => setTimeout(r, 1000));

    // Select Template 3 V2 card
    console.log('Selecting Template 3 V2 card...');
    await page.click('[data-template-id="template-3-v2"]');
    await new Promise(r => setTimeout(r, 3000));

    // Check preview iframes
    const iframe1Handle = await page.$('#preview-social-slide1');
    const iframe2Handle = await page.$('#preview-social-slide2');

    const frame1 = await iframe1Handle.contentFrame();
    const frame2 = await iframe2Handle.contentFrame();

    const slide1Title = await frame1.evaluate(() => document.querySelector('[data-bind="valKabupaten"]')?.textContent.trim());
    const slide1Pop = await frame1.evaluate(() => document.querySelector('#valTotalPenduduk')?.textContent.trim());
    const slide2Title = await frame2.evaluate(() => document.querySelector('#valAvgPendudukKec')?.textContent.trim());
    const tableTopRows = await frame2.evaluate(() => document.querySelectorAll('#igTableBodyTop tr').length);

    console.log('\n=================== TEMPLATE 3 V2 PREVIEW DATA ===================');
    console.log(`Slide 1 Header Title: ${slide1Title}`);
    console.log(`Slide 1 Total Populasi: ${slide1Pop}`);
    console.log(`Slide 2 Rata-Rata Penduduk/Kec: ${slide2Title}`);
    console.log(`Slide 2 Top 5 Table Rows: ${tableTopRows}`);

    // Take screenshots of Slide 1 and Slide 2
    const artifactDir = 'C:\\Users\\ACER\\.gemini\\antigravity\\brain\\f49e0bdd-452a-4a9a-86d3-66683aeecebb';
    const s1Element = await frame1.$('#slide-1') || await frame1.$('body');
    const s2Element = await frame2.$('#slide-2') || await frame2.$('body');

    await s1Element.screenshot({ path: path.join(artifactDir, 'fixed_t3v2_slide1.png') });
    await s2Element.screenshot({ path: path.join(artifactDir, 'fixed_t3v2_slide2.png') });
    console.log('\nSaved fixed_t3v2_slide1.png and fixed_t3v2_slide2.png!');

    // Test PDF export for Template 3 V2 via API
    console.log('\nTesting Social Export API for Template 3 V2 (PDF format)...');
    const pdfResponse = await page.evaluate(async () => {
        const frame1HTML = document.querySelector('#preview-social-slide1').contentDocument.documentElement.outerHTML;
        const frame2HTML = document.querySelector('#preview-social-slide2').contentDocument.documentElement.outerHTML;

        const res = await fetch('http://localhost:3000/api/export/social/pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                htmlSlides: [frame1HTML, frame2HTML],
                filename: 'Template_3_V2_Test.pdf'
            })
        });
        const contentType = res.headers.get('content-type');
        const arrayBuffer = await res.arrayBuffer();
        return { status: res.status, contentType, byteLength: arrayBuffer.byteLength };
    });

    console.log(`PDF Export API Status: ${pdfResponse.status}, Content-Type: ${pdfResponse.contentType}, Buffer Size: ${pdfResponse.byteLength} bytes`);

    await browser.close();
    console.log('--- TEST COMPLETED SUCCESSFULLY ---');
})();
