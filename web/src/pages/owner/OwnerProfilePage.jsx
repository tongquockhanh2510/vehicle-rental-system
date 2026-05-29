import React, { useEffect, useState } from 'react';
import { BadgeCheck, Landmark, User } from 'lucide-react';
import { ownerApplicationApi } from '../../api';
import ApplicationStatusTimeline from '../../components/common/ApplicationStatusTimeline';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import SectionHeader from '../../components/common/SectionHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';

export default function OwnerProfilePage() {
  const { user, ownerStatus } = useAuth();
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

  if (loading) return <LoadingSkeleton rows={4} />;

  return (
    <div className="space-y-6">
      <SectionHeader title="Hồ sơ chủ xe" subtitle="Thông tin định danh, tài khoản nhận tiền và trạng thái duyệt hồ sơ owner." />

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 p-2"><User className="h-5 w-5 text-cyan-200" /></div>
            <div>
              <p className="text-lg font-semibold text-white">{application?.owner_profile?.legal_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Chưa cập nhật'}</p>
              <p className="text-sm text-slate-300">{user?.email || 'Chưa cập nhật email'}</p>
            </div>
          </div>

          <div className="mt-4 space-y-2 text-sm text-slate-200">
            <p>Số CCCD/Passport: <span className="font-semibold text-white">{application?.owner_profile?.id_number || 'Chưa cập nhật'}</span></p>
            <p>Điện thoại: <span className="font-semibold text-white">{application?.owner_profile?.phone || user?.phone || 'Chưa cập nhật'}</span></p>
            <p>Địa chỉ: <span className="font-semibold text-white">{application?.owner_profile?.address || 'Chưa cập nhật'}</span></p>
            <p className="flex items-center gap-2">Trạng thái owner: <StatusBadge status={ownerStatus === 'APPROVED' ? 'OWNER_APPROVED' : ownerStatus === 'REJECTED' ? 'OWNER_REJECTED' : 'OWNER_PENDING'} /></p>
          </div>
        </article>

        <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-white"><Landmark className="h-4 w-4 text-cyan-300" /> Tài khoản nhận tiền</h3>
          <div className="mt-3 space-y-2 text-sm text-slate-200">
            <p>Ngân hàng: <span className="font-semibold text-white">{application?.owner_profile?.bank_name || 'Chưa cập nhật'}</span></p>
            <p>Số tài khoản: <span className="font-semibold text-white">{application?.owner_profile?.bank_account_number || 'Chưa cập nhật'}</span></p>
            <p>Chủ tài khoản: <span className="font-semibold text-white">{application?.owner_profile?.bank_account_holder || 'Chưa cập nhật'}</span></p>
          </div>

          <div className="mt-4 rounded-xl border border-blue-400/30 bg-blue-500/10 p-3 text-xs text-blue-100">
            <p className="inline-flex items-center gap-1 font-semibold"><BadgeCheck className="h-3.5 w-3.5" /> Trạng thái đối soát</p>
            <p className="mt-1">Thông tin nhận tiền sẽ được dùng để quyết toán doanh thu sau khi hợp đồng hoàn tất.</p>
          </div>
        </article>
      </section>

      <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
        <h3 className="text-lg font-semibold text-white">Timeline duyệt hồ sơ</h3>
        <div className="mt-4">
          <ApplicationStatusTimeline application={application} />
        </div>
      </article>
    </div>
  );
}