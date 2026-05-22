import { InspectionRepository } from '../repositories/InspectionRepository.js';

const inspectionRepository = new InspectionRepository();

export class InspectionService {
  async createInspection(inspectionData) {
    return await inspectionRepository.create(inspectionData);
  }

  async getInspectionById(inspectionId) {
    return await inspectionRepository.findById(inspectionId);
  }

  async updateInspection(inspectionId, updateData) {
    return await inspectionRepository.update(inspectionId, updateData);
  }

  async approveInspection(inspectionId, ownerApprovalNotes) {
    return await inspectionRepository.update(inspectionId, {
      approved_by_owner: true,
      owner_approval_notes: ownerApprovalNotes
    });
  }

  async getInspectionsByRentalRequest(rentalRequestId) {
    return await inspectionRepository.findByRentalRequestId(rentalRequestId);
  }

  async comparePickupAndReturn(rentalRequestId) {
    const inspections = await this.getInspectionsByRentalRequest(rentalRequestId);
    
    const pickupInspection = inspections.find(i => i.inspection_type === 'PICKUP');
    const returnInspection = inspections.find(i => i.inspection_type === 'RETURN');

    if (!pickupInspection || !returnInspection) {
      return null;
    }

    return {
      pickup: pickupInspection,
      return: returnInspection,
      new_damages: this.findNewDamages(pickupInspection, returnInspection),
      condition_change: this.analyzeConditionChange(pickupInspection, returnInspection)
    };
  }

  findNewDamages(pickupInspection, returnInspection) {
    const pickupDamages = new Set(pickupInspection.damage_items?.map(d => d.part) || []);
    const returnDamages = returnInspection.damage_items || [];

    return returnDamages.filter(d => !pickupDamages.has(d.part));
  }

  analyzeConditionChange(pickupInspection, returnInspection) {
    // Compare overall conditions
    return {
      pickup_condition: pickupInspection.overall_condition,
      return_condition: returnInspection.overall_condition,
      deteriorated: pickupInspection.overall_condition !== returnInspection.overall_condition
    };
  }

  async getRenterInspections(renterId) {
    return await inspectionRepository.findByRenterId(renterId);
  }
}

export default new InspectionService();
