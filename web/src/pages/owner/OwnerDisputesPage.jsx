import React, { useEffect, useState } from 'react';
import { Scale } from 'lucide-react';
import { contractApi, disputeApi } from '../../api';
import DisputeCard from '../../components/common/DisputeCard';
import EmptyState from '../../components/common/EmptyState';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import Modal from '../../components/common/Modal';
import SectionHeader from '../../components/common/SectionHeader';
import { useToast } from '../../context/ToastContext';
import { pickArray } from '../../utils/formatters';

const defaultForm = {
  contract_id: '',
  claimed_amount: '',
  description: ''
};

export default function OwnerDisputesPage() {
  const { pushToast } = useToast();
  const [disputes, setDisputes] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openCreate, setOpenCreate] = useState(false);
  const [form, setForm] = useState(defaultForm);

  const loadData = async () => {
    setLoading(true);
    try {
      const [disputeRes, contractRes] = await Promise.allSettled([
        disputeApi.getMyDisputes(),
        contractApi.getOwnerContracts()
      ]);
      const disputeRows = disputeRes.status === 'fulfilled' ? pickArray(disputeRes.value.data) : [];
      const contractRows = contractRes.status === 'fulfilled' ? pickArray(contractRes.value.data) : [];

      setDisputes(disputeRows);
      setContracts(contractRows);
      if (!form.contract_id && contractRows.length) {
        setForm((prev) => ({ ...prev, contract_id: contractRows[0]._id }));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const createDispute = async (event) => {
    event.preventDefault();
    try {
      await disputeApi.create({
        contract_id: form.contract_id,
        claimed_amount: Number(form.claimed_amount),
        description: form.description
      });
      pushToast({ tone: 'success', title: 'Đã tạo khiếu nại', message: 'Yêu cầu bồi thường đã được gửi.' });
      setForm(defaultForm);
      setOpenCreate(false);
      loadData();
    } catch (error) {
      pushToast({ tone: 'error', title: 'Tạo thất bại', message: error?.response?.data?.error || 'Không thể tạo khiếu nại.' });
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Khiếu nại & Bồi thường"
        subtitle="Tạo yêu cầu bồi thường với bằng chứng hư hỏng và theo dõi quyết định xử lý từ quản trị viên."
        action={
          <button
            type="button"
            onClick={() => setOpenCreate(true)}
            className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-400"
          >
            Tạo khiếu nại
          </button>
        }
      />

      {loading ? (
        <LoadingSkeleton rows={4} />
      ) : disputes.length === 0 ? (
        <EmptyState
          icon={Scale}
          title="Chưa có khiếu nại"
          description="Khi phát sinh hư hỏng, bạn có thể tạo khiếu nại để quản trị viên xem xét và quyết định mức bồi thường."
        />
      ) : (
        <div className="space-y-3">
          {disputes.map((dispute) => (
            <DisputeCard key={dispute._id} dispute={dispute} />
          ))}
        </div>
      )}

      <Modal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        title="Tạo khiếu nại bồi thường"
        width="max-w-xl"
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpenCreate(false)}
              className="rounded-xl border border-white/15 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
            >
              Hủy
            </button>
            <button
              type="submit"
              form="create-dispute-form"
              className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-400"
            >
              Gửi khiếu nại
            </button>
          </div>
        }
      >
        <form id="create-dispute-form" onSubmit={createDispute} className="space-y-3">
          <label className="block text-sm text-slate-300">
            Hợp đồng
            <select
              value={form.contract_id}
              onChange={(event) => setField('contract_id', event.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white outline-none"
              required
            >
              {contracts.map((contract) => (
                <option key={contract._id} value={contract._id}>
                  {contract._id}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm text-slate-300">
            Chi phí sửa chữa ước tính
            <input
              type="number"
              min="0"
              required
              value={form.claimed_amount}
              onChange={(event) => setField('claimed_amount', event.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white outline-none"
            />
          </label>

          <label className="block text-sm text-slate-300">
            Mô tả hư hỏng
            <textarea
              rows={4}
              required
              value={form.description}
              onChange={(event) => setField('description', event.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white outline-none"
            />
          </label>
        </form>
      </Modal>
    </div>
  );
}
