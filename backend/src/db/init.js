const mysql = require('mysql2/promise');

async function initDatabase() {
  let connection;

  try {
    // Connect without database first
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'rootpassword'
    });

    console.log('Connected to MySQL server');

    // Create database if not exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'vehicle_rental'}`);
    console.log(`Database '${process.env.DB_NAME || 'vehicle_rental'}' created or already exists`);

    // Use the database
    await connection.query(`USE ${process.env.DB_NAME || 'vehicle_rental'}`);

    // Create tables
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        fullname VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        role ENUM('customer', 'admin', 'owner') DEFAULT 'customer',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role (role)
      )
    `);
    console.log('Table users created');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        owner_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        brand VARCHAR(100),
        license_plate VARCHAR(50),
        price_per_day DECIMAL(10, 2) NOT NULL,
        status ENUM('available', 'rented', 'maintenance') DEFAULT 'available',
        description TEXT,
        image_url VARCHAR(500),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_type (type),
        INDEX idx_status (status),
        INDEX idx_owner (owner_id)
      )
    `);
    console.log('Table vehicles created');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        vehicle_id INT NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        total_price DECIMAL(10, 2) NOT NULL,
        status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
        INDEX idx_user (user_id),
        INDEX idx_vehicle (vehicle_id),
        INDEX idx_status (status)
      )
    `);
    console.log('Table bookings created');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        booking_id INT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        method VARCHAR(50) DEFAULT 'credit_card',
        status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
        transaction_id VARCHAR(255),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
        INDEX idx_booking (booking_id),
        INDEX idx_status (status)
      )
    `);
    console.log('Table payments created');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT,
        type VARCHAR(50) DEFAULT 'general',
        is_read BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user (user_id),
        INDEX idx_is_read (is_read)
      )
    `);
    console.log('Table notifications created');

    // Insert sample data
    const bcrypt = require('bcryptjs');
    
    // Check if admin exists
    const [admins] = await connection.query('SELECT id FROM users WHERE email = ?', ['admin@vehicle.com']);
    
    if (admins.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      // Create admin
      await connection.query(
        'INSERT INTO users (email, password, fullname, phone, role) VALUES (?, ?, ?, ?, ?)',
        ['admin@vehicle.com', hashedPassword, 'Admin', '0123456789', 'admin']
      );
      
      // Create owner
      const ownerPassword = await bcrypt.hash('owner123', 10);
      await connection.query(
        'INSERT INTO users (email, password, fullname, phone, role) VALUES (?, ?, ?, ?, ?)',
        ['owner@vehicle.com', ownerPassword, 'Vehicle Owner', '0987654321', 'owner']
      );
      
      // Create customer
      const customerPassword = await bcrypt.hash('customer123', 10);
      await connection.query(
        'INSERT INTO users (email, password, fullname, phone, role) VALUES (?, ?, ?, ?, ?)',
        ['customer@vehicle.com', customerPassword, 'Test Customer', '0369852147', 'customer']
      );
      
      console.log('Sample users created');
      
      // Get owner ID
      const [owners] = await connection.query('SELECT id FROM users WHERE role = ?', ['owner']);
      const ownerId = owners[0].id;
      
      // Insert sample vehicles
      const vehicles = [
        ['Toyota Camry 2023', 'car', 'Toyota', '30A-12345', 50.00, 'Sedan comfortable, full option', 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400'],
        ['Honda Civic 2022', 'car', 'Honda', '30B-67890', 45.00, 'Compact car, fuel efficient', 'https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=400'],
        ['Yamaha MT-15', 'motorcycle', 'Yamaha', '29A-11111', 20.00, 'Sport motorcycle, 155cc', 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=400'],
        ['Vespa Primavera', 'motorcycle', 'Vespa', '29B-22222', 25.00, 'Classic scooter, perfect for city', 'https://images.unsplash.com/photo-1605693919155-a55c56ab9876?w=400'],
        ['Mercedes C300 2023', 'car', 'Mercedes-Benz', '30C-33333', 120.00, 'Luxury sedan, premium features', 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400'],
        ['BMW X3 2023', 'car', 'BMW', '30D-44444', 150.00, 'SUV, all-wheel drive', 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400']
      ];
      
      for (const v of vehicles) {
        await connection.query(
          'INSERT INTO vehicles (owner_id, name, type, brand, license_plate, price_per_day, description, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [ownerId, ...v]
        );
      }
      
      console.log('Sample vehicles created');
    }

    console.log('Database initialization completed successfully!');
    console.log('\nSample accounts:');
    console.log('Admin: admin@vehicle.com / admin123');
    console.log('Owner: owner@vehicle.com / owner123');
    console.log('Customer: customer@vehicle.com / customer123');

  } catch (err) {
    console.error('Database initialization error:', err.message);
    throw err;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run if called directly
if (require.main === module) {
  require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
  initDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = initDatabase;
