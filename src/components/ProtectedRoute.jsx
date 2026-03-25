import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContent } from './AuthContent';

const ProtectedRoute = ({ children, allowed }) => {
  const { role, is2FAVerified } = useContext(AuthContent);
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!role) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </div>
      </div>
    );
  }
  return children;
};

export default ProtectedRoute;