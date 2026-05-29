import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Banknote, FileCheck2, Shield } from 'lucide-react';
import SectionHeader from '../../components/common/SectionHeader';
import { useAuth } from '../../context/AuthContext';
import { getOwnerCta } from '../../utils/ownerCta';

export default function BecomeOwnerIntroPage() {
  const { user, ownerStatus } = useAuth();
  const ownerCta = getOwnerCta(user, ownerStatus);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Trở thành chủ xe"
        subtitle="Mở nguồn thu từ phương tiện nhàn rỗi với quy trình xác minh minh bạch và bộ công cụ quản lý chuyên nghiệp."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-emerald-400/25 bg-emerald-500/10 p-4">
          <Banknote className="h-5 w-5 text-emerald-300" />
          <h3 className="mt-2 text-base font-semibold text-white">Tăng doanh thu</h3>
          <p className="mt-1 text-sm text-emerald-100">Theo dõi doanh thu, tỷ lệ lấp đầy và gợi ý giá thuê theo thị trường.</p>
        </article>

        <article className="rounded-2xl border border-cyan-400/25 bg-cyan-500/10 p-4">
          <FileCheck2 className="h-5 w-5 text-cyan-300" />
          <h3 className="mt-2 text-base font-semibold text-white">Hợp đồng minh bạch</h3>
          <p className="mt-1 text-sm text-cyan-100">Mọi giao dịch có timeline hợp đồng, thanh toán cọc và quy trình kiểm tra xe rõ ràng.</p>
        </article>

        <article className="rounded-2xl border border-blue-400/25 bg-blue-500/10 p-4">
          <Shield className="h-5 w-5 text-blue-300" />
          <h3 className="mt-2 text-base font-semibold text-white">An toàn vận hành</h3>
          <p className="mt-1 text-sm text-blue-100">Theo dõi vị trí, cảnh báo vượt phạm vi và cơ chế giải quyết tranh chấp có admin.</p>
        </article>
      </section>

      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
        <h3 className="text-lg font-semibold text-white">Quy trình owner onboarding</h3>
        <ol className="mt-3 space-y-2 text-sm text-slate-200">
          <li>1. Điền thông tin pháp lý và định danh.</li>
          <li>2. Cung cấp thông tin nhận tiền.</li>
          <li>3. Đồng ý điều khoản cho thuê và bồi thường.</li>
          <li>4. Chờ admin duyệt trạng thái OWNER_APPROVED.</li>
        </ol>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link to={ownerCta.to} className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950">{ownerCta.label}</Link>
          <Link to="/login" className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-sm text-slate-200">Đăng nhập <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </div>
    </div>
  );
}
