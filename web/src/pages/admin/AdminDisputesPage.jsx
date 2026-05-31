import React, { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import SectionHeader from '../../components/common/SectionHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { getAdminDisputesData } from '../../services/adminDataService';
import { disputeApi } from '../../api';

export default function AdminDisputesPage() {
  const { pushToast } = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [decisionAmount, setDecisionAmount] = useState('');
  const [decisionNotes, setDecisionNotes] = useState('');
  const [fallback, setFallback] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    const payload = await getAdminDisputesData();
    setRows(payload.rows);
    setFallback(Boolean(payload.fallback));
    setError(payload.error || '');
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const applyLocalDecision = (status) => {
    if (!selected) return;
    setRows((prev) =>
      prev.map((item) =>
        String(item._id) === String(selected._id)
          ? {
              ...item,
              status,
              admin_decision_amount: Number(decisionAmount || 0),
              admin_notes: decisionNotes
            }
          : item
      )
    );
  };

  const approve = async () => {
    if (!selected) return;
    try {
      await disputeApi.approve(selected._id, {
        admin_decision_amount: Number(decisionAmount || 0),
        admin_notes: decisionNotes
      });
      pushToast({ tone: 'success', title: 'Đã duyệt khiếu nại', message: 'Quyết định bồi thường đã được ghi nhận.' });
      setSelected(null);
      setDecisionAmount('');
      setDecisionNotes('');
      loadData();
    } catch (apiError) {
      if (fallback) {
        applyLocalDecision('APPROVED');
        pushToast({ tone: 'success', title: 'Duyệt ở chế độ dự phòng', message: 'Đã cập nhật trạng thái cục bộ cho phiên demo.' });
        setSelected(null);
      } else {
        pushToast({ tone: 'error', title: 'Duyệt thất bại', message: apiError?.response?.data?.error || 'Không thể duyệt khiếu nại.' });
      }
    }
  };

  const reject = async (disputeId) => {
    try {
      await disputeApi.reject(disputeId, { admin_notes: 'Quản trị viên đã từ chối.' });
      pushToast({ tone: 'success', title: 'Đã từ chối khiếu nại', message: 'Khiếu nại đã bị từ chối.' });
      loadData();
    } catch (apiError) {
      if (fallback) {
        setRows((prev) => prev.map((item) => (String(item._id) === String(disputeId) ? { ...item, status: 'REJECTED' } : item)));
        pushToast({ tone: 'success', title: 'Từ chối ở chế độ dự phòng', message: 'Đã cập nhật trạng thái cục bộ cho phiên demo.' });
      } else {
        pushToast({ tone: 'error', title: 'Từ chối thất bại', message: apiError?.response?.data?.error || 'Không thể từ chối khiếu nại.' });
      }
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="Quản trị • Tranh chấp" subtitle="So sánh bằng chứng trước/sau, quyết định mức bồi thường và ghi chú xử lý cho từng yêu cầu." />

      {fallback ? (
        <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
          API tranh chấp chưa đầy đủ, dashboard đang hiển thị dữ liệu dự phòng để bạn tiếp tục kiểm thử luồng xử lý.
        </div>
      ) : null}

      {!loading && error ? (
        <div className="inline-flex items-center gap-2 rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
          <AlertTriangle className="h-3.5 w-3.5" /> {error}
        </div>
      ) : null}

      <DataTable
        loading={loading}
        rows={rows}
        columns={[
          { key: '_id', title: 'Tranh chấp', render: (row) => `#${String(row._id || '').slice(-8)}` },
          { key: 'contract_id', title: 'Hợp đồng', render: (row) => String(row.contract_id || '').slice(-8) || 'Chưa cập nhật' },
          { key: 'claimed_amount', title: 'Yêu cầu bồi thường', render: (row) => formatCurrency(row.claimed_amount || 0) },
          { key: 'decision', title: 'Mức quyết định', render: (row) => formatCurrency(row.admin_decision_amount || 0) },
          { key: 'status', title: 'Trạng thái', render: (row) => <StatusBadge status={row.status} /> },
          { key: 'created_at', title: 'Thời gian tạo', render: (row) => formatDateTime(row.created_at) },
          {
            key: 'action',
            title: 'Thao tác',
            render: (row) => (
              <div className="flex gap-1">
                {String(row.status || '').toUpperCase() === 'PENDING' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setSelected(row);
                        setDecisionAmount(String(row.claimed_amount || ''));
                      }}
                      className="rounded-lg bg-cyan-500 px-2 py-1 text-xs font-semibold text-slate-950"
                    >
                      Xem xét
                    </button>
                    <button
                      type="button"
                      onClick={() => reject(row._id)}
                      className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-2 py-1 text-xs text-rose-200"
                    >
                      Từ chối
                    </button>
                  </>
                ) : (
                  <span className="text-xs text-slate-500">Đã đóng</span>
                )}
              </div>
            )
          }
        ]}
      />

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={`Xử lý tranh chấp #${selected?._id?.slice(-6) || ''}`}
        width="max-w-xl"
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="rounded-xl border border-white/15 px-4 py-2 text-sm text-slate-200 hover:bg-white/10"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={approve}
              className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
            >
              Duyệt tranh chấp
            </button>
          </div>
        }
      >
        <div className="space-y-3 text-sm text-slate-200">
          <p className="rounded-lg border border-white/10 bg-slate-950/40 p-3">{selected?.description || 'Chưa có mô tả chi tiết.'}</p>
          <label className="block">
            <span className="text-xs uppercase tracking-[0.18em] text-slate-300">Mức bồi thường</span>
            <input
              type="number"
              value={decisionAmount}
              onChange={(event) => setDecisionAmount(event.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-white outline-none"
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-[0.18em] text-slate-300">Ghi chú quản trị</span>
            <textarea
              rows={4}
              value={decisionNotes}
              onChange={(event) => setDecisionNotes(event.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-white outline-none"
            />
          </label>
        </div>
      </Modal>
    </div>
  );
}
