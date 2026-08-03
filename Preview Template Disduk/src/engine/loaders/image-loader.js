/**
 * Image Loader Module
 * Validates and preloads all <img> tags, background images, and SVG assets
 * inside target document before export execution.
 */

export class ImageLoader {
    async preloadAll(targetDoc) {
        if (!targetDoc) return true;

        const promises = [];

        // 1. Preload <img> elements
        const imgElements = Array.from(targetDoc.querySelectorAll('img'));
        imgElements.forEach(img => {
            if (img.complete && img.naturalHeight !== 0) {
                if (img.decode) {
                    promises.push(img.decode().catch(() => true));
                }
            } else {
                promises.push(new Promise(resolve => {
                    img.onload = resolve;
                    img.onerror = resolve;
                }));
            }
        });

        // 2. Preload CSS Background Images
        const elementsWithBg = Array.from(targetDoc.querySelectorAll('[style*="background-image"], header, #header-bg'));
        elementsWithBg.forEach(el => {
            const bgStyle = el.style.backgroundImage || window.getComputedStyle(el).backgroundImage;
            if (bgStyle && bgStyle !== 'none' && bgStyle.includes('url(')) {
                const match = bgStyle.match(/url\(['"]?(.*?)['"]?\)/);
                if (match && match[1]) {
                    const src = match[1];
                    const bgImg = new Image();
                    bgImg.src = src;
                    promises.push(new Promise(resolve => {
                        bgImg.onload = resolve;
                        bgImg.onerror = resolve;
                    }));
                }
            }
        });

        await Promise.all(promises);
        return true;
    }

    async preloadSvg(targetDoc) {
        if (!targetDoc) return true;
        const svgs = Array.from(targetDoc.querySelectorAll('svg'));
        svgs.forEach(svg => {
            if (!svg.getAttribute('xmlns')) {
                svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            }
        });
        return true;
    }
}
