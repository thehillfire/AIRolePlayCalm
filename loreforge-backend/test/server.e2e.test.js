// Starts the real Express server against a fake Gemini over HTTP.
const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const path = require('node:path');
const { spawn } = require('node:child_process');

const listen = (server) => new Promise((r) => server.listen(0, '127.0.0.1', () => r(server.address().port)));

async function waitFor(url, tries = 50) {
  for (let i = 0; i < tries; i++) {
    try { return await fetch(url); } catch { await new Promise((r) => setTimeout(r, 100)); }
  }
  throw new Error(`server never came up: ${url}`);
}

test('POST /api/generate-story works end to end through Express', async (t) => {
  const seen = [];
  const fake = http.createServer((req, res) => {
    let raw = '';
    req.on('data', (c) => { raw += c; });
    req.on('end', () => {
      seen.push({ url: req.url, key: req.headers['x-goog-api-key'], body: JSON.parse(raw) });
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: '{"story":"The door opens."}' }] } }] }));
    });
  });
  const fakePort = await listen(fake);
  const appPort = 20000 + Math.floor(Math.random() * 20000);

  const child = spawn(process.execPath, [path.join(__dirname, '..', 'server.js')], {
    env: { ...process.env, PORT: String(appPort), GEMINI_API_KEY: 'secret-key', GEMINI_MODEL: 'gemini-2.5-flash', GEMINI_API_BASE: `http://127.0.0.1:${fakePort}/v1beta` },
    stdio: 'ignore',
  });
  t.after(() => { child.kill(); fake.close(); });

  await waitFor(`http://127.0.0.1:${appPort}/api/health`);

  const res = await fetch(`http://127.0.0.1:${appPort}/api/generate-story`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mode: 'continue',
      character: { name: 'Vex', rarity: 'Epic' },
      history: [{ role: 'narrator', text: 'A door looms.' }],
      action: 'I knock.',
    }),
  });
  const data = await res.json();

  assert.equal(res.status, 200);
  assert.equal(data.text, 'The door opens.');

  assert.equal(seen.length, 1);
  assert.equal(seen[0].url, '/v1beta/models/gemini-2.5-flash:generateContent');
  assert.ok(!seen[0].url.includes('secret-key'), 'key must not be in the URL');
  assert.equal(seen[0].key, 'secret-key');
  assert.match(seen[0].body.systemInstruction.parts[0].text, /Vex/);
  assert.deepEqual(seen[0].body.contents.map((c) => c.role), ['user', 'model', 'user']);
  assert.equal(seen[0].body.generationConfig.responseMimeType, 'application/json');
});
