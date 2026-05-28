import express from 'express';
import { authenticateToken } from '../middlewares/auth.js';
import { StatisticsService } from '../services/StatisticsService.js';

export const createStatisticsRoutes = (redisClient) => {
  const router = express.Router();
  const statisticsService = new StatisticsService(redisClient);

  router.get('/dashboard', authenticateToken, async (req, res) => {
    try {
      const data = await statisticsService.getDashboard();
      res.json(data);
    } catch (error) {
      res.status(500).json({
        error: 'Failed to load dashboard statistics',
        message: error.message
      });
    }
  });

  router.get('/revenue-by-month', authenticateToken, async (req, res) => {
    try {
      const data = await statisticsService.getRevenueByMonth(req.query.months);
      res.json(data);
    } catch (error) {
      res.status(500).json({
        error: 'Failed to load monthly revenue',
        message: error.message
      });
    }
  });

  router.get('/top-vehicles', authenticateToken, async (req, res) => {
    try {
      const data = await statisticsService.getTopVehicles(req.query.limit);
      res.json(data);
    } catch (error) {
      res.status(500).json({
        error: 'Failed to load top vehicles',
        message: error.message
      });
    }
  });

  return router;
};
