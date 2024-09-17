import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { startTokenRefreshInterval } from '../api/axiosConfig';

const Login = ({ setIsLoggedIn }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); // Новое состояние для сообщения об ошибке
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/budget/api/login/', { username, password });
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      setIsLoggedIn(true);
      navigate('/dashboard');
      startTokenRefreshInterval();
    } catch (error) {
      console.error('Login failed:', error);
      setErrorMessage('Неверное имя пользователя или пароль'); // Устанавливаем сообщение об ошибке
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.title}>Вход в систему</h2>
        {errorMessage && <div style={styles.error}>{errorMessage}</div>} {/* Вывод сообщения об ошибке */}
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Имя пользователя"
          name="username"
          style={styles.input}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Пароль"
          name="password"
          style={styles.input}
        />
        <button type="submit" style={styles.button}>Войти</button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#1c1c1c',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px',
    backgroundColor: '#2c2c2c',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(255, 215, 0, 0.1)',
  },
  title: {
    color: '#ffd700',
    marginBottom: '20px',
    fontSize: '24px',
  },
  input: {
    width: '100%',
    padding: '12px',
    margin: '10px 0',
    fontSize: '16px',
    backgroundColor: '#1c1c1c',
    border: '1px solid #ffd700',
    borderRadius: '4px',
    color: '#ffffff',
  },
  button: {
    width: '100%',
    padding: '12px',
    margin: '20px 0 0',
    fontSize: '16px',
    backgroundColor: '#ffd700',
    color: '#1c1c1c',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  error: { // Стили для сообщения об ошибке
    color: '#ff4d4d',
    marginBottom: '15px',
    fontSize: '16px',
  },
};

export default Login;
