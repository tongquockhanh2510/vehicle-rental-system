import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

const publicKeyPath = path.resolve('./public.key');
const publicKey = fs.readFileSync(publicKeyPath, 'utf8');

const publicRoutes = [
  { path: '/api/users/login', method: 'POST' },
  { path: '/api/users/register', method: 'POST' },
  { path: '/health', method: 'GET' },
];

export const authenticateToken = (req, res, next) => {
  const isPublic = publicRoutes.some(
    route => req.path === route.path && req.method === route.method
  );

  if (isPublic) return next();

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'No token provided'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, publicKey, {
      algorithms: ['RS256']
    });

    req.userId = decoded.id;
    req.userRole = decoded.role;
    req.user = decoded;

    if (!req.userId) {
      return res.status(401).json({
        error: 'Token does not contain user id'
      });
    }

    next();
  } catch (error) {
    return res.status(403).json({
      error: 'Invalid or expired token'
    });
  }
};

export const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

export const requireRole = (roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.userRole)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  next();
};
