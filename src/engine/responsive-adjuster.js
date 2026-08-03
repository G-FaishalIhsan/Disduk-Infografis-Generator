/**
 * Responsive Adjuster Module
 * Ensures text & numerical content stay strictly within card boundaries without canvas overflow.
 * Priority fallback applied ONLY to designated content elements when actual overflow occurs.
 */

export class ResponsiveAdjuster {
    adjustContainer(containerElement) {
        if (!containerElement) return;

        // Target ONLY elements explicitly marked for auto-scaling or dynamic stats containers
        const targetElements = containerElement.querySelectorAll('[data-auto-scale], .auto-fit-text');

        targetElements.forEach(el => {
            if (this.isOverflowing(el)) {
                this.applySafeScale(el);
            }
        });
    }

    isOverflowing(el) {
        return el.scrollWidth > (el.clientWidth + 2) || el.scrollHeight > (el.clientHeight + 2);
    }

    applySafeScale(el) {
        const computedStyle = window.getComputedStyle(el);
        let fontSize = parseFloat(computedStyle.fontSize);

        // Scale font down max 15% to prevent breaking design integrity
        if (fontSize > 11) {
            const newFontSize = Math.max(fontSize * 0.88, 11);
            el.style.fontSize = `${newFontSize}px`;
            if (!this.isOverflowing(el)) return;
        }

        // Reduce letter spacing slightly
        el.style.letterSpacing = '-0.02em';
    }
}
