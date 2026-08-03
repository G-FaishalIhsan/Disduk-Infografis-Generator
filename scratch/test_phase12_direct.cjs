const { DataBinderV2 } = require('../src/engine/data-binder-v2.js');
const { AnalyticsEngine } = require('../src/engine/analytics-engine.js');

console.log('=== DIRECT NODE TEST: DATA BINDER V2 ANALYTICS FORWARDING ===');

// Test 1: Payload with desaList (PdfParser output format)
const testPayloadWithDesa = {
    metadata: { nama_wilayah: 'KECAMATAN SINGAPARNA' },
    desaList: [
        { nama: 'Singaparna', totalPenduduk: 15608, luas: 3.82, kepadatan: 4085 },
        { nama: 'Cikunir', totalPenduduk: 12400, luas: 4.10, kepadatan: 3024 },
        { nama: 'Cikunten', totalPenduduk: 9800, luas: 2.90, kepadatan: 3379 }
    ]
};

const result1 = DataBinderV2.buildTemplateDataObject(testPayloadWithDesa, 'SINGAPARNA');
console.log('Test 1 - Analytics Attached:', !!result1.analytics);
console.log('Test 1 - HasDesaData Flag:', result1.analytics?.hasDesaData);
console.log('Test 1 - Top Desa Penduduk:', result1.analytics?.topDesaPenduduk);

// Test 2: Payload without desaList (Fallback empty analytics)
const result2 = DataBinderV2.buildTemplateDataObject(null, 'CIPATUJAH');
console.log('\nTest 2 - Analytics Attached:', !!result2.analytics);
console.log('Test 2 - HasDesaData Flag:', result2.analytics?.hasDesaData);
console.log('Test 2 - Top Desa Length:', result2.analytics?.topDesaPenduduk?.length);

if (result1.analytics && result1.analytics.hasDesaData === true && result2.analytics && result2.analytics.hasDesaData === false) {
    console.log('\n✅ PHASE 12 DATA BINDER V2 ANALYTICS FORWARDING TEST PASSED 100%!');
} else {
    console.error('\n❌ TEST FAILED!');
}
