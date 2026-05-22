import { DisputeRepository } from '../repositories/DisputeRepository.js';
import { EventBus } from '../events/EventBus.js';

const disputeRepository = new DisputeRepository();
const eventBus = new EventBus();

export class DisputeService {
  async createDispute(disputeData) {
    const dispute = await disputeRepository.create(disputeData);

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

  async getDisputesByOwner(ownerId) {
    return await disputeRepository.findByOwnerId(ownerId);
  }

  async getDisputesByRenter(renterId) {
    return await disputeRepository.findByRenterId(renterId);
  }
}

export default new DisputeService();
