import apiClient from '../client';

const suggestions = [
  {
    id: 'AI-PRICING-01',
    type: 'pricing',
    title: 'Gợi ý giá thuê tối ưu',
    summary: 'Tăng 6-10% vào cuối tuần cho SUV tại TP.HCM để cải thiện doanh thu mà vẫn giữ tỉ lệ đặt.'
  },
  {
    id: 'AI-FRAUD-01',
    type: 'risk',
    title: 'Cảnh báo hành vi bất thường',
    summary: 'Phát hiện 3 yêu cầu thuê có dấu hiệu gian lận do thay đổi thiết bị + vị trí đăng nhập trong 15 phút.'
  },
  {
    id: 'AI-DISPUTE-01',
    type: 'dispute',
    title: 'Tóm tắt tranh chấp',
    summary: 'Khác biệt ảnh trước/sau tập trung ở cản trước bên phải. Đề xuất mức bồi thường 3.2 triệu.'
  }
];

export const aiAgentApi = {
  async getInsights(params = {}) {
    try {
      return await apiClient.get('/api/ai/insights', { params });
    } catch {
      return { data: suggestions };
    }
  },

  async suggestVehicle(payload) {
    try {
      return await apiClient.post('/api/ai/suggest-vehicle', payload);
    } catch {
      return {
        data: {
          recommendations: [
            { vehicle_type: 'SUV', reason: 'Phù hợp nhóm 5-7 người, hành trình dài và nhiều hành lý.' },
            { vehicle_type: 'MOTORBIKE', reason: 'Phù hợp quãng ngắn nội đô, chi phí thấp.' }
          ]
        }
      };
    }
  },

  async suggestPricing(payload) {
    try {
      return await apiClient.post('/api/ai/suggest-pricing', payload);
    } catch {
      const base = Number(payload?.base_price || 0);
      return {
        data: {
          min_price: Math.round(base * 0.95),
          recommended_price: Math.round(base * 1.08),
          max_price: Math.round(base * 1.2),
          confidence: 0.82
        }
      };
    }
  }
};
