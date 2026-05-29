import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CarFront,
  DollarSign,
  ShieldAlert,
  Users,
  Wallet,
  ClipboardList,
  Activity
} from 'lucide-react';
import { disputeApi, rentalApi, statisticApi } from '../../api';
import SectionHeader from '../../components/common/SectionHeader';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import { formatCurrency, pickArray, toPercent } from '../../utils/formatters';
import { mockMetrics, mockRevenue, mockUserGrowth } from '../../utils/mockData';
import { resolveImage } from '../../utils/image';

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [revenueByMonth, setRevenueByMonth] = useState(mockRevenue);
  const [topVehicles, setTopVehicles] = useState([]);
  const [pendingDisputes, setPendingDisputes] = useState([]);
  const [recentRentals, setRecentRentals] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const [dashboardRes, revenueRes, topRes, disputeRes, rentalRes] = await Promise.allSettled([
        statisticApi.getDashboard(),
        statisticApi.getRevenueByMonth(6),
        statisticApi.getTopVehicles(6),
        disputeApi.getPending(),
        rentalApi.getOwnerRequests()
      ]);

      if (dashboardRes.status === 'fulfilled') setDashboard(dashboardRes.value.data);
      if (revenueRes.status === 'fulfilled') {
        const parsed = pickArray(revenueRes.value.data);
        if (parsed.length) {
          setRevenueByMonth(parsed.map((item, idx) => ({
            month: item.month || item.label || `M${idx + 1}`,
            value: Number(item.revenue || item.value || 0)
          })));
        }
      }
      if (topRes.status === 'fulfilled') setTopVehicles(pickArray(topRes.value.data));
      if (disputeRes.status === 'fulfilled') setPendingDisputes(pickArray(disputeRes.value.data));
      if (rentalRes.status === 'fulfilled') setRecentRentals(pickArray(rentalRes.value.data));
    };

    loadData();
  }, []);

  const metrics = useMemo(() => {
    const source = {
      totalUsers: dashboard?.total_users ?? mockMetrics.totalUsers,
      totalVehicles: dashboard?.total_vehicles ?? mockMetrics.totalVehicles,
      activeRentals: dashboard?.active_rentals ?? mockMetrics.activeRentals,
      totalRevenue: dashboard?.total_revenue ?? mockMetrics.totalRevenue,
      systemFeeRevenue:
        dashboard?.system_fee_revenue ??
        (dashboard?.total_revenue ? Number(dashboard.total_revenue) * 0.04 : mockMetrics.systemFeeRevenue),
      pendingDisputes:
        dashboard?.pending_disputes ??
        (pendingDisputes.length || mockMetrics.pendingDisputes),
      confirmationRate: dashboard?.confirmation_rate ?? mockMetrics.confirmationRate,
      refundPending: dashboard?.refund_pending ?? mockMetrics.refundPending
    };
    return source;
  }, [dashboard, pendingDisputes]);

  const maxRevenue = Math.max(...revenueByMonth.map((item) => Number(item.value || 0)), 1);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Trung tâm điều hành quản trị"
        subtitle="Giám sát toàn hệ thống: tăng trưởng người dùng, hiệu suất vận hành, doanh thu và rủi ro tranh chấp."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Tổng người dùng" value={metrics.totalUsers.toLocaleString('vi-VN')} icon={Users} />
        <StatCard title="Tổng số xe" value={metrics.totalVehicles.toLocaleString('vi-VN')} icon={CarFront} />
        <StatCard title="Lượt thuê đang hoạt động" value={metrics.activeRentals.toLocaleString('vi-VN')} icon={ClipboardList} />
        <StatCard title="Tổng doanh thu" value={formatCurrency(metrics.totalRevenue)} icon={DollarSign} />
        <StatCard title="Phí hệ thống 4%" value={formatCurrency(metrics.systemFeeRevenue)} icon={Wallet} />
        <StatCard title="Khiếu nại chờ xử lý" value={metrics.pendingDisputes} icon={ShieldAlert} />
        <StatCard title="Tỷ lệ xác nhận" value={toPercent(metrics.confirmationRate)} icon={Activity} />
        <StatCard title="Hoàn cọc chờ xử lý" value={metrics.refundPending} icon={AlertTriangle} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
          <h3 className="text-lg font-semibold text-white">Biểu đồ doanh thu (6 tháng)</h3>
          <div className="mt-4 space-y-3">
            {revenueByMonth.map((item) => {
              const value = Number(item.value || 0);
              const width = Math.max(8, Math.round((value / maxRevenue) * 100));
              return (
                <div key={item.month} className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>{item.month}</span>
                    <span>{formatCurrency(value)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800">
                    <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500" style={{ width: `${width}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <h3 className="mt-8 text-lg font-semibold text-white">Tăng trưởng người dùng</h3>
          <div className="mt-3 grid grid-cols-6 gap-2">
            {mockUserGrowth.map((item) => (
              <div key={item.month} className="flex flex-col items-center gap-2">
                <div className="flex h-32 w-full items-end rounded-lg bg-slate-800/70 p-1">
                  <div
                    className="w-full rounded-md bg-cyan-400/80"
                    style={{ height: `${Math.min(100, Math.round((item.value / 1300) * 100))}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400">{item.month}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="space-y-5">
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">Xe được thuê nhiều nhất</h3>
            <div className="mt-3 space-y-2">
              {topVehicles.slice(0, 5).map((item, idx) => (
                <div key={`${item.vehicle_id || idx}`} className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/40 p-2">
                  <img src={resolveImage(item.image_url, idx)} alt="xe" className="h-12 w-16 rounded-lg object-cover" />
                  <div className="flex-1 text-sm">
                    <p className="font-semibold text-white">{item.brand || 'Xe'} {item.model || item.vehicle_id?.slice(-4) || ''}</p>
                    <p className="text-xs text-slate-400">Lượt thuê: {item.rental_count || item.total_rentals || 0}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">Khiếu nại chờ xử lý</h3>
            <div className="mt-3 space-y-2">
              {pendingDisputes.slice(0, 4).map((item) => (
                <div key={item._id} className="rounded-xl border border-white/10 bg-slate-950/40 p-2 text-xs text-slate-200">
                  <div className="flex items-center justify-between">
                    <span>#{item._id?.slice(-6)}</span>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="mt-1 text-slate-400 line-clamp-2">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">Lượt thuê gần đây</h3>
            <div className="mt-3 space-y-2">
              {recentRentals.slice(0, 4).map((item) => (
                <div key={item._id} className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/40 p-2 text-xs text-slate-200">
                  <span>Yêu cầu #{item._id?.slice(-6)}</span>
                  <StatusBadge status={item.status} />
                </div>
              ))}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
