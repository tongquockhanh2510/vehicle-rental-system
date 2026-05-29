import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, Clock3, ShieldCheck, User } from 'lucide-react';
import RoleBadge from '../../components/common/RoleBadge';
import SectionHeader from '../../components/common/SectionHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { getOwnerCta } from '../../utils/ownerCta';

export default function ProfilePage() {
  const { user, role, ownerStatus } = useAuth();

  const ownerBadgeStatus = useMemo(() => {
    if (ownerStatus === 'APPROVED') return 'OWNER_APPROVED';
    if (ownerStatus === 'PENDING') return 'OWNER_PENDING';
    if (ownerStatus === 'REJECTED') return 'OWNER_REJECTED';
    return 'OWNER_NONE';
  }, [ownerStatus]);

  const ownerAction = useMemo(() => getOwnerCta(user, ownerStatus), [user, ownerStatus]);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Há»“ sÆ¡ tÃ i khoáº£n"
        subtitle="ThÃ´ng tin cÃ¡ nhÃ¢n, vai trÃ² vÃ  tráº¡ng thÃ¡i chá»§ xe trÃªn ná»n táº£ng."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 p-2">
              <User className="h-5 w-5 text-cyan-200" />
            </div>
            <div>
              <p className="text-lg font-semibold text-white">{`${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'ChÆ°a cáº­p nháº­t'}</p>
              <p className="text-sm text-slate-300">{user?.email || 'ChÆ°a cáº­p nháº­t email'}</p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 text-sm text-slate-200 md:grid-cols-2">
            <p>Sá»‘ Ä‘iá»‡n thoáº¡i: <span className="font-semibold text-white">{user?.phone || 'ChÆ°a cáº­p nháº­t'}</span></p>
            <p>MÃ£ ngÆ°á»i dÃ¹ng: <span className="font-semibold text-white">{String(user?._id || user?.id || '--').slice(-8)}</span></p>
            <p className="flex items-center gap-2">Vai trÃ²: <RoleBadge role={role} ownerStatus={ownerStatus} /></p>
            <p className="flex items-center gap-2">Tráº¡ng thÃ¡i chá»§ xe: <StatusBadge status={ownerBadgeStatus} /></p>
          </div>
        </article>

        <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
          <h3 className="text-lg font-semibold text-white">Tiáº¿n trÃ¬nh trá»Ÿ thÃ nh chá»§ xe</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-200">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/40 p-3">
              <BadgeCheck className="h-4 w-4 text-cyan-300" />
              <span>ÄÄƒng kÃ½ há»“ sÆ¡ Ä‘á»‹nh danh vÃ  thÃ´ng tin nháº­n tiá»n.</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/40 p-3">
              <Clock3 className="h-4 w-4 text-amber-300" />
              <span>Admin tháº©m Ä‘á»‹nh há»“ sÆ¡ theo quy trÃ¬nh duyá»‡t.</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/40 p-3">
              <ShieldCheck className="h-4 w-4 text-emerald-300" />
              <span>Chá»‰ khi Ä‘Æ°á»£c duyá»‡t APPROVED, báº¡n má»›i vÃ o Ä‘Æ°á»£c Cá»•ng chá»§ xe.</span>
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
