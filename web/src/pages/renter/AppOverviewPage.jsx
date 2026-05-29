import React, { useEffect, useMemo, useState } from 'react';
import { Bell, ClipboardList, FileCheck2, Wallet } from 'lucide-react';
import { contractApi, notificationApi, paymentApi, rentalApi } from '../../api';
import SectionHeader from '../../components/common/SectionHeader';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import { formatCurrency, pickArray } from '../../utils/formatters';

export default function AppOverviewPage() {
  const [requests, setRequests] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [payments, setPayments] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const load = async () => {
      const [reqRes, contractRes, paymentRes, notiRes] = await Promise.allSettled([
        rentalApi.getRenterRequests(),
        contractApi.getRenterContracts(),
        paymentApi.getRenterPayments(),
        notificationApi.getMine()
      ]);

      setRequests(reqRes.status === 'fulfilled' ? pickArray(reqRes.value.data) : []);
      setContracts(contractRes.status === 'fulfilled' ? pickArray(contractRes.value.data) : []);
      setPayments(paymentRes.status === 'fulfilled' ? pickArray(paymentRes.value.data) : []);
      setNotifications(notiRes.status === 'fulfilled' ? pickArray(notiRes.value.data) : []);
    };

    load();
  }, []);

  const paidAmount = useMemo(
    () => payments.filter((item) => String(item.status || '').toUpperCase() === 'COMPLETED').reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [payments]
  );

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.is_read).length,
    [notifications]
  );

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Tổng quan tài khoản thuê xe"
        subtitle="Theo dõi nhanh yêu cầu thuê, hợp đồng, thanh toán và thông báo trong cổng người thuê."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Yêu cầu thuê" value={requests.length} icon={ClipboardList} subtitle="Tổng yêu cầu của bạn" />
        <StatCard title="Hợp đồng" value={contracts.length} icon={FileCheck2} subtitle="Đang theo dõi" />
        <StatCard title="Đã thanh toán" value={formatCurrency(paidAmount)} icon={Wallet} subtitle="Giao dịch hoàn tất" />
        <StatCard title="Thông báo chưa đọc" value={unreadCount} icon={Bell} subtitle="Cập nhật mới" />
      </div>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
          <h3 className="text-lg font-semibold text-white">Yêu cầu gần đây</h3>
          <div className="mt-3 space-y-2">
            {requests.slice(0, 5).map((item) => (
              <div key={item._id} className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-slate-200">
                <span>#{String(item._id || '').slice(-6)}</span>
                <StatusBadge status={item.status} />
              </div>
            ))}
            {!requests.length ? <p className="text-sm text-slate-400">Chưa có yêu cầu thuê gần đây.</p> : null}
          </div>
        </article>

        <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
          <h3 className="text-lg font-semibold text-white">Thông báo mới</h3>
          <div className="mt-3 space-y-2">
            {notifications.slice(0, 5).map((item) => (
              <div key={item._id} className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-slate-200">
                <p className="font-medium text-white">{item.title || 'Thông báo hệ thống'}</p>
                <p className="mt-1 line-clamp-2 text-xs text-slate-400">{item.message || 'Chưa cập nhật nội dung.'}</p>
              </div>
            ))}
            {!notifications.length ? <p className="text-sm text-slate-400">Chưa có thông báo nào.</p> : null}
          </div>
        </article>
      </section>
    </div>
  );
}
