import React, { useEffect, useMemo, useState } from 'react';
import { FileText } from 'lucide-react';
import { contractApi } from '../../api';
import ContractCard from '../../components/common/ContractCard';
import EmptyState from '../../components/common/EmptyState';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import Modal from '../../components/common/Modal';
import SectionHeader from '../../components/common/SectionHeader';
import Timeline from '../../components/common/Timeline';
import { calculateDays, formatCurrency, pickArray } from '../../utils/formatters';

const tabs = [
  { key: 'mine', label: 'Hợp đồng thuê của tôi' },
  { key: 'owner', label: 'Hợp đồng cho thuê của tôi' }
];

export default function ContractsPage() {
  const [activeTab, setActiveTab] = useState('mine');
  const [mineContracts, setMineContracts] = useState([]);
  const [ownerContracts, setOwnerContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContract, setSelectedContract] = useState(null);

  const loadContracts = async () => {
    setLoading(true);
    try {
      const [mineRes, ownerRes] = await Promise.allSettled([
        contractApi.getRenterContracts(),
        contractApi.getOwnerContracts()
      ]);

      setMineContracts(mineRes.status === 'fulfilled' ? pickArray(mineRes.value.data) : []);
      setOwnerContracts(ownerRes.status === 'fulfilled' ? pickArray(ownerRes.value.data) : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContracts();
  }, []);

  const contracts = useMemo(() => (activeTab === 'mine' ? mineContracts : ownerContracts), [activeTab, mineContracts, ownerContracts]);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Hợp đồng"
        subtitle="Quản lý toàn bộ vòng đời hợp đồng: thuê xe, kiểm tra nhận/trả xe, thanh toán và tranh chấp."
      />

      <div className="inline-flex rounded-xl border border-white/10 bg-slate-900/50 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-lg px-4 py-2 text-sm transition ${
              activeTab === tab.key ? 'bg-cyan-500 text-slate-950 font-semibold' : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSkeleton rows={4} />
      ) : contracts.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Chưa có hợp đồng"
          description="Hợp đồng sẽ tự động tạo khi yêu cầu thuê được xác nhận."
        />
      ) : (
        <div className="space-y-3">
          {contracts.map((contract) => (
            <ContractCard
              key={contract._id}
              contract={contract}
              action={
                <div className="flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedContract(contract)}
                    className="rounded-xl border border-white/15 px-3 py-1.5 text-xs text-slate-200 transition hover:bg-white/10"
                  >
                    Xem chi tiết
                  </button>
                </div>
              }
            />
          ))}
        </div>
      )}

      <Modal
        open={Boolean(selectedContract)}
        onClose={() => setSelectedContract(null)}
        title={`Hợp đồng #${selectedContract?._id?.slice(-6) || ''}`}
      >
        {selectedContract ? (
          <div className="space-y-4">
            <div className="grid gap-3 rounded-xl border border-white/10 bg-slate-950/40 p-4 text-sm text-slate-200 md:grid-cols-2">
              <p>Mã hợp đồng: <span className="font-semibold text-white">{selectedContract._id}</span></p>
              <p>Trạng thái: <span className="font-semibold text-white">{selectedContract.status}</span></p>
              <p>Tiền thuê: <span className="font-semibold text-cyan-300">{formatCurrency(selectedContract.rental_amount || 0)}</span></p>
              <p>Tiền cọc: <span className="font-semibold text-white">{formatCurrency(selectedContract.deposit_amount || selectedContract.deposit || 0)}</span></p>
              <p>Phí hệ thống 4%: <span className="font-semibold text-white">{formatCurrency((selectedContract.rental_amount || 0) * 0.04)}</span></p>
              <p>Thời gian thuê: <span className="font-semibold text-white">{calculateDays(selectedContract.rental_start_date, selectedContract.rental_end_date)} ngày</span></p>
            </div>

            <Timeline
              items={[
                {
                  title: 'Hợp đồng được tạo',
                  description: 'Hợp đồng phát sinh sau khi chủ xe xác nhận yêu cầu thuê.',
                  status: 'APPROVED',
                  timestamp: selectedContract.created_at
                },
                {
                  title: 'Thanh toán tiền cọc',
                  description: 'Đặt cọc được ghi nhận trước khi nhận xe.',
                  status: 'PENDING'
                },
                {
                  title: 'Kiểm tra khi nhận xe',
                  description: 'Upload ảnh nhận xe và ghi chú hiện trạng.',
                  status: selectedContract.pickup_time ? 'COMPLETED' : 'PENDING',
                  timestamp: selectedContract.pickup_time
                },
                {
                  title: 'Kiểm tra khi trả xe',
                  description: 'Đối soát ảnh trả xe, xác định hoàn cọc hoặc tranh chấp.',
                  status: selectedContract.return_time ? 'COMPLETED' : 'PENDING',
                  timestamp: selectedContract.return_time
                },
                {
                  title: 'Quyết toán hợp đồng',
                  description: 'Hoàn cọc hoặc bồi thường theo quyết định tranh chấp.',
                  status: selectedContract.status
                }
              ]}
            />
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
