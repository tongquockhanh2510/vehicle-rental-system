import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Eye, Lock, Trash2, Unlock, Users } from 'lucide-react';
import { userApi } from '../../api';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import SectionHeader from '../../components/common/SectionHeader';
import RoleBadge from '../../components/common/RoleBadge';
import StatusBadge from '../../components/common/StatusBadge';
import { useToast } from '../../context/ToastContext';
import { getAdminUsersData } from '../../services/adminDataService';

function resolveOwnerImageUrl(application, side = 'front') {
  const profile = application?.owner_profile || {};
  const candidates =
    side === 'front'
      ? [application?.id_card_front_url, profile?.id_card_front_url, profile?.id_image_front, profile?.id_front_url]
      : [application?.id_card_back_url, profile?.id_card_back_url, profile?.id_image_back, profile?.id_back_url];
  return candidates.find((value) => typeof value === 'string' && value.trim()) || '';
}

function resolveAccountStatus(row) {
  if (row?.deleted_at) return 'DELETED';
  if (row?.is_active === false) return 'BLOCKED';
  return String(row?.account_status || row?.status || 'ACTIVE').toUpperCase();
}

const initialActionState = {
  open: false,
  type: '',
  row: null,
  reason: ''
};

export default function AdminUsersPage() {
  const { pushToast } = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fallback, setFallback] = useState(false);
  const [selected, setSelected] = useState(null);
  const [actionState, setActionState] = useState(initialActionState);
  const [submittingAction, setSubmittingAction] = useState(false);

  const loadRows = async () => {
    setLoading(true);
    const payload = await getAdminUsersData();
    setRows(payload.rows);
    setError(payload.error || '');
    setFallback(Boolean(payload.fallback));
    setLoading(false);
  };

  useEffect(() => {
    loadRows();
  }, []);

  const summary = useMemo(() => {
    const total = rows.length;
    const admins = rows.filter((item) => String(item.role || '').toUpperCase() === 'ADMIN').length;
    const ownerApproved = rows.filter((item) => String(item.owner_status || '').toUpperCase() === 'APPROVED').length;
    const ownerPending = rows.filter((item) => String(item.owner_status || '').toUpperCase() === 'PENDING').length;
    return { total, admins, ownerApproved, ownerPending };
  }, [rows]);

  const openAction = (type, row) => {
    setActionState({
      open: true,
      type,
      row,
      reason: ''
    });
  };

  const closeAction = () => setActionState(initialActionState);

  const executeAction = async () => {
    if (!actionState.row?._id) return;
    const userId = actionState.row._id;
    const reason = String(actionState.reason || '').trim();

    if (['block', 'delete'].includes(actionState.type) && !reason) {
      pushToast({
        tone: 'warning',
        title: 'Thiếu lý do',
        message: 'Vui lòng nhập lý do trước khi xác nhận thao tác.'
      });
      return;
    }

    setSubmittingAction(true);
    try {
      if (actionState.type === 'block') {
        await userApi.blockUser(userId, reason);
      } else if (actionState.type === 'unblock') {
        await userApi.unblockUser(userId);
      } else if (actionState.type === 'delete') {
        await userApi.softDeleteUser(userId, reason);
      }

      pushToast({
        tone: 'success',
        title: 'Cập nhật thành công',
        message:
          actionState.type === 'block'
            ? 'Tài khoản đã được khóa.'
            : actionState.type === 'unblock'
              ? 'Tài khoản đã được mở khóa.'
              : 'Tài khoản đã được xóa mềm.'
      });

      closeAction();
      await loadRows();
      if (selected && String(selected._id) === String(userId)) {
        const detail = await userApi.getUserById(userId).then((res) => res.data?.data).catch(() => null);
        if (detail) {
          setSelected(detail);
        }
      }
    } catch (actionError) {
      pushToast({
        tone: 'error',
        title: 'Thao tác thất bại',
        message: actionError?.response?.data?.error || actionError?.response?.data?.message || 'Không thể cập nhật tài khoản.'
      });
    } finally {
      setSubmittingAction(false);
    }
  };

  const actionTitle = useMemo(() => {
    if (actionState.type === 'block') return 'Khóa tài khoản';
    if (actionState.type === 'unblock') return 'Mở khóa tài khoản';
    if (actionState.type === 'delete') return 'Xóa mềm tài khoản';
    return 'Xác nhận thao tác';
  }, [actionState.type]);

  const actionDescription = useMemo(() => {
    if (!actionState.row) return '';
    const fullName = `${actionState.row.first_name || ''} ${actionState.row.last_name || ''}`.trim() || actionState.row.email || 'người dùng';
    if (actionState.type === 'block') return `Bạn sắp khóa tài khoản ${fullName}.`;
    if (actionState.type === 'unblock') return `Bạn sắp mở khóa tài khoản ${fullName}.`;
    if (actionState.type === 'delete') return `Bạn sắp xóa mềm tài khoản ${fullName}.`;
    return '';
  }, [actionState]);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Quản trị • Người dùng"
        subtitle="Quản lý trạng thái tài khoản user/owner: xem chi tiết, khóa, mở khóa và xóa mềm có lý do."
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
          API danh sách người dùng chưa phản hồi, đang hiển thị dữ liệu dự phòng để kiểm thử giao diện.
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
          { key: 'owned_vehicle_count', title: 'Số xe sở hữu', render: (row) => Number(row.owned_vehicle_count || 0) },
          { key: 'renter_request_count', title: 'Request thuê', render: (row) => Number(row.renter_request_count || 0) },
          { key: 'status', title: 'Trạng thái tài khoản', render: (row) => <StatusBadge status={resolveAccountStatus(row)} /> },
          {
            key: 'actions',
            title: 'Thao tác',
            render: (row) => {
              const isAdmin = String(row.role || '').toUpperCase() === 'ADMIN';
              const accountStatus = resolveAccountStatus(row);
              const canUnblock = accountStatus === 'BLOCKED';
              return (
                <div className="flex flex-wrap gap-1">
                  <button
                    type="button"
                    onClick={() => setSelected(row)}
                    className="inline-flex items-center gap-1 rounded-lg border border-white/15 px-2 py-1 text-xs text-slate-200 hover:bg-white/10"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Xem
                  </button>
                  {!isAdmin ? (
                    <>
                      <button
                        type="button"
                        onClick={() => openAction(canUnblock ? 'unblock' : 'block', row)}
                        className="inline-flex items-center gap-1 rounded-lg border border-white/15 px-2 py-1 text-xs text-slate-200 hover:bg-white/10"
                      >
                        {canUnblock ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                        {canUnblock ? 'Mở khóa' : 'Khóa'}
                      </button>
                      <button
                        type="button"
                        onClick={() => openAction('delete', row)}
                        className="inline-flex items-center gap-1 rounded-lg border border-rose-400/30 px-2 py-1 text-xs text-rose-200 hover:bg-rose-500/15"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Xóa mềm
                      </button>
                    </>
                  ) : null}
                </div>
              );
            }
          }
        ]}
        emptyTitle="Chưa có người dùng"
        emptyDescription="Danh sách người dùng hiện đang trống."
      />

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={`Người dùng #${String(selected?._id || selected?.id || '').slice(-8)}`}
        width="max-w-2xl"
      >
        {selected ? (
          <div className="space-y-4 text-sm text-slate-200">
            <div className="grid gap-3 rounded-xl border border-white/10 bg-slate-950/40 p-4 md:grid-cols-2">
              <p>Họ tên: <span className="font-semibold text-white">{`${selected.first_name || ''} ${selected.last_name || ''}`.trim() || 'Chưa cập nhật'}</span></p>
              <p>Email: <span className="font-semibold text-white">{selected.email || 'Chưa cập nhật'}</span></p>
              <p>Điện thoại: <span className="font-semibold text-white">{selected.phone || 'Chưa cập nhật'}</span></p>
              <p>Vai trò: <span className="font-semibold text-white">{selected.role || 'USER'}</span></p>
              <p>Owner status: <span className="font-semibold text-white">{selected.owner_status || 'NONE'}</span></p>
              <p>Trạng thái tài khoản: <span className="font-semibold text-white">{resolveAccountStatus(selected)}</span></p>
              <p>Số xe sở hữu: <span className="font-semibold text-white">{Number(selected.owned_vehicle_count || 0)}</span></p>
              <p>Số request thuê: <span className="font-semibold text-white">{Number(selected.renter_request_count || 0)}</span></p>
              <p>Lý do khóa: <span className="font-semibold text-white">{selected.block_reason || 'Không có'}</span></p>
              <p>Lý do xóa mềm: <span className="font-semibold text-white">{selected.delete_reason || 'Không có'}</span></p>
            </div>

            {selected.owner_application ? (
              <div className="space-y-3 rounded-xl border border-cyan-400/20 bg-cyan-500/5 p-4">
                <p className="font-semibold text-cyan-100">Hồ sơ chủ xe</p>
                <div className="grid gap-2 md:grid-cols-2">
                  <p>Họ tên pháp lý: <span className="text-white">{selected.owner_application.legal_name || 'Chưa cập nhật'}</span></p>
                  <p>CCCD/Passport: <span className="text-white">{selected.owner_application.id_number || 'Chưa cập nhật'}</span></p>
                  <p>Ngân hàng: <span className="text-white">{selected.owner_application.bank_name || 'Chưa cập nhật'}</span></p>
                  <p>Số tài khoản: <span className="text-white">{selected.owner_application.bank_account_number || 'Chưa cập nhật'}</span></p>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-lg border border-white/10 bg-slate-900/50 p-2">
                    {resolveOwnerImageUrl(selected.owner_application, 'front') ? (
                      <img
                        src={resolveOwnerImageUrl(selected.owner_application, 'front')}
                        alt="CCCD trước"
                        className="h-32 w-full rounded object-cover"
                      />
                    ) : (
                      <div className="flex h-32 items-center justify-center rounded border border-dashed border-white/20 text-xs text-slate-400">Chưa có ảnh CCCD trước</div>
                    )}
                  </div>
                  <div className="rounded-lg border border-white/10 bg-slate-900/50 p-2">
                    {resolveOwnerImageUrl(selected.owner_application, 'back') ? (
                      <img
                        src={resolveOwnerImageUrl(selected.owner_application, 'back')}
                        alt="CCCD sau"
                        className="h-32 w-full rounded object-cover"
                      />
                    ) : (
                      <div className="flex h-32 items-center justify-center rounded border border-dashed border-white/20 text-xs text-slate-400">Chưa có ảnh CCCD sau</div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </Modal>

      <Modal
        open={actionState.open}
        onClose={closeAction}
        title={actionTitle}
        width="max-w-lg"
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={closeAction}
              className="rounded-xl border border-white/15 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={executeAction}
              disabled={submittingAction}
              className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:bg-slate-600"
            >
              {submittingAction ? 'Đang xử lý...' : 'Xác nhận'}
            </button>
          </div>
        }
      >
        <div className="space-y-3 text-sm text-slate-300">
          <p>{actionDescription}</p>
          {['block', 'delete'].includes(actionState.type) ? (
            <label className="block">
              <span className="text-xs uppercase tracking-[0.16em] text-slate-400">Lý do</span>
              <textarea
                rows={3}
                value={actionState.reason}
                onChange={(event) => setActionState((prev) => ({ ...prev, reason: event.target.value }))}
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white outline-none"
                placeholder="Nhập lý do thao tác"
              />
            </label>
          ) : null}
        </div>
      </Modal>
    </div>
  );
}
