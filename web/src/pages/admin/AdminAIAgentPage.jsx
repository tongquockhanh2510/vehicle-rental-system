import React, { useEffect, useMemo, useState } from 'react';
import { Bot, Lightbulb, ShieldAlert, Sparkles } from 'lucide-react';
import { aiAgentApi } from '../../api';
import AIInsightCard from '../../components/common/AIInsightCard';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import PremiumButton from '../../components/common/PremiumButton';
import SectionHeader from '../../components/common/SectionHeader';
import { VEHICLE_TYPE_OPTIONS } from '../../constants/vehicle';

export default function AdminAIAgentPage() {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priceInput, setPriceInput] = useState({
    base_price: 800000,
    vehicle_type: 'CAR',
    city: 'TP_HCM'
  });
  const [pricingLoading, setPricingLoading] = useState(false);
  const [priceResult, setPriceResult] = useState(null);

  const [suggestPayload, setSuggestPayload] = useState({
    purpose: 'Đi công tác nội thành',
    seats: 4,
    budget_per_day: 900000,
    city: 'TP_HCM'
  });
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const aiConfigured = Boolean(import.meta.env.VITE_GEMINI_API_KEY);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await aiAgentApi.getInsights();
        setInsights(Array.isArray(response.data) ? response.data : []);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const runPricing = async () => {
    setPricingLoading(true);
    try {
      const response = await aiAgentApi.suggestPricing(priceInput);
      setPriceResult(response.data || null);
    } finally {
      setPricingLoading(false);
    }
  };

  const runVehicleSuggest = async () => {
    setSuggestLoading(true);
    try {
      const response = await aiAgentApi.suggestVehicle(suggestPayload);
      const rows = Array.isArray(response?.data?.recommendations)
        ? response.data.recommendations
        : [];
      setSuggestions(rows);
    } finally {
      setSuggestLoading(false);
    }
  };

  const recommendationTone = useMemo(() => {
    if (!priceResult?.recommended_price || !priceInput?.base_price) return 'text-slate-200';
    return Number(priceResult.recommended_price) >= Number(priceInput.base_price)
      ? 'text-emerald-200'
      : 'text-amber-200';
  }, [priceResult, priceInput]);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Trung tâm AI Agent"
        subtitle="AI hỗ trợ định giá, phát hiện rủi ro, tóm tắt tranh chấp và gợi ý phương tiện theo dữ liệu vận hành."
      />

      <div
        className={`rounded-2xl border px-4 py-3 text-sm ${
          aiConfigured
            ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100'
            : 'border-amber-400/30 bg-amber-500/10 text-amber-100'
        }`}
      >
        {aiConfigured
          ? 'Gemini key đã cấu hình. Hệ thống ưu tiên gọi AI thật, fallback mock khi endpoint nội bộ chưa sẵn sàng.'
          : 'Chưa có VITE_GEMINI_API_KEY. Hệ thống đang chạy fallback mock để không làm gián đoạn demo.'}
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-violet-400/30 bg-violet-500/10 p-4 text-sm text-violet-100">
          <p className="inline-flex items-center gap-2 font-semibold"><Sparkles className="h-4 w-4" /> AI định giá động</p>
          <p className="mt-2">Gợi ý giá thuê theo loại xe, khu vực, mùa vụ và tỷ lệ lấp đầy.</p>
        </article>
        <article className="rounded-2xl border border-blue-400/30 bg-blue-500/10 p-4 text-sm text-blue-100">
          <p className="inline-flex items-center gap-2 font-semibold"><ShieldAlert className="h-4 w-4" /> AI phát hiện gian lận</p>
          <p className="mt-2">Đánh dấu yêu cầu thuê bất thường dựa trên tín hiệu hành vi.</p>
        </article>
        <article className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-4 text-sm text-cyan-100">
          <p className="inline-flex items-center gap-2 font-semibold"><Lightbulb className="h-4 w-4" /> AI tóm tắt tranh chấp</p>
          <p className="mt-2">Tóm tắt bằng chứng trước/sau và đề xuất hướng xử lý ban đầu.</p>
        </article>
        <article className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
          <p className="inline-flex items-center gap-2 font-semibold"><Bot className="h-4 w-4" /> AI gợi ý phương tiện</p>
          <p className="mt-2">Đề xuất phương tiện phù hợp theo nhu cầu, ngân sách và địa điểm.</p>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
          <h3 className="text-lg font-semibold text-white">AI định giá cho chủ xe</h3>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <label className="text-sm text-slate-300">
              Giá cơ sở (VND/ngày)
              <input
                type="number"
                value={priceInput.base_price}
                onChange={(event) =>
                  setPriceInput((prev) => ({ ...prev, base_price: Number(event.target.value || 0) }))
                }
                className="mt-1 block w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-white outline-none"
              />
            </label>
            <label className="text-sm text-slate-300">
              Loại phương tiện
              <select
                value={priceInput.vehicle_type}
                onChange={(event) => setPriceInput((prev) => ({ ...prev, vehicle_type: event.target.value }))}
                className="mt-1 block w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-white outline-none"
              >
                {VEHICLE_TYPE_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="mt-3">
            <PremiumButton onClick={runPricing} disabled={pricingLoading}>
              {pricingLoading ? 'Đang phân tích...' : 'Chạy mô phỏng định giá'}
            </PremiumButton>
          </div>

          {priceResult ? (
            <div className="mt-4 grid gap-3 md:grid-cols-3 text-sm">
              <div className="rounded-xl border border-white/10 bg-slate-950/40 p-3 text-slate-200">
                Giá tối thiểu: <span className="font-semibold text-white">{Number(priceResult.min_price || 0).toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 p-3">
                Giá đề xuất: <span className={`font-semibold ${recommendationTone}`}>{Number(priceResult.recommended_price || 0).toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="rounded-xl border border-white/10 bg-slate-950/40 p-3 text-slate-200">
                Giá tối đa: <span className="font-semibold text-white">{Number(priceResult.max_price || 0).toLocaleString('vi-VN')} đ</span>
              </div>
            </div>
          ) : null}

          {priceResult?.rationale ? (
            <p className="mt-3 text-sm text-slate-300">{priceResult.rationale}</p>
          ) : null}
        </article>

        <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
          <h3 className="text-lg font-semibold text-white">AI gợi ý phương tiện cho người thuê</h3>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <label className="text-sm text-slate-300">
              Mục đích chuyến đi
              <input
                type="text"
                value={suggestPayload.purpose}
                onChange={(event) =>
                  setSuggestPayload((prev) => ({ ...prev, purpose: event.target.value }))
                }
                className="mt-1 block w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-white outline-none"
              />
            </label>
            <label className="text-sm text-slate-300">
              Ngân sách/ngày (VND)
              <input
                type="number"
                value={suggestPayload.budget_per_day}
                onChange={(event) =>
                  setSuggestPayload((prev) => ({ ...prev, budget_per_day: Number(event.target.value || 0) }))
                }
                className="mt-1 block w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-white outline-none"
              />
            </label>
          </div>
          <div className="mt-3">
            <PremiumButton onClick={runVehicleSuggest} disabled={suggestLoading}>
              {suggestLoading ? 'Đang gợi ý...' : 'Chạy gợi ý phương tiện'}
            </PremiumButton>
          </div>

          {suggestions.length ? (
            <div className="mt-4 space-y-2">
              {suggestions.map((item, index) => (
                <div key={`${item.vehicle_type}-${index}`} className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-slate-200">
                  <p className="font-semibold text-white">{item.vehicle_type}</p>
                  <p className="mt-1 text-xs text-slate-300">{item.reason}</p>
                </div>
              ))}
            </div>
          ) : null}
        </article>
      </section>

      <section>
        <h3 className="mb-3 text-lg font-semibold text-white">Gợi ý từ AI</h3>
        {loading ? (
          <LoadingSkeleton rows={3} />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {insights.map((item) => (
              <AIInsightCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

