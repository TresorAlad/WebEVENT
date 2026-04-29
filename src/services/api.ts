import axios from 'axios';
import { auth } from '../config/firebase';

// Pour le développement local avec le backend sur la même machine
const LOCAL_API_URL = 'http://localhost:5000/api';
const REMOTE_API_URL = 'https://backend-vhub.vercel.app/api';

// Utilise l'URL locale en mode développement si pas de VITE_API_URL définie
const API_URL = import.meta.env.VITE_API_URL || 
                (import.meta.env.DEV ? LOCAL_API_URL : REMOTE_API_URL);

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    try {
      const token = await user.getIdToken();
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
  return response.data;
};

export const getAllEvents = async () => {
  const response = await api.get('/events');
  return response.data;
};

export const getDashboardStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};

export const getUserGrowth = async () => {
  const response = await api.get('/admin/user-growth');
  return response.data;
};

export const getActivities = async () => {
  const response = await api.get('/admin/activity');
  return response.data;
};

export const getUsers = async () => {
  const response = await api.get('/admin/users');
  return response.data;
};

export const getTransactions = async () => {
  const response = await api.get('/admin/transactions');
  return response.data;
};

export const getRevenueGrowth = async () => {
  const response = await api.get('/admin/revenue-growth');
  return response.data;
};

export const updateProfile = async (profileData: { name: string; avatar: string; bio: string }) => {
  const response = await api.put('/auth/profile', profileData);
  return response.data;
};

export const createEvent = async (formData: FormData) => {
  const response = await api.post('/events', formData);
  return response.data;
};

export default api;
