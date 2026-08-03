/**
 * Auto-Fitting Engine Module
 * Automatically resolves layout & boundary issues without modifying visual design templates.
 * Enforces the strict 8-step Responsive Data Rule hierarchy.
 */

import { LayoutValidator } from './layout-validator.js';

export class AutoFitter {
    constructor() {
        this.validator = new LayoutValidator();
    }

    fit(containerElement) {
        if (!containerElement) return;

        // Run initial validation report
        let report = this.validator.validate(containerElement);
        if (report.isValid) {
            return report;
        }

        // Apply auto-fitting to text elements and header titles
        const targetTextElements = containerElement.querySelectorAll('h1, h2, h3, h4, span.truncate, .break-words, #header-bg h2, #header-bg h1');

        targetTextElements.forEach(el => {
            if (this.validator.isTextOverflowing(el)) {
                this.applyResponsiveRuleHierarchy(el);
            }
        });

        // Ensure all flex containers have min-width: 0 to prevent flex flex-shrink overflows
        const flexContainers = containerElement.querySelectorAll('.flex, .grid');
        flexContainers.forEach(container => {
            if (container.children) {
                Array.from(container.children).forEach(child => {
                    if (child.style && !child.style.minWidth) {
                        child.style.minWidth = '0';
                    }
                });
            }
        });

        // Final validation check after fitting
        return this.validator.validate(containerElement);
    }

    applyResponsiveRuleHierarchy(el) {
        const computedStyle = window.getComputedStyle(el);
        let fontSize = parseFloat(computedStyle.fontSize);

        // Rule 1: Scale font-size proportionally (down to 75% minimum)
        if (fontSize > 10) {
            for (let scale = 0.96; scale >= 0.75; scale -= 0.04) {
                const testSize = Math.max(fontSize * scale, 10);
                el.style.fontSize = `${testSize}px`;
                if (!this.validator.isTextOverflowing(el)) return;
            }
        }

        // Rule 2: Reduce letter-spacing
        el.style.letterSpacing = '-0.02em';
        if (!this.validator.isTextOverflowing(el)) return;

        // Rule 3: Reduce line-height proportionally
        el.style.lineHeight = '1.1';
        if (!this.validator.isTextOverflowing(el)) return;

        // Rule 4: Word-wrap
        el.style.wordWrap = 'break-word';
        el.style.overflowWrap = 'break-word';
        if (!this.validator.isTextOverflowing(el)) return;

        // Rule 5: Multi-line (max 2-3 lines)
        el.style.whiteSpace = 'normal';
        if (!this.validator.isTextOverflowing(el)) return;

        // Rule 6: Flex/Grid alignment safeguard
        if (el.parentElement) {
            el.parentElement.style.minWidth = '0';
        }
        if (!this.validator.isTextOverflowing(el)) return;

        // Rule 7: Scale inner card padding proportionally if container is card
        const parentCard = el.closest('.p-4, .p-5, .p-6, .p-8');
        if (parentCard) {
            parentCard.style.padding = '0.75rem';
            if (!this.validator.isTextOverflowing(el)) return;
        }

        // Rule 8: Ellipsis (...) ONLY as last resort
        el.style.overflow = 'hidden';
        el.style.textOverflow = 'ellipsis';
    }
}
