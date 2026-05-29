import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { ownerApplicationApi } from '../../api';
import OwnerOnboardingStepper from '../../components/common/OwnerOnboardingStepper';
import SectionHeader from '../../components/common/SectionHeader';
import StatusBadge from '../../components/common/StatusBadge';
import PremiumButton from '../../components/common/PremiumButton';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const steps = [
  { key: 'intro', label: 'Gi?i thi?u l?i ích' },
  { key: 'identity', label: 'Xác minh danh tính' },
  { key: 'payout', label: 'Thông tin nh?n ti?n' },
  { key: 'terms', label: 'Ði?u kho?n' },
  { key: 'submit', label: 'G?i h? so' }
];

const initialForm = {
  legal_name: '',
  phone: '',
  address: '',
  id_number: '',
  id_front: null,
  id_back: null,
  driving_license: null,
  bank_name: '',
  bank_account_number: '',
  bank_account_holder: '',
  accepted_terms: false
};

export default function BecomeOwnerPage() {
  const navigate = useNavigate();
  const { ownerStatus, updateUser } = useAuth();
  const { pushToast } = useToast();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const canNext = useMemo(() => {
    if (step === 2) {
      return form.legal_name && form.phone && form.address && form.id_number;
    }
    if (step === 3) {
      return form.bank_name && form.bank_account_number && form.bank_account_holder;
    }
    if (step === 4) {
      return form.accepted_terms;
    }
    return true;
  }, [step, form]);

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const submit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        id_front_name: form.id_front?.name || '',
        id_back_name: form.id_back?.name || '',
        driving_license_name: form.driving_license?.name || ''
      };
      await ownerApplicationApi.submitOwnerApplication(payload);
      updateUser({ owner_status: 'PENDING' });
      pushToast({ tone: 'success', title: 'Ðã g?i h? so', message: 'H? so ch? xe dã du?c g?i và dang ch? duy?t.' });
      setStep(5);
    } catch (error) {
      pushToast({ tone: 'error', title: 'G?i h? so th?t b?i', message: error?.message || 'Không th? g?i h? so lúc này.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (ownerStatus === 'APPROVED') {
    return (
      <div className="space-y-4 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-6">
        <h2 className="text-2xl font-bold text-white">B?n dã là ch? xe</h2>
        <p className="text-sm text-emerald-100">H? so ch? xe dã du?c duy?t. B?n có th? truy c?p C?ng ch? xe d? dang phuong ti?n.</p>
        <PremiumButton onClick={() => navigate('/owner/dashboard')}>M? C?ng ch? xe</PremiumButton>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader title="Ðang ký tr? thành ch? xe" subtitle="Hoàn t?t onboarding d? m? quy?n dang xe và qu?n lý doanh thu trên n?n t?ng." />
      <OwnerOnboardingStepper steps={steps} currentStep={step} />

      {ownerStatus === 'PENDING' ? (
        <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-100">
          <p className="font-semibold">H? so c?a b?n dang ch? duy?t</p>
          <p className="mt-1">B?n chua th? dang xe cho d?n khi tr?ng thái chuy?n sang APPROVED.</p>
          <div className="mt-3"><StatusBadge status="OWNER_PENDING" /></div>
        </div>
      ) : null}

      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
        {step === 1 ? (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">L?i ích khi tr? thành ch? xe</h3>
            <ul className="space-y-2 text-sm text-slate-200">
              <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" /> Tang thu nh?p t? xe nhàn r?i.</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" /> Qu?n lý yêu c?u thuê, h?p d?ng, thanh toán trong m?t workspace.</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" /> Theo dõi xe và x? lý tranh ch?p có s? h? tr? t? admin.</li>
            </ul>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm text-slate-300 md:col-span-2">H? tên pháp lý
              <input value={form.legal_name} onChange={(e) => setField('legal_name', e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-white outline-none" />
            </label>
            <label className="text-sm text-slate-300">S? di?n tho?i
              <input value={form.phone} onChange={(e) => setField('phone', e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-white outline-none" />
            </label>
            <label className="text-sm text-slate-300">S? CCCD/Passport
              <input value={form.id_number} onChange={(e) => setField('id_number', e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-white outline-none" />
            </label>
            <label className="text-sm text-slate-300 md:col-span-2">Ð?a ch?
              <input value={form.address} onChange={(e) => setField('address', e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-white outline-none" />
            </label>
            <label className="text-sm text-slate-300">?nh CCCD m?t tru?c
              <input type="file" accept="image/*" onChange={(e) => setField('id_front', e.target.files?.[0] || null)} className="mt-1 block w-full text-xs text-slate-200" />
            </label>
            <label className="text-sm text-slate-300">?nh CCCD m?t sau
              <input type="file" accept="image/*" onChange={(e) => setField('id_back', e.target.files?.[0] || null)} className="mt-1 block w-full text-xs text-slate-200" />
            </label>
            <label className="text-sm text-slate-300 md:col-span-2">Gi?y phép lái xe (n?u có)
              <input type="file" accept="image/*" onChange={(e) => setField('driving_license', e.target.files?.[0] || null)} className="mt-1 block w-full text-xs text-slate-200" />
            </label>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm text-slate-300 md:col-span-2">Tên ngân hàng
              <input value={form.bank_name} onChange={(e) => setField('bank_name', e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-white outline-none" />
            </label>
            <label className="text-sm text-slate-300">S? tài kho?n
              <input value={form.bank_account_number} onChange={(e) => setField('bank_account_number', e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-white outline-none" />
            </label>
            <label className="text-sm text-slate-300">Ch? tài kho?n
              <input value={form.bank_account_holder} onChange={(e) => setField('bank_account_holder', e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-white outline-none" />
            </label>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="space-y-3 text-sm text-slate-200">
            <p className="flex items-start gap-2"><AlertCircle className="mt-0.5 h-4 w-4 text-amber-300" /> B?n c?n d?ng ý di?u kho?n cho thuê, chính sách b?i thu?ng và phí n?n t?ng 4%.</p>
            <label className="flex items-start gap-2">
              <input type="checkbox" checked={form.accepted_terms} onChange={(e) => setField('accepted_terms', e.target.checked)} className="mt-1" />
              <span>Tôi d?ng ý v?i di?u kho?n cho thuê, chính sách b?i thu?ng và chính sách phí n?n t?ng 4%.</span>
            </label>
          </div>
        ) : null}

        {step === 5 ? (
          <div className="space-y-2 rounded-xl border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-100">
            <p className="font-semibold">H? so dã g?i thành công</p>
            <p>Tr?ng thái hi?n t?i: <StatusBadge status="OWNER_PENDING" className="ml-1" /></p>
            <p>B?n có th? theo dõi ti?n trình t?i trang tr?ng thái h? so ch? xe.</p>
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap justify-between gap-2">
          <PremiumButton variant="secondary" onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step <= 1 || submitting || step === 5}>Quay l?i</PremiumButton>

          {step < 4 ? (
            <PremiumButton onClick={() => setStep((s) => Math.min(4, s + 1))} disabled={!canNext || submitting}>Ti?p t?c</PremiumButton>
          ) : null}

          {step === 4 ? (
            <PremiumButton onClick={submit} disabled={!canNext || submitting}>{submitting ? 'Ðang g?i...' : 'G?i h? so'}</PremiumButton>
          ) : null}

          {step === 5 ? (
            <PremiumButton onClick={() => navigate('/app/owner-application-status')}>Xem tr?ng thái h? so</PremiumButton>
          ) : null}
        </div>
      </div>
    </div>
  );
}