import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { rentalApi, reviewApi } from '../../api';
import EmptyState from '../../components/common/EmptyState';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import SectionHeader from '../../components/common/SectionHeader';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { compactId, pickArray } from '../../utils/formatters';
import { getRentalBillPayload, normalizeRentalStatus } from '../../utils/rentalBill';

const defaultForm = {
  rental_id: '',
  rating: 5,
  comment: ''
};

function StarRating({ value, onChange }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((point) => (
        <button key={point} type="button" onClick={() => onChange(point)}>
          <Star
            className={`h-5 w-5 ${
              point <= value
                ? 'fill-amber-300 text-amber-300'
                : 'text-slate-500'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function dedupeById(rows = []) {
  const map = new Map();
  rows.forEach((row) => {
    const key = String(row?._id || '');
    if (!key) return;
    if (!map.has(key)) map.set(key, row);
  });
  return Array.from(map.values());
}

export default function ReviewsPage() {
  const { userId } = useAuth();
  const { pushToast } = useToast();
  const [rentals, setRentals] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [renterRes, ownerRes, reviewRes] = await Promise.allSettled([
        rentalApi.getRenterRequests(),
        rentalApi.getOwnerRequests(),
        userId ? reviewApi.getByReviewer(userId) : Promise.resolve({ data: [] })
      ]);

      const renterRows = renterRes.status === 'fulfilled' ? pickArray(renterRes.value.data) : [];
      const ownerRows = ownerRes.status === 'fulfilled' ? pickArray(ownerRes.value.data) : [];
      setRentals(dedupeById([...renterRows, ...ownerRows]));
      setReviews(reviewRes.status === 'fulfilled' ? pickArray(reviewRes.value.data) : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const completedRentals = useMemo(
    () => rentals.filter((item) => normalizeRentalStatus(item.status) === 'COMPLETED'),
    [rentals]
  );

  const reviewedRentalIds = useMemo(() => {
    const set = new Set();
    reviews.forEach((review) => {
      const rentalId = String(review.rental_request_id || review.contract_id || '');
      if (rentalId) set.add(rentalId);
    });
    return set;
  }, [reviews]);

  const pendingReviewRentals = useMemo(
    () =>
      completedRentals.filter(
        (rental) => !reviewedRentalIds.has(String(rental._id || ''))
      ),
    [completedRentals, reviewedRentalIds]
  );

  useEffect(() => {
    if (!pendingReviewRentals.length) {
      setForm(defaultForm);
      return;
    }
    setForm((prev) => ({
      ...prev,
      rental_id: prev.rental_id || String(pendingReviewRentals[0]._id || '')
    }));
  }, [pendingReviewRentals]);

  const selectedRental = useMemo(
    () =>
      pendingReviewRentals.find(
        (item) => String(item._id || '') === String(form.rental_id || '')
      ),
    [pendingReviewRentals, form.rental_id]
  );

  const reviewTarget = useMemo(() => {
    if (!selectedRental || !userId) return null;
    const bill = getRentalBillPayload(selectedRental);
    const renterId = String(selectedRental.renter_id || '');
    const ownerId = String(selectedRental.owner_id || '');
    const isCurrentRenter = String(userId) === renterId;
    return {
      reviewee_id: isCurrentRenter ? ownerId : renterId,
      role: isCurrentRenter ? 'OWNER' : 'RENTER',
      display_name: isCurrentRenter
        ? bill?.owner?.name || `#${compactId(ownerId)}`
        : bill?.renter?.name || `#${compactId(renterId)}`
    };
  }, [selectedRental, userId]);

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedRental || !reviewTarget?.reviewee_id || !userId) return;

    setSubmitting(true);
    try {
      await reviewApi.create({
        rental_request_id: selectedRental._id,
        vehicle_id: selectedRental.vehicle_id,
        reviewed_user_id: reviewTarget.reviewee_id,
        rating: Number(form.rating),
        comment: form.comment,
        reviewer_id: userId
      });
      pushToast({
        tone: 'success',
        title: 'Đã gửi đánh giá',
        message: 'Đánh giá của bạn đã được ghi nhận.'
      });
      setForm(defaultForm);
      await loadData();
    } catch (error) {
      pushToast({
        tone: 'error',
        title: 'Gửi thất bại',
        message: error?.response?.data?.error || 'Không thể gửi đánh giá.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton rows={4} />;
  }

  if (!completedRentals.length) {
    return (
      <div className="space-y-6">
        <SectionHeader
          title="Đánh giá"
          subtitle="Đánh giá chỉ được mở sau khi hợp đồng thuê xe đã hoàn tất."
        />
        <EmptyState
          title="Chưa có chuyến đi hoàn tất"
          description="Bạn chỉ có thể đánh giá sau khi hợp đồng thuê xe đã hoàn tất."
          action={
            <Link
              to="/app/explore"
              className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950"
            >
              Khám phá phương tiện
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Đánh giá"
        subtitle="Chỉ có thể đánh giá các chuyến thuê đã hoàn tất và chưa được review."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        {pendingReviewRentals.length ? (
          <form
            onSubmit={handleSubmit}
            className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4"
          >
            <h3 className="text-lg font-semibold text-white">Gửi đánh giá</h3>

            <label className="block text-xs uppercase tracking-[0.18em] text-slate-300">
              Chuyến thuê đã hoàn tất
              <select
                value={form.rental_id}
                onChange={(event) => setField('rental_id', event.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white outline-none"
              >
                {pendingReviewRentals.map((rental) => {
                  const bill = getRentalBillPayload(rental);
                  const title = `${bill?.vehicle?.brand || 'Xe'} ${bill?.vehicle?.model || ''}`.trim();
                  return (
                    <option key={rental._id} value={rental._id}>
                      #{compactId(rental._id)} - {title}
                    </option>
                  );
                })}
              </select>
            </label>

            {selectedRental ? (
              <div className="rounded-xl border border-white/10 bg-slate-950/40 p-3 text-xs text-slate-300">
                <p>
                  Phương tiện:{' '}
                  <span className="text-white">
                    {(getRentalBillPayload(selectedRental)?.vehicle?.brand || 'Xe') +
                      ' ' +
                      (getRentalBillPayload(selectedRental)?.vehicle?.model || '')}
                  </span>
                </p>
                <p>
                  Người được đánh giá:{' '}
                  <span className="text-white">{reviewTarget?.display_name || 'Chưa cập nhật'}</span>
                </p>
              </div>
            ) : null}

            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Số sao</p>
              <div className="mt-2">
                <StarRating
                  value={form.rating}
                  onChange={(point) => setField('rating', point)}
                />
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
        ) : (
          <EmptyState
            title="Đã đánh giá hết các chuyến thuê hoàn tất"
            description="Không còn chuyến COMPLETED nào chờ đánh giá."
          />
        )}

        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
          <h3 className="text-lg font-semibold text-white">Lịch sử đánh giá</h3>
          {!reviews.length ? (
            <EmptyState
              title="Chưa có lịch sử đánh giá"
              description="Các đánh giá bạn đã gửi sẽ hiển thị tại đây."
            />
          ) : (
            <div className="mt-4 space-y-3">
              {reviews.map((review) => (
                <article
                  key={review._id}
                  className="rounded-xl border border-white/10 bg-slate-950/40 p-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">
                      Review #{compactId(review._id)}
                    </p>
                    <span className="text-sm text-amber-300">
                      {Number(review.rating || 0).toFixed(1)} / 5
                    </span>
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

