import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileSearch } from 'lucide-react';
import { ownerApplicationApi } from '../../api';
import ApplicationStatusTimeline from '../../components/common/ApplicationStatusTimeline';
import EmptyState from '../../components/common/EmptyState';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import SectionHeader from '../../components/common/SectionHeader';
import StatusBadge from '../../components/common/StatusBadge';
import PremiumButton from '../../components/common/PremiumButton';
import { useAuth } from '../../context/AuthContext';

export default function OwnerApplicationStatusPage() {
  const navigate = useNavigate();
  const { ownerStatus } = useAuth();
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

  const resolvedStatus = useMemo(() => {
    if (application?.status) return String(application.status).toUpperCase();
    return String(ownerStatus || '').toUpperCase();
  }, [application?.status, ownerStatus]);

  if (loading) {
    return <LoadingSkeleton rows={4} />;
  }

  if (!application && !resolvedStatus) {
    return (
      <EmptyState
        icon={FileSearch}
        title="B\u1ea1n ch\u01b0a g\u1eedi h\u1ed3 s\u01a1 ch\u1ee7 xe"
        description="H\u00e3y ho\u00e0n t\u1ea5t Owner Onboarding \u0111\u1ec3 m\u1edf quy\u1ec1n \u0111\u0103ng ph\u01b0\u01a1ng ti\u1ec7n cho thu\u00ea."
        action={<Link to="/app/become-owner" className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950">B\u1eaft \u0111\u1ea7u onboarding</Link>}
      />
    );
  }

  if (resolvedStatus === 'APPROVED') {
    return (
      <div className="space-y-6">
        <SectionHeader
          title="H\u1ed3 s\u01a1 \u0111\u00e3 \u0111\u01b0\u1ee3c duy\u1ec7t"
          subtitle="Ch\u00fac m\u1eebng! B\u1ea1n \u0111\u00e3 \u0111\u1ee7 \u0111i\u1ec1u ki\u1ec7n truy c\u1eadp C\u1ed5ng ch\u1ee7 xe."
        />
        <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-5 text-sm text-emerald-100">
          <div className="mb-3"><StatusBadge status="OWNER_APPROVED" /></div>
          <p>Gi\u1edd b\u1ea1n c\u00f3 th\u1ec3 \u0111\u0103ng xe m\u1edbi, duy\u1ec7t y\u00eau c\u1ea7u thu\u00ea v\u00e0 theo d\u00f5i doanh thu.</p>
          <div className="mt-4">
            <PremiumButton onClick={() => navigate('/owner/dashboard')}>\u0110i t\u1edbi C\u1ed5ng ch\u1ee7 xe</PremiumButton>
          </div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <EmptyState
        icon={FileSearch}
        title="Ch\u01b0a t\u00ecm th\u1ea5y h\u1ed3 s\u01a1"
        description="H\u00e3y g\u1eedi h\u1ed3 s\u01a1 ch\u1ee7 xe \u0111\u1ec3 b\u1eaft \u0111\u1ea7u quy tr\u00ecnh duy\u1ec7t."
        action={<Link to="/app/become-owner" className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950">\u0110\u0103ng k\u00fd l\u00e0m ch\u1ee7 xe</Link>}
      />
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title={resolvedStatus === 'REJECTED' ? 'H\u1ed3 s\u01a1 b\u1ecb t\u1eeb ch\u1ed1i' : 'H\u1ed3 s\u01a1 ch\u1ee7 xe \u0111ang ch\u1edd duy\u1ec7t'}
        subtitle={
          resolvedStatus === 'REJECTED'
            ? 'B\u1ea1n c\u00f3 th\u1ec3 c\u1eadp nh\u1eadt h\u1ed3 s\u01a1 theo l\u00fd do t\u1eeb ch\u1ed1i v\u00e0 g\u1eedi l\u1ea1i.'
            : 'H\u1ed3 s\u01a1 \u0111\u00e3 \u0111\u01b0\u1ee3c g\u1eedi. H\u1ec7 th\u1ed1ng \u0111ang th\u1ef1c hi\u1ec7n ki\u1ec3m tra v\u00e0 ch\u1edd admin ph\u00ea duy\u1ec7t.'
        }
      />

      <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">M\u00e3 h\u1ed3 s\u01a1</p>
            <p className="text-lg font-semibold text-white">#{String(application._id || '').slice(-8)}</p>
          </div>
          <StatusBadge status={resolvedStatus === 'REJECTED' ? 'OWNER_REJECTED' : 'OWNER_PENDING'} />
        </div>

        {resolvedStatus === 'REJECTED' ? (
          <div className="mt-4 rounded-xl border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-100">
            <p className="font-semibold">L\u00fd do t\u1eeb ch\u1ed1i</p>
            <p className="mt-1">{application.review_note || 'Ch\u01b0a c\u1eadp nh\u1eadt l\u00fd do c\u1ee5 th\u1ec3.'}</p>
          </div>
        ) : null}

        <div className="mt-4">
          <ApplicationStatusTimeline application={{ ...application, status: resolvedStatus }} />
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {resolvedStatus === 'REJECTED' ? (
            <PremiumButton onClick={() => navigate('/app/become-owner')}>C\u1eadp nh\u1eadt v\u00e0 g\u1eedi l\u1ea1i h\u1ed3 s\u01a1</PremiumButton>
          ) : (
            <PremiumButton variant="secondary" onClick={() => navigate('/app/explore')}>Kh\u00e1m ph\u00e1 ph\u01b0\u01a1ng ti\u1ec7n</PremiumButton>
          )}
        </div>
      </article>
    </div>
  );
}