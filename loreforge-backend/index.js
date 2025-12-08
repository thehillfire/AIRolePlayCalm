module.exports = (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  res.status(200).json({
    message: 'LoreForge RPG Backend API',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      generateClass: '/api/generate-class (POST only)',
      test: '/api/test'
    },
    documentation: {
      generateClass: {
        method: 'POST',
        url: '/api/generate-class',
        body: {
          prompt: 'string (required)',
          rarity: 'string (optional)',
          requestId: 'string (optional)'
        }
      }
    },
    timestamp: new Date().toISOString()
  });
};