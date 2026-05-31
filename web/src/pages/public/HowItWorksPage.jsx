import React from 'react';
import { CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import SectionHeader from '../../components/common/SectionHeader';

const renterSteps = [
  'Tìm phương tiện phù hợp theo loại, vị trí và ngân sách.',
  'Gửi yêu cầu thuê, theo dõi trạng thái xác nhận.',
  'Nhận xe, chụp inspection và sử dụng trong phạm vi cho phép.',
  'Trả xe, đối soát hoàn cọc và đánh giá dịch vụ.'
];

const ownerSteps = [
  'Gửi hồ sơ xác minh để trở thành chủ xe.',
  'Đăng phương tiện với giá thuê, tiền cọc, phạm vi hoạt động.',
  'Duyệt yêu cầu thuê, ký hợp đồng và theo dõi hành trình.',
  'Nhận doanh thu và báo cáo hiệu suất theo tháng.'
];

export default function HowItWorksPage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Cách hoạt động"
        subtitle="Quy trình minh bạch cho người thuê và chủ xe, bám sát kiến trúc microservices với hợp đồng số, thanh toán và theo dõi hành trình."
      />

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-cyan-400/25 bg-cyan-500/10 p-5">
          <h3 className="text-xl font-semibold text-white">Dành cho người thuê</h3>
          <ul className="mt-3 space-y-3 text-sm text-slate-100">
            {renterSteps.map((step) => (
              <li key={step} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" />
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-blue-400/25 bg-blue-500/10 p-5">
          <h3 className="text-xl font-semibold text-white">Dành cho chủ xe</h3>
          <ul className="mt-3 space-y-3 text-sm text-slate-100">
            {ownerSteps.map((step) => (
              <li key={step} className="flex items-start gap-2">
                <Sparkles className="mt-0.5 h-4 w-4 text-cyan-300" />
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
        <h3 className="text-lg font-semibold text-white">Trust & Safety</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {[
            'JWT Authentication cho toàn bộ API',
            'Rate limiter tại API Gateway',
            'Retry policy 3-5s cho tác vụ bất đồng bộ',
            'Redis cache tối ưu đọc dữ liệu',
            'RabbitMQ event bus cho luồng rental/contract/payment',
            'Dispute workflow có admin phê duyệt'
          ].map((item) => (
            <div key={item} className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-slate-200">
              <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-cyan-300" /> {item}</span>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}
