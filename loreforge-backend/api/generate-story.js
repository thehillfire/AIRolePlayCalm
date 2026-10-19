const { buildStoryRequest, ValidationError } = require('../lib/storyPrompt');
const { generateStoryText, GeminiError } = require('../lib/gemini');
const { createRateLimiter } = require('../lib/rateLimit');

function createHandler({ generate = generateStoryText, limiter = createRateLimiter() } = {}) {
  return async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    if (req.method !== 'POST') {
      res.status(405).json({ success: false, error: 'Method not allowed' });
      return;
    }

    const limit = limiter(req);
    if (!limit.ok) {
      res.setHeader('Retry-After', String(limit.retryAfter));
      res.status(429).json({
        success: false,
        error: 'Too many requests. Please slow down.',
        retryAfter: limit.retryAfter,
      });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      res.status(500).json({ success: false, error: 'Gemini API key not configured' });
      return;
    }

    const body = req.body || {};
    const requestId = typeof body.requestId === 'string' ? body.requestId.slice(0, 80) : undefined;

    let request;
    try {
      request = buildStoryRequest(body);
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({ success: false, error: error.message });
        return;
      }
      throw error;
    }

    try {
      console.log(`📚 Generating story for request: ${requestId}`);
      const text = await generate(request);
      console.log(`✅ Generated story for request: ${requestId}`);

      res.json({
        success: true,
        text,
        // Older app builds read `story` as a JSON string containing { story }.
        story: JSON.stringify({ story: text }),
        requestId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const upstream = error.response && error.response.status;
      console.error(`❌ Error generating story: ${error.message}${upstream ? ` (Gemini HTTP ${upstream})` : ''}`);

      if (error.code === 'ECONNABORTED') {
        res.status(408).json({ success: false, error: 'Request timeout - Gemini API took too long to respond' });
        return;
      }
      if (upstream === 429) {
        res.status(429).json({ success: false, error: 'Gemini API rate limit exceeded', retryAfter: 30 });
        return;
      }
      if (upstream === 404 || upstream === 400) {
        // Our request or model setting is wrong, not the player's. Check GEMINI_MODEL.
        console.error('⚠️ Gemini rejected the request. Check the GEMINI_MODEL setting and API key.');
        res.status(502).json({ success: false, error: 'The story service is misconfigured' });
        return;
      }
      if (error instanceof GeminiError) {
        res.status(error.status).json({
          success: false,
          error: error.status === 422 ? 'The storyteller could not continue that. Try a different action.' : 'The storyteller lost the thread. Please try again.',
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Failed to generate story',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  };
}

module.exports = createHandler();
module.exports.createHandler = createHandler;
