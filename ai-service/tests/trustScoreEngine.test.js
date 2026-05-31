/**
 * Tests for trustScoreEngine.js
 */
import { calculateTrustScore } from '../src/utils/trustScoreEngine.js';

describe('TrustScoreEngine', () => {
  const BASE_INPUT = {
    vehicleId: 'v001',
    ownerId: 'owner001',
    reviews: [],
    rentalStats: {},
    inspectionData: {},
    ownerData: {},
  };

  test('returns score between 1 and 100', () => {
    const result = calculateTrustScore(BASE_INPUT);
    expect(result.trustScore).toBeGreaterThanOrEqual(1);
    expect(result.trustScore).toBeLessThanOrEqual(100);
  });

  test('verified owner gets higher score', () => {
    const unverified = calculateTrustScore({ ...BASE_INPUT });
    const verified = calculateTrustScore({
      ...BASE_INPUT,
      ownerData: { isVerified: true },
    });
    expect(verified.trustScore).toBeGreaterThan(unverified.trustScore);
  });

  test('high cancellation rate lowers score', () => {
    const lowCancel = calculateTrustScore({
      ...BASE_INPUT,
      rentalStats: { completed: 20, cancelled: 1 },
    });
    const highCancel = calculateTrustScore({
      ...BASE_INPUT,
      rentalStats: { completed: 5, cancelled: 10 },
    });
    expect(lowCancel.trustScore).toBeGreaterThan(highCancel.trustScore);
  });

  test('positive reviews increase score', () => {
    const noReviews = calculateTrustScore({ ...BASE_INPUT });
    const positiveReviews = calculateTrustScore({
      ...BASE_INPUT,
      reviews: [
        { rating: 5, comment: 'Excellent vehicle, very clean and reliable!' },
        { rating: 5, comment: 'Great experience, very professional owner.' },
        { rating: 5, comment: 'Perfect, on time and friendly.' },
      ],
    });
    expect(positiveReviews.trustScore).toBeGreaterThan(noReviews.trustScore);
  });

  test('level is "Excellent" for score >= 85', () => {
    const result = calculateTrustScore({
      vehicleId: 'v001',
      ownerId: 'owner001',
      reviews: Array(10).fill({ rating: 5, comment: 'Excellent vehicle! Great owner. On time, clean, reliable.' }),
      rentalStats: { completed: 50, cancelled: 1, lateHandovers: 0 },
      inspectionData: { maintenanceCount: 3, damageReports: 0, inspectionStatus: 'PASSED' },
      ownerData: { isVerified: true },
    });
    expect(result.level).toBe('Excellent');
  });

  test('includes breakdown details', () => {
    const result = calculateTrustScore(BASE_INPUT);
    expect(result.breakdown).toBeDefined();
    expect(result.breakdown.sentiment).toBeDefined();
    expect(result.breakdown.cancellationRate).toBeDefined();
    expect(result.breakdown.verification).toBeDefined();
  });

  test('explanation is a non-empty string', () => {
    const result = calculateTrustScore(BASE_INPUT);
    expect(typeof result.explanation).toBe('string');
    expect(result.explanation.length).toBeGreaterThan(0);
  });
});
