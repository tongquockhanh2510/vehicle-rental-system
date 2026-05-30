import Review from '../models/Review.js';

export class ReviewRepository {
  async create(reviewData) {
    const review = new Review(reviewData);
    return await review.save();
  }

  async findById(id) {
    return await Review.findById(id);
  }

  async update(id, updateData) {
    return await Review.findByIdAndUpdate(
      id,
      { ...updateData, updated_at: new Date() },
      { new: true }
    );
  }

  async findByReviewedUserId(userId) {
    return await Review.find({ reviewed_user_id: userId });
  }

  async findByReviewerId(userId) {
    return await Review.find({ reviewer_id: userId });
  }

  async findByVehicleId(vehicleId) {
    return await Review.find({ vehicle_id: vehicleId });
  }

  async findByRentalAndReviewer(rentalRequestId, reviewerId) {
    return await Review.findOne({
      rental_request_id: rentalRequestId,
      reviewer_id: reviewerId
    });
  }

  async delete(id) {
    return await Review.findByIdAndDelete(id);
  }
}
