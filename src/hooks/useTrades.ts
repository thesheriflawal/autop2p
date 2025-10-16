import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useAutoP2P, useUSDT } from './useContract';
import { useMerchant } from './useMerchants';
import { parseUnits } from 'viem';

export type TradeType = 'buy' | 'sell';

export interface TradeData {
  merchantId: number;
  merchantAddress: string;
  accountName: string;
  accountNumber: string;
  bankCode: string;
  amount: string;
}

// Hook for creating trades (buying USDT from merchants)
export const useCreateTrade = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { address } = useAccount();
  const { approve, isPending: approvalPending, isConfirmed: approvalConfirmed } = useUSDT();
  const { createTrade, isPending: tradePending, isConfirmed: tradeConfirmed, error: tradeError } = useAutoP2P();

  const initiateTrade = async (tradeData: TradeData) => {
    try {
      setIsLoading(true);
      setError(null);

      if (!address) {
        throw new Error('Please connect your wallet');
      }

      // First approve USDT spending
      await approve(tradeData.merchantAddress, tradeData.amount);
      
      // Wait for approval confirmation
      // Note: In a real implementation, you'd wait for the approval transaction
      // to be confirmed before proceeding with the trade creation
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transaction failed');
    } finally {
      setIsLoading(false);
    }
  };

  const executeTrade = (tradeData: TradeData) => {
    createTrade(
      tradeData.merchantId,
      tradeData.merchantAddress,
      tradeData.accountName,
      tradeData.accountNumber,
      tradeData.bankCode,
      tradeData.amount
    );
  };

  return {
    initiateTrade,
    executeTrade,
    isLoading: isLoading || approvalPending || tradePending,
    isApprovalConfirmed: approvalConfirmed,
    isTradeConfirmed: tradeConfirmed,
    error: error || (tradeError?.message),
  };
};

// Hook for order interactions
export const useOrderActions = () => {
  const { address } = useAccount();
  const createTradeHook = useCreateTrade();

  const handleBuyOrder = async (merchant: { id: number; walletAddress: string }, amount: string) => {
    if (!address) {
      throw new Error('Please connect your wallet');
    }

    // In a buy order, the user is buying USDT, so they need to provide bank details
    // This would typically open a modal to collect bank details
    const tradeData: TradeData = {
      merchantId: merchant.id,
      merchantAddress: merchant.walletAddress,
      accountName: '', // Would be filled from user input
      accountNumber: '', // Would be filled from user input
      bankCode: '', // Would be filled from user input
      amount,
    };

    return createTradeHook.initiateTrade(tradeData);
  };

  const handleSellOrder = async (merchant: { id: number; walletAddress: string }, amount: string) => {
    if (!address) {
      throw new Error('Please connect your wallet');
    }

    // For sell orders, the user becomes the merchant temporarily
    // This would require different logic or a separate contract function
    throw new Error('Sell orders not yet implemented');
  };

  return {
    handleBuyOrder,
    handleSellOrder,
    ...createTradeHook,
  };
};