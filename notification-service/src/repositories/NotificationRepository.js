import Notification from '../models/Notification.js';

export class NotificationRepository {
  async create(notificationData) {
    const notification = new Notification(notificationData);
    return await notification.save();
  }

  async findById(id) {
    return await Notification.findById(id);
  }

  async update(id, updateData) {
    return await Notification.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
  }

  async findByUserId(userId) {
    return await Notification.find({ user_id: userId }).sort({ created_at: -1 });
  }

  async findUnreadByUserId(userId) {
    return await Notification.find({ user_id: userId, is_read: false }).sort({ created_at: -1 });
  }

  async markAsRead(id) {
    return await Notification.findByIdAndUpdate(
      id,
      { is_read: true, read_at: new Date() },
      { new: true }
    );
  }

  async markAllAsRead(userId) {
    return await Notification.updateMany(
      { user_id: userId, is_read: false },
      { is_read: true, read_at: new Date() }
    );
  }
}
