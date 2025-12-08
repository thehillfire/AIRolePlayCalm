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
    message: 'LoreForge RPG Backend',
    status: 'running',
    endpoints: {
      health: '/api/health',
  // generateClass endpoint removed
    },
    timestamp: new Date().toISOString()
  });
};