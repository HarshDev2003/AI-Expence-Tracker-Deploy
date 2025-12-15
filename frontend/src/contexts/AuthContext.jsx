import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../lib/apiClient';

const AuthContext = createContext(null);
const TOKEN_KEY = 'lumen_token';
const USER_KEY = 'lumen_user';

const safeParse = (value) => {
  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const persistSession = useCallback((token, profile) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(TOKEN_KEY, token);
    window.localStorage.setItem(USER_KEY, JSON.stringify(profile));
    setUser(profile);
  }, []);

  const clearSession = useCallback(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      const response = await apiClient.get('/auth/me');
      const profile = response.data.data;
      if (profile) {
        window.localStorage.setItem(USER_KEY, JSON.stringify(profile));
        setUser(profile);
      }
    } catch (error) {
      clearSession();
    } finally {
      setLoading(false);
    }
  }, [clearSession]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedToken = window.localStorage.getItem(TOKEN_KEY);
    const storedUser = safeParse(window.localStorage.getItem(USER_KEY));

    if (storedToken && storedUser) {
      setUser(storedUser);
      fetchProfile();
    } else if (storedToken) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [fetchProfile]);

  const login = useCallback(
    async (email, password, { silent } = {}) => {
      try {
        const response = await apiClient.post('/auth/login', { email, password });
        const { token, user: profile } = response.data.data;
        persistSession(token, profile);
        if (!silent) {
          toast.success(`Welcome back, ${profile.name}!`);
        }
        return { success: true, user: profile };
      } catch (error) {
        const message = error.message || 'Login failed. Please try again.';
        if (!silent) {
          toast.error(message);
        }
        return { success: false, error: message };
      }
    },
    [persistSession]
  );

  const register = useCallback(
    async ({ name, email, password, role = 'user' }) => {
      try {
        await apiClient.post('/auth/register', { name, email, password, role });
        toast.success('Registration successful. Signing you in...');
        return login(email, password, { silent: true });
      } catch (error) {
        const message = error.message || 'Registration failed. Please try again.';
        toast.error(message);
        return { success: false, error: message };
      }
    },
    [login]
  );

  const logout = useCallback(() => {
    clearSession();
    toast.success('Logged out successfully');
  }, [clearSession]);

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
    refreshProfile: fetchProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

