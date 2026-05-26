import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

const publicKeyPath = path.resolve('./public.key');
const publicKey = fs.readFileSync(publicKeyPath, 'utf8');

export const authenticateToken = (req, res, next) => {
  // Check for service token (service-to-service communication)
  const serviceToken = req.headers['x-service-token'];
  if (serviceToken && serviceToken === process.env.SERVICE_TOKEN) {
    req.isService = true;
    return next();
  }

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

    req.userId =  decoded.id;
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