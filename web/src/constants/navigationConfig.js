export const PUBLIC_NAV = [
  { label: 'Khám phá phương tiện', to: '/vehicles' },
  { label: 'Cách hoạt động', to: '/how-it-works' },
  { label: 'Trở thành chủ xe', to: '/become-owner' }
];

export const RENTER_MENU = [
  { label: 'Tổng quan', to: '/app', icon: 'LayoutDashboard' },
  { label: 'Khám phá', to: '/app/explore', icon: 'Compass' },
  { label: 'Yêu cầu thuê', to: '/app/requests', icon: 'ClipboardList' },
  { label: 'Hợp đồng', to: '/app/contracts', icon: 'FileCheck2' },
  { label: 'Thanh toán', to: '/app/payments', icon: 'Wallet' },
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
  { label: 'Theo dõi xe', to: '/owner/tracking', icon: 'MapPinned' },
  { label: 'Tranh chấp', to: '/owner/disputes', icon: 'Scale' },
  { label: 'Doanh thu', to: '/owner/revenue', icon: 'BarChart3' },
  { label: 'Hồ sơ chủ xe', to: '/owner/profile', icon: 'BadgeCheck' }
];

export const ADMIN_MENU = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: 'LayoutDashboard' },
  { label: 'Người dùng', to: '/admin/users', icon: 'Users' },
  { label: 'Đơn chủ xe', to: '/admin/owner-applications', icon: 'ClipboardCheck' },
  { label: 'Phương tiện', to: '/admin/vehicles', icon: 'CarFront' },
  { label: 'Yêu cầu thuê', to: '/admin/rentals', icon: 'ClipboardList' },
  { label: 'Hợp đồng', to: '/admin/contracts', icon: 'FileCheck2' },
  { label: 'Thanh toán', to: '/admin/payments', icon: 'WalletCards' },
  { label: 'Tranh chấp', to: '/admin/disputes', icon: 'Scale' },
  { label: 'Thống kê', to: '/admin/statistics', icon: 'BarChart3' },
  { label: 'System Health', to: '/admin/system-health', icon: 'Activity' },
  { label: 'Architecture', to: '/admin/architecture', icon: 'Network' },
  { label: 'AI Agent', to: '/admin/ai-agent', icon: 'Bot' }
];
