import amqp from 'amqplib';

let connection;
let channel;

export const connectRabbitMq = async () => {
  try {
    const rabbitMqUrl =
      process.env.RABBITMQ_URL ||
      process.env.RABBITMQ_URI ||
      'amqp://localhost';
    const exchange = process.env.RABBITMQ_EXCHANGE || 'vehicle_rental_events';

    connection = await amqp.connect(rabbitMqUrl);
    channel = await connection.createChannel();
    await channel.assertExchange(exchange, 'topic', { durable: true });

    console.log('Tracking Service connected to RabbitMQ');
  } catch (error) {
    console.error('RabbitMQ connection error:', error.message);
  }
};

export const getRabbitMqChannel = () => channel;

export const disconnectRabbitMq = async () => {
  if (channel) {
    await channel.close();
    channel = null;
  }

  if (connection) {
    await connection.close();
    connection = null;
  }
};
