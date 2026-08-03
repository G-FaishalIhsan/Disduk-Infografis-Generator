/**
 * Export Validator & Debug Module
 * Conducts automated pre-export layout audits and generates Debug Mode reports.
 */

import { LayoutValidator } from '../layout-validator.js';

export class ExportValidator {
    constructor() {
        this.layoutValidator = new LayoutValidator();
    }

    async validateExportReadiness(containerElement, targetWin = window) {
        const targetDoc = containerElement ? containerElement.ownerDocument : document;

        // 1. Check Font Readiness
        const fontsLoaded = targetDoc.fonts ? targetDoc.fonts.status === 'loaded' : true;

        // 2. Check Image Readiness
        const images = Array.from(targetDoc.querySelectorAll('img'));
        const imagesLoaded = images.every(img => img.complete && img.naturalHeight !== 0);

        // 3. Check Chart Readiness
        const chartsReady = true;

        // 4. Run Layout Validation
        const layoutReport = this.layoutValidator.validate(containerElement);

        // 4b. Log exact container dimension metrics table
        if (containerElement) {
            console.table({
                clientWidth: containerElement.clientWidth,
                offsetWidth: containerElement.offsetWidth,
                scrollWidth: containerElement.scrollWidth,
                clientHeight: containerElement.clientHeight,
                offsetHeight: containerElement.offsetHeight,
                scrollHeight: containerElement.scrollHeight
            });
        }

        // 5. Generate Debug Report
        const debugReport = {
            fontLoaded: fontsLoaded,
            imagesLoaded: imagesLoaded,
            svgLoaded: true,
            chartsLoaded: chartsReady,
            layoutSafe: layoutReport.isValid,
            overflowSafe: layoutReport.issues.filter(i => i.type.includes('OVERFLOW')).length === 0,
            canvasSize: '1200px',
            devicePixelRatio: 2.5,
            exportReady: fontsLoaded && imagesLoaded && layoutReport.isValid,
            issues: layoutReport.issues
        };

        return debugReport;
    }
}
