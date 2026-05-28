import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import { createClient } from 'redis';
import { createStatisticsRoutes } from './routes/statisticsRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.STATISTIC_SERVICE_PORT || 3011;

app.use(express.json());

let redisClient = null;

if (process.env.REDIS_URL) {
  redisClient = createClient({ url: process.env.REDIS_URL });
  redisClient.on('error', (err) => {
    console.error('Redis error:', err.message);
  });
}

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'statistic-service',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    redis: redisClient?.isOpen ? 'connected' : 'disconnected'
  });
});

app.use('/api/statistics', createStatisticsRoutes(redisClient));

const bootstrap = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    if (redisClient) {
      await redisClient.connect();
      console.log('Connected to Redis');
    }

    app.listen(PORT, () => {
      console.log(`Statistic Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start statistic service:', error.message);
    process.exit(1);
  }
};

bootstrap();
