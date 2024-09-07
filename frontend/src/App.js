import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify'; // Импортируем ToastContainer и toast
import 'react-toastify/dist/ReactToastify.css'; // Импортируем стили

import Dashboard from './components/Dashboard';
import Login from './components/Login';
import './App.css';

function App() {
  
  // eslint-disable-next-line no-unused-vars
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Функция для проверки наличия токена в localStorage
  const checkAuthStatus = () => {
    const token = localStorage.getItem('access_token');
    return !!token; // Возвращает true, если токен есть, и false, если его нет
  };

  // Защищенный маршрут
  const ProtectedRoute = ({ element }) => {
    const isAuthenticated = checkAuthStatus();
    if (!isAuthenticated) {
      toast.error('Ваша сессия истекла. Пожалуйста, войдите снова.'); // Добавляем уведомление
      setTimeout(() => {
        window.location.href = '/login';
      }, 3000); // Добавляем задержку в 3 секунды
      return null;
    }
    return element;
  };

  useEffect(() => {
    setIsLoggedIn(checkAuthStatus());
  }, []);

  return (
    <div className="App">
      <ToastContainer /> {/* Добавляем ToastContainer для отображения уведомлений */}
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
          <Route 
            path="/dashboard" 
            element={<ProtectedRoute element={<Dashboard />} />} 
          />
          {/* Другие защищенные маршруты можно добавить по аналогии */}
        </Routes>
      </Router>
    </div>
  );
}

export default App;