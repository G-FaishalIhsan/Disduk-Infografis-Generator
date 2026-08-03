const http = require('http');

const payload = JSON.stringify({
    htmlSlides: [
        '<html><body><h1>Slide 1 Test</h1></body></html>',
        '<html><body><h1>Slide 2 Test</h1></body></html>'
    ],
    filename: 'Test.pdf'
});

const req = http.request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/export/social/pdf',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
    }
}, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log(`Headers:`, res.headers);
    let data = [];
    res.on('data', chunk => data.push(chunk));
    res.on('end', () => {
        const buffer = Buffer.concat(data);
        console.log(`Received PDF buffer size: ${buffer.length} bytes`);
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});

req.write(payload);
req.end();
