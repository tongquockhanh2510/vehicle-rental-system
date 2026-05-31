import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Bot, CarFront, ClipboardList, FileCheck2, Wallet } from 'lucide-react';
import { aiAgentApi, contractApi, notificationApi, paymentApi, rentalApi } from '../../api';
import EmptyState from '../../components/common/EmptyState';
import SectionHeader from '../../components/common/SectionHeader';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import { formatCurrency, pickArray } from '../../utils/formatters';
import { getFallbackCarImage, getVehicleMainImage } from '../../utils/image';
import { getRentalBillPayload, normalizeRentalStatus } from '../../utils/rentalBill';

export default function AppOverviewPage() {
  const [requests, setRequests] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [payments, setPayments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [aiSummary, setAiSummary] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

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

  useEffect(() => {
    const runAiSummary = async () => {
      if (!requests.length) {
        setAiSummary('');
        return;
      }

      setAiLoading(true);
      try {
        const response = await aiAgentApi.summarizeRenterJourney({
          requests: requests.slice(0, 12),
          contracts: contracts.slice(0, 12),
          payments: payments.slice(0, 12)
        });
        setAiSummary(response?.data?.summary || '');
      } catch {
        setAiSummary('');
      } finally {
        setAiLoading(false);
      }
    };

    runAiSummary();
  }, [requests, contracts, payments]);

  const paidAmount = useMemo(
    () =>
      payments
        .filter((item) => String(item.status || '').toUpperCase() === 'COMPLETED')
        .reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [payments]
  );

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.is_read).length,
    [notifications]
  );

  const recentRentals = useMemo(
    () =>
      [...requests]
        .sort(
          (a, b) =>
            new Date(b?.updated_at || b?.created_at || 0).getTime() -
            new Date(a?.updated_at || a?.created_at || 0).getTime()
        )
        .slice(0, 4),
    [requests]
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
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Phương tiện bạn đã thuê</h3>
            <Link
              to="/app/requests"
              className="text-xs font-semibold text-cyan-200 transition hover:text-cyan-100"
            >
              Xem tất cả
            </Link>
          </div>

          {recentRentals.length ? (
            <div className="space-y-2">
              {recentRentals.map((item) => {
                const bill = getRentalBillPayload(item);
                const title = `${bill?.vehicle?.brand || ''} ${bill?.vehicle?.model || ''}`.trim();
                const mainImage =
                  getVehicleMainImage(item) ||
                  getVehicleMainImage(item?.vehicle_snapshot) ||
                  getFallbackCarImage();

                return (
                  <Link
                    key={item._id}
                    to="/app/requests"
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 transition hover:bg-slate-900/70"
                  >
                    <img
                      src={mainImage}
                      alt={title || 'Phương tiện thuê'}
                      className="h-14 w-20 rounded-lg object-cover"
                      onError={(event) => {
                        event.currentTarget.src = getFallbackCarImage();
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">
                        {title || `Xe #${String(item?.vehicle_id || '').slice(-6)}`}
                      </p>
                      <p className="truncate text-xs text-slate-400">
                        Nhận xe: {bill?.vehicle?.pickup_location || 'Chưa cập nhật'}
                      </p>
                    </div>
                    <StatusBadge status={normalizeRentalStatus(item?.status)} />
                  </Link>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={CarFront}
              title="Bạn chưa có lượt thuê nào"
              description="Sau khi gửi yêu cầu thuê xe, thông tin phương tiện sẽ hiển thị tại đây."
              action={
                <Link
                  to="/app/explore"
                  className="rounded-xl bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-slate-950"
                >
                  Khám phá phương tiện
                </Link>
              }
            />
          )}
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

      <section className="rounded-2xl border border-violet-400/20 bg-violet-500/10 p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="inline-flex items-center gap-2 text-lg font-semibold text-white">
            <Bot className="h-4.5 w-4.5 text-violet-200" />
            AI Trợ lý hành trình thuê xe
          </h3>
          <Link
            to="/app/requests"
            className="text-xs font-semibold text-violet-200 transition hover:text-violet-100"
          >
            Xem yêu cầu thuê
          </Link>
        </div>
        <p className="mt-2 text-sm text-violet-100/90">
          {aiLoading
            ? 'AI đang phân tích lịch sử yêu cầu thuê của bạn...'
            : aiSummary || 'AI sẽ đưa ra tóm tắt và gợi ý ngay khi bạn có dữ liệu thuê xe thực tế.'}
        </p>
      </section>
    </div>
  );
}
