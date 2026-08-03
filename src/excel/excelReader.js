/**
 * Excel Reader Engine (Phase 7.5 Hardening — Dataset Validation)
 * Handles file format validation (.xlsx), binary workbook parsing via SheetJS (XLSX),
 * sheet detection, strict dataset header validation, and passes raw rows to ExcelNormalizer.
 */
import { ExcelNormalizer } from './excelNormalizer.js';

export class ExcelReader {
    /**
     * Validates if the file has a valid .xlsx extension.
     * @param {File} file 
     * @throws {Error} Clear user-facing error message if invalid
     */
    static validateFile(file) {
        if (!file) {
            throw new Error('Pilih file dataset terlebih dahulu.');
        }

        const fileName = file.name.toLowerCase();
        const validExtension = fileName.endsWith('.xlsx');

        if (!validExtension) {
            let extensionType = fileName.split('.').pop().toUpperCase();
            throw new Error(`Format file .${extensionType} tidak didukung. Harap upload file spreadsheet Excel berformat (.xlsx).`);
        }

        return true;
    }

    /**
     * Requirement D: Strict Dataset Content & Header Validation
     * @param {Array<Object>} rawRows 
     * @param {Object} metadata 
     */
    static validateDatasetContent(rawRows, metadata = {}) {
        if (!metadata.year || isNaN(Number(metadata.year))) {
            throw new Error('Validasi Dataset Gagal: Tahun dataset wajib ditentukan.');
        }
        if (!metadata.semester || isNaN(Number(metadata.semester))) {
            throw new Error('Validasi Dataset Gagal: Semester dataset wajib ditentukan.');
        }
        if (!Array.isArray(rawRows) || rawRows.length === 0) {
            throw new Error('Validasi Dataset Gagal: Sheet data kosong atau tidak memiliki baris data.');
        }

        // Validate mandatory header presence in raw rows
        const sampleRow = rawRows[0] || {};
        const keys = Object.keys(sampleRow).map(k => String(k).toUpperCase());
        const hasRegionHeader = keys.some(k => k.includes('KECAMATAN') || k.includes('WILAYAH') || k.includes('NAMA'));
        
        if (!hasRegionHeader && rawRows.length < 2) {
            throw new Error('Validasi Dataset Gagal: Header wajib (Kecamatan/Wilayah) tidak ditemukan dalam sheet Excel.');
        }

        return true;
    }

    /**
     * Reads a File object (.xlsx), parses workbook sheets, and returns normalized JSON.
     * @param {File} file 
     * @param {Object} metadata - { year: 2025, semester: 1 }
     * @returns {Promise<Object>} Standardized JSON payload
     */
    static async readExcelFile(file, metadata = {}) {
        this.validateFile(file);

        if (typeof window.XLSX === 'undefined') {
            throw new Error('Library SheetJS (XLSX) belum dimuat. Pastikan CDN XLSX tersedia.');
        }

        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = window.XLSX.read(data, { type: 'array' });

                    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
                        throw new Error('Validasi Dataset Gagal: File Excel tidak memiliki sheet yang dapat dibaca.');
                    }

                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const rawRows = window.XLSX.utils.sheet_to_json(worksheet, { defval: '' });

                    // Execute strict dataset validation (Requirement D)
                    this.validateDatasetContent(rawRows, metadata);

                    const normalizedResult = ExcelNormalizer.normalizeRows(rawRows, {
                        year: metadata.year || 2025,
                        semester: metadata.semester || 1,
                        filename: file.name
                    });

                    normalizedResult.metadata.sheetNames = workbook.SheetNames;
                    normalizedResult.metadata.activeSheet = firstSheetName;
                    normalizedResult.metadata.fileSize = file.size;

                    resolve(normalizedResult);
                } catch (err) {
                    reject(err);
                }
            };

            reader.onerror = () => {
                reject(new Error('Gagal membaca file dari penyimpanan lokal.'));
            };

            reader.readAsArrayBuffer(file);
        });
    }
}
