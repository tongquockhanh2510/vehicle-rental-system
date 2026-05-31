import './env.js';
import express from 'express';
import mongoose from 'mongoose';
import vehicleRoutes from './routes/vehicleRoutes.js';

const app = express();
const PORT = process.env.VEHICLE_SERVICE_PORT;

app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log('MongoDB connection error:', err));

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'vehicle-service',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.use('/api/vehicles', vehicleRoutes);

app.listen(PORT, () => {
  console.log(`Vehicle Service running on port ${PORT}`);
});
