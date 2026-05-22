import express from 'express';
import notificationService from '../services/NotificationService.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

router.get('/my-notifications', authenticateToken, async (req, res) => {
  try {
    const notifications = await notificationService.getNotifications(req.userId);
    res.json(notifications);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/unread', authenticateToken, async (req, res) => {
  try {
    const unread = await notificationService.getUnreadNotifications(req.userId);
    res.json(unread);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:notificationId/read', async (req, res) => {
  try {
    const notification = await notificationService.markAsRead(req.params.notificationId);
    res.json(notification);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/mark-all-read', authenticateToken, async (req, res) => {
  try {
    await notificationService.markAllAsRead(req.userId);
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
