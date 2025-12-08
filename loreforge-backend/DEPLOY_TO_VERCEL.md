# 🚀 VERCEL DEPLOYMENT INSTRUCTIONS

Your backend is ready! Follow these steps to deploy:

## Step 1: Deploy to Vercel

1. **Go to https://vercel.com**
2. **Sign up/Login** with GitHub
3. **Click "Import Project"**
4. **Connect to GitHub** and select your repository
   - Or upload the `loreforge-backend` folder directly

## Step 2: Configure Environment Variables

After deployment:
1. Go to your **Vercel Dashboard**
2. Select your **project**
3. Go to **Settings → Environment Variables**
4. Add this variable:
   - **Name:** `GEMINI_API_KEY`
   - **Value:** Your actual Gemini API key
   - **Environment:** Production

## Step 3: Get Your Backend URL

After deployment, Vercel will give you a URL like:
```
https://loreforge-backend-yourusername.vercel.app
```

## Step 4: Update Your React Native App

Copy your Vercel URL and paste it here:

**File to edit:** `src/services/gemini.js`

**Change this line:**
```javascript
const BACKEND_BASE_URL = 'https://your-project-name.vercel.app';
```

**To your actual URL:**
```javascript
const BACKEND_BASE_URL = 'https://loreforge-backend-yourusername.vercel.app';
```

## Step 5: Test It!

1. **Restart your Expo server**
2. **Toggle AI Generation** in your app
3. **Roll a class** - it should work!

---

## Alternative: Manual Upload to Vercel

If you don't want to use GitHub:

1. **Zip the `loreforge-backend` folder**
2. **Go to vercel.com**
3. **Drag and drop the zip file**
4. **Follow the deployment wizard**
5. **Add your environment variables**

## Your Backend Files:
- ✅ `server.js` - Main server
- ✅ `package.json` - Dependencies
- ✅ `vercel.json` - Vercel config
- ✅ `.env.example` - Environment template

**Everything is ready for deployment!** 🎉