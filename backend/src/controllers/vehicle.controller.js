const VehicleModel = require('../models/vehicle.model');

const VehicleController = {
  async getAll(req, res, next) {
    try {
      const { type, status, search } = req.query;
      const vehicles = await VehicleModel.findAll({ type, status, search });
      res.json(vehicles);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const vehicle = await VehicleModel.findById(id);
      if (!vehicle) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }
      res.json(vehicle);
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const vehicle = await VehicleModel.create({
        owner_id: req.user.id,
        ...req.body
      });
      res.status(201).json(vehicle);
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const vehicle = await VehicleModel.findById(id);

      if (!vehicle) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }

      if (vehicle.owner_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized to update this vehicle' });
      }

      const updated = await VehicleModel.update(id, req.body);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const vehicle = await VehicleModel.findById(id);

      if (!vehicle) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }

      if (vehicle.owner_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized to delete this vehicle' });
      }

      await VehicleModel.delete(id);
      res.json({ message: 'Vehicle deleted successfully' });
    } catch (err) {
      next(err);
    }
  },

  async getMyVehicles(req, res, next) {
    try {
      const vehicles = await VehicleModel.getByOwner(req.user.id);
      res.json(vehicles);
    } catch (err) {
      next(err);
    }
  }
};

module.exports = VehicleController;
