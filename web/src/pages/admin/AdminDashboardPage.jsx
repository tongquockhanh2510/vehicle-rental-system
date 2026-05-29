import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CarFront,
  DollarSign,
  FileText,
  ShieldAlert,
  Users,
  Wallet,
  ClipboardList,
  UserCheck,
  UserCog
} from 'lucide-react';
import SectionHeader from '../../components/common/SectionHeader';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import { formatCurrency, pickArray } from '../../utils/formatters';
import { resolveImage } from '../../utils/image';
import { getAdminDashboardData } from '../../services/adminDataService';

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fallback, setFallback] = useState(false);
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalRenters: 0,
    approvedOwners: 0,
    pendingOwnerApplications: 0,
    totalVehicles: 0,
    pendingRentals: 0,
    activeContracts: 0,
    totalPayments: 0,
    systemFeeRevenue: 0,
    pendingDisputes: 0
  });
  const [revenueByMonth, setRevenueByMonth] = useState([]);
  const [topVehicles, setTopVehicles] = useState([]);
  const [pendingDisputes, setPendingDisputes] = useState([]);
  const [recentRentals, setRecentRentals] = useState([]);
  const [pendingOwnerApps, setPendingOwnerApps] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const payload = await getAdminDashboardData();
        setMetrics(payload.metrics);
        setRevenueByMonth(payload.revenueByMonth || []);
        setTopVehicles(pickArray(payload.topVehicles));
        setPendingDisputes(pickArray(payload.pendingDisputesList));
        setRecentRentals(pickArray(payload.recentRentals));
        setPendingOwnerApps(
          pickArray(payload.collections?.ownerApplications).filter(
            (item) => String(item.status || '').toUpperCase() === 'PENDING'
          )
        );
        setFallback(Boolean(payload.fallback));
        setError(payload.error || '');
      } catch (serviceError) {
        setError(serviceError?.message || 'Không thể tải dữ liệu dashboard admin.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const maxRevenue = useMemo(
    () => Math.max(...revenueByMonth.map((item) => Number(item.value || 0)), 1),
    [revenueByMonth]
  );

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Admin Control Center"
        subtitle="Giám sát người dùng, phương tiện, giao dịch, tranh chấp và tình trạng hệ thống microservices."
      />

      {fallback ? (
        <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          Một số API quản trị chưa sẵn sàng, dashboard đang hiển thị dữ liệu dự phòng để không gián đoạn demo vận hành.
        </div>
      ) : null}

      {!loading && error ? (
        <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Tổng người dùng" value={loading ? '...' : metrics.totalUsers.toLocaleString('vi-VN')} icon={Users} />
        <StatCard title="Người thuê" value={loading ? '...' : metrics.totalRenters.toLocaleString('vi-VN')} icon={UserCog} />
        <StatCard title="Chủ xe đã duyệt" value={loading ? '...' : metrics.approvedOwners.toLocaleString('vi-VN')} icon={UserCheck} />
        <StatCard title="Hồ sơ chủ xe chờ duyệt" value={loading ? '...' : metrics.pendingOwnerApplications.toLocaleString('vi-VN')} icon={FileText} />
        <StatCard title="Tổng phương tiện" value={loading ? '...' : metrics.totalVehicles.toLocaleString('vi-VN')} icon={CarFront} />
        <StatCard title="Yêu cầu thuê chờ duyệt" value={loading ? '...' : metrics.pendingRentals.toLocaleString('vi-VN')} icon={ClipboardList} />
        <StatCard title="Hợp đồng đang hoạt động" value={loading ? '...' : metrics.activeContracts.toLocaleString('vi-VN')} icon={FileText} />
        <StatCard title="Tổng thanh toán" value={loading ? '...' : formatCurrency(metrics.totalPayments)} icon={DollarSign} />
        <StatCard title="Phí nền tảng 4%" value={loading ? '...' : formatCurrency(metrics.systemFeeRevenue)} icon={Wallet} />
        <StatCard title="Tranh chấp chờ xử lý" value={loading ? '...' : metrics.pendingDisputes.toLocaleString('vi-VN')} icon={ShieldAlert} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
          <h3 className="text-lg font-semibold text-white">Revenue Overview (6 tháng)</h3>
          <div className="mt-4 space-y-3">
            {revenueByMonth.length ? (
              revenueByMonth.map((item) => {
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
              })
            ) : (
              <p className="text-sm text-slate-400">Chưa có dữ liệu doanh thu để hiển thị.</p>
            )}
          </div>

          <h3 className="mt-8 text-lg font-semibold text-white">Owner Applications Pending</h3>
          <div className="mt-3 space-y-2">
            {pendingOwnerApps.length ? (
              pendingOwnerApps.slice(0, 5).map((item) => (
                <div key={item._id} className="rounded-xl border border-white/10 bg-slate-950/40 p-3 text-sm text-slate-200">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-white">{item.applicant_name || item.owner_profile?.legal_name || 'Chưa cập nhật'}</p>
                    <StatusBadge status={`OWNER_${String(item.status || 'PENDING').toUpperCase()}`} />
                  </div>
                  <p className="mt-1 text-xs text-slate-400">{item.email || 'Chưa cập nhật email'} • {item.phone || 'Chưa cập nhật SĐT'}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">Không có hồ sơ chủ xe chờ duyệt.</p>
            )}
          </div>
        </article>

        <article className="space-y-5">
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">Xe được thuê nhiều</h3>
            <div className="mt-3 space-y-2">
              {topVehicles.length ? (
                topVehicles.slice(0, 5).map((item, idx) => (
                  <div key={`${item.vehicle_id || idx}`} className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/40 p-2">
                    <img
                      src={resolveImage(item.image_url || item.images?.[0], idx)}
                      alt="xe"
                      className="h-12 w-16 rounded-lg object-cover"
                      onError={(event) => {
                        event.currentTarget.src = resolveImage('', idx + 5);
                      }}
                    />
                    <div className="flex-1 text-sm">
                      <p className="font-semibold text-white">{item.brand || 'Xe'} {item.model || ''}</p>
                      <p className="text-xs text-slate-400">Lượt thuê: {item.rental_count || item.total_rentals || 0}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">Chưa có dữ liệu xe nổi bật.</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">Pending disputes</h3>
            <div className="mt-3 space-y-2">
              {pendingDisputes.length ? (
                pendingDisputes.slice(0, 4).map((item) => (
                  <div key={item._id} className="rounded-xl border border-white/10 bg-slate-950/40 p-2 text-xs text-slate-200">
                    <div className="flex items-center justify-between">
                      <span>#{item._id?.slice(-6)}</span>
                      <StatusBadge status={item.status} />
                    </div>
                    <p className="mt-1 text-slate-400 line-clamp-2">{item.description || 'Chưa cập nhật mô tả tranh chấp.'}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">Không có tranh chấp chờ xử lý.</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">Recent rental requests</h3>
            <div className="mt-3 space-y-2">
              {recentRentals.length ? (
                recentRentals.slice(0, 4).map((item) => (
                  <div key={item._id} className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/40 p-2 text-xs text-slate-200">
                    <span>Yêu cầu #{item._id?.slice(-6)}</span>
                    <StatusBadge status={item.status} />
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">Chưa có yêu cầu thuê gần đây.</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-cyan-400/25 bg-cyan-500/10 p-3 text-xs text-cyan-100">
            Snapshot hệ thống: API Gateway, MongoDB, Redis, RabbitMQ và JWT được theo dõi ở trang System Health (route kỹ thuật).
          </div>
        </article>
      </div>

      {loading ? <div className="text-sm text-slate-400">Đang tải dashboard...</div> : null}

      {metrics.pendingDisputes > 0 ? (
        <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          <span className="inline-flex items-center gap-2 font-medium">
            <AlertTriangle className="h-4 w-4" />
            Có {metrics.pendingDisputes} tranh chấp cần ưu tiên xử lý.
          </span>
        </div>
      ) : null}
    </div>
  );
}
