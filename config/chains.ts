// Camp Network Chain Configuration
import { defineChain } from 'viem';

export const campNetwork = defineChain({
  id: 123420001114,
  name: 'BaseCamp Testnet',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.basecamp.t.raas.gelato.cloud'],
    },
  },
  blockExplorers: {
    default: {
      name: 'BaseCamp Explorer',
      url: 'https://explorer.basecamp.t.raas.gelato.cloud',
    },
  },
  testnet: true,
});
