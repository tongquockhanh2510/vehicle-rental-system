/**
 * Tests for pricingEngine.js
 */
import { calculateSuggestedPrice } from '../src/utils/pricingEngine.js';

describe('PricingEngine', () => {
  const BASE_PARAMS = {
    vehicleId: 'vehicle_001',
    vehicleType: 'SEVEN_SEATER',
    location: 'Hà Nội',
    basePrice: 800000,
    startDate: '2026-06-01', // Monday
    endDate: '2026-06-03',   // Wednesday
  };

  test('returns base price on weekday, non-holiday, non-high-demand area', () => {
    const result = calculateSuggestedPrice({ ...BASE_PARAMS });
    expect(result.vehicleId).toBe('vehicle_001');
    expect(result.suggestedPrice).toBeGreaterThanOrEqual(result.basePrice);
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
  });

  test('increases price for weekend', () => {
    const weekdayResult = calculateSuggestedPrice({ ...BASE_PARAMS });
    const weekendResult = calculateSuggestedPrice({
      ...BASE_PARAMS,
      startDate: '2026-06-06', // Saturday
      endDate: '2026-06-07',   // Sunday
    });
    expect(weekendResult.suggestedPrice).toBeGreaterThan(weekdayResult.suggestedPrice);
    expect(weekendResult.factors.hasWeekend).toBe(true);
  });

  test('increases price for Tet season', () => {
    const normalResult = calculateSuggestedPrice({ ...BASE_PARAMS });
    const tetResult = calculateSuggestedPrice({
      ...BASE_PARAMS,
      startDate: '2026-01-27',
      endDate: '2026-02-02',
    });
    expect(tetResult.factors.hasTet).toBe(true);
    expect(tetResult.suggestedPrice).toBeGreaterThan(normalResult.suggestedPrice);
  });

  test('increases price for high-demand area', () => {
    const normalResult = calculateSuggestedPrice({ ...BASE_PARAMS });
    const highDemandResult = calculateSuggestedPrice({
      ...BASE_PARAMS,
      location: 'Đà Lạt, Lâm Đồng',
    });
    expect(highDemandResult.factors.highDemand).toBe(true);
    expect(highDemandResult.suggestedPrice).toBeGreaterThan(normalResult.suggestedPrice);
  });

  test('uses market stats when provided', () => {
    const resultWithStats = calculateSuggestedPrice({
      ...BASE_PARAMS,
      stats: {
        averagePrice: 1200000,
        bookingCount: 60,
        cancellationRate: 0.1,
      },
    });
    expect(resultWithStats.confidence).toBeGreaterThan(0.65);
    expect(resultWithStats.suggestedPrice).toBeGreaterThan(BASE_PARAMS.basePrice);
  });

  test('generates a reason string', () => {
    const result = calculateSuggestedPrice({ ...BASE_PARAMS });
    expect(typeof result.reason).toBe('string');
    expect(result.reason.length).toBeGreaterThan(0);
  });

  test('returns rounded prices (divisible by 1000)', () => {
    const result = calculateSuggestedPrice({ ...BASE_PARAMS });
    expect(result.suggestedPrice % 1000).toBe(0);
    expect(result.normalDayPrice % 1000).toBe(0);
    expect(result.weekendPrice % 1000).toBe(0);
  });
});
