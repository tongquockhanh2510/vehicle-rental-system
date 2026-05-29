import React, { useEffect, useMemo, useState } from 'react';
import { Eye, XCircle } from 'lucide-react';
import { ownerApplicationApi } from '../../api';
import ApplicationStatusTimeline from '../../components/common/ApplicationStatusTimeline';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import PremiumButton from '../../components/common/PremiumButton';
import SectionHeader from '../../components/common/SectionHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { useToast } from '../../context/ToastContext';
import { pickArray } from '../../utils/formatters';

const filters = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'PENDING', label: 'PENDING' },
  { key: 'APPROVED', label: 'APPROVED' },
  { key: 'REJECTED', label: 'REJECTED' }
];

export default function AdminOwnerApplicationsPage() {
  const { pushToast } = useToast();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const loadRows = async () => {
    setLoading(true);
    try {
      const response = await ownerApplicationApi.getOwnerApplications(
        statusFilter === 'ALL' ? {} : { status: statusFilter }
      );
      setRows(pickArray(response.data));
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRows();
  }, [statusFilter]);

  const approve = async (row) => {
    try {
      await ownerApplicationApi.approveOwnerApplication(row._id, { review_note: 'Hồ sơ hợp lệ.' });
      pushToast({ tone: 'success', title: 'Đã duyệt hồ sơ', message: 'Ứng viên đã được mở quyền chủ xe.' });
      loadRows();
      if (selected?._id === row._id) setSelected(null);
    } catch (error) {
      pushToast({ tone: 'error', title: 'Duyệt thất bại', message: error?.message || 'Không thể duyệt hồ sơ.' });
    }
  };

  const reject = async (row) => {
    try {
      await ownerApplicationApi.rejectOwnerApplication(row._id, { reason: rejectReason || 'Thiếu giấy tờ xác minh.' });
      pushToast({ tone: 'success', title: 'Đã từ chối hồ sơ', message: 'Đã gửi phản hồi cho người dùng cập nhật hồ sơ.' });
      setRejectReason('');
      loadRows();
      if (selected?._id === row._id) setSelected(null);
    } catch (error) {
      pushToast({ tone: 'error', title: 'Từ chối thất bại', message: error?.message || 'Không thể từ chối hồ sơ.' });
    }
  };

  const columns = useMemo(
    () => [
      { key: '_id', title: 'Mã hồ sơ', render: (row) => `#${String(row._id || '').slice(-8)}` },
      { key: 'applicant_name', title: 'Ứng viên', render: (row) => row.applicant_name || row.owner_profile?.legal_name || 'Chưa cập nhật' },
      { key: 'email', title: 'Email', render: (row) => row.email || 'Chưa cập nhật' },
      { key: 'phone', title: 'Điện thoại', render: (row) => row.phone || row.owner_profile?.phone || 'Chưa cập nhật' },
      { key: 'status', title: 'Trạng thái', render: (row) => <StatusBadge status={`OWNER_${String(row.status || 'PENDING').toUpperCase()}`} /> },
      {
        key: 'actions',
        title: 'Thao tác',
        render: (row) => (
          <div className="flex flex-wrap gap-1">
            <button type="button" onClick={() => setSelected(row)} className="rounded-lg border border-white/15 px-2 py-1 text-xs text-slate-200">
              <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> Chi tiết</span>
            </button>
            {String(row.status || '').toUpperCase() === 'PENDING' ? (
              <>
                <button type="button" onClick={() => approve(row)} className="rounded-lg bg-cyan-500 px-2 py-1 text-xs font-semibold text-slate-950">Duyệt</button>
                <button type="button" onClick={() => reject(row)} className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-2 py-1 text-xs text-rose-200">Từ chối</button>
              </>
            ) : null}
          </div>
        )
      }
    ],
    [selected, rejectReason]
  );

  return (
    <div className="space-y-6">
      <SectionHeader title="Đơn đăng ký chủ xe" subtitle="Duyệt hồ sơ onboarding, phản hồi lý do từ chối và mở quyền owner sau khi xác minh hợp lệ." />

      <div className="inline-flex rounded-xl border border-white/10 bg-slate-900/50 p-1">
        {filters.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setStatusFilter(item.key)}
            className={`rounded-lg px-3 py-1.5 text-xs ${statusFilter === item.key ? 'bg-cyan-500 text-slate-950 font-semibold' : 'text-slate-300 hover:bg-white/10'}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <DataTable loading={loading} rows={rows} columns={columns} emptyTitle="Chưa có đơn đăng ký" emptyDescription="Các hồ sơ mới sẽ xuất hiện ở đây để admin duyệt." />

      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title={`Hồ sơ #${String(selected?._id || '').slice(-8)}`} width="max-w-2xl">
        {selected ? (
          <div className="space-y-4">
            <div className="grid gap-3 rounded-xl border border-white/10 bg-slate-950/40 p-4 text-sm text-slate-200 md:grid-cols-2">
              <p>Họ tên pháp lý: <span className="font-semibold text-white">{selected.owner_profile?.legal_name || 'Chưa cập nhật'}</span></p>
              <p>CCCD/Passport: <span className="font-semibold text-white">{selected.owner_profile?.id_number || 'Chưa cập nhật'}</span></p>
              <p>Địa chỉ: <span className="font-semibold text-white">{selected.owner_profile?.address || 'Chưa cập nhật'}</span></p>
              <p>SĐT: <span className="font-semibold text-white">{selected.owner_profile?.phone || selected.phone || 'Chưa cập nhật'}</span></p>
              <p>Ngân hàng: <span className="font-semibold text-white">{selected.owner_profile?.bank_name || 'Chưa cập nhật'}</span></p>
              <p>Số tài khoản: <span className="font-semibold text-white">{selected.owner_profile?.bank_account_number || 'Chưa cập nhật'}</span></p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-slate-950/40 p-3 text-xs text-slate-300">
                Ảnh CCCD trước: <span className="text-white">{selected.owner_profile?.id_front_name || 'Chưa cập nhật'}</span>
              </div>
              <div className="rounded-xl border border-white/10 bg-slate-950/40 p-3 text-xs text-slate-300">
                Ảnh CCCD sau: <span className="text-white">{selected.owner_profile?.id_back_name || 'Chưa cập nhật'}</span>
              </div>
            </div>

            <ApplicationStatusTimeline application={selected} />

            {String(selected.status || '').toUpperCase() === 'PENDING' ? (
              <div className="space-y-3">
                <label className="block text-sm text-slate-300">
                  Lý do từ chối (nếu từ chối)
                  <textarea
                    value={rejectReason}
                    onChange={(event) => setRejectReason(event.target.value)}
                    rows={3}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-white outline-none"
                    placeholder="Ví dụ: thiếu ảnh CCCD mặt sau, số tài khoản không khớp..."
                  />
                </label>

                <div className="flex flex-wrap justify-end gap-2">
                  <PremiumButton variant="danger" onClick={() => reject(selected)}><XCircle className="h-4 w-4" /> Từ chối</PremiumButton>
                  <PremiumButton onClick={() => approve(selected)}>Duyệt hồ sơ</PremiumButton>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
