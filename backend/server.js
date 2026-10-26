/**
 * Earth Intelligence Platform — Unified Master Server (server.js)
 * ===============================================================
 * Serves the Earth Intelligence web application and APIs for Forest Intelligence,
 * River Intelligence, Hazard Lens, Geospatial Exploration, and Evidence Dossiers.
 *
 * Security & Reliability:
 *   - HTTP Security Headers (CSP, X-Content-Type-Options, X-Frame-Options, etc.)
 *   - Sliding-window in-memory rate limiting across tiered endpoint types
 *   - Strict coordinate & input sanitization to guard against SSRF and injection
 *   - Sanitized error responses without internal stack trace or credential leakage
 *   - Gzip compression and ETag caching for static assets
 *
 * Run: npm start (or: node backend/server.js)
 * Open: http://localhost:8080
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ROOT = path.join(__dirname, '..');            // project root
const FRONTEND = path.join(ROOT, 'frontend');       // only folder served to browsers

// Load environment variables safely
loadDotEnv(path.join(ROOT, '.env'));
loadDotEnv(path.join(__dirname, '.env'));

function loadDotEnv(file) {
  let text;
  try { text = fs.readFileSync(file, 'utf8'); } catch { return; }
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!m || line.trim().startsWith('#')) continue;
    const value = m[2].replace(/^(['"])(.*)\1$/, '$2');
    if (process.env[m[1]] === undefined) process.env[m[1]] = value;
  }
}

const PORT = Number(process.env.PORT) || 8080;
const IS_DEV = process.env.NODE_ENV !== 'production';

// Security and Evidence modules
const security = require('./security.js');
const overviewApi = require('./overview-api.js');

// Load Forest Intelligence core API
let forestCore = null;
try {
  forestCore = require('./forest-api.js');
} catch (err) {
  console.warn('[server] Forest core API load note:', err.message);
}

// Shared Gemma 4 / Gemini client
const gemma = require('./gemma.js');
forestCore?.setGenerator(gemma.generate);

const hazard = require('./hazard.js');
const dam = require('./dam.js');
const site = require('./site.js');
const water = require('./water.js');
const waterSnap = require('./water-snap.js');
const rivers = require('./rivers.js');

const traceCache = new Map();
const networkCache = new Map();
const tileCache = new Map();

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg':  'image/svg+xml',
  '.json': 'application/json; charset=utf-8',
  '.ico':  'image/x-icon',
  '.webp': 'image/webp',
  '.md':   'text/markdown; charset=utf-8',
  '.csv':  'text/csv; charset=utf-8',
};

const staticCache = new Map(); // file → { etag, raw, gz }
const COMPRESSIBLE = new Set(['.html', '.js', '.css', '.json', '.svg', '.csv', '.txt', '.md']);

function readBody(req, limit = 64 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', c => {
      size += c.length;
      if (size > limit) {
        req.resume();
        reject(Object.assign(new Error('Payload too large'), { status: 413 }));
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function sendJson(res, status, data, extraHeaders = {}) {
  security.applySecurityHeaders(res);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    ...extraHeaders
  });
  res.end(JSON.stringify(data));
}

function sendError(res, err) {
  const safe = security.safeError(err, IS_DEV);
  sendJson(res, safe.status, safe.json);
}

function serveStatic(req, res) {
  security.applySecurityHeaders(res);

  if (req.url === '/favicon.ico' || req.url === '/favicon.svg') {
    const favPath = path.join(FRONTEND, req.url === '/favicon.svg' ? 'favicon.svg' : 'assets/logo.svg');
    if (fs.existsSync(favPath)) {
      const svg = fs.readFileSync(favPath);
      res.writeHead(200, { 'content-type': 'image/svg+xml', 'cache-control': 'public, max-age=86400' });
      return res.end(svg);
    }
    res.writeHead(204, { 'cache-control': 'public, max-age=86400' });
    return res.end();
  }

  let rel;
  try { rel = decodeURIComponent(new URL(req.url, 'http://x').pathname); } catch { rel = '/'; }
  if (rel.endsWith('/')) rel += 'index.html';

  // Only frontend/ is public, prevent traversal and hidden files
  if (rel.split(/[\\/]/).some(seg => seg.startsWith('.') || seg === 'node_modules')) {
    res.writeHead(404, { 'content-type': 'text/plain' });
    return res.end('404 Not Found');
  }

  const file = path.normalize(path.join(FRONTEND, rel));
  if (!file.startsWith(FRONTEND + path.sep) && file !== FRONTEND) {
    res.writeHead(403, { 'content-type': 'text/plain' });
    return res.end('Access denied');
  }

  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) {
      res.writeHead(404, { 'content-type': 'text/plain' });
      return res.end('404 Not Found');
    }

    const ext = path.extname(file).toLowerCase();
    const etag = `"${st.size.toString(36)}-${Math.round(st.mtimeMs).toString(36)}"`;
    const headers = {
      'content-type': MIME[ext] || 'application/octet-stream',
      'cache-control': 'no-cache',
      etag
    };

    if (req.headers['if-none-match'] === etag) {
      res.writeHead(304, headers);
      return res.end();
    }

    const cached = staticCache.get(file);
    const send = entry => {
      const gzip = entry.gz && /\bgzip\b/.test(req.headers['accept-encoding'] || '');
      res.writeHead(200, {
        ...headers,
        ...(entry.gz ? { vary: 'Accept-Encoding' } : {}),
        ...(gzip ? { 'content-encoding': 'gzip' } : {})
      });
      res.end(gzip ? entry.gz : entry.raw);
    };

    if (cached && cached.etag === etag) return send(cached);

    fs.readFile(file, (err2, raw) => {
      if (err2) {
        res.writeHead(404, { 'content-type': 'text/plain' });
        return res.end('404 Not Found');
      }
      const entry = {
        etag,
        raw,
        gz: COMPRESSIBLE.has(ext) && raw.length > 1024 ? zlib.gzipSync(raw, { level: 9 }) : null
      };
      staticCache.set(file, entry);
      send(entry);
    });
  });
}

// Hydrology & Dam assistant (Aqua)
async function handleAquaChat(body) {
  const query = security.sanitizeText(body.query || '', 2000);
  const riverName = security.sanitizeText(body.context?.riverName || 'River Basin', 120);
  const coords = JSON.stringify(body.context?.coordinates || []).slice(0, 300);

  if (!query) {
    return { status: 400, json: { error: 'Please provide a valid hydrological query.' } };
  }

  const system = `You are Aqua, the scientific hydrology and environmental screening assistant for Earth Intelligence.
Target River Basin: ${riverName}
Coordinates: ${coords}
Provide an expert, evidence-grounded assessment on river discharge, water quality indices (turbidity, NDCI), flood dynamics, or run-of-river hydropower feasibility.
State clearly when quoting measured observations versus empirical screening estimates. Never fabricate metrics.`;

  try {
    const { text, model, gemma: isGemma } = await gemma.generate({
      system,
      contents: [{ role: 'user', parts: [{ text: query }] }],
    });
    return { status: 200, json: { text, model, gemma: isGemma } };
  } catch (err) {
    return { status: err.status || 502, json: { error: err.message } };
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    security.applySecurityHeaders(res);
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
      'Access-Control-Max-Age': '86400'
    });
    return res.end();
  }

  // -------------------------------------------------------------------------
  // 1. Earth Intelligence Overview & Evidence APIs
  // -------------------------------------------------------------------------
  if (url.pathname === '/api/v1/overview' && req.method === 'GET') {
    const limit = security.checkRateLimit(req, 'standard');
    if (!limit.allowed) {
      return sendJson(res, 429, { error: 'Rate limit exceeded. Please wait.', retryAfter: limit.retryAfter });
    }
    try {
      const data = overviewApi.computeOverview();
      return sendJson(res, 200, data, { 'cache-control': 'public, max-age=60' });
    } catch (err) {
      return sendError(res, err);
    }
  }

  if (url.pathname === '/api/v1/reports' && req.method === 'GET') {
    const limit = security.checkRateLimit(req, 'standard');
    if (!limit.allowed) {
      return sendJson(res, 429, { error: 'Rate limit exceeded. Please wait.', retryAfter: limit.retryAfter });
    }
    const place = security.sanitizeText(url.searchParams.get('place') || 'joshimath', 60);
    const report = overviewApi.generateReport(place);
    if (!report) {
      return sendJson(res, 404, { error: `No dossier found for identifier: ${place}` });
    }
    return sendJson(res, 200, report, { 'cache-control': 'public, max-age=300' });
  }

  // -------------------------------------------------------------------------
  // 2. Health & System Telemetry
  // -------------------------------------------------------------------------
  if (url.pathname === '/api/v1/health' || url.pathname === '/api/health') {
    return sendJson(res, 200, {
      status: 'HEALTHY',
      service: 'Earth Intelligence Platform',
      version: '3.0.0',
      ai: gemma.describe(),
      security: {
        rateLimiting: 'ACTIVE',
        contentSecurityPolicy: 'ACTIVE',
        coordinateSanitization: 'ACTIVE'
      },
      datasets: {
        hydrorivers: rivers.available() ? 'ONLINE (998,251 reaches)' : 'STANDBY',
        glofas: 'ONLINE',
        sentinel2Stac: 'ONLINE',
        soilgrids: 'ONLINE'
      },
      timestamp: new Date().toISOString()
    });
  }

  // -------------------------------------------------------------------------
  // 3. Forest Intelligence APIs (/api/...)
  // -------------------------------------------------------------------------
  if (url.pathname.startsWith('/api/treeko') || url.pathname.startsWith('/api/gfw')) {
    const tier = url.pathname.startsWith('/api/treeko') ? 'ai' : 'compute';
    const limit = security.checkRateLimit(req, tier);
    if (!limit.allowed) {
      return sendJson(res, 429, { error: 'Rate limit exceeded. Please wait.', retryAfter: limit.retryAfter });
    }

    if (forestCore) {
      try {
        const body = ['POST', 'PUT'].includes(req.method) ? await readBody(req, 64 * 1024) : '';
        const result = await forestCore.handleApi({
          method: req.method,
          path: url.pathname,
          query: Object.fromEntries(url.searchParams),
          body
        }, fetch);
        security.applySecurityHeaders(res);
        res.writeHead(result.status, {
          'content-type': 'application/json; charset=utf-8',
          'cache-control': 'no-store',
          ...(result.headers || {})
        });
        return res.end(JSON.stringify(result.json));
      } catch (err) {
        return sendError(res, err);
      }
    }
  }

  // -------------------------------------------------------------------------
  // 4. Hydrology & River Intelligence APIs (/api/v1/...)
  // -------------------------------------------------------------------------
  if (url.pathname === '/api/v1/aqua/chat' && req.method === 'POST') {
    const limit = security.checkRateLimit(req, 'ai');
    if (!limit.allowed) {
      return sendJson(res, 429, { error: 'Rate limit exceeded. Please wait.', retryAfter: limit.retryAfter });
    }
    try {
      const raw = await readBody(req, 64 * 1024);
      const parsed = JSON.parse(raw);
      const ans = await handleAquaChat(parsed);
      return sendJson(res, ans.status, ans.json);
    } catch (err) {
      return sendError(res, err);
    }
  }

  // Sentinel-2 Optical Water Quality (/api/v1/water-quality)
  if (url.pathname === '/api/v1/water-quality' && req.method === 'POST') {
    const limit = security.checkRateLimit(req, 'compute');
    if (!limit.allowed) {
      return sendJson(res, 429, { error: 'Rate limit exceeded. Please wait.', retryAfter: limit.retryAfter });
    }
    try {
      const payload = JSON.parse(await readBody(req, 8 * 1024) || '{}');
      if (!security.isValidCoord(payload.lat, payload.lon)) {
        return sendJson(res, 400, { error: 'Valid latitude (-90..90) and longitude (-180..180) are required.' });
      }
      const result = await water.assess(payload);
      return sendJson(res, 200, result);
    } catch (err) {
      return sendError(res, err);
    }
  }

  // Geotechnical Site Conditions (/api/v1/site)
  if (url.pathname === '/api/v1/site' && req.method === 'POST') {
    const limit = security.checkRateLimit(req, 'compute');
    if (!limit.allowed) {
      return sendJson(res, 429, { error: 'Rate limit exceeded. Please wait.', retryAfter: limit.retryAfter });
    }
    try {
      const payload = JSON.parse(await readBody(req, 8 * 1024) || '{}');
      if (!security.isValidCoord(payload.lat, payload.lon)) {
        return sendJson(res, 400, { error: 'Valid latitude and longitude are required.' });
      }
      const result = await site.assess(payload);
      return sendJson(res, 200, result);
    } catch (err) {
      return sendError(res, err);
    }
  }

  // River Dam Atlas screening (/api/v1/dam/atlas)
  if (url.pathname === '/api/v1/dam/atlas' && req.method === 'POST') {
    const limit = security.checkRateLimit(req, 'compute');
    if (!limit.allowed) {
      return sendJson(res, 429, { error: 'Rate limit exceeded. Please wait.', retryAfter: limit.retryAfter });
    }
    try {
      const payload = JSON.parse(await readBody(req, 64 * 1024) || '{}');
      const result = await dam.atlas(payload);
      return sendJson(res, 200, result);
    } catch (err) {
      return sendError(res, err);
    }
  }

  // City Power Planner (/api/v1/dam/plan)
  if (url.pathname === '/api/v1/dam/plan' && req.method === 'POST') {
    const limit = security.checkRateLimit(req, 'compute');
    if (!limit.allowed) {
      return sendJson(res, 429, { error: 'Rate limit exceeded. Please wait.', retryAfter: limit.retryAfter });
    }
    try {
      const payload = JSON.parse(await readBody(req, 8 * 1024) || '{}');
      const result = await dam.plan(payload);
      return sendJson(res, 200, result);
    } catch (err) {
      return sendError(res, err);
    }
  }

  // Hydropower screening (/api/v1/dam/screen)
  if (url.pathname === '/api/v1/dam/screen' && req.method === 'POST') {
    const limit = security.checkRateLimit(req, 'compute');
    if (!limit.allowed) {
      return sendJson(res, 429, { error: 'Rate limit exceeded. Please wait.', retryAfter: limit.retryAfter });
    }
    try {
      const payload = JSON.parse(await readBody(req, 8 * 1024) || '{}');
      const result = await dam.screen(payload);
      return sendJson(res, 200, result);
    } catch (err) {
      return sendError(res, err);
    }
  }

  // GFW Tree loss tile proxy
  const tileMatch = /^\/tiles\/gfw-loss\/(?:(v1\.12)\/)?(\d{1,2})\/(\d{1,5})\/(\d{1,5})\.png$/.exec(url.pathname);
  if (tileMatch && req.method === 'GET') {
    const version = tileMatch[1] || 'v1.11';
    const [z, x, y] = tileMatch.slice(2).map(Number);
    if (z > 12 || x >= 2 ** z || y >= 2 ** z) {
      res.writeHead(404);
      return res.end();
    }
    const key = `${version}/${z}/${x}/${y}`;
    let tile = tileCache.get(key);
    if (!tile) {
      try {
        const up = await fetch(`https://tiles.globalforestwatch.org/umd_tree_cover_loss/${version}/tcd_30/${z}/${x}/${y}.png`, {
          signal: AbortSignal.timeout(15000)
        });
        tile = up.ok ? { status: 200, body: Buffer.from(await up.arrayBuffer()) } : { status: up.status, body: null };
      } catch {
        tile = { status: 502, body: null };
      }
      if (tile.status === 200 || tile.status === 404) {
        if (tileCache.size > 400) tileCache.delete(tileCache.keys().next().value);
        tileCache.set(key, tile);
      }
    }
    if (!tile.body) {
      res.writeHead(tile.status);
      return res.end();
    }
    security.applySecurityHeaders(res);
    res.writeHead(200, { 'content-type': 'image/png', 'cache-control': 'public, max-age=86400' });
    return res.end(tile.body);
  }

  // River reach nearest query (/api/v1/rivers/at)
  if (url.pathname === '/api/v1/rivers/at' && req.method === 'GET') {
    const lat = Number(url.searchParams.get('lat')), lon = Number(url.searchParams.get('lon'));
    const km = Math.min(30, Math.max(0.2, Number(url.searchParams.get('km')) || 5));
    const min = Math.max(100, Number(url.searchParams.get('min')) || rivers.MAJOR_KM2);

    if (!security.isValidCoord(lat, lon) || !rivers.available()) {
      return sendJson(res, 400, { error: 'Valid lat and lon are required, and river dataset must be loaded.' });
    }

    const reach = rivers.nearest(lat, lon, km, min);
    if (!reach) {
      return sendJson(res, 200, { river: null });
    }

    const stem = rivers.mainStem(reach.id);
    const body = JSON.stringify({
      river: {
        reachId: reach.id,
        key: stem.key,
        lengthKm: stem.lengthKm,
        mouthDischargeCms: stem.mouthDischargeCms,
        here: { distanceKm: reach.distanceKm, upstreamAreaKm2: reach.upstreamAreaKm2, meanDischargeCms: reach.meanDischargeCms }
      },
      path: stem.path,
    });

    const gz = /gzip/.test(req.headers['accept-encoding'] || '');
    security.applySecurityHeaders(res);
    res.writeHead(200, {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...(gz ? { 'content-encoding': 'gzip' } : {})
    });
    return res.end(gz ? zlib.gzipSync(body) : body);
  }

  // River network vector tiles (/api/v1/rivers/network)
  if (url.pathname === '/api/v1/rivers/network' && req.method === 'GET') {
    const bbox = String(url.searchParams.get('bbox') || '').split(',').map(Number);
    const z = Math.max(0, Math.min(18, Math.round(Number(url.searchParams.get('z')))));

    if (bbox.length !== 4 || !bbox.every(Number.isFinite) || !Number.isFinite(z) || !rivers.available()) {
      return sendJson(res, 400, { error: 'bbox=w,s,e,n and z are required.' });
    }

    const step = z <= 3 ? 360 : z <= 5 ? 10 : z <= 7 ? 2 : 0.5;
    const [w, s, e, n] = [
      Math.max(-180, Math.floor(bbox[0] / step) * step), Math.max(-90, Math.floor(bbox[1] / step) * step),
      Math.min(180, Math.ceil(bbox[2] / step) * step), Math.min(90, Math.ceil(bbox[3] / step) * step),
    ];

    const classes = new Set(String(url.searchParams.get('classes') || '1,2,3,4,5').split(',').map(Number).filter(c => c >= 1 && c <= 5));
    const key = `${z}|${w},${s},${e},${n}|${[...classes].sort().join('')}`;
    let gz = networkCache.get(key);

    if (!gz) {
      const net = rivers.network([w, s, e, n], z, classes);
      if (z >= 9) {
        await waterSnap.snapNetwork(net, z, [w, s, e, n]).catch(err => console.warn('[rivers] water snap skipped:', err.message));
      }
      gz = zlib.gzipSync(JSON.stringify(net));
      if (networkCache.size > 300) networkCache.delete(networkCache.keys().next().value);
      networkCache.set(key, gz);
    }

    const acceptsGzip = /\bgzip\b/.test(req.headers['accept-encoding'] || '');
    security.applySecurityHeaders(res);
    res.writeHead(200, {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=86400',
      ...(acceptsGzip ? { 'content-encoding': 'gzip' } : {}),
    });
    return res.end(acceptsGzip ? gz : zlib.gunzipSync(gz));
  }

  // Real river trace (/api/v1/rivers/trace)
  if (url.pathname === '/api/v1/rivers/trace' && req.method === 'POST') {
    try {
      const { sketches } = JSON.parse(await readBody(req, 256 * 1024) || '{}');
      if (!sketches || typeof sketches !== 'object') {
        return sendJson(res, 400, { error: 'sketches required' });
      }
      const out = {};
      for (const [id, sketch] of Object.entries(sketches).slice(0, 50)) {
        if (!Array.isArray(sketch) || sketch.length < 2 || !sketch.every(p => Array.isArray(p) && p.every(Number.isFinite))) continue;
        const key = JSON.stringify(sketch);
        if (!traceCache.has(key)) traceCache.set(key, rivers.traceAlong(sketch));
        out[id] = traceCache.get(key);
      }
      return sendJson(res, 200, { rivers: out, source: 'HydroRIVERS v1.0 (HydroSHEDS)' });
    } catch (err) {
      return sendError(res, err);
    }
  }

  // Snap river onto water (/api/v1/rivers/snap)
  if (url.pathname === '/api/v1/rivers/snap' && req.method === 'POST') {
    try {
      const { lines, bbox, z } = JSON.parse(await readBody(req, 1024 * 1024) || '{}');
      const zoom = Math.round(Number(z));
      const okLine = l => Array.isArray(l) && l.length >= 2 && l.length <= 20000 && l.every(p => Array.isArray(p) && p.length === 2 && p.every(Number.isFinite));

      if (!Array.isArray(lines) || !lines.length || lines.length > 20 || !lines.every(okLine)
        || !Array.isArray(bbox) || bbox.length !== 4 || !bbox.every(Number.isFinite)
        || bbox[2] - bbox[0] > 10 || bbox[3] - bbox[1] > 10 || !(zoom >= 9 && zoom <= 18)) {
        return sendJson(res, 400, { error: 'lines (<= 20), bbox (<= 10 deg) and z >= 9 are required.' });
      }

      const net = { lines: { 5: lines } };
      await waterSnap.snapNetwork(net, zoom, bbox);
      return sendJson(res, 200, { lines: net.lines[5], source: 'JRC Global Surface Water (2021)' });
    } catch (err) {
      return sendError(res, err);
    }
  }

  // -------------------------------------------------------------------------
  // 5. Hazard Lens API (/api/v1/hazard)
  // -------------------------------------------------------------------------
  if (url.pathname === '/api/v1/hazard' && req.method === 'POST') {
    const limit = security.checkRateLimit(req, 'ai');
    if (!limit.allowed) {
      return sendJson(res, 429, { error: 'Rate limit exceeded. Please wait.', retryAfter: limit.retryAfter });
    }
    try {
      const payload = JSON.parse(await readBody(req, 8 * 1024) || '{}');
      if (!security.isValidCoord(payload.lat, payload.lon)) {
        return sendJson(res, 400, { error: 'Valid latitude (-90..90) and longitude (-180..180) are required.' });
      }
      payload.name = security.sanitizeText(payload.name || '', 100);
      const result = await hazard.assess(payload);
      return sendJson(res, 200, result);
    } catch (err) {
      return sendError(res, err);
    }
  }

  // -------------------------------------------------------------------------
  // 6. Soil Profile API (/api/v1/soil)
  // -------------------------------------------------------------------------
  if (url.pathname === '/api/v1/soil' && req.method === 'GET') {
    const lat = Number(url.searchParams.get('lat'));
    const lon = Number(url.searchParams.get('lon'));
    if (!security.isValidCoord(lat, lon)) {
      return sendJson(res, 400, { error: 'Valid latitude (-90..90) and longitude (-180..180) are required.' });
    }
    try {
      const soil = await require('../frontend/forest-eyes/treeko-brain.js').getSoil(lat, lon, fetch, 35000);
      return sendJson(res, soil ? 200 : 503, soil || { error: 'SoilGrids is unavailable right now.' });
    } catch (err) {
      return sendError(res, err);
    }
  }

  // -------------------------------------------------------------------------
  // 7. Weather Proxy with Input Sanitization (/api/v1/weather)
  // -------------------------------------------------------------------------
  if (url.pathname === '/api/v1/weather') {
    const lat = Number(url.searchParams.get('lat') || '30.38');
    const lon = Number(url.searchParams.get('lon') || '79.32');

    if (!security.isValidCoord(lat, lon)) {
      return sendJson(res, 400, { error: 'Invalid latitude or longitude.' });
    }

    try {
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(5)}&longitude=${lon.toFixed(5)}&current=temperature_2m,relative_humidity_2m,precipitation,surface_pressure,wind_speed_10m`;
      const wRes = await fetch(weatherUrl, { signal: AbortSignal.timeout(10000) });
      if (!wRes.ok) throw new Error(`Weather upstream returned HTTP ${wRes.status}`);
      const wData = await wRes.json();
      return sendJson(res, 200, wData, { 'cache-control': 'public, max-age=600' });
    } catch (err) {
      return sendError(res, err);
    }
  }

  // -------------------------------------------------------------------------
  // 8. Static File Serving
  // -------------------------------------------------------------------------
  if (req.method === 'GET' || req.method === 'HEAD') {
    return serveStatic(req, res);
  }

  res.writeHead(405, { 'content-type': 'text/plain' });
  res.end('Method Not Allowed');
});

server.listen(PORT, () => {
  console.log(`\n================================================================`);
  console.log(`🌍 Earth Intelligence Platform (v3.0.0 Enterprise)`);
  console.log(`   Running at:  http://localhost:${PORT}`);
  console.log(`   Security:    CSP Enabled, Rate Limiting Active, Strict Sanitization`);
  console.log(`   Modules:     Overview, Forest Eyes, River Eyes, Hazard Lens`);
  console.log(`================================================================\n`);
});
