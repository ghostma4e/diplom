import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  const login = useCallback(async (username, password) => {
    try {
      const data = await api.login(username, password);
      localStorage.setItem('token', data.token);
      setUser(data.user);
      return data;
    } catch (error) {
      throw error;
    }
  }, []);

  const register = useCallback(async (username, password) => {
    try {
      const data = await api.register(username, password);
      localStorage.setItem('token', data.token);
      setUser(data.user);
      return data;
    } catch (error) {
      throw error;
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const data = await api.getMe();
        setUser(data.user);
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    })();
  }, [logout]);

  const refreshUser = useCallback((nextUser) => {
    if (nextUser) {
      setUser((prev) => ({ ...prev, ...nextUser }));
    } else {
      api.getMe().then((data) => setUser(data.user)).catch(() => {});
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
