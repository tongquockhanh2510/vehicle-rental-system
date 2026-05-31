import mongoose from 'mongoose';

export const connectDb = async () => {
  const mongoUri =
    process.env.MONGO_URI ||
    process.env.MONGODB_URI ||
    'mongodb://localhost:27017/redis_vehicle_db';

  await mongoose.connect(mongoUri);
  console.log('Tracking Service connected to MongoDB');
};
