// frontend/src/core/auth/services/authApi.ts
import type { 
  ApiResponse, 
  LoginResponse, 
  ValidateTokenResponse, 
  User,
  LoginCredentials 
} from '../types';
import api from '../../../core/config/axios';

// Clés pour le localStorage
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

// ✅ DÉPLACER les méthodes de gestion du token en dehors de l'objet
const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

const setAuthData = (user: User, token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem(USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
};

const logout = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

const isAuthenticated = (): boolean => {
  return !!getToken() && !!getCurrentUser();
};

const getAuthHeaders = (): { Authorization: string } | {} => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const authApi = {
  async login(credentials: LoginCredentials): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await api.post('/auth/login', credentials);
      
      if (response.data.success) {
        // ✅ CORRECTION : Utiliser les fonctions directement, pas this.
        setAuthData(response.data.data.user, response.data.data.token);
      }
      
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur de connexion');
    }
  },

  // ✅ RÉFÉRENCER les fonctions existantes
  getToken,
  setAuthData,
  getCurrentUser,
  logout,
  isAuthenticated,
  getAuthHeaders,

  // Validation du token (optionnelle)
  async validateToken(): Promise<ApiResponse<ValidateTokenResponse>> {
    try {
      const token = getToken(); // ✅ Utiliser la fonction directement
      if (!token) {
        throw new Error('Aucun token disponible');
      }
      
      const response = await api.get('/auth/verify', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Token invalide');
    }
  },
};