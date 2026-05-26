import { ContractRepository } from '../repositories/ContractRepository.js';
import { EventBus } from '../events/EventBus.js';

const contractRepository = new ContractRepository();
const eventBus = new EventBus();

export class ContractService {
  async createContract(contractData) {
    const contract = await contractRepository.create(contractData);

    await eventBus.publish('contract_created', {
      contractId: contract._id,
      rentalRequestId: contract.rental_request_id,
      renterId: contract.renter_id,
      ownerId: contract.owner_id
    });

    return contract;
  }

  async getContractById(contractId) {
    return await contractRepository.findById(contractId);
  }

  async updateContract(contractId, updateData) {
    const contract = await contractRepository.update(contractId, updateData);

    await eventBus.publish('contract_updated', {
      contractId: contract._id,
      status: contract.status
    });

    return contract;
  }

  async completeContract(contractId) {
    return await this.updateContract(contractId, { status: 'COMPLETED' });
  }

  async cancelContract(contractId, cancelledBy, reason) {
    const contract = await contractRepository.findById(contractId);

    // Calculate refund based on who cancelled
    let refundAmount = contract.deposit_amount;
    let cancellationFeeAmount = 0;

    if (cancelledBy === 'OWNER') {
      // Owner cancels: return full deposit minus 20% of contract value
      cancellationFeeAmount = contract.total_cost * 0.20;
      refundAmount = contract.deposit_amount - cancellationFeeAmount;
    } else if (cancelledBy === 'RENTER') {
      // Renter cancels: return deposit minus 20% of contract value
      cancellationFeeAmount = contract.total_cost * 0.20;
      refundAmount = contract.deposit_amount - cancellationFeeAmount;
    }

    const updatedContract = await contractRepository.update(contractId, {
      status: 'CANCELLED',
      cancellation_fee_applied: true,
      cancellation_fee_amount: cancellationFeeAmount,
      refund_amount: refundAmount,
      cancellation_reason: reason,
      cancelled_by: cancelledBy,
      cancelled_at: new Date()
    });

    await eventBus.publish('contract_cancelled', {
      contractId: updatedContract._id,
      renterId: updatedContract.renter_id,
      refundAmount,
      cancellationFee: cancellationFeeAmount
    });

    return updatedContract;
  }

  async getRenterContracts(renterId) {
    return await contractRepository.findByRenterId(renterId);
  }

  async getOwnerContracts(ownerId) {
    return await contractRepository.findByOwnerId(ownerId);
  }

  async subscribeToEvents() {
    this.subscribeToEvent('rental_confirmed', async (data) => {
      const rentalRequest = await axios.get(`${process.env.RENTAL_SERVICE_URL}/api/rentals/${data.rentalId}`)
      const contract = await contractRepository.create({
        ...rentalRequest,
        rental_request_id: data.rentalId,
        status: 'ACTIVE'
      });
    });
  }

  async subscribeToEvent(eventType, callback) {
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

export default new ContractService();
