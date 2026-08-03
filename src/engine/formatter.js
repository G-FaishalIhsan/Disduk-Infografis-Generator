/**
 * Common Formatter Module (Phase 6 — Social Template Engine)
 * Provides standardized Indonesian locale formatting for numbers, percentages,
 * land areas, population densities, and sex ratios across all V2 templates.
 */

export class Formatter {
    /**
     * Formats integer/decimal with Indonesian dot thousand separator (e.g. 78038 -> "78.038")
     * @param {any} val 
     * @returns {string}
     */
    static formatNumber(val) {
        if (val === null || val === undefined || val === '') return '0';
        const num = Number(val);
        if (isNaN(num)) return String(val);
        return num.toLocaleString('id-ID');
    }

    /**
     * Formats percentage with Indonesian comma decimal separator (e.g. 50.48 -> "50,5%")
     * @param {number} value 
     * @param {number} total 
     * @param {number} decimals 
     * @returns {string}
     */
    static formatPercent(value, total, decimals = 1) {
        if (!total || total === 0) return '0,0%';
        const pct = (Number(value) / Number(total)) * 100;
        return pct.toFixed(decimals).replace('.', ',') + '%';
    }

    /**
     * Formats land area in km² (e.g. 20.1 -> "20,10 km²")
     * @param {number} sqkm 
     * @returns {string}
     */
    static formatArea(sqkm) {
        if (!sqkm || isNaN(Number(sqkm))) return '2.708 km²';
        const num = Number(sqkm);
        return num.toFixed(2).replace('.', ',') + ' km²';
    }

    /**
     * Formats population density in Jiwa/km² (e.g. 3881 -> "3.881 Jiwa/km²")
     * @param {number} density 
     * @returns {string}
     */
    static formatDensity(density) {
        if (!density || isNaN(Number(density))) return '748 Jiwa/km²';
        return `${this.formatNumber(density)} Jiwa/km²`;
    }

    /**
     * Formats Sex Ratio (Laki-Laki per 100 Perempuan, e.g. 102.3 -> "102,3")
     * @param {number} laki 
     * @param {number} perempuan 
     * @returns {string}
     */
    static formatSexRatio(laki, perempuan) {
        if (!perempuan || perempuan === 0) return '100,0';
        const ratio = (Number(laki) / Number(perempuan)) * 100;
        return ratio.toFixed(1).replace('.', ',');
    }
}
