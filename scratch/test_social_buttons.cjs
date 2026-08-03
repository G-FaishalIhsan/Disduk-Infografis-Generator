const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('http://localhost:8080/', { waitUntil: 'networkidle0' });

    console.log('--- Initial Page Load (Full Workspace) ---');
    let pngBtn = await page.$('#btn-export-png');
    let jpgBtn = await page.$('#btn-export-jpg');
    let pdfBtn = await page.$('#btn-export-pdf');
    let zipBtn = await page.$('#btn-export-social-zip');

    console.log('Full Workspace Buttons:', {
        PNG: !!pngBtn,
        JPG: !!jpgBtn,
        PDF: !!pdfBtn,
        ZIP: !!zipBtn
    });

    console.log('\n--- Switching to Media Sosial Workspace ---');
    await page.click('#tab-ws-social');
    await new Promise(r => setTimeout(r, 500));

    pngBtn = await page.$('#btn-export-png');
    jpgBtn = await page.$('#btn-export-jpg');
    pdfBtn = await page.$('#btn-export-pdf');
    zipBtn = await page.$('#btn-export-social-zip');

    const pdfText = pdfBtn ? await page.evaluate(el => el.textContent.trim(), pdfBtn) : null;
    const zipText = zipBtn ? await page.evaluate(el => el.textContent.trim(), zipBtn) : null;

    console.log('Social Workspace Buttons:', {
        PNG: !!pngBtn,
        JPG: !!jpgBtn,
        PDF: !!pdfBtn,
        PDF_Text: pdfText,
        ZIP: !!zipBtn,
        ZIP_Text: zipText
    });

    // Capture screenshot of sidebar in Social Workspace
    const sidebar = await page.$('#sidebar-container');
    if (sidebar) {
        await sidebar.screenshot({ path: 'C:/Users/ACER/.gemini/antigravity/brain/f49e0bdd-452a-4a9a-86d3-66683aeecebb/social_sidebar_buttons.png' });
        console.log('Saved sidebar screenshot to social_sidebar_buttons.png');
    }

    await browser.close();

    if (!pngBtn && !jpgBtn && pdfBtn && zipBtn) {
        console.log('\nVERIFICATION SUCCESSFUL: PNG and JPG buttons are removed for Social Workspace; ONLY PDF and ZIP remain!');
    } else {
        console.error('\nVERIFICATION FAILED!');
        process.exit(1);
    }
})();
