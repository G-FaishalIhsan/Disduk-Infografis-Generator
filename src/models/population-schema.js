/**
 * Common Data Model Schema for Generator Infografis Disdukcapil Kabupaten Tasikmalaya
 * Defines the standard dataset contract for both Kabupaten and Kecamatan modes.
 */

export function createEmptyPopulationData(overrides = {}) {
    return {
        metadata: {
            nama_wilayah: 'KABUPATEN TASIKMALAYA',
            jenis_wilayah: 'Kabupaten', // 'Kabupaten' | 'Kecamatan'
            kode_wilayah: '3206',
            tahun: '2025',
            tanggal_cetak: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }),
            is_kabupaten: true,
            ...overrides.metadata
        },
        wilayah: {
            jumlah_kecamatan: 39,
            jumlah_desa: 351,
            luas_wilayah_km2: 2708.84,
            kepadatan_penduduk: 748.51,
            jumlah_kk: 746491,
            jumlah_rw: 2150,
            jumlah_rt: 8420,
            ...overrides.wilayah
        },
        penduduk: {
            total: 2026081,
            laki_laki: 1031275,
            perempuan: 994806,
            laki_laki_pct: 50.9,
            perempuan_pct: 49.1,
            sex_ratio: 103.67,
            ...overrides.penduduk
        },
        vitalitas: {
            kelahiran: 28420,
            kematian: 12210,
            migrasi_masuk: 15350,
            migrasi_keluar: 11840,
            pertumbuhan_netto: 19720,
            migrasi_netto: 3510,
            pertumbuhan_alami: 16210,
            ...overrides.vitalitas
        },
        umur: {
            muda: { count: 486259, pct: 24.0 },       // 0 - 14 tahun
            produktif: { count: 1377735, pct: 68.0 }, // 15 - 64 tahun
            tua: { count: 162087, pct: 8.0 },          // 65+ tahun
            dependency_ratio: 47.06,
            ...overrides.umur
        },
        pendidikan: {
            belum_sekolah: { count: 384955, pct: 19.0 },
            sd: { count: 688867, pct: 34.0 },
            smp: { count: 425477, pct: 21.0 },
            sma: { count: 384955, pct: 19.0 },
            diploma: { count: 60782, pct: 3.0 },
            sarjana: { count: 81045, pct: 4.0 },
            ...overrides.pendidikan
        },
        agama: {
            islam: { count: 2024055, pct: 99.9 },
            kristen: { count: 1215, pct: 0.06 },
            katolik: { count: 607, pct: 0.03 },
            hindu: { count: 101, pct: 0.005 },
            buddha: { count: 81, pct: 0.004 },
            khonghucu: { count: 22, pct: 0.001 },
            ...overrides.agama
        },
        perkawinan: {
            belum_kawin: { count: 850954, pct: 42.0 },
            kawin_catat: { count: 1033301, pct: 51.0 },
            kawin_belum_catat: { count: 40521, pct: 2.0 },
            cerai_hidup: { count: 40521, pct: 2.0 },
            cerai_mati: { count: 60784, pct: 3.0 },
            ...overrides.perkawinan
        },
        dokumen: {
            kk: { count: 737756, target: 746491, pct: 98.83 },
            ktp_el: { count: 1501295, target: 1515705, pct: 99.05 },
            akta_lahir: { count: 534691, target: 539606, pct: 99.09 },
            akta_nikah: { count: 652014, target: 1025987, pct: 63.55 },
            kia: { count: 430820, target: 486259, pct: 88.6 },
            ...overrides.dokumen
        }
    };
}
