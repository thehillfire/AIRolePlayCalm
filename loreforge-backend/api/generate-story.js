const axios = require('axios');

// Gemini API configuration
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    let { prompt, requestId } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required'
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'Gemini API key not configured'
      });
    }

    // Make prompt stricter for JSON-only output
    prompt += '\n\nRespond ONLY with valid JSON. Do not include any text outside the JSON object.';

    console.log(`📚 Generating story for request: ${requestId}`);

    // Call Gemini API securely for story generation
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 400, // Limit output to ~75 words
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 45000 // Longer timeout for story generation
      }
    );

    if (!response.data.candidates || response.data.candidates.length === 0) {
      throw new Error('No response from Gemini API');
    }

    const generatedText = response.data.candidates[0].content.parts[0].text;

    // Clean up the response
    const cleanedText = generatedText
      .replace(/```json\n?/gi, '')
      .replace(/```\n?/gi, '')
      .trim();

    // Try to parse JSON and log raw response if it fails
    try {
      JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('❌ Failed to parse Gemini response as JSON:', cleanedText);
      return res.status(500).json({
        success: false,
        error: 'Failed to parse story as JSON',
        rawResponse: cleanedText,
        details: parseError.message
      });
    }

    console.log(`✅ Generated story for request: ${requestId}`);

    res.json({
      success: true,
      story: cleanedText,
      requestId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error generating story:', error.message);

    if (error.code === 'ECONNABORTED') {
      return res.status(408).json({
        success: false,
        error: 'Request timeout - Gemini API took too long to respond'
      });
    }

    if (error.response && error.response.status === 429) {
      return res.status(429).json({
        success: false,
        error: 'Gemini API rate limit exceeded',
        retryAfter: 30
      });
    }

    if (error.response && error.response.status === 400) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request to Gemini API',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to generate story',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};