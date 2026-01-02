// Définir d'abord le type User
export interface User {
  id: number;
  email: string;
  name: string;
  code_role: 'admin' | 'comptable' | 'commercial' | 'utilisateur';
  // Ajoutez d'autres propriétés selon votre modèle
}

// Types pour les réponses API
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  valid?: boolean;
}

// Types spécifiques pour l'authentification
export interface LoginResponse {
  user: User;
  token: string;
}

export interface ValidateTokenResponse {
  user: User;
  valid: boolean;
}

// Types existants (gardez les vôtres)
export interface LoginData {
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextType extends AuthState {
  login: (data: LoginData) => Promise<void>;
  logout: () => void;
  validateToken: () => Promise<boolean>;
  hasPermission: (module: string, action: string) => boolean;
  hasRole: (roles: string[]) => boolean;
}