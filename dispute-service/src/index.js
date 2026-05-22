import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import disputeRoutes from './routes/disputeRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.DISPUTE_SERVICE_PORT || 3008;

app.use(express.json());

mongoose.connect(process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/redis_vehicle_db?authSource=admin')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log('MongoDB connection error:', err));

app.use('/api/disputes', disputeRoutes);

app.listen(PORT, () => {
  console.log(`Dispute Service running on port ${PORT}`);
});
