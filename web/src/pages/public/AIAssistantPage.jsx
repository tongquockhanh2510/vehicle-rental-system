import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { aiApi } from '../../api/modules/aiApi';
import { rentalApi } from '../../api/modules/rentalApi';
import { vehicleApi } from '../../api/modules/vehicleApi';
import RentalBillModal from '../../components/common/RentalBillModal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../api/client';
import { getFallbackCarImage, resolveImage } from '../../utils/image';

const ASSISTANT_STORAGE_KEY = 'rentcar_ai_assistant_history_v2';
const AGENT_STORAGE_KEY = 'rentcar_ai_agent_history_v2';
const MODE_STORAGE_KEY = 'rentcar_ai_mode_v1';

const MODES = {
  ASSISTANT: 'assistant',
  AGENT: 'agent'
};

const AGENT_STEPS = {
  COLLECT_REQUIREMENT: 'COLLECT_REQUIREMENT',
  SUGGEST_VEHICLES: 'SUGGEST_VEHICLES',
  SELECT_VEHICLE: 'SELECT_VEHICLE',
  COLLECT_DATES: 'COLLECT_DATES',
  SHOW_BILL: 'SHOW_BILL',
  WAIT_CONFIRMATION: 'WAIT_CONFIRMATION',
  SUBMIT_REQUEST: 'SUBMIT_REQUEST',
  DONE: 'DONE'
};

const STEP_LABELS = {
  [AGENT_STEPS.COLLECT_REQUIREMENT]: 'Nhu cầu',
  [AGENT_STEPS.SUGGEST_VEHICLES]: 'Gợi ý xe',
  [AGENT_STEPS.SELECT_VEHICLE]: 'Chọn xe',
  [AGENT_STEPS.COLLECT_DATES]: 'Ngày thuê',
  [AGENT_STEPS.SHOW_BILL]: 'Bill nháp',
  [AGENT_STEPS.WAIT_CONFIRMATION]: 'Xác nhận',
  [AGENT_STEPS.SUBMIT_REQUEST]: 'Gửi yêu cầu',
  [AGENT_STEPS.DONE]: 'Hoàn tất'
};

const START_ASSISTANT_MESSAGE = {
  role: 'ai',
  content:
    'Xin chào, mình là AI Booking Assistant. Bạn chỉ cần mô tả loại xe, khu vực và ngân sách, mình sẽ tìm xe phù hợp từ dữ liệu thực tế của hệ thống.',
  timestamp: Date.now()
};

const START_AGENT_MESSAGE = {
  role: 'ai',
  content:
    'Xin chào, mình là AI Booking Agent. Mình có thể hỗ trợ bạn đi trọn luồng đặt xe: tìm xe, chọn lịch, tạo bill và gửi yêu cầu thuê thật.',
  timestamp: Date.now()
};

const SUGGESTED_MESSAGES = [
  'Tôi cần xe 7 chỗ tại TP.HCM cuối tuần này, ngân sách 1.6 triệu/ngày.',
  'Tìm xe máy ở Quận 1, giá dưới 700k/ngày.',
  'Tìm ô tô điện ở TP.HCM dưới 2 triệu/ngày.',
  'Tôi cần xe bán tải ở Tân Bình từ thứ 6 đến Chủ Nhật.'
];

function readHistory(storageKey, startMessage) {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [startMessage];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : [startMessage];
  } catch {
    return [startMessage];
  }
}

function persistHistory(storageKey, messages) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(messages.slice(-120)));
  } catch {
    // ignore
  }
}

function normalizeVehicleId(vehicle) {
  return String(vehicle?.id || vehicle?._id || '');
}

function parseSelectionCommand(text, max) {
  if (!max) return -1;
  const normalized = String(text || '').toLowerCase().trim();
  if (!normalized) return -1;

  if (/^(chon|chọn).*(dau tien|đầu tiên|first)/i.test(normalized)) return 0;

  const numberMatch = normalized.match(/(?:chon|chọn)\s*(?:xe)?\s*(\d+)/i);
  if (numberMatch) {
    const index = Number(numberMatch[1]) - 1;
    if (Number.isFinite(index) && index >= 0 && index < max) return index;
  }

  if (/^(1|xe 1)$/i.test(normalized)) return 0;
  if (/^(2|xe 2)$/i.test(normalized) && max > 1) return 1;
  if (/^(3|xe 3)$/i.test(normalized) && max > 2) return 2;

  return -1;
}

