import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileSearch } from 'lucide-react';
import { ownerApplicationApi } from '../../api';
import ApplicationStatusTimeline from '../../components/common/ApplicationStatusTimeline';
import EmptyState from '../../components/common/EmptyState';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import SectionHeader from '../../components/common/SectionHeader';
import StatusBadge from '../../components/common/StatusBadge';
import PremiumButton from '../../components/common/PremiumButton';

export default function OwnerApplicationStatusPage() {
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await ownerApplicationApi.getMyOwnerApplication();
        setApplication(response.data || null);
      } catch {
        setApplication(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return <LoadingSkeleton rows={4} />;
  }

  if (!application) {
    return (
      <EmptyState
        icon={FileSearch}
        title="B?n chua g?i h? so ch? xe"
        description="Hãy hoàn t?t Owner Onboarding d? m? quy?n dang phuong ti?n cho thuê."
        action={<Link to="/app/become-owner" className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950">B?t d?u onboarding</Link>}
      />
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader title="H? so ch? xe dang duy?t" subtitle="Theo dõi ti?n trình th?m d?nh h? so và c?p nh?t k?t qu? duy?t t? qu?n tr? viên." />

      <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Mã h? so</p>
            <p className="text-lg font-semibold text-white">#{String(application._id || '').slice(-8)}</p>
          </div>
          <StatusBadge
            status={
              String(application.status || '').toUpperCase() === 'APPROVED'
                ? 'OWNER_APPROVED'
                : String(application.status || '').toUpperCase() === 'REJECTED'
                  ? 'OWNER_REJECTED'
                  : 'OWNER_PENDING'
            }
          />
        </div>

        {application.review_note ? (
          <div className="mt-4 rounded-xl border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-100">
            <p className="font-semibold">Lý do t? ch?i / ghi chú duy?t</p>
            <p className="mt-1">{application.review_note}</p>
          </div>
        ) : null}

        <div className="mt-4">
          <ApplicationStatusTimeline application={application} />
        </div>

        {String(application.status || '').toUpperCase() === 'REJECTED' ? (
          <div className="mt-5">
            <PremiumButton onClick={() => navigate('/app/become-owner')}>C?p nh?t và g?i l?i h? so</PremiumButton>
          </div>
        ) : null}
      </article>
    </div>
  );
}