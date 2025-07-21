import { Network, Alchemy } from 'alchemy-sdk';

const settings = {
  apiKey: "S5Nsyn9SRKGAN-70ggljVh8pZ2pfkP0B",
  network: Network.ETH_MAINNET,
};

const alchemy = new Alchemy(settings);

const main = async () => {
  let logs = await alchemy.core.getLogs({
    address: "0xb59f67a8bff5d8cd03f6ac17265c550ed8f33907",
    fromBlock: "0x429d3b",
    toBlock: "latest",
    topics: [
      "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
      "0x00000000000000000000000000b46c2526e227482e2ebb8f4c69e4674d262e75",
      "0x00000000000000000000000054a2d42a40f51259dedd1978f6c118a0f0eff078"
    ]
  });
  console.log(logs);
};

main();