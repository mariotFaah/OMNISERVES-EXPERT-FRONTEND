import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, LoginCredentials, UserWithPermissions } from '../auth/types';
import { authApi } from '../auth/services/authApi';

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  hasPermission: (module: string, action: string) => boolean;
  hasRole: (role: User['role']) => boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = authApi.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(credentials);
      if (response.success) {
        const { user, token } = response.data;
        authApi.setAuthData(user, token);
        setUser(user);
      } else {
        throw new Error(response.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
  };

  const isAuthenticated = !!user;
  
  const hasRole = (role: User['role']) => {
    return user?.role === role || user?.role === 'admin';
  };

   const hasPermission = (module: string, action: string): boolean => {
    if (!user) return false;
    
    // Si l'utilisateur est admin, il a tous les droits
    if (user.role === 'admin') return true;
    
    // Vérifier les permissions spécifiques si elles existent
    const userWithPermissions = user as UserWithPermissions;
    const modulePermission = userWithPermissions.permissions?.find(
      p => p.module === module
    );
    
    return modulePermission?.actions.includes(action) || false;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAuthenticated, 
      hasRole,
      isLoading,
      hasPermission, 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};