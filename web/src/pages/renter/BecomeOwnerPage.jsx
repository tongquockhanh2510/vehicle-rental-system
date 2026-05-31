import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { ownerApplicationApi } from '../../api';
import OwnerOnboardingStepper from '../../components/common/OwnerOnboardingStepper';
import PremiumButton from '../../components/common/PremiumButton';
import SectionHeader from '../../components/common/SectionHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { OWNER_STATUSES, normalizeOwnerStatus } from '../../constants/roles';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const steps = [
  { key: 'intro', label: 'Bước 1: Giới thiệu' },
  { key: 'identity', label: 'Bước 2: Xác minh danh tính' },
  { key: 'payout', label: 'Bước 3: Thông tin nhận tiền' },
  { key: 'terms', label: 'Bước 4: Điều khoản' },
  { key: 'submit', label: 'Bước 5: Gửi hồ sơ' }
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
  card_brand: '',
  card_last4: '',
  accepted_accuracy: false,
  accepted_platform_fee: false,
  accepted_dispute_policy: false
};

export default function BecomeOwnerPage() {
  const navigate = useNavigate();
  const { user, ownerStatus, updateUser, refreshProfile } = useAuth();
  const { pushToast } = useToast();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState(() => ({
    ...initialForm,
    email: user?.email || '',
    phone: user?.phone || ''
  }));
  const [submitting, setSubmitting] = useState(false);
  const [application, setApplication] = useState(null);

  useEffect(() => {
    const loadApplication = async () => {
      try {
        const response = await ownerApplicationApi.getMyOwnerApplication();
        const app = response.data || null;
        setApplication(app);

        const appStatus = normalizeOwnerStatus(app?.status);
        if (
          appStatus !== OWNER_STATUSES.NONE &&
          appStatus !== normalizeOwnerStatus(ownerStatus)
        ) {
          updateUser({
            owner_status: appStatus,
            owner_application_id: app?._id || user?.owner_application_id || ''
          });
        }

        if (app?.owner_profile && normalizeOwnerStatus(ownerStatus) === OWNER_STATUSES.REJECTED) {
          setForm((prev) => ({
            ...prev,
            ...app.owner_profile,
            email: app.owner_profile.email || user?.email || prev.email,
            phone: app.owner_profile.phone || user?.phone || prev.phone
          }));
        }
      } catch {
        setApplication(null);
      }
    };

    loadApplication();
  }, [ownerStatus, updateUser, user?.email, user?.owner_application_id, user?.phone]);

  const canNext = useMemo(() => {
    if (step === 2) {
      return Boolean(
        form.legal_name &&
          form.phone &&
          form.email &&
          form.address &&
          form.id_number
      );
    }
    if (step === 3) {
      return Boolean(
        form.bank_name && form.bank_account_number && form.bank_account_holder
      );
    }
    if (step === 4) {
      return Boolean(
        form.accepted_accuracy &&
          form.accepted_platform_fee &&
          form.accepted_dispute_policy
      );
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
        accepted_terms:
          form.accepted_accuracy &&
          form.accepted_platform_fee &&
          form.accepted_dispute_policy
      };

      const result = await ownerApplicationApi.submitOwnerApplication(payload);
      const appId = result?.data?._id || result?.data?.id || '';

      updateUser({
        owner_status: OWNER_STATUSES.PENDING,
        owner_application_id: appId || user?.owner_application_id || ''
      });

      await refreshProfile();

      pushToast({
        tone: 'success',
        title: 'Đã gửi hồ sơ',
        message: 'Hồ sơ chủ xe đã được gửi. Vui lòng chờ admin phê duyệt.'
      });

      navigate('/app/owner-application-status', { replace: true });
    } catch (error) {
      pushToast({
        tone: 'error',
        title: 'Gửi hồ sơ thất bại',
        message: error?.message || 'Không thể gửi hồ sơ lúc này.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const normalizedOwnerStatus = normalizeOwnerStatus(ownerStatus);

  if (normalizedOwnerStatus === OWNER_STATUSES.APPROVED) {
    return (
      <div className="space-y-4 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-6">
        <h2 className="text-2xl font-bold text-white">Hồ sơ chủ xe đã được duyệt</h2>
        <p className="text-sm text-emerald-100">
          Bạn đã có thể sử dụng Cổng chủ xe để đăng và quản lý phương tiện.
        </p>
        <PremiumButton onClick={() => navigate('/owner/dashboard')}>
          Đi tới Cổng chủ xe
        </PremiumButton>
      </div>
    );
  }

  if (normalizedOwnerStatus === OWNER_STATUSES.PENDING) {
    return (
      <div className="space-y-6">
        <SectionHeader
          title="Hồ sơ chủ xe đang chờ duyệt"
          subtitle="Bạn đã gửi hồ sơ onboarding. Khi chưa được phê duyệt, bạn chưa thể đăng xe cho thuê."
        />
        <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-5 text-sm text-amber-100">
          <p className="font-semibold">Trạng thái hiện tại</p>
          <div className="mt-2">
            <StatusBadge status="OWNER_PENDING" />
          </div>
          <p className="mt-3">
            Vui lòng theo dõi tiến trình phê duyệt tại trang trạng thái hồ sơ chủ xe.
          </p>
          <div className="mt-4">
            <PremiumButton onClick={() => navigate('/app/owner-application-status')}>
              Xem trạng thái hồ sơ
            </PremiumButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Đăng ký trở thành chủ xe"
        subtitle="Hoàn tất hồ sơ xác minh để bắt đầu đăng phương tiện và quản lý doanh thu trên nền tảng."
      />
      <OwnerOnboardingStepper steps={steps} currentStep={step} />

      {normalizedOwnerStatus === OWNER_STATUSES.REJECTED ? (
        <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-100">
          <p className="font-semibold">Hồ sơ trước đây bị từ chối</p>
          <p className="mt-1">
            {application?.rejection_reason ||
              application?.review_note ||
              'Vui lòng cập nhật thông tin và gửi lại hồ sơ.'}
          </p>
          <div className="mt-3">
            <StatusBadge status="OWNER_REJECTED" />
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
        {step === 1 ? (
          <div className="space-y-3 text-sm text-slate-200">
            <h3 className="text-lg font-semibold text-white">Lợi ích khi trở thành chủ xe</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" />
                Tăng thu nhập từ phương tiện nhàn rỗi.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" />
                Quản lý yêu cầu thuê, hợp đồng và thanh toán trong một workspace.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" />
                Theo dõi phương tiện và xử lý tranh chấp qua hệ thống.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" />
                Chỉ được đăng xe sau khi admin phê duyệt hồ sơ.
              </li>
            </ul>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm text-slate-300 md:col-span-2">
              Họ và tên pháp lý
              <input
                value={form.legal_name}
                onChange={(e) => setField('legal_name', e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-white outline-none"
              />
            </label>
            <label className="text-sm text-slate-300">
              Số điện thoại
              <input
                value={form.phone}
                onChange={(e) => setField('phone', e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-white outline-none"
              />
            </label>
            <label className="text-sm text-slate-300">
              Email
              <input
                type="email"
                value={form.email}
                onChange={(e) => setField('email', e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-white outline-none"
              />
            </label>
            <label className="text-sm text-slate-300 md:col-span-2">
              Địa chỉ
              <input
                value={form.address}
                onChange={(e) => setField('address', e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-white outline-none"
              />
            </label>
            <label className="text-sm text-slate-300 md:col-span-2">
              Số CCCD/Passport
              <input
                value={form.id_number}
                onChange={(e) => setField('id_number', e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-white outline-none"
              />
            </label>
            <label className="text-sm text-slate-300">
              Ảnh CCCD mặt trước
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setField('id_front', e.target.files?.[0] || null)}
                className="mt-1 block w-full text-xs text-slate-200"
              />
            </label>
            <label className="text-sm text-slate-300">
              Ảnh CCCD mặt sau
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setField('id_back', e.target.files?.[0] || null)}
                className="mt-1 block w-full text-xs text-slate-200"
              />
            </label>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm text-slate-300 md:col-span-2">
              Tên ngân hàng
              <input
                value={form.bank_name}
                onChange={(e) => setField('bank_name', e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-white outline-none"
              />
            </label>
            <label className="text-sm text-slate-300">
              Số tài khoản
              <input
                value={form.bank_account_number}
                onChange={(e) => setField('bank_account_number', e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-white outline-none"
              />
            </label>
            <label className="text-sm text-slate-300">
              Chủ tài khoản
              <input
                value={form.bank_account_holder}
                onChange={(e) => setField('bank_account_holder', e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-white outline-none"
              />
            </label>
            <label className="text-sm text-slate-300 md:col-span-2">
              Chi nhánh (nếu cần)
              <input
                value={form.bank_branch}
                onChange={(e) => setField('bank_branch', e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-white outline-none"
              />
            </label>
            <label className="text-sm text-slate-300">
              Thương hiệu thẻ (tuỳ chọn)
              <input
                value={form.card_brand}
                onChange={(e) => setField('card_brand', e.target.value)}
                placeholder="Visa / MasterCard"
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-white outline-none"
              />
            </label>
            <label className="text-sm text-slate-300">
              4 số cuối thẻ (tuỳ chọn)
              <input
                value={form.card_last4}
                onChange={(e) => setField('card_last4', e.target.value)}
                maxLength={4}
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-white outline-none"
              />
            </label>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="space-y-3 text-sm text-slate-200">
            <p className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 text-amber-300" />
              Vui lòng xác nhận đầy đủ điều khoản trước khi gửi hồ sơ.
            </p>
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={form.accepted_accuracy}
                onChange={(e) => setField('accepted_accuracy', e.target.checked)}
                className="mt-1"
              />
              <span>Tôi cam kết thông tin là chính xác.</span>
            </label>
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={form.accepted_platform_fee}
                onChange={(e) => setField('accepted_platform_fee', e.target.checked)}
                className="mt-1"
              />
              <span>Tôi đồng ý chính sách phí nền tảng 4%.</span>
            </label>
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={form.accepted_dispute_policy}
                onChange={(e) => setField('accepted_dispute_policy', e.target.checked)}
                className="mt-1"
              />
              <span>Tôi đồng ý chính sách bồi thường và xử lý tranh chấp.</span>
            </label>
          </div>
        ) : null}

        {step === 5 ? (
          <div className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 p-4 text-sm text-cyan-100">
            <p className="font-semibold">Sẵn sàng gửi hồ sơ</p>
            <p className="mt-1">
              Sau khi gửi, hệ thống sẽ chuyển trạng thái thành PENDING và đưa bạn đến trang theo dõi hồ sơ.
            </p>
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap justify-between gap-2">
          <PremiumButton
            variant="secondary"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step <= 1 || submitting}
          >
            Quay lại
          </PremiumButton>

          {step < 5 ? (
            <PremiumButton
              onClick={() => setStep((s) => Math.min(5, s + 1))}
              disabled={!canNext || submitting}
            >
              Tiếp tục
            </PremiumButton>
          ) : null}

          {step === 5 ? (
            <PremiumButton onClick={submit} disabled={submitting}>
              {submitting
                ? 'Đang gửi...'
                : normalizedOwnerStatus === OWNER_STATUSES.REJECTED
                  ? 'Cập nhật hồ sơ'
                  : 'Gửi hồ sơ'}
            </PremiumButton>
          ) : null}
        </div>
      </div>
    </div>
  );
}

