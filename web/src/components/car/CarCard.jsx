import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BadgeCheck,
  Bike,
  CarFront,
  Fuel,
  Gauge,
  MapPin,
  Star,
  Truck,
  Users,
  Zap,
} from "lucide-react";
import StatusBadge from "../common/StatusBadge";
import { formatCurrency } from "../../utils/formatters";
import { getVehicleImage } from "../../utils/image";
import VehicleTypeBadge from "../common/VehicleTypeBadge";
import {
  getFuelTypeLabel,
  getTransmissionLabel,
  normalizeVehicleTypeValue,
} from "../../constants/vehicle";

const PLACEHOLDER_META = {
  CAR: { label: "Ảnh ô tô đang cập nhật", Icon: CarFront },
  MOTORCYCLE: { label: "Ảnh xe máy đang cập nhật", Icon: Bike },
  ELECTRIC: { label: "Ảnh xe điện đang cập nhật", Icon: Zap },
  BICYCLE: { label: "Ảnh xe đạp đang cập nhật", Icon: Bike },
  PICKUP_TRUCK: { label: "Ảnh xe bán tải đang cập nhật", Icon: Truck },
  SEVEN_SEATER: { label: "Ảnh xe 7 chỗ đang cập nhật", Icon: Users },
  DEFAULT: { label: "Ảnh phương tiện đang cập nhật", Icon: CarFront },
};

function getImagePlaceholderMeta(vehicle) {
  const normalizedType = normalizeVehicleTypeValue(vehicle?.vehicle_type);
  const fuelType = String(vehicle?.fuel_type || "").toUpperCase();

  if (fuelType === "ELECTRIC" || normalizedType === "ELECTRIC") {
    return PLACEHOLDER_META.ELECTRIC;
  }
  if (normalizedType === "MOTORCYCLE") return PLACEHOLDER_META.MOTORCYCLE;
  if (normalizedType === "BICYCLE" || normalizedType === "MOUNTAIN_BIKE") {
    return PLACEHOLDER_META.BICYCLE;
  }
  if (normalizedType === "PICKUP_TRUCK" || normalizedType === "MINI_TRUCK") {
    return PLACEHOLDER_META.PICKUP_TRUCK;
  }
  if (
    normalizedType === "SEVEN_SEATER" ||
    normalizedType === "SEVEN_SEAT_CAR" ||
    normalizedType === "7_SEAT_CAR"
  ) {
    return PLACEHOLDER_META.SEVEN_SEATER;
  }
  if (
    ["CAR", "SUV", "LUXURY_CAR", "SELF_DRIVE_CAR", "WITH_DRIVER_CAR"].includes(
      normalizedType,
    )
  ) {
    return PLACEHOLDER_META.CAR;
  }
  return PLACEHOLDER_META.DEFAULT;
}

function VehicleImagePlaceholder({ vehicle }) {
  const { Icon, label } = getImagePlaceholderMeta(vehicle);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-[radial-gradient(circle_at_25%_25%,rgba(34,211,238,0.18),transparent_48%),radial-gradient(circle_at_75%_15%,rgba(59,130,246,0.12),transparent_45%),linear-gradient(135deg,rgba(2,6,23,0.95),rgba(15,23,42,0.95))] p-4 text-center">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <Icon className="h-10 w-10 text-cyan-200" />
      </div>
      <p className="mt-3 text-xs font-medium text-slate-300">{label}</p>
    </div>
  );
}

export default function CarCard({ vehicle, to }) {
  const [imageError, setImageError] = useState(false);

  const imageUrl = useMemo(() => getVehicleImage(vehicle), [vehicle]);
  const canShowImage = Boolean(imageUrl) && !imageError;
  const rawStatus = String(vehicle?.status || "").toUpperCase();
  const status = vehicle?.is_available ? "AVAILABLE" : rawStatus || "PENDING";
  const rating = Number(vehicle?.rating || 4.8).toFixed(1);
  const completedTrips = Number(
    vehicle?.completed_trips || vehicle?.booking_count || 0,
  );
  const isPopular = completedTrips >= 12 || Number(rating) >= 4.9;
  const isVerifiedOwner = Boolean(vehicle?.owner_verified ?? true);
  const locationText =
    vehicle?.pickup_location ||
    vehicle?.city ||
    vehicle?.allowed_region ||
    "Chưa cập nhật";

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900/75 shadow-[0_20px_60px_rgba(2,6,23,0.45)] transition hover:-translate-y-1 hover:border-cyan-400/40">
      <div className="relative h-56 w-full overflow-hidden rounded-t-2xl bg-slate-950/80">
        {canShowImage ? (
          <img
            src={imageUrl}
            alt={`${vehicle?.brand || "Phương tiện"} ${vehicle?.model || ""}`.trim()}
            loading="lazy"
            className="h-full w-full object-contain p-3 transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <VehicleImagePlaceholder vehicle={vehicle} />
        )}

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <StatusBadge status={status} />
          {isPopular ? (
            <span className="rounded-full border border-amber-300/40 bg-amber-500/20 px-2 py-1 text-[11px] font-semibold text-amber-100">
              Phổ biến
            </span>
          ) : null}
        </div>
        <div className="absolute right-3 top-3">
          <VehicleTypeBadge type={vehicle?.vehicle_type} />
        </div>
      </div>

      <div className="flex flex-1 flex-col space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold text-white">
              {vehicle?.brand || "Premium"} {vehicle?.model || "Phương tiện"}
            </h3>
            <p className="truncate text-xs text-slate-400">
              {vehicle?.year || "2024"} •{" "}
              {vehicle?.license_plate || "Tin đăng cá nhân"}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-lg font-bold text-cyan-300">
              {formatCurrency(vehicle?.daily_rate || 0)}
            </p>
            <p className="text-xs text-slate-400">/ ngày</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
          <span className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1">
            <Fuel className="h-3.5 w-3.5 text-cyan-300" />
            {getFuelTypeLabel(vehicle?.fuel_type)}
          </span>
          <span className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1">
            <Gauge className="h-3.5 w-3.5 text-cyan-300" />
            {getTransmissionLabel(vehicle?.transmission)}
          </span>
          <span
            className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1"
            title={locationText}
          >
            <MapPin className="h-3.5 w-3.5 text-cyan-300" />
            <span className="truncate">{locationText}</span>
          </span>
          <span className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1">
            <Star className="h-3.5 w-3.5 text-amber-300" />
            {rating}
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
          <p className="text-slate-300">
            Tiền cọc: {formatCurrency(vehicle?.deposit_amount || 0)}
          </p>
          <p className="text-slate-300">
            {completedTrips.toLocaleString("vi-VN")} chuyến hoàn tất
          </p>
          {isVerifiedOwner ? (
            <p className="inline-flex items-center gap-1 text-emerald-200">
              <BadgeCheck className="h-3.5 w-3.5" /> Chủ xe xác thực
            </p>
          ) : null}
        </div>

        <div className="mt-auto flex justify-end pt-2">
          <Link
            to={to}
            className="rounded-xl bg-cyan-500 px-3 py-1.5 text-sm font-semibold text-slate-950 transition hover:scale-[1.02] hover:bg-cyan-400"
          >
            Xem chi tiết
          </Link>
        </div>
      </div>
    </article>
  );
}
