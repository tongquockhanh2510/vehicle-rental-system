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
import { OWNER_STATUSES, normalizeOwnerStatus } from '../../constants/roles';

function buildPendingFallbackApplication(user) {
  const now = new Date().toISOString();
  return {
    _id: user?.owner_application_id || 'PENDING-LOCAL',
    status: OWNER_STATUSES.PENDING,
    rejection_reason: '',
    review_note: '',
    created_at: now,
    updated_at: now,
    timeline: [
      { key: 'SUBMITTED', label: 'Đã gửi hồ sơ', status: 'COMPLETED', timestamp: now },
      { key: 'UNDER_REVIEW', label: 'Đang kiểm tra', status: 'ACTIVE', timestamp: now },
      { key: 'WAITING_ADMIN', label: 'Chờ admin phê duyệt', status: 'PENDING' },
      { key: 'RESULT', label: 'Kết quả', status: 'PENDING' }
    ]
  };
}

export default function OwnerApplicationStatusPage() {
  const navigate = useNavigate();
  const { ownerStatus, user } = useAuth();
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
    if (application?.status) return normalizeOwnerStatus(application.status);
    return normalizeOwnerStatus(ownerStatus);
  }, [application?.status, ownerStatus]);

  const effectiveApplication = useMemo(() => {
    if (application) return application;
    if (resolvedStatus === OWNER_STATUSES.PENDING) return buildPendingFallbackApplication(user);
    return null;
  }, [application, resolvedStatus, user]);

  if (loading) {
    return <LoadingSkeleton rows={4} />;
  }

  if (resolvedStatus === OWNER_STATUSES.NONE && !effectiveApplication) {
    return (
      <EmptyState
        icon={FileSearch}
        title="Bạn chưa gửi hồ sơ chủ xe"
        description="Hãy hoàn tất hồ sơ để đăng ký trở thành chủ xe."
        action={<Link to="/app/become-owner" className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950">Đăng ký làm chủ xe</Link>}
      />
    );
  }

  if (resolvedStatus === OWNER_STATUSES.APPROVED) {
    return (
      <div className="space-y-6">
        <SectionHeader
          title="Hồ sơ chủ xe đã được duyệt"
          subtitle="Bạn đã có thể sử dụng Cổng chủ xe để đăng và quản lý phương tiện."
        />
        <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-5 text-sm text-emerald-100">
          <div className="mb-3"><StatusBadge status="OWNER_APPROVED" /></div>
          <p>Bạn đã có quyền truy cập không gian chủ xe với đầy đủ tính năng vận hành.</p>
          <div className="mt-4">
            <PremiumButton onClick={() => navigate('/owner/dashboard')}>Đi tới Cổng chủ xe</PremiumButton>
          </div>
        </div>
      </div>
    );
  }

  if (resolvedStatus === OWNER_STATUSES.REJECTED) {
    return (
      <div className="space-y-6">
        <SectionHeader
          title="Hồ sơ chủ xe bị từ chối"
          subtitle="Bạn có thể cập nhật hồ sơ theo lý do từ chối và gửi lại."
        />

        <article className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-5 text-sm text-rose-100">
          <div className="mb-3"><StatusBadge status="OWNER_REJECTED" /></div>
          <p className="font-semibold">Lý do từ chối</p>
          <p className="mt-1">{effectiveApplication?.rejection_reason || effectiveApplication?.review_note || user?.rejection_reason || 'Chưa cập nhật lý do cụ thể.'}</p>
          <div className="mt-4">
            <PremiumButton onClick={() => navigate('/app/become-owner')}>Cập nhật hồ sơ</PremiumButton>
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Hồ sơ chủ xe đang chờ duyệt"
        subtitle="Admin sẽ kiểm tra hồ sơ xác minh của bạn. Bạn chỉ có thể đăng phương tiện sau khi hồ sơ được phê duyệt."
      />

      <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Mã hồ sơ</p>
            <p className="text-lg font-semibold text-white">#{String(effectiveApplication?._id || user?.owner_application_id || 'PENDING').slice(-8)}</p>
          </div>
          <StatusBadge status="OWNER_PENDING" />
        </div>

        <div className="mt-4">
          <ApplicationStatusTimeline application={{ ...(effectiveApplication || {}), status: OWNER_STATUSES.PENDING }} />
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <PremiumButton variant="secondary" onClick={() => navigate('/')}>Về trang chủ</PremiumButton>
        </div>
      </article>
    </div>
  );
}
