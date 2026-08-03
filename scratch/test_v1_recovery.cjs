const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    console.log('=== VERIFYING TEMPLATE 1 V1 SAFE RECOVERY ===');
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--allow-file-access-from-files']
    });

    try {
        const page = await browser.newPage();
        const fileUrl = 'file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/');
        console.log('Navigating to:', fileUrl);

        await page.goto(fileUrl, { waitUntil: 'networkidle0', timeout: 15000 });

        console.log('Waiting for window.app to initialize...');
        await page.waitForFunction(() => window.app && window.app.iframeElement && window.app.iframeElement.contentDocument && window.app.iframeElement.contentDocument.querySelector('#titleWilayah'), { timeout: 10000 });

        console.log('Running Verification Checks...');
        
        const testResult = await page.evaluate(async () => {
            // 1. Verify Kabupaten rendering
            await window.app.handleModeChange('Kabupaten', null);
            await new Promise(r => setTimeout(r, 400));
            const iframeDoc = window.app.iframeElement.contentDocument;

            const kabTitle = iframeDoc.querySelector('#titleWilayah')?.textContent;
            const kabTotal = iframeDoc.querySelector('#valTotalPenduduk')?.textContent;
            const kabLaki = iframeDoc.querySelector('#valLaki')?.textContent;
            const kabPerempuan = iframeDoc.querySelector('#valPerempuan')?.textContent;
            const kabDesa = iframeDoc.querySelector('#valDesa')?.textContent;
            const kabKec = iframeDoc.querySelector('#valKecamatan')?.textContent;

            // 2. Verify District rendering (SINGAPARNA)
            await window.app.handleModeChange('Kecamatan', 'SINGAPARNA');
            await new Promise(r => setTimeout(r, 400));
            const singTitle = iframeDoc.querySelector('#titleWilayah')?.textContent;
            const singTotal = iframeDoc.querySelector('#valTotalPenduduk')?.textContent;
            const singLaki = iframeDoc.querySelector('#valLaki')?.textContent;
            const singPerempuan = iframeDoc.querySelector('#valPerempuan')?.textContent;
            const singDesa = iframeDoc.querySelector('#valDesa')?.textContent;
            const singKec = iframeDoc.querySelector('#valKecamatan')?.textContent;
            const singIslam = iframeDoc.querySelector('#valRelIslam')?.textContent;
            const singDocKtp = iframeDoc.querySelector('#pctDocKtp')?.textContent;

            // 3. Verify District rendering (CIPATUJAH)
            await window.app.handleModeChange('Kecamatan', 'CIPATUJAH');
            await new Promise(r => setTimeout(r, 400));
            const cipTitle = iframeDoc.querySelector('#titleWilayah')?.textContent;
            const cipTotal = iframeDoc.querySelector('#valTotalPenduduk')?.textContent;
            const cipLaki = iframeDoc.querySelector('#valLaki')?.textContent;

            // 4. Verify V2 Social Workspace still works
            await window.app.handleWorkspaceChange('social');
            await new Promise(r => setTimeout(r, 400));
            const socialWorkspaceVisible = !document.querySelector('#preview-wrapper-social').classList.contains('hidden');

            return {
                kabupaten: { title: kabTitle, total: kabTotal, laki: kabLaki, perempuan: kabPerempuan, desa: kabDesa, kecamatanCount: kabKec },
                singaparna: { title: singTitle, total: singTotal, laki: singLaki, perempuan: singPerempuan, desa: singDesa, kecamatanCount: singKec, islam: singIslam, docKtp: singDocKtp },
                cipatujah: { title: cipTitle, total: cipTotal, laki: cipLaki },
                socialWorkspaceVisible
            };
        });

        console.log('TEST RESULTS:');
        console.dir(testResult, { depth: null });

        const passKab = testResult.kabupaten.title === 'KABUPATEN TASIKMALAYA' && testResult.kabupaten.kecamatanCount === '39';
        const passSing = testResult.singaparna.title === 'KECAMATAN SINGAPARNA' && testResult.singaparna.total === '78.038' && testResult.singaparna.kecamatanCount === '1';
        const passCip = testResult.cipatujah.title === 'KECAMATAN CIPATUJAH' && testResult.cipatujah.total === '76.502';
        const passSocial = testResult.socialWorkspaceVisible === true;

        if (passKab && passSing && passCip && passSocial) {
            console.log('\n✅ ALL VERIFICATION CHECKS PASSED 100%! V1 ROUTING & V2 ISOLATION RESTORED PERFECTLY.');
        } else {
            console.error('\n❌ VERIFICATION CHECKS FAILED!');
        }

    } catch (err) {
        console.error('Test execution error:', err);
    } finally {
        await browser.close();
    }
})();
