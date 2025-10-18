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
  AUTOP2P: '0x5c7707D0b70bc56a210464812B0141953e8c95aa' as const,
  USDT: '0xD35d4d76841d6223F7244D6D723E102E38b005b0' as const,
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
