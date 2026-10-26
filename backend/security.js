/**
 * Earth Intelligence Platform — Security & Validation Module (security.js)
 * =========================================================================
 * Provides:
 *   - HTTP Security Headers (CSP, X-Content-Type-Options, X-Frame-Options, etc.)
 *   - In-memory sliding-window rate limiting with automatic pruning
 *   - Input sanitization & coordinate bounds validation (prevent SSRF / injection)
 *   - CORS origin validation
 *   - Safe error formatting (prevents stack/internal credential leakage)
 */
'use strict';

// ---------------------------------------------------------------------------
// Rate Limiter: In-memory sliding window
// ---------------------------------------------------------------------------
class RateLimiter {
  constructor({ windowMs = 60000, maxRequests = 60, cleanupIntervalMs = 120000 } = {}) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.hits = new Map(); // ip -> [timestamp, timestamp, ...]

    // Periodic sweep to prevent unbounded memory growth
    this.cleanupTimer = setInterval(() => this.prune(), cleanupIntervalMs);
    if (this.cleanupTimer.unref) this.cleanupTimer.unref();
  }

  isAllowed(ip) {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    let timestamps = this.hits.get(ip);

    if (!timestamps) {
      timestamps = [];
      this.hits.set(ip, timestamps);
    }

    // Filter out timestamps outside the active window
    const recent = timestamps.filter(t => t > windowStart);
    recent.push(now);
    this.hits.set(ip, recent);

    if (recent.length > this.maxRequests) {
      const oldestInWindow = recent[0];
      const resetTimeSec = Math.ceil((oldestInWindow + this.windowMs - now) / 1000);
      return { allowed: false, retryAfter: Math.max(1, resetTimeSec), count: recent.length };
    }

    return { allowed: true, count: recent.length, remaining: this.maxRequests - recent.length };
  }

  prune() {
    const cutoff = Date.now() - this.windowMs;
    for (const [ip, timestamps] of this.hits.entries()) {
      const active = timestamps.filter(t => t > cutoff);
      if (active.length === 0) {
        this.hits.delete(ip);
      } else {
        this.hits.set(ip, active);
      }
    }
  }
}

// Tiered limiters based on endpoint cost
const limiters = {
  // Heavy AI endpoints (Gemma 4 inference, multimodal image analysis)
  ai: new RateLimiter({ windowMs: 60000, maxRequests: 25 }),
  // Computationally heavy geospatial endpoints (Sentinel-2 STAC queries, Dam atlas)
  compute: new RateLimiter({ windowMs: 60000, maxRequests: 40 }),
  // Standard read / telemetry APIs
  standard: new RateLimiter({ windowMs: 60000, maxRequests: 150 })
};

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const first = forwarded.split(',')[0].trim();
    if (first) return first;
  }
  return req.socket?.remoteAddress || '127.0.0.1';
}

function checkRateLimit(req, tier = 'standard') {
  const ip = getClientIp(req);
  const limiter = limiters[tier] || limiters.standard;
  return limiter.isAllowed(ip);
}

// ---------------------------------------------------------------------------
// Security Headers
// ---------------------------------------------------------------------------
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://unpkg.com https://fonts.googleapis.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https://*.arcgisonline.com https://*.tile.openstreetmap.org https://tiles.globalforestwatch.org https://*.microsoft.com https://planetarycomputer.microsoft.com",
    "connect-src 'self' https://api.open-meteo.com https://flood-api.open-meteo.com https://generativelanguage.googleapis.com https://api.resourcewatch.org https://data-api.globalforestwatch.org https://analytics.globalnaturewatch.org https://earthquake.usgs.gov https://rest.isric.org https://planetarycomputer.microsoft.com",
    "frame-src 'self'",
    "frame-ancestors 'self'"
  ].join('; ')
};

function applySecurityHeaders(res) {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    res.setHeader(key, value);
  }
}

// ---------------------------------------------------------------------------
// Input Validation & SSRF Prevention
// ---------------------------------------------------------------------------
function isValidCoord(lat, lon) {
  const numLat = Number(lat);
  const numLon = Number(lon);
  return (
    Number.isFinite(numLat) &&
    Number.isFinite(numLon) &&
    numLat >= -90 &&
    numLat <= 90 &&
    numLon >= -180 &&
    numLon <= 180
  );
}

function sanitizeText(str, maxLength = 2000) {
  if (typeof str !== 'string') return '';
  return str.slice(0, maxLength).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim();
}

function safeError(err, isDev = process.env.NODE_ENV !== 'production') {
  const status = err.status || 500;
  let message = err.message || 'An internal error occurred.';

  // In production, mask unhandled internal crashes so credentials / stack traces are never exposed
  if (!isDev && status >= 500 && !err.isPublic) {
    message = 'Service temporarily unavailable. Please try again later.';
  }

  return { status, json: { error: message, code: err.code || 'REQUEST_FAILED' } };
}

module.exports = {
  RateLimiter,
  checkRateLimit,
  getClientIp,
  applySecurityHeaders,
  isValidCoord,
  sanitizeText,
  safeError,
  SECURITY_HEADERS
};
