// src/core/config/axios.ts
import axios from 'axios';
import { authApi } from '../auth/services/authApi';

// ✅ Instance Axios centralisée
const instance = axios.create({
  //baseURL: 'https://omniserves-experts-backend.vercel.app/api', // Base URL de ton backend
  //baseURL:'http://localhost:3001/api',
  baseURL: 'https://omniserves-expert-backend.onrender.com/api',
  timeout: 10000, // 10 secondes max
  headers: {
    'Content-Type': 'application/json'
  }
});

// 🔹 Intercepteur pour ajouter le token automatiquement
instance.interceptors.request.use(
  (config) => {
    const token = authApi.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🔹 Intercepteur pour gérer les erreurs 401 (token expiré)
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Token expiré ou invalide, déconnexion en cours...');
      authApi.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default instance;
