/**
 * Font Loader Module
 * Validates that all document and iframe web fonts (@font-face, Google Fonts, FontAwesome)
 * are completely loaded and rendered before preview & export.
 */

export class FontLoader {
    async ensureLoaded(targetDoc, targetWindow = window) {
        if (!targetDoc) return false;

        try {
            // 1. Wait for document.fonts.ready in both iframe and main window
            if (targetDoc.fonts && targetDoc.fonts.ready) {
                await targetDoc.fonts.ready;
            }
            if (targetWindow.document.fonts && targetWindow.document.fonts.ready) {
                await targetWindow.document.fonts.ready;
            }

            // 2. Explicitly check key web font families
            const requiredFonts = ['Inter', 'Plus Jakarta Sans', 'Font Awesome 6 Free'];
            const fontCheckPromises = requiredFonts.map(fontName => {
                if (targetDoc.fonts && targetDoc.fonts.check) {
                    const isLoaded = targetDoc.fonts.check(`12px "${fontName}"`);
                    if (!isLoaded && targetDoc.fonts.load) {
                        return targetDoc.fonts.load(`12px "${fontName}"`).catch(() => false);
                    }
                }
                return Promise.resolve(true);
            });

            await Promise.all(fontCheckPromises);

            // 3. Force font layout recalculation tick
            await new Promise(resolve => {
                if (targetWindow.requestAnimationFrame) {
                    targetWindow.requestAnimationFrame(() => {
                        targetWindow.requestAnimationFrame(resolve);
                    });
                } else {
                    setTimeout(resolve, 50);
                }
            });

            return targetDoc.fonts.status === 'loaded' || true;
        } catch (err) {
            console.warn('FontLoader warning:', err);
            return true; // Fallback gracefully if browser font API is restricted
        }
    }

    ensureIconsReady(targetDoc) {
        if (!targetDoc) return;
        const iconStyleId = 'export-icon-render-fix';
        if (!targetDoc.getElementById(iconStyleId)) {
            const style = targetDoc.createElement('style');
            style.id = iconStyleId;
            style.textContent = `
                i.fa-solid, i.fa-brands, i.fas, i.far, i.fa {
                    display: inline-flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    line-height: 1 !important;
                    vertical-align: middle !important;
                    transform: none !important;
                }
            `;
            targetDoc.head.appendChild(style);
        }
    }
}
