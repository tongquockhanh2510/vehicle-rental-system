import express from 'express';
import userService from '../services/UserService.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

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

router.get('/by-role/:role', async (req, res) => {
  try {
    const users = await userService.getUsersByRole(req.params.role);
    res.json(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:userId/verify', async (req, res) => {
  try {
    const user = await userService.verifyUser(req.params.userId);
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:userId/kyc-status', async (req, res) => {
  try {
    const user = await userService.updateKycStatus(req.params.userId, req.body.status);
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
