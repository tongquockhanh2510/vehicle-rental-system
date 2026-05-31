import 'dotenv/config';
import app from './app.js';
import { connectDb } from './config/db.js';
import { connectRedis, disconnectRedis } from './config/redis.js';
import { connectRabbitMq, disconnectRabbitMq } from './config/rabbitmq.js';

const PORT = process.env.PORT || process.env.TRACKING_SERVICE_PORT || 5005;

const startServer = async () => {
  await connectDb();
  await connectRedis();
  await connectRabbitMq();

  const server = app.listen(PORT, () => {
    console.log(`Tracking Service running on port ${PORT}`);
  });

  const shutdown = async () => {
    console.log('Shutting down Tracking Service...');
    server.close(async () => {
      await disconnectRabbitMq();
      await disconnectRedis();
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
};

startServer().catch((error) => {
  console.error('Failed to start Tracking Service:', error);
  process.exit(1);
});
