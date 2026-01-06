// Types pour le système d'authentification

// Interface de base pour l'utilisateur
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
  updated_at?: string;
}

// Interface pour l'utilisateur avec toutes les données complètes (retour API)
export interface UserFull extends User {
  id_user?: number;
  password_hash?: string;
  id_role?: number;
  code_role?: string;
  role_description?: string;
}

// Permissions
export interface Permission {
  module: string;
  actions: string[];
}

export interface UserWithPermissions extends User {
  permissions?: Permission[];
}

// Données de connexion
export interface LoginCredentials {
  email: string;
  password: string;
}

// Réponses API génériques
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
}

export interface ApiError {
  success: false;
  message: string;
  error?: string;
  statusCode?: number;
}

// Réponses spécifiques
export interface LoginResponse {
  user: User;
  token: string;
}

export interface ValidateTokenResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    isValid: boolean;
  };
}

// Gestion des utilisateurs
export interface CreateUserData {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  role: 'admin' | 'comptable' | 'commercial';
}

export interface UpdateUserData {
  email?: string;
  password?: string;
  nom?: string;
  prenom?: string;
  role?: 'admin' | 'comptable' | 'commercial';
  is_active?: boolean;
}

export interface UserListResponse {
  users: User[];
}

// Réponses API pour les utilisateurs
export interface CreateUserResponse {
  user: UserFull;
}

export interface UpdateUserResponse {
  user: UserFull;
}

// État d'authentification
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Type pour le contexte d'authentification
export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  validateToken: () => Promise<boolean>;
  fetchUsers: () => Promise<User[]>;
  createUser: (userData: CreateUserData) => Promise<User>;
  updateUser: (id: number, userData: UpdateUserData) => Promise<User>;
  toggleUserStatus: (id: number, activate: boolean) => Promise<void>;
  getUserById?: (id: number) => Promise<User>;
  hasPermission: (module: string, action: string) => boolean;
  hasRole: (role: User['role']) => boolean;
}