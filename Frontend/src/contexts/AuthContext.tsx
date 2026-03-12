import React, { createContext, useContext, useState, useCallback } from 'react';
import { User, mockUsers } from '@/lib/mockData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (username: string, email: string, password: string) => Promise<boolean | string>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('streamtube_user');
      if (stored) {
        const parsed = JSON.parse(stored) as User;
        // Defer isLoading = false to after first render
        setTimeout(() => setIsLoading(false), 0);
        return parsed;
      }
    } catch { }
    setTimeout(() => setIsLoading(false), 0);
    return null;
  });

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const apiBase = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiBase}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const userWithToken: User = {
          id: data.user.id,
          username: data.user.name,
          email: data.user.email,
          avatar: data.user.profilePhotoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
          role: 'user',
          createdAt: new Date().toISOString().split('T')[0],
          subscribers: 0,
          token: data.token, // Store the JWT token
        };
        setUser(userWithToken);
        localStorage.setItem('streamtube_user', JSON.stringify(userWithToken));
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }, []);

  const signup = useCallback(async (username: string, email: string, password: string): Promise<boolean | string> => {
    try {
      const apiBase = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiBase}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: username, email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const userWithToken: User = {
          id: data.user.id,
          username: data.user.name,
          email: data.user.email,
          avatar: data.user.profilePhotoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
          role: 'user',
          createdAt: new Date().toISOString().split('T')[0],
          subscribers: 0,
          token: data.token, // Store the JWT token
        };
        setUser(userWithToken);
        localStorage.setItem('streamtube_user', JSON.stringify(userWithToken));
        return true;
      }

      // Return the specific error message from the backend
      const errorData = await response.json();
      return errorData.message || 'Signup failed';
    } catch (error) {
      console.error('Signup error:', error);
      return 'Something went wrong. Please try again.';
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('streamtube_user');
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      localStorage.setItem('streamtube_user', JSON.stringify(updated));
      return updated;
    });
  }, []);


  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isLoading,
        login,
        signup,
        logout,
        updateUser,
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
