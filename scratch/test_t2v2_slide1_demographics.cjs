const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
    console.log('--- TESTING TEMPLATE 2 V2 SLIDE 1 DEMOGRAPHICS & RANKINGS ---');
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    console.log('Navigating to http://localhost:8080...');
    await page.goto('http://localhost:8080', { waitUntil: 'networkidle0' });

    // Switch to Media Sosial Workspace & Select Template 2 V2
    console.log('Switching to Media Sosial workspace...');
    await page.click('#tab-ws-social');
    await new Promise(r => setTimeout(r, 1000));

    console.log('Selecting Template 2 V2...');
    await page.evaluate(() => {
        if (window.app) {
            window.app.handleSocialPreview('template-2-v2');
        }
    });
    await new Promise(r => setTimeout(r, 2000));

    const getSlide1DemographicsState = async () => {
        const frame1Handle = await page.$('#preview-social-slide1');
        const frame1 = await frame1Handle.contentFrame();

        return frame1.evaluate(() => {
            const headerTitle = document.querySelector('[data-bind="valKabupaten"]')?.textContent.trim();
            const totalPop = document.querySelector('#valTotalPenduduk')?.textContent.trim();
            const valLaki = document.querySelector('#valLaki')?.textContent.trim();
            const valPerempuan = document.querySelector('#valPerempuan')?.textContent.trim();
            const valKk = document.querySelector('#valKK')?.textContent.trim();

            const genderLakiBarWidth = document.querySelector('#bar-fill-gender-laki')?.style.width;
            const genderPerempuanBarWidth = document.querySelector('#bar-fill-gender-perempuan')?.style.width;

            const ktpBarWidth = document.querySelector('#bar-fill-ktp')?.style.width;
            const anakBarWidth = document.querySelector('#bar-fill-anak')?.style.width;

            const kkLakiBarWidth = document.querySelector('#bar-fill-kk-laki')?.style.width;
            const pekkaBarWidth = document.querySelector('#bar-fill-pekka')?.style.width;

            const valLakiPct = document.querySelectorAll('[data-bind="valLakiPct"]')[0]?.textContent.trim();
            const valPerempuanPct = document.querySelectorAll('[data-bind="valPerempuanPct"]')[0]?.textContent.trim();
            const valKtpPct = document.querySelectorAll('[data-bind="valKtpPct"]')[0]?.textContent.trim();
            const valAnakPct = document.querySelectorAll('[data-bind="valAnakPct"]')[0]?.textContent.trim();
            const valKkLakiPct = document.querySelectorAll('[data-bind="valKkLakiPct"]')[0]?.textContent.trim();
            const valPekkaPct = document.querySelectorAll('[data-bind="valPekkaPct"]')[0]?.textContent.trim();
            const valKkPria = document.querySelector('[data-bind="valKkPria"]')?.textContent.trim();
            const valPekka = document.querySelector('[data-bind="valPekka"]')?.textContent.trim();

            const top5List = Array.from(document.querySelectorAll('.grid.grid-cols-2.gap-3.text-xs > div:first-child .flex')).map(el => el.textContent.trim().replace(/\s+/g, ' '));
            const bottom5List = Array.from(document.querySelectorAll('.grid.grid-cols-2.gap-3.text-xs > div:last-child .flex')).map(el => el.textContent.trim().replace(/\s+/g, ' '));

            return {
                headerTitle, totalPop, valLaki, valPerempuan, valKk,
                valLakiPct, valPerempuanPct, genderLakiBarWidth, genderPerempuanBarWidth,
                valKtpPct, valAnakPct, ktpBarWidth, anakBarWidth,
                valKkLakiPct, valPekkaPct, kkLakiBarWidth, pekkaBarWidth,
                valKkPria, valPekka,
                top5List, bottom5List
            };
        });
    };

    const kabupatenState = await getSlide1DemographicsState();
    console.log('\n=================== KABUPATEN STATE (2025 Sem 2) ===================');
    console.log(JSON.stringify(kabupatenState, null, 2));

    // Switch to CIPATUJAH kecamatan
    console.log('\nSwitching to CIPATUJAH Kecamatan...');
    await page.evaluate(() => {
        if (window.app) {
            window.app.handleModeChange('Kecamatan', 'CIPATUJAH');
        }
    });
    await new Promise(r => setTimeout(r, 2000));

    const cipatujahState = await getSlide1DemographicsState();
    console.log('=================== CIPATUJAH STATE ===================');
    console.log(JSON.stringify(cipatujahState, null, 2));

    // Change Dataset to 2024 Semester 1
    console.log('\nChanging dataset to 2024 Semester 1...');
    await page.evaluate(() => {
        if (window.app && window.app.datasetManager) {
            const ds2024 = window.app.datasetManager.getDataset(2024, 1);
            if (ds2024) {
                window.app.handleDatasetSelected(ds2024);
            }
        }
    });
    await new Promise(r => setTimeout(r, 2000));

    const dataset2024State = await getSlide1DemographicsState();
    console.log('=================== 2024 SEM 1 DATASET STATE ===================');
    console.log(JSON.stringify(dataset2024State, null, 2));

    // Take screenshot of Slide 1 Preview
    const frame1Handle = await page.$('#preview-social-slide1');
    const frame1 = await frame1Handle.contentFrame();
    const slide1Element = await frame1.$('.ig-frame') || await frame1.$('.social-canvas');
    if (slide1Element) {
        const artifactDir = 'C:\\Users\\ACER\\.gemini\\antigravity\\brain\\f49e0bdd-452a-4a9a-86d3-66683aeecebb';
        await slide1Element.screenshot({ path: path.join(artifactDir, 't2v2_slide1_demographics_preview.png') });
        console.log('\nSaved t2v2_slide1_demographics_preview.png');
    }

    await browser.close();
    console.log('\n--- TEST COMPLETED SUCCESSFULLY ---');
})();
