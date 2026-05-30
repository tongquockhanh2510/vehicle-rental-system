import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BadgeCheck,
  Bell,
  ClipboardList,
  FileText,
  User,
  Wallet,
} from "lucide-react";
import { contractApi, notificationApi, paymentApi, rentalApi } from "../../api";
import EmptyState from "../../components/common/EmptyState";
import LoadingSkeleton from "../../components/common/LoadingSkeleton";
import RoleBadge from "../../components/common/RoleBadge";
import SectionHeader from "../../components/common/SectionHeader";
import StatusBadge from "../../components/common/StatusBadge";
import { useAuth } from "../../context/AuthContext";
import { formatCurrency, pickArray } from "../../utils/formatters";
import { getOwnerCta } from "../../utils/ownerCta";

function mapOwnerStatusBadge(ownerStatus) {
  if (ownerStatus === "APPROVED") return "OWNER_APPROVED";
  if (ownerStatus === "PENDING") return "OWNER_PENDING";
  if (ownerStatus === "REJECTED") return "OWNER_REJECTED";
  return "OWNER_NONE";
}

export default function ProfilePage() {
  const { user, role, ownerStatus, isOwnerApproved } = useAuth();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [payments, setPayments] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const ownerBadgeStatus = useMemo(
    () => mapOwnerStatusBadge(ownerStatus),
    [ownerStatus],
  );
  const ownerAction = useMemo(
    () => getOwnerCta(user, ownerStatus),
    [user, ownerStatus],
  );

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const [reqRes, contractRes, paymentRes, notiRes] = await Promise.allSettled([
          rentalApi.getRenterRequests(),
          contractApi.getRenterContracts(),
          paymentApi.getRenterPayments(),
          notificationApi.getMine(),
        ]);

        if (reqRes.status === "fulfilled") setRequests(pickArray(reqRes.value.data));
        if (contractRes.status === "fulfilled")
          setContracts(pickArray(contractRes.value.data));
        if (paymentRes.status === "fulfilled")
          setPayments(pickArray(paymentRes.value.data));
        if (notiRes.status === "fulfilled")
          setNotifications(pickArray(notiRes.value.data));
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const pendingRequests = useMemo(
    () =>
      requests.filter((item) => String(item.status || "").toUpperCase() === "PENDING")
        .length,
    [requests],
  );
  const activeContracts = useMemo(
    () =>
      contracts.filter((item) =>
        ["ACTIVE", "CONFIRMED", "APPROVED"].includes(
          String(item.status || "").toUpperCase(),
        ),
      ).length,
    [contracts],
  );
  const totalPaid = useMemo(
    () =>
      payments
        .filter((item) => String(item.status || "").toUpperCase() === "COMPLETED")
        .reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [payments],
  );
  const unreadNotifications = useMemo(
    () =>
      notifications.filter((item) => !item.is_read && item.read !== true).length,
    [notifications],
  );

  const recentActivities = useMemo(() => {
    const rentalRows = requests.slice(0, 2).map((item) => ({
      key: `rental-${item._id}`,
      type: "Yêu cầu thuê",
      title: `${item.brand || ""} ${item.model || ""}`.trim() || `Xe #${item.vehicle_id}`,
      status: item.status || "PENDING",
      date: item.created_at || item.updated_at,
      href: "/app/requests",
    }));

    const contractRows = contracts.slice(0, 2).map((item) => ({
      key: `contract-${item._id}`,
      type: "Hợp đồng",
      title: item.contract_code || `HĐ #${String(item._id || "").slice(-6)}`,
      status: item.status || "PENDING",
      date: item.created_at || item.updated_at,
      href: "/app/contracts",
    }));

    return [...rentalRows, ...contractRows].slice(0, 4);
  }, [requests, contracts]);

  if (loading) {
    return <LoadingSkeleton rows={4} />;
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Hồ sơ người thuê"
        subtitle="Theo dõi thông tin tài khoản và toàn bộ hành trình thuê xe của bạn."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 p-2">
              <User className="h-5 w-5 text-cyan-200" />
            </div>
            <div>
              <p className="text-lg font-semibold text-white">
                {`${user?.first_name || ""} ${user?.last_name || ""}`.trim() ||
                  "Chưa cập nhật"}
              </p>
              <p className="text-sm text-slate-300">
                {user?.email || "Chưa cập nhật email"}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 text-sm text-slate-200 md:grid-cols-2">
            <p>
              Số điện thoại:{" "}
              <span className="font-semibold text-white">
                {user?.phone || "Chưa cập nhật"}
              </span>
            </p>
            <p>
              Mã người dùng:{" "}
              <span className="font-semibold text-white">
                {String(user?._id || user?.id || "--").slice(-8)}
              </span>
            </p>
            <p className="flex items-center gap-2">
              Vai trò: <RoleBadge role={role} ownerStatus={ownerStatus} />
            </p>
            <p className="flex items-center gap-2">
              Hồ sơ chủ xe: <StatusBadge status={ownerBadgeStatus} />
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              to={ownerAction.to}
              className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950"
            >
              {ownerAction.label}
            </Link>
            {isOwnerApproved ? (
              <Link
                to="/owner/dashboard"
                className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-200"
              >
                Đi tới Cổng chủ xe
              </Link>
            ) : null}
          </div>
        </article>

        <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
          <h3 className="text-lg font-semibold text-white">Tổng quan thuê xe</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-slate-950/40 p-3">
              <p className="text-xs text-slate-400">Yêu cầu đang chờ</p>
              <p className="mt-1 text-2xl font-bold text-white">{pendingRequests}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-950/40 p-3">
              <p className="text-xs text-slate-400">Hợp đồng đang hoạt động</p>
              <p className="mt-1 text-2xl font-bold text-white">{activeContracts}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-950/40 p-3">
              <p className="text-xs text-slate-400">Đã thanh toán</p>
              <p className="mt-1 text-2xl font-bold text-cyan-300">
                {formatCurrency(totalPaid)}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-950/40 p-3">
              <p className="text-xs text-slate-400">Thông báo chưa đọc</p>
              <p className="mt-1 text-2xl font-bold text-white">
                {unreadNotifications}
              </p>
            </div>
          </div>
        </article>
      </div>

      <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Hoạt động gần đây</h3>
          <div className="flex gap-2 text-xs">
            <Link
              to="/app/requests"
              className="rounded-lg border border-white/15 px-2 py-1 text-slate-200"
            >
              Yêu cầu thuê
            </Link>
            <Link
              to="/app/contracts"
              className="rounded-lg border border-white/15 px-2 py-1 text-slate-200"
            >
              Hợp đồng
            </Link>
            <Link
              to="/app/payments"
              className="rounded-lg border border-white/15 px-2 py-1 text-slate-200"
            >
              Thanh toán
            </Link>
            <Link
              to="/app/notifications"
              className="rounded-lg border border-white/15 px-2 py-1 text-slate-200"
            >
              Thông báo
            </Link>
          </div>
        </div>

        {recentActivities.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="Chưa có hoạt động thuê xe"
            description="Sau khi gửi yêu cầu thuê, hợp đồng và trạng thái thanh toán sẽ hiển thị tại đây."
            action={
              <Link
                to="/app/explore"
                className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950"
              >
                Khám phá phương tiện
              </Link>
            }
          />
        ) : (
          <div className="space-y-2">
            {recentActivities.map((item) => (
              <Link
                key={item.key}
                to={item.href}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/40 p-3 transition hover:bg-slate-900"
              >
                <div>
                  <p className="text-xs text-slate-400">{item.type}</p>
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                </div>
                <StatusBadge status={item.status} />
              </Link>
            ))}
          </div>
        )}

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <Link
            to="/app/requests"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10"
          >
            <ClipboardList className="h-4 w-4 text-cyan-300" />
            Xem yêu cầu thuê
          </Link>
          <Link
            to="/app/contracts"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10"
          >
            <FileText className="h-4 w-4 text-cyan-300" />
            Xem hợp đồng
          </Link>
          <Link
            to="/app/payments"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10"
          >
            <Wallet className="h-4 w-4 text-cyan-300" />
            Xem thanh toán
          </Link>
        </div>

        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <Link
            to="/app/inspections"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10"
          >
            <BadgeCheck className="h-4 w-4 text-cyan-300" />
            Kiểm tra xe
          </Link>
          <Link
            to="/app/notifications"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10"
          >
            <Bell className="h-4 w-4 text-cyan-300" />
            Trung tâm thông báo
          </Link>
        </div>
      </section>
    </div>
  );
}
