import React, { useEffect, useMemo, useState } from 'react';
import api from '../api/api';
import { BarChart3, Car, Wallet, TrendingUp, AlertTriangle, Users } from 'lucide-react';

const formatMoney = (value) => Number(value || 0).toLocaleString('vi-VN');

export default function StatisticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboard, setDashboard] = useState(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [topVehicles, setTopVehicles] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError('');

        const [dashboardRes, revenueRes, topRes] = await Promise.all([
          api.get('/api/statistics/dashboard'),
          api.get('/api/statistics/revenue-by-month?months=6'),
          api.get('/api/statistics/top-vehicles?limit=8')
        ]);

        setDashboard(dashboardRes.data);
        setMonthlyRevenue(Array.isArray(revenueRes.data) ? revenueRes.data : []);
        setTopVehicles(Array.isArray(topRes.data) ? topRes.data : []);
      } catch (err) {
        setError(err.response?.data?.error || 'Khong tai duoc thong ke');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const maxRevenue = useMemo(() => {
    if (!monthlyRevenue.length) {
      return 1;
    }
    return Math.max(...monthlyRevenue.map((item) => item.total_revenue || 0), 1);
  }, [monthlyRevenue]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-300 rounded w-64" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-28 bg-slate-300 rounded" />
              <div className="h-28 bg-slate-300 rounded" />
              <div className="h-28 bg-slate-300 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 p-8">
        <div className="max-w-7xl mx-auto bg-red-100 border border-red-400 text-red-700 p-4 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="text-blue-700" size={32} />
          <h1 className="text-3xl font-bold text-slate-800">Dashboard He Thong</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <MetricCard
            icon={<Users size={18} />}
            title="Tong nguoi dung"
            value={dashboard?.total_users || 0}
            subtitle="Tai khoan trong he thong"
          />
          <MetricCard
            icon={<Car size={18} />}
            title="Tong xe"
            value={dashboard?.total_vehicles || 0}
            subtitle={`${dashboard?.available_vehicles || 0} xe dang san sang`}
          />
          <MetricCard
            icon={<Wallet size={18} />}
            title="Tong doanh thu"
            value={`${formatMoney(dashboard?.total_revenue)} VND`}
            subtitle={`Phi nen tang: ${formatMoney(dashboard?.platform_revenue)} VND`}
          />
          <MetricCard
            icon={<AlertTriangle size={18} />}
            title="Dispute pending"
            value={dashboard?.pending_disputes || 0}
            subtitle={`Confirmed rate: ${dashboard?.confirmation_rate || 0}%`}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          <div className="xl:col-span-3 bg-white rounded-xl shadow p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={18} className="text-blue-700" />
              <h2 className="text-xl font-semibold text-slate-800">Doanh thu 6 thang gan nhat</h2>
            </div>
            <div className="space-y-3">
              {monthlyRevenue.map((item) => {
                const width = ((item.total_revenue || 0) / maxRevenue) * 100;
                return (
                  <div key={item.month}>
                    <div className="flex justify-between text-sm text-slate-700 mb-1">
                      <span>{item.month}</span>
                      <span>{formatMoney(item.total_revenue)} VND</span>
                    </div>
                    <div className="w-full h-3 bg-slate-200 rounded">
                      <div
                        className="h-3 rounded bg-gradient-to-r from-blue-600 to-cyan-500"
                        style={{ width: `${Math.max(width, 2)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="xl:col-span-2 bg-white rounded-xl shadow p-5">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Top xe duoc dat</h2>
            <div className="space-y-3">
              {topVehicles.length === 0 && (
                <p className="text-slate-500">Chua co du lieu booking.</p>
              )}
              {topVehicles.map((item, idx) => (
                <div key={`${item.vehicle_id}-${idx}`} className="border border-slate-200 rounded p-3">
                  <p className="font-semibold text-slate-800">
                    {item.brand || 'Unknown'} {item.model || ''}
                  </p>
                  <p className="text-sm text-slate-600">
                    Booking: {item.total_bookings} | Revenue: {formatMoney(item.total_revenue)} VND
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon, title, value, subtitle }) {
  return (
    <div className="bg-white rounded-xl shadow p-4 border border-slate-100">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{title}</p>
        <span className="text-blue-700">{icon}</span>
      </div>
      <p className="text-2xl font-bold text-slate-800 mt-2">{value}</p>
      <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
    </div>
  );
}
