import 'dotenv/config';
import express from 'express';
import pricingRoutes from './routes/pricingRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import trustScoreRoutes from './routes/trustScoreRoutes.js';

const app = express();
const PORT = process.env.PORT || 5010;

app.use(express.json());

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(`[ai-service] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - start}ms)`);
  });
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ai-service',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// AI routes
app.use('/api/ai/pricing', pricingRoutes);
app.use('/api/ai/reviews', reviewRoutes);
app.use('/api/ai/trust-score', trustScoreRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.originalUrl });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('[ai-service] Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`AI Service running on port ${PORT}`);
});
