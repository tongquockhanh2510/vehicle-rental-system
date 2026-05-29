import React, { useEffect, useMemo, useState } from 'react';
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
  { key: 'intro', label: '\u0047i\u1edbi thi\u1ec7u' },
  { key: 'identity', label: 'X\u00e1c minh danh t\u00ednh' },
  { key: 'payout', label: 'Th\u00f4ng tin nh\u1eadn ti\u1ec1n' },
  { key: 'terms', label: '\u0110i\u1ec1u kho\u1ea3n' },
  { key: 'submit', label: 'G\u1eedi h\u1ed3 s\u01a1' }
];

const initialForm = {
  legal_name: '',
  phone: '',
  email: '',
  address: '',
  id_number: '',
  id_front: null,
  id_back: null,
  driving_license: null,
  bank_name: '',
  bank_account_number: '',
  bank_account_holder: '',
  bank_branch: '',
  accepted_accuracy: false,
  accepted_platform_fee: false,
  accepted_dispute_policy: false
};

export default function BecomeOwnerPage() {
  const navigate = useNavigate();
  const { user, ownerStatus, updateUser } = useAuth();
  const { pushToast } = useToast();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(() => ({ ...initialForm, email: user?.email || '' }));
  const [submitting, setSubmitting] = useState(false);
  const [application, setApplication] = useState(null);

  useEffect(() => {
    const loadApplication = async () => {
      try {
        const response = await ownerApplicationApi.getMyOwnerApplication();
        const app = response.data || null;
        setApplication(app);
        if (app?.owner_profile && ownerStatus === 'REJECTED') {
          setForm((prev) => ({ ...prev, ...app.owner_profile, email: app.owner_profile.email || user?.email || prev.email }));
        }
      } catch {
        setApplication(null);
      }
    };

    loadApplication();
  }, [ownerStatus, user?.email]);

  const canNext = useMemo(() => {
    if (step === 2) {
      return Boolean(form.legal_name && form.phone && form.email && form.address && form.id_number);
    }
    if (step === 3) {
      return Boolean(form.bank_name && form.bank_account_number && form.bank_account_holder);
    }
    if (step === 4) {
      return Boolean(form.accepted_accuracy && form.accepted_platform_fee && form.accepted_dispute_policy);
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
        driving_license_name: form.driving_license?.name || '',
        accepted_terms: form.accepted_accuracy && form.accepted_platform_fee && form.accepted_dispute_policy
      };
      await ownerApplicationApi.submitOwnerApplication(payload);
      updateUser({ owner_status: 'PENDING' });
      pushToast({
        tone: 'success',
        title: '\u0110\u00e3 g\u1eedi h\u1ed3 s\u01a1',
        message: 'H\u1ed3 s\u01a1 ch\u1ee7 xe \u0111\u00e3 \u0111\u01b0\u1ee3c g\u1eedi. Vui l\u00f2ng ch\u1edd admin ph\u00ea duy\u1ec7t.'
      });
      navigate('/app/owner-application-status');
    } catch (error) {
      pushToast({
        tone: 'error',
        title: 'G\u1eedi h\u1ed3 s\u01a1 th\u1ea5t b\u1ea1i',
        message: error?.message || 'Kh\u00f4ng th\u1ec3 g\u1eedi h\u1ed3 s\u01a1 l\u00fac n\u00e0y.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (ownerStatus === 'APPROVED') {
    return (
      <div className="space-y-4 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-6">
        <h2 className="text-2xl font-bold text-white">H\u1ed3 s\u01a1 \u0111\u00e3 \u0111\u01b0\u1ee3c duy\u1ec7t</h2>
        <p className="text-sm text-emerald-100">B\u1ea1n \u0111\u00e3 c\u00f3 quy\u1ec1n truy c\u1eadp C\u1ed5ng ch\u1ee7 xe \u0111\u1ec3 \u0111\u0103ng ph\u01b0\u01a1ng ti\u1ec7n.</p>
        <PremiumButton onClick={() => navigate('/owner/dashboard')}>\u0110i t\u1edbi C\u1ed5ng ch\u1ee7 xe</PremiumButton>
      </div>
    );
  }

  if (ownerStatus === 'PENDING') {
    return (
      <div className="space-y-6">
        <SectionHeader
          title="H\u1ed3 s\u01a1 ch\u1ee7 xe \u0111ang ch\u1edd duy\u1ec7t"
          subtitle="B\u1ea1n \u0111\u00e3 g\u1eedi h\u1ed3 s\u01a1 onboarding. Khi ch\u01b0a \u0111\u01b0\u1ee3c ph\u00ea duy\u1ec7t, b\u1ea1n ch\u01b0a th\u1ec3 \u0111\u0103ng xe cho thu\u00ea."
        />
        <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-5 text-sm text-amber-100">
          <p className="font-semibold">Tr\u1ea1ng th\u00e1i hi\u1ec7n t\u1ea1i</p>
          <div className="mt-2"><StatusBadge status="OWNER_PENDING" /></div>
          <p className="mt-3">Vui l\u00f2ng theo d\u00f5i ti\u1ebfn tr\u00ecnh ph\u00ea duy\u1ec7t t\u1ea1i trang tr\u1ea1ng th\u00e1i h\u1ed3 s\u01a1 ch\u1ee7 xe.</p>
          <div className="mt-4">
            <PremiumButton onClick={() => navigate('/app/owner-application-status')}>Xem tr\u1ea1ng th\u00e1i h\u1ed3 s\u01a1</PremiumButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="\u0110\u0103ng k\u00fd tr\u1edf th\u00e0nh ch\u1ee7 xe"
        subtitle="Ho\u00e0n t\u1ea5t h\u1ed3 s\u01a1 \u0111\u1ec3 b\u1eaft \u0111\u1ea7u \u0111\u0103ng ph\u01b0\u01a1ng ti\u1ec7n v\u00e0 t\u1ea1o doanh thu t\u1eeb t\u00e0i s\u1ea3n nh\u00e0n r\u1ed7i."
      />
      <OwnerOnboardingStepper steps={steps} currentStep={step} />

      {ownerStatus === 'REJECTED' ? (
        <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-100">
          <p className="font-semibold">H\u1ed3 s\u01a1 tr\u01b0\u1edbc \u0111\u00e2y b\u1ecb t\u1eeb ch\u1ed1i</p>
          <p className="mt-1">{application?.review_note || 'Vui l\u00f2ng c\u1eadp nh\u1eadt th\u00f4ng tin v\u00e0 g\u1eedi l\u1ea1i h\u1ed3 s\u01a1.'}</p>
          <div className="mt-3"><StatusBadge status="OWNER_REJECTED" /></div>
        </div>
      ) : null}

      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
        {step === 1 ? (
          <div className="space-y-3 text-sm text-slate-200">
            <h3 className="text-lg font-semibold text-white">L\u1ee3i \u00edch khi tr\u1edf th\u00e0nh ch\u1ee7 xe</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" /> T\u0103ng thu nh\u1eadp t\u1eeb ph\u01b0\u01a1ng ti\u1ec7n nh\u00e0n r\u1ed7i.</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" /> Qu\u1ea3n l\u00fd y\u00eau c\u1ea7u thu\u00ea minh b\u1ea1ch.</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" /> H\u1ee3p \u0111\u1ed3ng, thanh to\u00e1n v\u00e0 b\u1ed3i th\u01b0\u1eddng r\u00f5 r\u00e0ng.</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" /> Theo d\u00f5i ph\u01b0\u01a1ng ti\u1ec7n v\u00e0 x\u1eed l\u00fd tranh ch\u1ea5p qua h\u1ec7 th\u1ed1ng.</li>
            </ul>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm text-slate-300 md:col-span-2">H\u1ecd v\u00e0 t\u00ean ph\u00e1p l\u00fd
              <input value={form.legal_name} onChange={(e) => setField('legal_name', e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-white outline-none" />
            </label>
            <label className="text-sm text-slate-300">S\u1ed1 \u0111i\u1ec7n tho\u1ea1i
              <input value={form.phone} onChange={(e) => setField('phone', e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-white outline-none" />
            </label>
            <label className="text-sm text-slate-300">Email
              <input type="email" value={form.email} onChange={(e) => setField('email', e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-white outline-none" />
            </label>
            <label className="text-sm text-slate-300 md:col-span-2">\u0110\u1ecba ch\u1ec9
              <input value={form.address} onChange={(e) => setField('address', e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-white outline-none" />
            </label>
            <label className="text-sm text-slate-300 md:col-span-2">S\u1ed1 CCCD/Passport
              <input value={form.id_number} onChange={(e) => setField('id_number', e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-white outline-none" />
            </label>
            <label className="text-sm text-slate-300">\u1ea2nh CCCD m\u1eb7t tr\u01b0\u1edbc
              <input type="file" accept="image/*" onChange={(e) => setField('id_front', e.target.files?.[0] || null)} className="mt-1 block w-full text-xs text-slate-200" />
            </label>
            <label className="text-sm text-slate-300">\u1ea2nh CCCD m\u1eb7t sau
              <input type="file" accept="image/*" onChange={(e) => setField('id_back', e.target.files?.[0] || null)} className="mt-1 block w-full text-xs text-slate-200" />
            </label>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm text-slate-300 md:col-span-2">T\u00ean ng\u00e2n h\u00e0ng
              <input value={form.bank_name} onChange={(e) => setField('bank_name', e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-white outline-none" />
            </label>
            <label className="text-sm text-slate-300">S\u1ed1 t\u00e0i kho\u1ea3n
              <input value={form.bank_account_number} onChange={(e) => setField('bank_account_number', e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-white outline-none" />
            </label>
            <label className="text-sm text-slate-300">Ch\u1ee7 t\u00e0i kho\u1ea3n
              <input value={form.bank_account_holder} onChange={(e) => setField('bank_account_holder', e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-white outline-none" />
            </label>
            <label className="text-sm text-slate-300 md:col-span-2">Chi nh\u00e1nh (n\u1ebfu c\u1ea7n)
              <input value={form.bank_branch} onChange={(e) => setField('bank_branch', e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-white outline-none" />
            </label>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="space-y-3 text-sm text-slate-200">
            <p className="flex items-start gap-2"><AlertCircle className="mt-0.5 h-4 w-4 text-amber-300" /> Vui l\u00f2ng x\u00e1c nh\u1eadn \u0111\u1ea7y \u0111\u1ee7 \u0111i\u1ec1u kho\u1ea3n tr\u01b0\u1edbc khi g\u1eedi h\u1ed3 s\u01a1.</p>
            <label className="flex items-start gap-2">
              <input type="checkbox" checked={form.accepted_accuracy} onChange={(e) => setField('accepted_accuracy', e.target.checked)} className="mt-1" />
              <span>T\u00f4i cam k\u1ebft th\u00f4ng tin l\u00e0 ch\u00ednh x\u00e1c.</span>
            </label>
            <label className="flex items-start gap-2">
              <input type="checkbox" checked={form.accepted_platform_fee} onChange={(e) => setField('accepted_platform_fee', e.target.checked)} className="mt-1" />
              <span>T\u00f4i \u0111\u1ed3ng \u00fd ch\u00ednh s\u00e1ch ph\u00ed n\u1ec1n t\u1ea3ng 4%.</span>
            </label>
            <label className="flex items-start gap-2">
              <input type="checkbox" checked={form.accepted_dispute_policy} onChange={(e) => setField('accepted_dispute_policy', e.target.checked)} className="mt-1" />
              <span>T\u00f4i \u0111\u1ed3ng \u00fd ch\u00ednh s\u00e1ch b\u1ed3i th\u01b0\u1eddng v\u00e0 x\u1eed l\u00fd tranh ch\u1ea5p.</span>
            </label>
          </div>
        ) : null}

        {step === 5 ? (
          <div className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 p-4 text-sm text-cyan-100">
            <p className="font-semibold">S\u1eb5n s\u00e0ng g\u1eedi h\u1ed3 s\u01a1</p>
            <p className="mt-1">Sau khi g\u1eedi, h\u1ec7 th\u1ed1ng s\u1ebd chuy\u1ec3n tr\u1ea1ng th\u00e1i OWNER_PENDING v\u00e0 \u0111\u01b0a b\u1ea1n \u0111\u1ebfn trang theo d\u00f5i h\u1ed3 s\u01a1.</p>
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap justify-between gap-2">
          <PremiumButton variant="secondary" onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step <= 1 || submitting}>Quay l\u1ea1i</PremiumButton>

          {step < 5 ? (
            <PremiumButton onClick={() => setStep((s) => Math.min(5, s + 1))} disabled={!canNext || submitting}>Ti\u1ebfp t\u1ee5c</PremiumButton>
          ) : null}

          {step === 5 ? (
            <PremiumButton onClick={submit} disabled={submitting}>{submitting ? '\u0110ang g\u1eedi...' : 'G\u1eedi h\u1ed3 s\u01a1'}</PremiumButton>
          ) : null}
        </div>
      </div>
    </div>
  );
}