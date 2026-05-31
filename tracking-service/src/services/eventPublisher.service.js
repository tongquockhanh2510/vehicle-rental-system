import { getRabbitMqChannel } from '../config/rabbitmq.js';

const EXCHANGE = process.env.RABBITMQ_EXCHANGE || 'vehicle_rental_events';
const OUT_OF_BOUNDARY_ROUTING_KEY = 'vehicle.out_of_boundary';

export const publishVehicleOutOfBoundary = async (payload) => {
  const channel = getRabbitMqChannel();

  if (!channel) {
    console.error('RabbitMQ channel is not available. Event was not published.');
    return false;
  }

  const eventPayload = {
    event_type: OUT_OF_BOUNDARY_ROUTING_KEY,
    ...payload
  };

  channel.publish(
    EXCHANGE,
    OUT_OF_BOUNDARY_ROUTING_KEY,
    Buffer.from(JSON.stringify(eventPayload)),
    {
      contentType: 'application/json',
      persistent: true
    }
  );

  return true;
};
