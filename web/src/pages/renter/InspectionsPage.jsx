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
      formData.append('description', notes || `${type} inspection by renter`);

      if (type === 'pickup') {
        await contractApi.pickup(selectedContractId, formData);
      } else {
        await contractApi.returnVehicle(selectedContractId, formData);
      }

      pushToast({ tone: 'success', title: 'Inspection submitted', message: `Đã gửi ${type} inspection thành công.` });
      setNotes('');
      setPickupImages([]);
      setReturnImages([]);
    } catch (error) {
      pushToast({
        tone: 'error',
        title: 'Inspection failed',
        message: error?.response?.data?.error || 'Không thể gửi inspection ở thời điểm này.'
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
        title="No contracts for inspection"
        description="Inspection timeline sẽ xuất hiện khi bạn có hợp đồng đang hoạt động."
      />
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Inspection Workflow"
        subtitle="Upload ảnh nhận xe/trả xe, ghi nhận hiện trạng và bám timeline hợp đồng theo chuẩn vận hành."
      />

      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
        <label className="text-xs uppercase tracking-[0.18em] text-slate-300">Select contract</label>
        <select
          value={selectedContractId}
          onChange={(event) => setSelectedContractId(event.target.value)}
          className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white outline-none"
        >
          {contracts.map((contract) => (
            <option key={contract._id} value={contract._id}>
              Contract #{compactId(contract._id)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4 rounded-2xl border border-white/10 bg-slate-900/60 p-4">
          <h3 className="text-lg font-semibold text-white">Inspection Evidence</h3>

          <label className="block text-sm text-slate-300">
            Pickup images
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(event) => setPickupImages(Array.from(event.target.files || []))}
              className="mt-1 block w-full text-sm text-slate-200"
            />
          </label>

          <label className="block text-sm text-slate-300">
            Return images
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
              Submit pickup inspection
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => submitInspection('return')}
              className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10 disabled:bg-slate-600"
            >
              Submit return inspection
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[...(selectedContract?.pickup_images || []), ...(selectedContract?.return_images || [])]
              .slice(0, 8)
              .map((image, idx) => (
                <img key={`${image}-${idx}`} src={resolveImage(image, idx)} alt="inspection" className="h-16 w-full rounded-lg object-cover" />
              ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
          <h3 className="mb-4 text-lg font-semibold text-white">Inspection Timeline</h3>
          <Timeline
            items={[
              { title: 'Contract created', status: 'APPROVED', timestamp: selectedContract?.created_at },
              { title: 'Deposit paid', status: 'PENDING', description: 'Payment verification by platform' },
              {
                title: 'Pickup inspection',
                status: selectedContract?.pickup_time ? 'COMPLETED' : 'PENDING',
                timestamp: selectedContract?.pickup_time,
                description: 'Upload vehicle condition at pickup'
              },
              { title: 'Vehicle in use', status: selectedContract?.pickup_time ? 'ACTIVE' : 'PENDING' },
              {
                title: 'Return inspection',
                status: selectedContract?.return_time ? 'COMPLETED' : 'PENDING',
                timestamp: selectedContract?.return_time,
                description: 'Upload condition at return'
              },
              {
                title: selectedContract?.status === 'DISPUTED' ? 'Dispute created' : 'Deposit refunded',
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
