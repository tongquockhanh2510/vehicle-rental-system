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

export default function ContractsPage() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContract, setSelectedContract] = useState(null);

  const loadContracts = async () => {
    setLoading(true);
    try {
      const response = await contractApi.getRenterContracts();
      setContracts(pickArray(response.data));
    } catch {
      setContracts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContracts();
  }, []);

  const sortedContracts = useMemo(
    () => [...contracts].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()),
    [contracts]
  );

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Hợp đồng thuê của tôi"
        subtitle="Theo dõi hợp đồng thuê, kiểm tra nhận/trả xe và quyết toán sau mỗi chuyến đi."
      />

      {loading ? (
        <LoadingSkeleton rows={4} />
      ) : sortedContracts.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Chưa có hợp đồng thuê"
          description="Hợp đồng thuê sẽ tự động tạo sau khi chủ xe duyệt yêu cầu của bạn."
        />
      ) : (
        <div className="space-y-3">
          {sortedContracts.map((contract) => (
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
                  description: 'Phát sinh sau khi chủ xe duyệt yêu cầu thuê của bạn.',
                  status: 'APPROVED',
                  timestamp: selectedContract.created_at
                },
                {
                  title: 'Thanh toán tiền cọc',
                  description: 'Tiền cọc được giữ an toàn cho tới khi kết thúc hợp đồng.',
                  status: 'PENDING'
                },
                {
                  title: 'Kiểm tra khi nhận xe',
                  description: 'Bạn upload ảnh khi nhận xe và xác nhận hiện trạng ban đầu.',
                  status: selectedContract.pickup_time ? 'COMPLETED' : 'PENDING',
                  timestamp: selectedContract.pickup_time
                },
                {
                  title: 'Kiểm tra khi trả xe',
                  description: 'Đối soát ảnh trả xe để hoàn cọc hoặc mở tranh chấp nếu cần.',
                  status: selectedContract.return_time ? 'COMPLETED' : 'PENDING',
                  timestamp: selectedContract.return_time
                },
                {
                  title: 'Quyết toán hợp đồng',
                  description: 'Xác nhận hoàn tất giao dịch thuê xe.',
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
