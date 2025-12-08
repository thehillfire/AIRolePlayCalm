# Secure Backend for LoreForge RPG

This backend securely handles Gemini API calls without exposing your API key to the client app.

## Quick Setup

### 1. Create a new Node.js project:
```bash
mkdir loreforge-backend
cd loreforge-backend
npm init -y
npm install express cors dotenv axios helmet rate-limiter-flexible
```

### 2. Create `.env` file:
```env
# Your actual Gemini API key (keep this secret!)
GEMINI_API_KEY=your-actual-gemini-api-key-here

# Server configuration
PORT=3000
NODE_ENV=production

# Optional: Add authentication if you want user-specific limits
JWT_SECRET=your-jwt-secret-here
```

### 3. Create `server.js`:
```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const axios = require('axios');
const { RateLimiterMemory } = require('rate-limiter-flexible');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: ['exp://localhost:8081', 'http://localhost:8081'], // Adjust for your Expo app
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));

// Rate limiting - 10 requests per minute per IP
const rateLimiter = new RateLimiterMemory({
  keyGenerator: (req) => req.ip,
  points: 10, // Number of requests
  duration: 60, // Per 60 seconds
});

// Gemini API configuration
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'LoreForge RPG Backend'
  });
});

// Generate RPG class endpoint
app.post('/api/generate-class', async (req, res) => {
  try {
    // Rate limiting
    await rateLimiter.consume(req.ip);

    const { prompt, rarity, requestId } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required'
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
    const classData = JSON.parse(cleanedText);

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
    if (error.remainingPoints !== undefined) {
      // Rate limit exceeded
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.round(error.msBeforeNext / 1000) || 60
      });
    }

    console.error('❌ Error generating class:', error.message);

    res.status(500).json({
      success: false,
      error: 'Failed to generate class',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 LoreForge Backend running on port ${PORT}`);
  console.log(`🔐 Gemini API Key: ${process.env.GEMINI_API_KEY ? 'Configured' : 'Missing'}`);
});
```

### 4. Deploy your backend:

**Option A: Vercel (Recommended)**
```bash
npm install -g vercel
vercel
# Follow the prompts and add your environment variables in the Vercel dashboard
```

**Option B: Railway**
```bash
npm install -g @railway/cli
railway login
railway new
railway add
# Add environment variables in Railway dashboard
```

**Option C: Heroku**
```bash
heroku create your-app-name
heroku config:set GEMINI_API_KEY=your-key-here
git add .
git commit -m "Initial commit"
git push heroku main
```

### 5. Update your app's backend URL:

In `src/services/gemini.js`, replace:
```javascript
const BACKEND_BASE_URL = 'https://your-backend-url.com';
```

With your actual deployed URL:
```javascript
const BACKEND_BASE_URL = 'https://your-app.vercel.app';
```

## Security Features

✅ **API Key Protection**: Never exposed to client app  
✅ **Rate Limiting**: Prevents abuse (10 requests/minute per IP)  
✅ **CORS Protection**: Only allows requests from your app  
✅ **Request Validation**: Validates all inputs  
✅ **Error Handling**: Doesn't leak sensitive information  
✅ **HTTPS Only**: Secure transport layer  

## Cost Optimization

- **Caching**: Add Redis caching for repeated requests
- **Queue System**: Use Bull/Bee-Queue for heavy loads
- **Request Deduplication**: Prevent duplicate API calls
- **Usage Analytics**: Track and optimize API usage

Your Gemini API key stays safely on your server! 🔐