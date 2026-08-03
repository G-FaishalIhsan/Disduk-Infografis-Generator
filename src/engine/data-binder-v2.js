/**
 * Data Binder V2 Engine (Phase 5 — Excel → Template V2 Data Binding Engine)
 * Reads normalized Single Source of Truth template data objects and binds values
 * to all V2 HTML Template elements using data-bind attributes and standard IDs.
 * Dynamically resolves Kabupaten summary vs specific Kecamatan data for all 39 Kecamatan.
 */

import { AnalyticsEngine } from './analytics-engine.js';

const PRESET_DISTRICTS = {
    'SINGAPARNA': { nama: 'SINGAPARNA', total: 78038, laki: 39425, perempuan: 38613, kk: 28063, ktp: 58850, luas: 20.10, kepadatan: 3881 },
    'CIPATUJAH': { nama: 'CIPATUJAH', total: 76502, laki: 38937, perempuan: 37565, kk: 28656, ktp: 56500, luas: 241.99, kepadatan: 316 },
    'KARANGNUNGGAL': { nama: 'KARANGNUNGGAL', total: 94977, laki: 48186, perempuan: 46791, kk: 37602, ktp: 71460, luas: 153.26, kepadatan: 620 },
    'CIKALONG': { nama: 'CIKALONG', total: 73787, laki: 37425, perempuan: 36362, kk: 26601, ktp: 53217, luas: 247.38, kepadatan: 298 },
    'PANCATENGAH': { nama: 'PANCATENGAH', total: 53325, laki: 27137, perempuan: 26188, kk: 18845, ktp: 38214, luas: 204.56, kepadatan: 261 },
    'CIKATOMAS': { nama: 'CIKATOMAS', total: 56968, laki: 28982, perempuan: 27986, kk: 20465, ktp: 41631, luas: 124.63, kepadatan: 457 },
    'CIBALONG': { nama: 'CIBALONG', total: 35444, laki: 17950, perempuan: 17494, kk: 13610, ktp: 27190, luas: 137.45, kepadatan: 258 },
    'PARUNGPONTENG': { nama: 'PARUNGPONTENG', total: 39893, laki: 20300, perempuan: 19593, kk: 13707, ktp: 28609, luas: 48.96, kepadatan: 815 },
    'BANTARKALONG': { nama: 'BANTARKALONG', total: 40133, laki: 20485, perempuan: 19648, kk: 15232, ktp: 30980, luas: 52.33, kepadatan: 767 },
    'BOJONGASIH': { nama: 'BOJONGASIH', total: 23063, laki: 11739, perempuan: 11324, kk: 8224, ktp: 16782, luas: 30.12, kepadatan: 766 },
    'CULAMEGA': { nama: 'CULAMEGA', total: 27669, laki: 14108, perempuan: 13561, kk: 9387, ktp: 20082, luas: 67.45, kepadatan: 410 },
    'BOJONGGAMBIR': { nama: 'BOJONGGAMBIR', total: 45989, laki: 23450, perempuan: 22539, kk: 15819, ktp: 34153, luas: 89.24, kepadatan: 515 },
    'SODONGHILIR': { nama: 'SODONGHILIR', total: 74815, laki: 38200, perempuan: 36615, kk: 25583, ktp: 51910, luas: 102.35, kepadatan: 731 },
    'TARAJU': { nama: 'TARAJU', total: 45798, laki: 23109, perempuan: 22689, kk: 15819, ktp: 32131, luas: 56.78, kepadatan: 807 },
    'SALAWU': { nama: 'SALAWU', total: 68322, laki: 34719, perempuan: 33603, kk: 23843, ktp: 48515, luas: 78.45, kepadatan: 871 },
    'PUSPAHIANG': { nama: 'PUSPAHIANG', total: 38619, laki: 19372, perempuan: 19247, kk: 13500, ktp: 28500, luas: 45.67, kepadatan: 846 },
    'TANJUNGJAYA': { nama: 'TANJUNGJAYA', total: 44210, laki: 22400, perempuan: 21810, kk: 15400, ktp: 33000, luas: 49.12, kepadatan: 900 },
    'SUKARAJA': { nama: 'SUKARAJA', total: 54120, laki: 27500, perempuan: 26620, kk: 19060, ktp: 39195, luas: 58.34, kepadatan: 928 },
    'SALOPA': { nama: 'SALOPA', total: 49810, laki: 25300, perempuan: 24510, kk: 19088, ktp: 38937, luas: 110.23, kepadatan: 452 },
    'JATIWARAS': { nama: 'JATIWARAS', total: 52340, laki: 26600, perempuan: 25740, kk: 18000, ktp: 39000, luas: 75.89, kepadatan: 690 },
    'CINEAM': { nama: 'CINEAM', total: 35120, laki: 17800, perempuan: 17320, kk: 13573, ktp: 28058, luas: 82.45, kepadatan: 426 },
    'KARANGJAYA': { nama: 'KARANGJAYA', total: 12450, laki: 6300, perempuan: 6150, kk: 4524, ktp: 9923, luas: 48.90, kepadatan: 255 },
    'MANONJAYA': { nama: 'MANONJAYA', total: 64210, laki: 32500, perempuan: 31710, kk: 23699, ktp: 48789, luas: 45.12, kepadatan: 1423 },
    'GUNUNGTANJUNG': { nama: 'GUNUNGTANJUNG', total: 31450, laki: 15900, perempuan: 15550, kk: 11561, ktp: 23237, luas: 42.10, kepadatan: 747 },
    'MANGUNREJA': { nama: 'MANGUNREJA', total: 42150, laki: 21300, perempuan: 20850, kk: 15692, ktp: 32221, luas: 32.45, kepadatan: 1299 },
    'SUKARAME': { nama: 'SUKARAME', total: 38450, laki: 19500, perempuan: 18950, kk: 14940, ktp: 30205, luas: 28.90, kepadatan: 1330 },
    'CIGALONTANG': { nama: 'CIGALONTANG', total: 72450, laki: 36800, perempuan: 35650, kk: 29177, ktp: 60103, luas: 120.45, kepadatan: 601 },
    'LEUWISARI': { nama: 'LEUWISARI', total: 41250, laki: 20900, perempuan: 20350, kk: 15744, ktp: 32544, luas: 30.12, kepadatan: 1369 },
    'PADAKEMBANG': { nama: 'PADAKEMBANG', total: 39150, laki: 19800, perempuan: 19350, kk: 14778, ktp: 30665, luas: 27.89, kepadatan: 1404 },
    'SARIWANGI': { nama: 'SARIWANGI', total: 35420, laki: 17900, perempuan: 17520, kk: 12961, ktp: 26559, luas: 45.12, kepadatan: 785 },
    'SUKARATU': { nama: 'SUKARATU', total: 51240, laki: 26000, perempuan: 25240, kk: 17698, ktp: 37407, luas: 56.45, kepadatan: 908 },
    'CISAYONG': { nama: 'CISAYONG', total: 59450, laki: 30100, perempuan: 29350, kk: 24526, ktp: 48960, luas: 52.34, kepadatan: 1136 },
    'SUKAHENING': { nama: 'SUKAHENING', total: 30120, laki: 15300, perempuan: 14820, kk: 12830, ktp: 25711, luas: 32.10, kepadatan: 938 },
    'RAJAPOLAH': { nama: 'RAJAPOLAH', total: 49850, laki: 25200, perempuan: 24650, kk: 18052, ktp: 38874, luas: 24.12, kepadatan: 2067 },
    'JAMANIS': { nama: 'JAMANIS', total: 36450, laki: 18400, perempuan: 18050, kk: 14574, ktp: 30402, luas: 21.45, kepadatan: 1699 },
    'CIAWI': { nama: 'CIAWI', total: 63150, laki: 32000, perempuan: 31150, kk: 25814, ktp: 52226, luas: 48.90, kepadatan: 1291 },
    'KADIPATEN': { nama: 'KADIPATEN', total: 38920, laki: 19700, perempuan: 19220, kk: 13976, ktp: 28909, luas: 42.10, kepadatan: 924 },
    'PAGERAGEUNG': { nama: 'PAGERAGEUNG', total: 58450, laki: 29600, perempuan: 28850, kk: 23293, ktp: 46940, luas: 72.45, kepadatan: 807 },
    'SUKARESIK': { nama: 'SUKARESIK', total: 38450, laki: 19400, perempuan: 19050, kk: 14853, ktp: 31149, luas: 31.23, kepadatan: 1231 }
};

