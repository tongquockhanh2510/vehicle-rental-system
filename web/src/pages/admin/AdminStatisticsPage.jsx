import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import SectionHeader from '../../components/common/SectionHeader';
import StatCard from '../../components/common/StatCard';
import { formatCurrency } from '../../utils/formatters';
import { getAdminDashboardData } from '../../services/adminDataService';

export default function AdminStatisticsPage() {
  const [loading, setLoading] = useState(true);
  const [fallback, setFallback] = useState(false);
  const [error, setError] = useState('');
  const [metrics, setMetrics] = useState({
    totalPayments: 0,
    systemFeeRevenue: 0,
    pendingDisputes: 0,
    activeContracts: 0
  });
  const [revenue, setRevenue] = useState([]);
  const [topVehicles, setTopVehicles] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const payload = await getAdminDashboardData();
      setFallback(Boolean(payload.fallback));
      setError(payload.error || '');
      setMetrics(payload.metrics);
      setRevenue(payload.revenueByMonth || []);
      setTopVehicles(payload.topVehicles || []);
      setLoading(false);
    };

    loadData();
  }, []);

  const totalRevenue = useMemo(
    () => revenue.reduce((sum, item) => sum + Number(item.value || 0), 0),
    [revenue]
  );

  const maxRevenue = useMemo(
    () => Math.max(...revenue.map((item) => Number(item.value || 0)), 1),
    [revenue]
  );

  return (
    <div className="space-y-6">
      <SectionHeader title="Quản trị • Thống kê" subtitle="Khai thác KPI tài chính và hiệu suất vận hành liên thông giữa người thuê, chủ xe và admin." />

      {fallback ? (
        <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
          Một số chỉ số đang dùng dữ liệu dự phòng do API thống kê chưa phản hồi đầy đủ.
        </div>
      ) : null}

      {!loading && error ? (
        <div className="inline-flex items-center gap-2 rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
          <AlertTriangle className="h-3.5 w-3.5" /> {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Tổng doanh thu (6 tháng)" value={loading ? '...' : formatCurrency(totalRevenue)} />
        <StatCard title="Tổng thanh toán" value={loading ? '...' : formatCurrency(metrics.totalPayments || 0)} />
        <StatCard title="Phí hệ thống (4%)" value={loading ? '...' : formatCurrency(metrics.systemFeeRevenue || 0)} />
        <StatCard title="Hợp đồng đang hoạt động" value={loading ? '...' : String(metrics.activeContracts || 0)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
          <h3 className="text-lg font-semibold text-white">Xu hướng doanh thu</h3>
          <div className="mt-4 space-y-3">
            {revenue.length ? (
              revenue.map((item) => {
                const width = Math.max(10, Math.round((Number(item.value || 0) / maxRevenue) * 100));
                return (
                  <div key={item.month}>
                    <div className="mb-1 flex items-center justify-between text-xs text-slate-300">
                      <span>{item.month}</span>
                      <span>{formatCurrency(item.value)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-800">
                      <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" style={{ width: `${width}%` }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-slate-400">Chưa có dữ liệu doanh thu.</p>
            )}
          </div>
        </article>

        <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
          <h3 className="text-lg font-semibold text-white">Xe được thuê nhiều nhất</h3>
          <div className="mt-4 space-y-2">
            {topVehicles.length ? (
              topVehicles.map((item, idx) => (
                <div key={`${item.vehicle_id || idx}`} className="rounded-xl border border-white/10 bg-slate-950/40 p-3 text-sm text-slate-200">
                  <p className="font-semibold text-white">#{idx + 1} {item.brand || 'Xe'} {item.model || ''}</p>
                  <p className="text-xs text-slate-400">Lượt thuê: {item.rental_count || item.total_rentals || 0}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">Chưa có dữ liệu top vehicle.</p>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}
