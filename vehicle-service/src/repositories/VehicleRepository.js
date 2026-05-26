import Vehicle from '../models/Vehicle.js';

export class VehicleRepository {
  async create(vehicleData) {
    const vehicle = new Vehicle(vehicleData);
    return await vehicle.save();
  }

  async findById(id) {
    return await Vehicle.findById(id);
  }

  async update(id, updateData) {
    return await Vehicle.findByIdAndUpdate(
      id,
      { ...updateData, updated_at: new Date() },
      { new: true }
    );
  }

  async findByOwnerId(ownerId, page = 1, limit = 10, sort = '-created_at') {
    const skip = (page - 1) * limit;
    const total = await Vehicle.countDocuments({ owner_id: ownerId });
    const data = await Vehicle.find({ owner_id: ownerId })
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    return {
      data,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async findAvailable(filters = {}, page = 1, limit = 10, sort = '-created_at') {
    const skip = (page - 1) * limit;
    const query = { is_available: true, ...filters };
    const total = await Vehicle.countDocuments(query);
    const data = await Vehicle.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    return {
      data,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async findAll(filters = {}, page = 1, limit = 10, sort = '-created_at') {
    const skip = (page - 1) * limit;
    const total = await Vehicle.countDocuments(filters);
    const data = await Vehicle.find(filters)
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    return {
      data,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async delete(id) {
    return await Vehicle.findByIdAndDelete(id);
  }
}
