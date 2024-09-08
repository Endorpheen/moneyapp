import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Dashboard from './components/Dashboard';
import Login from './components/Login';
import TransactionList from './components/TransactionList';
import AddTransaction from './components/AddTransaction';
import BudgetList from './components/BudgetList';
import AddBudget from './components/AddBudget';
import UserMenu from './components/UserMenu';
import Profile from './components/Profile';
import Settings from './components/Settings';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const checkAuthStatus = () => {
    const token = localStorage.getItem('access_token');
    return !!token;
  };

  const ProtectedRoute = ({ element }) => {
    const isAuthenticated = checkAuthStatus();
    if (!isAuthenticated) {
      toast.error('Ваша сессия истекла. Пожалуйста, войдите снова.');
      setTimeout(() => {
        window.location.href = '/login';
      }, 3000);
      return null;
    }
    return element;
  };

  useEffect(() => {
    setIsLoggedIn(checkAuthStatus());
  }, []);

  return (
    <div className="App">
      <ToastContainer />
      <Router>
        {isLoggedIn && (
          <nav className="nav-container">
            <div className="logo">💰 Финансы</div>
            <ul className="nav-menu">
              <li className="nav-item"><Link to="/dashboard" className="nav-link">Дашборд</Link></li>
              <li className="nav-item"><Link to="/transactions" className="nav-link">Транзакции</Link></li>
              <li className="nav-item"><Link to="/add-transaction" className="nav-link">Добавить транзакцию</Link></li>
              <li className="nav-item"><Link to="/budgets" className="nav-link">Бюджеты</Link></li>
              <li className="nav-item"><Link to="/add-budget" className="nav-link">Добавить бюджет</Link></li>
            </ul>
            <UserMenu setIsLoggedIn={setIsLoggedIn} />
          </nav>
        )}
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
          <Route path="/transactions" element={<ProtectedRoute element={<TransactionList />} />} />
          <Route path="/add-transaction" element={<ProtectedRoute element={<AddTransaction />} />} />
          <Route path="/budgets" element={<ProtectedRoute element={<BudgetList />} />} />
          <Route path="/add-budget" element={<ProtectedRoute element={<AddBudget />} />} />
          <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />
          <Route path="/settings" element={<ProtectedRoute element={<Settings />} />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;