import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import imageRoutes from './routes/imageRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.IMAGE_SERVICE_PORT || 3007;

// Middleware
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/redis_vehicle_db?authSource=admin')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log('MongoDB connection error:', err));

// Routes
app.use('/api/images', imageRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Image Service is running' });
});

app.listen(PORT, () => {
  console.log(`Image Service running on port ${PORT}`);
});