function toIsoDate(day, month, year) {
  const currentYear = new Date().getFullYear();
  const resolvedYear = year ? Number(year) : currentYear;
  if (!resolvedYear || !month || !day) return '';
  const mm = String(Number(month)).padStart(2, '0');
  const dd = String(Number(day)).padStart(2, '0');
  return `${resolvedYear}-${mm}-${dd}`;
}

function extractDateRangeFromText(text = '') {
  const raw = String(text || '').trim();
  if (!raw) return { startDate: '', endDate: '' };

  const patterns = [...raw.matchAll(/(\d{1,2})[/-](\d{1,2})(?:[/-](\d{4}))?/g)];
  if (!patterns.length) return { startDate: '', endDate: '' };

  const first = patterns[0];
  const second = patterns[1];
  const startDate = toIsoDate(first[1], first[2], first[3]);
  const endDate = second ? toIsoDate(second[1], second[2], second[3]) : '';

  return { startDate, endDate };
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function getDefaultDates() {
  const today = new Date();
  const pickup = addDays(today, 1);
  const dropoff = addDays(today, 3);
  const format = (value) =>
    `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(
      value.getDate()
    ).padStart(2, '0')}`;
  return {
    startDate: format(pickup),
    endDate: format(dropoff)
  };
}

function getDisplayName(user = {}) {
  return (
    user?.name ||
    [user?.last_name, user?.first_name].filter(Boolean).join(' ').trim() ||
    user?.first_name ||
    user?.email ||
    'Chủ xe'
  );
}

function calculateRentalDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  const diff = end.getTime() - start.getTime();
  if (diff < 0) return 0;
  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
}

function isSameUser(a, b) {
  return String(a || '') === String(b || '');
}

function getVehicleMainImage(vehicle = {}) {
  return (
    resolveImage(vehicle?.image) ||
    resolveImage(Array.isArray(vehicle?.images) ? vehicle.images[0] : '') ||
    resolveImage(vehicle?.imageUrl) ||
    getFallbackCarImage()
  );
}

function buildDraftBill(vehicleDetail, renterUser, startDate, endDate, note = '') {
  const owner = vehicleDetail?.owner || {};
  const payout = owner?.payout_info || {};
  const dailyRate = Number(vehicleDetail?.daily_rate || 0);
  const depositAmount = Number(vehicleDetail?.deposit_amount || 0);
  const rentalDays = Math.max(1, calculateRentalDays(startDate, endDate));
  const rentalAmount = dailyRate * rentalDays;
  const platformFee = rentalAmount * 0.04;
  const totalAmount = rentalAmount + platformFee + depositAmount;

  return {
    rental_id: `DRAFT-${normalizeVehicleId(vehicleDetail) || 'NEW'}`,
    status: 'PENDING',
    note,
    rental_start_date: startDate,
    rental_end_date: endDate,
    vehicle: {
      brand: vehicleDetail?.brand || '',
      model: vehicleDetail?.model || '',
      year: vehicleDetail?.year || '',
      license_plate: vehicleDetail?.license_plate || '',
      vehicle_type: vehicleDetail?.vehicle_type || '',
      fuel_type: vehicleDetail?.fuel_type || '',
      transmission: vehicleDetail?.transmission || '',
      seats: vehicleDetail?.seats || '',
      image: getVehicleMainImage(vehicleDetail),
      pickup_location: vehicleDetail?.pickup_location || 'Chưa cập nhật',
      return_location:
        vehicleDetail?.return_location || vehicleDetail?.pickup_location || 'Chưa cập nhật'
    },
    owner: {
      name: getDisplayName(owner),
      email: owner?.email || '',
      phone: owner?.phone || '',
      payout_info: {
        method: payout?.method || 'BANK',
        bank_name: payout?.bank_name || owner?.bank_name || '',
        bank_code: payout?.bank_code || owner?.bank_code || '',
        bank_account_number: payout?.bank_account_number || owner?.bank_account_number || '',
        bank_account_holder: payout?.bank_account_holder || owner?.bank_account_holder || '',
        card_brand: payout?.card_brand || '',
        card_last4: payout?.card_last4 || '',
        payout_note: payout?.payout_note || ''
      }
    },
    renter: {
      name: getDisplayName(renterUser),
      email: renterUser?.email || '',
      phone: renterUser?.phone || ''
    },
    pricing: {
      rental_days: rentalDays,
      daily_rate: dailyRate,
      deposit_amount: depositAmount,
      rental_amount: rentalAmount,
      platform_fee: platformFee,
      total_amount: totalAmount
    }
  };
}

