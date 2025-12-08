module.exports = (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Debug environment variables (be careful in production!)
  const envKeys = Object.keys(process.env).filter(key => 
    key.includes('GEMINI') || key.includes('API')
  );
  
  res.status(200).json({ 
    availableEnvKeys: envKeys,
    geminiApiKey: process.env.GEMINI_API_KEY ? 'SET' : 'NOT_SET',
    nodeEnv: process.env.NODE_ENV
  });
};