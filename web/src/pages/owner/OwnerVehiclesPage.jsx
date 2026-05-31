import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CarFront, Plus } from "lucide-react";
import { vehicleApi } from "../../api";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import EmptyState from "../../components/common/EmptyState";
import LoadingSkeleton from "../../components/common/LoadingSkeleton";
import SectionHeader from "../../components/common/SectionHeader";
import StatusBadge from "../../components/common/StatusBadge";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { formatCurrency, pickArray } from "../../utils/formatters";
import { resolveImage } from "../../utils/image";

export default function OwnerVehiclesPage() {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const { pushToast } = useToast();

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [targetDelete, setTargetDelete] = useState(null);

  const loadVehicles = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const response = await vehicleApi.getOwnerVehicles(userId);
      setVehicles(pickArray(response.data));
    } catch {
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, [userId]);

  const toggleAvailability = async (vehicle) => {
    try {
      await vehicleApi.updateAvailability(vehicle._id, !vehicle.is_available);
      pushToast({
        tone: "success",
        title: "Đã cập nhật khả dụng",
        message: "Trạng thái xe đã được cập nhật.",
      });
      loadVehicles();
    } catch (error) {
      pushToast({
        tone: "error",
        title: "Cập nhật thất bại",
        message:
          error?.response?.data?.error || "Không thể cập nhật trạng thái xe.",
      });
    }
  };

  const deleteVehicle = async () => {
    if (!targetDelete) return;
    try {
      await vehicleApi.delete(targetDelete._id);
      pushToast({
        tone: "success",
        title: "Đã gỡ xe",
        message: "Tin đăng xe đã được xóa.",
      });
      setTargetDelete(null);
      loadVehicles();
    } catch (error) {
      pushToast({
        tone: "error",
        title: "Xóa thất bại",
        message: error?.response?.data?.error || "Không thể xóa xe này.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Xe của tôi"
        subtitle="Quản lý danh sách xe cho thuê, trạng thái sẵn sàng, giá thuê và hiệu suất đặt xe."
        action={
          <Link
            to="/owner/vehicles/new"
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            <Plus className="h-4 w-4" />
            Thêm xe mới
          </Link>
        }
      />

      {loading ? (
        <LoadingSkeleton rows={4} />
      ) : vehicles.length === 0 ? (
        <EmptyState
          icon={CarFront}
          title="Bạn chưa có xe nào"
          description="Đăng xe đầu tiên để bắt đầu nhận lượt đặt và tạo doanh thu từ tài sản nhàn rỗi."
          action={
            <button
              type="button"
              onClick={() => navigate("/owner/vehicles/new")}
              className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950"
            >
              Đăng xe đầu tiên
            </button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {vehicles.map((vehicle) => (
            <article
              key={vehicle._id}
              className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60"
            >
              <img
                src={resolveImage(
                  vehicle.images?.[0],
                  Number(vehicle.year) || 0,
                )}
                alt={`${vehicle.brand} ${vehicle.model}`}
                className="h-48 w-full object-cover"
                onError={(event) => {
                  event.currentTarget.src = resolveImage(
                    "",
                    Number(vehicle.year) || 0,
                  );
                }}
              />
              <div className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {vehicle.brand} {vehicle.model}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {vehicle.year} • {vehicle.license_plate}
                    </p>
                  </div>
                  <StatusBadge
                    status={
                      vehicle.is_available
                        ? "AVAILABLE"
                        : String(vehicle.status || "PENDING").toUpperCase()
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                  <p>
                    Giá/ngày:{" "}
                    <span className="font-semibold text-cyan-300">
                      {formatCurrency(vehicle.daily_rate)}
                    </span>
                  </p>
                  <p>
                    Tiền cọc:{" "}
                    <span className="font-semibold text-white">
                      {formatCurrency(vehicle.deposit_amount)}
                    </span>
                  </p>
                  <p>
                    Lượt đặt:{" "}
                    <span className="font-semibold text-white">
                      {vehicle.booking_count || 0}
                    </span>
                  </p>
                  <p>
                    Doanh thu:{" "}
                    <span className="font-semibold text-white">
                      {formatCurrency(vehicle.revenue || 0)}
                    </span>
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/owner/vehicles/${vehicle._id}/edit`)
                    }
                    className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-slate-200 transition hover:bg-white/10"
                  >
                    Chỉnh sửa
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleAvailability(vehicle)}
                    className="rounded-lg border border-blue-400/30 bg-blue-500/10 px-3 py-1.5 text-xs text-blue-200 transition hover:bg-blue-500/20"
                  >
                    {vehicle.is_available
                      ? "Tạm dừng hiển thị"
                      : "Mở lại hiển thị"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetDelete(vehicle)}
                    className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-1.5 text-xs text-rose-200 transition hover:bg-rose-500/20"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(targetDelete)}
        onCancel={() => setTargetDelete(null)}
        onConfirm={deleteVehicle}
        title="Xóa tin đăng xe"
        description={`Bạn có chắc muốn xóa xe ${targetDelete?.brand || ""} ${targetDelete?.model || ""}? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        danger
      />
    </div>
  );
}
