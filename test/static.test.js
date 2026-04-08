/**
 * Tests for static file serving and SPA fallback.
 * Creates a temporary dist/ directory with a mock index.html.
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';

describe('Axon static file serving', () => {
  let server, baseUrl, tmpDir;

  before(async () => {
    // Create temporary dist directory with mock files
    tmpDir = path.join(os.tmpdir(), 'axon-static-test-' + Date.now());
    fs.mkdirSync(tmpDir, { recursive: true });
    fs.writeFileSync(path.join(tmpDir, 'index.html'), '<html><body>Axon SPA</body></html>');
    fs.mkdirSync(path.join(tmpDir, 'assets'), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, 'assets', 'style.css'), 'body { color: brown; }');

    const app = express();

    // Mount API first (like the real server)
    app.get('/api/config', (_req, res) => {
      res.json({ tier: 'test', port: 0 });
    });

    // Static serving
    app.use(express.static(tmpDir));

    // SPA fallback (Express 5: named wildcard)
    app.get('/{*path}', (_req, res) => {
      res.sendFile(path.join(tmpDir, 'index.html'));
    });

    await new Promise((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        const addr = server.address();
        baseUrl = `http://127.0.0.1:${addr.port}`;
        resolve();
      });
    });
  });

  after(async () => {
    await new Promise((resolve) => server.close(resolve));
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('1. serves index.html at root', async () => {
    const res = await fetch(`${baseUrl}/`);
    assert.equal(res.status, 200);
    const body = await res.text();
    assert.ok(body.includes('Axon SPA'));
  });

  it('2. serves static assets', async () => {
    const res = await fetch(`${baseUrl}/assets/style.css`);
    assert.equal(res.status, 200);
    const body = await res.text();
    assert.ok(body.includes('color: brown'));
  });

  it('3. SPA fallback returns index.html for unknown routes', async () => {
    const res = await fetch(`${baseUrl}/projects/opvera`);
    assert.equal(res.status, 200);
    const body = await res.text();
    assert.ok(body.includes('Axon SPA'));
  });

  it('4. API routes take precedence over SPA fallback', async () => {
    const res = await fetch(`${baseUrl}/api/config`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.tier, 'test');
  });

  it('5. SPA fallback handles deep nested routes', async () => {
    const res = await fetch(`${baseUrl}/projects/opvera/coming-soon`);
    assert.equal(res.status, 200);
    const body = await res.text();
    assert.ok(body.includes('Axon SPA'));
  });
});
