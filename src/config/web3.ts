import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { defineChain } from 'viem';


export const hederaTestnet = defineChain({
  id: 296, // Hedera Testnet chain ID (EVM-compatible)
  name: 'Hedera Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Hedera',
    symbol: 'HBAR',
  },
  rpcUrls: {
    default: {
      http: ['https://testnet.hashio.io/api'],
    },
    public: {
      http: ['https://testnet.hashio.io/api'],
    },
  },
  blockExplorers: {
    default: {
      name: 'HashScan',
      url: 'https://hashscan.io/testnet',
    },
  },
  testnet: true,
});


// Contract addresses
export const CONTRACTS = {
  AUTOP2P: '0xCB9b33444D8a0c228Cd0878A7C0AeFaF5aC5ac77' as const,
  USDT: '0x9700712F87B1BF6F5A731882a221BBA27fE34BE0' as const,
};

// RainbowKit configuration
export const config = getDefaultConfig({
  appName: 'AutoP2P',
  projectId: 'YOUR_PROJECT_ID', // Get this from WalletConnect Cloud
  chains: [hederaTestnet],
  transports: {
    [hederaTestnet.id]: http(),
  },
  ssr: false,
});
