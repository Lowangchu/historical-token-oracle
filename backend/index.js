import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import redisClient, { connectRedis } from './utils/redisClient.js';
import { connectMongo } from './utils/mongoClient.js';

// ✅ Route Imports
import priceRoutes from './routes/price.js';
import historyRoutes from './routes/history.js';
import scheduleRoutes from './routes/schedule.js'; // NEW ✅

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Register Routes
app.use('/api/price', priceRoutes);       // POST /api/price
app.use('/api/history', historyRoutes);   // Future use
app.use('/api/schedule', scheduleRoutes); // NEW: POST /api/schedule

// ✅ Root health check
app.get('/', (req, res) => {
  res.send('🚀 Token Price Oracle is running!');
});

// ✅ Start server after DB & Redis connected
async function startServer() {
  try {
    await connectMongo();
    await connectRedis();

    app.listen(PORT, () => {
      console.log(`✅ Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Server startup failed:', err);
    process.exit(1);
  }
}

startServer();
