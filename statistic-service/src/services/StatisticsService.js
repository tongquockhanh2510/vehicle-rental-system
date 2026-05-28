import mongoose from 'mongoose';

const DEFAULT_CACHE_TTL = Number.parseInt(process.env.STATISTICS_CACHE_TTL || '60', 10);

const safeNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const monthKey = (year, month) => `${year}-${String(month).padStart(2, '0')}`;

export class StatisticsService {
  constructor(redisClient) {
    this.redisClient = redisClient;
    this.cacheTtl = Number.isFinite(DEFAULT_CACHE_TTL) ? DEFAULT_CACHE_TTL : 60;
  }

  async readCache(key) {
    if (!this.redisClient || !this.redisClient.isOpen) {
      return null;
    }

    const cached = await this.redisClient.get(key);
    if (!cached) {
      return null;
    }

    return JSON.parse(cached);
  }

  async writeCache(key, data, ttl = this.cacheTtl) {
    if (!this.redisClient || !this.redisClient.isOpen) {
      return;
    }

    await this.redisClient.setEx(key, ttl, JSON.stringify(data));
  }

  get collections() {
    const db = mongoose.connection;

    return {
      users: db.collection('users'),
      vehicles: db.collection('vehicles'),
      rentals: db.collection('rental_requests'),
      contracts: db.collection('contracts'),
      payments: db.collection('payments'),
      disputes: db.collection('disputes')
    };
  }

  async getDashboard() {
    const cacheKey = 'statistics:dashboard:v1';
    const cached = await this.readCache(cacheKey);
    if (cached) {
      return cached;
    }

    const {
      users,
      vehicles,
      rentals,
      contracts,
      payments,
      disputes
    } = this.collections;

    const [
      totalUsers,
      totalVehicles,
      availableVehicles,
      totalRentalRequests,
      confirmedRentals,
      pendingRentals,
      activeContracts,
      pendingDisputes,
      completedPayments,
      revenueAgg,
      platformAgg
    ] = await Promise.all([
      users.countDocuments({}),
      vehicles.countDocuments({}),
      vehicles.countDocuments({ is_available: true }),
      rentals.countDocuments({}),
      rentals.countDocuments({ status: 'CONFIRMED' }),
      rentals.countDocuments({ status: 'PENDING' }),
      contracts.countDocuments({ status: 'ACTIVE' }),
      disputes.countDocuments({ status: 'PENDING' }),
      payments.countDocuments({ status: 'COMPLETED' }),
      payments
        .aggregate([
          {
            $match: {
              status: 'COMPLETED'
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$amount' }
            }
          }
        ])
        .toArray(),
      payments
        .aggregate([
          {
            $match: {
              status: 'COMPLETED'
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$platform_fee' }
            }
          }
        ])
        .toArray()
    ]);

    const dashboard = {
      total_users: totalUsers,
      total_vehicles: totalVehicles,
      available_vehicles: availableVehicles,
      total_rental_requests: totalRentalRequests,
      confirmed_rentals: confirmedRentals,
      pending_rentals: pendingRentals,
      active_contracts: activeContracts,
      pending_disputes: pendingDisputes,
      completed_transactions: completedPayments,
      total_revenue: safeNumber(revenueAgg[0]?.total),
      platform_revenue: safeNumber(platformAgg[0]?.total),
      confirmation_rate:
        totalRentalRequests > 0
          ? Number(((confirmedRentals / totalRentalRequests) * 100).toFixed(2))
          : 0,
      generated_at: new Date().toISOString()
    };

    await this.writeCache(cacheKey, dashboard);
    return dashboard;
  }

  async getRevenueByMonth(months = 12) {
    const safeMonths = Math.min(Math.max(Number.parseInt(months, 10) || 12, 1), 24);
    const cacheKey = `statistics:revenue-by-month:v1:${safeMonths}`;
    const cached = await this.readCache(cacheKey);
    if (cached) {
      return cached;
    }

    const now = new Date();
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - safeMonths + 1, 1));

    const pipeline = [
      {
        $match: {
          status: 'COMPLETED',
          created_at: { $gte: start }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$created_at' },
            month: { $month: '$created_at' }
          },
          total_revenue: { $sum: '$amount' },
          platform_revenue: { $sum: '$platform_fee' },
          total_transactions: { $sum: 1 }
        }
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1
        }
      }
    ];

    const raw = await this.collections.payments.aggregate(pipeline).toArray();
    const keyed = new Map(
      raw.map((item) => [
        monthKey(item._id.year, item._id.month),
        {
          total_revenue: safeNumber(item.total_revenue),
          platform_revenue: safeNumber(item.platform_revenue),
          total_transactions: safeNumber(item.total_transactions)
        }
      ])
    );

    const result = [];
    for (let i = safeMonths - 1; i >= 0; i -= 1) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
      const key = monthKey(d.getUTCFullYear(), d.getUTCMonth() + 1);
      const monthData = keyed.get(key) || {
        total_revenue: 0,
        platform_revenue: 0,
        total_transactions: 0
      };

      result.push({
        month: key,
        ...monthData
      });
    }

    await this.writeCache(cacheKey, result);
    return result;
  }

  async getTopVehicles(limit = 10) {
    const safeLimit = Math.min(Math.max(Number.parseInt(limit, 10) || 10, 1), 50);
    const cacheKey = `statistics:top-vehicles:v1:${safeLimit}`;
    const cached = await this.readCache(cacheKey);
    if (cached) {
      return cached;
    }

    const result = await this.collections.rentals
      .aggregate([
        {
          $match: {
            status: 'CONFIRMED'
          }
        },
        {
          $group: {
            _id: '$vehicle_id',
            total_bookings: { $sum: 1 },
            total_revenue: { $sum: '$total_amount' },
            avg_daily_rate: { $avg: '$daily_rate' }
          }
        },
        {
          $sort: {
            total_bookings: -1,
            total_revenue: -1
          }
        },
        {
          $limit: safeLimit
        },
        {
          $lookup: {
            from: 'vehicles',
            localField: '_id',
            foreignField: '_id',
            as: 'vehicle'
          }
        },
        {
          $unwind: {
            path: '$vehicle',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            _id: 0,
            vehicle_id: '$_id',
            total_bookings: 1,
            total_revenue: 1,
            avg_daily_rate: { $round: ['$avg_daily_rate', 2] },
            brand: '$vehicle.brand',
            model: '$vehicle.model',
            year: '$vehicle.year',
            license_plate: '$vehicle.license_plate',
            images: '$vehicle.images'
          }
        }
      ])
      .toArray();

    await this.writeCache(cacheKey, result);
    return result;
  }
}
