const db = require('../config/database');

const UserModel = {
  async findByEmail(email) {
    const results = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return results[0];
  },

  async findById(id) {
    const results = await db.query('SELECT id, email, fullname, phone, role, created_at FROM users WHERE id = ?', [id]);
    return results[0];
  },

  async create({ email, password, fullname, phone, role = 'customer' }) {
    const result = await db.query(
      'INSERT INTO users (email, password, fullname, phone, role) VALUES (?, ?, ?, ?, ?)',
      [email, password, fullname, phone, role]
    );
    return { id: result.insertId, email, fullname, phone, role };
  },

  async getAll() {
    return await db.query('SELECT id, email, fullname, phone, role, created_at FROM users');
  }
};

module.exports = UserModel;
