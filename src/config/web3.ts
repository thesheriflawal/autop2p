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
  AUTOP2P: '0x9796e1c30741C9db6BB333241f05B2D8CA5af63E' as const,
  USDT: '0x61aE963133371EdEc72Fd4f86B4AdD3E3Ac03b43' as const,
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