function MessageBubble({ msg, isAgentMode, onSelectVehicle }) {
  const isUser = msg.role === 'user';

  return (
    <div className={`ai-chat-message ${isUser ? 'ai-chat-user' : 'ai-chat-ai'}`}>
      {!isUser ? <div className="ai-chat-avatar">🤖</div> : null}

      <div className="ai-chat-bubble">
        <p className="ai-chat-text">{msg.content}</p>

        {Array.isArray(msg.vehicles) && msg.vehicles.length > 0 ? (
          <div className="ai-vehicle-results">
            {msg.vehicles.map((vehicle, index) => (
              <div key={`${normalizeVehicleId(vehicle) || index}`} className="ai-vehicle-card">
                <img
                  src={getVehicleMainImage(vehicle)}
                  alt={vehicle.name || 'Phương tiện'}
                  className="ai-vehicle-img"
                  onError={(event) => {
                    event.currentTarget.src = getFallbackCarImage();
                  }}
                />
                <div className="ai-vehicle-info">
                  <h4 className="ai-vehicle-name">{vehicle.name || 'Phương tiện'}</h4>
                  <div className="ai-vehicle-meta">
                    <span className="ai-vehicle-price">
                      {Number(vehicle.pricePerDay || 0).toLocaleString('vi-VN')} VND/ngày
                    </span>
                    {vehicle.rating ? (
                      <span className="ai-vehicle-rating">⭐ {Number(vehicle.rating).toFixed(1)}</span>
                    ) : null}
                    {vehicle.trustScore ? (
                      <span className="ai-vehicle-trust">🛡️ {vehicle.trustScore}/100</span>
                    ) : null}
                  </div>
                  {vehicle.location ? <p className="ai-vehicle-location">📍 {vehicle.location}</p> : null}

                  <div className="flex flex-wrap gap-2">
                    <Link
                      to={vehicle.bookingUrl || `/vehicles/${normalizeVehicleId(vehicle)}`}
                      className="ai-book-btn"
                    >
                      Xem chi tiết
                    </Link>
                    {isAgentMode ? (
                      <button
                        type="button"
                        onClick={() => onSelectVehicle?.(vehicle)}
                        className="rounded-lg border border-cyan-300/40 bg-cyan-500/15 px-3 py-1 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-500/25"
                      >
                        Chọn xe này
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {Array.isArray(msg.alternatives) && msg.alternatives.length > 0 ? (
          <div className="ai-alternatives">
            <p className="ai-alt-title">Gợi ý thay thế:</p>
            {msg.alternatives.map((alternative, index) => (
              <div key={`${alternative.type || 'ALT'}-${index}`} className="ai-alt-item">
                <span className="ai-alt-icon">💡</span>
                <span className="ai-alt-text">{alternative.message}</span>
              </div>
            ))}
          </div>
        ) : null}

        {msg?.requestCta ? (
          <div className="mt-3">
            <Link
              to={msg.requestCta.to}
              className="inline-flex rounded-lg border border-emerald-300/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-500/20"
            >
              {msg.requestCta.label}
            </Link>
          </div>
        ) : null}

        <span className="ai-chat-time">
          {new Date(msg.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {isUser ? <div className="ai-chat-avatar ai-user-avatar">👤</div> : null}
    </div>
  );
}

export default function AIAssistantPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { pushToast } = useToast();

  const [mode, setMode] = useState(() => localStorage.getItem(MODE_STORAGE_KEY) || MODES.ASSISTANT);
  const [assistantMessages, setAssistantMessages] = useState(() =>
    readHistory(ASSISTANT_STORAGE_KEY, START_ASSISTANT_MESSAGE)
  );
  const [agentMessages, setAgentMessages] = useState(() =>
    readHistory(AGENT_STORAGE_KEY, START_AGENT_MESSAGE)
  );
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  const [agentStep, setAgentStep] = useState(AGENT_STEPS.COLLECT_REQUIREMENT);
  const [agentCandidates, setAgentCandidates] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedVehicleDetail, setSelectedVehicleDetail] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [note, setNote] = useState('');
  const [draftBill, setDraftBill] = useState(null);
  const [billOpen, setBillOpen] = useState(false);
  const [billSubmitting, setBillSubmitting] = useState(false);
  const [termsState, setTermsState] = useState({
    acceptedRules: false,
    acceptedPayment: false,
    acceptedApproval: false
  });

  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  const userId = useMemo(() => {
    return String(user?._id || user?.id || '').trim() || 'guest-user';
  }, [user]);

  const currentMessages = mode === MODES.ASSISTANT ? assistantMessages : agentMessages;

  useEffect(() => {
    persistHistory(ASSISTANT_STORAGE_KEY, assistantMessages);
  }, [assistantMessages]);

  useEffect(() => {
    persistHistory(AGENT_STORAGE_KEY, agentMessages);
  }, [agentMessages]);

  useEffect(() => {
    localStorage.setItem(MODE_STORAGE_KEY, mode);
  }, [mode]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages, mode]);

  const appendAssistantMessage = (message) => {
    setAssistantMessages((prev) => [...prev, message]);
  };

  const appendAgentMessage = (message) => {
    setAgentMessages((prev) => [...prev, message]);
  };

  const clearHistory = () => {
    if (mode === MODES.ASSISTANT) {
      const reset = [START_ASSISTANT_MESSAGE];
      setAssistantMessages(reset);
      persistHistory(ASSISTANT_STORAGE_KEY, reset);
      return;
    }
    const reset = [START_AGENT_MESSAGE];
    setAgentMessages(reset);
    persistHistory(AGENT_STORAGE_KEY, reset);
    setAgentStep(AGENT_STEPS.COLLECT_REQUIREMENT);
    setAgentCandidates([]);
    setSelectedVehicle(null);
    setSelectedVehicleDetail(null);
    setDraftBill(null);
    setBillOpen(false);
  };

  const loadVehicleDetail = async (vehicleSummary) => {
    const vehicleId = normalizeVehicleId(vehicleSummary);
    if (!vehicleId) {
      throw new Error('Không xác định được mã phương tiện.');
    }
    const response = await vehicleApi.getById(vehicleId);
    return response?.data?.data || response?.data || null;
  };

  const handleSelectVehicleForAgent = async (vehicleSummary) => {
    try {
      const detail = await loadVehicleDetail(vehicleSummary);
      if (!detail) {
        throw new Error('Không tìm thấy chi tiết phương tiện.');
      }

      const ownerId = String(detail?.owner?._id || detail?.owner_id || '');
      if (isAuthenticated && isSameUser(ownerId, userId)) {
        appendAgentMessage({
          role: 'ai',
          content:
            'Đây là phương tiện của bạn. Bạn không thể gửi yêu cầu thuê chính phương tiện do mình đăng. Mình sẽ gợi ý xe tương tự của chủ xe khác.',
          timestamp: Date.now()
        });
        setAgentStep(AGENT_STEPS.SUGGEST_VEHICLES);
        return;
      }

      const defaultDates = getDefaultDates();
      setSelectedVehicle(vehicleSummary);
      setSelectedVehicleDetail(detail);
      setStartDate(defaultDates.startDate);
      setEndDate(defaultDates.endDate);
      setDraftBill(null);
      setAgentStep(AGENT_STEPS.COLLECT_DATES);
      setTermsState({
        acceptedRules: false,
        acceptedPayment: false,
        acceptedApproval: false
      });

      appendAgentMessage({
        role: 'ai',
        content: `Đã chọn ${vehicleSummary?.name || 'phương tiện'}. Bạn kiểm tra ngày nhận/trả bên dưới, sau đó bấm "Tạo bill nháp" để xác nhận.`,
        timestamp: Date.now()
      });
    } catch (error) {
      appendAgentMessage({
        role: 'ai',
        content: getErrorMessage(error, 'Không tải được chi tiết xe. Bạn thử chọn xe khác giúp mình nhé.'),
        timestamp: Date.now()
      });
    }
  };

  const handleGenerateDraftBill = () => {
    if (!selectedVehicleDetail) {
      pushToast({
        tone: 'warning',
        title: 'Thiếu thông tin xe',
        message: 'Bạn cần chọn xe trước khi tạo bill.'
      });
      return;
    }

    if (!startDate || !endDate) {
      pushToast({
        tone: 'warning',
        title: 'Thiếu ngày thuê',
        message: 'Vui lòng chọn đầy đủ ngày nhận và ngày trả xe.'
      });
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const pickupDate = new Date(startDate);
    const returnDate = new Date(endDate);

    if (Number.isNaN(pickupDate.getTime()) || Number.isNaN(returnDate.getTime())) {
      pushToast({
        tone: 'warning',
        title: 'Ngày thuê không hợp lệ',
        message: 'Vui lòng nhập đúng định dạng ngày nhận/trả.'
      });
      return;
    }

    if (pickupDate <= today) {
      pushToast({
        tone: 'warning',
        title: 'Ngày nhận xe chưa hợp lệ',
        message: 'Ngày nhận xe phải sau ngày hiện tại.'
      });
      return;
    }

    if (returnDate < pickupDate) {
      pushToast({
        tone: 'warning',
        title: 'Ngày trả xe chưa hợp lệ',
        message: 'Ngày trả xe phải bằng hoặc sau ngày nhận xe.'
      });
      return;
    }

    const bill = buildDraftBill(selectedVehicleDetail, user, startDate, endDate, note);
    setDraftBill(bill);
    setBillOpen(true);
    setAgentStep(AGENT_STEPS.WAIT_CONFIRMATION);

    appendAgentMessage({
      role: 'ai',
      content:
        'Mình đã tạo bill nháp với thông tin chuyển khoản của chủ xe. Bạn kiểm tra và xác nhận để mình gửi yêu cầu thuê thật.',
      timestamp: Date.now()
    });
  };

  const isTermsAccepted =
    Boolean(termsState.acceptedRules) &&
    Boolean(termsState.acceptedPayment) &&
    Boolean(termsState.acceptedApproval);

  const submitRentalFromAgent = async () => {
    if (!draftBill || !selectedVehicleDetail) return;

    if (!isAuthenticated) {
      pushToast({
        tone: 'warning',
        title: 'Cần đăng nhập',
        message: 'Bạn cần đăng nhập để gửi yêu cầu thuê xe.'
      });
      navigate('/login');
      return;
    }

    const ownerId = String(selectedVehicleDetail?.owner?._id || selectedVehicleDetail?.owner_id || '');
    if (isSameUser(ownerId, userId)) {
      pushToast({
        tone: 'warning',
        title: 'Không thể tự thuê xe của mình',
        message: 'Hãy chọn phương tiện của chủ xe khác để tiếp tục.'
      });
      return;
    }

    if (!isTermsAccepted) {
      pushToast({
        tone: 'warning',
        title: 'Thiếu xác nhận điều khoản',
        message: 'Vui lòng xác nhận đủ điều khoản trước khi gửi yêu cầu thuê.'
      });
      return;
    }

    setBillSubmitting(true);
    setAgentStep(AGENT_STEPS.SUBMIT_REQUEST);

    try {
      const response = await rentalApi.createRequest({
        vehicle_id: normalizeVehicleId(selectedVehicleDetail),
        start_date: startDate,
        end_date: endDate,
        note
      });

      const rentalId =
        response?.data?.data?._id ||
        response?.data?._id ||
        response?.data?.id ||
        '';

      appendAgentMessage({
        role: 'ai',
        content: 'Đã gửi yêu cầu thuê thành công. Bạn có thể theo dõi trạng thái trong mục Yêu cầu thuê của tôi.',
        requestCta: { label: 'Xem yêu cầu thuê', to: '/app/requests?tab=pending' },
        timestamp: Date.now()
      });

      pushToast({
        tone: 'success',
        title: 'Đã gửi yêu cầu thuê',
        message: rentalId
          ? `Yêu cầu #${String(rentalId).slice(-6).toUpperCase()} đang chờ chủ xe xác nhận.`
          : 'Yêu cầu đang chờ chủ xe xác nhận.'
      });

      setAgentStep(AGENT_STEPS.DONE);
      setBillOpen(false);
      setAgentCandidates([]);
      setSelectedVehicle(null);
      setSelectedVehicleDetail(null);
      setDraftBill(null);
      setTermsState({
        acceptedRules: false,
        acceptedPayment: false,
        acceptedApproval: false
      });

      window.setTimeout(() => {
        navigate('/app/requests?tab=pending');
      }, 600);
    } catch (error) {
      appendAgentMessage({
        role: 'ai',
        content: getErrorMessage(error, 'Không thể gửi yêu cầu thuê lúc này. Bạn thử lại sau vài giây.'),
        timestamp: Date.now()
      });
      pushToast({
        tone: 'error',
        title: 'Gửi yêu cầu thất bại',
        message: getErrorMessage(error, 'Không thể gửi yêu cầu thuê.')
      });
      setAgentStep(AGENT_STEPS.WAIT_CONFIRMATION);
    } finally {
      setBillSubmitting(false);
    }
  };

  const sendToAssistant = async (text) => {
    appendAssistantMessage({
      role: 'user',
      content: text,
      timestamp: Date.now()
    });

    try {
      const data = await aiApi.chat(userId, text);
      appendAssistantMessage({
        role: 'ai',
        content:
          data?.message ||
          'Mình đã nhận yêu cầu nhưng chưa có đủ dữ liệu để đề xuất xe cụ thể. Bạn thử bổ sung khu vực hoặc ngân sách nhé.',
        vehicles: Array.isArray(data?.vehicles) ? data.vehicles : [],
        alternatives: Array.isArray(data?.alternatives) ? data.alternatives : [],
        timestamp: Date.now()
      });
    } catch (error) {
      appendAssistantMessage({
        role: 'ai',
        content: getErrorMessage(error, 'Kết nối AI đang bận. Bạn thử lại sau vài giây giúp mình nhé.'),
        timestamp: Date.now()
      });
    }
  };

  const sendToAgent = async (text) => {
    appendAgentMessage({
      role: 'user',
      content: text,
      timestamp: Date.now()
    });

    const selectedIndex = parseSelectionCommand(text, agentCandidates.length);
    if (selectedIndex >= 0) {
      await handleSelectVehicleForAgent(agentCandidates[selectedIndex]);
      return;
    }

    const extractedDates = extractDateRangeFromText(text);
    if (selectedVehicleDetail && extractedDates.startDate && extractedDates.endDate) {
      setStartDate(extractedDates.startDate);
      setEndDate(extractedDates.endDate);
      appendAgentMessage({
        role: 'ai',
        content: `Mình đã ghi nhận lịch thuê từ ${extractedDates.startDate} đến ${extractedDates.endDate}. Bạn bấm "Tạo bill nháp" để xác nhận.`,
        timestamp: Date.now()
      });
      setAgentStep(AGENT_STEPS.COLLECT_DATES);
      return;
    }

    try {
      const data = await aiApi.chat(userId, text);
      const vehicles = Array.isArray(data?.vehicles) ? data.vehicles : [];
      const alternatives = Array.isArray(data?.alternatives) ? data.alternatives : [];

      appendAgentMessage({
        role: 'ai',
        content:
          data?.message ||
          'Mình đã nhận yêu cầu. Bạn có thể chọn xe phía dưới để mình tiếp tục tạo bill và gửi yêu cầu thuê.',
        vehicles,
        alternatives,
        timestamp: Date.now()
      });

      setAgentCandidates(vehicles);
      if (vehicles.length > 0) {
        setAgentStep(AGENT_STEPS.SELECT_VEHICLE);
      } else {
        setAgentStep(AGENT_STEPS.SUGGEST_VEHICLES);
      }
    } catch (error) {
      appendAgentMessage({
        role: 'ai',
        content: getErrorMessage(error, 'Không thể gọi AI Agent ngay lúc này. Bạn thử lại sau vài giây.'),
        timestamp: Date.now()
      });
    }
  };

  const handleSend = async (messageText = input) => {
    const text = String(messageText || '').trim();
    if (!text || sending) return;

    setSending(true);
    setInput('');

    try {
      if (mode === MODES.ASSISTANT) {
        await sendToAssistant(text);
      } else {
        await sendToAgent(text);
      }
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const toggleTerm = (key, value) => {
    setTermsState((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="ai-assistant-page">
      <div className="ai-assistant-header">
        <div className="ai-header-left">
          <span className="ai-header-icon">🤖</span>
          <div>
            <h1 className="ai-header-title">AI Booking Assistant & Agent</h1>
            <p className="ai-header-sub">
              Assistant: tìm xe từ dữ liệu thật • Agent: hỗ trợ tạo bill và gửi yêu cầu thuê
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="ai-browse-btn" onClick={clearHistory}>
            Xóa lịch sử
          </button>
          <Link to="/vehicles" className="ai-browse-btn">
            Xem toàn bộ xe
          </Link>
        </div>
      </div>

      <div className="border-b border-white/10 bg-slate-950/60 px-6 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setMode(MODES.ASSISTANT)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
              mode === MODES.ASSISTANT
                ? 'border-cyan-300/70 bg-cyan-500 text-slate-950'
                : 'border-white/15 bg-white/5 text-slate-200 hover:bg-white/10'
            }`}
          >
            AI Assistant
          </button>
          <button
            type="button"
            onClick={() => setMode(MODES.AGENT)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
              mode === MODES.AGENT
                ? 'border-violet-300/70 bg-violet-500 text-white'
                : 'border-white/15 bg-white/5 text-slate-200 hover:bg-white/10'
            }`}
          >
            AI Agent
          </button>
          {mode === MODES.AGENT ? (
            <span className="rounded-full border border-violet-300/30 bg-violet-500/10 px-3 py-1 text-[11px] text-violet-100">
              Bước hiện tại: {STEP_LABELS[agentStep]}
            </span>
          ) : (
            <span className="rounded-full border border-cyan-300/30 bg-cyan-500/10 px-3 py-1 text-[11px] text-cyan-100">
              Tìm xe theo dữ liệu thực tế DB
            </span>
          )}
        </div>
      </div>

      <div className="ai-chat-area" id="ai-chat-area">
        {currentMessages.map((msg, index) => (
          <MessageBubble
            key={`${msg.role}-${msg.timestamp}-${index}`}
            msg={msg}
            isAgentMode={mode === MODES.AGENT}
            onSelectVehicle={handleSelectVehicleForAgent}
          />
        ))}
        {sending ? (
          <div className="ai-chat-message ai-chat-ai">
            <div className="ai-chat-avatar">🤖</div>
            <div className="ai-chat-bubble ai-typing-bubble">
              <span className="ai-typing-dot" />
              <span className="ai-typing-dot" />
              <span className="ai-typing-dot" />
            </div>
          </div>
        ) : null}
        <div ref={chatEndRef} />
      </div>

      {mode === MODES.AGENT ? (
        <div className="border-t border-white/10 bg-slate-900/35 px-6 py-4">
          <div className="grid gap-3 lg:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-slate-950/45 p-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Xe đã chọn</p>
              {selectedVehicleDetail ? (
                <div className="mt-2 flex items-start gap-3">
                  <img
                    src={getVehicleMainImage(selectedVehicleDetail)}
                    alt={selectedVehicle?.name || 'Xe đã chọn'}
                    className="h-16 w-24 rounded-lg border border-white/10 object-cover"
                    onError={(event) => {
                      event.currentTarget.src = getFallbackCarImage();
                    }}
                  />
                  <div className="text-sm text-slate-200">
                    <p className="font-semibold text-white">
                      {selectedVehicle?.name || `${selectedVehicleDetail?.brand || ''} ${selectedVehicleDetail?.model || ''}`}
                    </p>
                    <p>
                      Giá thuê/ngày:{' '}
                      <span className="font-semibold text-cyan-200">
                        {Number(selectedVehicleDetail?.daily_rate || 0).toLocaleString('vi-VN')} VND
                      </span>
                    </p>
                    <p className="text-xs text-slate-300">
                      Chủ xe: {getDisplayName(selectedVehicleDetail?.owner)}
                    </p>
                    <p className="text-xs text-slate-300">
                      Nhận xe tại: {selectedVehicleDetail?.pickup_location || 'Chưa cập nhật'}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-sm text-slate-300">
                  Chưa chọn xe. Bạn có thể nhập yêu cầu hoặc bấm "Chọn xe này" trong danh sách gợi ý.
                </p>
              )}
            </div>

            <div className="rounded-xl border border-white/10 bg-slate-950/45 p-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Thiết lập đặt xe</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <label className="text-xs text-slate-300">
                  Ngày nhận xe
                  <input
                    type="date"
                    value={startDate}
                    onChange={(event) => setStartDate(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900/80 px-2 py-1.5 text-sm text-white outline-none"
                  />
                </label>
                <label className="text-xs text-slate-300">
                  Ngày trả xe
                  <input
                    type="date"
                    value={endDate}
                    onChange={(event) => setEndDate(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900/80 px-2 py-1.5 text-sm text-white outline-none"
                  />
                </label>
              </div>
              <label className="mt-2 block text-xs text-slate-300">
                Ghi chú cho chủ xe
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900/80 px-2 py-1.5 text-sm text-white outline-none"
                  placeholder="Ví dụ: Mình cần nhận xe đúng 8:00 sáng."
                />
              </label>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleGenerateDraftBill}
                  className="rounded-lg bg-violet-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-violet-400"
                  disabled={!selectedVehicleDetail}
                >
                  Tạo bill nháp
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedVehicle(null);
                    setSelectedVehicleDetail(null);
                    setDraftBill(null);
                    setBillOpen(false);
                    setAgentStep(AGENT_STEPS.COLLECT_REQUIREMENT);
                    setStartDate('');
                    setEndDate('');
                    setNote('');
                  }}
                  className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/10"
                >
                  Đặt lại
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {currentMessages.length <= 1 ? (
        <div className="ai-suggestions">
          <p className="ai-suggestions-label">Gợi ý câu lệnh nhanh</p>
          <div className="ai-suggestions-list">
            {SUGGESTED_MESSAGES.map((sample, index) => (
              <button
                key={`suggestion-${index}`}
                type="button"
                className="ai-suggestion-chip"
                onClick={() => handleSend(sample)}
              >
                {sample}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="ai-chat-input-area">
        <textarea
          ref={inputRef}
          className="ai-chat-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            mode === MODES.AGENT
              ? 'Ví dụ: Đặt giúp tôi xe 7 chỗ ở TP.HCM, ngân sách 1.6 triệu/ngày'
              : 'Ví dụ: Tôi cần xe máy ở Thủ Đức, giá dưới 700k/ngày'
          }
          rows={2}
          disabled={sending}
        />
        <button
          type="button"
          className={`ai-chat-send-btn ${sending ? 'sending' : ''}`}
          onClick={() => handleSend()}
          disabled={sending || !input.trim()}
          title="Gửi"
        >
          {sending ? '…' : '➤'}
        </button>
      </div>

      <RentalBillModal
        open={billOpen}
        onClose={() => setBillOpen(false)}
        title="Bill xác nhận yêu cầu thuê (AI Agent)"
        bill={draftBill}
        showRenter
        showTerms
        termsState={termsState}
        onToggleTerm={toggleTerm}
        onConfirm={submitRentalFromAgent}
        confirmDisabled={!isTermsAccepted || billSubmitting}
        confirmLabel={isAuthenticated ? 'Gửi yêu cầu thuê' : 'Đăng nhập để gửi yêu cầu'}
        loading={billSubmitting}
      />
    </div>
  );
}

