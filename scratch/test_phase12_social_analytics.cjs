const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    console.log('=== PHASE 12: FULL SOCIAL WORKSPACE ANALYTICS INTEGRATION TEST ===');
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--allow-file-access-from-files']
    });

    try {
        const page = await browser.newPage();
        const fileUrl = 'file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/');
        await page.goto(fileUrl, { waitUntil: 'networkidle0', timeout: 15000 });

        await page.waitForFunction(() => !!window.app, { timeout: 10000 });

        // Switch to Media Sosial Workspace (V2) via app controller
        await page.evaluate(() => window.app.handleWorkspaceChange('social'));
        await new Promise(r => setTimeout(r, 600));

        console.log('Verifying V2 Social Workspace Analytics Forwarding...');

        const testResults = await page.evaluate(async () => {
            const results = {};

            const dataObj = window.app.dataBinderV2 ? window.app.dataBinderV2.buildTemplateDataObject(null, 'SINGAPARNA') : null;

            results.v2DataObjHasAnalytics = !!dataObj?.analytics;
            results.v2AnalyticsHasDesaDataFlag = dataObj?.analytics?.hasDesaData;
            results.v2AnalyticsTopDesaLength = dataObj?.analytics?.topDesaPenduduk?.length || 0;

            // Test iframe receiving analytics
            const iframe1 = document.querySelector('#preview-social-slide1');
            const doc1 = iframe1 ? (iframe1.contentDocument || iframe1.contentWindow.document) : null;
            const titleEl = doc1 ? doc1.querySelector('#titleWilayah') : null;

            results.v2Iframe1Rendered = !!titleEl;
            results.v2Iframe1Title = titleEl ? titleEl.textContent.trim() : '';

            return results;
        });

        console.log('\n=== TEST RESULTS ===');
        console.dir(testResults, { depth: null });

        if (testResults.v2DataObjHasAnalytics && testResults.v2Iframe1Rendered) {
            console.log('\n✅ PHASE 12 SOCIAL WORKSPACE ANALYTICS INTEGRATION TEST PASSED 100%!');
        } else {
            console.error('\n❌ TEST FAILED!');
        }

    } catch (err) {
        console.error('Test execution error:', err);
    } finally {
        await browser.close();
    }
})();
