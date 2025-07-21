// backend/utils/fetchPrice.js
export async function getHistoricalPrice(token, network, timestamp) {
  // ⛔️ For now, return a dummy price for testing
  const dummyPrice = 1.2345;
  return dummyPrice;

  // Later you’ll:
  // - fetch price using Alchemy traces + Uniswap reserves
  // - or from a DEX subgraph
}
