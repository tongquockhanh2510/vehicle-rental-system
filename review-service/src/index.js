import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import reviewRoutes from './routes/reviewRoutes.js';
import Review from './models/Review.js';

dotenv.config();

const app = express();
const PORT = process.env.REVIEW_SERVICE_PORT || 3009;

app.use(express.json());

mongoose.connect(process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/redis_vehicle_db?authSource=admin')
  .then(async () => {
    console.log('Connected to MongoDB');
    try {
      await Review.syncIndexes();
    } catch (error) {
      console.log('Review index sync warning:', error.message);
    }
  })
  .catch(err => console.log('MongoDB connection error:', err));

app.use('/api/reviews', reviewRoutes);

app.listen(PORT, () => {
  console.log(`Review Service running on port ${PORT}`);
});
