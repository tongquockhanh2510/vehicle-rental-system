import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Users } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import SectionHeader from '../../components/common/SectionHeader';
import RoleBadge from '../../components/common/RoleBadge';
import StatusBadge from '../../components/common/StatusBadge';
import { getAdminUsersData } from '../../services/adminDataService';

export default function AdminUsersPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const loadRows = async () => {
      setLoading(true);
      const payload = await getAdminUsersData();
      setRows(payload.rows);
      setError(payload.error || '');
      setFallback(Boolean(payload.fallback));
      setLoading(false);
    };

    loadRows();
  }, []);

  const summary = useMemo(() => {
    const total = rows.length;
    const admins = rows.filter((item) => String(item.role || '').toUpperCase() === 'ADMIN').length;
    const ownerApproved = rows.filter((item) => String(item.owner_status || '').toUpperCase() === 'APPROVED').length;
    const ownerPending = rows.filter((item) => String(item.owner_status || '').toUpperCase() === 'PENDING').length;
    return { total, admins, ownerApproved, ownerPending };
  }, [rows]);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Quản trị • Người dùng"
        subtitle="Giám sát người dùng theo role và trạng thái hồ sơ chủ xe để đảm bảo luồng renter/owner/admin rõ ràng."
      />

      <div className="grid gap-3 md:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-slate-900/60 p-3 text-sm text-slate-200">Tổng user: <span className="font-semibold text-white">{summary.total}</span></div>
        <div className="rounded-xl border border-white/10 bg-slate-900/60 p-3 text-sm text-slate-200">Admin: <span className="font-semibold text-white">{summary.admins}</span></div>
        <div className="rounded-xl border border-white/10 bg-slate-900/60 p-3 text-sm text-slate-200">Owner đã duyệt: <span className="font-semibold text-white">{summary.ownerApproved}</span></div>
        <div className="rounded-xl border border-white/10 bg-slate-900/60 p-3 text-sm text-slate-200">Owner chờ duyệt: <span className="font-semibold text-white">{summary.ownerPending}</span></div>
      </div>

      {fallback ? (
        <p className="inline-flex items-center gap-2 rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
          <Users className="h-3.5 w-3.5" />
          API danh sách người dùng chưa phản hồi, đang hiển thị dữ liệu dự phòng để kiểm thử luồng quản trị.
        </p>
      ) : null}

      {!loading && error ? (
        <p className="inline-flex items-center gap-2 rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
          <AlertTriangle className="h-3.5 w-3.5" />
          {error}
        </p>
      ) : null}

      <DataTable
        loading={loading}
        rows={rows}
        columns={[
          { key: '_id', title: 'Mã người dùng', render: (row) => `#${String(row._id || row.id || '').slice(-8)}` },
          { key: 'name', title: 'Họ tên', render: (row) => `${row.first_name || ''} ${row.last_name || ''}`.trim() || 'Chưa cập nhật' },
          { key: 'email', title: 'Email', render: (row) => row.email || 'Chưa cập nhật' },
          { key: 'role', title: 'Vai trò', render: (row) => <RoleBadge role={row.role} ownerStatus={row.owner_status} /> },
          { key: 'owner_status', title: 'Trạng thái chủ xe', render: (row) => <StatusBadge status={`OWNER_${String(row.owner_status || 'NONE').toUpperCase()}`} /> },
          {
            key: 'status',
            title: 'Trạng thái tài khoản',
            render: (row) => <StatusBadge status={String(row.account_status || row.status || 'ACTIVE').toUpperCase()} />
          },
          {
            key: 'created_at',
            title: 'Ngày tạo',
            render: (row) => new Date(row.created_at || Date.now()).toLocaleDateString('vi-VN')
          }
        ]}
        emptyTitle="Chưa có người dùng"
        emptyDescription="Danh sách người dùng hiện đang trống."
      />
    </div>
  );
}
