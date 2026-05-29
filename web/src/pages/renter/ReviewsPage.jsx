import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { contractApi, reviewApi } from '../../api';
import EmptyState from '../../components/common/EmptyState';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import SectionHeader from '../../components/common/SectionHeader';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatDate, pickArray } from '../../utils/formatters';

const defaultForm = {
  contract_id: '',
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

function getContractStatus(contract) {
  return String(contract.status || contract.contract_status || '').toUpperCase();
}

function getContractReviewKey(contract) {
  return String(contract.rental_request_id || contract._id || '');
}

export default function ReviewsPage() {
  const { userId } = useAuth();
  const { pushToast } = useToast();
  const [contracts, setContracts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [renterRes, ownerRes, reviewRes] = await Promise.allSettled([
        contractApi.getRenterContracts(),
        contractApi.getOwnerContracts(),
        userId ? reviewApi.getByUser(userId) : Promise.resolve({ data: [] })
      ]);

      const renterContracts = renterRes.status === 'fulfilled' ? pickArray(renterRes.value.data) : [];
      const ownerContracts = ownerRes.status === 'fulfilled' ? pickArray(ownerRes.value.data) : [];
      const merged = [...renterContracts, ...ownerContracts];

      const dedupMap = new Map();
      merged.forEach((item) => {
        const key = String(item._id || item.rental_request_id || Math.random());
        if (!dedupMap.has(key)) dedupMap.set(key, item);
      });
      const mergedContracts = Array.from(dedupMap.values());

      setContracts(mergedContracts);
      setReviews(reviewRes.status === 'fulfilled' ? pickArray(reviewRes.value.data) : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const completedContracts = useMemo(
    () => contracts.filter((contract) => getContractStatus(contract) === 'COMPLETED'),
    [contracts]
  );

  const reviewedKeys = useMemo(() => {
    const set = new Set();
    reviews.forEach((review) => {
      const key = String(review.rental_request_id || review.contract_id || review._id || '');
      if (key) set.add(key);
    });
    return set;
  }, [reviews]);

  const pendingReviewContracts = useMemo(
    () => completedContracts.filter((contract) => !reviewedKeys.has(getContractReviewKey(contract))),
    [completedContracts, reviewedKeys]
  );

  useEffect(() => {
    if (!pendingReviewContracts.length) {
      setForm(defaultForm);
      return;
    }
    const defaultId = String(pendingReviewContracts[0]._id || '');
    setForm((prev) => ({ ...prev, contract_id: prev.contract_id || defaultId }));
  }, [pendingReviewContracts]);

  const selectedContract = useMemo(
    () => pendingReviewContracts.find((item) => String(item._id) === String(form.contract_id)),
    [pendingReviewContracts, form.contract_id]
  );

  const reviewedUserId = useMemo(() => {
    if (!selectedContract || !userId) return '';
    const ownerId = String(selectedContract.owner_id || '');
    const renterId = String(selectedContract.renter_id || '');
    return String(userId) === ownerId ? renterId : ownerId;
  }, [selectedContract, userId]);

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedContract || !reviewedUserId || !userId) return;

    setSubmitting(true);
    try {
      await reviewApi.create({
        rental_request_id: selectedContract.rental_request_id || selectedContract._id,
        contract_id: selectedContract._id,
        vehicle_id: selectedContract.vehicle_id,
        reviewed_user_id: reviewedUserId,
        rating: Number(form.rating),
        comment: form.comment,
        reviewer_id: userId
      });
      pushToast({ tone: 'success', title: '\u0110\u00e3 g\u1eedi \u0111\u00e1nh gi\u00e1', message: '\u0110\u00e1nh gi\u00e1 c\u1ee7a b\u1ea1n \u0111\u00e3 \u0111\u01b0\u1ee3c ghi nh\u1eadn.' });
      setForm(defaultForm);
      await loadData();
    } catch (error) {
      pushToast({ tone: 'error', title: 'G\u1eedi th\u1ea5t b\u1ea1i', message: error?.response?.data?.error || 'Kh\u00f4ng th\u1ec3 g\u1eedi \u0111\u00e1nh gi\u00e1.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton rows={4} />;
  }

  if (!completedContracts.length) {
    return (
      <div className="space-y-6">
        <SectionHeader
          title="\u0110\u00e1nh gi\u00e1"
          subtitle="\u0110\u00e1nh gi\u00e1 ch\u1ec9 \u0111\u01b0\u1ee3c m\u1edf sau khi h\u1ee3p \u0111\u1ed3ng thu\u00ea xe \u0111\u00e3 ho\u00e0n t\u1ea5t."
        />
        <EmptyState
          title="Ch\u01b0a c\u00f3 chuy\u1ebfn \u0111i ho\u00e0n t\u1ea5t"
          description="B\u1ea1n ch\u1ec9 c\u00f3 th\u1ec3 \u0111\u00e1nh gi\u00e1 sau khi ho\u00e0n t\u1ea5t m\u1ed9t h\u1ee3p \u0111\u1ed3ng thu\u00ea xe."
          action={<Link to="/app/explore" className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950">Kh\u00e1m ph\u00e1 ph\u01b0\u01a1ng ti\u1ec7n</Link>}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="\u0110\u00e1nh gi\u00e1"
        subtitle="Ch\u1ec9 c\u00f3 th\u1ec3 \u0111\u00e1nh gi\u00e1 c\u00e1c h\u1ee3p \u0111\u1ed3ng \u0111\u00e3 ho\u00e0n t\u1ea5t v\u00e0 ch\u01b0a \u0111\u01b0\u1ee3c review."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        {pendingReviewContracts.length ? (
          <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4">
            <h3 className="text-lg font-semibold text-white">G\u1eedi \u0111\u00e1nh gi\u00e1</h3>

            <label className="block text-xs uppercase tracking-[0.18em] text-slate-300">
              H\u1ee3p \u0111\u1ed3ng \u0111\u00e3 ho\u00e0n t\u1ea5t
              <select
                value={form.contract_id}
                onChange={(event) => setField('contract_id', event.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white outline-none"
              >
                {pendingReviewContracts.map((contract) => (
                  <option key={contract._id} value={contract._id}>
                    #{String(contract._id || '').slice(-8)} - {formatDate(contract.rental_start_date)} / {formatDate(contract.rental_end_date)}
                  </option>
                ))}
              </select>
            </label>

            {selectedContract ? (
              <div className="rounded-xl border border-white/10 bg-slate-950/40 p-3 text-xs text-slate-300">
                <p>Ph\u01b0\u01a1ng ti\u1ec7n: <span className="text-white">{String(selectedContract.vehicle_id || '').slice(-8) || 'Ch\u01b0a c\u1eadp nh\u1eadt'}</span></p>
                <p>Ng\u01b0\u1eddi \u0111\u01b0\u1ee3c \u0111\u00e1nh gi\u00e1: <span className="text-white">{String(reviewedUserId || '').slice(-8) || 'Ch\u01b0a c\u1eadp nh\u1eadt'}</span></p>
              </div>
            ) : null}

            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-300">S\u1ed1 sao</p>
              <div className="mt-2">
                <StarRating value={form.rating} onChange={(point) => setField('rating', point)} />
              </div>
            </div>

            <label className="block text-xs uppercase tracking-[0.18em] text-slate-300">
              Nh\u1eadn x\u00e9t
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
              {submitting ? '\u0110ang g\u1eedi...' : 'G\u1eedi \u0111\u00e1nh gi\u00e1'}
            </button>
          </form>
        ) : (
          <EmptyState
            title="\u0110\u00e3 \u0111\u00e1nh gi\u00e1 h\u1ebft c\u00e1c h\u1ee3p \u0111\u1ed3ng \u0111\u00e3 ho\u00e0n t\u1ea5t"
            description="Kh\u00f4ng c\u00f2n h\u1ee3p \u0111\u1ed3ng COMPLETED n\u00e0o ch\u1edd \u0111\u00e1nh gi\u00e1."
          />
        )}

        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
          <h3 className="text-lg font-semibold text-white">L\u1ecbch s\u1eed \u0111\u00e1nh gi\u00e1</h3>
          {!reviews.length ? (
            <EmptyState
              title="Ch\u01b0a c\u00f3 l\u1ecbch s\u1eed \u0111\u00e1nh gi\u00e1"
              description="C\u00e1c \u0111\u00e1nh gi\u00e1 b\u1ea1n \u0111\u00e3 g\u1eedi s\u1ebd hi\u1ec3n th\u1ecb t\u1ea1i \u0111\u00e2y."
            />
          ) : (
            <div className="mt-4 space-y-3">
              {reviews.map((review) => (
                <article key={review._id} className="rounded-xl border border-white/10 bg-slate-950/40 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">Review #{String(review._id || '').slice(-6)}</p>
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