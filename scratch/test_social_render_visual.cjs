const http = require('http');
const fs = require('fs');
const path = require('path');

const slide2Html = fs.readFileSync(path.join(__dirname, '../templates/social/template-1/slide2.html'), 'utf-8');

const payload = {
    html: slide2Html,
    filename: 'fixed_social_slide2.png',
    options: {
        width: 1080,
        height: 1350,
        theme: 'light',
        templatePath: 'templates/social/template-1'
    }
};

const postData = JSON.stringify(payload);

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/export/social/png',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

console.log('Sending request to http://localhost:3000/api/export/social/png...');
const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);

    const chunks = [];
    res.on('data', (chunk) => chunks.push(chunk));
    res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const artifactDir = 'C:\\Users\\ACER\\.gemini\\antigravity\\brain\\f49e0bdd-452a-4a9a-86d3-66683aeecebb';
        const outputPath = path.join(artifactDir, 'fixed_social_slide2.png');
        fs.writeFileSync(outputPath, buffer);
        console.log(`SUCCESS! Saved exported slide 2 image (${buffer.length} bytes) to: ${outputPath}`);
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});

req.write(postData);
req.end();
