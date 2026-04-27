import axios from 'axios';
import { auth } from '../config/firebase';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const syncUserWithBackend = async () => {
  const response = await api.post('/auth/sync');
  return response.data;
};

export const getAllEvents = async () => {
  const response = await api.get('/events');
  return response.data;
};

export const updateProfile = async (profileData: { name: string; avatar: string; bio: string }) => {
  const response = await api.put('/auth/profile', profileData);
  return response.data;
};

export default api;
