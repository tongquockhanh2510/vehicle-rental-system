import amqp from 'amqplib';

export class EventBus {
  async publish(eventType, eventData) {
    try {
      const connection = await amqp.connect(process.env.RABBITMQ_URI || 'amqp://localhost');
      const channel = await connection.createChannel();
      const exchange = 'payment_events';
      
      await channel.assertExchange(exchange, 'topic', { durable: true });
      await channel.publish(exchange, `payment.${eventType}`, Buffer.from(JSON.stringify(eventData)));
      
      await channel.close();
      await connection.close();
    } catch (error) {
      console.error('Event publication error:', error);
    }
  }
}
