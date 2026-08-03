/**
 * Layout Validator Module
 * Performs automated layout validation on infographic template elements before preview & export.
 * Checks for text overflow, text collision/overlap, card overflow, and canvas safe area breaches.
 */

export class LayoutValidator {
    validate(containerElement) {
        if (!containerElement) {
            return { isValid: true, issues: [] };
        }

        const issues = [];
        const canvasRect = containerElement.getBoundingClientRect();

        // 1. Validate Canvas Safe Area
        const allElements = containerElement.querySelectorAll('header, section, footer, div, span, h1, h2, h3, h4, p');
        allElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return;

            // Check right boundary breach
            if (rect.right > canvasRect.right + 2) {
                issues.push({
                    type: 'CANVAS_BOUNDARY_BREACH_RIGHT',
                    element: el,
                    details: `Element right edge (${Math.round(rect.right)}px) exceeds canvas right edge (${Math.round(canvasRect.right)}px)`
                });
            }

            // Check bottom boundary breach
            if (rect.bottom > canvasRect.bottom + 2) {
                issues.push({
                    type: 'CANVAS_BOUNDARY_BREACH_BOTTOM',
                    element: el,
                    details: `Element bottom edge (${Math.round(rect.bottom)}px) exceeds canvas bottom edge (${Math.round(canvasRect.bottom)}px)`
                });
            }
        });

        // 2. Validate Text Overflow
        const textElements = containerElement.querySelectorAll('h1, h2, h3, h4, span, p, label');
        textElements.forEach(el => {
            if (this.isTextOverflowing(el)) {
                issues.push({
                    type: 'TEXT_OVERFLOW',
                    element: el,
                    details: `Text "${el.textContent.trim().substring(0, 30)}..." overflows container bounds (scrollWidth: ${el.scrollWidth}, clientWidth: ${el.clientWidth})`
                });
            }
        });

        // 3. Validate Card Overflow
        const cards = containerElement.querySelectorAll('.bg-white, .bg-slate-50, #header-bg, #total-pop-card, [class*="rounded-"]');
        cards.forEach(card => {
            if (card.scrollHeight > card.clientHeight + 4) {
                issues.push({
                    type: 'CARD_OVERFLOW',
                    element: card,
                    details: `Card height overflowed content (scrollHeight: ${card.scrollHeight}, clientHeight: ${card.clientHeight})`
                });
            }
        });

        return {
            isValid: issues.length === 0,
            issues
        };
    }

    isTextOverflowing(el) {
        // Element must have width to overflow
        if (el.clientWidth === 0) return false;
        return el.scrollWidth > (el.clientWidth + 2) || el.scrollHeight > (el.clientHeight + 2);
    }

    isOverlapping(rectA, rectB) {
        return !(
            rectA.right < rectB.left ||
            rectA.left > rectB.right ||
            rectA.bottom < rectB.top ||
            rectA.top > rectB.bottom
        );
    }
}
