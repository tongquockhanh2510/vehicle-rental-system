import mongoose from 'mongoose';

// For statistics, we'll query other service collections directly

export async function getDashboardStats(db) {
  const payments = db.collection('payments');
  const rentals = db.collection('rental_requests');
  const disputes = db.collection('disputes');
  const reviews = db.collection('reviews');

  const totalRevenue = await payments.aggregate([
    { $match: { status: 'COMPLETED' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]).toArray();

  const totalRentals = await rentals.countDocuments({ status: 'COMPLETED' });
  
  const platformFee = await payments.aggregate([
    { $match: { status: 'COMPLETED' } },
    { $group: { _id: null, total: { $sum: '$platform_fee' } } }
  ]).toArray();

  const disputes_count = await disputes.countDocuments();

  return {
    total_revenue: totalRevenue[0]?.total || 0,
    total_rentals: totalRentals,
    platform_fee: platformFee[0]?.total || 0,
    disputes_count
  };
}
