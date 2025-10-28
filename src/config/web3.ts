import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { defineChain } from 'viem';

// Define Lisk Sepolia chain
export const liskSepolia = defineChain({
  id: 4202,
  name: 'Lisk Sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Sepolia Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.sepolia-api.lisk.com'],
    },
    public: {
      http: ['https://rpc.sepolia-api.lisk.com'],
    },
  },
  blockExplorers: {
    default: { name: 'Blockscout', url: 'https://sepolia-blockscout.lisk.com' },
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
  chains: [liskSepolia],
  transports: {
    [liskSepolia.id]: http(),
  },
  ssr: false,
});
