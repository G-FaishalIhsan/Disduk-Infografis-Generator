/**
 * Server Main Entry Point
 * Express API Server providing Chromium Puppeteer export endpoints (PNG, JPG, PDF, Social ZIP with SSE Progress)
 * AND serving static project assets + render routes for Puppeteer navigation.
 */

import fs from 'fs';
import JSZip from 'jszip';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { ServerTemplateLoader } from './template-loader.js';
import { ChromiumRenderer } from './renderer.js';
import { SocialChromiumRenderer } from './social-renderer.js';
import { browserManager } from './browser-manager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Serve static project assets so Puppeteer can load them via HTTP
app.use('/img', express.static(path.join(projectRoot, 'img')));
app.use('/assets', express.static(path.join(projectRoot, 'assets')));
app.use('/templates', express.static(path.join(projectRoot, 'templates')));
app.use('/src', express.static(path.join(projectRoot, 'src')));
app.use('/Preview Template Disduk', express.static(path.join(projectRoot, 'Preview Template Disduk')));
app.use('/preview', express.static(path.join(projectRoot, 'Preview Template Disduk')));
app.use(express.static(projectRoot));

const templateLoader = new ServerTemplateLoader(`http://localhost:${PORT}`);
const renderer = new ChromiumRenderer();
const socialRenderer = new SocialChromiumRenderer();

// Pre-warm Chromium Browser Instance on server launch
browserManager.init().catch(err => console.warn('[Server] Browser pre-warm notice:', err.message));

// Health Check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        service: 'Disdukcapil Infographic Chromium Export Engine',
        timestamp: new Date().toISOString()
    });
});

// Render token storage
const pendingRenders = new Map();
const pendingZipDownloads = new Map();

app.get('/render/:token', (req, res) => {
    const html = pendingRenders.get(req.params.token);
    if (!html) {
        return res.status(404).send('Render token expired or invalid');
    }
    pendingRenders.delete(req.params.token);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
});

// Common Full Export Handler (UNCHANGED & STABLE)
async function handleExport(req, res, format) {
    try {
        const { templateId = 'template-1', data, filename } = req.body;

        if (!data) {
            return res.status(400).json({ error: 'Missing population data payload.' });
        }

        const html = templateLoader.loadTemplate(templateId, data);
        const token = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        pendingRenders.set(token, html);

        const renderUrl = `http://localhost:${PORT}/render/${token}`;
        const buffer = await renderer.render(renderUrl, format);

        pendingRenders.delete(token);

        const defaultFilename = `Infografis-Disdukcapil-${data.metadata?.nama_wilayah || 'Tasikmalaya'}-2025.${format}`;
        const outputFilename = filename || defaultFilename;

        const mimeTypes = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', pdf: 'application/pdf' };
        res.setHeader('Content-Type', mimeTypes[format] || 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(outputFilename)}"`);
        res.setHeader('Content-Length', buffer.length);
        return res.send(buffer);
    } catch (err) {
        console.error(`[Export Error ${format.toUpperCase()}]:`, err.message);
        return res.status(500).json({ error: 'Export rendering failed', details: err.message });
    }
}

app.post('/api/export/png', (req, res) => handleExport(req, res, 'png'));
app.post('/api/export/jpg', (req, res) => handleExport(req, res, 'jpg'));
app.post('/api/export/pdf', (req, res) => handleExport(req, res, 'pdf'));

// ===================================================================
// V2 SOCIAL MEDIA EXPORT ENDPOINTS (ISOLATED V2 RENDERER)
// ===================================================================

app.post('/api/export/social/png', async (req, res) => {
    try {
        const { html, filename, options = {} } = req.body;
        if (!html) return res.status(400).json({ error: 'Missing html parameter.' });

        const buffer = await socialRenderer.renderSocialPNG(html, options);
        const outName = filename || `slide_${Date.now()}.png`;

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(outName)}"`);
        res.setHeader('Content-Length', buffer.length);
        return res.send(buffer);
    } catch (err) {
        console.error('[Social PNG Export Error]:', err.message);
        return res.status(500).json({ error: 'Social PNG rendering failed', details: err.message });
    }
});

