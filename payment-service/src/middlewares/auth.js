import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

const publicKeyPath = path.resolve('./public.key');
const publicKey = fs.readFileSync(publicKeyPath, 'utf8');

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, publicKey, { algorithms: ['RS256'] }, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  });
};
