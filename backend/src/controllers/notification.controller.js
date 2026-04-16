const NotificationModel = require('../models/notification.model');

const NotificationController = {
  async getAll(req, res, next) {
    try {
      const notifications = await NotificationModel.findByUserId(req.user.id);
      res.json(notifications);
    } catch (err) {
      next(err);
    }
  },

  async getUnread(req, res, next) {
    try {
      const notifications = await NotificationModel.findUnread(req.user.id);
      res.json(notifications);
    } catch (err) {
      next(err);
    }
  },

  async markAsRead(req, res, next) {
    try {
      const { id } = req.params;
      await NotificationModel.markAsRead(id);
      res.json({ message: 'Notification marked as read' });
    } catch (err) {
      next(err);
    }
  },

  async getCount(req, res, next) {
    try {
      const count = await NotificationModel.getCount(req.user.id);
      res.json({ unread_count: count });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = NotificationController;
