import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedTypes = [] }) => {
  const { user, token } = useAuth();

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (allowedTypes.length > 0 && !allowedTypes.includes(user?.userType)) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute; 