import { ReviewRepository } from '../repositories/ReviewRepository.js';

const reviewRepository = new ReviewRepository();

export class ReviewService {
  async createReview(reviewData) {
    const review = await reviewRepository.create(reviewData);
    return review;
  }

  async getReviewById(reviewId) {
    return await reviewRepository.findById(reviewId);
  }

  async updateReview(reviewId, updateData) {
    return await reviewRepository.update(reviewId, updateData);
  }

  async getReviewsByUser(userId) {
    return await reviewRepository.findByReviewedUserId(userId);
  }

  async getReviewsByRenter(renterId) {
    return await reviewRepository.findByReviewerId(renterId);
  }

  async calculateAverageRating(userId) {
    const reviews = await this.getReviewsByUser(userId);
    if (reviews.length === 0) return 5.0;

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (totalRating / reviews.length).toFixed(1);
  }

  async getReviewsByVehicle(vehicleId) {
    return await reviewRepository.findByVehicleId(vehicleId);
  }

  async deleteReview(reviewId) {
    return await reviewRepository.delete(reviewId);
  }

  async getTopRatedUsers(limit = 10) {
    // Aggregate reviews to find top-rated users
    // This is simplified - in production would use MongoDB aggregation
    const allUsers = {};
    // Implementation would aggregate reviews by reviewed_user_id and calculate averages
    return [];
  }
}

export default new ReviewService();
