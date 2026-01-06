// frontend/src/core/auth/services/authApi.ts
import type { 
  ApiResponse, 
  LoginResponse, 
  ValidateTokenResponse, 
  User,
  LoginCredentials ,CreateUserData,  
  UpdateUserData 
} from '../types';
import api from '../../../core/config/axios';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

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
        setAuthData(response.data.data.user, response.data.data.token);
      }
      
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur de connexion');
    }
  },

  getToken,
  setAuthData,
  getCurrentUser,
  logout,
  isAuthenticated,
  getAuthHeaders,

  async validateToken(): Promise<ApiResponse<ValidateTokenResponse>> {
    try {
      const token = getToken(); 
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

 
  async getUsers(): Promise<ApiResponse<User[]>> {
    try {
      const response = await api.get('/auth/users');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur de récupération des utilisateurs');
    }
  },

  // Créer un utilisateur
  async createUser(userData: CreateUserData): Promise<ApiResponse<User>> {
    try {
      const response = await api.post('/auth/users', userData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur de création d\'utilisateur');
    }
  },

  // Mettre à jour un utilisateur
  async updateUser(id: number, userData: UpdateUserData): Promise<ApiResponse<User>> {
    try {
      const response = await api.put(`/auth/users/${id}`, userData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur de mise à jour d\'utilisateur');
    }
  },

  // Désactiver un utilisateur
  async deactivateUser(id: number): Promise<ApiResponse<void>> {
    try {
      const response = await api.patch(`/auth/users/${id}/deactivate`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur de désactivation d\'utilisateur');
    }
  },

  // Activer un utilisateur
  async activateUser(id: number): Promise<ApiResponse<void>> {
    try {
      const response = await api.patch(`/auth/users/${id}/activate`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur d\'activation d\'utilisateur');
    }
  },

  // Récupérer un utilisateur par ID
  async getUserById(id: number): Promise<ApiResponse<User>> {
    try {
      const response = await api.get(`/auth/users/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur de récupération de l\'utilisateur');
    }
  }
};