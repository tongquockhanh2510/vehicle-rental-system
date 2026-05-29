import React, { useEffect, useState } from 'react';
import { Bot, Lightbulb, ShieldAlert, Sparkles } from 'lucide-react';
import { aiAgentApi } from '../../api';
import AIInsightCard from '../../components/common/AIInsightCard';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import PremiumButton from '../../components/common/PremiumButton';
import SectionHeader from '../../components/common/SectionHeader';

export default function AdminAIAgentPage() {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priceInput, setPriceInput] = useState({ base_price: 800000 });
  const [priceResult, setPriceResult] = useState(null);

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
    const response = await aiAgentApi.suggestPricing(priceInput);
    setPriceResult(response.data || null);
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Trung tâm AI Agent"
        subtitle="Không gian mô phỏng AI agent cho định giá, phát hiện rủi ro, tóm tắt tranh chấp và gợi ý phương tiện."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-violet-400/30 bg-violet-500/10 p-4 text-sm text-violet-100">
          <p className="inline-flex items-center gap-2 font-semibold"><Sparkles className="h-4 w-4" /> AI định giá động</p>
          <p className="mt-2">Gợi ý giá thuê theo loại xe, khu vực, mùa vụ và tỷ lệ lấp đầy.</p>
        </article>
        <article className="rounded-2xl border border-blue-400/30 bg-blue-500/10 p-4 text-sm text-blue-100">
          <p className="inline-flex items-center gap-2 font-semibold"><ShieldAlert className="h-4 w-4" /> AI phát hiện gian lận</p>
          <p className="mt-2">Phát hiện yêu cầu thuê bất thường dựa trên tín hiệu hành vi.</p>
        </article>
        <article className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-4 text-sm text-cyan-100">
          <p className="inline-flex items-center gap-2 font-semibold"><Lightbulb className="h-4 w-4" /> AI tóm tắt tranh chấp</p>
          <p className="mt-2">Tóm tắt bằng chứng tranh chấp trước/sau và đề xuất mức bồi thường.</p>
        </article>
        <article className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
          <p className="inline-flex items-center gap-2 font-semibold"><Bot className="h-4 w-4" /> AI gợi ý phương tiện</p>
          <p className="mt-2">Gợi ý phương tiện phù hợp cho người thuê theo mục đích chuyến đi.</p>
        </article>
      </section>

      <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
        <h3 className="text-lg font-semibold text-white">Mô phỏng định giá AI cho chủ xe</h3>
        <div className="mt-3 flex flex-wrap items-end gap-2">
          <label className="text-sm text-slate-300">
            Giá cơ sở (VND/ngày)
            <input
              type="number"
              value={priceInput.base_price}
              onChange={(event) => setPriceInput({ base_price: Number(event.target.value || 0) })}
              className="mt-1 block rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-white outline-none"
            />
          </label>
            <PremiumButton onClick={runPricing}>Chạy mô phỏng định giá</PremiumButton>
        </div>

        {priceResult ? (
          <div className="mt-4 grid gap-3 md:grid-cols-3 text-sm">
            <div className="rounded-xl border border-white/10 bg-slate-950/40 p-3 text-slate-200">Giá tối thiểu: <span className="font-semibold text-white">{Number(priceResult.min_price || 0).toLocaleString('vi-VN')} đ</span></div>
            <div className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 p-3 text-cyan-100">Giá đề xuất: <span className="font-semibold text-white">{Number(priceResult.recommended_price || 0).toLocaleString('vi-VN')} đ</span></div>
            <div className="rounded-xl border border-white/10 bg-slate-950/40 p-3 text-slate-200">Giá tối đa: <span className="font-semibold text-white">{Number(priceResult.max_price || 0).toLocaleString('vi-VN')} đ</span></div>
          </div>
        ) : null}
      </article>

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
