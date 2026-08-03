const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
    console.log('--- STARTING SLIDE 2 & EXPORT VERIFICATION TEST ---');
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    console.log('Navigating to http://localhost:8080...');
    await page.goto('http://localhost:8080', { waitUntil: 'networkidle0' });

    // Switch to Media Sosial Workspace
    console.log('Switching to Media Sosial workspace...');
    await page.click('#tab-ws-social');
    await new Promise(r => setTimeout(r, 1500));

    // Frame 2 element check for Kabupaten (Case 1)
    const frame2Handle = await page.$('#preview-social-slide2');
    const frame2 = await frame2Handle.contentFrame();

    const getSlide2State = async () => {
        return frame2.evaluate(() => {
            const rank1Name = document.querySelector('#valRank1Name')?.textContent.trim();
            const rank1Count = document.querySelector('#valRank1Count')?.textContent.trim();
            const rank1Details = document.querySelector('#valRank1Details')?.textContent.trim();

            const rank2Name = document.querySelector('#valRank2Name')?.textContent.trim();
            const rank2Count = document.querySelector('#valRank2Count')?.textContent.trim();
            const rank2Details = document.querySelector('#valRank2Details')?.textContent.trim();

            const rank3Name = document.querySelector('#valRank3Name')?.textContent.trim();
            const rank3Count = document.querySelector('#valRank3Count')?.textContent.trim();
            const rank3Details = document.querySelector('#valRank3Details')?.textContent.trim();

            const ktpPct = document.querySelector('#svg-text-ktp')?.textContent.trim();
            const lahirPct = document.querySelector('#svg-text-lahir')?.textContent.trim();
            const nikahPct = document.querySelector('#svg-text-nikah')?.textContent.trim();

            const ringKtpDash = document.querySelector('#svg-ring-ktp')?.getAttribute('stroke-dasharray');
            const ringLahirDash = document.querySelector('#svg-ring-lahir')?.getAttribute('stroke-dasharray');

            return {
                rank1Name, rank1Count, rank1Details,
                rank2Name, rank2Count, rank2Details,
                rank3Name, rank3Count, rank3Details,
                ktpPct, lahirPct, nikahPct,
                ringKtpDash, ringLahirDash
            };
        });
    };

    const kabupatenState = await getSlide2State();
    console.log('\n=================== KABUPATEN STATE (Case 1) ===================');
    console.log(JSON.stringify(kabupatenState, null, 2));

    // Switch to CIPATUJAH kecamatan (Case 2)
    console.log('\nSelecting CIPATUJAH kecamatan...');
    await page.evaluate(() => {
        if (window.app) {
            window.app.handleModeChange('Kecamatan', 'CIPATUJAH');
        }
    });
    await new Promise(r => setTimeout(r, 1200));

    const cipatujahState = await getSlide2State();
    console.log('=================== CIPATUJAH STATE (Case 2) ===================');
    console.log(JSON.stringify(cipatujahState, null, 2));

    // Take screenshot of Slide 2 Preview
    const slide2Element = await frame2.$('.slide-canvas');
    if (slide2Element) {
        await slide2Element.screenshot({ path: path.join(__dirname, 'verify_slide2_preview.png') });
        console.log('\nSaved verify_slide2_preview.png');
    }

    // Trigger PDF Export & verify loading toast
    console.log('\nTriggering PDF Carousel export...');
    await page.click('#btn-export-pdf');
    
    // Check loading toast visibility
    await new Promise(r => setTimeout(r, 500));
    const toastState = await page.evaluate(() => {
        const toast = document.querySelector('#export-loading-toast');
        const title = document.querySelector('#export-toast-title')?.textContent;
        const desc = document.querySelector('#export-toast-desc')?.textContent;
        const isVisible = toast && !toast.classList.contains('opacity-0');
        return { isVisible, title, desc };
    });
    console.log('LOADING TOAST STATE:', toastState);

    // Wait for export download / completion
    await new Promise(r => setTimeout(r, 4000));

    await browser.close();
    console.log('\n--- TEST COMPLETED SUCCESSFULLY ---');
})();
