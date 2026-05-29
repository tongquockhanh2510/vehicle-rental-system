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
        title="Bạn chưa gửi hồ sơ chủ xe"
        description="Hãy hoàn tất Owner Onboarding để mở quyền đăng phương tiện cho thuê."
        action={<Link to="/app/become-owner" className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950">Bắt đầu onboarding</Link>}
      />
    );
  }

  if (resolvedStatus === 'APPROVED') {
    return (
      <div className="space-y-6">
        <SectionHeader
          title="Hồ sơ đã được duyệt"
          subtitle="Chúc mừng! Bạn đã đủ điều kiện truy cập Cổng chủ xe."
        />
        <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-5 text-sm text-emerald-100">
          <div className="mb-3"><StatusBadge status="OWNER_APPROVED" /></div>
          <p>Giờ bạn có thể đăng xe mới, duyệt yêu cầu thuê và theo dõi doanh thu.</p>
          <div className="mt-4">
            <PremiumButton onClick={() => navigate('/owner/dashboard')}>Đi tới Cổng chủ xe</PremiumButton>
          </div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <EmptyState
        icon={FileSearch}
        title="Chưa tìm thấy hồ sơ"
        description="Hãy gửi hồ sơ chủ xe để bắt đầu quy trình duyệt."
        action={<Link to="/app/become-owner" className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950">Đăng ký làm chủ xe</Link>}
      />
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title={resolvedStatus === 'REJECTED' ? 'Hồ sơ bị từ chối' : 'Hồ sơ chủ xe đang chờ duyệt'}
        subtitle={
          resolvedStatus === 'REJECTED'
            ? 'Bạn có thể cập nhật hồ sơ theo lý do từ chối và gửi lại.'
            : 'Admin sẽ kiểm tra thông tin xác minh của bạn. Bạn chỉ có thể đăng phương tiện sau khi hồ sơ được phê duyệt.'
        }
      />

      <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Mã hồ sơ</p>
            <p className="text-lg font-semibold text-white">#{String(application._id || '').slice(-8)}</p>
          </div>
          <StatusBadge status={resolvedStatus === 'REJECTED' ? 'OWNER_REJECTED' : 'OWNER_PENDING'} />
        </div>

        {resolvedStatus === 'REJECTED' ? (
          <div className="mt-4 rounded-xl border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-100">
            <p className="font-semibold">Lý do từ chối</p>
            <p className="mt-1">{application.review_note || 'Chưa cập nhật lý do cụ thể.'}</p>
          </div>
        ) : null}

        <div className="mt-4">
          <ApplicationStatusTimeline application={{ ...application, status: resolvedStatus }} />
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {resolvedStatus === 'REJECTED' ? (
            <PremiumButton onClick={() => navigate('/app/become-owner')}>Cập nhật và gửi lại hồ sơ</PremiumButton>
          ) : (
            <PremiumButton variant="secondary" onClick={() => navigate('/app/explore')}>Khám phá phương tiện</PremiumButton>
          )}
        </div>
      </article>
    </div>
  );
}
