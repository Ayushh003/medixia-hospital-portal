import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('hospital_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('hospital_token') || null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch current user on mount to verify token validity
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('hospital_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('hospital_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('[Auth Initialization]: Token expired or invalid.');
          localStorage.removeItem('hospital_token');
          localStorage.removeItem('hospital_user');
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      const { token: receivedToken, user: receivedUser } = res.data;
      localStorage.setItem('hospital_token', receivedToken);
      localStorage.setItem('hospital_user', JSON.stringify(receivedUser));
      setToken(receivedToken);
      setUser(receivedUser);
      return receivedUser;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const register = async (registrationData) => {
    const res = await api.post('/auth/register', registrationData);
    if (res.data.success) {
      const { token: receivedToken, user: receivedUser } = res.data;
      localStorage.setItem('hospital_token', receivedToken);
      localStorage.setItem('hospital_user', JSON.stringify(receivedUser));
      setToken(receivedToken);
      setUser(receivedUser);
      return receivedUser;
    }
    throw new Error(res.data.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('hospital_token');
    localStorage.removeItem('hospital_user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('hospital_user', JSON.stringify(updatedUser));
  };

  const role = user?.role;
  const isAdmin = role === 'admin';
  const isDoctor = role === 'doctor';
  const isPatient = role === 'patient';
  const isReceptionist = role === 'receptionist';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        isAdmin,
        isDoctor,
        isPatient,
        isReceptionist,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
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
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
