import React, { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Shield, Sparkles } from 'lucide-react';
import { vehicleApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import CarCard from '../../components/car/CarCard';
import SectionHeader from '../../components/common/SectionHeader';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { CITY_OPTIONS, getDistrictOptions } from '../../constants/locationOptions';
import { VEHICLE_TYPE_FILTER_OPTIONS } from '../../constants/vehicle';
import { pickArray } from '../../utils/formatters';
import { getOwnerCta } from '../../utils/ownerCta';

const howSteps = [
  {
    title: 'Tìm phương tiện phù hợp',
    description: 'Lọc theo thành phố, quận huyện, mức giá, nhiên liệu và hộp số theo nhu cầu di chuyển.'
  },
  {
    title: 'Gửi yêu cầu thuê',
    description: 'Theo dõi duyệt yêu cầu, hợp đồng và thanh toán trong một luồng thống nhất.'
  },
  {
    title: 'Nhận xe và trả xe an toàn',
    description: 'Dùng quy trình kiểm tra xe, theo dõi hành trình và xử lý tranh chấp minh bạch.'
  }
];

const trustFeatures = [
  'Theo dõi hợp đồng điện tử theo từng yêu cầu thuê',
  'Minh bạch dòng tiền cọc, hoàn cọc và bồi thường',
  'Kiểm tra xe khi nhận và trả có ảnh đối chiếu',
  'Giám sát GPS và cảnh báo vượt phạm vi',
  'Admin xử lý tranh chấp tập trung'
];

export default function LandingPage() {
  const { user, ownerStatus, isAuthenticated, isAdmin } = useAuth();
  const [videoFailed, setVideoFailed] = useState(false);
  const [featuredCars, setFeaturedCars] = useState([]);
  const [loadingCars, setLoadingCars] = useState(true);
  const [heroSearch, setHeroSearch] = useState({
    city: 'TP.HCM',
    district: '',
    start_date: '',
    end_date: '',
    vehicle_type: ''
  });

  useEffect(() => {
    const loadFeaturedCars = async () => {
      setLoadingCars(true);
      try {
        const response = await vehicleApi.getAvailable({ page: 1, limit: 6 });
        setFeaturedCars(pickArray(response.data).slice(0, 6));
      } catch {
        setFeaturedCars([]);
      } finally {
        setLoadingCars(false);
      }
    };

    loadFeaturedCars();
  }, []);

  const districtOptions = useMemo(() => getDistrictOptions(heroSearch.city), [heroSearch.city]);

  const searchHref = useMemo(() => {
    const params = new URLSearchParams();
    if (heroSearch.city) params.set('city', heroSearch.city);
    if (heroSearch.district) params.set('district', heroSearch.district);
    if (heroSearch.start_date) params.set('start_date', heroSearch.start_date);
    if (heroSearch.end_date) params.set('end_date', heroSearch.end_date);
    if (heroSearch.vehicle_type) params.set('vehicle_type', heroSearch.vehicle_type);
    const query = params.toString();
    return query ? `/vehicles?${query}` : '/vehicles';
  }, [heroSearch]);

  const ownerCta = useMemo(() => getOwnerCta(user, ownerStatus), [user, ownerStatus]);

  if (isAuthenticated && isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <div className="space-y-16 pb-8">
      <section className="relative overflow-hidden rounded-3xl border border-white/10">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-cyan-400/20 blur-[120px]" />
        <div className="absolute right-0 top-1/3 h-72 w-72 rounded-full bg-blue-500/20 blur-[120px]" />
        <div className="relative h-[620px] w-full bg-slate-950">
          {!videoFailed ? (
            <video
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 h-full w-full object-cover"
              onError={() => setVideoFailed(true)}
            >
              <source src="/videos/car-hero.mp4" type="video/mp4" />
            </video>
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.22),transparent_45%),radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.24),transparent_40%),linear-gradient(130deg,#020617_0%,#0f172a_45%,#0a1f44_100%)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-blue-950/65 to-slate-900/85" />

          <div className="relative z-10 flex h-full flex-col justify-between p-6 md:p-10">
            <div className="max-w-3xl space-y-5">
              <p className="inline-flex items-center gap-2 rounded-full border border-cyan-300/35 bg-cyan-500/10 px-4 py-1 text-xs uppercase tracking-[0.22em] text-cyan-100">
                <Sparkles className="h-3.5 w-3.5" /> Nền tảng di chuyển P2P cao cấp
              </p>
              <h1 className="text-4xl font-black leading-tight text-white md:text-6xl">
                Premium P2P Vehicle Rental Platform
              </h1>
              <p className="max-w-2xl text-base text-slate-200 md:text-lg">
                Thuê xe, cho thuê xe và quản lý hợp đồng minh bạch trên một nền tảng duy nhất.
                Tối ưu vận hành bằng theo dõi hành trình, kiểm tra xe và xử lý tranh chấp.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/vehicles"
                  className="inline-flex items-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:scale-[1.02] hover:bg-cyan-300"
                >
                  Khám phá phương tiện
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to={ownerCta.to}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
                >
                  {ownerCta.label}
                </Link>
                <Link
                  to="/ai-assistant"
                  className="inline-flex items-center gap-2 rounded-2xl border border-violet-300/30 bg-violet-500/20 px-5 py-3 text-sm font-semibold text-violet-100 transition hover:bg-violet-500/30"
                >
                  Mở AI Assistant
                </Link>
              </div>
            </div>

            <div className="grid gap-3 rounded-2xl border border-white/15 bg-slate-950/55 p-4 backdrop-blur md:grid-cols-6">
              <select
                value={heroSearch.city}
                onChange={(event) =>
                  setHeroSearch((prev) => ({ ...prev, city: event.target.value, district: '' }))
                }
                className="rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-white outline-none"
              >
                {CITY_OPTIONS.filter((item) => item.value).map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>

              <select
                value={heroSearch.district}
                onChange={(event) =>
                  setHeroSearch((prev) => ({ ...prev, district: event.target.value }))
                }
                className="rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-white outline-none"
              >
                {districtOptions.map((item) => (
                  <option key={item.value || 'ALL_DISTRICT'} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>

              <input
                type="date"
                value={heroSearch.start_date}
                onChange={(event) =>
                  setHeroSearch((prev) => ({ ...prev, start_date: event.target.value }))
                }
                className="rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-white outline-none"
              />
              <input
                type="date"
                value={heroSearch.end_date}
                onChange={(event) =>
                  setHeroSearch((prev) => ({ ...prev, end_date: event.target.value }))
                }
                className="rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-white outline-none"
              />

              <select
                value={heroSearch.vehicle_type}
                onChange={(event) =>
                  setHeroSearch((prev) => ({ ...prev, vehicle_type: event.target.value }))
                }
                className="rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-white outline-none"
              >
                <option value="">Tất cả loại phương tiện</option>
                {VEHICLE_TYPE_FILTER_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>

              <Link
                to={searchHref}
                className="flex items-center justify-center rounded-xl bg-cyan-500 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                Tìm phương tiện
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works">
        <SectionHeader
          title="Cách hoạt động"
          subtitle="Luồng rõ ràng cho người thuê và chủ xe, từ yêu cầu thuê đến hoàn tất hợp đồng."
        />
        <div className="grid gap-4 md:grid-cols-3">
          {howSteps.map((step, index) => (
            <div key={step.title} className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
              <p className="mb-3 text-xs uppercase tracking-[0.2em] text-cyan-300">Bước {index + 1}</p>
              <h3 className="text-lg font-semibold text-white">{step.title}</h3>
              <p className="mt-2 text-sm text-slate-300">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
        <SectionHeader
          title="Tin cậy và an toàn"
          subtitle="Thiết kế cho vận hành minh bạch giữa người thuê, chủ xe và quản trị hệ thống."
        />
        <ul className="grid gap-2 text-sm text-slate-200 md:grid-cols-2">
          {trustFeatures.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <Shield className="mt-0.5 h-4 w-4 text-cyan-300" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <SectionHeader
          title="Phương tiện nổi bật"
          subtitle="Các xe phổ biến đang sẵn sàng cho giai đoạn triển khai tại thành phố trọng điểm."
        />
        {loadingCars ? (
          <LoadingSkeleton rows={3} />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {featuredCars.map((vehicle) => (
              <CarCard key={vehicle._id} vehicle={vehicle} to={`/vehicles/${vehicle._id}`} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
