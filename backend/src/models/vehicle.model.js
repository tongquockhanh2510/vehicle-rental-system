const db = require('../config/database');

const VehicleModel = {
  async findAll(filters = {}) {
    let sql = 'SELECT v.*, u.fullname as owner_name FROM vehicles v LEFT JOIN users u ON v.owner_id = u.id WHERE 1=1';
    const params = [];

    if (filters.type) {
      sql += ' AND v.type = ?';
      params.push(filters.type);
    }
    if (filters.status) {
      sql += ' AND v.status = ?';
      params.push(filters.status);
    }
    if (filters.search) {
      sql += ' AND (v.name LIKE ? OR v.brand LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    sql += ' ORDER BY v.created_at DESC';
    return await db.query(sql, params);
  },

  async findById(id) {
    const results = await db.query(
      'SELECT v.*, u.fullname as owner_name FROM vehicles v LEFT JOIN users u ON v.owner_id = u.id WHERE v.id = ?',
      [id]
    );
    return results[0];
  },

  async create({ owner_id, name, type, brand, license_plate, price_per_day, description, image_url }) {
    const result = await db.query(
      `INSERT INTO vehicles (owner_id, name, type, brand, license_plate, price_per_day, description, image_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'available')`,
      [owner_id, name, type, brand, license_plate, price_per_day, description, image_url]
    );
    return { id: result.insertId };
  },

  async update(id, data) {
    const fields = [];
    const params = [];

    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && key !== 'id' && key !== 'owner_id') {
        fields.push(`${key} = ?`);
        params.push(data[key]);
      }
    });

    if (fields.length > 0) {
      params.push(id);
      await db.query(`UPDATE vehicles SET ${fields.join(', ')} WHERE id = ?`, params);
    }
    return this.findById(id);
  },

  async delete(id) {
    return await db.query('DELETE FROM vehicles WHERE id = ?', [id]);
  },

  async getByOwner(ownerId) {
    return await db.query('SELECT * FROM vehicles WHERE owner_id = ?', [ownerId]);
  }
};

module.exports = VehicleModel;
