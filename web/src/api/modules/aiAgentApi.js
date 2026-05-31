import apiClient from '../client';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-1.5-flash';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
  GEMINI_MODEL
)}:generateContent`;

const fallbackInsights = [
  {
    id: 'AI-PRICING-01',
    type: 'pricing',
    title: 'Gợi ý giá thuê tối ưu',
    summary:
      'Tăng 6-10% vào cuối tuần cho xe có nhu cầu cao tại TP.HCM để cải thiện doanh thu mà vẫn giữ tỷ lệ đặt.'
  },
  {
    id: 'AI-FRAUD-01',
    type: 'risk',
    title: 'Cảnh báo hành vi bất thường',
    summary:
      'Phát hiện yêu cầu thuê có tín hiệu rủi ro khi thay đổi thiết bị và vị trí đăng nhập liên tục trong thời gian ngắn.'
  },
  {
    id: 'AI-DISPUTE-01',
    type: 'dispute',
    title: 'Tóm tắt tranh chấp',
    summary:
      'Khác biệt ảnh trước/sau tập trung ở cản trước bên phải. Đề xuất kiểm tra lại biên bản nhận xe và mức bồi thường.'
  }
];

function unwrapCodeFence(text = '') {
  const normalized = String(text || '').trim();
  if (!normalized.startsWith('```')) return normalized;
  return normalized.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
}

function parseJsonSafely(text = '', fallbackValue) {
  try {
    const parsed = JSON.parse(unwrapCodeFence(text));
    return parsed ?? fallbackValue;
  } catch {
    return fallbackValue;
  }
}

function extractApiErrorMessage(error) {
  const responseData = error?.response?.data;
  if (typeof responseData === 'string' && responseData.trim()) {
    return responseData;
  }
  return (
    responseData?.message ||
    responseData?.error ||
    error?.message ||
    'AI service is unavailable right now.'
  );
}

async function callGemini(prompt, options = {}) {
  if (!GEMINI_API_KEY) {
    throw new Error('MISSING_GEMINI_KEY');
  }

  const response = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: options.temperature ?? 0.3,
        topP: options.topP ?? 0.9,
        maxOutputTokens: options.maxOutputTokens ?? 900
      }
    })
  });

  if (!response.ok) {
    const raw = await response.text();
    throw new Error(raw || `Gemini request failed (${response.status})`);
  }

  const payload = await response.json();
  const text = payload?.candidates?.[0]?.content?.parts
    ?.map((part) => part?.text || '')
    .join('\n')
    .trim();

  if (!text) {
    throw new Error('Gemini returned empty response');
  }

  return text;
}

function fallbackChatReply(message = '') {
  const normalized = String(message || '').toLowerCase();

  if (normalized.includes('giá') || normalized.includes('chi phí')) {
    return 'Bạn nên so sánh giá thuê/ngày, tiền cọc và phí nền tảng 4% trước khi gửi yêu cầu. Nếu cần, mình có thể gợi ý mức giá phù hợp theo ngân sách của bạn.';
  }
  if (normalized.includes('hợp đồng') || normalized.includes('thanh toán')) {
    return 'Sau khi chủ xe duyệt, bạn vào mục "Yêu cầu thuê của tôi" để xác nhận nhận xe, theo dõi hợp đồng và thanh toán. Hệ thống sẽ cập nhật trạng thái theo từng bước.';
  }
  if (normalized.includes('trả xe') || normalized.includes('hoàn cọc')) {
    return 'Khi đơn ở trạng thái ACTIVE, bạn bấm "Tôi đã trả xe". Chủ xe xác nhận xong thì đơn chuyển COMPLETED và hệ thống xử lý hoàn cọc theo điều kiện thuê.';
  }

  return 'Mình đã nhận yêu cầu. Bạn có thể nói rõ hơn về mục đích chuyến đi, ngân sách/ngày và số chỗ cần thiết để mình gợi ý phương tiện sát hơn.';
}

function toPriceRecommendation(data = {}, base = 0) {
  const numericBase = Number(base || 0);
  const recommended = Number(data?.recommended_price || numericBase * 1.08 || 0);
  const min = Number(data?.min_price || Math.max(0, Math.round(recommended * 0.9)));
  const max = Number(data?.max_price || Math.round(recommended * 1.15));
  const confidence = Number(data?.confidence || 0.8);

  return {
    min_price: Math.round(min),
    recommended_price: Math.round(recommended),
    max_price: Math.round(max),
    confidence: Number.isFinite(confidence) ? confidence : 0.8,
    rationale: data?.rationale || 'Đề xuất dựa trên loại xe, khu vực và mức cầu hiện tại.'
  };
}

function toRecommendations(data = []) {
  if (!Array.isArray(data)) return [];
  return data
    .filter(Boolean)
    .map((item) => ({
      vehicle_type: String(item?.vehicle_type || '').toUpperCase() || 'CAR',
      reason: item?.reason || 'Phù hợp theo nhu cầu di chuyển và ngân sách.'
    }))
    .slice(0, 4);
}

