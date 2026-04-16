import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    search: ''
  });

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.type) params.type = filters.type;
      if (filters.search) params.search = filters.search;
      const data = await api.getVehicles(params);
      setVehicles(data);
    } catch (err) {
      console.error('Không thể tải danh sách xe:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadVehicles();
  };

  const getVehicleEmoji = (type) => {
    const emojis = {
      car: '🚗',
      motorcycle: '🏍️',
      bike: '🚲'
    };
    return emojis[type] || '🚙';
  };

  const getTypeLabel = (type) => {
    const labels = {
      car: 'Ô tô',
      motorcycle: 'Xe máy',
      bike: 'Xe đạp'
    };
    return labels[type] || type;
  };

  const getStatusConfig = (status) => {
    const configs = {
      available: { label: 'Sẵn sàng', gradient: 'from-emerald-400 to-teal-500', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
      booked: { label: 'Đã đặt', gradient: 'from-amber-400 to-orange-500', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
      maintenance: { label: 'Bảo dưỡng', gradient: 'from-red-400 to-rose-500', bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' }
    };
    return configs[status] || configs.available;
  };

  const vehicleTypes = [
    { value: '', label: 'Tất cả loại xe', emoji: '🚙' },
    { value: 'car', label: 'Ô tô', emoji: '🚗' },
    { value: 'motorcycle', label: 'Xe máy', emoji: '🏍️' },
    { value: 'bike', label: 'Xe đạp', emoji: '🚲' }
  ];

  return (
    <div className="min-h-screen pt-20 pb-12 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Banner */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDR2LTRoMzJ2NGgtNHYtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-10 left-10 text-6xl opacity-20 animate-float">🚗</div>
        <div className="absolute top-20 right-20 text-5xl opacity-20 animate-float" style={{ animationDelay: '1s' }}>🏍️</div>
        <div className="absolute bottom-10 left-1/4 text-4xl opacity-20 animate-float" style={{ animationDelay: '2s' }}>🚲</div>

        {/* Content */}
        <div className="relative h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="animate-fade-in-up">
              <span className="inline-block px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium mb-4">
                Khám phá ngay
              </span>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
                Xe cho thuê
              </h1>
              <p className="text-xl text-white/80 max-w-xl">
                Hàng trăm xe chất lượng từ những chủ xe đáng tin cậy
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="bg-white rounded-3xl shadow-2xl shadow-purple-900/20 p-6 md:p-8">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, hãng xe..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="input-field pl-12"
              />
            </div>

            {/* Type Filter */}
            <div className="relative min-w-[180px]">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-xl">{vehicleTypes.find(t => t.value === filters.type)?.emoji || '🚙'}</span>
              </div>
              <select
                value={filters.type}
                onChange={(e) => {
                  setFilters({ ...filters, type: e.target.value });
                  loadVehicles();
                }}
                className="input-field pl-12 appearance-none cursor-pointer"
              >
                {vehicleTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Search Button */}
            <button type="submit" className="btn-primary whitespace-nowrap">
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Tìm kiếm
              </span>
            </button>
          </form>
        </div>
      </div>

      {/* Vehicles Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          // Loading Skeleton
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-lg">
                <div className="h-56 bg-gray-200 animate-pulse"></div>
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                  <div className="flex justify-between">
                    <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : vehicles.length === 0 ? (
          // Empty State
          <div className="text-center py-20">
            <div className="text-8xl mb-6 animate-float">🔍</div>
            <h3 className="text-2xl font-bold text-white mb-4">Không tìm thấy xe nào</h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Không có xe nào phù hợp với tìm kiếm của bạn. Hãy thử thay đổi bộ lọc hoặc tìm kiếm từ khóa khác.
            </p>
            <button
              onClick={() => {
                setFilters({ type: '', search: '' });
                loadVehicles();
              }}
              className="btn-primary"
            >
              Xem tất cả xe
            </button>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="flex items-center justify-between mb-8">
              <p className="text-gray-400">
                <span className="text-white font-semibold">{vehicles.length}</span> xe được tìm thấy
              </p>
            </div>

            {/* Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {vehicles.map((vehicle, index) => {
                const statusConfig = getStatusConfig(vehicle.status);
                return (
                  <Link
                    to={`/vehicles/${vehicle.id}`}
                    key={vehicle.id}
                    className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Image */}
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={vehicle.image_url || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop'}
                        alt={vehicle.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      
                      {/* Status Badge */}
                      <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-bold ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border} backdrop-blur-sm`}>
                        {statusConfig.label}
                      </div>
                      
                      {/* Type Badge */}
                      <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-sm font-bold text-gray-800 flex items-center gap-1.5">
                        <span className="text-lg">{getVehicleEmoji(vehicle.type)}</span>
                        {getTypeLabel(vehicle.type)}
                      </div>

                      {/* Quick View Overlay */}
                      <div className="absolute inset-0 bg-indigo-600/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="text-white font-bold text-lg flex items-center gap-2">
                          Xem chi tiết
                          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">
                        {vehicle.name}
                      </h3>
                      <p className="text-gray-500 text-sm mb-4 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        {vehicle.brand} • {vehicle.license_plate}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div>
                          <span className="text-2xl font-black text-indigo-600">
                            {vehicle.price_per_day.toLocaleString('vi-VN')}
                          </span>
                          <span className="text-gray-500 text-sm"> /ngày</span>
                        </div>
                        <div className="flex items-center gap-2 text-emerald-500 text-sm font-medium">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Đã kiểm duyệt
                        </div>
                      </div>
                    </div>

                    {/* Hover Glow Effect */}
                    <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-indigo-500/30 transition-colors duration-300 pointer-events-none"></div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
