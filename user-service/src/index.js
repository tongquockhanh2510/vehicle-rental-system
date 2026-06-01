import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';
import ownerApplicationRoutes from './routes/ownerApplicationRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || process.env.USER_SERVICE_PORT || 3001;

// Middleware
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log('MongoDB connection error:', err));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/owner-applications', ownerApplicationRoutes);

app.listen(PORT, () => {
  console.log(`User Service running on port ${PORT}`);
});
