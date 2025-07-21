import express from 'express';
import { Queue } from 'bullmq';
import dotenv from 'dotenv';
import { getTokenCreationTimestamp } from '../utils/getTokenCreationDate.js'; //  import path

dotenv.config();
const router = express.Router();

// ✅ Create BullMQ queue instance
const priceQueue = new Queue('price-queue', {
  connection: {
    host: '127.0.0.1',
    port: 6379
  }
});

// ✅ POST /api/schedule
router.post('/', async (req, res) => {
  try {
    const { token, network } = req.body;

    if (!token || !network) {
      return res.status(400).json({ error: 'Missing token or network' });
    }

    // Step 1: Get token creation timestamp
    const creationTs = await getTokenCreationTimestamp(token);
    if (!creationTs) {
      return res.status(404).json({ error: 'Token creation timestamp not found' });
    }

    const now = Math.floor(Date.now() / 1000);
    const oneDay = 86400;

    const jobs = [];

    // Step 2: Create a job for each day
    for (let ts = creationTs; ts <= now; ts += oneDay) {
      jobs.push({
        name: 'fetch-price',
        data: {
          token: token.toLowerCase(),
          network,
          timestamp: ts
        }
      });
    }

    // Step 3: Add jobs in bulk
    await priceQueue.addBulk(jobs);

    res.json({
      message: '📅 Jobs scheduled successfully!',
      from: creationTs,
      to: now,
      total: jobs.length
    });

  } catch (err) {
    console.error('❌ Schedule error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

export default router;
