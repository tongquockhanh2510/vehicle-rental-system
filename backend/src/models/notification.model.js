const db = require('../config/database');

const NotificationModel = {
  async findByUserId(userId) {
    return await db.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
  },

  async findUnread(userId) {
    return await db.query(
      'SELECT * FROM notifications WHERE user_id = ? AND is_read = FALSE ORDER BY created_at DESC',
      [userId]
    );
  },

  async create({ user_id, title, message, type = 'general' }) {
    const result = await db.query(
      `INSERT INTO notifications (user_id, title, message, type, is_read)
       VALUES (?, ?, ?, ?, FALSE)`,
      [user_id, title, message, type]
    );
    return { id: result.insertId };
  },

  async markAsRead(id) {
    await db.query('UPDATE notifications SET is_read = TRUE WHERE id = ?', [id]);
  },

  async getCount(userId) {
    const results = await db.query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [userId]
    );
    return results[0].count;
  }
};

module.exports = NotificationModel;
