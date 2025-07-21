import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// 👇 Correct path resolution for .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

console.log("✅ Loaded Alchemy Key:", process.env.ALCHEMY_API_KEY); // Debug log

import { Alchemy, Network } from 'alchemy-sdk';
import pRetry from 'p-retry';

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
if (!ALCHEMY_API_KEY) throw new Error('❌ Alchemy API key missing');

const alchemy = new Alchemy({
  apiKey: ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
});

const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

export async function getTokenCreationTimestamp(tokenAddress) {
  const latestBlock = await alchemy.core.getBlockNumber();
  const step = 450;
  let scanCount = 0;
  const MAX_SCANS = 200; // Scan max 200 * step blocks = 90,000 blocks

  console.log(`🧪 Starting scan: 0 to ${latestBlock}`);

  for (let from = 0; from <= latestBlock; from += step) {
    const to = Math.min(from + step - 1, latestBlock);
    console.log(`📦 Scanning ${from} → ${to}`);
    scanCount++;

    if (scanCount > MAX_SCANS) {
      console.warn("🛑 Scan limit reached without finding logs.");
      break;
    }

    try {
      const logs = await pRetry(() =>
        alchemy.core.getLogs({
          address: tokenAddress,
          fromBlock: `0x${from.toString(16)}`,
          toBlock: `0x${to.toString(16)}`,
          topics: [TRANSFER_TOPIC],
        }), { retries: 3 }
      );

      if (logs.length > 0) {
        const first = logs[0];
        const block = await alchemy.core.getBlock(first.blockNumber);
        return block.timestamp; // already in seconds
      }
    } catch (err) {
      console.error(`❌ Logs error in range ${from}-${to}: ${err.message}`);
    }
  }

  throw new Error('❌ Failed to fetch token creation timestamp');
}
