const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: true, // Allow all origins for development - you can restrict this later
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));

// Simple rate limiting using memory (for production, use Redis)
const requestCounts = new Map();
const RATE_LIMIT = 10; // requests per minute
const RATE_WINDOW = 60 * 1000; // 1 minute

function rateLimit(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return next();
  }
  
  const record = requestCounts.get(ip);
  
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + RATE_WINDOW;
    return next();
  }
  
  if (record.count >= RATE_LIMIT) {
    return res.status(429).json({
      success: false,
      error: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.ceil((record.resetTime - now) / 1000)
    });
  }
  
  record.count++;
  next();
}

// Gemini API configuration
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'LoreForge RPG Backend',
    geminiConfigured: !!process.env.GEMINI_API_KEY
  });
});

// Generate RPG class endpoint
app.post('/api/generate-class', rateLimit, async (req, res) => {
  try {
    const { prompt, rarity, requestId } = req.body;

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

    console.log(`🤖 Generating class for request: ${requestId}`);

    // Call Gemini API securely
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
          temperature: 0.9,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 200,
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000 // 30 second timeout
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

    // Parse the JSON response
    let classData;
    try {
      classData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse JSON:', cleanedText);
      throw new Error('Invalid JSON response from Gemini API');
    }

    // Validate the response structure
    if (!classData.name || !classData.rarity || !classData.description) {
      throw new Error('Invalid class data structure from API');
    }

    console.log(`✅ Generated class: ${classData.name} (${classData.rarity})`);

    res.json({
      success: true,
      class: classData,
      requestId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error generating class:', error.message);

    // Handle different types of errors
    if (error.code === 'ECONNABORTED') {
      return res.status(408).json({
        success: false,
        error: 'Request timeout - Gemini API took too long to respond'
      });
    }

    if (error.response && error.response.status === 429) {
      return res.status(429).json({
        success: false,
        error: 'Gemini API rate limit exceeded'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to generate class',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'LoreForge RPG Backend',
    status: 'running',
    endpoints: {
      health: '/api/health',
      generateClass: '/api/generate-class'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 LoreForge Backend running on port ${PORT}`);
  console.log(`🔐 Gemini API Key: ${process.env.GEMINI_API_KEY ? 'Configured ✅' : 'Missing ❌'}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;