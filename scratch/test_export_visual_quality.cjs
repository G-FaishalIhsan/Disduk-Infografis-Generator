const http = require('http');
const fs = require('fs');
const path = require('path');

const slide1Html = fs.readFileSync(path.join(__dirname, '../templates/social/template-1/slide1.html'), 'utf-8');
const slide2Html = fs.readFileSync(path.join(__dirname, '../templates/social/template-1/slide2.html'), 'utf-8');

const payload = {
    htmlSlides: [slide1Html, slide2Html],
    filename: 'CAROUSEL_TEST_PDF.pdf',
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
    path: '/api/export/social/pdf',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

console.log('Sending request to http://localhost:3000/api/export/social/pdf...');
const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);

    const chunks = [];
    res.on('data', (chunk) => chunks.push(chunk));
    res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const outputPath = path.join(__dirname, 'exported_social_test.pdf');
        fs.writeFileSync(outputPath, buffer);
        console.log(`SUCCESS! Saved exported PDF (${buffer.length} bytes) to: ${outputPath}`);
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});

req.write(postData);
req.end();
