/**
 * Column Synonyms Mapping Dictionary (Phase 4 — Excel Engine)
 * Maps raw Excel column header variations to standardized system key names.
 * Ensures robust header detection regardless of spacing, casing, or wording.
 */

export const COLUMN_SYNONYMS = {
    // 1. Region Identifiers
    KECAMATAN: [
        'kecamatan', 'nama kecamatan', 'kec', 'nama_kecamatan', 'district', 'region'
    ],
    DESA: [
        'desa', 'kelurahan', 'nama desa', 'nama kelurahan', 'desa/kelurahan', 'des/kel'
    ],

    // 2. Population & Gender Summaries
    TOTAL_PENDUDUK: [
        'jumlah penduduk', 'total penduduk', 'penduduk', 'jumlah jiwa', 'total jiwa', 
        'total', 'lk + pr', 'lk+pr', 'jumlah (jiwa)', 'total_penduduk'
    ],
    LAKI_LAKI: [
        'laki-laki', 'laki laki', 'laki2', 'lk', 'pria', 'male', 'l', 'jumlah laki-laki'
    ],
    PEREMPUAN: [
        'perempuan', 'pr', 'wanita', 'female', 'p', 'jumlah perempuan'
    ],

    // 3. Family / Household
    KEPALA_KELUARGA: [
        'kepala keluarga', 'kk', 'jumlah kk', 'jumlah kepala keluarga', 'keluarga', 'total kk'
    ],

    // 4. Adminduk Identifiers (KTP, IAKD, KIA)
    WAJIB_KTP: [
        'wajib ktp', 'wajib ktp-el', 'wajib ktpel', 'jumlah wajib ktp', 'wajib_ktp'
    ],
    REKAM_KTP: [
        'rekam ktp', 'perekaman ktp', 'rekam ktp-el', 'rekam_ktp', 'perekaman'
    ],
    IAKD: [
        'iakd', 'ikd', 'digital id', 'identitas kependudukan digital', 'aktivasi ikd'
    ],
    KIA: [
        'kia', 'kartu identitas anak', 'kepemilikan kia', 'jumlah kia'
    ],

    // 5. Vital Records (Akta)
    AKTA_KELAHIRAN: [
        'akta kelahiran', 'akta lahir', 'kelahiran', 'kepemilikan akta lahir'
    ],
    AKTA_KEMATIAN: [
        'akta kematian', 'akta mati', 'kematian'
    ],
    AKTA_PERKAWINAN: [
        'akta perkawinan', 'akta nikah', 'perkawinan'
    ],
    AKTA_PERCERAIAN: [
        'akta perceraian', 'akta cerai', 'perceraian'
    ],

    // 6. Religion Breakdown
    AGAMA_ISLAM: ['islam'],
    AGAMA_KRISTEN: ['kristen', 'protestan'],
    AGAMA_KATHOLIK: ['katholik', 'katolik'],
    AGAMA_HINDU: ['hindu'],
    AGAMA_BUDDHA: ['buddha', 'budha'],
    AGAMA_KHONGHUCU: ['khonghucu', 'konghucu'],
    AGAMA_KEPERCAYAAN: ['kepercayaan', 'kepercayaan terhadap tuhan yme']
};

/**
 * Normalizes a raw string by trimming, lowercasing, and removing special punctuation.
 * @param {string} text 
 * @returns {string}
 */
export function normalizeHeaderString(text) {
    if (!text) return '';
    return String(text)
        .toLowerCase()
        .trim()
        .replace(/[\r\n\t]+/g, ' ')
        .replace(/[^a-z0-9\s+/]/g, '')
        .replace(/\s+/g, ' ');
}

/**
 * Resolves a raw column header to a standardized system key using synonym lookup.
 * @param {string} rawHeader 
 * @returns {string|null} Standardized key name or null if unmapped
 */
export function resolveColumnKey(rawHeader) {
    const cleaned = normalizeHeaderString(rawHeader);
    if (!cleaned) return null;

    for (const [standardKey, synonyms] of Object.entries(COLUMN_SYNONYMS)) {
        if (synonyms.some(syn => cleaned === syn || cleaned.includes(syn))) {
            return standardKey;
        }
    }
    return null;
}
