(async () => {
    console.log('=== DEBUGGING V2 SOCIAL EXPORT ENGINE ===');

    // 1. Test POST /api/export/social-progress (ZIP export SSE)
    try {
        console.log('Testing /api/export/social-progress...');
        const res = await fetch('http://localhost:3000/api/export/social-progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                templateId: 'template-1-v2',
                data: { metadata: { nama_wilayah: 'KABUPATEN TASIKMALAYA' } },
                platformRatio: 'native',
                filename: 'test_social.zip'
            })
        });

        console.log('social-progress HTTP Status:', res.status);
        const text = await res.text();
        console.log('social-progress response sample:', text.slice(0, 300));
    } catch (err) {
        console.error('social-progress Error:', err.message);
    }

    // 2. Test POST /api/export/social/png
    try {
        console.log('\nTesting /api/export/social/png...');
        const res = await fetch('http://localhost:3000/api/export/social/png', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                html: '<!DOCTYPE html><html><head></head><body><h1>Test Slide</h1></body></html>',
                filename: 'test_slide.png',
                options: {
                    width: 1080,
                    height: 1350,
                    templatePath: 'templates/social/template-1'
                }
            })
        });

        console.log('social/png HTTP Status:', res.status);
        if (!res.ok) {
            const errJson = await res.json();
            console.error('social/png Error Details:', errJson);
        } else {
            const buf = await res.arrayBuffer();
            console.log('social/png Buffer length:', buf.byteLength);
        }
    } catch (err) {
        console.error('social/png Error:', err.message);
    }
})();
