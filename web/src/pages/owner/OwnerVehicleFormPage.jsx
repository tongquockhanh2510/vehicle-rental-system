import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save } from 'lucide-react';
import { vehicleApi } from '../../api';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import SectionHeader from '../../components/common/SectionHeader';
import {
  FUEL_TYPE_OPTIONS,
  TRANSMISSION_OPTIONS,
  VEHICLE_TYPE_OPTIONS,
  normalizeVehicleTypeValue
} from '../../constants/vehicle';
import { CITY_OPTIONS, getDistrictOptions } from '../../constants/locationOptions';
import { useToast } from '../../context/ToastContext';
import { resolveImage } from '../../utils/image';

const REGION_OPTIONS = [
  { value: 'TP_HCM', label: 'TP.HCM' },
  { value: 'HA_NOI', label: 'HÃ  Ná»™i' },
  { value: 'DA_NANG', label: 'ÄÃ  Náºµng' },
  { value: 'OTHER', label: 'Khu vá»±c khÃ¡c' }
];

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
  city: 'TP.HCM',
  district: '',
  pickup_location: '',
  return_location: '',
  allowed_region: 'TP_HCM',
  description: '',
  available_from: '',
  available_to: ''
};

function getAllowedRegionByCity(city) {
  if (city === 'TP.HCM') return 'TP_HCM';
  if (city === 'HÃ  Ná»™i') return 'HA_NOI';
  if (city === 'ÄÃ  Náºµng') return 'DA_NANG';
  return 'OTHER';
}

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

  const districtOptions = useMemo(() => getDistrictOptions(form.city), [form.city]);

  useEffect(() => {
    const loadVehicle = async () => {
      if (!editing) return;
      setLoading(true);
      try {
        const response = await vehicleApi.getById(id);
        const vehicle = response.data;
        setForm({
          vehicle_type: normalizeVehicleTypeValue(vehicle.vehicle_type) || 'CAR',
          brand: vehicle.brand || '',
          model: vehicle.model || '',
          year: vehicle.year || '',
          license_plate: vehicle.license_plate || '',
          fuel_type: vehicle.fuel_type || 'PETROL',
          transmission: vehicle.transmission || 'AUTOMATIC',
          seats: vehicle.seats || 4,
          daily_rate: vehicle.daily_rate || '',
          deposit_amount: vehicle.deposit_amount || '',
          city: vehicle.city || 'TP.HCM',
          district: vehicle.district || '',
          pickup_location: vehicle.pickup_location || '',
          return_location: vehicle.return_location || '',
          allowed_region: vehicle.allowed_region || getAllowedRegionByCity(vehicle.city),
          description: vehicle.description || '',
          available_from: vehicle.available_from ? String(vehicle.available_from).slice(0, 10) : '',
          available_to: vehicle.available_to ? String(vehicle.available_to).slice(0, 10) : ''
        });
        setExistingImages(Array.isArray(vehicle.images) ? vehicle.images : []);
      } catch (error) {
        pushToast({ tone: 'error', title: 'Táº£i tháº¥t báº¡i', message: error?.response?.data?.error || 'KhÃ´ng thá»ƒ táº£i thÃ´ng tin xe.' });
      } finally {
        setLoading(false);
      }
    };

    loadVehicle();
  }, [editing, id, pushToast]);

  const previews = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);

  useEffect(() => () => previews.forEach((item) => URL.revokeObjectURL(item)), [previews]);

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleCityChange = (city) => {
    setForm((prev) => ({
      ...prev,
      city,
      district: '',
      allowed_region: getAllowedRegionByCity(city)
    }));
  };

  const normalizePayload = () => ({
    ...form,
    vehicle_type: normalizeVehicleTypeValue(form.vehicle_type),
    seats: Number(form.seats),
    daily_rate: Number(form.daily_rate),
    deposit_amount: Number(form.deposit_amount)
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      if (editing) {
        await vehicleApi.update(id, normalizePayload());

        if (files.length) {
          pushToast({
            tone: 'info',
            title: 'ÄÃ£ cáº­p nháº­t xe',
            message: 'ThÃ´ng tin xe Ä‘Ã£ cáº­p nháº­t. Viá»‡c táº£i thÃªm áº£nh hiá»‡n Ä‘Æ°á»£c quáº£n lÃ½ á»Ÿ API riÃªng.'
          });
        } else {
          pushToast({ tone: 'success', title: 'ÄÃ£ cáº­p nháº­t xe', message: 'ThÃ´ng tin xe Ä‘Ã£ Ä‘Æ°á»£c lÆ°u.' });
        }
      } else {
        if (!files.length) {
          pushToast({ tone: 'warning', title: 'Thiáº¿u áº£nh', message: 'Vui lÃ²ng thÃªm Ã­t nháº¥t má»™t áº£nh xe.' });
          setSubmitting(false);
          return;
        }

        const formData = new FormData();
        Object.entries(normalizePayload()).forEach(([key, value]) => formData.append(key, value));
        files.forEach((file) => formData.append('images', file));

        await vehicleApi.create(formData);
        pushToast({ tone: 'success', title: 'ÄÄƒng xe thÃ nh cÃ´ng', message: 'Xe Ä‘Ã£ Ä‘Æ°á»£c Ä‘Äƒng thÃ nh cÃ´ng.' });
      }

      navigate('/owner/vehicles');
    } catch (error) {
      pushToast({ tone: 'error', title: 'LÆ°u tháº¥t báº¡i', message: error?.response?.data?.error || 'KhÃ´ng thá»ƒ lÆ°u thÃ´ng tin xe.' });
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
        title={editing ? 'Chá»‰nh sá»­a xe' : 'ÄÄƒng xe má»›i'}
        subtitle="Thiáº¿t láº­p Ä‘áº§y Ä‘á»§ thÃ´ng tin hiá»ƒn thá»‹ Ä‘á»ƒ tÄƒng tá»‰ lá»‡ Ä‘áº·t xe vÃ  tá»‘i Æ°u tráº£i nghiá»‡m ngÆ°á»i thuÃª."
      />

      <form onSubmit={handleSubmit} className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm text-slate-300">Loáº¡i xe
            <select value={form.vehicle_type} onChange={(event) => setField('vehicle_type', event.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-white outline-none">
              {VEHICLE_TYPE_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </label>

          <label className="text-sm text-slate-300">HÃ£ng xe
            <input required value={form.brand} onChange={(event) => setField('brand', event.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-white outline-none" />
          </label>

          <label className="text-sm text-slate-300">Máº«u xe
            <input required value={form.model} onChange={(event) => setField('model', event.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-white outline-none" />
          </label>

          <label className="text-sm text-slate-300">NÄƒm sáº£n xuáº¥t
            <input required type="number" value={form.year} onChange={(event) => setField('year', event.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-white outline-none" />
          </label>

          <label className="text-sm text-slate-300">Biá»ƒn sá»‘
            <input required value={form.license_plate} onChange={(event) => setField('license_plate', event.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-white outline-none" />
          </label>

          <label className="text-sm text-slate-300">NhiÃªn liá»‡u
            <select value={form.fuel_type} onChange={(event) => setField('fuel_type', event.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-white outline-none">
              {FUEL_TYPE_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </label>

          <label className="text-sm text-slate-300">Há»™p sá»‘
            <select value={form.transmission} onChange={(event) => setField('transmission', event.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-white outline-none">
              {TRANSMISSION_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </label>

          <label className="text-sm text-slate-300">Sá»‘ gháº¿
            <input required type="number" min="1" value={form.seats} onChange={(event) => setField('seats', event.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-white outline-none" />
          </label>

          <label className="text-sm text-slate-300">GiÃ¡ thuÃª má»—i ngÃ y
            <input required type="number" min="0" value={form.daily_rate} onChange={(event) => setField('daily_rate', event.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-white outline-none" />
          </label>

          <label className="text-sm text-slate-300">Tiá»n cá»c
            <input required type="number" min="0" value={form.deposit_amount} onChange={(event) => setField('deposit_amount', event.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-white outline-none" />
          </label>

          <label className="text-sm text-slate-300">ThÃ nh phá»‘
            <select value={form.city} onChange={(event) => handleCityChange(event.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-white outline-none">
              {CITY_OPTIONS.filter((item) => item.value).map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </label>

          <label className="text-sm text-slate-300">Quáº­n/Huyá»‡n
            <select value={form.district} onChange={(event) => setField('district', event.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-white outline-none">
              {districtOptions.map((item) => (
                <option key={item.value || 'all'} value={item.value}>{item.label}</option>
              ))}
            </select>
          </label>

          <label className="text-sm text-slate-300">Äá»‹a Ä‘iá»ƒm nháº­n xe
            <input value={form.pickup_location} onChange={(event) => setField('pickup_location', event.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-white outline-none" placeholder="VÃ­ dá»¥: SÃ¢n bay TÃ¢n SÆ¡n Nháº¥t" />
          </label>

          <label className="text-sm text-slate-300">Äá»‹a Ä‘iá»ƒm tráº£ xe
            <input value={form.return_location} onChange={(event) => setField('return_location', event.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-white outline-none" placeholder="VÃ­ dá»¥: Quáº­n 1, TP.HCM" />
          </label>

          <label className="text-sm text-slate-300">Khu vá»±c hoáº¡t Ä‘á»™ng
            <select value={form.allowed_region} onChange={(event) => setField('allowed_region', event.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-white outline-none">
              {REGION_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </label>

          <label className="text-sm text-slate-300">Sáºµn sÃ ng tá»« ngÃ y
            <input type="date" value={form.available_from} onChange={(event) => setField('available_from', event.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-white outline-none" />
          </label>

          <label className="text-sm text-slate-300">Sáºµn sÃ ng Ä‘áº¿n ngÃ y
            <input type="date" value={form.available_to} onChange={(event) => setField('available_to', event.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-white outline-none" />
          </label>

          <label className="md:col-span-2 text-sm text-slate-300">MÃ´ táº£
            <textarea rows={4} value={form.description} onChange={(event) => setField('description', event.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-white outline-none" />
          </label>

          <label className="md:col-span-2 text-sm text-slate-300">Táº£i áº£nh xe
            <input type="file" accept="image/*" multiple onChange={(event) => setFiles(Array.from(event.target.files || []))} className="mt-1 block w-full text-sm text-slate-200" />
          </label>

          <div className="md:col-span-2 grid grid-cols-3 gap-2">
            {existingImages.slice(0, 3).map((image, idx) => (
              <img key={`existing-${idx}`} src={resolveImage(image, idx)} alt="áº¢nh xe hiá»‡n táº¡i" className="h-24 w-full rounded-lg object-cover" />
            ))}
            {previews.slice(0, 6).map((image, idx) => (
              <img key={`preview-${idx}`} src={image} alt="Xem trÆ°á»›c áº£nh xe" className="h-24 w-full rounded-lg object-cover" />
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button type="button" onClick={() => navigate('/owner/vehicles')} className="rounded-xl border border-white/15 px-4 py-2 text-sm text-slate-200 hover:bg-white/10">
            Há»§y
          </button>
          <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:bg-slate-600">
            <Save className="h-4 w-4" /> {submitting ? 'Äang lÆ°u...' : 'LÆ°u xe'}
          </button>
        </div>
      </form>
    </div>
  );
}
