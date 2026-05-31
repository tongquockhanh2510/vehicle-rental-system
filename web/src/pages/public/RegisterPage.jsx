import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CarFront, CheckCircle2, ChevronLeft, Store } from 'lucide-react';
import { authApi, ownerApplicationApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const MODES = {
  RENTER: 'RENTER',
  OWNER: 'OWNER'
};

const initialAccount = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  password: '',
  confirm_password: ''
};

const initialOwnerProfile = {
  legal_name: '',
  id_number: '',
  address: '',
  id_front: null,
  id_back: null,
  bank_name: '',
  bank_account_number: '',
  bank_account_holder: '',
  card_brand: '',
  card_last4: '',
  accepted_accuracy: false,
  accepted_platform_fee: false,
  accepted_dispute_policy: false
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login, updateUser } = useAuth();
  const { pushToast } = useToast();

  const [mode, setMode] = useState('');
  const [account, setAccount] = useState(initialAccount);
  const [ownerProfile, setOwnerProfile] = useState(initialOwnerProfile);
  const [loading, setLoading] = useState(false);

  const setAccountField = (field, value) => setAccount((prev) => ({ ...prev, [field]: value }));
  const setOwnerField = (field, value) => setOwnerProfile((prev) => ({ ...prev, [field]: value }));

  const accountError = useMemo(() => {
    if (!account.first_name.trim() || !account.last_name.trim() || !account.email.trim() || !account.phone.trim()) {
      return 'Vui lòng nhập đầy đủ thông tin tài khoản.';
    }
    if (account.password.length < 8) {
      return 'Mật khẩu cần tối thiểu 8 ký tự.';
    }
    if (account.password !== account.confirm_password) {
      return 'Mật khẩu xác nhận không khớp.';
    }
    return '';
  }, [account]);

  const ownerProfileError = useMemo(() => {
    if (mode !== MODES.OWNER) return '';

    if (!ownerProfile.legal_name.trim() || !ownerProfile.id_number.trim() || !ownerProfile.address.trim()) {
      return 'Vui lòng điền đầy đủ thông tin xác minh chủ xe.';
    }

    if (!ownerProfile.bank_name.trim() || !ownerProfile.bank_account_number.trim() || !ownerProfile.bank_account_holder.trim()) {
      return 'Vui lòng điền đầy đủ thông tin nhận tiền.';
    }

    if (!ownerProfile.accepted_accuracy || !ownerProfile.accepted_platform_fee || !ownerProfile.accepted_dispute_policy) {
      return 'Bạn cần đồng ý đầy đủ các điều khoản trước khi gửi hồ sơ.';
    }

    return '';
  }, [mode, ownerProfile]);

  const registerAccount = async () => {
    await authApi.register({
      first_name: account.first_name.trim(),
      last_name: account.last_name.trim(),
      email: account.email.trim().toLowerCase(),
      phone: account.phone.trim(),
      password: account.password
    });

    const loginRes = await authApi.login({
      email: account.email.trim().toLowerCase(),
      password: account.password
    });

    login(loginRes.data.user, loginRes.data.token);
  };

  const handleRegisterRenter = async (event) => {
    event.preventDefault();

    if (accountError) {
      pushToast({ tone: 'error', title: 'Thông tin chưa hợp lệ', message: accountError });
      return;
    }

    setLoading(true);
    try {
      await registerAccount();
      updateUser({ owner_status: 'NONE' });
      pushToast({ tone: 'success', title: 'Đăng ký thành công', message: 'Tài khoản người thuê đã được tạo.' });
      navigate('/', { replace: true });
    } catch (error) {
      const raw = error?.response?.data?.error || 'Đăng ký thất bại. Vui lòng thử lại.';
      const message = String(raw).toLowerCase().includes('already')
        ? 'Email đã tồn tại. Vui lòng dùng email khác hoặc đăng nhập.'
        : raw;
      pushToast({ tone: 'error', title: 'Đăng ký thất bại', message });
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterOwner = async (event) => {
    event.preventDefault();

    if (accountError) {
      pushToast({ tone: 'error', title: 'Thông tin tài khoản chưa hợp lệ', message: accountError });
      return;
    }

    if (ownerProfileError) {
      pushToast({ tone: 'error', title: 'Hồ sơ chủ xe chưa hợp lệ', message: ownerProfileError });
      return;
    }

    setLoading(true);
    try {
      await registerAccount();

      await ownerApplicationApi.submitOwnerApplication({
        legal_name: ownerProfile.legal_name.trim(),
        phone: account.phone.trim(),
        email: account.email.trim().toLowerCase(),
        address: ownerProfile.address.trim(),
        id_number: ownerProfile.id_number.trim(),
        id_front_name: ownerProfile.id_front?.name || '',
        id_back_name: ownerProfile.id_back?.name || '',
        bank_name: ownerProfile.bank_name.trim(),
        bank_account_number: ownerProfile.bank_account_number.trim(),
        bank_account_holder: ownerProfile.bank_account_holder.trim(),
        card_brand: ownerProfile.card_brand.trim(),
        card_last4: ownerProfile.card_last4.trim(),
        accepted_accuracy: ownerProfile.accepted_accuracy,
        accepted_platform_fee: ownerProfile.accepted_platform_fee,
        accepted_dispute_policy: ownerProfile.accepted_dispute_policy,
        accepted_terms:
          ownerProfile.accepted_accuracy &&
          ownerProfile.accepted_platform_fee &&
          ownerProfile.accepted_dispute_policy
      });

      updateUser({ owner_status: 'PENDING' });
      pushToast({
        tone: 'success',
        title: 'Đăng ký thành công',
        message: 'Hồ sơ chủ xe đã được gửi. Vui lòng chờ admin phê duyệt.'
      });
      navigate('/app/owner-application-status', { replace: true });
    } catch (error) {
      const message = error?.response?.data?.error || error?.message || 'Không thể gửi hồ sơ đăng ký chủ xe.';
      pushToast({ tone: 'error', title: 'Đăng ký thất bại', message });
    } finally {
      setLoading(false);
    }
  };

  if (!mode) {
    return (
      <div className="mx-auto max-w-5xl space-y-8 rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-2xl backdrop-blur md:p-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold text-white">Bạn muốn bắt đầu như thế nào?</h1>
          <p className="mx-auto max-w-3xl text-sm text-slate-300 md:text-base">
            Chọn cách bạn tham gia nền tảng RentCar Premium. Bạn có thể thuê phương tiện ngay,
            hoặc đăng ký hồ sơ để trở thành chủ xe.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <button
            type="button"
            onClick={() => setMode(MODES.RENTER)}
            className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-5 text-left transition hover:-translate-y-0.5 hover:bg-cyan-500/15"
          >
            <div className="mb-3 inline-flex rounded-xl border border-cyan-400/40 bg-cyan-500/15 p-2 text-cyan-200">
              <CarFront className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold text-white">Tôi muốn thuê phương tiện</h2>
            <p className="mt-2 text-sm text-slate-300">
              Tạo tài khoản người thuê để tìm kiếm, gửi yêu cầu thuê, thanh toán và quản lý hợp đồng thuê.
            </p>
            <span className="mt-4 inline-flex rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950">
              Đăng ký người thuê
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMode(MODES.OWNER)}
            className="rounded-2xl border border-blue-400/30 bg-blue-500/10 p-5 text-left transition hover:-translate-y-0.5 hover:bg-blue-500/15"
          >
            <div className="mb-3 inline-flex rounded-xl border border-blue-400/40 bg-blue-500/15 p-2 text-blue-200">
              <Store className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold text-white">Tôi muốn cho thuê phương tiện</h2>
            <p className="mt-2 text-sm text-slate-300">
              Tạo tài khoản và gửi hồ sơ xác minh chủ xe. Bạn chỉ có thể đăng phương tiện sau khi admin phê duyệt.
            </p>
            <span className="mt-4 inline-flex rounded-xl bg-blue-400 px-4 py-2 text-sm font-semibold text-slate-950">
              Đăng ký làm chủ xe
            </span>
          </button>
        </div>

        <p className="text-center text-sm text-slate-300">
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-semibold text-cyan-300 hover:text-cyan-200">Đăng nhập</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-2xl backdrop-blur md:p-8">
      <button
        type="button"
        onClick={() => setMode('')}
        className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-3 py-1.5 text-xs text-slate-200 hover:bg-white/10"
      >
        <ChevronLeft className="h-4 w-4" /> Chọn lại hình thức
      </button>

      <div>
        <h1 className="text-2xl font-bold text-white">
          {mode === MODES.RENTER ? 'Đăng ký người thuê' : 'Đăng ký làm chủ xe'}
        </h1>
        <p className="mt-2 text-sm text-slate-300">
          {mode === MODES.RENTER
            ? 'Tạo tài khoản để bắt đầu tìm và thuê phương tiện trên nền tảng.'
            : 'Tạo tài khoản và nộp hồ sơ xác minh để trở thành chủ xe.'}
        </p>
      </div>

      <form onSubmit={mode === MODES.RENTER ? handleRegisterRenter : handleRegisterOwner} className="space-y-6">
        <section className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
          <h2 className="text-lg font-semibold text-white">Thông tin tài khoản</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <label className="text-sm text-slate-300">Tên
              <input value={account.first_name} onChange={(e) => setAccountField('first_name', e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-white outline-none" required />
            </label>
            <label className="text-sm text-slate-300">Họ
              <input value={account.last_name} onChange={(e) => setAccountField('last_name', e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-white outline-none" required />
            </label>
            <label className="text-sm text-slate-300 md:col-span-2">Email
              <input type="email" value={account.email} onChange={(e) => setAccountField('email', e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-white outline-none" required />
            </label>
            <label className="text-sm text-slate-300">Số điện thoại
              <input value={account.phone} onChange={(e) => setAccountField('phone', e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-white outline-none" required />
            </label>
            <label className="text-sm text-slate-300">Mật khẩu
              <input type="password" value={account.password} onChange={(e) => setAccountField('password', e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-white outline-none" required minLength={8} />
            </label>
            <label className="text-sm text-slate-300 md:col-span-2">Xác nhận mật khẩu
              <input type="password" value={account.confirm_password} onChange={(e) => setAccountField('confirm_password', e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-white outline-none" required minLength={8} />
            </label>
          </div>
        </section>

        {mode === MODES.OWNER ? (
          <>
            <section className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <h2 className="text-lg font-semibold text-white">Hồ sơ chủ xe</h2>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <label className="text-sm text-slate-300 md:col-span-2">Họ và tên pháp lý
                  <input value={ownerProfile.legal_name} onChange={(e) => setOwnerField('legal_name', e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-white outline-none" required />
                </label>
                <label className="text-sm text-slate-300">Số CCCD/Passport
                  <input value={ownerProfile.id_number} onChange={(e) => setOwnerField('id_number', e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-white outline-none" required />
                </label>
                <label className="text-sm text-slate-300">Địa chỉ
                  <input value={ownerProfile.address} onChange={(e) => setOwnerField('address', e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-white outline-none" required />
                </label>
                <label className="text-sm text-slate-300">Ảnh CCCD mặt trước
                  <input type="file" accept="image/*" onChange={(e) => setOwnerField('id_front', e.target.files?.[0] || null)} className="mt-1 block w-full text-xs text-slate-200" />
                </label>
                <label className="text-sm text-slate-300">Ảnh CCCD mặt sau
                  <input type="file" accept="image/*" onChange={(e) => setOwnerField('id_back', e.target.files?.[0] || null)} className="mt-1 block w-full text-xs text-slate-200" />
                </label>
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <h2 className="text-lg font-semibold text-white">Thông tin nhận tiền</h2>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <label className="text-sm text-slate-300 md:col-span-2">Tên ngân hàng
                  <input value={ownerProfile.bank_name} onChange={(e) => setOwnerField('bank_name', e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-white outline-none" required />
                </label>
                <label className="text-sm text-slate-300">Số tài khoản
                  <input value={ownerProfile.bank_account_number} onChange={(e) => setOwnerField('bank_account_number', e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-white outline-none" required />
                </label>
                <label className="text-sm text-slate-300">Chủ tài khoản
                  <input value={ownerProfile.bank_account_holder} onChange={(e) => setOwnerField('bank_account_holder', e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-white outline-none" required />
                </label>
                <label className="text-sm text-slate-300">Thương hiệu thẻ (tuỳ chọn)
                  <input value={ownerProfile.card_brand} onChange={(e) => setOwnerField('card_brand', e.target.value)} placeholder="Visa / MasterCard" className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-white outline-none" />
                </label>
                <label className="text-sm text-slate-300">4 số cuối thẻ (tuỳ chọn)
                  <input value={ownerProfile.card_last4} onChange={(e) => setOwnerField('card_last4', e.target.value)} maxLength={4} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-white outline-none" />
                </label>
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-slate-200">
              <h2 className="text-lg font-semibold text-white">Điều khoản</h2>
              <div className="mt-3 space-y-2">
                <label className="flex items-start gap-2">
                  <input type="checkbox" checked={ownerProfile.accepted_accuracy} onChange={(e) => setOwnerField('accepted_accuracy', e.target.checked)} className="mt-1" />
                  <span>Tôi cam kết thông tin là chính xác.</span>
                </label>
                <label className="flex items-start gap-2">
                  <input type="checkbox" checked={ownerProfile.accepted_platform_fee} onChange={(e) => setOwnerField('accepted_platform_fee', e.target.checked)} className="mt-1" />
                  <span>Tôi đồng ý chính sách phí nền tảng 4%.</span>
                </label>
                <label className="flex items-start gap-2">
                  <input type="checkbox" checked={ownerProfile.accepted_dispute_policy} onChange={(e) => setOwnerField('accepted_dispute_policy', e.target.checked)} className="mt-1" />
                  <span>Tôi đồng ý chính sách bồi thường và xử lý tranh chấp.</span>
                </label>
              </div>
            </section>
          </>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-2xl bg-cyan-500 px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-400 disabled:bg-slate-600"
        >
          <CheckCircle2 className="h-4 w-4" />
          {loading
            ? 'Đang xử lý...'
            : mode === MODES.RENTER
              ? 'Đăng ký người thuê'
              : 'Đăng ký làm chủ xe'}
        </button>
      </form>

      <p className="text-sm text-slate-300">
        Đã có tài khoản?{' '}
        <Link to="/login" className="font-semibold text-cyan-300 hover:text-cyan-200">Đăng nhập</Link>
      </p>
    </div>
  );
}
