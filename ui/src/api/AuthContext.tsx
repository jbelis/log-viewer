import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface AuthContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('token'));
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const authenticated = localStorage.getItem('authenticated');
    if (!authenticated && location.pathname !== '/login') {
      navigate('/login', { replace: true });
    }
  }, [location, navigate]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
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

export const setAuthenticated = (value: boolean) => {
  if (value) {
    localStorage.setItem('authenticated', 'true');
  } else {
    localStorage.removeItem('authenticated');
  }
}

export const isAuthenticated = () => {
  return !!localStorage.getItem('authenticated');
}
