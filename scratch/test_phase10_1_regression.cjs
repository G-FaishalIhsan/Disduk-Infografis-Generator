const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    console.log('=== PHASE 10.1 COMPREHENSIVE REGRESSION TEST ===');
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

        console.log('Executing Phase 10.1 Regression Suite...');

        const testResults = await page.evaluate(async () => {
            const results = {};

            // 1. Verify App Initialization & State Isolation
            results.initialStates = {
                activeFullDataPresent: !!window.app.activeFullData,
                activeFullDataTitle: window.app.activeFullData?.metadata?.nama_wilayah,
                activeSocialDatasetPresent: !!window.app.activeSocialDataset,
                activeSocialDatasetYear: window.app.activeSocialDataset?.year,
                activeSocialDatasetSemester: window.app.activeSocialDataset?.semester
            };

            // 2. Test V1 Full Workspace District Updates
            await window.app.handleModeChange('Kecamatan', 'SINGAPARNA');
            await new Promise(r => setTimeout(r, 300));
            const singTitle = window.app.iframeElement.contentDocument.querySelector('#titleWilayah')?.textContent;
            const singTotal = window.app.iframeElement.contentDocument.querySelector('#valTotalPenduduk')?.textContent;
            
            results.v1DistrictChange = {
                title: singTitle,
                total: singTotal,
                fullDataMatches: window.app.activeFullData?.metadata?.nama_wilayah === 'KECAMATAN SINGAPARNA'
            };

            // 3. Test Workspace Switching 10 Times (Full <-> Social)
            let switchSuccessCount = 0;
            for (let i = 0; i < 10; i++) {
                const targetWs = i % 2 === 0 ? 'social' : 'full';
                await window.app.handleWorkspaceChange(targetWs);
                await new Promise(r => setTimeout(r, 100));

                if (targetWs === 'social') {
                    const visible = !document.querySelector('#preview-wrapper-social').classList.contains('hidden');
                    const fullHidden = document.querySelector('#preview-wrapper-full').classList.contains('hidden');
                    if (visible && fullHidden) switchSuccessCount++;
                } else {
                    const visible = !document.querySelector('#preview-wrapper-full').classList.contains('hidden');
                    const socialHidden = document.querySelector('#preview-wrapper-social').classList.contains('hidden');
                    if (visible && socialHidden) switchSuccessCount++;
                }
            }

            results.switching10x = {
                successCount: switchSuccessCount,
                pass10x: switchSuccessCount === 10
            };

            // Return to Full workspace
            await window.app.handleWorkspaceChange('full');
            await new Promise(r => setTimeout(r, 200));

            // Verify V1 view after switching
            results.postSwitchV1State = {
                title: window.app.iframeElement.contentDocument.querySelector('#titleWilayah')?.textContent,
                total: window.app.iframeElement.contentDocument.querySelector('#valTotalPenduduk')?.textContent,
                fullDataIntact: window.app.activeFullData?.metadata?.nama_wilayah === 'KECAMATAN SINGAPARNA'
            };

            // 4. Test V2 Excel Dataset Change (2024 Sem 1)
            const ds2024_1 = window.app.datasetManager.getDataset(2024, 1);
            await window.app.handleDatasetSelected(ds2024_1);

            results.v2DatasetChange = {
                activeSocialYear: window.app.activeSocialDataset?.year,
                activeSocialSemester: window.app.activeSocialDataset?.semester,
                // Confirm V1 state remains completely untouched
                activeFullDataUnchanged: window.app.activeFullData?.metadata?.nama_wilayah === 'KECAMATAN SINGAPARNA'
            };

            // 5. Test DatasetManager.registerDataset
            const newDatasetPayload = window.app.datasetManager.getDataset(2025, 2);
            const copyPayload = JSON.parse(JSON.stringify(newDatasetPayload));
            copyPayload.year = 2026;
            copyPayload.semester = 1;
            copyPayload.metadata.year = 2026;
            copyPayload.metadata.semester = 1;
            copyPayload.filename = 'JUMDUK SEM 1 TAHUN 2026.xlsx';

            const registered = window.app.datasetManager.registerDataset(copyPayload);
            const availableYears = window.app.datasetManager.getAvailableYears();

            results.datasetRegistration = {
                registered,
                has2026: availableYears.includes(2026),
                fullDataStillIntact: window.app.activeFullData?.metadata?.nama_wilayah === 'KECAMATAN SINGAPARNA'
            };

            return results;
        });

        console.log('\n=== REGRESSION TEST RESULTS ===');
        console.dir(testResults, { depth: null });

        const passInit = testResults.initialStates.activeFullDataPresent && testResults.initialStates.activeSocialDatasetPresent;
        const passV1Dist = testResults.v1DistrictChange.title === 'KECAMATAN SINGAPARNA' && testResults.v1DistrictChange.total === '78.038';
        const pass10x = testResults.switching10x.pass10x;
        const passPostSwitch = testResults.postSwitchV1State.title === 'KECAMATAN SINGAPARNA';
        const passV2Change = testResults.v2DatasetChange.activeSocialYear === 2024 && testResults.v2DatasetChange.activeFullDataUnchanged;
        const passReg = testResults.datasetRegistration.registered && testResults.datasetRegistration.has2026;

        if (passInit && passV1Dist && pass10x && passPostSwitch && passV2Change && passReg) {
            console.log('\n✅ ALL PHASE 10.1 REGRESSION TESTS PASSED 100%! DATA LIFECYCLES ARE TOTALLY ISOLATED.');
        } else {
            console.error('\n❌ REGRESSION TEST FAILED!');
        }

    } catch (err) {
        console.error('Test execution error:', err);
    } finally {
        await browser.close();
    }
})();
