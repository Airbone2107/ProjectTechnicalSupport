import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo } from 'react';
import { JwtPayload, decodeToken, isTokenValid } from '../lib/jwt';

interface AuthContextType {
  user: JwtPayload | null;
  token: string | null;
  roles: string[];
  permissions: string[];
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasPermission: (requiredPermissions: string | string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<JwtPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      setIsLoading(true);
      try {
        const savedToken = localStorage.getItem('token');
        if (savedToken && isTokenValid(savedToken)) {
          const decodedUser = decodeToken(savedToken);
          setToken(savedToken);
          setUser(decodedUser);
        } else {
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };
    initializeAuth();
  }, []);

  const login = (newToken: string) => {
    if (isTokenValid(newToken)) {
      const decodedUser = decodeToken(newToken);
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(decodedUser);
    } else {
      logout();
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const roles = useMemo(() => {
    if (!user?.role) return [];
    return Array.isArray(user.role) ? user.role : [user.role];
  }, [user]);

  const permissions = useMemo(() => {
    // Luôn đảm bảo `permissions` là một mảng string[]
    if (!user?.permissions) return [];
    const perms = user.permissions;
    return Array.isArray(perms) ? perms : [perms];
  }, [user]);

  const hasPermission = (requiredPermissions: string | string[]) => {
    if (!user) return false;
    const required = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];
    
    if (required.length === 0) {
      return true;
    }
    // Sửa logic: Kiểm tra xem người dùng có ÍT NHẤT MỘT trong các quyền được yêu cầu không
    // `permissions` từ `useMemo` đã được đảm bảo là một mảng.
    return required.some(p => permissions.includes(p));
  };
  
  const isAuthenticated = !!token && !!user && !isLoading;

  const value = {
    user,
    token,
    roles, 
    permissions,
    login,
    logout,
    isAuthenticated,
    isLoading,
    hasPermission
  };

  return (
    <AuthContext.Provider value={value}>
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