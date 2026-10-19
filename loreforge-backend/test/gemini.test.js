const test = require('node:test');
const assert = require('node:assert/strict');
const { extractStory, buildPayload, endpoint, GeminiError } = require('../lib/gemini');

const reply = (text, finishReason = 'STOP') => ({ candidates: [{ finishReason, content: { parts: [{ text }] } }] });

test('extracts story from schema-mode JSON', () => {
  assert.equal(extractStory(reply('{"story":"  You wake.  "}')), 'You wake.');
});

test('tolerates markdown fences', () => {
  assert.equal(extractStory(reply('```json\n{"story":"Hi"}\n```')), 'Hi');
});

test('truncated output is reported as truncated, not a generic failure', () => {
  assert.throws(() => extractStory(reply('{"story":"You wa', 'MAX_TOKENS')), /truncated/);
});

test('safety and prompt blocks map to 422', () => {
  assert.throws(() => extractStory(reply('', 'SAFETY')), (e) => e instanceof GeminiError && e.status === 422);
  assert.throws(() => extractStory({ promptFeedback: { blockReason: 'OTHER' } }), (e) => e.status === 422);
});

test('empty or story-less responses are 502', () => {
  for (const data of [undefined, {}, { candidates: [] }, reply('{"story":""}'), reply('{"x":1}'), reply('not json')]) {
    assert.throws(() => extractStory(data), (e) => e instanceof GeminiError && e.status === 502);
  }
});

test('payload asks for JSON schema output and disables thinking on 2.5 flash', () => {
  const prev = process.env.GEMINI_MODEL;
  delete process.env.GEMINI_MODEL;
  const p = buildPayload({ systemInstruction: {}, contents: [] });
  assert.equal(p.generationConfig.responseMimeType, 'application/json');
  assert.deepEqual(p.generationConfig.thinkingConfig, { thinkingBudget: 0 });

  process.env.GEMINI_MODEL = 'gemini-3-pro';
  assert.equal(buildPayload({}).generationConfig.thinkingConfig, undefined);
  assert.match(endpoint(), /models\/gemini-3-pro:generateContent$/);
  if (prev === undefined) delete process.env.GEMINI_MODEL; else process.env.GEMINI_MODEL = prev;
});
