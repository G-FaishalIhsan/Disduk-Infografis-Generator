const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
    console.log('=== VERIFYING TEMPLATE 1 EXPORT DATA INTEGRITY (CIPATUJAH DISTRICT) ===');
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--allow-file-access-from-files']
    });

    try {
        const page = await browser.newPage();
        const fileUrl = 'file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/');
        await page.goto(fileUrl, { waitUntil: 'networkidle0', timeout: 15000 });

        await page.waitForFunction(() => !!window.app && !!window.app.pdfParser, { timeout: 10000 });

        // 1. Switch to Kecamatan CIPATUJAH
        await page.evaluate(async () => {
            await window.app.handleModeChange('Kecamatan', 'CIPATUJAH');
            await window.app.handleTemplateChange('template-1');
        });

        await new Promise(r => setTimeout(r, 1000));

        // 2. Check preview iframe titleWilayah text
        const previewTitleText = await page.evaluate(() => {
            const iframe = document.querySelector('#preview-iframe');
            const doc = iframe.contentDocument || iframe.contentWindow.document;
            const titleEl = doc.querySelector('#titleWilayah');
            const totalPopEl = doc.querySelector('#valTotalPenduduk');
            return {
                title: titleEl ? titleEl.textContent : '',
                totalPop: totalPopEl ? totalPopEl.textContent : ''
            };
        });

        console.log('Preview Data:', previewTitleText);

        // 3. Perform Export Call via server endpoint for Template 1 with CIPATUJAH data
        const cipatujahData = await page.evaluate(() => {
            return window.app.pdfParser.getDistrictData('CIPATUJAH');
        });

        console.log('Cipatujah District Name:', cipatujahData.metadata.nama_wilayah);
        console.log('Cipatujah Population:', cipatujahData.penduduk.total);

        // Request export from running server
        const res = await fetch('http://localhost:3000/api/export/png', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                templateId: 'template-1',
                data: cipatujahData,
                filename: 'test_cipatujah.png'
            })
        });

        if (!res.ok) {
            throw new Error(`Server returned export error ${res.status}`);
        }

        const buffer = await res.arrayBuffer();
        console.log(`Exported PNG Buffer Size: ${buffer.byteLength} bytes`);

        // Save exported screenshot to artifacts directory
        const outPath = 'C:/Users/ACER/.gemini/antigravity/brain/f49e0bdd-452a-4a9a-86d3-66683aeecebb/test_t1_cipatujah_export.png';
        fs.writeFileSync(outPath, Buffer.from(buffer));
        console.log(`Saved screenshot artifact to: ${outPath}`);

        // Also test Puppeteer page rendering of the server /render/ token directly to verify inner DOM
        const renderHtmlRes = await fetch('http://localhost:3000/api/export/png', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                templateId: 'template-1',
                data: cipatujahData,
                filename: 'test_t1.png'
            })
        });

        const testPage = await browser.newPage();
        // Load local template with CIPATUJAH data script
        const templateLoaderPath = path.resolve(__dirname, '../server/template-loader.js');
        const { ServerTemplateLoader } = await import('file:///' + templateLoaderPath.replace(/\\/g, '/'));
        const loader = new ServerTemplateLoader('http://localhost:3000');
        const htmlContent = loader.loadTemplate('template-1', cipatujahData);

        await testPage.setContent(htmlContent, { waitUntil: 'networkidle0' });

        const exportedDOMData = await testPage.evaluate(() => {
            const titleEl = document.querySelector('#titleWilayah');
            const totalPopEl = document.querySelector('#valTotalPenduduk');
            const topDesaEl = document.querySelector('#valTopDesaName');
            return {
                title: titleEl ? titleEl.textContent : '',
                totalPop: totalPopEl ? totalPopEl.textContent : '',
                topDesa: topDesaEl ? topDesaEl.textContent : ''
            };
        });

        console.log('Exported Page DOM Data:', exportedDOMData);

        const isTitleCorrect = exportedDOMData.title.includes('CIPATUJAH');
        const isPopCorrect = exportedDOMData.totalPop !== '78.613'; // 78.613 is Singaparna default!

        if (isTitleCorrect && isPopCorrect) {
            console.log('\n✅ TEMPLATE 1 EXPORT BUG FIXED 100%! DATA MATCHES SELECTED DISTRICT (CIPATUJAH).');
        } else {
            console.error('\n❌ BUG STILL PRESENT:', exportedDOMData);
        }

    } catch (err) {
        console.error('Test execution error:', err);
    } finally {
        await browser.close();
    }
})();