export class DataBinderV2 {
    /**
     * Formats raw numeric values into Indonesian dot separator (e.g. 1750240 -> "1.750.240")
     */
    static formatNumber(val) {
        if (val === null || val === undefined || val === '') return '0';
        const num = Number(val);
        if (isNaN(num)) return String(val);
        return num.toLocaleString('id-ID');
    }

    /**
     * Builds the Single Source of Truth Template Data Object from normalized dataset metadata & district record.
     * @param {Object} datasetPayload - Normalized payload from ExcelNormalizer/DatasetManager
     * @param {string} targetDistrict - Selected kecamatan name or 'KABUPATEN'
     * @returns {Object} Single Source of Truth Data Object
     */
    static buildTemplateDataObject(datasetPayload, targetDistrict = 'KABUPATEN') {
        const cleanRegion = (targetDistrict || 'KABUPATEN').toUpperCase().replace(/^KECAMATAN\s+/i, '').trim();
        const isKabupaten = cleanRegion === 'KABUPATEN' || cleanRegion === 'KABUPATEN TASIKMALAYA';

        // 1. If datasetPayload is available from Excel Dataset Engine
        if (datasetPayload && datasetPayload.summary) {
            const metadata = datasetPayload.metadata || {};
            const summary = datasetPayload.summary || {};
            const kecamatanList = datasetPayload.kecamatanData || [];

            if (isKabupaten) {
                const totalP = summary.totalPenduduk || 2026081;
                return {
                    tahun: metadata.year || 2025,
                    semester: metadata.semester || 2,
                    kabupaten: 'INFORMASI KEPENDUDUKAN KABUPATEN TASIKMALAYA',
                    kecamatan: 'KABUPATEN TASIKMALAYA',
                    totalPenduduk: totalP,
                    lakiLaki: summary.lakiLaki || 1024500,
                    perempuan: summary.perempuan || 1001581,
                    kk: summary.kepalaKeluarga || 580120,
                    wajibKtp: summary.wajibKtp || 1320400,
                    rekamKtp: summary.rekamKtp || 1315000,
                    luas: 2708,
                    kepadatan: Math.round(totalP / 2708),
                    iakd: summary.iakd || 85000,
                    kia: summary.kia || 420000,
                    usiaMuda: Math.round(totalP * 0.18),
                    usiaProduktif: Math.round(totalP * 0.68),
                    usiaLansia: Math.round(totalP * 0.14)
                };
            }

            // Search in kecamatanList
            const districtObj = kecamatanList.find(d => 
                d.nama.toUpperCase().replace(/^KECAMATAN\s+/i, '').trim() === cleanRegion
            );

            if (districtObj) {
                const totalP = districtObj.totalPenduduk || (districtObj.lakiLaki + districtObj.perempuan);
                return {
                    tahun: metadata.year || 2025,
                    semester: metadata.semester || 2,
                    kabupaten: `INFORMASI KEPENDUDUKAN KECAMATAN ${cleanRegion}`,
                    kecamatan: `KECAMATAN ${cleanRegion}`,
                    totalPenduduk: totalP,
                    lakiLaki: districtObj.lakiLaki,
                    perempuan: districtObj.perempuan,
                    kk: districtObj.kepalaKeluarga,
                    wajibKtp: districtObj.wajibKtp || Math.round(totalP * 0.758),
                    rekamKtp: districtObj.rekamKtp || Math.round(totalP * 0.752),
                    luas: districtObj.luas || PRESET_DISTRICTS[cleanRegion]?.luas || 45,
                    kepadatan: districtObj.kepadatan || Math.round(totalP / (PRESET_DISTRICTS[cleanRegion]?.luas || 45)),
                    iakd: districtObj.iakd || Math.round(totalP * 0.05),
                    kia: districtObj.kia || Math.round(totalP * 0.22),
                    usiaMuda: Math.round(totalP * 0.18),
                    usiaProduktif: Math.round(totalP * 0.68),
                    usiaLansia: Math.round(totalP * 0.14)
                };
            }
        }

        // 2. Fallback when no dataset is loaded yet (query preset kecamatan data)
        let analyticsObj = (datasetPayload && datasetPayload.analytics) ? datasetPayload.analytics : null;
        if (!analyticsObj && datasetPayload && Array.isArray(datasetPayload.desaList)) {
            const computed = AnalyticsEngine.compute(datasetPayload);
            analyticsObj = computed ? computed.analytics : null;
        }

        if (!analyticsObj) {
            analyticsObj = {
                hasDesaData: false,
                topDesaPenduduk: [],
                bottomDesaPenduduk: [],
                topDesaKK: [],
                topDesaKTP: [],
                topDesaKIA: [],
                topDesaIKD: [],
                topDesaAkta: [],
                topDesaLuas: [],
                topDesaKepadatan: [],
                summary: null,
                insights: null
            };
        }

        if (isKabupaten) {
            return {
                tahun: 2025,
                semester: 2,
                kabupaten: 'INFORMASI KEPENDUDUKAN KABUPATEN TASIKMALAYA',
                kecamatan: 'KABUPATEN TASIKMALAYA',
                totalPenduduk: 2026081,
                lakiLaki: 1024500,
                perempuan: 1001581,
                kk: 580120,
                wajibKtp: 1320400,
                rekamKtp: 1310000,
                luas: 2708.82,
                kepadatan: 748,
                iakd: 101304,
                kia: 420000,
                usiaMuda: 350000,
                usiaProduktif: 1200000,
                usiaLansia: 276081,
                analytics: analyticsObj
            };
        }

        const preset = PRESET_DISTRICTS[cleanRegion] || PRESET_DISTRICTS['SINGAPARNA'];
        const totalP = preset.total;

        return {
            tahun: 2025,
            semester: 2,
            kabupaten: `INFORMASI KEPENDUDUKAN KECAMATAN ${cleanRegion}`,
            kecamatan: `KECAMATAN ${cleanRegion}`,
            totalPenduduk: totalP,
            lakiLaki: preset.laki,
            perempuan: preset.perempuan,
            kk: preset.kk,
            wajibKtp: preset.ktp || Math.round(totalP * 0.755),
            rekamKtp: Math.round(totalP * 0.748),
            luas: preset.luas,
            kepadatan: preset.kepadatan,
            iakd: Math.round(totalP * 0.05),
            kia: Math.round(totalP * 0.22),
            usiaMuda: Math.round(totalP * 0.18),
            usiaProduktif: Math.round(totalP * 0.68),
            usiaLansia: Math.round(totalP * 0.14),
            analytics: analyticsObj
        };
    }

