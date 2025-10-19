import { useQuery } from '@tanstack/react-query';
import { fetchBybitP2PNgnRate } from '@/services/rates';

export function useBybitRate(options?: { refetchIntervalMs?: number }) {
  return useQuery({
    queryKey: ['bybit-p2p-rate-ngn'],
    queryFn: () => fetchBybitP2PNgnRate({ side: 1, amount: 100000, useProxy: true }),
    refetchInterval: options?.refetchIntervalMs ?? 30_000,
    staleTime: 20_000,
  });
}