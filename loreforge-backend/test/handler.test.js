const test = require('node:test');
const assert = require('node:assert/strict');
const { createHandler } = require('../api/generate-story');
const { createRateLimiter } = require('../lib/rateLimit');
const { GeminiError } = require('../lib/gemini');

process.env.GEMINI_API_KEY = 'test-key';
const character = { name: 'Vex' };

function run(handler, { method = 'POST', body, headers = {} } = {}) {
  return new Promise((resolve) => {
    const res = { code: 200, headers: {}, body: undefined };
    res.setHeader = (k, v) => { res.headers[k] = v; };
    res.status = (c) => { res.code = c; return res; };
    res.json = (b) => { res.body = b; resolve(res); return res; };
    res.end = () => resolve(res);
    Promise.resolve(handler({ method, body, headers, socket: { remoteAddress: '1.1.1.1' } }, res)).catch((e) => resolve({ thrown: e }));
  });
}

const ok = createHandler({ generate: async () => 'You wake.' });

test('success returns plain text and the legacy JSON-string field', async () => {
  const res = await run(ok, { body: { mode: 'intro', character, requestId: 'r1' } });
  assert.equal(res.code, 200);
  assert.equal(res.body.text, 'You wake.');
  assert.deepEqual(JSON.parse(res.body.story), { story: 'You wake.' });
  assert.equal(res.body.requestId, 'r1');
});

test('passes the built request (not raw client input) to Gemini', async () => {
  let seen;
  const h = createHandler({ generate: async (r) => { seen = r; return 'x'; } });
  await run(h, { body: { mode: 'continue', character, action: 'look' } });
  assert.ok(seen.systemInstruction && Array.isArray(seen.contents));
});

test('OPTIONS, wrong method, bad body', async () => {
  assert.equal((await run(ok, { method: 'OPTIONS' })).code, 200);
  assert.equal((await run(ok, { method: 'GET' })).code, 405);
  assert.equal((await run(ok, { body: { mode: 'continue', character } })).code, 400);
  assert.equal((await run(ok, { body: undefined })).code, 400);
});

test('missing API key is a 500 before any upstream call', async () => {
  const key = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;
  const res = await run(ok, { body: { mode: 'intro', character } });
  process.env.GEMINI_API_KEY = key;
  assert.equal(res.code, 500);
});

test('rate limit returns 429 with Retry-After', async () => {
  let t = 0;
  const h = createHandler({ generate: async () => 'x', limiter: createRateLimiter({ limit: 2, windowMs: 60000, now: () => t }) });
  const body = { mode: 'intro', character };
  assert.equal((await run(h, { body })).code, 200);
  assert.equal((await run(h, { body })).code, 200);
  const third = await run(h, { body });
  assert.equal(third.code, 429);
  assert.equal(third.headers['Retry-After'], '60');
  t = 61000;
  assert.equal((await run(h, { body })).code, 200);
});

test('rate limit keys on x-forwarded-for, not the proxy address', async () => {
  const h = createHandler({ generate: async () => 'x', limiter: createRateLimiter({ limit: 1 }) });
  const body = { mode: 'intro', character };
  assert.equal((await run(h, { body, headers: { 'x-forwarded-for': '9.9.9.9, 10.0.0.1' } })).code, 200);
  assert.equal((await run(h, { body, headers: { 'x-forwarded-for': '8.8.8.8' } })).code, 200);
  assert.equal((await run(h, { body, headers: { 'x-forwarded-for': '9.9.9.9' } })).code, 429);
});

test('upstream failures map to player-safe errors', async () => {
  const fail = (err) => createHandler({ generate: async () => { throw err; } });
  const body = { mode: 'intro', character };
  const http = (status) => Object.assign(new Error('x'), { response: { status } });

  assert.equal((await run(fail(http(429)), { body })).code, 429);
  assert.equal((await run(fail(http(404)), { body })).code, 502);
  assert.equal((await run(fail(http(400)), { body })).code, 502);
  assert.equal((await run(fail(Object.assign(new Error('t'), { code: 'ECONNABORTED' })), { body })).code, 408);
  assert.equal((await run(fail(new GeminiError('blocked', 422)), { body })).code, 422);
  assert.equal((await run(fail(new GeminiError('bad json', 502)), { body })).code, 502);
  const generic = await run(fail(new Error('boom')), { body });
  assert.equal(generic.code, 500);
  assert.equal(generic.body.details, undefined);
});
