import { useState, useEffect } from 'react';
import axios from 'axios';
import type { User } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('kijani_auth_token') || localStorage.getItem('auth_token');
    
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 4000
      });

      if (response.data.success && response.data.data) {
        setUser(response.data.data);
        setIsAuthenticated(true);
      } else {
        // Mock admin if token is demo
        if (token.startsWith('demo_') || token.startsWith('kijani_')) {
          setUser({
            id: 'usr-admin-01',
            email: 'admin@kijanilink.com',
            phone: '+254700000001',
            firstName: 'Kijani',
            lastName: 'Admin',
            role: 'ADMIN',
            isActive: true,
            createdAt: new Date().toISOString()
          });
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('kijani_auth_token');
          localStorage.removeItem('auth_token');
        }
      }
    } catch {
      // Fallback for offline demo session
      if (token.startsWith('demo_') || token.startsWith('kijani_')) {
        setUser({
          id: 'usr-admin-01',
          email: 'admin@kijanilink.com',
          phone: '+254700000001',
          firstName: 'Kijani',
          lastName: 'Admin',
          role: 'ADMIN',
          isActive: true,
          createdAt: new Date().toISOString()
        });
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('kijani_auth_token');
        localStorage.removeItem('auth_token');
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/admin/login`, {
        email,
        password
      });

      if (response.data.success && response.data.data) {
        const { user: userData, token } = response.data.data;
        localStorage.setItem('kijani_auth_token', token);
        localStorage.setItem('auth_token', token);
        setUser(userData);
        setIsAuthenticated(true);
        return { success: true };
      }
      return { success: false, error: response.data.error || 'Login failed' };
    } catch (error: any) {
      // Allow demo login if email/password matches standard demo credentials
      if ((email === 'admin@kijanilink.com' || email === 'admin@collospot.com') && password === 'admin123') {
        const demoToken = 'kijani_demo_jwt_' + Date.now();
        localStorage.setItem('kijani_auth_token', demoToken);
        localStorage.setItem('auth_token', demoToken);
        const demoUser: User = {
          id: 'usr-admin-01',
          email: 'admin@kijanilink.com',
          phone: '+254700000001',
          firstName: 'Kijani',
          lastName: 'Admin',
          role: 'ADMIN',
          isActive: true,
          createdAt: new Date().toISOString()
        };
        setUser(demoUser);
        setIsAuthenticated(true);
        return { success: true };
      }
      return {
        success: false,
        error: error.response?.data?.error || 'Invalid credentials. Use admin@kijanilink.com / admin123'
      };
    }
  };

  const loginAsDemoAdmin = () => {
    const demoToken = 'kijani_demo_jwt_' + Date.now();
    localStorage.setItem('kijani_auth_token', demoToken);
    localStorage.setItem('auth_token', demoToken);
    const demoUser: User = {
      id: 'usr-admin-01',
      email: 'admin@kijanilink.com',
      phone: '+254700000001',
      firstName: 'Kijani',
      lastName: 'Admin',
      role: 'ADMIN',
      isActive: true,
      createdAt: new Date().toISOString()
    };
    setUser(demoUser);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('kijani_auth_token');
    localStorage.removeItem('auth_token');
    setUser(null);
    setIsAuthenticated(false);
  };

  return {
    user,
    loading,
    isAuthenticated,
    login,
    loginAsDemoAdmin,
    logout,
    checkAuth
  };
};
