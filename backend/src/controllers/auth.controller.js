const AuthService = require('../services/auth.service');
const UserModel = require('../models/user.model');

const AuthController = {
  async register(req, res, next) {
    try {
      const { email, password, fullname, phone, role } = req.body;

      if (!email || !password || !fullname) {
        return res.status(400).json({ error: 'Email, password and fullname are required' });
      }

      const result = await AuthService.register({ email, password, fullname, phone, role });
      res.status(201).json(result);
    } catch (err) {
      if (err.message === 'Email already registered') {
        return res.status(409).json({ error: err.message });
      }
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const result = await AuthService.login({ email, password });
      res.json(result);
    } catch (err) {
      if (err.message === 'Invalid email or password') {
        return res.status(401).json({ error: err.message });
      }
      next(err);
    }
  },

  async getMe(req, res, next) {
    try {
      const user = await UserModel.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (err) {
      next(err);
    }
  }
};

module.exports = AuthController;
