import Price from '../models/Price.js';

// 🔍 Get exact match from DB
export async function getPriceFromDB(token, network, timestamp) {
  const result = await Price.findOne({
    token: token.toLowerCase(),
    network,
    timestamp
  });

  return result?.price || null;
}

// 🔍 Get closest price before and after timestamp
export async function getClosestPrices(token, network, timestamp) {
  const before = await Price.findOne({
    token: token.toLowerCase(),
    network,
    timestamp: { $lt: timestamp }
  }).sort({ timestamp: -1 });

  const after = await Price.findOne({
    token: token.toLowerCase(),
    network,
    timestamp: { $gt: timestamp }
  }).sort({ timestamp: 1 });

  return [before, after];
}

// 💾 Save or update price into DB
export async function savePriceToDB(token, network, timestamp, price) {
  try {
    await Price.updateOne(
      { token: token.toLowerCase(), network, timestamp },
      { $set: { price } },
      { upsert: true }
    );
    console.log('💾 Price saved:', token, network, timestamp, price);
  } catch (err) {
    console.error('❌ Failed to save price:', err);
  }
}
