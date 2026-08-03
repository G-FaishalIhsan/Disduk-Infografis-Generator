const puppeteer = require('puppeteer');

(async () => {
    console.log('=== VERIFYING REMOVAL OF PDF EXPORT FROM SOCIAL MEDIA WORKSPACE ===');
    const browser = await puppeteer.launch({ headless: true });
    try {
        const page = await browser.newPage();
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

        await page.waitForFunction(() => !!window.app && !!window.app.sidebar, { timeout: 10000 });

        // Switch to Social Workspace
        await page.evaluate(() => {
            window.app.sidebar.activeWorkspace = 'social';
            window.app.sidebar.render();
        });

        await new Promise(r => setTimeout(r, 400));

        const socialButtons = await page.evaluate(() => {
            const pdfBtn = document.querySelector('#btn-export-pdf');
            const zipBtn = document.querySelector('#btn-export-social-zip');
            return {
                hasPdfBtn: !!pdfBtn,
                hasZipBtn: !!zipBtn,
                zipBtnText: zipBtn ? zipBtn.textContent.trim() : ''
            };
        });

        console.log('Social Workspace Export Buttons:', socialButtons);

        if (!socialButtons.hasPdfBtn && socialButtons.hasZipBtn) {
            console.log('✅ PDF EXPORT OPTION REMOVED FROM SOCIAL MEDIA WORKSPACE SUCCESSFULLY!');
        } else {
            console.error('❌ REMOVAL VERIFICATION FAILED!');
        }

    } catch (err) {
        console.error('Test execution error:', err);
    } finally {
        await browser.close();
    }
})();
