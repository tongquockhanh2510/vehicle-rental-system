import React, { useEffect, useState } from 'react';
import { architectureApi } from '../../api';
import ArchitectureDiagram from '../../components/common/ArchitectureDiagram';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import SectionHeader from '../../components/common/SectionHeader';

function BulletGroup({ title, items = [] }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
      <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm text-slate-200">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </article>
  );
}

export default function AdminArchitecturePage() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await architectureApi.getArchitectureOverview();
        setOverview(response.data || null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) return <LoadingSkeleton rows={5} />;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Bằng chứng Kiến trúc & DevOps"
        subtitle="Bằng chứng kiến trúc để bảo vệ rubric: C4, microservices, API Gateway, Redis, RabbitMQ, JWT, rate limiter, retry và trade-off."
      />

      <ArchitectureDiagram />

      <section className="grid gap-4 xl:grid-cols-2">
        <BulletGroup
          title="C4 Context / Container"
          items={[
            'Context: Người thuê, chủ xe, admin tương tác qua Web App.',
            'Container: Web App -> API Gateway -> Microservices.',
            'Dữ liệu: MongoDB cho persisted data, Redis cho cache, RabbitMQ cho event-driven flow.',
            'Bảo mật: JWT + gateway policies + rate limiting.'
          ]}
        />

        <BulletGroup
          title="System Design"
          items={[
            'Luồng đồng bộ: auth, vehicle query, profile update.',
            'Luồng bất đồng bộ: rental.created -> contract -> notification/payment events.',
            'Fault tolerance: retry 3-5s và graceful degradation khi service timeout.',
            'Scalability: scale từng service theo tải (vehicle/search, tracking, payment).'
          ]}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <BulletGroup title="Ưu điểm" items={overview?.advantages || []} />
        <BulletGroup title="Nhược điểm" items={overview?.disadvantages || []} />
        <BulletGroup title="Trade-off / So sánh Monolith" items={[...(overview?.tradeoffs || []), ...(overview?.compare_monolith || [])]} />
      </section>

      <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">DevOps & Deployment</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2 text-sm text-slate-200">
          <div className="rounded-xl border border-white/10 bg-slate-950/40 p-3">Docker Compose điều phối các service: api-gateway, domain service, Redis, RabbitMQ.</div>
          <div className="rounded-xl border border-white/10 bg-slate-950/40 p-3">CI/CD placeholder: pipeline GitLab CI/Jenkins theo bước build → test → security scan → deploy.</div>
          <div className="rounded-xl border border-white/10 bg-slate-950/40 p-3">Maintainability: tách module theo bounded context, frontend service layer tổ chức riêng.</div>
          <div className="rounded-xl border border-white/10 bg-slate-950/40 p-3">Observability: theo dõi system health, logs, latency dashboard và cảnh báo queue backlog.</div>
        </div>
      </article>
    </div>
  );
}
