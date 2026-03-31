import React, { useContext, useState, useEffect } from 'react';
import { request, setAuthHeader } from '../helpers/axios_helper';
import { jwtDecode } from 'jwt-decode';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { AuthContent } from './AuthContent';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import HomePage from './HomePage';
import PreferencesPage from './SurveyPage';
import ProfilePage from './ProfilePage';
const decodeToken = (token) => {
  try {
    return jwtDecode(token);
  } catch (error) {
    console.error('Ошибка декодирования токена:', error);
    return null;
  }
};

const getRoleFromToken = (token) => {
  const decoded = decodeToken(token);
  return decoded?.role || decoded?.authorities?.[0]?.authority || null;
};



export default function AppContent() {
  const { setEmail } = useContext(AuthContent);
  const [showToast, setShowToast] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token) {
      setAuthHeader(token);
    } 
      setIsLoading(false);
    
  }, [navigate, setEmail]);


  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={<LoginForm showToast={showToast} setShowToast={setShowToast} />}
      />
      
      <Route
        path="/register"
        element={<RegisterForm showToast={showToast} setShowToast={setShowToast} />}
      />
      <Route
        path="/preferences"
        element={
            < PreferencesPage/>
        }
      />
      <Route
        path="/profile"
        element={
            <ProfilePage />
        }
      />
      <Route
        path="/"
        element={
            <HomePage />
        }
      />
    </Routes>
  );
}