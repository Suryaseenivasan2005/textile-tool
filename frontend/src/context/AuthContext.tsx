import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '@/services/api';
import { STORAGE_KEYS } from '@/constants';

interface User {
  id: string;
  name: string;
  mobile: string;
}

interface AuthContextType {
  user: User | null;
  login: (mobile: string, password: string) => Promise<boolean>;
  register: (mobile: string, password: string, name?: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
    const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
    
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        // Optionally verify token with backend
      } catch (error) {
        // Invalid stored data, clear it
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
      }
    }
  }, []);

  const login = async (mobile: string, password: string): Promise<boolean> => {
    try {
      const response = await apiService.login(mobile, password);
      
      const userData: User = {
        id: response.user.id,
        name: response.user.name,
        mobile: response.user.mobile,
      };
      
      setUser(userData);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
      localStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
      
      return true;
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (mobile: string, password: string, name?: string): Promise<boolean> => {
    try {
      const response = await apiService.register(mobile, password, name);
      
      const userData: User = {
        id: response.user.id,
        name: response.user.name,
        mobile: response.user.mobile,
      };
      
      setUser(userData);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
      localStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
      
      return true;
    } catch (error: any) {
      console.error('Register error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
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

