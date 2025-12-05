'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://internshala-app-2xt0.onrender.com';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  token: null,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  checkAuth: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const checkAuth = async () => {
    const authToken = token || localStorage.getItem('token');

    if (!authToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('token', data.token);
  };

  const signup = async (username: string, email: string, password: string) => {
    const response = await fetch(`${API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Signup failed');
    }

    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('token', data.token);
  };

  const logout = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }

    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  useEffect(() => {
    checkAuth();
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, loading, token, login, signup, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
