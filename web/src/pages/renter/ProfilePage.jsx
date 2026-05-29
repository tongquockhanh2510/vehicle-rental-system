import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, Clock3, ShieldCheck, User } from 'lucide-react';
import RoleBadge from '../../components/common/RoleBadge';
import SectionHeader from '../../components/common/SectionHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';

export default function ProfilePage() {
  const { user, role, ownerStatus } = useAuth();

  const ownerBadgeStatus = useMemo(() => {
    if (ownerStatus === 'APPROVED') return 'OWNER_APPROVED';
    if (ownerStatus === 'PENDING') return 'OWNER_PENDING';
    if (ownerStatus === 'REJECTED') return 'OWNER_REJECTED';
    return 'OWNER_NONE';
  }, [ownerStatus]);

  const ownerAction = useMemo(() => {
    if (ownerStatus === 'APPROVED') return { to: '/owner/dashboard', label: 'Đi tới Cổng chủ xe' };
    if (ownerStatus === 'PENDING') return { to: '/app/owner-application-status', label: 'Hồ sơ đang chờ duyệt' };
    if (ownerStatus === 'REJECTED') return { to: '/app/become-owner', label: 'Cập nhật hồ sơ chủ xe' };
    return { to: '/app/become-owner', label: 'Đăng ký làm chủ xe' };
  }, [ownerStatus]);

  return (
    <div className="space-y-6">
      <SectionHeader title="Hồ sơ tài khoản" subtitle="Thông tin cá nhân, vai trò và trạng thái chủ xe trên nền tảng." />

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 p-2">
              <User className="h-5 w-5 text-cyan-200" />
            </div>
            <div>
              <p className="text-lg font-semibold text-white">{`${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Chưa cập nhật'}</p>
              <p className="text-sm text-slate-300">{user?.email || 'Chưa cập nhật email'}</p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 text-sm text-slate-200 md:grid-cols-2">
            <p>Số điện thoại: <span className="font-semibold text-white">{user?.phone || 'Chưa cập nhật'}</span></p>
            <p>Mã người dùng: <span className="font-semibold text-white">{String(user?._id || user?.id || '--').slice(-8)}</span></p>
            <p className="flex items-center gap-2">Vai trò: <RoleBadge role={role} ownerStatus={ownerStatus} /></p>
            <p className="flex items-center gap-2">Trạng thái chủ xe: <StatusBadge status={ownerBadgeStatus} /></p>
          </div>
        </article>

        <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
          <h3 className="text-lg font-semibold text-white">Tiến trình trở thành chủ xe</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-200">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/40 p-3">
              <BadgeCheck className="h-4 w-4 text-cyan-300" />
              <span>Đăng ký hồ sơ định danh và thông tin nhận tiền.</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/40 p-3">
              <Clock3 className="h-4 w-4 text-amber-300" />
              <span>Admin thẩm định hồ sơ theo quy trình duyệt.</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/40 p-3">
              <ShieldCheck className="h-4 w-4 text-emerald-300" />
              <span>Chỉ khi được duyệt APPROVED, bạn mới vào được Cổng chủ xe.</span>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link to={ownerAction.to} className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950">{ownerAction.label}</Link>
          </div>
        </article>
      </div>
    </div>
  );
}
