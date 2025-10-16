import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adsApi, type Advertisement, type CreateAdvertisementRequest } from "@/services/api";

export const useAds = (params?: {
  page?: number;
  limit?: number;
  token?: string;
  type?: 'BUY' | 'SELL';
  isActive?: boolean;
  localCurrency?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}) => {
  return useQuery({
    queryKey: ["ads", params],
    queryFn: () => adsApi.getAll(params),
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
    retry: 1,
  });
};

export const useMerchantAds = (merchantId?: number, params?: { page?: number; limit?: number; isActive?: boolean }) => {
  return useQuery({
    queryKey: ["merchant-ads", merchantId, params],
    queryFn: () => (merchantId ? adsApi.getMerchantAds(merchantId, params) : null),
    enabled: !!merchantId,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
    retry: 1,
  });
};

export const useCreateAd = (merchantId?: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAdvertisementRequest) => {
      if (!merchantId) throw new Error("Missing merchantId");
      return adsApi.create(merchantId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchant-ads", merchantId] });
      queryClient.invalidateQueries({ queryKey: ["ads"] });
    },
  });
};

export const useToggleAd = (merchantId?: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (adId: number) => {
      if (!merchantId) throw new Error("Missing merchantId");
      return adsApi.toggle(merchantId, adId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchant-ads", merchantId] });
      queryClient.invalidateQueries({ queryKey: ["ads"] });
    },
  });
};

export const useUpdateAd = (merchantId?: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ adId, data }: { adId: number; data: Partial<CreateAdvertisementRequest> | { isActive: boolean } }) => {
      if (!merchantId) throw new Error("Missing merchantId");
      return adsApi.update(merchantId, adId, data);
    },
    onMutate: async ({ adId, data }) => {
      await queryClient.cancelQueries({ queryKey: ["merchant-ads", merchantId] });
      const prev = queryClient.getQueryData<any>(["merchant-ads", merchantId, undefined]);
      if (prev?.data?.ads) {
        const next = {
          ...prev,
          data: {
            ...prev.data,
            ads: prev.data.ads.map((a: any) => (a.id === adId ? { ...a, ...data } : a)),
          },
        };
        queryClient.setQueryData(["merchant-ads", merchantId, undefined], next);
      }
      return { prev };
    },
    onError: (_err, _variables, context) => {
      if (context?.prev) {
        queryClient.setQueryData(["merchant-ads", merchantId, undefined], context.prev);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["merchant-ads", merchantId] });
      queryClient.invalidateQueries({ queryKey: ["ads"] });
    },
  });
};

export const useDeleteAd = (merchantId?: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (adId: number) => {
      if (!merchantId) throw new Error("Missing merchantId");
      return adsApi.remove(merchantId, adId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchant-ads", merchantId] });
      queryClient.invalidateQueries({ queryKey: ["ads"] });
    },
  });
};
