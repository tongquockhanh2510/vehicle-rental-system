import express from 'express';
import userService from '../services/UserService.js';
import { authenticateToken } from '../middlewares/auth.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

function isAdmin(req) {
  return String(req.userRole || '').toUpperCase() === 'ADMIN';
}

router.post('/register', async (req, res) => {
  try {
    const result = await userService.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await userService.login(email, password);
    res.json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const result = await userService.listUsersForAdmin(req.query || {});
    return res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to fetch users' });
  }
});

router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await userService.getUserProfile(req.userId);
    res.json(user);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await userService.updateProfile(req.userId, req.body);
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/verify-personal-information', authenticateToken, upload.fields([
  { name: 'id_image_front', maxCount: 1 },
  { name: 'id_image_back', maxCount: 1 }
]), async (req, res) => {
  try {
    const result = await userService.verifyPersonalInformation(req.userId, req.body, req.files, req.headers.authorization);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/:userId', authenticateToken, async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const data = await userService.getUserDetailForAdmin(req.params.userId);
    return res.json({
      success: true,
      data
    });
  } catch (error) {
    if (String(error.message || '').toLowerCase().includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: error.message || 'Failed to fetch user detail' });
  }
});

export default router;
