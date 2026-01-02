import axios from 'axios';
import { authApi } from '../auth/services/authApi';

const instance = axios.create({
  baseURL: 'https://omniserves-experts-backend.vercel.app/api',
  timeout: 10000,
});

// Intercepteur pour ajouter le token aux requêtes
instance.interceptors.request.use(
  (config) => {
    const token = authApi.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs d'authentification
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      authApi.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default instance;