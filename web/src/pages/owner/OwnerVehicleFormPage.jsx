import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save } from 'lucide-react';
import { vehicleApi } from '../../api';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import SectionHeader from '../../components/common/SectionHeader';
import { useToast } from '../../context/ToastContext';
import { resolveImage } from '../../utils/image';

const defaultForm = {
  vehicle_type: 'CAR',
  brand: '',
  model: '',
  year: '',
  license_plate: '',
  fuel_type: 'PETROL',
  transmission: 'AUTOMATIC',
  seats: 4,
  daily_rate: '',
  deposit_amount: '',
  allowed_region: '',
  description: '',
  available_from: '',
  available_to: ''
};

export default function OwnerVehicleFormPage() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const { pushToast } = useToast();

  const [form, setForm] = useState(defaultForm);
  const [existingImages, setExistingImages] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(editing);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadVehicle = async () => {
      if (!editing) return;
      setLoading(true);
      try {
        const response = await vehicleApi.getById(id);
        const vehicle = response.data;
        setForm({
          vehicle_type: vehicle.vehicle_type || 'CAR',
          brand: vehicle.brand || '',
          model: vehicle.model || '',
          year: vehicle.year || '',
          license_plate: vehicle.license_plate || '',
          fuel_type: vehicle.fuel_type || 'PETROL',
          transmission: vehicle.transmission || 'AUTOMATIC',
          seats: vehicle.seats || 4,
          daily_rate: vehicle.daily_rate || '',
          deposit_amount: vehicle.deposit_amount || '',
          allowed_region: vehicle.allowed_region || '',
          description: vehicle.description || '',
          available_from: vehicle.available_from ? String(vehicle.available_from).slice(0, 10) : '',
          available_to: vehicle.available_to ? String(vehicle.available_to).slice(0, 10) : ''
        });
        setExistingImages(Array.isArray(vehicle.images) ? vehicle.images : []);
      } catch (error) {
        pushToast({ tone: 'error', title: 'Tải thất bại', message: error?.response?.data?.error || 'Không thể tải thông tin xe.' });
      } finally {
        setLoading(false);
      }
    };

    loadVehicle();
  }, [editing, id]);

  const previews = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);

  useEffect(() => () => previews.forEach((item) => URL.revokeObjectURL(item)), [previews]);

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      if (editing) {
        await vehicleApi.update(id, {
          ...form,
          seats: Number(form.seats),
          daily_rate: Number(form.daily_rate),
          deposit_amount: Number(form.deposit_amount)
        });

        if (files.length) {
          pushToast({
            tone: 'info',
            title: 'Đã cập nhật xe',
            message: 'Thông tin xe đã cập nhật. Việc tải thêm ảnh hiện được quản lý ở API riêng.'
          });
        } else {
          pushToast({ tone: 'success', title: 'Đã cập nhật xe', message: 'Thông tin xe đã được lưu.' });
        }
      } else {
        if (!files.length) {
          pushToast({ tone: 'warning', title: 'Thiếu ảnh', message: 'Vui lòng thêm ít nhất một ảnh xe.' });
          setSubmitting(false);
          return;
        }

        const formData = new FormData();
        Object.entries({
          ...form,
          seats: Number(form.seats),
          daily_rate: Number(form.daily_rate),
          deposit_amount: Number(form.deposit_amount)
        }).forEach(([key, value]) => formData.append(key, value));
        files.forEach((file) => formData.append('images', file));

        await vehicleApi.create(formData);
        pushToast({ tone: 'success', title: 'Đăng xe thành công', message: 'Xe đã được đăng thành công.' });
      }

      navigate('/owner/vehicles');
    } catch (error) {
      pushToast({ tone: 'error', title: 'Lưu thất bại', message: error?.response?.data?.error || 'Không thể lưu thông tin xe.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton rows={4} />;
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title={editing ? 'Chỉnh sửa xe' : 'Đăng xe mới'}
        subtitle="Thiết lập đầy đủ thông tin hiển thị để tăng tỉ lệ đặt xe và tối ưu trải nghiệm người thuê."
      />

      <form onSubmit={handleSubmit} className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm text-slate-300">Loại xe
            <select value={form.vehicle_type} onChange={(event) => setField('vehicle_type', event.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-white outline-none">
              {['CAR', 'SUV', 'PICKUP', 'VAN', 'MOTORBIKE'].map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>

          <label className="text-sm text-slate-300">Hãng xe
            <input required value={form.brand} onChange={(event) => setField('brand', event.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-white outline-none" />
          </label>

          <label className="text-sm text-slate-300">Mẫu xe
            <input required value={form.model} onChange={(event) => setField('model', event.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-white outline-none" />
          </label>

          <label className="text-sm text-slate-300">Năm sản xuất
            <input required type="number" value={form.year} onChange={(event) => setField('year', event.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-white outline-none" />
          </label>

          <label className="text-sm text-slate-300">Biển số
            <input required value={form.license_plate} onChange={(event) => setField('license_plate', event.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-white outline-none" />
          </label>

          <label className="text-sm text-slate-300">Nhiên liệu
            <select value={form.fuel_type} onChange={(event) => setField('fuel_type', event.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-white outline-none">
              {['PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID'].map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>

          <label className="text-sm text-slate-300">Hộp số
            <select value={form.transmission} onChange={(event) => setField('transmission', event.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-white outline-none">
              {['AUTOMATIC', 'MANUAL'].map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>

          <label className="text-sm text-slate-300">Số ghế
            <input required type="number" min="1" value={form.seats} onChange={(event) => setField('seats', event.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-white outline-none" />
          </label>

          <label className="text-sm text-slate-300">Giá thuê mỗi ngày
            <input required type="number" min="0" value={form.daily_rate} onChange={(event) => setField('daily_rate', event.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-white outline-none" />
          </label>

          <label className="text-sm text-slate-300">Tiền cọc
            <input required type="number" min="0" value={form.deposit_amount} onChange={(event) => setField('deposit_amount', event.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-white outline-none" />
          </label>

          <label className="text-sm text-slate-300">Phạm vi cho phép
            <input value={form.allowed_region} onChange={(event) => setField('allowed_region', event.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-white outline-none" />
          </label>

          <label className="text-sm text-slate-300">Sẵn sàng từ ngày
            <input type="date" value={form.available_from} onChange={(event) => setField('available_from', event.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-white outline-none" />
          </label>

          <label className="text-sm text-slate-300">Sẵn sàng đến ngày
            <input type="date" value={form.available_to} onChange={(event) => setField('available_to', event.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-white outline-none" />
          </label>

          <label className="md:col-span-2 text-sm text-slate-300">Mô tả
            <textarea rows={4} value={form.description} onChange={(event) => setField('description', event.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-white outline-none" />
          </label>

          <label className="md:col-span-2 text-sm text-slate-300">Tải ảnh xe
            <input type="file" accept="image/*" multiple onChange={(event) => setFiles(Array.from(event.target.files || []))} className="mt-1 block w-full text-sm text-slate-200" />
          </label>

          <div className="md:col-span-2 grid grid-cols-3 gap-2">
            {existingImages.slice(0, 3).map((image, idx) => (
              <img key={`existing-${idx}`} src={resolveImage(image, idx)} alt="existing vehicle" className="h-24 w-full rounded-lg object-cover" />
            ))}
            {previews.slice(0, 6).map((image, idx) => (
              <img key={`preview-${idx}`} src={image} alt="xem-truoc" className="h-24 w-full rounded-lg object-cover" />
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button type="button" onClick={() => navigate('/owner/vehicles')} className="rounded-xl border border-white/15 px-4 py-2 text-sm text-slate-200 hover:bg-white/10">
            Hủy
          </button>
          <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:bg-slate-600">
            <Save className="h-4 w-4" /> {submitting ? 'Đang lưu...' : 'Lưu xe'}
          </button>
        </div>
      </form>
    </div>
  );
}
