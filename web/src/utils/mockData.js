export const mockMetrics = {
  totalUsers: 12480,
  totalVehicles: 1680,
  activeRentals: 342,
  totalRevenue: 8920000000,
  systemFeeRevenue: 356800000,
  pendingDisputes: 18,
  confirmationRate: 92.4,
  refundPending: 9
};

export const mockUserGrowth = [
  { month: 'Jan', value: 620 },
  { month: 'Feb', value: 710 },
  { month: 'Mar', value: 845 },
  { month: 'Apr', value: 980 },
  { month: 'May', value: 1110 },
  { month: 'Jun', value: 1230 }
];

export const mockRevenue = [
  { month: 'Jan', value: 980000000 },
  { month: 'Feb', value: 1210000000 },
  { month: 'Mar', value: 1380000000 },
  { month: 'Apr', value: 1490000000 },
  { month: 'May', value: 1620000000 },
  { month: 'Jun', value: 1820000000 }
];

export const mockSystemLogs = [
  {
    id: 'LOG-1001',
    level: 'INFO',
    message: 'Payment queue synchronized successfully',
    timestamp: new Date().toISOString()
  },
  {
    id: 'LOG-1002',
    level: 'WARN',
    message: 'Tracking provider delay detected for 2 vehicles',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString()
  },
  {
    id: 'LOG-1003',
    level: 'ERROR',
    message: 'Dispute evidence upload retry triggered',
    timestamp: new Date(Date.now() - 1000 * 60 * 37).toISOString()
  }
];
