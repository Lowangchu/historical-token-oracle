// backend/routes/history.js
import express from 'express';
import fetch from 'node-fetch';
import redisClient from '../utils/redisClient.js';

const router = express.Router();

const coinGeckoIdMap = {
  btc: 'bitcoin',
  eth: 'ethereum',
  sol: 'solana',
  ada: 'cardano',
  doge: 'dogecoin',
  shib: 'shiba-inu',
};

router.get('/:symbol', async (req, res) => {
  const { symbol } = req.params;
  const coinId = coinGeckoIdMap[symbol.toLowerCase()];
  const cacheKey = `history:${symbol.toLowerCase()}`;

  if (!coinId) {
    return res.status(400).json({ error: 'Unsupported token symbol' });
  }

  try {
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const url = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=7&interval=daily`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.prices || !Array.isArray(data.prices)) {
      return res.status(404).json({ error: 'Historical data not found' });
    }

    const history = data.prices.map(([timestamp, price]) => ({
      date: new Date(timestamp).toLocaleDateString(),
      price: price.toFixed(2),
    }));

    await redisClient.setEx(cacheKey, 600, JSON.stringify(history));
    res.json(history);
  } catch (err) {
    console.error('❌ Error fetching history:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
