import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

const jwtAlgorithm = process.env.JWT_ALGORITHM || 'RS256';
const publicKeyPath = path.resolve(process.env.JWT_PUBLIC_KEY_PATH || './keys/public.key');
const publicKey = fs.readFileSync(publicKeyPath, 'utf8');

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'No token provided'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, publicKey, {
      algorithms: [jwtAlgorithm]
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
