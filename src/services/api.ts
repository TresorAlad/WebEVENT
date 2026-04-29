import axios from 'axios';
import { auth } from '../config/firebase';

const API_URL = import.meta.env.VITE_API_URL?.trim();

if (!API_URL) {
  throw new Error(
    'Missing VITE_API_URL. Define it in web-admin/.env (e.g. http://localhost:5000/api).'
  );
}

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  message?: string;
};

const unwrap = <T>(payload: T | ApiEnvelope<T>): T => {
  if (payload && typeof payload === 'object' && 'success' in (payload as Record<string, unknown>)) {
    return (payload as ApiEnvelope<T>).data;
  }
  return payload as T;
};

api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    try {
      const token = await user.getIdToken(true);
      config.headers.Authorization = `Bearer ${token}`;
    } catch (err) {
      console.error('Error getting auth token:', err);
    }
  }
  return config;
});

// Interceptor for better error logging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(`[API Error] ${error.response?.status || 'Network'} on ${error.config?.url}:`, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const syncUserWithBackend = async () => {
  const response = await api.post('/auth/sync');
  return unwrap(response.data);
};

export const getAllEvents = async () => {
  const response = await api.get('/events');
  return unwrap(response.data);
};

export const getDashboardStats = async () => {
  const response = await api.get('/admin/stats');
  return unwrap(response.data);
};

export const getUserGrowth = async () => {
  const response = await api.get('/admin/user-growth');
  return unwrap(response.data);
};

export const getActivities = async () => {
  const response = await api.get('/admin/activity');
  return unwrap(response.data);
};

export const getUsers = async () => {
  const response = await api.get('/admin/users');
  return unwrap(response.data);
};

export const getTransactions = async () => {
  const response = await api.get('/admin/transactions');
  return unwrap(response.data);
};

export const getRevenueGrowth = async () => {
  const response = await api.get('/admin/revenue-growth');
  return unwrap(response.data);
};

export const updateProfile = async (profileData: { name: string; avatar: string; bio: string }) => {
  const response = await api.put('/auth/profile', profileData);
  return unwrap(response.data);
};

export const createEvent = async (formData: FormData) => {
  const response = await api.post('/events', formData);
  return unwrap(response.data);
};

export default api;
