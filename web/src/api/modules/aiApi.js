import apiClient from '../client';

/**
 * API module for the new ai-service endpoints:
 *  - Smart pricing suggestions
 *  - Review summarization
 *  - Trust score calculation
 *  - AI booking agent chat
 */

export const aiApi = {
  /**
   * Request a smart price suggestion for a vehicle.
   */
  async suggestSmartPricing(payload) {
    const response = await apiClient.post('/api/ai/pricing/suggest', payload);
    return response.data;
  },

  /**
   * Get AI review summary for a vehicle.
   */
  async getReviewSummary(vehicleId, forceRefresh = false) {
    const response = await apiClient.post('/api/ai/reviews/summarize', {
      vehicleId,
      forceRefresh,
    });
    return response.data;
  },

  /**
   * Get trust score for a vehicle and owner.
   */
  async getTrustScore(vehicleId, ownerId) {
    const response = await apiClient.post('/api/ai/trust-score/calculate', {
      vehicleId,
      ownerId,
    });
    return response.data;
  },

  /**
   * Send a chat message to the AI booking assistant.
   */
  async chat(userId, message) {
    const response = await apiClient.post('/api/ai-agent/chat', {
      userId,
      message,
    });
    return response.data;
  },
};
