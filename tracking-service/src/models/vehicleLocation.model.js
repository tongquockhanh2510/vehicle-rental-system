import mongoose from 'mongoose';

const vehicleLocationSchema = new mongoose.Schema(
  {
    vehicle_id: { type: String, required: true, index: true },
    rental_id: { type: String, required: true, index: true },
    contract_id: { type: String, required: true, index: true },
    owner_id: { type: String, required: true, index: true },
    renter_id: { type: String, required: true, index: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    speed: { type: Number, default: 0 },
    heading: { type: Number, default: null },
    address: { type: String, default: '' },
    is_out_of_boundary: { type: Boolean, default: false },
    last_updated_at: { type: Date, default: Date.now }
  },
  {
    collection: 'vehicle_locations',
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    },
    versionKey: false
  }
);

export default mongoose.model('VehicleLocation', vehicleLocationSchema);
