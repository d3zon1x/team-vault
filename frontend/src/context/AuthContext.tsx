import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types/auth';
import { authStorage } from '../lib/authStorage';
import apiClient from '../lib/apiClient';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  clearUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from storage
  useEffect(() => {
    const initAuth = async () => {
      const storedUser = authStorage.getUser();
      if (storedUser) {
        setUser(storedUser);
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    const { access_token, refresh_token } = response.data;

    authStorage.setTokens({
      accessToken: access_token,
      refreshToken: refresh_token,
    });

    await fetchUser();
  };

  const loginWithGoogle = async (idToken: string) => {
    const response = await apiClient.post('/auth/google', {
      id_token: idToken,
    });
    const { access_token, refresh_token } = response.data;

    authStorage.setTokens({
      accessToken: access_token,
      refreshToken: refresh_token,
    });

    await fetchUser();
  };

  const register = async (
    email: string,
    username: string,
    password: string,
  ) => {
    await apiClient.post('/auth/register', {
      email,
      username,
      password,
    });
  };

  const fetchUser = async () => {
    try {
      const response = await apiClient.get('/auth/me');
      const userData = response.data;
      setUser(userData);
      authStorage.setUser(userData);
    } catch (error) {
      // If fetching user fails, clear auth
      authStorage.clearTokens();
      setUser(null);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const refreshToken = authStorage.getRefreshToken();
      if (refreshToken) {
        await apiClient.post('/auth/logout', { refresh_token: refreshToken });
      }
    } finally {
      authStorage.clearTokens();
      setUser(null);
    }
  };

  const clearUser = () => {
    setUser(null);
    authStorage.clearTokens();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user && authStorage.isAuthenticated(),
        isLoading,
        login,
        loginWithGoogle,
        register,
        logout,
        fetchUser,
        clearUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
