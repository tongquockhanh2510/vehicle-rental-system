const db = require('../config/database');

const PaymentModel = {
  async findByBookingId(bookingId) {
    return await db.query('SELECT * FROM payments WHERE booking_id = ?', [bookingId]);
  },

  async findById(id) {
    const results = await db.query('SELECT * FROM payments WHERE id = ?', [id]);
    return results[0];
  },

  async create({ booking_id, amount, method = 'credit_card' }) {
    const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const result = await db.query(
      `INSERT INTO payments (booking_id, amount, method, status, transaction_id)
       VALUES (?, ?, ?, 'pending', ?)`,
      [booking_id, amount, method, transactionId]
    );
    return { id: result.insertId, transaction_id: transactionId };
  },

  async updateStatus(id, status) {
    await db.query('UPDATE payments SET status = ? WHERE id = ?', [status, id]);
    return this.findById(id);
  },

  async getAll(userId = null) {
    let sql = `SELECT p.*, b.start_date, b.end_date, v.name as vehicle_name
               FROM payments p
               LEFT JOIN bookings b ON p.booking_id = b.id
               LEFT JOIN vehicles v ON b.vehicle_id = v.id`;
    const params = [];

    if (userId) {
      sql += ' WHERE b.user_id = ?';
      params.push(userId);
    }

    sql += ' ORDER BY p.created_at DESC';
    return await db.query(sql, params);
  }
};

module.exports = PaymentModel;
