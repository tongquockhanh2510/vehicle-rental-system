import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api';
import { useToast } from '../../context/ToastContext';

const initialForm = {
  email: '',
  first_name: '',
  last_name: '',
  phone: '',
  password: ''
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const { pushToast } = useToast();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      await authApi.register({
        ...form,
        email: form.email.trim().toLowerCase(),
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        phone: form.phone.trim()
      });

      pushToast({ tone: 'success', title: 'Registration complete', message: 'Tài khoản đã được tạo. Vui lòng đăng nhập.' });
      navigate('/login');
    } catch (error) {
      let message = error?.response?.data?.error || 'Registration failed. Please try again.';
      if (String(message).toLowerCase().includes('already')) {
        message = 'Email đã tồn tại. Vui lòng dùng email khác hoặc đăng nhập.';
      }
      pushToast({ tone: 'error', title: 'Registration failed', message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-2xl backdrop-blur md:p-8">
      <h1 className="text-3xl font-bold text-white">Tạo tài khoản RentCar Premium</h1>
      <p className="mt-2 text-sm text-slate-300">Bắt đầu hành trình thuê xe hoặc chia sẻ xe của bạn để tạo thu nhập.</p>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="md:col-span-2">
          <span className="mb-1 block text-xs uppercase tracking-[0.18em] text-slate-300">Email</span>
          <input
            type="email"
            required
            value={form.email}
            onChange={(event) => setField('email', event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-3 text-sm text-white outline-none"
            placeholder="you@example.com"
          />
        </label>

        <label>
          <span className="mb-1 block text-xs uppercase tracking-[0.18em] text-slate-300">Tên</span>
          <input
            type="text"
            required
            value={form.first_name}
            onChange={(event) => setField('first_name', event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-3 text-sm text-white outline-none"
          />
        </label>

        <label>
          <span className="mb-1 block text-xs uppercase tracking-[0.18em] text-slate-300">Họ</span>
          <input
            type="text"
            required
            value={form.last_name}
            onChange={(event) => setField('last_name', event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-3 text-sm text-white outline-none"
          />
        </label>

        <label>
          <span className="mb-1 block text-xs uppercase tracking-[0.18em] text-slate-300">Điện thoại</span>
          <input
            type="tel"
            required
            value={form.phone}
            onChange={(event) => setField('phone', event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-3 text-sm text-white outline-none"
          />
        </label>

        <label>
          <span className="mb-1 block text-xs uppercase tracking-[0.18em] text-slate-300">Password</span>
          <input
            type="password"
            required
            minLength={8}
            value={form.password}
            onChange={(event) => setField('password', event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-3 text-sm text-white outline-none"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="md:col-span-2 rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-bold text-slate-950 transition hover:scale-[1.01] hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-600"
        >
          {loading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-300">
        Đã có tài khoản?{' '}
        <Link to="/login" className="font-semibold text-cyan-300 hover:text-cyan-200">
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}
