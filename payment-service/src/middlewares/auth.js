import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

const jwtAlgorithm = process.env.JWT_ALGORITHM || 'RS256';

function resolvePublicKey() {
  const inlinePublicKey = process.env.JWT_PUBLIC_KEY;
  if (inlinePublicKey) {
    return inlinePublicKey.replace(/\\n/g, '\n');
  }

  const publicKeyPath = path.resolve(process.env.JWT_PUBLIC_KEY_PATH || './keys/public.key');
  try {
    return fs.readFileSync(publicKeyPath, 'utf8');
  } catch (error) {
    throw new Error(
      `Cannot read JWT public key. Set JWT_PUBLIC_KEY or JWT_PUBLIC_KEY_PATH. Tried: ${publicKeyPath}`
    );
  }
}

const publicKey = resolvePublicKey();

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, publicKey, { algorithms: [jwtAlgorithm] }, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  });
};
