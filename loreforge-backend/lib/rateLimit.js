// Best-effort per-IP limiter. On serverless each instance keeps its own counts,
// so this slows abuse but is not a hard cap; use a shared store for that.

function clientIp(req) {
  const forwarded = req.headers && req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded) return forwarded.split(',')[0].trim();
  return (req.socket && req.socket.remoteAddress) || 'unknown';
}

function createRateLimiter({ limit = 20, windowMs = 60 * 1000, now = Date.now } = {}) {
  const hits = new Map();

  return function check(req) {
    const time = now();

    if (hits.size > 1000) {
      for (const [ip, record] of hits) {
        if (time > record.resetTime) hits.delete(ip);
      }
    }

    const ip = clientIp(req);
    const record = hits.get(ip);
    if (!record || time > record.resetTime) {
      hits.set(ip, { count: 1, resetTime: time + windowMs });
      return { ok: true };
    }
    if (record.count >= limit) {
      return { ok: false, retryAfter: Math.ceil((record.resetTime - time) / 1000) };
    }
    record.count += 1;
    return { ok: true };
  };
}

module.exports = { createRateLimiter, clientIp };