app.post('/api/export/social/jpg', async (req, res) => {
    try {
        const { html, filename, options = {} } = req.body;
        if (!html) return res.status(400).json({ error: 'Missing html parameter.' });

        const buffer = await socialRenderer.renderSocialJPG(html, options);
        const outName = filename || `slide_${Date.now()}.jpg`;

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', 'image/jpeg');
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(outName)}"`);
        res.setHeader('Content-Length', buffer.length);
        return res.send(buffer);
    } catch (err) {
        console.error('[Social JPG Export Error]:', err.message);
        return res.status(500).json({ error: 'Social JPG rendering failed', details: err.message });
    }
});

app.post('/api/export/social/pdf', async (req, res) => {
    try {
        const { htmlSlides, filename, options = {} } = req.body;
        if (!htmlSlides || !Array.isArray(htmlSlides) || htmlSlides.length === 0) {
            return res.status(400).json({ error: 'Missing or invalid htmlSlides parameter.' });
        }

        const buffer = await socialRenderer.renderSocialPDF(htmlSlides, options);
        const outName = filename || `infografis_social_${Date.now()}.pdf`;

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(outName)}"`);
        res.setHeader('Content-Length', buffer.length);
        return res.send(buffer);
    } catch (err) {
        console.error('[Social PDF Export Error]:', err.message);
        return res.status(500).json({ error: 'Social PDF rendering failed', details: err.message });
    }
});
app.post('/api/export/social-progress', async (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    const sendEvent = (eventData) => {
        res.write(`data: ${JSON.stringify(eventData)}\n\n`);
    };

    try {
        const { templateId = 'template-1-v2', filename = 'infografis_social.zip' } = req.body;
        sendEvent({ status: 'progress', stepText: 'Memulai Social Media Export...', percent: 10 });

        const manifestPath = templateId.includes('template-2') ? 'templates/social/template-2' : 'templates/social/template-1';
        const slideCount = 2;

        const zip = new JSZip();

        for (let i = 1; i <= slideCount; i++) {
            sendEvent({ status: 'progress', stepText: `Merender Slide ${i}/${slideCount}...`, percent: 20 + i * 35 });
            const slidePath = path.join(projectRoot, manifestPath, `slide${i}.html`);
            if (fs.existsSync(slidePath)) {
                let html = fs.readFileSync(slidePath, 'utf8');
                const buffer = await socialRenderer.renderSocialPNG(html, {
                    width: 1080,
                    height: 1350,
                    templatePath: manifestPath
                });
                zip.file(`slide_${i}.png`, buffer);
            }
        }

        sendEvent({ status: 'progress', stepText: 'Mengompresi file ZIP...', percent: 90 });
        const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });

        const token = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        pendingZipDownloads.set(token, { buffer: zipBuffer, filename });

        const downloadUrl = `http://localhost:${PORT}/api/export/download-social-zip/${token}`;
        sendEvent({ status: 'complete', downloadUrl, percent: 100 });
        res.end();
    } catch (err) {
        console.error('[SSE Social Progress Error]:', err.message);
        sendEvent({ status: 'error', error: err.message });
        res.end();
    }
});

app.get('/api/export/download-social-zip/:token', (req, res) => {
    const item = pendingZipDownloads.get(req.params.token);
    if (!item) {
        return res.status(404).send('Download token expired or invalid');
    }
    pendingZipDownloads.delete(req.params.token);
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(item.filename)}"`);
    res.setHeader('Content-Length', item.buffer.length);
    res.send(item.buffer);
});

app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(` Disdukcapil Infographic Export Server Online (port ${PORT})`);
    console.log(` Endpoints:`);
    console.log(`   POST /api/export/png`);
    console.log(`   POST /api/export/jpg`);
    console.log(`   POST /api/export/pdf`);
    console.log(`   POST /api/export/social-progress  <-- Real-time SSE Social Export`);
    console.log(`   GET  /api/export/download-social-zip/:token`);
    console.log(`   GET  /api/health`);
    console.log(`=======================================================`);
});
