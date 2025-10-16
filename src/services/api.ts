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

export interface CreateMerchantRequest {
  walletAddress: string;
  name: string;
  email: string;
  currency: string;
  paymentMethods: string[];
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

export default api;
