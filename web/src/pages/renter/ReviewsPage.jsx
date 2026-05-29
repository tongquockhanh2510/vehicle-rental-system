import React, { useEffect, useMemo, useState } from 'react';
import { Star } from 'lucide-react';
import { contractApi, reviewApi } from '../../api';
import EmptyState from '../../components/common/EmptyState';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import SectionHeader from '../../components/common/SectionHeader';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { pickArray } from '../../utils/formatters';

const defaultForm = {
  rental_request_id: '',
  reviewed_user_id: '',
  vehicle_id: '',
  rating: 5,
  comment: ''
};

function StarRating({ value, onChange }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((point) => (
        <button key={point} type="button" onClick={() => onChange(point)}>
          <Star className={`h-5 w-5 ${point <= value ? 'fill-amber-300 text-amber-300' : 'text-slate-500'}`} />
        </button>
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const { userId } = useAuth();
  const { pushToast } = useToast();
  const [contracts, setContracts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const selectedContract = useMemo(
    () => contracts.find((item) => String(item.rental_request_id || item._id) === String(form.rental_request_id)),
    [contracts, form.rental_request_id]
  );

  const loadData = async () => {
    setLoading(true);
    try {
      const [contractRes, reviewRes] = await Promise.allSettled([
        contractApi.getRenterContracts(),
        userId ? reviewApi.getByUser(userId) : Promise.resolve({ data: [] })
      ]);

      const contractRows = contractRes.status === 'fulfilled' ? pickArray(contractRes.value.data) : [];
      setContracts(contractRows);
      if (!form.rental_request_id && contractRows.length) {
        const first = contractRows[0];
        setForm((prev) => ({
          ...prev,
          rental_request_id: first.rental_request_id || first._id,
          vehicle_id: first.vehicle_id || '',
          reviewed_user_id: first.owner_id || ''
        }));
      }

      setReviews(reviewRes.status === 'fulfilled' ? pickArray(reviewRes.value.data) : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    if (!selectedContract) return;
    setForm((prev) => ({
      ...prev,
      vehicle_id: prev.vehicle_id || selectedContract.vehicle_id || '',
      reviewed_user_id: prev.reviewed_user_id || selectedContract.owner_id || ''
    }));
  }, [selectedContract]);

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!userId) return;

    setSubmitting(true);
    try {
      await reviewApi.create({
        ...form,
        rating: Number(form.rating),
        reviewer_id: userId
      });
      pushToast({ tone: 'success', title: 'Đã gửi đánh giá', message: 'Đánh giá của bạn đã được ghi nhận.' });
      setForm((prev) => ({ ...defaultForm, rental_request_id: prev.rental_request_id }));
      loadData();
    } catch (error) {
      pushToast({ tone: 'error', title: 'Gửi thất bại', message: error?.response?.data?.error || 'Không thể gửi đánh giá.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton rows={4} />;
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Đánh giá"
        subtitle="Đánh giá minh bạch giúp nền tảng giữ chất lượng dịch vụ và xây dựng niềm tin giữa người thuê và chủ xe."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4">
          <h3 className="text-lg font-semibold text-white">Gửi đánh giá</h3>

          <label className="block text-xs uppercase tracking-[0.18em] text-slate-300">
            Yêu cầu thuê
            <select
              value={form.rental_request_id}
              onChange={(event) => setField('rental_request_id', event.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white outline-none"
            >
              {contracts.map((contract) => {
                const rentalRequestId = contract.rental_request_id || contract._id;
                return (
                  <option key={contract._id} value={rentalRequestId}>
                    {String(rentalRequestId).slice(-8)}
                  </option>
                );
              })}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-2">
            <label className="block text-xs uppercase tracking-[0.18em] text-slate-300">
              Mã xe
              <input
                value={form.vehicle_id}
                onChange={(event) => setField('vehicle_id', event.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white outline-none"
                required
              />
            </label>
            <label className="block text-xs uppercase tracking-[0.18em] text-slate-300">
              Mã người được đánh giá
              <input
                value={form.reviewed_user_id}
                onChange={(event) => setField('reviewed_user_id', event.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white outline-none"
                required
              />
            </label>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Số sao</p>
            <div className="mt-2">
              <StarRating value={form.rating} onChange={(point) => setField('rating', point)} />
            </div>
          </div>

          <label className="block text-xs uppercase tracking-[0.18em] text-slate-300">
            Nhận xét
            <textarea
              rows={4}
              value={form.comment}
              onChange={(event) => setField('comment', event.target.value)}
              required
              className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white outline-none"
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:bg-slate-600"
          >
            {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
          </button>
        </form>

        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
          <h3 className="text-lg font-semibold text-white">Lịch sử đánh giá</h3>
          {!reviews.length ? (
            <EmptyState
              title="Chưa có lịch sử đánh giá"
              description="Các đánh giá bạn nhận được sẽ xuất hiện tại đây."
            />
          ) : (
            <div className="mt-4 space-y-3">
              {reviews.map((review) => (
                <article key={review._id} className="rounded-xl border border-white/10 bg-slate-950/40 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">Người đánh giá #{String(review.reviewer_id || '').slice(-6)}</p>
                    <span className="text-sm text-amber-300">{Number(review.rating || 0).toFixed(1)} / 5</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-300">{review.comment || '--'}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
