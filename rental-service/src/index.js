import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import rentalRoutes from './routes/rentalRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || process.env.RENTAL_SERVICE_PORT || 3003;

app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log('MongoDB connection error:', err));

app.use('/api/rentals', rentalRoutes);

app.listen(PORT, () => {
  console.log(`Rental Service running on port ${PORT}`);
});
