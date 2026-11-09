import axios from "axios";
import type {
  Trade,
  NewTradePayload,
  MarketNews,
  DailyJournal,
} from "../types";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Configured Axios Instance
export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 5000,
  withCredentials: true,
});

// Global Interceptor for Error & Session Handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized session, redirecting to login...");
    }
    return Promise.reject(error);
  },
);

// Generic API Response Wrapper
interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// Modular Domain Services
export const tradesApi = {
  getAll: async (): Promise<ApiResponse<Trade[]>> => {
    const res = await api.get<ApiResponse<Trade[]>>("/trades");
    return res.data;
  },
  create: async (data: NewTradePayload): Promise<ApiResponse<Trade>> => {
    const res = await api.post<ApiResponse<Trade>>("/trades", data);
    return res.data;
  },
  update: async (
    id: number,
    data: Partial<Trade>,
  ): Promise<ApiResponse<Trade>> => {
    const res = await api.patch<ApiResponse<Trade>>(`/trades/${id}`, data);
    return res.data;
  },
};

export const newsApi = {
  getAll: async (ticker?: string): Promise<ApiResponse<MarketNews[]>> => {
    const params = ticker ? { ticker } : {};
    const res = await api.get<ApiResponse<MarketNews[]>>("/news", { params });
    return res.data;
  },
  create: async (
    data: Partial<MarketNews>,
  ): Promise<ApiResponse<MarketNews>> => {
    const res = await api.post<ApiResponse<MarketNews>>("/news", data);
    return res.data;
  },
};

export const journalApi = {
  getAll: async (): Promise<ApiResponse<DailyJournal[]>> => {
    const res = await api.get<ApiResponse<DailyJournal[]>>("/journal");
    return res.data;
  },
  create: async (
    data: Partial<DailyJournal>,
  ): Promise<ApiResponse<DailyJournal>> => {
    const res = await api.post<ApiResponse<DailyJournal>>("/journal", data);
    return res.data;
  },
};
