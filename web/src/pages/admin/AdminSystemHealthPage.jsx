import React, { useEffect, useState } from 'react';
import { Activity, Gauge, Lock, RefreshCcw, Server, Timer } from 'lucide-react';
import { architectureApi } from '../../api';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import SectionHeader from '../../components/common/SectionHeader';
import ServiceHealthCard from '../../components/common/ServiceHealthCard';
import StatusBadge from '../../components/common/StatusBadge';

export default function AdminSystemHealthPage() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await architectureApi.getSystemHealth();
        setHealth(response.data || null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) return <LoadingSkeleton rows={5} />;

  return (
    <div className="space-y-6">
      <SectionHeader title="Sức khỏe hệ thống" subtitle="Theo dõi trạng thái dịch vụ, độ trễ API Gateway, Redis, RabbitMQ và chính sách chịu lỗi." />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Gateway</p>
          <p className="mt-2 inline-flex items-center gap-2 text-sm text-white"><Server className="h-4 w-4 text-cyan-300" /> {health?.gateway?.latency_ms ?? '--'} ms</p>
          <div className="mt-2"><StatusBadge status={health?.gateway?.status || 'WARNING'} /></div>
        </article>

        <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Tỷ lệ cache hit Redis</p>
          <p className="mt-2 inline-flex items-center gap-2 text-sm text-white"><Gauge className="h-4 w-4 text-cyan-300" /> {health?.redis?.hit_rate ?? '--'}%</p>
          <p className="mt-1 text-xs text-slate-400">CRUD 1 object: {health?.redis?.object_crud_ms ?? '--'}ms</p>
        </article>

        <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Hàng đợi RabbitMQ</p>
          <p className="mt-2 inline-flex items-center gap-2 text-sm text-white"><Activity className="h-4 w-4 text-cyan-300" /> {health?.rabbitmq?.queue_length ?? '--'} events</p>
          <p className="mt-1 text-xs text-slate-400">Rate: {health?.rabbitmq?.event_rate_per_min ?? '--'} / phút</p>
        </article>

        <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Xác thực & Chịu lỗi</p>
          <p className="mt-2 inline-flex items-center gap-2 text-sm text-white"><Lock className="h-4 w-4 text-cyan-300" /> JWT {health?.jwt?.enabled ? 'Bật' : 'Tắt'}</p>
          <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-400"><RefreshCcw className="h-3.5 w-3.5" /> Retry: {health?.gateway?.retry_policy || '3-5s'}</p>
          <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-400"><Timer className="h-3.5 w-3.5" /> Rate limiter: {health?.gateway?.rate_limiter || 'ACTIVE'}</p>
        </article>
      </div>

      <section>
        <h3 className="mb-3 text-lg font-semibold text-white">Trạng thái dịch vụ</h3>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {(health?.services || []).map((service) => (
            <ServiceHealthCard key={service.key} service={service} />
          ))}
        </div>
      </section>
    </div>
  );
}
