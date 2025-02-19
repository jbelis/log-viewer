import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../api/AuthContext';
interface PrivateRouteProps {
  children: React.ReactNode;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  if (!isAuthenticated()) {
    console.log('private route, redirect to login');
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};