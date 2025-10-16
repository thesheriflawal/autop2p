import { useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits, type Address } from 'viem';
import { CONTRACTS } from '@/config/web3';
import { AUTOP2P_ABI, USDT_ABI } from '@/config/contracts';

// Hook for USDT token interactions
export const useUSDT = () => {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const approve = (spender: string, amount: string) => {
    const amountInWei = parseUnits(amount, 6);
    writeContract({
      address: CONTRACTS.USDT as Address,
      abi: USDT_ABI,
      functionName: 'approve',
      args: [spender as Address, amountInWei],
    });
  };

  const faucet = () => {
    writeContract({
      address: CONTRACTS.USDT as Address,
      abi: USDT_ABI,
      functionName: 'faucet',
    });
  };

  return { approve, faucet, hash, isPending, isConfirming, isConfirmed, error };
};

// Hook for reading USDT balance
export const useUSDTBalance = (address?: string) => {
  const { data, isLoading, refetch } = useReadContract({
    address: CONTRACTS.USDT as Address,
    abi: USDT_ABI,
    functionName: 'balanceOf',
    args: address ? [address as Address] : undefined,
    query: { enabled: !!address },
  });

  return {
    balance: data ? formatUnits(data as bigint, 6) : '0',
    isLoading,
    refetch,
  };
};

// Hook for AutoP2P contract interactions
export const useAutoP2P = () => {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const createTrade = (
    merchantId: number,
    merchantAddress: string,
    accountName: string,
    accountNumber: string,
    bankCode: string,
    amount: string
  ) => {
    const amountInWei = parseUnits(amount, 6);
    writeContract({
      address: CONTRACTS.AUTOP2P as Address,
      abi: AUTOP2P_ABI,
      functionName: 'createTrade',
      args: [BigInt(merchantId), merchantAddress as Address, accountName, accountNumber, bankCode, amountInWei],
    });
  };

  const releaseFunds = (tradeId: number) => {
    writeContract({
      address: CONTRACTS.AUTOP2P as Address,
      abi: AUTOP2P_ABI,
      functionName: 'releaseFunds',
      args: [BigInt(tradeId)],
    });
  };

  const raiseDispute = (tradeId: number, reason: string) => {
    writeContract({
      address: CONTRACTS.AUTOP2P as Address,
      abi: AUTOP2P_ABI,
      functionName: 'raiseDispute',
      args: [BigInt(tradeId), reason],
    });
  };

  return { createTrade, releaseFunds, raiseDispute, hash, isPending, isConfirming, isConfirmed, error };
};

// Hook for reading trade data
export const useTrade = (tradeId?: number) => {
  const { data, isLoading, refetch } = useReadContract({
    address: CONTRACTS.AUTOP2P as Address,
    abi: AUTOP2P_ABI,
    functionName: 'getTrade',
    args: tradeId !== undefined ? [BigInt(tradeId)] : undefined,
    query: { enabled: tradeId !== undefined },
  });

  return { trade: data, isLoading, refetch };
};

// Hook for reading user trades
export const useUserTrades = (userAddress?: string) => {
  const { data, isLoading, refetch } = useReadContract({
    address: CONTRACTS.AUTOP2P as Address,
    abi: AUTOP2P_ABI,
    functionName: 'getUserTrades',
    args: userAddress ? [userAddress as Address] : undefined,
    query: { enabled: !!userAddress },
  });

  return { tradeIds: data as bigint[] | undefined, isLoading, refetch };
};
