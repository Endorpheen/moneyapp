import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axiosInstance from '../api/axiosConfig';
import Settings from './Settings';
import { toast } from 'react-toastify';
import '@testing-library/jest-dom/extend-expect';

// Mocking axios and toast
jest.mock('../api/axiosConfig');
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('Settings component', () => {
  const mockSettings = {
    notifications_enabled: true,
  };

  beforeEach(() => {
    axiosInstance.get.mockResolvedValue({ data: mockSettings });
    axiosInstance.put.mockResolvedValue({});
    jest.spyOn(Storage.prototype, 'setItem'); // Мокаем localStorage.setItem
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders settings form and loads data from API', async () => {
    render(<Settings />);

    // Ожидаем, пока настройки загрузятся
    await waitFor(() => {
      expect(screen.getByLabelText(/Включить уведомления/i)).toBeChecked();
    });

    expect(axiosInstance.get).toHaveBeenCalledWith('/budget/api/user-settings/');
  });

  test('saves settings and shows success message', async () => {
    render(<Settings />);

    // Ожидаем загрузки текущих настроек
    await waitFor(() => {
      expect(screen.getByLabelText(/Включить уведомления/i)).toBeChecked();
    });

    // Кликаем по чекбоксу уведомлений
    fireEvent.click(screen.getByLabelText(/Включить уведомления/i));

    // Нажимаем кнопку сохранения
    fireEvent.click(screen.getByText(/Сохранить настройки/i));

    // Ожидаем сохранения настроек
    await waitFor(() => {
      expect(axiosInstance.put).toHaveBeenCalledWith('/budget/api/user-settings/', {
        notifications_enabled: false,
      });

      // Проверяем, что показано сообщение об успешном сохранении
      expect(toast.success).toHaveBeenCalledWith('Настройки успешно сохранены');
    });
  });

  test('shows error message when saving settings fails', async () => {
    axiosInstance.put.mockRejectedValueOnce(new Error('Ошибка при сохранении'));

    render(<Settings />);

    // Ожидаем загрузки текущих настроек
    await waitFor(() => {
      expect(screen.getByLabelText(/Включить уведомления/i)).toBeChecked();
    });

    // Кликаем по чекбоксу уведомлений
    fireEvent.click(screen.getByLabelText(/Включить уведомления/i));

    // Нажимаем кнопку сохранения
    fireEvent.click(screen.getByText(/Сохранить настройки/i));

    // Ожидаем результата
    await waitFor(() => {
      expect(axiosInstance.put).toHaveBeenCalledWith('/budget/api/user-settings/', {
        notifications_enabled: false,
      });

      // Проверяем, что показано сообщение об ошибке
      expect(toast.error).toHaveBeenCalledWith('Ошибка при сохранении настроек');
    });
  });
});
