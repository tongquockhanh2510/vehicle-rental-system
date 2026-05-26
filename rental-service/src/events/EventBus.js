import amqp from 'amqplib';

export class EventBus {
  async publish(eventType, eventData) {
    try {
      const connection = await amqp.connect(process.env.RABBITMQ_URI);
      const channel = await connection.createChannel();
      const exchange = 'rental_events';
      
      await channel.assertExchange(exchange, 'topic', { durable: true });
      await channel.publish(exchange, `rental.${eventType}`, Buffer.from(JSON.stringify(eventData)));
      
      await channel.close();
      await connection.close();
    } catch (error) {
      console.error('Event publication error:', error);
    }
  }

  async subscribe(eventType, callback) {
    try {
      const connection = await amqp.connect(process.env.RABBITMQ_URI);
      const channel = await connection.createChannel();
      const exchange = 'rental_events';
      const queue = `rental_${eventType}`;
      
      await channel.assertExchange(exchange, 'topic', { durable: true });
      await channel.assertQueue(queue, { durable: true });
      await channel.bindQueue(queue, exchange, `rental.${eventType}`);
      
      channel.consume(queue, async (msg) => {
        if (msg) {
          const eventData = JSON.parse(msg.content.toString());
          await callback(eventData);
          channel.ack(msg);
        }
      });
    } catch (error) {
      console.error('Event subscription error:', error);
    }
  }
}
