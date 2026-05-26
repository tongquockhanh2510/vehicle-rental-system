import { ContractRepository } from '../repositories/ContractRepository.js';
import { EventBus } from '../events/EventBus.js';
import axios from 'axios';
import amqp from 'amqplib';

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
    await eventBus.subscribe('rental_confirmed', async (data) => {
      try {
        const contract = await contractRepository.create({
          rental_request_id: data.rentalId,
          renter_id: data.renterId,
          owner_id: data.ownerId,
          vehicle_id: data.vehicleId,
          rental_start_date: data.rentalStartDate,
          rental_end_date: data.rentalEndDate,
          daily_rate: data.dailyRate,
          total_days: data.totalDays,
          rental_cost: data.totalAmount,
          deposit_amount: data.depositAmount,
          platform_fee: data.platformFee,
          total_cost: data.totalAmount + data.depositAmount,
          status: 'ACTIVE'
        });

        console.log('Contract created:', contract._id);
      } catch (err) {
        console.error('Failed to create contract:', err.message);
      }
    });
  }
}

export default new ContractService();
