import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.STATISTIC_SERVICE_PORT || 3011;

app.use(express.json());

const db = mongoose.connection;

mongoose.connect(process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/redis_vehicle_db?authSource=admin')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log('MongoDB connection error:', err));

// Dashboard statistics endpoint
app.get('/api/statistics/dashboard', async (req, res) => {
  try {
    const paymentsCollection = db.collection('payments');
    const rentalsCollection = db.collection('rental_requests');
    const disputesCollection = db.collection('disputes');

    const totalRevenue = await paymentsCollection.aggregate([
      { $match: { status: 'COMPLETED' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]).toArray();

    const totalRentals = await rentalsCollection.countDocuments({ status: 'COMPLETED' });
    
    const platformFee = await paymentsCollection.aggregate([
      { $match: { status: 'COMPLETED' } },
      { $group: { _id: null, total: { $sum: '$platform_fee' } } }
    ]).toArray();

    const disputesCount = await disputesCollection.countDocuments();

    res.json({
      total_revenue: totalRevenue[0]?.total || 0,
      total_rentals: totalRentals,
      platform_fee: platformFee[0]?.total || 0,
      disputes_count: disputesCount
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Revenue by month endpoint
app.get('/api/statistics/revenue-by-month', async (req, res) => {
  try {
    const paymentsCollection = db.collection('payments');
    
    const monthlyRevenue = await paymentsCollection.aggregate([
      { $match: { status: 'COMPLETED' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$created_at' } },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();

    res.json(monthlyRevenue);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Top rated vehicles endpoint
app.get('/api/statistics/top-vehicles', async (req, res) => {
  try {
    const vehiclesCollection = db.collection('vehicles');
    
    const topVehicles = await vehiclesCollection.find()
      .sort({ average_rating: -1, total_rentals: -1 })
      .limit(10)
      .toArray();

    res.json(topVehicles);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Disputes statistics endpoint
app.get('/api/statistics/disputes', async (req, res) => {
  try {
    const disputesCollection = db.collection('disputes');
    
    const disputeStats = await disputesCollection.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          total_amount: { $sum: '$admin_decision_amount' }
        }
      }
    ]).toArray();

    res.json(disputeStats);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Statistic Service running on port ${PORT}`);
});
