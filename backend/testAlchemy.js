// testAlchemy.js
import { Alchemy, Network } from "alchemy-sdk";
import dotenv from 'dotenv';
dotenv.config();

const alchemy = new Alchemy({
  apiKey: process.env.ALCHEMY_KEY,
  network: Network.ETH_MAINNET
});

(async () => {
  const latestBlock = await alchemy.core.getBlockNumber();
  console.log("🧱 Latest Block:", latestBlock);
})();
