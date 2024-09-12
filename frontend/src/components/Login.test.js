import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Login from './Login';
import { startTokenRefreshInterval } from '../api/axiosConfig';
import '@testing-library/jest-dom/extend-expect';


// Mocking useNavigate and axios
jest.mock('axios');
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));
jest.mock('../api/axiosConfig', () => ({
  startTokenRefreshInterval: jest.fn(),
}));

describe('Login component', () => {
  const mockNavigate = jest.fn();
  const mockSetIsLoggedIn = jest.fn();

  beforeEach(() => {
    useNavigate.mockReturnValue(mockNavigate);
    jest.spyOn(Storage.prototype, 'setItem');  // Мокаем localStorage.setItem
    jest.spyOn(Storage.prototype, 'removeItem');  // Мокаем localStorage.removeItem
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders login form', () => {
    render(<Login setIsLoggedIn={mockSetIsLoggedIn} />);
    
    // Проверяем наличие элементов формы
    expect(screen.getByPlaceholderText(/Имя пользователя/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Пароль/i)).toBeInTheDocument();
    expect(screen.getByText(/Войти/i)).toBeInTheDocument();
  });

  test('logs in successfully and stores tokens', async () => {
    const mockResponse = {
      data: {
        access: 'fake-access-token',
        refresh: 'fake-refresh-token',
      },
    };
    axios.post.mockResolvedValue(mockResponse);

    render(<Login setIsLoggedIn={mockSetIsLoggedIn} />);

    // Заполняем форму
    fireEvent.change(screen.getByPlaceholderText(/Имя пользователя/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText(/Пароль/i), { target: { value: 'password' } });

    // Отправляем форму
    fireEvent.click(screen.getByText(/Войти/i));

    // Ждем результата выполнения
    await waitFor(() => {
      // Проверяем, что токены сохранены в localStorage
      expect(localStorage.setItem).toHaveBeenCalledWith('access_token', 'fake-access-token');
      expect(localStorage.setItem).toHaveBeenCalledWith('refresh_token', 'fake-refresh-token');

      // Проверяем, что setIsLoggedIn вызвано
      expect(mockSetIsLoggedIn).toHaveBeenCalledWith(true);

      // Проверяем, что выполнен редирект на /dashboard
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');

      // Проверяем, что запущен интервал обновления токена
      expect(startTokenRefreshInterval).toHaveBeenCalled();
    });
  });

  test('handles login failure', async () => {
    axios.post.mockRejectedValue(new Error('Login failed'));

    render(<Login setIsLoggedIn={mockSetIsLoggedIn} />);

    // Заполняем форму
    fireEvent.change(screen.getByPlaceholderText(/Имя пользователя/i), { target: { value: 'wronguser' } });
    fireEvent.change(screen.getByPlaceholderText(/Пароль/i), { target: { value: 'wrongpassword' } });

    // Отправляем форму
    fireEvent.click(screen.getByText(/Войти/i));

    // Ждем результата выполнения
    await waitFor(() => {
      // Проверяем, что редирект не был выполнен
      expect(mockNavigate).not.toHaveBeenCalled();

      // Проверяем, что токены не сохранены
      expect(localStorage.setItem).not.toHaveBeenCalled();

      // Проверяем, что setIsLoggedIn не вызвано
      expect(mockSetIsLoggedIn).not.toHaveBeenCalled();
    });
  });
});
