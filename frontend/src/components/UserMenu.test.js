import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useNavigate } from 'react-router-dom';
import UserMenu from './UserMenu';
import { FaUser } from 'react-icons/fa';
import '@testing-library/jest-dom/extend-expect';


// Mocking useNavigate
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

describe('UserMenu component', () => {
  const mockSetIsLoggedIn = jest.fn();
  const mockNavigate = jest.fn();

  beforeEach(() => {
    useNavigate.mockReturnValue(mockNavigate);
    jest.spyOn(Storage.prototype, 'removeItem');  // Мокаем localStorage.removeItem
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders user menu button with user icon', () => {
    render(<UserMenu setIsLoggedIn={mockSetIsLoggedIn} />);

    // Проверяем, что иконка пользователя рендерится
    const userIconButton = screen.getByRole('button');
    expect(userIconButton).toBeInTheDocument();
  });

  test('toggles menu visibility when icon is clicked', () => {
    render(<UserMenu setIsLoggedIn={mockSetIsLoggedIn} />);

    // Проверяем, что меню скрыто по умолчанию
    expect(screen.queryByText(/Профиль/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Настройки/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Выйти/i)).not.toBeInTheDocument();

    // Кликаем по иконке пользователя
    const userIconButton = screen.getByRole('button');
    fireEvent.click(userIconButton);

    // Проверяем, что меню стало видимым
    expect(screen.getByText(/Профиль/i)).toBeInTheDocument();
    expect(screen.getByText(/Настройки/i)).toBeInTheDocument();
    expect(screen.getByText(/Выйти/i)).toBeInTheDocument();
  });

  test('navigates to profile page when "Профиль" is clicked', () => {
    render(<UserMenu setIsLoggedIn={mockSetIsLoggedIn} />);

    // Кликаем по иконке пользователя, чтобы открыть меню
    const userIconButton = screen.getByRole('button');
    fireEvent.click(userIconButton);

    // Кликаем по кнопке "Профиль"
    const profileButton = screen.getByText(/Профиль/i);
    fireEvent.click(profileButton);

    // Проверяем, что выполнена навигация на страницу профиля
    expect(mockNavigate).toHaveBeenCalledWith('/profile');
  });

  test('navigates to settings page when "Настройки" is clicked', () => {
    render(<UserMenu setIsLoggedIn={mockSetIsLoggedIn} />);

    // Кликаем по иконке пользователя, чтобы открыть меню
    const userIconButton = screen.getByRole('button');
    fireEvent.click(userIconButton);

    // Кликаем по кнопке "Настройки"
    const settingsButton = screen.getByText(/Настройки/i);
    fireEvent.click(settingsButton);

    // Проверяем, что выполнена навигация на страницу настроек
    expect(mockNavigate).toHaveBeenCalledWith('/settings');
  });

  test('logs out and navigates to login page when "Выйти" is clicked', async () => {
    render(<UserMenu setIsLoggedIn={mockSetIsLoggedIn} />);

    // Кликаем по иконке пользователя, чтобы открыть меню
    const userIconButton = screen.getByRole('button');
    fireEvent.click(userIconButton);

    // Кликаем по кнопке "Выйти"
    const logoutButton = screen.getByText(/Выйти/i);
    fireEvent.click(logoutButton);

    // Проверяем, что токены удалены и выполнена навигация на страницу логина
    await waitFor(() => {
      expect(localStorage.removeItem).toHaveBeenCalledWith('access_token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('refresh_token');
      expect(mockSetIsLoggedIn).toHaveBeenCalledWith(false);
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });
});
