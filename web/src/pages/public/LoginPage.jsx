import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LockKeyhole, Mail } from 'lucide-react';
import { authApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { pushToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await authApi.login({ email: email.trim().toLowerCase(), password });
      const { token, user } = response.data;
      login(user, token);

      pushToast({ tone: 'success', title: 'Đăng nhập thành công', message: 'Chào mừng bạn quay lại RentCar Premium.' });
      navigate('/', { replace: true });
    } catch (error) {
      pushToast({
        tone: 'error',
        title: 'Đăng nhập thất bại',
        message: error?.response?.data?.error || 'Thông tin đăng nhập không đúng. Vui lòng thử lại.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-2xl backdrop-blur md:p-8">
      <h1 className="text-3xl font-bold text-white">Đăng nhập tài khoản</h1>
      <p className="mt-2 text-sm text-slate-300">Truy cập cổng người thuê, chủ xe hoặc quản trị viên trên cùng nền tảng.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-[0.18em] text-slate-300">Email</span>
          <div className="flex items-center rounded-2xl border border-white/10 bg-slate-950/60 px-3">
            <Mail className="h-4 w-4 text-slate-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full bg-transparent px-2 py-3 text-sm text-white outline-none"
              placeholder="you@example.com"
            />
          </div>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-[0.18em] text-slate-300">Mật khẩu</span>
          <div className="flex items-center rounded-2xl border border-white/10 bg-slate-950/60 px-3">
            <LockKeyhole className="h-4 w-4 text-slate-400" />
            <input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full bg-transparent px-2 py-3 text-sm text-white outline-none"
              placeholder="••••••••"
            />
          </div>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-bold text-slate-950 transition hover:scale-[1.01] hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-600"
        >
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-300">
        Chưa có tài khoản?{' '}
        <Link to="/register" className="font-semibold text-cyan-300 hover:text-cyan-200">
          Đăng ký ngay
        </Link>
      </p>
    </div>
  );
}
