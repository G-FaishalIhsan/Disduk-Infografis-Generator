const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
    console.log('--- TESTING TEMPLATE 3 V2 DUAL CASE & EXPORT FIX ---');
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 1800 });

    console.log('Navigating to http://localhost:8080...');
    await page.goto('http://localhost:8080', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1000));

    // Switch to Media Sosial workspace and select Template 3 V2
    await page.click('#tab-ws-social');
    await new Promise(r => setTimeout(r, 800));
    await page.click('[data-template-id="template-3-v2"]');
    await new Promise(r => setTimeout(r, 2500));

    // --- TEST CASE 1: KABUPATEN SELECTED ---
    console.log('\n--- CASE 1: KABUPATEN SELECTED ---');
    const iframe1Handle = await page.$('#preview-social-slide1');
    const iframe2Handle = await page.$('#preview-social-slide2');
    const frame1 = await iframe1Handle.contentFrame();
    const frame2 = await iframe2Handle.contentFrame();

    const case1Title = await frame1.evaluate(() => document.querySelector('#valTop5Title')?.textContent.trim());
    const case1Labels = await frame1.evaluate(() => {
        if (window.Chart && window.Chart.instances) {
            const chart = Object.values(window.Chart.instances).find(c => c.canvas && c.canvas.id === 's1TopKecChart');
            return chart ? chart.data.labels : [];
        }
        return [];
    });

    console.log(`Slide 1 Top 5 Title: ${case1Title}`);
    console.log(`Slide 1 Chart Labels: ${JSON.stringify(case1Labels)}`);

    // --- TEST CASE 2: KECAMATAN SELECTED (SINGAPARNA) ---
    console.log('\n--- CASE 2: KECAMATAN SINGAPARNA SELECTED ---');
    await page.evaluate(() => {
        if (window.app && window.app.previewEngine) {
            window.app.previewEngine.render(null, 'SINGAPARNA');
        }
    });
    await new Promise(r => setTimeout(r, 2000));

    const case2Title = await frame1.evaluate(() => document.querySelector('#valTop5Title')?.textContent.trim());
    const case2Labels = await frame1.evaluate(() => {
        if (window.Chart && window.Chart.instances) {
            const chart = Object.values(window.Chart.instances).find(c => c.canvas && c.canvas.id === 's1TopKecChart');
            return chart ? chart.data.labels : [];
        }
        return [];
    });

    const s2FixedTitle = await frame2.evaluate(() => document.querySelector('#valAvgPendudukKec')?.textContent.trim());

    console.log(`Slide 1 Top 5 Title: ${case2Title}`);
    console.log(`Slide 1 Chart Labels (Desa): ${JSON.stringify(case2Labels)}`);
    console.log(`Slide 2 Rata-Rata Penduduk/Kec (Should remain 50.600): ${s2FixedTitle}`);

    // Take screenshots of both cases
    const artifactDir = 'C:\\Users\\ACER\\.gemini\\antigravity\\brain\\f49e0bdd-452a-4a9a-86d3-66683aeecebb';
    const s1Element = await frame1.$('#slide-1');
    const s2Element = await frame2.$('#slide-2');

    await s1Element.screenshot({ path: path.join(artifactDir, 'fixed_t3v2_case2_slide1.png') });
    await s2Element.screenshot({ path: path.join(artifactDir, 'fixed_t3v2_case2_slide2.png') });

    // --- TEST PDF EXPORT VISUAL PERBANDINGAN CHART ---
    console.log('\n--- TESTING PDF EXPORT FOR VISUAL PERBANDINGAN CHART ---');
    const pdfResponse = await page.evaluate(async () => {
        const frame1HTML = document.querySelector('#preview-social-slide1').contentDocument.documentElement.outerHTML;
        const frame2HTML = document.querySelector('#preview-social-slide2').contentDocument.documentElement.outerHTML;

        const res = await fetch('http://localhost:3000/api/export/social/pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                htmlSlides: [frame1HTML, frame2HTML],
                filename: 'Template_3_V2_PDF_Test.pdf'
            })
        });
        const arrayBuffer = await res.arrayBuffer();
        return { status: res.status, byteLength: arrayBuffer.byteLength };
    });

    console.log(`PDF Export Result Status: ${pdfResponse.status}, Byte Length: ${pdfResponse.byteLength}`);

    await browser.close();
    console.log('--- TEST COMPLETED SUCCESSFULLY ---');
})();
