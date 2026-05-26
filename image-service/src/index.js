import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import imageRoutes from './routes/imageRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.IMAGE_SERVICE_PORT;

app.use(express.json());
app.use('/api/images', imageRoutes);
app.get('/health', (req, res) => {
  res.json({ status: 'Image Service is running' });
});

app.listen(PORT, () => {
  console.log(`Image Service running on port ${PORT}`);
});
