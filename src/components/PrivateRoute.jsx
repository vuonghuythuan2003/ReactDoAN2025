import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, roles } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && !roles.includes(requiredRole)) {
    return <Navigate to="/" />;
  }

  return children;
};

export default PrivateRoute;