import express from 'express';
import axios from 'axios';
import { extractIntent } from '../utils/intentExtractor.js';
import {
  searchVehicles,
  rankVehicles,
  generateAlternatives,
} from '../services/vehicleSearchClient.js';

const router = express.Router();

/**
 * Generate a friendly and context-aware chat response in Vietnamese.
 * Utilizes Google Gemini API if available, otherwise falls back to static templates.
 */
async function generateFriendlyResponse(userMessage, slots, vehicles = null, alternatives = null) {
  const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (geminiApiKey) {
    try {
      let prompt = `You are a helpful, friendly, and professional AI Rental Assistant for the P2P vehicle rental system "RentCar Premium".
Your task is to write a warm, engaging, and conversational reply in Vietnamese in response to the user's message: "${userMessage}".

Intent detected: ${slots.intent}
Parsed Slots: ${JSON.stringify(slots)}
`;

      if (vehicles && vehicles.length > 0) {
        const vehicleDetails = vehicles.map((v, i) => `#${i+1}: ${v.brand} ${v.model} (${v.year}) - Giá: ${v.daily_rate?.toLocaleString('vi-VN')} VND/ngày, Địa điểm: ${v.location}, Xếp hạng: ${v.rating || v.average_rating || 5}*`).join('\n');
        prompt += `\nI found the following available vehicles matching their criteria:\n${vehicleDetails}\n\nIntroduce these vehicles to the user, highlight their features briefly, and encourage them to click "Đặt xe ngay" (Confirm booking) on the vehicle cards below. Keep it concise, friendly, and polite.`;
      } else if (alternatives && alternatives.length > 0) {
        const altDetails = alternatives.map((v, i) => `#${i+1}: ${v.brand} ${v.model} (${v.year}) - Giá: ${v.daily_rate?.toLocaleString('vi-VN')} VND/ngày, Địa điểm: ${v.location}`).join('\n');
        prompt += `\nI could NOT find exactly what they wanted, but here are some alternatives:\n${altDetails}\n\nApologize politely in Vietnamese, and present these alternative vehicles to see if they might like them instead.`;
      } else if (!slots.vehicleType && !slots.location) {
        prompt += `\nThe user's request is too vague. Politely ask them in Vietnamese to clarify what kind of vehicle they want to rent (e.g., 4-seat car, 7-seater, motorcycle) and their desired location/area.`;
      } else {
        prompt += `\nNo vehicles were found, and no alternatives are available. Politely apologize in Vietnamese and suggest they modify their search criteria (like choosing another date or city).`;
      }

      prompt += `\n\nRule: Write ONLY the response text in natural Vietnamese. Do not add any prefix like "Assistant:" or markdown block quotes.`;

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
        {
          contents: [{
            parts: [{ text: prompt }]
          }]
        },
        { timeout: 7000 }
      );

      const responseText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (responseText) {
        return responseText.trim();
      }
    } catch (err) {
      console.warn('[ai-agent] Gemini friendly response generation failed, falling back to static templates:', err.message);
    }
  }

  // Fallback to static Vietnamese responses:
  if (slots.intent === 'UNKNOWN') {
    return "Xin lỗi, tôi chưa hiểu rõ yêu cầu của bạn. Bạn vui lòng mô tả chi tiết loại xe bạn cần tìm (xe máy, xe 4 chỗ, 7 chỗ...), địa điểm và thời gian nhận xe nhé!";
  }

  if (!slots.vehicleType && !slots.location) {
    return "Tôi có thể giúp bạn tìm xe rất nhanh! Bạn vui lòng cung cấp thêm loại xe mong muốn (xe máy, ô tô...) và khu vực bạn cần thuê nhé.";
  }

  if (vehicles && vehicles.length > 0) {
    const typeLabel = slots.vehicleType === 'CAR' ? 'ô tô 4 chỗ' :
                      slots.vehicleType === 'SEVEN_SEATER' ? 'ô tô 7 chỗ' :
                      slots.vehicleType === 'MOTORCYCLE' ? 'xe máy' :
                      slots.vehicleType === 'PICKUP_TRUCK' ? 'xe bán tải' : 'phương tiện';
    const locLabel = slots.location || 'khu vực của bạn';
    return `Tuyệt vời! Tôi đã tìm thấy ${vehicles.length} chiếc ${typeLabel} phù hợp tại ${locLabel} dành cho bạn. Bạn có thể nhấn nút "Đặt xe ngay" dưới các thẻ xe phía dưới nhé!`;
  }

  if (alternatives && alternatives.length > 0) {
    const locLabel = slots.location || 'khu vực này';
    return `Rất tiếc, hiện tại tôi chưa tìm thấy xe chính xác theo yêu cầu của bạn tại ${locLabel}. Dù vậy, tôi có một số gợi ý thay thế rất tốt sau đây mà bạn có thể cân nhắc:`;
  }

  return `Rất tiếc, tôi chưa tìm thấy xe nào phù hợp với yêu cầu của bạn tại khu vực này. Bạn vui lòng thử thay đổi thời gian hoặc địa điểm tìm kiếm nhé!`;
}

