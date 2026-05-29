import React, { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Globe2,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
  Wallet
} from 'lucide-react';
import { vehicleApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import CarCard from '../../components/car/CarCard';
import SectionHeader from '../../components/common/SectionHeader';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { CITY_OPTIONS, getDistrictOptions } from '../../constants/locationOptions';
import { VEHICLE_TYPE_OPTIONS } from '../../constants/vehicle';
import { pickArray } from '../../utils/formatters';
import { getOwnerCta } from '../../utils/ownerCta';

const howSteps = [
  {
    title: 'Tìm xe phù hợp',
    description: 'Lọc theo giá, hộp số, nhiên liệu và địa điểm cho từng nhu cầu di chuyển.'
  },
  {
    title: 'Gửi yêu cầu thuê',
    description: 'Dòng thời gian minh bạch, hợp đồng số và chi phí rõ ràng kèm phí hệ thống.'
  },
  {
    title: 'Nhận xe và di chuyển an toàn',
    description: 'Quy trình kiểm tra xe, theo dõi và tranh chấp bảo vệ cả người thuê lẫn chủ xe.'
  }
];

const trustFeatures = [
  'Hợp đồng được theo dõi đầy đủ cho từng lượt thuê',
  'Quy trình đặt cọc và hoàn cọc minh bạch',
  'Kiểm tra nhận/trả xe kèm ảnh bằng chứng',
  'Theo dõi GPS với cảnh báo vượt phạm vi',
  'Khiếu nại và bồi thường do quản trị viên xử lý'
];

const platformMetrics = [
  { label: 'Xe đang hoạt động', value: '1,680+' },
  { label: 'Lượt thuê hoàn tất', value: '42,000+' },
  { label: 'Tổng GMV nền tảng', value: '8.9B VND' },
  { label: 'Đánh giá trung bình', value: '4.8/5' },
  { label: 'Tỷ lệ tranh chấp', value: '< 1.5%' }
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

  const glowNodes = useMemo(
    () => (
      <>
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-cyan-400/25 blur-[120px]" />
        <div className="absolute right-0 top-1/3 h-72 w-72 rounded-full bg-blue-500/20 blur-[120px]" />
        <div className="absolute bottom-[-80px] left-1/3 h-60 w-60 rounded-full bg-indigo-500/20 blur-[100px]" />
      </>
    ),
    []
  );
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
    <div className="space-y-20 pb-8">
      <section className="relative overflow-hidden rounded-3xl border border-white/10">
        {glowNodes}
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
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.24),transparent_45%),radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.28),transparent_40%),linear-gradient(130deg,#020617_0%,#0f172a_45%,#0a1f44_100%)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-blue-950/65 to-slate-900/85" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:48px_48px] opacity-25" />

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
                Tối ưu vận hành bằng theo dõi hành trình, kiểm tra xe và xử lý tranh chấp đạt chuẩn quốc tế.
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
              </div>
            </div>

            <div className="grid gap-3 rounded-2xl border border-white/15 bg-slate-950/50 p-4 backdrop-blur md:grid-cols-6">
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
                onChange={(event) => setHeroSearch((prev) => ({ ...prev, district: event.target.value }))}
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
                onChange={(event) => setHeroSearch((prev) => ({ ...prev, start_date: event.target.value }))}
                className="rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-white outline-none"
              />
              <input
                type="date"
                value={heroSearch.end_date}
                onChange={(event) => setHeroSearch((prev) => ({ ...prev, end_date: event.target.value }))}
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
                {VEHICLE_TYPE_OPTIONS.filter((item) => item.value !== 'OTHER').map((item) => (
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
          subtitle="Luồng đặt xe, hợp đồng và bảo vệ giao dịch được chuẩn hóa cho cả người thuê và chủ xe."
        />
        <div className="grid gap-4 md:grid-cols-3">
          {howSteps.map((step, index) => (
            <div
              key={step.title}
              className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 shadow-xl backdrop-blur"
            >
              <p className="mb-3 text-xs uppercase tracking-[0.2em] text-cyan-300">Bước {index + 1}</p>
              <h3 className="text-lg font-semibold text-white">{step.title}</h3>
              <p className="mt-2 text-sm text-slate-300">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="for-owners" className="grid gap-5 lg:grid-cols-2">
        <article className="rounded-2xl border border-blue-400/25 bg-blue-500/10 p-6">
          <h3 className="text-2xl font-bold text-white">Dành cho chủ xe</h3>
          <p className="mt-2 text-sm text-blue-100/90">
            Tối ưu doanh thu đội xe với lịch đặt, theo dõi hợp đồng, cảnh báo hành trình và thống kê lợi nhuận.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-slate-200">
            <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" /> Giá thuê linh hoạt + kiểm soát khả dụng</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" /> Luồng xử lý yêu cầu thuê tự động</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" /> Hỗ trợ theo dõi hành trình và tranh chấp</li>
          </ul>
        </article>

        <article className="rounded-2xl border border-cyan-400/25 bg-cyan-500/10 p-6">
          <h3 className="text-2xl font-bold text-white">Dành cho người thuê</h3>
          <p className="mt-2 text-sm text-cyan-100/90">
            Chọn xe phù hợp, đặt lịch linh hoạt, thanh toán minh bạch và quản lý hợp đồng ngay trong một bảng điều khiển.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-slate-200">
            <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" /> Đặt xe nhanh với lịch trống thời gian thực</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" /> Hợp đồng số và dòng thời gian kiểm tra xe</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" /> Quy trình hoàn cọc và hỗ trợ minh bạch</li>
          </ul>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
          <SectionHeader
            title="An toàn và tin cậy"
            subtitle="Kiến trúc nghiệp vụ đảm bảo tính minh bạch và an toàn cho toàn bộ vòng đời thuê xe."
          />
          <ul className="space-y-3 text-sm text-slate-200">
            {trustFeatures.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <Shield className="mt-0.5 h-4 w-4 text-cyan-300" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
          <SectionHeader title="Chỉ số nền tảng" subtitle="Dữ liệu vận hành theo thời gian thực ở quy mô sàn giao dịch." />
          <div className="space-y-3">
            {platformMetrics.map((metric) => (
              <div key={metric.label} className="rounded-xl border border-white/10 bg-slate-950/40 p-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{metric.label}</p>
                <p className="mt-1 text-xl font-bold text-white">{metric.value}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section>
        <SectionHeader
          title="Xe nổi bật"
          subtitle="Danh sách xe nổi bật phù hợp cho chuyến công tác, gia đình hoặc roadtrip dài ngày."
          action={
            <Link to="/vehicles" className="text-sm font-semibold text-cyan-300 transition hover:text-cyan-200">
              Xem tất cả xe
            </Link>
          }
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

      <footer className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
        <div className="grid gap-6 md:grid-cols-4">
          <div>
            <h4 className="text-lg font-semibold text-white">RentCar Premium</h4>
            <p className="mt-2 text-sm text-slate-300">Nền tảng thuê xe P2P cho người thuê, chủ xe và quản trị viên với luồng nghiệp vụ đầy đủ.</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Thị trường</p>
            <ul className="mt-2 space-y-1 text-sm text-slate-300">
              <li className="flex items-center gap-2"><Users className="h-3.5 w-3.5" /> Hồ sơ người dùng đã xác thực</li>
              <li className="flex items-center gap-2"><Wallet className="h-3.5 w-3.5" /> Luồng thanh toán có kiểm soát</li>
              <li className="flex items-center gap-2"><Globe2 className="h-3.5 w-3.5" /> Giai đoạn đầu tại TP.HCM và Hà Nội, mở rộng theo khu vực</li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Vận hành</p>
            <ul className="mt-2 space-y-1 text-sm text-slate-300">
              <li>Dịch vụ hợp đồng</li>
              <li>Theo dõi & kiểm tra xe</li>
              <li>Xử lý tranh chấp</li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Phân tích quản trị</p>
            <ul className="mt-2 space-y-1 text-sm text-slate-300">
              <li className="flex items-center gap-2"><TrendingUp className="h-3.5 w-3.5" /> Bảng điều khiển doanh thu</li>
              <li>Theo dõi phí hệ thống</li>
              <li>Kiểm soát rủi ro & cảnh báo</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
