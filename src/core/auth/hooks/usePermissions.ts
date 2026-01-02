// src/core/auth/hooks/usePermissions.ts
import { useAuth } from './useAuth';

export const usePermissions = () => {
  const { hasPermission, hasRole, user } = useAuth();

  const canAccessModule = (module: string): boolean => {
    return hasPermission(module, 'read');
  };

  const canWriteModule = (module: string): boolean => {
    return hasPermission(module, 'write');
  };

  const isAdmin = (): boolean => {
    return user?.role === 'admin';
  };

  const isComptable = (): boolean => {
    return user?.role === 'comptable';
  };

  const isCommercial = (): boolean => {
    return user?.role === 'commercial';
  };

  return {
    canAccessModule,
    canWriteModule,
    isAdmin,
    isComptable,
    isCommercial,
    hasPermission,
    hasRole,
    userRole: user?.role
  };
};