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
    return 'PENDING';
  }, [ownerStatus]);

  const ownerAction = useMemo(() => {
    if (ownerStatus === 'APPROVED') return { to: '/owner/dashboard', label: '\u0110i t\u1edbi C\u1ed5ng ch\u1ee7 xe' };
    if (ownerStatus === 'PENDING') return { to: '/app/owner-application-status', label: 'H\u1ed3 s\u01a1 ch\u1ee7 xe \u0111ang duy\u1ec7t' };
    if (ownerStatus === 'REJECTED') return { to: '/app/become-owner', label: 'C\u1eadp nh\u1eadt h\u1ed3 s\u01a1 ch\u1ee7 xe' };
    return { to: '/app/become-owner', label: '\u0110\u0103ng k\u00fd l\u00e0m ch\u1ee7 xe' };
  }, [ownerStatus]);

  return (
    <div className="space-y-6">
      <SectionHeader title="H\u1ed3 s\u01a1 t\u00e0i kho\u1ea3n" subtitle="Th\u00f4ng tin c\u00e1 nh\u00e2n, vai tr\u00f2 v\u00e0 tr\u1ea1ng th\u00e1i ch\u1ee7 xe tr\u00ean n\u1ec1n t\u1ea3ng." />

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 p-2">
              <User className="h-5 w-5 text-cyan-200" />
            </div>
            <div>
              <p className="text-lg font-semibold text-white">{`${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Ch\u01b0a c\u1eadp nh\u1eadt'}</p>
              <p className="text-sm text-slate-300">{user?.email || 'Ch\u01b0a c\u1eadp nh\u1eadt email'}</p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 text-sm text-slate-200 md:grid-cols-2">
            <p>S\u1ed1 \u0111i\u1ec7n tho\u1ea1i: <span className="font-semibold text-white">{user?.phone || 'Ch\u01b0a c\u1eadp nh\u1eadt'}</span></p>
            <p>M\u00e3 ng\u01b0\u1eddi d\u00f9ng: <span className="font-semibold text-white">{String(user?._id || user?.id || '--').slice(-8)}</span></p>
            <p className="flex items-center gap-2">Vai tr\u00f2: <RoleBadge role={role} ownerStatus={ownerStatus} /></p>
            <p className="flex items-center gap-2">Tr\u1ea1ng th\u00e1i ch\u1ee7 xe: <StatusBadge status={ownerBadgeStatus} /></p>
          </div>
        </article>

        <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
          <h3 className="text-lg font-semibold text-white">Ti\u1ebfn tr\u00ecnh tr\u1edf th\u00e0nh ch\u1ee7 xe</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-200">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/40 p-3">
              <BadgeCheck className="h-4 w-4 text-cyan-300" />
              <span>\u0110\u0103ng k\u00fd h\u1ed3 s\u01a1 \u0111\u1ecbnh danh v\u00e0 th\u00f4ng tin nh\u1eadn ti\u1ec1n.</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/40 p-3">
              <Clock3 className="h-4 w-4 text-amber-300" />
              <span>Admin th\u1ea9m \u0111\u1ecbnh h\u1ed3 s\u01a1 theo quy tr\u00ecnh duy\u1ec7t.</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/40 p-3">
              <ShieldCheck className="h-4 w-4 text-emerald-300" />
              <span>Ch\u1ec9 khi \u0111\u01b0\u1ee3c duy\u1ec7t APPROVED, b\u1ea1n m\u1edbi v\u00e0o \u0111\u01b0\u1ee3c C\u1ed5ng ch\u1ee7 xe.</span>
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