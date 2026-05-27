import amqp from 'amqplib';

export class EventBus {
  async publish(eventType, eventData) {
    try {
      const connection = await amqp.connect(process.env.RABBITMQ_URI);
      const channel = await connection.createChannel();
      const exchange = 'notification_events';

      await channel.assertExchange(exchange, 'topic', { durable: true });
      await channel.publish(exchange, `notification.${eventType}`, Buffer.from(JSON.stringify(eventData)));

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
      const exchanges = ['rental_events', 'payment_events', 'tracking_events', 'dispute_events'];

      for (const exchange of exchanges) {
        const queue = `notification_${eventType}`;

        try {
          await channel.assertExchange(exchange, 'topic', { durable: true });
          await channel.assertQueue(queue, { durable: true });
          await channel.bindQueue(queue, exchange, `*.${eventType}`);

          channel.consume(queue, async (msg) => {
            if (msg) {
              const eventData = JSON.parse(msg.content.toString());
              await callback(eventData);
              channel.ack(msg);
            }
          });
        } catch (err) {
          // Exchange might not exist yet
        }
      }
    } catch (error) {
      console.error('Event subscription error:', error);
    }
  }
}
