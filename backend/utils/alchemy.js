import { Alchemy, Network } from 'alchemy-sdk';
import dotenv from 'dotenv';
dotenv.config();

const config = {
  apiKey: process.env.ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,  // You can switch to POLYGON_MAINNET if needed
  maxRetries: 5,
  retryInterval: 1000,
  timeout: 20000  // 20 seconds
};

const alchemy = new Alchemy(config);

export default alchemy;
