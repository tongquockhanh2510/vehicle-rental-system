export const PUBLIC_NAV = [
  { label: 'Khám phá phương tiện', to: '/vehicles' },
  { label: 'Cách hoạt động', to: '/how-it-works' },
  { label: '✨ AI Trợ lý', to: '/ai-assistant' },
  { label: 'Đăng ký làm chủ xe', to: '/become-owner' }
];

export const RENTER_MENU = [
  { label: 'Khám phá phương tiện', to: '/app/explore', icon: 'Compass' },
  { label: 'Cách hoạt động', to: '/how-it-works', icon: 'HelpCircle' },
  { label: 'AI Trợ lý', to: '/ai-assistant', icon: 'Sparkles' },
  { label: 'Yêu cầu thuê', to: '/app/requests', icon: 'ClipboardList' },
  { label: 'Hợp đồng thuê', to: '/app/contracts', icon: 'FileCheck2' },
  { label: 'Thanh toán của tôi', to: '/app/payments', icon: 'Wallet' },
  { label: 'Kiểm tra xe', to: '/app/inspections', icon: 'ShieldCheck' },
  { label: 'Thông báo', to: '/app/notifications', icon: 'Bell' },
  { label: 'Hồ sơ', to: '/app/profile', icon: 'User' }
];

export const OWNER_MENU = [
  { label: 'Tổng quan chủ xe', to: '/owner/dashboard', icon: 'LayoutDashboard' },
  { label: 'Xe của tôi', to: '/owner/vehicles', icon: 'CarFront' },
  { label: 'Đăng xe mới', to: '/owner/vehicles/new', icon: 'PlusSquare' },
  { label: 'Yêu cầu từ người thuê', to: '/owner/requests', icon: 'ClipboardList' },
  { label: 'Hợp đồng cho thuê', to: '/owner/contracts', icon: 'FileCheck2' },
  { label: 'Thanh toán nhận được', to: '/owner/payments', icon: 'WalletCards' },
  { label: 'Theo dõi xe', to: '/owner/tracking', icon: 'MapPinned' },
  { label: 'Tranh chấp', to: '/owner/disputes', icon: 'Scale' },
  { label: 'Doanh thu', to: '/owner/revenue', icon: 'BarChart3' },
  { label: 'Hồ sơ chủ xe', to: '/owner/profile', icon: 'BadgeCheck' }
];

export const ADMIN_MENU = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: 'LayoutDashboard' },
  { label: 'Người dùng', to: '/admin/users', icon: 'Users' },
  { label: 'Hồ sơ chủ xe', to: '/admin/owner-applications', icon: 'ClipboardCheck' },
  { label: 'Phương tiện', to: '/admin/vehicles', icon: 'CarFront' },
  { label: 'Yêu cầu thuê', to: '/admin/rentals', icon: 'ClipboardList' },
  { label: 'Hợp đồng', to: '/admin/contracts', icon: 'FileCheck2' },
  { label: 'Thanh toán', to: '/admin/payments', icon: 'WalletCards' },
  { label: 'Tranh chấp', to: '/admin/disputes', icon: 'Scale' },
  { label: 'Thống kê', to: '/admin/statistics', icon: 'BarChart3' },
  { label: 'AI Agent', to: '/admin/ai-agent', icon: 'Bot' }
];
