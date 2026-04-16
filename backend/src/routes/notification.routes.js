const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/notification.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.get('/', authenticate, NotificationController.getAll);
router.get('/unread', authenticate, NotificationController.getUnread);
router.get('/count', authenticate, NotificationController.getCount);
router.put('/:id/read', authenticate, NotificationController.markAsRead);

module.exports = router;
