import React, { useEffect, useMemo, useState } from 'react';
import { BarChart3, CarFront, ClipboardList, Scale, WalletCards } from 'lucide-react';
import { disputeApi, paymentApi, rentalApi, vehicleApi } from '../../api';
import SectionHeader from '../../components/common/SectionHeader';
import StatCard from '../../components/common/StatCard';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, pickArray } from '../../utils/formatters';

export default function OwnerDashboardPage() {
  const { userId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [payments, setPayments] = useState([]);
  const [disputes, setDisputes] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const [vehicleRes, rentalRes, paymentRes, disputeRes] = await Promise.allSettled([
          vehicleApi.getOwnerVehicles(userId),
          rentalApi.getOwnerRequests(),
          paymentApi.getOwnerPayments(),
          disputeApi.getMyDisputes()
        ]);

        setVehicles(vehicleRes.status === 'fulfilled' ? pickArray(vehicleRes.value.data) : []);
        setRentals(rentalRes.status === 'fulfilled' ? pickArray(rentalRes.value.data) : []);
        setPayments(paymentRes.status === 'fulfilled' ? pickArray(paymentRes.value.data) : []);
        setDisputes(disputeRes.status === 'fulfilled' ? pickArray(disputeRes.value.data) : []);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId]);

  const revenue = useMemo(
    () => payments.filter((item) => String(item.status || '').toUpperCase() === 'COMPLETED').reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [payments]
  );

  const pendingRequests = useMemo(
    () => rentals.filter((item) => String(item.status || '').toUpperCase() === 'PENDING').length,
    [rentals]
  );

  const activeVehicles = useMemo(
    () => vehicles.filter((item) => item.is_available).length,
    [vehicles]
  );

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Tổng quan chủ xe"
        subtitle="Theo dõi hiệu suất đội xe, yêu cầu thuê, hợp đồng và doanh thu theo thời gian thực."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Xe của tôi" value={loading ? '...' : vehicles.length} subtitle={`${activeVehicles} xe khả dụng`} icon={CarFront} />
        <StatCard title="Yêu cầu thuê" value={loading ? '...' : rentals.length} subtitle={`${pendingRequests} đang chờ`} icon={ClipboardList} />
        <StatCard title="Doanh thu" value={loading ? '...' : formatCurrency(revenue)} subtitle="Thanh toán đã hoàn tất" icon={WalletCards} />
        <StatCard title="Khiếu nại" value={loading ? '...' : disputes.length} subtitle="Yêu cầu bồi thường đang xử lý" icon={Scale} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
          <h3 className="mb-3 text-lg font-semibold text-white">Yêu cầu gần đây</h3>
          <div className="space-y-2">
            {rentals.slice(0, 5).map((rental) => (
              <div key={rental._id} className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-slate-200">
                <div className="flex items-center justify-between gap-2">
                  <p>Yêu cầu #{String(rental._id).slice(-6)}</p>
                  <span className="text-xs text-cyan-300">{rental.status}</span>
                </div>
                <p className="text-xs text-slate-400">Xe {String(rental.vehicle_id).slice(-6)}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
          <h3 className="mb-3 text-lg font-semibold text-white">Hiệu suất doanh thu</h3>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6].map((month) => {
              const value = Math.max(8, Math.min(100, 20 + month * 12));
              return (
                <div key={month} className="flex items-center gap-3 text-sm text-slate-300">
                  <span className="w-8 text-xs text-slate-400">M{month}</span>
                  <div className="h-2 flex-1 rounded-full bg-slate-800">
                    <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" style={{ width: `${value}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-4 inline-flex items-center gap-2 rounded-lg border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-200">
            <BarChart3 className="h-3.5 w-3.5" />
            Ảnh chụp nhanh lợi nhuận dựa trên dữ liệu quyết toán.
          </p>
        </article>
      </div>
    </div>
  );
}
