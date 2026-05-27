import { DisputeRepository } from '../repositories/DisputeRepository.js';
import { EventBus } from '../events/EventBus.js';
import axios from 'axios';

const disputeRepository = new DisputeRepository();
const eventBus = new EventBus();

export class DisputeService {
  async createDispute(disputeData, userId, authHeader) {
    const contractId = disputeData.contract_id;
    const contractResponse = await axios.get(`${process.env.CONTRACT_SERVICE_URL}/contracts/${contractId}`, {
      headers: { 'Authorization': authHeader }
    });

    const contract = await contractResponse.data;
    if (contract.renter_id.toString() !== userId) {
      throw new Error('Unauthorized: Only the renter can create a dispute for this contract');
    }

    const dispute = await disputeRepository.create({
      contract_id: contractId,
      owner_id: contract.owner_id,
      renter_id: contract.renter_id,
      vehicle_id: contract.vehicle_id,
      claimed_amount: disputeData.claimed_amount,
      description: disputeData.description,
      pickup_location: contract.pickup_location,
      pickup_date: contract.pickup_date,
      pickup_images: contract.pickup_images,
      return_location: contract.return_location,
      return_date: contract.return_date,
      return_images: contract.return_images,
      status: 'PENDING'
    });


    await eventBus.publish('dispute_created', {
      disputeId: dispute._id,
      ownerId: dispute.owner_id,
      renterId: dispute.renter_id,
      claimedAmount: dispute.claimed_amount
    });

    return dispute;
  }

  async getDisputeById(disputeId) {
    return await disputeRepository.findById(disputeId);
  }

  async updateDispute(disputeId, updateData) {
    return await disputeRepository.update(disputeId, updateData);
  }

  async approveDispute(disputeId, adminId, decisionAmount, adminNotes) {
    const dispute = await disputeRepository.update(disputeId, {
      status: 'APPROVED',
      admin_decision_amount: decisionAmount,
      admin_notes: adminNotes,
      admin_reviewed_by: adminId,
      reviewed_at: new Date()
    });

    await eventBus.publish('dispute_approved', {
      disputeId: dispute._id,
      renterId: dispute.renter_id,
      compensationAmount: decisionAmount
    });

    return dispute;
  }

  async rejectDispute(disputeId, adminId, adminNotes) {
    const dispute = await disputeRepository.update(disputeId, {
      status: 'REJECTED',
      admin_notes: adminNotes,
      admin_reviewed_by: adminId,
      reviewed_at: new Date()
    });

    await eventBus.publish('dispute_rejected', {
      disputeId: dispute._id,
      renterId: dispute.renter_id
    });

    return dispute;
  }

  async resolveDispute(disputeId) {
    const dispute = await disputeRepository.update(disputeId, {
      status: 'RESOLVED',
      resolved_at: new Date()
    });

    await eventBus.publish('dispute_resolved', {
      disputeId: dispute._id
    });

    return dispute;
  }

  async getPendingDisputes() {
    return await disputeRepository.findByStatus('PENDING');
  }
  async getApprovedDisputes() {
    return await disputeRepository.findByStatus('APPROVED');
  }
  async getRejectedDisputes() {
    return await disputeRepository.findByStatus('REJECTED');
  }
  async getDisputesByOwner(ownerId) {
    return await disputeRepository.findByOwnerId(ownerId);
  }

  async getDisputesByRenter(renterId) {
    return await disputeRepository.findByRenterId(renterId);
  }
}

export default new DisputeService();
