import React, { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import { contractApi } from '../../api';
import ContractCard from '../../components/common/ContractCard';
import EmptyState from '../../components/common/EmptyState';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import Modal from '../../components/common/Modal';
import SectionHeader from '../../components/common/SectionHeader';
import Timeline from '../../components/common/Timeline';
import { pickArray } from '../../utils/formatters';

export default function OwnerContractsPage() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await contractApi.getOwnerContracts();
      setContracts(pickArray(response.data));
    } catch {
      setContracts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Hợp đồng cho thuê"
        subtitle="Theo dõi trạng thái giao xe, trả xe và quyết toán cho toàn bộ hợp đồng phía chủ xe."
      />

      {loading ? (
        <LoadingSkeleton rows={4} />
      ) : contracts.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Chưa có hợp đồng cho thuê"
          description="Hợp đồng sẽ xuất hiện sau khi bạn phê duyệt yêu cầu thuê xe."
        />
      ) : (
        <div className="space-y-3">
          {contracts.map((contract) => (
            <ContractCard
              key={contract._id}
              contract={contract}
              action={
                <button
                  type="button"
                  onClick={() => setSelected(contract)}
                  className="rounded-xl border border-white/15 px-3 py-1.5 text-xs text-slate-200 transition hover:bg-white/10"
                >
                  Xem dòng thời gian
                </button>
              }
            />
          ))}
        </div>
      )}

      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title="Dòng thời gian hợp đồng" width="max-w-xl">
        {selected ? (
          <Timeline
            items={[
              { title: 'Hợp đồng được tạo', status: 'APPROVED', timestamp: selected.created_at },
              { title: 'Kiểm tra khi nhận xe', status: selected.pickup_time ? 'COMPLETED' : 'PENDING', timestamp: selected.pickup_time },
              { title: 'Xe đang được sử dụng', status: selected.pickup_time && !selected.return_time ? 'ACTIVE' : 'PENDING' },
              { title: 'Kiểm tra khi trả xe', status: selected.return_time ? 'COMPLETED' : 'PENDING', timestamp: selected.return_time },
              { title: 'Quyết toán', status: selected.status }
            ]}
          />
        ) : null}
      </Modal>
    </div>
  );
}

