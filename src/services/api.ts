import axios from 'axios';

const API_BASE_URL = 'https://airp2p-backend.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Merchant {
  id: number;
  walletAddress: string;
  name: string;
  email: string;
  adRate: string;
  balance: string;
  currency: string;
  isActive: boolean;
  minOrder: string;
  maxOrder: string;
  paymentMethods: string[];
  createdAt: string;
  updatedAt: string;
}

// Ads
export type AdType = 'BUY' | 'SELL';
export interface Advertisement {
  id: number;
  merchantId: number;
  title: string;
  token: 'USDT' | string;
  type: AdType;
  exchangeRate: number; // NGN per USDT
  localCurrency: 'NGN' | string;
  minAmount: number;
  maxAmount: number;
  availableAmount: number;
  paymentMethods: string[];
  tradingTerms?: string;
  autoReply?: string;
  isActive: boolean;
  geolocation?: Record<string, any>;
  tags?: string[];
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  lastActiveAt?: string;
}

export interface CreateAdvertisementRequest {
  title?: string;
  token: 'USDT' | string;
  type: AdType;
  exchangeRate: number; // NGN per USDT
  localCurrency: 'NGN' | string;
  minAmount: number;
  maxAmount: number;
  availableAmount: number;
  paymentMethods: string[];
  tradingTerms?: string;
  autoReply?: string;
  geolocation?: Record<string, any>;
  tags?: string[];
}

export interface CreateMerchantRequest {
  walletAddress: string;
  name: string;
  email: string;
  currency?: string;
  paymentMethods?: string[];
  // Ad details (optional on create but supported by backend)
  adRate?: number | string;
  minOrder?: number | string;
  maxOrder?: number | string;
}

export interface Transaction {
  id: number;
  merchantId: number;
  userAddress: string;
  amount: string;
  status: string;
  txHash: string;
}

// Merchant APIs
export const merchantApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    currency?: string;
    minRate?: number;
    maxRate?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    search?: string;
    hasBalance?: boolean;
  }) => {
    const response = await api.get('/merchants', { params });
    return response.data;
  },

  create: async (data: CreateMerchantRequest) => {
    const response = await api.post('/merchants', data);
    return response.data;
  },

  getByWallet: async (walletAddress: string) => {
    const response = await api.get(`/merchants/${walletAddress}`);
    return response.data;
  },

  getRate: async (walletAddress: string) => {
    const response = await api.get(`/merchants/${walletAddress}/rate`);
    return response.data;
  },

  updateProfile: async (merchantId: number, data: Partial<Merchant>) => {
    const response = await api.put(`/merchants/${merchantId}/profile`, data);
    return response.data;
  },

  updateProfileByWallet: async (walletAddress: string, data: Partial<Merchant>) => {
    const response = await api.put(`/merchants/wallet/${walletAddress}/profile`, data);
    return response.data;
  },

  getStats: async (merchantId: number) => {
    const response = await api.get(`/merchants/${merchantId}/stats`);
    return response.data;
  },

  getTransactions: async (
    merchantId: number,
    params?: {
      limit?: number;
      offset?: number;
      status?: string;
    }
  ) => {
    const response = await api.get(`/merchants/${merchantId}/transactions`, { params });
    return response.data;
  },

  withdrawal: async (
    merchantId: number,
    data: {
      amount: number;
      bankName: string;
      accountNumber: string;
      accountName: string;
      narration?: string;
      bankCode?: string; // optional for backward compatibility
      bank_code?: string; // optional snake_case variant
    }
  ) => {
    const response = await api.post(`/merchants/${merchantId}/withdrawal`, data);
    return response.data;
  },

  checkWithdrawalEligibility: async (merchantId: number, amount: number) => {
    const response = await api.get(`/merchants/${merchantId}/withdrawal/eligibility`, {
      params: { amount },
    });
    return response.data;
  },

  getWithdrawalHistory: async (
    merchantId: number,
    params?: {
      page?: number;
      limit?: number;
      status?: string;
      startDate?: string;
      endDate?: string;
    }
  ) => {
    const response = await api.get(`/merchants/${merchantId}/withdrawal/history`, { params });
    return response.data;
  },
};

// System APIs
export const systemApi = {
  health: async () => {
    const response = await api.get('/health');
    return response.data;
  },

  getInfo: async () => {
    const response = await api.get('/');
    return response.data;
  },
};

// Payments APIs
export const paymentsApi = {
  getBanks: async (): Promise<{
    success: boolean;
    message: string;
    data: { name: string; code: string; logo: string }[];
    count?: number;
  }> => {
    const response = await api.get('/payments/banks');
    return response.data;
  },
};

// Advertisements APIs
export const adsApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    token?: string;
    type?: AdType;
    minRate?: number;
    maxRate?: number;
    localCurrency?: string;
    paymentMethod?: string;
    isActive?: boolean;
    search?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }): Promise<{ success: boolean; message: string; data: { ads: Advertisement[]; pagination: any } }> => {
    const response = await api.get('/ads', { params });
    return response.data;
  },
  search: async (params: {
    q: string;
    token?: string;
    type?: AdType;
    minRate?: number;
    maxRate?: number;
    localCurrency?: string;
    paymentMethods?: string; // comma-separated
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get('/ads/search', { params });
    return response.data;
  },
  summary: async () => {
    const response = await api.get('/ads/summary');
    return response.data;
  },
  getById: async (adId: number) => {
    const response = await api.get(`/ads/${adId}`);
    return response.data;
  },
  getMerchantAds: async (merchantId: number, params?: { page?: number; limit?: number; isActive?: boolean }) => {
    const response = await api.get(`/merchants/${merchantId}/ads`, { params });
    return response.data;
  },
  create: async (merchantId: number, data: CreateAdvertisementRequest) => {
    const response = await api.post(`/merchants/${merchantId}/ads`, data);
    return response.data;
  },
  update: async (merchantId: number, adId: number, data: Partial<CreateAdvertisementRequest>) => {
    const response = await api.put(`/merchants/${merchantId}/ads/${adId}`, data);
    return response.data;
  },
  remove: async (merchantId: number, adId: number) => {
    const response = await api.delete(`/merchants/${merchantId}/ads/${adId}`);
    return response.data;
  },
  toggle: async (merchantId: number, adId: number) => {
    const response = await api.patch(`/merchants/${merchantId}/ads/${adId}/toggle`);
    return response.data;
  },
};

export default api;
