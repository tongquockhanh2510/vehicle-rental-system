import express from 'express';
import axios from 'axios';
import { extractIntent } from '../utils/intentExtractor.js';
import { generateAlternatives, rankVehicles, searchVehicles } from '../services/vehicleSearchClient.js';

const router = express.Router();

function vehicleTypeLabel(vehicleType, fuelType) {
  if (fuelType === 'ELECTRIC') return 'xe điện';
  switch (vehicleType) {
    case 'SEVEN_SEATER':
      return 'xe 7 chỗ';
    case 'PICKUP_TRUCK':
      return 'xe bán tải';
    case 'MOTORCYCLE':
      return 'xe máy';
    case 'BICYCLE':
      return 'xe đạp';
    case 'CAR':
      return 'ô tô';
    default:
      return 'phương tiện';
  }
}

function formatPrice(value) {
  return Number(value || 0).toLocaleString('vi-VN');
}

async function generateFriendlyResponse(userMessage, slots, topVehicles = [], alternatives = []) {
  const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  if (geminiApiKey) {
    try {
      const prompt = `Bạn là trợ lý AI của nền tảng thuê xe P2P RentCar Premium.
Hãy trả lời bằng tiếng Việt tự nhiên, ngắn gọn, chuyên nghiệp.

Tin nhắn người dùng:
"${userMessage}"

Intent: ${slots.intent}
Slots: ${JSON.stringify(slots)}
Kết quả xe phù hợp: ${JSON.stringify(topVehicles)}
Gợi ý thay thế: ${JSON.stringify(alternatives)}

Yêu cầu:
- Nếu có xe: tóm tắt số lượng, mức giá và gợi ý người dùng bấm "Xem & Đặt xe".
- Nếu chưa có xe: xin lỗi lịch sự và đưa ra hướng thay đổi tiêu chí.
- Không dùng markdown, chỉ trả về đoạn text.`;

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
        { contents: [{ parts: [{ text: prompt }] }] },
        { timeout: 4500 }
      );

      const text = response.data?.candidates?.[0]?.content?.parts
        ?.map((part) => part?.text || '')
        .join('')
        .trim();

      if (text) return text;
    } catch (error) {
      console.warn('[ai-agent] Gemini response fallback:', error.message);
    }
  }

  if (slots.intent === 'UNKNOWN') {
    return 'Mình chưa hiểu rõ yêu cầu. Bạn mô tả giúp mình loại xe, khu vực và thời gian thuê để mình tìm chính xác nhé.';
  }

  if (!slots.vehicleType && !slots.fuelType && !slots.location) {
    return 'Bạn cho mình thêm 2 thông tin: loại xe muốn thuê và khu vực nhận xe. Mình sẽ trả về danh sách phù hợp ngay.';
  }

  if (topVehicles.length > 0) {
    const labels = topVehicles
      .slice(0, 3)
      .map((item) => `${item.name} (${formatPrice(item.pricePerDay)} VND/ngày)`)
      .join(', ');
    const target = slots.location ? ` tại ${slots.location}` : '';
    return `Mình đã tìm thấy ${topVehicles.length} ${vehicleTypeLabel(slots.vehicleType, slots.fuelType)} phù hợp${target}. Gợi ý tốt nhất: ${labels}. Bạn bấm "Xem & Đặt xe" để xem chi tiết và gửi yêu cầu thuê nhé.`;
  }

  const altText = alternatives.length
    ? ` ${alternatives.map((item) => item.message).join(' ')}`
    : '';
  return `Hiện chưa có xe khớp hoàn toàn với tiêu chí của bạn.${altText}`;
}

router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'message is required and must be a non-empty string' });
    }

    const slots = await extractIntent(message);
    const intent = slots.intent || 'SEARCH_VEHICLE';

    if (intent === 'UNKNOWN') {
      const responseMessage = await generateFriendlyResponse(message, slots, [], []);
      return res.json({
        message: responseMessage,
        intent,
        slots,
        vehicles: [],
        alternatives: [],
        actions: [{ type: 'CLARIFY', label: 'Bổ sung yêu cầu tìm xe' }]
      });
    }

    const candidates = await searchVehicles(slots);
    const ranked = rankVehicles(candidates, slots);

    if (ranked.length > 0) {
      const responseMessage = await generateFriendlyResponse(message, slots, ranked, []);
      return res.json({
        message: responseMessage,
        intent,
        slots,
        vehicles: ranked,
        alternatives: [],
        meta: {
          candidate_count: candidates.length,
          matched_count: ranked.length
        },
        actions: ranked.map((item) => ({
          type: 'BOOK_NOW',
          label: 'Xem & Đặt xe',
          vehicleId: item.id,
          bookingUrl: item.bookingUrl
        }))
      });
    }

    const alternatives = generateAlternatives(slots);
    const responseMessage = await generateFriendlyResponse(message, slots, [], alternatives);
    return res.json({
      message: responseMessage,
      intent,
      slots,
      vehicles: [],
      alternatives,
      actions: [
        { type: 'MODIFY_SEARCH', label: 'Điều chỉnh bộ lọc' },
        { type: 'BROWSE_ALL', label: 'Xem toàn bộ phương tiện', url: '/vehicles' }
      ]
    });
  } catch (error) {
    console.error('[ai-agent] /chat error:', error.message);
    return res.status(500).json({
      error: 'Failed to process your request',
      details: error.message
    });
  }
});

router.post('/extract-intent', async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'message is required' });
  }
  const slots = await extractIntent(message);
  return res.json(slots);
});

export default router;

