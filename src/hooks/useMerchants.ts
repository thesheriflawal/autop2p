import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { merchantApi, type Merchant } from "@/services/api";

// Hook for fetching merchants
export const useMerchants = (params?: {
  page?: number;
  limit?: number;
  currency?: string;
  minRate?: number;
  maxRate?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  search?: string;
  hasBalance?: boolean;
}) => {
  return useQuery({
    queryKey: ["merchants", params],
    queryFn: () => merchantApi.getAll(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Hook for fetching specific merchant by wallet
export const useMerchant = (walletAddress?: string) => {
  return useQuery({
    queryKey: ["merchant", walletAddress?.toLowerCase()],
    queryFn: () =>
      walletAddress
        ? merchantApi.getByWallet(walletAddress.toLowerCase())
        : null,
    enabled: !!walletAddress,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Hook for creating merchant
export const useCreateMerchant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: merchantApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchants"] });
    },
  });
};

// Hook for updating merchant profile
export const useUpdateMerchant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      merchantId,
      data,
    }: {
      merchantId: number;
      data: Partial<Merchant>;
    }) => merchantApi.updateProfile(merchantId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["merchants"] });
      queryClient.invalidateQueries({
        queryKey: ["merchant", variables.merchantId],
      });
    },
  });
};

// Hook for updating merchant profile by wallet
export const useUpdateMerchantByWallet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      walletAddress,
      data,
    }: {
      walletAddress: string;
      data: Partial<Merchant>;
    }) => merchantApi.updateProfileByWallet(walletAddress.toLowerCase(), data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["merchants"] });
      queryClient.invalidateQueries({
        queryKey: ["merchant", variables.walletAddress],
      });
    },
  });
};

// Hook for merchant stats
export const useMerchantStats = (merchantId?: number) => {
  return useQuery({
    queryKey: ["merchant-stats", merchantId],
    queryFn: () => (merchantId ? merchantApi.getStats(merchantId) : null),
    enabled: !!merchantId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Hook for merchant transactions
export const useMerchantTransactions = (
  merchantId?: number,
  params?: {
    limit?: number;
    offset?: number;
    status?: string;
  }
) => {
  return useQuery({
    queryKey: ["merchant-transactions", merchantId, params],
    queryFn: () =>
      merchantId ? merchantApi.getTransactions(merchantId, params) : null,
    enabled: !!merchantId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// Hook for merchant withdrawal
export const useMerchantWithdrawal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      merchantId,
      data,
    }: {
      merchantId: number;
      data: {
        amount: number;
        bankName: string;
        accountNumber: string;
        accountName: string;
        narration?: string;
        bankCode: string;
      };
    }) => merchantApi.withdrawal(merchantId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["merchant", variables.merchantId],
      });
      queryClient.invalidateQueries({
        queryKey: ["merchant-stats", variables.merchantId],
      });
    },
  });
};

// Hook for withdrawal eligibility
export const useWithdrawalEligibility = (
  merchantId?: number,
  amount?: number
) => {
  return useQuery({
    queryKey: ["withdrawal-eligibility", merchantId, amount],
    queryFn: () =>
      merchantId && amount
        ? merchantApi.checkWithdrawalEligibility(merchantId, amount)
        : null,
    enabled: !!merchantId && !!amount,
    staleTime: 1000 * 30, // 30 seconds
  });
};

// Hook for withdrawal history
export const useWithdrawalHistory = (
  merchantId?: number,
  params?: {
    page?: number;
    limit?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
  }
) => {
  return useQuery({
    queryKey: ["withdrawal-history", merchantId, params],
    queryFn: () =>
      merchantId ? merchantApi.getWithdrawalHistory(merchantId, params) : null,
    enabled: !!merchantId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
