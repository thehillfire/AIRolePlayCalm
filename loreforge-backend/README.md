# LoreForge RPG Backend

Secure backend for LoreForge RPG that handles Gemini API calls without exposing your API key.

## 🚀 One-Click Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

**After deployment:**
1. Add `GEMINI_API_KEY` environment variable in Vercel dashboard
2. Copy your deployment URL
3. Update `BACKEND_BASE_URL` in your React Native app

## Quick Deploy to Vercel

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Add Environment Variable:**
   - Go to your Vercel dashboard
   - Select your project
   - Go to Settings → Environment Variables
   - Add: `GEMINI_API_KEY` with your actual Gemini API key

4. **Update your React Native app:**
   - Copy your Vercel URL (e.g., `https://loreforge-backend.vercel.app`)
   - Update `BACKEND_BASE_URL` in `src/services/gemini.js`

## Local Development

1. **Create .env file:**
   ```bash
   cp .env.example .env
   ```

2. **Add your Gemini API key to .env:**
   ```
   GEMINI_API_KEY=your-actual-api-key-here
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

## Endpoints

- `GET /` - Basic info
- `GET /api/health` - Health check
- `POST /api/generate-class` - Generate RPG class

## Security Features

- ✅ API key stored server-side only
- ✅ Rate limiting (10 requests/minute per IP)
- ✅ CORS protection
- ✅ Helmet security headers
- ✅ Request validation
- ✅ Error handling