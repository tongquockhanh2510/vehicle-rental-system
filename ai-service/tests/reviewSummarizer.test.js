/**
 * Tests for reviewSummarizer.js
 */
import { summarizeReviews } from '../src/utils/reviewSummarizer.js';

describe('ReviewSummarizer', () => {
  test('handles empty reviews gracefully', () => {
    const result = summarizeReviews('v001', []);
    expect(result.reviewCount).toBe(0);
    expect(result.summary.recommendation).toContain('no reviews');
  });

  test('extracts pros from positive reviews', () => {
    const reviews = [
      { rating: 5, comment: 'Xe sạch, chủ xe thân thiện, giao xe đúng giờ.' },
      { rating: 5, comment: 'Chủ xe chuyên nghiệp, thoải mái lắm.' },
      { rating: 4, comment: 'Sạch bóng, chủ xe nhiệt tình.' },
    ];
    const result = summarizeReviews('v001', reviews);
    expect(result.summary.pros.length).toBeGreaterThan(0);
    expect(result.averageRating).toBeGreaterThanOrEqual(4);
  });

  test('extracts cons from negative reviews', () => {
    const reviews = [
      { rating: 2, comment: 'Điều hoà yếu không mát, xe hơi bẩn.' },
      { rating: 3, comment: 'Máy lạnh không mát, chủ xe trễ giờ.' },
      { rating: 2, comment: 'Điều hoà hỏng, thất vọng.' },
    ];
    const result = summarizeReviews('v001', reviews);
    expect(result.summary.cons.length).toBeGreaterThan(0);
  });

  test('calculates correct average rating', () => {
    const reviews = [
      { rating: 4, comment: 'Good' },
      { rating: 5, comment: 'Excellent' },
      { rating: 3, comment: 'Average' },
    ];
    const result = summarizeReviews('v001', reviews);
    expect(result.averageRating).toBe(4.0);
  });

  test('gives excellent recommendation for high-rated vehicles', () => {
    const reviews = Array(5).fill({ rating: 5, comment: 'Excellent vehicle!' });
    const result = summarizeReviews('v001', reviews);
    expect(result.summary.recommendation).toContain('Highly recommended');
  });

  test('updatedAt is a valid ISO date', () => {
    const result = summarizeReviews('v001', [{ rating: 4, comment: 'Good' }]);
    expect(() => new Date(result.updatedAt)).not.toThrow();
  });
});
