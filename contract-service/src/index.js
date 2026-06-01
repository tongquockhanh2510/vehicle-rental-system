import './env.js';
import express from 'express';
import mongoose from 'mongoose';
import contractRoutes from './routes/contractRoutes.js';
import contractService from './services/ContractService.js';


const app = express();
const PORT = process.env.PORT || process.env.CONTRACT_SERVICE_PORT || 3004;

app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log('MongoDB connection error:', err));

app.use('/api/contracts', contractRoutes);

await contractService.subscribeToEvents();

app.listen(PORT, () => {
  console.log(`Contract Service running on port ${PORT}`);
});
