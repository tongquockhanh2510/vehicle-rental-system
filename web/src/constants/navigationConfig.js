export const PUBLIC_NAV = [
  { label: '\u004b\u0068\u00e1\u006d\u0020\u0070\u0068\u00e1\u0020\u0070\u0068\u01b0\u01a1\u006e\u0067\u0020\u0074\u0069\u1ec7\u006e', to: '/vehicles' },
  { label: '\u0043\u00e1\u0063\u0068\u0020\u0068\u006f\u1ea1\u0074\u0020\u0111\u1ed9\u006e\u0067', to: '/how-it-works' },
  { label: '\u0054\u0072\u1edf\u0020\u0074\u0068\u00e0\u006e\u0068\u0020\u0063\u0068\u1ee7\u0020\u0078\u0065', to: '/become-owner' }
];

export const RENTER_MENU = [
  { label: '\u0054\u1ed5\u006e\u0067\u0020\u0071\u0075\u0061\u006e', to: '/app', icon: 'LayoutDashboard' },
  { label: '\u004b\u0068\u00e1\u006d\u0020\u0070\u0068\u00e1', to: '/app/explore', icon: 'Compass' },
  { label: '\u0059\u00ea\u0075\u0020\u0063\u1ea7\u0075\u0020\u0074\u0068\u0075\u00ea', to: '/app/requests', icon: 'ClipboardList' },
  { label: '\u0048\u1ee3\u0070\u0020\u0111\u1ed3\u006e\u0067', to: '/app/contracts', icon: 'FileCheck2' },
  { label: '\u0054\u0068\u0061\u006e\u0068\u0020\u0074\u006f\u00e1\u006e', to: '/app/payments', icon: 'Wallet' },
  { label: '\u004b\u0069\u1ec3\u006d\u0020\u0074\u0072\u0061\u0020\u0078\u0065', to: '/app/inspections', icon: 'ShieldCheck' },
  { label: '\u0054\u0068\u00f4\u006e\u0067\u0020\u0062\u00e1\u006f', to: '/app/notifications', icon: 'Bell' },
  { label: '\u0048\u1ed3\u0020\u0073\u01a1', to: '/app/profile', icon: 'User' }
];

export const OWNER_MENU = [
  { label: '\u0054\u1ed5\u006e\u0067\u0020\u0071\u0075\u0061\u006e\u0020\u0063\u0068\u1ee7\u0020\u0078\u0065', to: '/owner/dashboard', icon: 'LayoutDashboard' },
  { label: '\u0058\u0065\u0020\u0063\u1ee7\u0061\u0020\u0074\u00f4\u0069', to: '/owner/vehicles', icon: 'CarFront' },
  { label: '\u0110\u0103\u006e\u0067\u0020\u0078\u0065\u0020\u006d\u1edb\u0069', to: '/owner/vehicles/new', icon: 'PlusSquare' },
  { label: '\u0059\u00ea\u0075\u0020\u0063\u1ea7\u0075\u0020\u0074\u1eeb\u0020\u006e\u0067\u01b0\u1eddi\u0020\u0074\u0068\u0075\u00ea', to: '/owner/requests', icon: 'ClipboardList' },
  { label: '\u0048\u1ee3\u0070\u0020\u0111\u1ed3\u006e\u0067\u0020\u0063\u0068\u006f\u0020\u0074\u0068\u0075\u00ea', to: '/owner/contracts', icon: 'FileCheck2' },
  { label: '\u0054\u0068\u0065\u006f\u0020\u0064\u00f5\u0069\u0020\u0078\u0065', to: '/owner/tracking', icon: 'MapPinned' },
  { label: '\u0054\u0072\u0061\u006e\u0068\u0020\u0063\u0068\u1ea5\u0070', to: '/owner/disputes', icon: 'Scale' },
  { label: '\u0044\u006f\u0061\u006e\u0068\u0020\u0074\u0068\u0075', to: '/owner/revenue', icon: 'BarChart3' },
  { label: '\u0048\u1ed3\u0020\u0073\u01a1\u0020\u0063\u0068\u1ee7\u0020\u0078\u0065', to: '/owner/profile', icon: 'BadgeCheck' }
];

export const ADMIN_MENU = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: 'LayoutDashboard' },
  { label: '\u004e\u0067\u01b0\u1eddi\u0020\u0064\u00f9\u006e\u0067', to: '/admin/users', icon: 'Users' },
  { label: '\u0110\u01a1\u006e\u0020\u0063\u0068\u1ee7\u0020\u0078\u0065', to: '/admin/owner-applications', icon: 'ClipboardCheck' },
  { label: '\u0050\u0068\u01b0\u01a1\u006e\u0067\u0020\u0074\u0069\u1ec7\u006e', to: '/admin/vehicles', icon: 'CarFront' },
  { label: '\u0059\u00ea\u0075\u0020\u0063\u1ea7\u0075\u0020\u0074\u0068\u0075\u00ea', to: '/admin/rentals', icon: 'ClipboardList' },
  { label: '\u0048\u1ee3\u0070\u0020\u0111\u1ed3\u006e\u0067', to: '/admin/contracts', icon: 'FileCheck2' },
  { label: '\u0054\u0068\u0061\u006e\u0068\u0020\u0074\u006f\u00e1\u006e', to: '/admin/payments', icon: 'WalletCards' },
  { label: '\u0054\u0072\u0061\u006e\u0068\u0020\u0063\u0068\u1ea5\u0070', to: '/admin/disputes', icon: 'Scale' },
  { label: '\u0054\u0068\u1ed1\u006e\u0067\u0020\u006b\u00ea', to: '/admin/statistics', icon: 'BarChart3' },
  { label: 'System Health', to: '/admin/system-health', icon: 'Activity' },
  { label: 'Architecture', to: '/admin/architecture', icon: 'Network' },
  { label: 'AI Agent', to: '/admin/ai-agent', icon: 'Bot' }
];