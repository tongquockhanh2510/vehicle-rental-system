import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
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
import CarCard from '../../components/car/CarCard';
import SectionHeader from '../../components/common/SectionHeader';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { pickArray } from '../../utils/formatters';

const howSteps = [
  {
    title: 'Find the right car',
    description: 'Filter by price, transmission, fuel and location to match every trip purpose.'
  },
  {
    title: 'Send rental request',
    description: 'Transparent timelines, digital contracts and clear pricing with system fee visibility.'
  },
  {
    title: 'Pickup and drive safely',
    description: 'Inspection, tracking and dispute workflow protect both renter and vehicle owner.'
  }
];

const trustFeatures = [
  'Legally tracked contracts for every booking',
  'Deposit handling and refund workflow',
  'Pickup/return inspection with evidence photos',
  'GPS tracking with boundary alerts',
  'Admin-managed dispute and compensation process'
];

const platformMetrics = [
  { label: 'Active vehicles', value: '1,680+' },
  { label: 'Completed rentals', value: '42,000+' },
  { label: 'Platform GMV', value: '8.9B VND' },
  { label: 'Average rating', value: '4.8/5' },
  { label: 'Dispute rate', value: '< 1.5%' }
];

export default function LandingPage() {
  const [videoFailed, setVideoFailed] = useState(false);
  const [featuredCars, setFeaturedCars] = useState([]);
  const [loadingCars, setLoadingCars] = useState(true);

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
                <Sparkles className="h-3.5 w-3.5" /> Premium P2P Mobility Platform
              </p>
              <h1 className="text-4xl font-black leading-tight text-white md:text-6xl">
                Premium P2P Car Rental Platform
              </h1>
              <p className="max-w-2xl text-base text-slate-200 md:text-lg">
                Thuê xe, cho thuê xe và quản lý hợp đồng minh bạch trên một nền tảng duy nhất.
                Tối ưu vận hành bằng tracking, inspection và dispute workflow đạt chuẩn quốc tế.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/cars"
                  className="inline-flex items-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:scale-[1.02] hover:bg-cyan-300"
                >
                  Khám phá xe
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/owner/vehicles/new"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
                >
                  Đăng xe cho thuê
                </Link>
              </div>
            </div>

            <div className="grid gap-3 rounded-2xl border border-white/15 bg-slate-950/50 p-4 backdrop-blur md:grid-cols-5">
              <input
                placeholder="Địa điểm"
                className="rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-white outline-none"
              />
              <input
                type="date"
                className="rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-white outline-none"
              />
              <input
                type="date"
                className="rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-white outline-none"
              />
              <select className="rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-white outline-none">
                <option>Loại xe</option>
                <option>Car</option>
                <option>SUV</option>
                <option>Van</option>
              </select>
              <Link
                to="/cars"
                className="flex items-center justify-center rounded-xl bg-cyan-500 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                Tìm xe ngay
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works">
        <SectionHeader
          title="How it works"
          subtitle="Luồng đặt xe, hợp đồng và bảo vệ giao dịch được chuẩn hóa cho cả người thuê và chủ xe."
        />
        <div className="grid gap-4 md:grid-cols-3">
          {howSteps.map((step, index) => (
            <div
              key={step.title}
              className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 shadow-xl backdrop-blur"
            >
              <p className="mb-3 text-xs uppercase tracking-[0.2em] text-cyan-300">Step {index + 1}</p>
              <h3 className="text-lg font-semibold text-white">{step.title}</h3>
              <p className="mt-2 text-sm text-slate-300">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="for-owners" className="grid gap-5 lg:grid-cols-2">
        <article className="rounded-2xl border border-blue-400/25 bg-blue-500/10 p-6">
          <h3 className="text-2xl font-bold text-white">For Vehicle Owners</h3>
          <p className="mt-2 text-sm text-blue-100/90">
            Tối ưu doanh thu đội xe với lịch đặt, theo dõi hợp đồng, cảnh báo hành trình và thống kê lợi nhuận.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-slate-200">
            <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" /> Dynamic pricing + availability control</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" /> Automated rental request workflow</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" /> Tracking and dispute support</li>
          </ul>
        </article>

        <article className="rounded-2xl border border-cyan-400/25 bg-cyan-500/10 p-6">
          <h3 className="text-2xl font-bold text-white">For Renters</h3>
          <p className="mt-2 text-sm text-cyan-100/90">
            Chọn xe phù hợp, đặt lịch linh hoạt, thanh toán minh bạch và quản lý hợp đồng ngay trong một dashboard.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-slate-200">
            <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" /> Fast booking with real-time availability</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" /> Digital contract and inspection timeline</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" /> Trusted refund and support workflow</li>
          </ul>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
          <SectionHeader
            title="Trust & Safety"
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
          <SectionHeader title="Platform Metrics" subtitle="Dữ liệu vận hành realtime ở quy mô marketplace." />
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
          title="Featured Cars"
          subtitle="Danh sách xe nổi bật phù hợp cho chuyến công tác, gia đình hoặc roadtrip dài ngày."
          action={
            <Link to="/cars" className="text-sm font-semibold text-cyan-300 transition hover:text-cyan-200">
              View all cars
            </Link>
          }
        />

        {loadingCars ? (
          <LoadingSkeleton rows={3} />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {featuredCars.map((vehicle) => (
              <CarCard key={vehicle._id} vehicle={vehicle} to={`/cars/${vehicle._id}`} />
            ))}
          </div>
        )}
      </section>

      <footer className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
        <div className="grid gap-6 md:grid-cols-4">
          <div>
            <h4 className="text-lg font-semibold text-white">RentCar Premium</h4>
            <p className="mt-2 text-sm text-slate-300">Nền tảng P2P vehicle rental cho renter, owner và admin với full workflow.</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Marketplace</p>
            <ul className="mt-2 space-y-1 text-sm text-slate-300">
              <li className="flex items-center gap-2"><Users className="h-3.5 w-3.5" /> Verified profiles</li>
              <li className="flex items-center gap-2"><Wallet className="h-3.5 w-3.5" /> Escrow-ready payment flow</li>
              <li className="flex items-center gap-2"><Globe2 className="h-3.5 w-3.5" /> Nationwide coverage</li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Operations</p>
            <ul className="mt-2 space-y-1 text-sm text-slate-300">
              <li>Contract service</li>
              <li>Tracking & inspection</li>
              <li>Dispute resolution</li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Admin analytics</p>
            <ul className="mt-2 space-y-1 text-sm text-slate-300">
              <li className="flex items-center gap-2"><TrendingUp className="h-3.5 w-3.5" /> Revenue dashboard</li>
              <li>System fee monitoring</li>
              <li>Risk control & alerts</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
