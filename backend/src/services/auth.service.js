const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/user.model');

const AuthService = {
  async register({ email, password, fullname, phone, role = 'customer' }) {
    // Check if user exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await UserModel.create({
      email,
      password: hashedPassword,
      fullname,
      phone,
      role
    });

    // Generate token
    const token = this.generateToken(user);

    return { user, token };
  },

  async login({ email, password }) {
    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullname: user.fullname,
        phone: user.phone,
        role: user.role
      },
      token
    };
  },

  generateToken(user) {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'super-secret-key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  },

  verifyToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET || 'super-secret-key');
  }
};

module.exports = AuthService;
