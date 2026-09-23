import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  isAuthModalOpen: boolean;
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  authModalMode: 'login' | 'register';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('bgy_token');
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // Handle unauthorized events emitted by API client
  useEffect(() => {
    const handleUnauthorized = () => {
      setToken(null);
      setUser(null);
      setIsLoading(false);
    };

    window.addEventListener('bgy:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('bgy:unauthorized', handleUnauthorized);
    };
  }, []);

  // Safe initial user loader
  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      const storedToken = (() => {
        try {
          return localStorage.getItem('bgy_token');
        } catch {
          return null;
        }
      })();

      if (!storedToken) {
        if (isMounted) {
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const res = await api.getMe();
        if (isMounted) {
          if (res?.user) {
            setUser(res.user);
          } else {
            // Invalid/expired token returned null user
            setUser(null);
            setToken(null);
            try {
              localStorage.removeItem('bgy_token');
            } catch {
              // ignore
            }
          }
        }
      } catch (err) {
        console.warn('Session check failed or expired, switching to guest mode:', err);
        if (isMounted) {
          setUser(null);
          setToken(null);
          try {
            localStorage.removeItem('bgy_token');
          } catch {
            // ignore
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadUser();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await api.login({ email, password });
    try {
      localStorage.setItem('bgy_token', res.token);
    } catch {
      // ignore
    }
    setToken(res.token);
    setUser(res.user);
    setIsAuthModalOpen(false);
  };

  const register = async (name: string, email: string, password: string, phone?: string) => {
    const res = await api.register({ name, email, password, phone });
    try {
      localStorage.setItem('bgy_token', res.token);
    } catch {
      // ignore
    }
    setToken(res.token);
    setUser(res.user);
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    try {
      localStorage.removeItem('bgy_token');
    } catch {
      // ignore
    }
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (data: Partial<User>) => {
    const res = await api.updateProfile(data);
    if (res?.user) {
      setUser(res.user);
    }
  };

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        authModalMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
