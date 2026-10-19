// Thin Gemini client. The API key travels in a header, never in the URL.

const DEFAULT_MODEL = 'gemini-2.5-flash';
const DEFAULT_BASE = 'https://generativelanguage.googleapis.com/v1beta';

class GeminiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'GeminiError';
    this.status = status;
  }
}

function modelName() {
  return process.env.GEMINI_MODEL || DEFAULT_MODEL;
}

function endpoint() {
  const base = process.env.GEMINI_API_BASE || DEFAULT_BASE;
  return `${base}/models/${modelName()}:generateContent`;
}

function buildPayload({ systemInstruction, contents }) {
  const generationConfig = {
    temperature: 0.9,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 700,
    responseMimeType: 'application/json',
    responseSchema: {
      type: 'OBJECT',
      properties: { story: { type: 'STRING' } },
      required: ['story'],
    },
  };

  // 2.5 Flash spends output tokens on hidden thinking; a short story turn does not need it.
  if (/2\.5-flash/.test(modelName())) {
    generationConfig.thinkingConfig = { thinkingBudget: 0 };
  }

  return { systemInstruction, contents, generationConfig };
}

function extractStory(data) {
  const blockReason = data && data.promptFeedback && data.promptFeedback.blockReason;
  if (blockReason) throw new GeminiError(`Prompt blocked: ${blockReason}`, 422);

  const candidate = data && data.candidates && data.candidates[0];
  if (!candidate) throw new GeminiError('No response from Gemini API', 502);
  if (candidate.finishReason === 'SAFETY') throw new GeminiError('Response blocked by safety filters', 422);

  const raw = ((candidate.content && candidate.content.parts) || [])
    .map((part) => part.text || '')
    .join('')
    .replace(/```json\n?/gi, '')
    .replace(/```\n?/g, '')
    .trim();

  let story;
  try {
    story = JSON.parse(raw).story;
  } catch (err) {
    const why = candidate.finishReason === 'MAX_TOKENS' ? 'truncated' : 'not valid JSON';
    throw new GeminiError(`Gemini response was ${why}`, 502);
  }

  if (typeof story !== 'string' || !story.trim()) {
    throw new GeminiError('Gemini response had no story text', 502);
  }
  return story.trim();
}

async function generateStoryText(request) {
  const axios = require('axios');
  const response = await axios.post(endpoint(), buildPayload(request), {
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': process.env.GEMINI_API_KEY,
    },
    timeout: 45000,
  });
  return extractStory(response.data);
}

module.exports = { generateStoryText, extractStory, buildPayload, endpoint, GeminiError, DEFAULT_MODEL };
