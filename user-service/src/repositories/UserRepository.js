import User from '../models/User.js';

export class UserRepository {
  async create(userData) {
    const user = new User(userData);
    return await user.save();
  }

  async findById(id) {
    return await User.findById(id);
  }

  async findByEmail(email) {
    return await User.findOne({ email: email.toLowerCase() });
  }

  async update(id, updateData) {
    return await User.findByIdAndUpdate(
      id,
      { ...updateData, updated_at: new Date() },
      { new: true }
    );
  }

  async findAll(filters = {}) {
    return await User.find(filters);
  }

  async findByRole(role) {
    return await User.find({ role });
  }

  async delete(id) {
    return await User.findByIdAndDelete(id);
  }
}
