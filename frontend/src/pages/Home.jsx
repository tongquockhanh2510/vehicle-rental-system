import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center overflow-hidden gradient-hero">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Gradient Orbs */}
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-600/30 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-600/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
          
          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}></div>

          {/* Floating Particles */}
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-indigo-400/40 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>

        {/* Hero Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="animate-fade-in-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8 animate-fade-in-up">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                <span className="text-gray-300 text-sm font-medium">Hệ thống cho thuê xe hàng đầu Việt Nam</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
                <span className="text-white">Thuê Xe</span>
                <br />
                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient-x" style={{ backgroundSize: '200% 200%' }}>
                  Dễ Dàng
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-xl text-gray-300 mb-10 max-w-xl leading-relaxed">
                Khám phá hàng trăm xe chất lượng từ những chủ xe đáng tin cậy. 
                Đặt xe nhanh chóng, giá cả hợp lý, trải nghiệm tuyệt vời.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/vehicles" className="group relative px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg shadow-2xl shadow-indigo-500/40 hover:shadow-indigo-500/60 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Khám phá xe ngay
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>

                <Link to="/register" className="group px-8 py-4 rounded-2xl bg-white/10 backdrop-blur-sm text-white font-bold text-lg border border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-1 flex items-center justify-center gap-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Đăng ký miễn phí
                </Link>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-8 mt-12 pt-8 border-t border-white/10">
                <div className="animate-fade-in-up delay-100">
                  <div className="text-4xl font-black text-white">500+</div>
                  <div className="text-gray-400 text-sm">Xe cho thuê</div>
                </div>
                <div className="animate-fade-in-up delay-200">
                  <div className="text-4xl font-black text-white">1K+</div>
                  <div className="text-gray-400 text-sm">Khách hàng</div>
                </div>
                <div className="animate-fade-in-up delay-300">
                  <div className="text-4xl font-black text-white">4.9</div>
                  <div className="text-gray-400 text-sm">Đánh giá</div>
                </div>
              </div>
            </div>

            {/* Right Content - Floating Cards */}
            <div className="relative hidden lg:block animate-fade-in-right">
              {/* Main Image Card */}
              <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl shadow-purple-500/30 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="aspect-[4/3] bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="text-8xl mb-4 animate-float">🚗</div>
                    <p className="text-white/80 text-lg">Sẵn sàng phục vụ 24/7</p>
                  </div>
                </div>
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>

              {/* Floating Cards */}
              <div className="absolute -top-8 -left-8 z-20 animate-float">
                <div className="glass-dark rounded-2xl p-4 shadow-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-semibold">Đặt xe an toàn</p>
                      <p className="text-gray-400 text-sm">100% bảo mật</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -right-4 z-20 animate-float" style={{ animationDelay: '1.5s' }}>
                <div className="glass-dark rounded-2xl p-4 shadow-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-semibold">Giá tốt nhất</p>
                      <p className="text-gray-400 text-sm">Cam kết không phí hidden</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative Ring */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] border-2 border-dashed border-indigo-500/20 rounded-full animate-spin-slow"></div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-8 h-12 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-white/50 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-gradient-to-b from-slate-900 to-slate-800 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16 animate-fade-in-up">
            <span className="inline-block px-4 py-2 rounded-full bg-indigo-500/20 text-indigo-300 text-sm font-semibold mb-4">
              Tại sao chọn VietRent?
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              Dịch vụ <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">hoàn hảo</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Chúng tôi mang đến trải nghiệm thuê xe tốt nhất với công nghệ hiện đại và đội ngũ hỗ trợ 24/7
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: 'An toàn tuyệt đối',
                desc: 'Xe được kiểm tra kỹ lưỡng, bảo hiểm đầy đủ',
                gradient: 'from-emerald-400 to-teal-500',
                delay: 'delay-100'
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: 'Đặt xe nhanh chóng',
                desc: 'Chỉ 3 bước đơn giản trong 30 giây',
                gradient: 'from-blue-400 to-indigo-500',
                delay: 'delay-200'
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                ),
                title: 'Thanh toán linh hoạt',
                desc: 'Nhiều hình thức: MoMo, VNPay, thẻ',
                gradient: 'from-amber-400 to-orange-500',
                delay: 'delay-300'
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ),
                title: 'Hỗ trợ 24/7',
                desc: 'Đội ngũ tư vấn luôn sẵn sàng giúp đỡ',
                gradient: 'from-pink-400 to-rose-500',
                delay: 'delay-400'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className={`group relative p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-500 hover:-translate-y-2 animate-fade-in-up ${feature.delay}`}
              >
                {/* Glow Effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-500`}></div>
                
                <div className="relative">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <div className="text-white">{feature.icon}</div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Vehicle Types Section */}
      <div className="py-24 bg-white relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-50 to-transparent"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-16">
            <div>
              <span className="inline-block px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold mb-4">
                Danh mục xe
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
                Khám phá <span className="gradient-text">danh sách xe</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-xl">
                Đa dạng loại xe từ ô tô, xe máy đến xe đạp cho mọi nhu cầu của bạn
              </p>
            </div>
            <Link to="/vehicles" className="mt-6 lg:mt-0 inline-flex items-center gap-2 text-indigo-600 font-semibold hover:gap-4 transition-all duration-300">
              Xem tất cả xe
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {/* Vehicle Categories */}
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                emoji: '🚗',
                title: 'Ô tô',
                desc: 'Sedan, SUV, xe sang trọng cho mọi dịp',
                price: 'Từ 500K/ngày',
                gradient: 'from-blue-500 to-indigo-600'
              },
              {
                emoji: '🏍️',
                title: 'Xe máy',
                desc: 'Sport, scooter, xe số đủ loại',
                price: 'Từ 150K/ngày',
                gradient: 'from-amber-500 to-orange-600'
              },
              {
                emoji: '🚲',
                title: 'Xe đạp',
                desc: 'Xe đạp điện, xe đạp leo núi',
                price: 'Từ 80K/ngày',
                gradient: 'from-emerald-500 to-teal-600'
              }
            ].map((category, index) => (
              <Link
                to="/vehicles"
                key={index}
                className="group relative overflow-hidden rounded-3xl bg-gray-900 p-8 h-80 flex flex-col justify-end card-hover"
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-90 group-hover:opacity-100 transition-opacity duration-500`}></div>
                
                {/* Emoji */}
                <div className="absolute top-8 right-8 text-8xl opacity-50 group-hover:opacity-80 group-hover:scale-110 transition-all duration-500">
                  {category.emoji}
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <h3 className="text-3xl font-black text-white mb-2">{category.title}</h3>
                  <p className="text-white/80 mb-4">{category.desc}</p>
                  <div className="inline-flex items-center gap-2 text-white font-semibold">
                    <span>{category.price}</span>
                    <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>

                {/* Decorative Shape */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-white/10"></div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 rounded-full bg-violet-100 text-violet-700 text-sm font-semibold mb-4">
              3 bước đơn giản
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
              Cách thức <span className="gradient-text">hoạt động</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Đặt xe chỉ trong vài phút với quy trình đơn giản
            </p>
          </div>

          {/* Steps */}
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-20 left-1/4 right-1/4 h-1 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 rounded-full"></div>
            
            {[
              {
                step: '01',
                title: 'Tạo tài khoản',
                desc: 'Đăng ký nhanh chóng với email và số điện thoại',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                )
              },
              {
                step: '02',
                title: 'Chọn xe & đặt',
                desc: 'Duyệt danh sách xe, chọn ngày và xác nhận đặt xe',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )
              },
              {
                step: '03',
                title: 'Nhận xe & di chuyển',
                desc: 'Gặp chủ xe, kiểm tra xe và bắt đầu hành trình',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )
              }
            ].map((item, index) => (
              <div key={index} className="relative text-center group">
                {/* Step Number */}
                <div className="relative inline-block mb-8">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/30 group-hover:scale-110 group-hover:shadow-2xl group-hover:shadow-indigo-500/40 transition-all duration-300">
                    <div className="text-white">{item.icon}</div>
                  </div>
                  <div className="absolute -top-3 -right-3 w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-xl font-black text-indigo-600">{item.step}</span>
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{item.title}</h3>
                <p className="text-gray-600 max-w-xs mx-auto leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-gradient-hero relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/30 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 animate-fade-in-up">
            Sẵn sàng bắt đầu?
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto animate-fade-in-up delay-100">
            Tham gia cộng đồng VietRent ngay hôm nay và nhận ưu đãi giảm giá 20% cho lần thuê đầu tiên!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-200">
            <Link to="/register" className="group px-10 py-5 rounded-2xl bg-white text-indigo-600 font-bold text-lg shadow-2xl shadow-white/20 hover:shadow-white/40 hover:-translate-y-1 transition-all duration-300">
              <span className="flex items-center justify-center gap-3">
                Bắt đầu ngay
                <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </Link>
            <Link to="/vehicles" className="px-10 py-5 rounded-2xl bg-white/10 backdrop-blur-sm text-white font-bold text-lg border border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-1">
              Xem xe có sẵn
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <span className="text-xl font-bold text-white">VietRent</span>
            </div>
            <p className="text-gray-400 text-sm">
              © 2024 VietRent. Nền tảng thuê xe hàng đầu Việt Nam.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
