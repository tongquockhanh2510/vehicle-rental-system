/**
 * Tests for intentExtractor.js
 */
import { extractIntent } from '../src/utils/intentExtractor.js';

describe('IntentExtractor - Vietnamese', () => {
  test('extracts 7-seat vehicle type (Vietnamese)', () => {
    const result = extractIntent('Kiếm giùm anh chiếc xe 7 chỗ rộng rãi đi gia đình ở Ea Súp từ sáng thứ 6 đến chiều Chủ Nhật tuần này, giá tầm 1 triệu rưỡi đổ lại.');
    expect(result.vehicleType).toBe('SEVEN_SEATER');
  });

  test('extracts location (Vietnamese)', () => {
    const result = extractIntent('Tôi cần xe ở Đà Lạt từ thứ 7 đến Chủ Nhật.');
    expect(result.location).toMatch(/đà lạt|da lat|Đà Lạt/i);
  });

  test('extracts max price (1 triệu rưỡi = 1,500,000)', () => {
    const result = extractIntent('Giá tầm 1 triệu rưỡi đổ lại.');
    expect(result.maxPrice).toBe(1500000);
  });

  test('extracts max price (2 triệu = 2,000,000)', () => {
    const result = extractIntent('Ngân sách dưới 2 triệu một ngày.');
    expect(result.maxPrice).toBe(2000000);
  });

  test('extracts family purpose', () => {
    const result = extractIntent('Xe đi gia đình 7 chỗ.');
    expect(result.passengerPurpose).toBe('family trip');
  });

  test('extracts date range from "từ ... đến ..."', () => {
    const result = extractIntent('Từ thứ 6 đến Chủ Nhật tuần này tôi cần xe.');
    expect(result.startDate).not.toBeNull();
    expect(result.endDate).not.toBeNull();
  });
});

describe('IntentExtractor - English', () => {
  test('extracts 7-seat vehicle type (English)', () => {
    const result = extractIntent('Find me a 7-seat car for my family trip.');
    expect(result.vehicleType).toBe('SEVEN_SEATER');
  });

  test('extracts location (English)', () => {
    const result = extractIntent('I need a car in Nha Trang from Friday to Sunday.');
    expect(result.location).toMatch(/nha trang/i);
  });

  test('extracts max price (1.5 million)', () => {
    const result = extractIntent('Budget under 1.5 million VND per day.');
    expect(result.maxPrice).toBe(1500000);
  });

  test('extracts motorcycle type', () => {
    const result = extractIntent('I need a motorbike for city travel.');
    expect(result.vehicleType).toBe('MOTORCYCLE');
  });

  test('extracts SEARCH_VEHICLE intent', () => {
    const result = extractIntent('Find me a 4-seat car in Hanoi.');
    expect(result.intent).toBe('SEARCH_VEHICLE');
  });

  test('handles empty message gracefully', () => {
    const result = extractIntent('');
    expect(result.intent).toBe('UNKNOWN');
  });

  test('extracts "today" as start date', () => {
    const result = extractIntent('I need a car starting today.');
    expect(result.startDate).not.toBeNull();
  });
});
