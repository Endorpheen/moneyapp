import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser } from 'react-icons/fa';  // Импортируем иконку пользователя

const UserMenu = ({ setIsLoggedIn }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setIsLoggedIn(false);
    navigate('/login');
  };

  return (
    <div className="user-menu-container">
      {/* Заменяем текст "У" на иконку */}
      <button onClick={toggleMenu} className="user-icon">
        <FaUser size={32} color="#fff" /> 
      </button>
      {isOpen && (
        <div className="user-menu">
          <button onClick={() => navigate('/profile')}>Профиль</button>
          <button onClick={() => navigate('/settings')}>Настройки</button>
          <button onClick={handleLogout}>Выйти</button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
