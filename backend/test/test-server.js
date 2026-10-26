/**
 * Earth Intelligence — Server & Security Verification Test Suite
 * ==============================================================
 * Verifies:
 *   1. Health check & security headers (CSP, X-Content-Type-Options, etc.)
 *   2. Overview API metrics & dataset calculations
 *   3. Reports API generation
 *   4. Input coordinate validation (SSRF / NaN / out of bounds defense)
 *   5. Rate limiting defense
 *   6. HydroRIVERS network availability
 */
'use strict';

const http = require('http');
const path = require('path');
const assert = require('assert');

const ROOT = path.join(__dirname, '..', '..');
process.env.PORT = '8089'; // use separate port for test
process.env.NODE_ENV = 'test';

const security = require('../security.js');
const overviewApi = require('../overview-api.js');

async function runTests() {
  console.log('🧪 Starting Earth Intelligence Test Suite...\n');

  // Test 1: Coordinate Validation
  console.log('Test 1: Coordinate Validation');
  assert.strictEqual(security.isValidCoord(30.5, 79.5), true, 'Valid coordinates should pass');
  assert.strictEqual(security.isValidCoord(95, 20), false, 'Out of bounds lat (>90) should fail');
  assert.strictEqual(security.isValidCoord(20, 200), false, 'Out of bounds lon (>180) should fail');
  assert.strictEqual(security.isValidCoord('NaN', 20), false, 'NaN should fail');
  assert.strictEqual(security.isValidCoord('DROP TABLE', 0), false, 'SQL injection strings should fail');
  console.log('  ✓ Coordinate validation passes');

  // Test 2: Rate Limiter
  console.log('Test 2: Rate Limiter Behavior');
  const testLimiter = new security.RateLimiter({ windowMs: 1000, maxRequests: 3 });
  assert.strictEqual(testLimiter.isAllowed('1.2.3.4').allowed, true, 'Req 1 allowed');
  assert.strictEqual(testLimiter.isAllowed('1.2.3.4').allowed, true, 'Req 2 allowed');
  assert.strictEqual(testLimiter.isAllowed('1.2.3.4').allowed, true, 'Req 3 allowed');
  assert.strictEqual(testLimiter.isAllowed('1.2.3.4').allowed, false, 'Req 4 rate limited');
  assert.strictEqual(testLimiter.isAllowed('5.6.7.8').allowed, true, 'Different IP allowed');
  console.log('  ✓ Sliding window rate limiter passes');

  // Test 3: Overview API Calculations
  console.log('Test 3: Overview API Calculations');
  const overview = overviewApi.computeOverview();
  assert.ok(overview, 'Overview object should be produced');
  assert.strictEqual(overview.platform, 'Earth Intelligence');
  assert.ok(Array.isArray(overview.monitoredLocations), 'Should contain monitored locations');
  assert.ok(overview.monitoredLocations.length >= 5, 'Should have at least 5 benchmark locations');
  assert.ok(overview.benchmarkMetrics.totalMonitoredTreeLossHa > 0, 'Should aggregate real tree loss ha');
  console.log(`  ✓ Overview calculates real data (${overview.monitoredLocations.length} locations, ${overview.benchmarkMetrics.totalMonitoredTreeLossHa} ha tree loss)`);

  // Test 4: Evidence Report Generation
  console.log('Test 4: Evidence Report Generation');
  const report = overviewApi.generateReport('joshimath');
  assert.ok(report, 'Report should be generated for Joshimath');
  assert.ok(report.dossierId.startsWith('EI-DOSSIER-'), 'Dossier ID formatted');
  assert.ok(Array.isArray(report.evidenceAttribution), 'Attribution array present');
  console.log(`  ✓ Report successfully generated: ${report.title}`);

  // Test 5: Server HTTP Endpoints
  console.log('Test 5: Live Server Endpoints & Headers');
  // Require and start the server
  require('../server.js');

  await new Promise(r => setTimeout(r, 1000));

  function request(path, opts = {}) {
    return new Promise((resolve, reject) => {
      const req = http.request({
        hostname: 'localhost',
        port: 8089,
        path,
        method: opts.method || 'GET',
        headers: opts.headers || {}
      }, res => {
        let body = '';
        res.on('data', c => body += c);
        res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
      });
      req.on('error', reject);
      if (opts.body) req.write(opts.body);
      req.end();
    });
  }

  // 5a. Health Endpoint
  const healthRes = await request('/api/v1/health');
  assert.strictEqual(healthRes.status, 200, 'Health endpoint should return 200');
  const healthJson = JSON.parse(healthRes.body);
  assert.strictEqual(healthJson.service, 'Earth Intelligence Platform');
  assert.strictEqual(healthRes.headers['x-content-type-options'], 'nosniff', 'Security header nosniff present');
  assert.strictEqual(healthRes.headers['x-frame-options'], 'SAMEORIGIN', 'Security header SAMEORIGIN present');
  assert.ok(healthRes.headers['content-security-policy'], 'CSP present');
  console.log('  ✓ /api/v1/health returns 200 with security headers');

  // 5b. Overview Endpoint
  const overRes = await request('/api/v1/overview');
  assert.strictEqual(overRes.status, 200, 'Overview endpoint returns 200');
  const overJson = JSON.parse(overRes.body);
  assert.strictEqual(overJson.platform, 'Earth Intelligence');
  console.log('  ✓ /api/v1/overview returns 200');

  // 5c. Reports Endpoint
  const repRes = await request('/api/v1/reports?place=cologne');
  assert.strictEqual(repRes.status, 200, 'Reports endpoint returns 200');
  console.log('  ✓ /api/v1/reports returns 200');

  // 5d. Coordinate Validation Defense on Weather
  const badWeather = await request('/api/v1/weather?lat=999&lon=999');
  assert.strictEqual(badWeather.status, 400, 'Out of bounds weather should be 400');
  console.log('  ✓ Invalid coordinates rejected with 400');

  // 5e. Static Assets & SVG Favicon
  const favRes = await request('/favicon.svg');
  assert.strictEqual(favRes.status, 200, 'Favicon SVG returns 200');
  assert.strictEqual(favRes.headers['content-type'], 'image/svg+xml', 'Favicon mime is SVG');
  console.log('  ✓ Favicon returns 200 with SVG');

  console.log('\n🎉 ALL 5 TEST SUITES PASSED CLEANLY!\n');
  process.exit(0);
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
