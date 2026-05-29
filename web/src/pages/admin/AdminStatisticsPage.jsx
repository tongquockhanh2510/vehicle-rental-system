import React, { useEffect, useMemo, useState } from 'react';
import { statisticApi } from '../../api';
import SectionHeader from '../../components/common/SectionHeader';
import StatCard from '../../components/common/StatCard';
import { formatCurrency, pickArray } from '../../utils/formatters';
import { mockRevenue } from '../../utils/mockData';

export default function AdminStatisticsPage() {
  const [dashboard, setDashboard] = useState(null);
  const [revenue, setRevenue] = useState(mockRevenue);
  const [topVehicles, setTopVehicles] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const [dashboardRes, revenueRes, topRes] = await Promise.allSettled([
        statisticApi.getDashboard(),
        statisticApi.getRevenueByMonth(6),
        statisticApi.getTopVehicles(8)
      ]);

      if (dashboardRes.status === 'fulfilled') setDashboard(dashboardRes.value.data);
      if (revenueRes.status === 'fulfilled') {
        const rows = pickArray(revenueRes.value.data);
        if (rows.length) {
          setRevenue(rows.map((item, idx) => ({ month: item.month || `M${idx + 1}`, value: Number(item.revenue || item.value || 0) })));
        }
      }
      if (topRes.status === 'fulfilled') setTopVehicles(pickArray(topRes.value.data));
    };

    loadData();
  }, []);

  const totalRevenue = useMemo(() => revenue.reduce((sum, item) => sum + Number(item.value || 0), 0), [revenue]);

  return (
    <div className="space-y-6">
      <SectionHeader title="Quản trị • Thống kê" subtitle="Khai thác KPI tài chính và hiệu suất vận hành ở mức hệ thống." />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Tổng doanh thu (6 tháng)" value={formatCurrency(totalRevenue)} />
        <StatCard title="Phí hệ thống (4%)" value={formatCurrency(totalRevenue * 0.04)} />
        <StatCard title="Tổng lượt thuê" value={(dashboard?.total_rentals || 0).toLocaleString('vi-VN')} />
        <StatCard title="Khiếu nại chờ xử lý" value={(dashboard?.pending_disputes || 0).toLocaleString('vi-VN')} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
          <h3 className="text-lg font-semibold text-white">Xu hướng doanh thu</h3>
          <div className="mt-4 space-y-3">
            {revenue.map((item) => (
              <div key={item.month}>
                <div className="mb-1 flex items-center justify-between text-xs text-slate-300">
                  <span>{item.month}</span>
                  <span>{formatCurrency(item.value)}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800">
                  <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" style={{ width: `${Math.max(10, Math.round((item.value / Math.max(...revenue.map((r) => r.value), 1)) * 100))}%` }} />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
          <h3 className="text-lg font-semibold text-white">Xe được thuê nhiều nhất</h3>
          <div className="mt-4 space-y-2">
            {topVehicles.map((item, idx) => (
              <div key={`${item.vehicle_id || idx}`} className="rounded-xl border border-white/10 bg-slate-950/40 p-3 text-sm text-slate-200">
                <p className="font-semibold text-white">#{idx + 1} {item.brand || 'Xe'} {item.model || ''}</p>
                <p className="text-xs text-slate-400">Lượt thuê: {item.rental_count || item.total_rentals || 0}</p>
              </div>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}
