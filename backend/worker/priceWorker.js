// worker/priceWorker.js

import { Worker } from 'bullmq';
import { connectMongo } from '../utils/mongoClient.js';
import redisClient from '../utils/redisClient.js';
import { savePriceToDB } from '../utils/db.js';
import dotenv from 'dotenv';
import { getHistoricalPrice } from '../utils/fetchPrice.js';

dotenv.config();

// Ensure MongoDB connection is established
await connectMongo();

// ✅ Create a worker for the 'price-queue'
const worker = new Worker(
  'price-queue',
  async (job) => {
    const { token, network, timestamp } = job.data;

    try {
      // Fetch historical price
      const price = await getHistoricalPrice(token, network, timestamp);
      if (!price) throw new Error('Price not found');

      // Save to MongoDB
      await savePriceToDB(token, network, timestamp, price);

      // Cache to Redis
      const cacheKey = `price:${network}:${token}:${timestamp}`;
      await redisClient.setEx(cacheKey, 300, JSON.stringify({ price }));

      console.log(`✅ Stored price for ${token} on ${network} at ${timestamp}: $${price}`);
    } catch (err) {
      console.error(`❌ Job failed for ${token} at ${timestamp}:`, err.message);
    }
  },
  {
    connection: {
      host: '127.0.0.1',
      port: 6379
    }
  }
);

// Optional: Log job status
worker.on('completed', (job) => {
  console.log(`🎉 Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id || 'unknown'} failed:`, err.message);
});
