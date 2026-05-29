import React, { useEffect, useMemo, useState } from 'react';
import { Camera, ClipboardCheck } from 'lucide-react';
import { contractApi } from '../../api';
import EmptyState from '../../components/common/EmptyState';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import SectionHeader from '../../components/common/SectionHeader';
import Timeline from '../../components/common/Timeline';
import { useToast } from '../../context/ToastContext';
import { compactId, pickArray } from '../../utils/formatters';
import { resolveImage } from '../../utils/image';

export default function InspectionsPage() {
  const { pushToast } = useToast();
  const [contracts, setContracts] = useState([]);
  const [selectedContractId, setSelectedContractId] = useState('');
  const [pickupImages, setPickupImages] = useState([]);
  const [returnImages, setReturnImages] = useState([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadContracts = async () => {
      setLoading(true);
      try {
        const response = await contractApi.getRenterContracts();
        const list = pickArray(response.data);
        setContracts(list);
        if (list.length) setSelectedContractId(list[0]._id);
      } catch {
        setContracts([]);
      } finally {
        setLoading(false);
      }
    };

    loadContracts();
  }, []);

  const selectedContract = useMemo(
    () => contracts.find((item) => String(item._id) === String(selectedContractId)),
    [contracts, selectedContractId]
  );

  const submitInspection = async (type) => {
    if (!selectedContractId) return;
    setSubmitting(true);

    try {
      const formData = new FormData();
      const files = type === 'pickup' ? pickupImages : returnImages;
      const key = type === 'pickup' ? 'pickup_images' : 'return_images';

      files.forEach((file) => formData.append(key, file));
      formData.append('description', notes || `Biên bản ${type === 'pickup' ? 'nhận' : 'trả'} xe từ người thuê`);

      if (type === 'pickup') {
        await contractApi.pickup(selectedContractId, formData);
      } else {
        await contractApi.returnVehicle(selectedContractId, formData);
      }

      pushToast({ tone: 'success', title: 'Đã gửi biên bản', message: `Đã gửi biên bản ${type === 'pickup' ? 'nhận xe' : 'trả xe'} thành công.` });
      setNotes('');
      setPickupImages([]);
      setReturnImages([]);
    } catch (error) {
      pushToast({
        tone: 'error',
        title: 'Gửi biên bản thất bại',
        message: error?.response?.data?.error || 'Không thể gửi biên bản kiểm tra ở thời điểm này.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton rows={4} />;
  }

  if (!contracts.length) {
    return (
      <EmptyState
        icon={ClipboardCheck}
        title="Chưa có hợp đồng để kiểm tra xe"
        description="Dòng thời gian kiểm tra xe sẽ xuất hiện khi bạn có hợp đồng đang hoạt động."
      />
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Quy trình kiểm tra xe"
        subtitle="Tải ảnh nhận xe/trả xe, ghi nhận hiện trạng và bám dòng thời gian hợp đồng theo chuẩn vận hành."
      />

      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
        <label className="text-xs uppercase tracking-[0.18em] text-slate-300">Chọn hợp đồng</label>
        <select
          value={selectedContractId}
          onChange={(event) => setSelectedContractId(event.target.value)}
          className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white outline-none"
        >
          {contracts.map((contract) => (
            <option key={contract._id} value={contract._id}>
              Hợp đồng #{compactId(contract._id)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4 rounded-2xl border border-white/10 bg-slate-900/60 p-4">
          <h3 className="text-lg font-semibold text-white">Bằng chứng kiểm tra xe</h3>

          <label className="block text-sm text-slate-300">
            Ảnh nhận xe
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(event) => setPickupImages(Array.from(event.target.files || []))}
              className="mt-1 block w-full text-sm text-slate-200"
            />
          </label>

          <label className="block text-sm text-slate-300">
            Ảnh trả xe
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(event) => setReturnImages(Array.from(event.target.files || []))}
              className="mt-1 block w-full text-sm text-slate-200"
            />
          </label>

          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={4}
            placeholder="Ghi chú hiện trạng, hư hỏng có sẵn hoặc phát sinh..."
            className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white outline-none"
          />

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={submitting}
              onClick={() => submitInspection('pickup')}
              className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:bg-slate-600"
            >
              Gửi biên bản nhận xe
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => submitInspection('return')}
              className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10 disabled:bg-slate-600"
            >
              Gửi biên bản trả xe
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[...(selectedContract?.pickup_images || []), ...(selectedContract?.return_images || [])]
              .slice(0, 8)
              .map((image, idx) => (
                <img key={`${image}-${idx}`} src={resolveImage(image, idx)} alt="kiem-tra-xe" className="h-16 w-full rounded-lg object-cover" />
              ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
          <h3 className="mb-4 text-lg font-semibold text-white">Dòng thời gian kiểm tra xe</h3>
          <Timeline
            items={[
              { title: 'Hợp đồng được tạo', status: 'APPROVED', timestamp: selectedContract?.created_at },
              { title: 'Đã thanh toán cọc', status: 'PENDING', description: 'Nền tảng xác nhận thanh toán' },
              {
                title: 'Kiểm tra khi nhận xe',
                status: selectedContract?.pickup_time ? 'COMPLETED' : 'PENDING',
                timestamp: selectedContract?.pickup_time,
                description: 'Tải ảnh tình trạng xe khi nhận'
              },
              { title: 'Xe đang được sử dụng', status: selectedContract?.pickup_time ? 'ACTIVE' : 'PENDING' },
              {
                title: 'Kiểm tra khi trả xe',
                status: selectedContract?.return_time ? 'COMPLETED' : 'PENDING',
                timestamp: selectedContract?.return_time,
                description: 'Tải ảnh tình trạng xe khi trả'
              },
              {
                title: selectedContract?.status === 'DISPUTED' ? 'Đã tạo tranh chấp' : 'Đã hoàn tiền cọc',
                status: selectedContract?.status === 'DISPUTED' ? 'DISPUTED' : 'REFUNDED'
              }
            ]}
          />
          <p className="mt-4 inline-flex items-center gap-2 rounded-lg border border-amber-400/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
            <Camera className="h-3.5 w-3.5" />
            Hãy chụp rõ thân xe, góc bánh, cabin và các vết xước để tăng độ chính xác xử lý tranh chấp.
          </p>
        </div>
      </div>
    </div>
  );
}
