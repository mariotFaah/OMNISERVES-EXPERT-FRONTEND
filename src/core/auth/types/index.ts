// Types pour le système d'authentification
export interface User {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  role: 'admin' | 'comptable' | 'commercial';
  nom_role?: string;
  is_active?: boolean;
  last_login?: string;
  created_at?: string;
  // Supprimez code_role ou ajoutez-le si nécessaire
  // code_role?: string; // Décommentez si vous en avez besoin
}

// Ajoutez ces interfaces pour les permissions
export interface Permission {
  module: string;
  actions: string[];
}

export interface UserWithPermissions extends User {
  permissions?: Permission[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: LoginResponse;
}

export interface ApiError {
  success: false;
  message: string;
  error?: string;
  statusCode?: number;
}

// Types pour la gestion des utilisateurs (admin)
export interface CreateUserData {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  role: 'admin' | 'comptable' | 'commercial';
}

export interface UpdateUserData {
  email?: string;
  nom?: string;
  prenom?: string;
  role?: 'admin' | 'comptable' | 'commercial';
}

export interface UserListResponse {
  users: User[];
}

// État d'authentification
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Ajoutez cette interface
export interface ValidateTokenResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    isValid: boolean;
  };
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  validateToken: () => Promise<boolean>;
}