/**
 * POST /api/ai-agent/chat
 * Natural language vehicle search assistant.
 */
router.post('/chat', async (req, res) => {
  try {
    const { userId, message } = req.body;

    // Validation
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'message is required and must be a non-empty string' });
    }
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Step 1: Extract intent and slots from natural language
    const slots = await extractIntent(message);

    if (slots.intent === 'UNKNOWN') {
      const responseMessage = await generateFriendlyResponse(message, slots, null, null);
      return res.json({
        message: responseMessage,
        intent: 'UNKNOWN',
        slots,
        vehicles: [],
        actions: [],
      });
    }

    // Step 2: Validate essential slots for search
    if (!slots.vehicleType && !slots.location) {
      const responseMessage = await generateFriendlyResponse(message, slots, null, null);
      return res.json({
        message: responseMessage,
        intent: slots.intent,
        slots,
        vehicles: [],
        actions: [
          { type: 'CLARIFY', label: 'Cung cấp thêm chi tiết' },
        ],
      });
    }

    // Step 3: Search vehicles
    const allVehicles = await searchVehicles(slots);

    // Step 4: Rank results
    if (allVehicles.length > 0) {
      const topVehicles = rankVehicles(allVehicles, slots);
      const responseMessage = await generateFriendlyResponse(message, slots, topVehicles, null);

      return res.json({
        message: responseMessage,
        intent: slots.intent,
        slots,
        vehicles: topVehicles,
        actions: topVehicles.map((v) => ({
          type: 'BOOK_NOW',
          label: 'Đặt xe ngay',
          vehicleId: v.id,
          bookingUrl: v.bookingUrl,
        })),
      });
    }

    // Step 5: No vehicles found - suggest alternatives
    const alternatives = generateAlternatives(slots);
    const responseMessage = await generateFriendlyResponse(message, slots, null, alternatives);

    return res.json({
      message: responseMessage,
      intent: slots.intent,
      slots,
      vehicles: [],
      alternatives,
      actions: [
        { type: 'MODIFY_SEARCH', label: 'Thay đổi bộ lọc' },
        { type: 'BROWSE_ALL', label: 'Xem tất cả xe sẵn có', url: '/vehicles' },
      ],
    });
  } catch (error) {
    console.error('[ai-agent] /chat error:', error.message);
    return res.status(500).json({
      error: 'Failed to process your request',
      details: error.message,
    });
  }
});

/**
 * POST /api/ai-agent/extract-intent
 * Debug endpoint to test intent extraction without searching.
 */
router.post('/extract-intent', async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'message is required' });
  }
  const slots = await extractIntent(message);
  return res.json(slots);
});

export default router;
