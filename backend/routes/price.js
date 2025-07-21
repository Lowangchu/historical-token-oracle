import express from 'express';
import redisClient from '../utils/redisClient.js';
import { getPriceFromDB, getClosestPrices } from '../utils/db.js';
import { interpolate } from '../utils/interpolate.js';

const router = express.Router();

// ✅ POST /api/price
router.post('/', async (req, res) => {
  try {
    const { token, network, timestamp } = req.body;

    if (!token || !network || !timestamp) {
      return res.status(400).json({ error: 'Missing token, network, or timestamp' });
    }

    const cacheKey = `price:${network}:${token.toLowerCase()}:${timestamp}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.json({ ...JSON.parse(cached), source: 'cache' });
    }

    // Step 1: Exact match in MongoDB
    const exact = await getPriceFromDB(token, network, timestamp);
    if (exact !== null) {
      const response = { price: exact, source: 'db' };
      await redisClient.setEx(cacheKey, 300, JSON.stringify(response));
      return res.json(response);
    }

    // Step 2: Interpolation from closest prices
    const [before, after] = await getClosestPrices(token, network, timestamp);
    if (before && after) {
      const interpolatedPrice = interpolate(
        timestamp,
        before.timestamp,
        before.price,
        after.timestamp,
        after.price
      );

      const response = { price: interpolatedPrice, source: 'interpolated' };
      await redisClient.setEx(cacheKey, 300, JSON.stringify(response));
      return res.json(response);
    }

    return res.status(404).json({ error: 'Price not found and cannot interpolate' });

  } catch (err) {
    console.error('❌ Error in /api/price:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
