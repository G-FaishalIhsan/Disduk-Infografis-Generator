/**
 * Excel Normalizer Module (Phase 4 — Excel Engine)
 * Cleans raw Excel row data, parses Indonesian numbers, maps headers via synonyms,
 * and produces a standardized, consistent JSON payload structure.
 */
import { resolveColumnKey, normalizeHeaderString } from './mapping/columnSynonyms.js';

export class ExcelNormalizer {
    /**
     * Parse and normalize raw cell numeric value (handles '1.750.240', '1,750,240', 1750240, null)
     * @param {any} val 
     * @returns {number}
     */
    static parseNumber(val) {
        if (val === null || val === undefined || val === '') return 0;
        if (typeof val === 'number') return Math.round(val);
        
        let str = String(val).trim().replace(/\s+/g, '');
        // If string contains Indonesian dot separator (e.g. "1.750.240"), remove dots
        if (/^\d{1,3}(\.\d{3})+$/.test(str)) {
            str = str.replace(/\./g, '');
        } else if (/^\d{1,3}(,\d{3})+$/.test(str)) {
            str = str.replace(/,/g, '');
        }
        
        const parsed = parseInt(str, 10);
        return isNaN(parsed) ? 0 : parsed;
    }

    /**
     * Normalizes raw Excel sheet rows into a standardized JSON payload.
     * @param {Array<Object>} rawRows - Array of objects where keys are raw column headers
     * @param {Object} options - Metadata options (year, semester, filename)
     * @returns {Object} Standardized JSON payload
     */
    static normalizeRows(rawRows = [], options = {}) {
        if (!Array.isArray(rawRows) || rawRows.length === 0) {
            return {
                metadata: {
                    year: options.year || 2025,
                    semester: options.semester || 1,
                    filename: options.filename || 'dataset.xlsx',
                    status: 'active',
                    rowCount: 0
                },
                summary: {
                    totalPenduduk: 0,
                    lakiLaki: 0,
                    perempuan: 0,
                    kepalaKeluarga: 0,
                    wajibKtp: 0,
                    rekamKtp: 0,
                    iakd: 0,
                    kia: 0
                },
                kecamatanData: []
            };
        }

        // 1. Detect header mapping from the first row keys
        const rawHeaders = Object.keys(rawRows[0]);
        const headerMap = {};
        rawHeaders.forEach(rh => {
            const mappedKey = resolveColumnKey(rh);
            if (mappedKey) {
                headerMap[rh] = mappedKey;
            }
        });

        // 2. Iterate rows and extract district/kecamatan records
        const kecamatanList = [];
        let grandTotalPenduduk = 0;
        let grandTotalLaki = 0;
        let grandTotalPerempuan = 0;
        let grandTotalKK = 0;
        let grandTotalWajibKtp = 0;
        let grandTotalRekamKtp = 0;
        let grandTotalIakd = 0;
        let grandTotalKia = 0;

        rawRows.forEach((row, idx) => {
            let kecamatanName = '';
            let rowData = {
                TOTAL_PENDUDUK: 0,
                LAKI_LAKI: 0,
                PEREMPUAN: 0,
                KEPALA_KELUARGA: 0,
                WAJIB_KTP: 0,
                REKAM_KTP: 0,
                IAKD: 0,
                KIA: 0
            };

            Object.entries(row).forEach(([rawCol, cellVal]) => {
                const stdKey = headerMap[rawCol];
                if (!stdKey) return;

                if (stdKey === 'KECAMATAN') {
                    const strVal = String(cellVal).trim();
                    if (strVal && !/total|jumlah/i.test(strVal)) {
                        kecamatanName = strVal.toUpperCase().replace(/^KECAMATAN\s+/i, '');
                    }
                } else {
                    rowData[stdKey] = this.parseNumber(cellVal);
                }
            });

            if (kecamatanName) {
                const totalL = rowData.LAKI_LAKI;
                const totalP = rowData.PEREMPUAN;
                const calculatedTotal = (totalL > 0 || totalP > 0) ? (totalL + totalP) : rowData.TOTAL_PENDUDUK;

                kecamatanList.push({
                    id: idx + 1,
                    nama: kecamatanName,
                    totalPenduduk: calculatedTotal,
                    lakiLaki: totalL,
                    perempuan: totalP,
                    kepalaKeluarga: rowData.KEPALA_KELUARGA,
                    wajibKtp: rowData.WAJIB_KTP,
                    rekamKtp: rowData.REKAM_KTP,
                    iakd: rowData.IAKD,
                    kia: rowData.KIA
                });

                grandTotalPenduduk += calculatedTotal;
                grandTotalLaki += totalL;
                grandTotalPerempuan += totalP;
                grandTotalKK += rowData.KEPALA_KELUARGA;
                grandTotalWajibKtp += rowData.WAJIB_KTP;
                grandTotalRekamKtp += rowData.REKAM_KTP;
                grandTotalIakd += rowData.IAKD;
                grandTotalKia += rowData.KIA;
            }
        });

        return {
            metadata: {
                id: `ds_${options.year || 2025}_sem${options.semester || 1}_${Date.now()}`,
                year: options.year || 2025,
                semester: options.semester || 1,
                filename: options.filename || 'dataset.xlsx',
                uploadedAt: new Date().toISOString(),
                status: 'active',
                rowCount: kecamatanList.length,
                mappingVersion: 'v2.0'
            },
            summary: {
                totalPenduduk: grandTotalPenduduk,
                lakiLaki: grandTotalLaki,
                perempuan: grandTotalPerempuan,
                kepalaKeluarga: grandTotalKK,
                wajibKtp: grandTotalWajibKtp,
                rekamKtp: grandTotalRekamKtp,
                iakd: grandTotalIakd,
                kia: grandTotalKia
            },
            kecamatanData: kecamatanList
        };
    }
}
