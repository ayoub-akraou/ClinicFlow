const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const authorization = req.get('authorization');
  const token = authorization?.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length)
    : null;

  if (!token) {
    return res.status(401).json({ error: { message: 'Connexion requise.' } });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: Number(payload.sub), role: payload.role };
    return next();
  } catch {
    return res.status(401).json({ error: { message: 'Session invalide ou expirée.' } });
  }
}

function requireRole(...roles) {
  return function checkRole(req, res, next) {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: { message: 'Action réservée à un administrateur.' } });
    }
    return next();
  };
}

module.exports = { requireAuth, requireRole };
