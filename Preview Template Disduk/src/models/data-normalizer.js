/**
 * Data Normalizer Module
 * Transforms raw parsed data into standard PopulationSchema with Indonesian formatting.
 */
import { createEmptyPopulationData } from './population-schema.js';

export function formatIndonesianNumber(val, decimals = 0) {
    if (val === null || val === undefined || isNaN(val)) return '0';
    const num = Number(val);
    return new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(num);
}

export function parseIndonesianNumber(str) {
    if (!str) return 0;
    if (typeof str === 'number') return str;
    // Strip dots used as thousand separators, replace comma with dot
    const cleanStr = String(str).replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, '');
    const val = parseFloat(cleanStr);
    return isNaN(val) ? 0 : val;
}

export function normalizePopulationData(rawData = {}) {
    const base = createEmptyPopulationData(rawData);

    // Ensure total population & gender ratios
    const laki = parseIndonesianNumber(base.penduduk.laki_laki);
    const perempuan = parseIndonesianNumber(base.penduduk.perempuan);
    const totalPenduduk = parseIndonesianNumber(base.penduduk.total) || (laki + perempuan);

    if (totalPenduduk > 0) {
        base.penduduk.total = totalPenduduk;
        base.penduduk.laki_laki = laki;
        base.penduduk.perempuan = perempuan;
        base.penduduk.laki_laki_pct = Number(((laki / totalPenduduk) * 100).toFixed(2));
        base.penduduk.perempuan_pct = Number(((perempuan / totalPenduduk) * 100).toFixed(2));
        base.penduduk.sex_ratio = perempuan > 0 ? Number(((laki / perempuan) * 100).toFixed(2)) : 100;
    }

    // Helper to calculate percentages for group fields
    const normalizeGroup = (groupObj, grandTotal) => {
        if (!groupObj) return;
        Object.keys(groupObj).forEach(key => {
            const item = groupObj[key];
            if (item && typeof item === 'object') {
                const count = parseIndonesianNumber(item.count);
                item.count = count;
                if (grandTotal > 0 && item.pct === undefined) {
                    item.pct = Number(((count / grandTotal) * 100).toFixed(2));
                }
            }
        });
    };

    normalizeGroup(base.umur, totalPenduduk);
    normalizeGroup(base.pendidikan, totalPenduduk);
    normalizeGroup(base.agama, totalPenduduk);
    normalizeGroup(base.perkawinan, totalPenduduk);

    // Calculate Dependency Ratio: ((muda + tua) / produktif) * 100
    const mudaCount = base.umur.muda.count || 0;
    const tuaCount = base.umur.tua.count || 0;
    const prodCount = base.umur.produktif.count || 1;
    base.umur.dependency_ratio = Number((((mudaCount + tuaCount) / prodCount) * 100).toFixed(2));

    // Ensure vitalitas fields are parsed numbers and calculate migrasi netto
    base.vitalitas.kelahiran = parseIndonesianNumber(base.vitalitas.kelahiran);
    base.vitalitas.kematian = parseIndonesianNumber(base.vitalitas.kematian);
    base.vitalitas.migrasi_masuk = parseIndonesianNumber(base.vitalitas.migrasi_masuk);
    base.vitalitas.migrasi_keluar = parseIndonesianNumber(base.vitalitas.migrasi_keluar);
    if (base.vitalitas.migrasi_netto === undefined) {
        base.vitalitas.migrasi_netto = base.vitalitas.migrasi_masuk - base.vitalitas.migrasi_keluar;
    }

    // Default fallback for persebaran if not present
    if (!base.persebaran) {
        base.persebaran = {
            terbanyak: { nama: 'Singaparna', jiwa: 78613 },
            terkecil: { nama: 'Karangjaya', jiwa: 12450 }
        };
    }

    // Ensure dokumen percentages are calculated
    if (base.dokumen) {
        Object.keys(base.dokumen).forEach(key => {
            const item = base.dokumen[key];
            if (item && typeof item === 'object') {
                item.count = parseIndonesianNumber(item.count);
                item.target = parseIndonesianNumber(item.target) || totalPenduduk;
                if (item.pct === undefined && item.target > 0) {
                    item.pct = Number(((item.count / item.target) * 100).toFixed(2));
                }
            }
        });
    }

    // Formatted strings helper dictionary for convenient binding
    base.formatted = {
        total_penduduk: formatIndonesianNumber(base.penduduk.total),
        laki_laki: formatIndonesianNumber(base.penduduk.laki_laki),
        perempuan: formatIndonesianNumber(base.penduduk.perempuan),
        laki_laki_pct: formatIndonesianNumber(base.penduduk.laki_laki_pct, 2) + '%',
        perempuan_pct: formatIndonesianNumber(base.penduduk.perempuan_pct, 2) + '%',
        sex_ratio: formatIndonesianNumber(base.penduduk.sex_ratio, 2),
        luas_wilayah: formatIndonesianNumber(base.wilayah.luas_wilayah_km2, 2),
        kepadatan_penduduk: formatIndonesianNumber(base.wilayah.kepadatan_penduduk),
        kepadatan: formatIndonesianNumber(base.wilayah.kepadatan_penduduk),
        jumlah_kk: formatIndonesianNumber(base.wilayah.jumlah_kk),
        jumlah_desa: formatIndonesianNumber(base.wilayah.jumlah_desa),
        jumlah_kecamatan: formatIndonesianNumber(base.wilayah.jumlah_kecamatan),
        dependency_ratio: formatIndonesianNumber(base.umur.dependency_ratio, 2) + '%'
    };

    return base;
}
