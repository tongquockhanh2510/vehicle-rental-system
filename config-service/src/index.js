import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.CONFIG_SERVICE_PORT || 3000;

app.use(express.json());

// Config endpoints
app.get('/api/config/database', (req, res) => {
  res.json({
    mongodb: {
      uri: process.env.MONGODB_URI || 'mongodb://admin:password@mongodb-vehicle-rental:27017/redis_vehicle_db?authSource=admin'
    }
  });
});

app.get('/api/config/rabbitmq', (req, res) => {
  res.json({
    rabbitmq: {
      uri: process.env.RABBITMQ_URI || 'amqp://admin:password@rabbitmq-vehicle-rental:5672'
    }
  });
});

app.get('/api/config/redis', (req, res) => {
  res.json({
    redis: {
      host: process.env.REDIS_HOST || 'redis-vehicle-rental',
      port: process.env.REDIS_PORT || 6379
    }
  });
});

app.get('/api/config/jwt', (req, res) => {
  res.json({
    jwt: {
      secret: process.env.JWT_SECRET || 'your-secret-key',
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    }
  });
});

app.get('/api/config/system', (req, res) => {
  res.json({
    system: {
      platform_fee_percentage: 0.04,
      cancellation_fee_percentage: 0.20
    }
  });
});

app.listen(PORT, () => {
  console.log(`Config Service running on port ${PORT}`);
});
