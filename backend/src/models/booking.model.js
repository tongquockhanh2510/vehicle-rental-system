const db = require('../config/database');

const BookingModel = {
  async findAll(userId = null, role = 'customer') {
    let sql = `SELECT b.*, v.name as vehicle_name, v.image_url, v.type as vehicle_type,
               u.fullname as customer_name
               FROM bookings b
               LEFT JOIN vehicles v ON b.vehicle_id = v.id
               LEFT JOIN users u ON b.user_id = u.id WHERE 1=1`;
    const params = [];

    if (role === 'customer' && userId) {
      sql += ' AND b.user_id = ?';
      params.push(userId);
    }

    sql += ' ORDER BY b.created_at DESC';
    return await db.query(sql, params);
  },

  async findById(id) {
    const results = await db.query(
      `SELECT b.*, v.name as vehicle_name, v.image_url, v.type as vehicle_type, v.price_per_day,
              u.fullname as customer_name, u.email as customer_email
       FROM bookings b
       LEFT JOIN vehicles v ON b.vehicle_id = v.id
       LEFT JOIN users u ON b.user_id = u.id
       WHERE b.id = ?`,
      [id]
    );
    return results[0];
  },

  async create({ user_id, vehicle_id, start_date, end_date, total_price }) {
    const result = await db.query(
      `INSERT INTO bookings (user_id, vehicle_id, start_date, end_date, total_price, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [user_id, vehicle_id, start_date, end_date, total_price]
    );
    return { id: result.insertId };
  },

  async updateStatus(id, status) {
    await db.query('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);
    return this.findById(id);
  },

  async delete(id) {
    return await db.query('DELETE FROM bookings WHERE id = ?', [id]);
  }
};

module.exports = BookingModel;
