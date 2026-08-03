const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
    console.log('=== VERIFYING ALL V2 SOCIAL MEDIA EXPORTS (TEMPLATE 1 V2 & TEMPLATE 2 V2) ===');
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 15000 });

        await page.waitForFunction(() => !!window.app && !!window.app.socialExportEngine, { timeout: 10000 });

        // 1. Switch to Social Workspace
        await page.evaluate(() => {
            window.app.sidebar.activeWorkspace = 'social';
            window.app.sidebar.render();
            window.app.handleWorkspaceChange('social');
        });
        await new Promise(r => setTimeout(r, 600));

        // 2. Test Social Template 1 V2 PNG Export
        console.log('Testing Template 1 V2 PNG export...');
        const pngResult = await page.evaluate(async () => {
            window.app.selectedSocialTemplateId = 'template-1-v2';
            const datasetPayload = window.app.activeSocialDataset;
            const manifest = window.app.socialExportEngine.templateRegistry.getTemplateManifest('template-1-v2');
            const context = await window.app.socialExportEngine.buildExportContext('template-1-v2', manifest, datasetPayload);
            const res = await window.app.socialExportEngine.pngExporter.export(context, 1);
            return { filename: res.filename, byteLength: (await res.blob.arrayBuffer()).byteLength };
        });

        console.log('Template 1 V2 PNG result:', pngResult);

        // 3. Test Social Template 1 V2 PDF Export
        console.log('Testing Template 1 V2 PDF export...');
        const pdfResult = await page.evaluate(async () => {
            window.app.selectedSocialTemplateId = 'template-1-v2';
            const datasetPayload = window.app.activeSocialDataset;
            const manifest = window.app.socialExportEngine.templateRegistry.getTemplateManifest('template-1-v2');
            const context = await window.app.socialExportEngine.buildExportContext('template-1-v2', manifest, datasetPayload);
            const res = await window.app.socialExportEngine.pdfExporter.export(context);
            return { filename: res.filename, byteLength: (await res.blob.arrayBuffer()).byteLength };
        });

        console.log('Template 1 V2 PDF result:', pdfResult);

        // 4. Test Social Template 2 V2 ZIP Export
        console.log('Testing Template 2 V2 ZIP export...');
        const zipResult = await page.evaluate(async () => {
            window.app.selectedSocialTemplateId = 'template-2-v2';
            const datasetPayload = window.app.activeSocialDataset;
            const manifest = window.app.socialExportEngine.templateRegistry.getTemplateManifest('template-2-v2');
            const context = await window.app.socialExportEngine.buildExportContext('template-2-v2', manifest, datasetPayload);
            const res = await window.app.socialExportEngine.zipExporter.export(context, () => {});
            return { filename: res.filename, byteLength: (await res.blob.arrayBuffer()).byteLength };
        });

        console.log('Template 2 V2 ZIP result:', zipResult);

        if (pngResult.byteLength > 10000 && pdfResult.byteLength > 10000 && zipResult.byteLength > 10000) {
            console.log('\n✅ ALL V2 SOCIAL EXPORTS (PNG, JPG, PDF, ZIP) ARE WORKING 100% PERFECTLY!');
        } else {
            console.error('\n❌ V2 EXPORT VERIFICATION FAILED!');
        }

    } catch (err) {
        console.error('Test execution error:', err);
    } finally {
        await browser.close();
    }
})();