export const aiAgentApi = {
  async getInsights(params = {}) {
    try {
      return await apiClient.get('/api/ai/insights', { params });
    } catch {
      try {
        const prompt = `
Bạn là AI Agent của nền tảng thuê xe P2P.
Hãy trả về JSON ARRAY gồm 4 insight dạng:
[
  {"id":"AI-...","type":"pricing|risk|dispute|recommendation","title":"...","summary":"..."}
]
Ngữ cảnh: hệ thống tại TP.HCM và Hà Nội, có renter/owner/admin, tracking, dispute, payment.
Mỗi summary tối đa 26 từ, tiếng Việt.
Chỉ trả JSON.
`;
        const text = await callGemini(prompt, { temperature: 0.35, maxOutputTokens: 700 });
        const parsed = parseJsonSafely(text, fallbackInsights);
        const insights = Array.isArray(parsed) && parsed.length ? parsed : fallbackInsights;
        return { data: insights };
      } catch {
        return { data: fallbackInsights };
      }
    }
  },

  async suggestVehicle(payload = {}) {
    try {
      return await apiClient.post('/api/ai/suggest-vehicle', payload);
    } catch {
      try {
        const prompt = `
Hãy gợi ý phương tiện cho người thuê theo input sau (JSON):
${JSON.stringify(payload)}

Trả về JSON object:
{
  "recommendations": [
    { "vehicle_type": "CAR", "reason": "..." }
  ]
}
Tối đa 4 gợi ý, tiếng Việt, ngắn gọn. Chỉ trả JSON.
`;
        const text = await callGemini(prompt, { temperature: 0.25, maxOutputTokens: 600 });
        const parsed = parseJsonSafely(text, { recommendations: [] });
        const recommendations = toRecommendations(parsed?.recommendations);
        if (recommendations.length) {
          return { data: { recommendations } };
        }
      } catch {
        // fallback local
      }

      return {
        data: {
          recommendations: [
            { vehicle_type: 'CAR', reason: 'Phù hợp nhu cầu đi lại hằng ngày và công tác trong nội đô.' },
            { vehicle_type: 'MOTORCYCLE', reason: 'Di chuyển linh hoạt, chi phí thấp cho quãng ngắn.' },
            { vehicle_type: 'SEVEN_SEATER', reason: 'Phù hợp đi nhóm gia đình hoặc nhiều hành lý.' }
          ]
        }
      };
    }
  },

  async suggestPricing(payload = {}) {
    try {
      return await apiClient.post('/api/ai/suggest-pricing', payload);
    } catch {
      try {
        const prompt = `
Bạn là AI định giá cho marketplace thuê xe.
Input:
${JSON.stringify(payload)}

Trả về JSON object:
{
  "min_price": number,
  "recommended_price": number,
  "max_price": number,
  "confidence": number,
  "rationale": "..."
}
Không thêm chữ ngoài JSON.
`;
        const text = await callGemini(prompt, { temperature: 0.2, maxOutputTokens: 450 });
        const parsed = parseJsonSafely(text, {});
        return { data: toPriceRecommendation(parsed, payload?.base_price) };
      } catch {
        const base = Number(payload?.base_price || 0);
        return {
          data: toPriceRecommendation(
            {
              min_price: Math.round(base * 0.95),
              recommended_price: Math.round(base * 1.08),
              max_price: Math.round(base * 1.2),
              confidence: 0.82
            },
            base
          )
        };
      }
    }
  },

  async summarizeRenterJourney(payload = {}) {
    try {
      return await apiClient.post('/api/ai/summarize-renter-journey', payload);
    } catch {
      try {
        const requestCount = Array.isArray(payload?.requests) ? payload.requests.length : 0;
        const contractCount = Array.isArray(payload?.contracts) ? payload.contracts.length : 0;
        const paymentCount = Array.isArray(payload?.payments) ? payload.payments.length : 0;

        const prompt = `
Bạn là AI trợ lý cho người thuê xe.
Tóm tắt ngắn gọn hành trình thuê xe theo dữ liệu sau:
- Số yêu cầu thuê: ${requestCount}
- Số hợp đồng: ${contractCount}
- Số giao dịch thanh toán: ${paymentCount}

Yêu cầu:
- Viết tiếng Việt, tối đa 80 từ.
- Nêu 1-2 gợi ý hành động tiếp theo cho người thuê.
- Chỉ trả plain text.
`;
        const text = await callGemini(prompt, { temperature: 0.4, maxOutputTokens: 220 });
        return { data: { summary: text } };
      } catch {
        return {
          data: {
            summary:
              'Bạn đang theo dõi các yêu cầu thuê gần đây. Hãy ưu tiên hoàn tất thanh toán cho yêu cầu đã duyệt và cập nhật kiểm tra xe đúng mốc thời gian để tăng độ tin cậy tài khoản.'
          }
        };
      }
    }
  },

  async chatSupport(payload = {}) {
    try {
      return await apiClient.post('/api/ai/chat-support', payload);
    } catch (apiError) {
      const fallbackMessage = extractApiErrorMessage(apiError);

      try {
        const prompt = `
Bạn là trợ lý AI của nền tảng thuê xe P2P RentCar Premium.
Hãy trả lời ngắn gọn, thực dụng, bằng tiếng Việt, tối đa 120 từ.

Ngữ cảnh user:
${JSON.stringify(payload?.context || {}, null, 2)}

Câu hỏi của user:
${payload?.message || ''}
`;
        const text = await callGemini(prompt, { temperature: 0.45, maxOutputTokens: 280 });
        return {
          data: {
            reply: text,
            source: 'gemini-fallback',
            warning: fallbackMessage
          }
        };
      } catch {
        return {
          data: {
            reply: fallbackChatReply(payload?.message),
            source: 'local-fallback',
            warning: fallbackMessage
          }
        };
      }
    }
  }
};