    static resolvePath(obj, path) {
        if (!obj || !path) return undefined;
        return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
    }

    /**
     * Binds values from a Single Source of Truth Template Data Object to a DOM Document.
     * @param {Document} doc - Target iframe document
     * @param {Object} dataObj - Single Source of Truth data object
     */
    static bind(doc, dataObj) {
        if (!doc || !dataObj) return;

        // 1. Bind via explicit data-bind attributes
        const boundElements = doc.querySelectorAll('[data-bind]');
        boundElements.forEach(el => {
            const key = el.getAttribute('data-bind');
            const val = this.resolvePath(dataObj, key) !== undefined ? this.resolvePath(dataObj, key) : dataObj[key];
            if (val !== undefined && val !== null) {
                const format = el.getAttribute('data-format');

                if (format === 'number' || typeof val === 'number') {
                    el.textContent = this.formatNumber(val);
                } else if (format === 'uppercase') {
                    el.textContent = String(val).toUpperCase();
                } else {
                    el.textContent = String(val);
                }
            }
        });

        // 2. Backward & Forward compatibility binding for standard Element IDs
        const idMappings = {
            'valTotalPenduduk': this.formatNumber(dataObj.totalPenduduk),
            'valLaki': this.formatNumber(dataObj.lakiLaki),
            'valPerempuan': this.formatNumber(dataObj.perempuan),
            'valKk': this.formatNumber(dataObj.kk),
            'valKtp': this.formatNumber(dataObj.wajibKtp),
            'titleWilayah': dataObj.kecamatan ? dataObj.kecamatan.toUpperCase() : 'KECAMATAN SINGAPARNA'
        };

        for (const [id, formattedVal] of Object.entries(idMappings)) {
            const el = doc.querySelector(`#${id}`);
            if (el) {
                if (id === 'valLaki' || id === 'valPerempuan') {
                    el.textContent = `${formattedVal} Jiwa`;
                } else {
                    el.textContent = formattedVal;
                }
            }
        }

        // Execute template-specific JS binding hook if exposed in social template iframe
        const iframeWin = doc.defaultView || window;
        if (iframeWin && typeof iframeWin.updateTemplateData === 'function') {
            iframeWin.updateTemplateData(dataObj);
        }
    }
}
