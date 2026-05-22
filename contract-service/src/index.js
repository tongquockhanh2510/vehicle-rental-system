import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import contractRoutes from './routes/contractRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.CONTRACT_SERVICE_PORT || 3004;

app.use(express.json());

mongoose.connect(process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/redis_vehicle_db?authSource=admin')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log('MongoDB connection error:', err));

app.use('/api/contracts', contractRoutes);

app.listen(PORT, () => {
  console.log(`Contract Service running on port ${PORT}`);
});
