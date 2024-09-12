import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddBudget from './AddBudget';
import axiosInstance from '../api/axiosConfig';
import '@testing-library/jest-dom/extend-expect';

// Mocking axios instance
jest.mock('../api/axiosConfig');

describe('AddBudget component', () => {
  const mockCategories = [
    { id: 1, name: 'Food' },
    { id: 2, name: 'Entertainment' },
  ];

  const mockUsers = [
    { id: 1, username: 'testuser1' },
    { id: 2, username: 'testuser2' },
  ];

  beforeEach(() => {
    axiosInstance.get.mockImplementation((url) => {
      if (url === '/budget/api/categories/') {
        return Promise.resolve({ data: mockCategories });
      }
      if (url === '/budget/api/users/') {
        return Promise.resolve({ data: mockUsers });
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test.skip('renders AddBudget component and fetches categories and users', async () => {
    render(<AddBudget />);
  
    await waitFor(() => {
      // Проверим наличие текстов Категория и Пользователь, так как они точно присутствуют на странице
      expect(screen.getByText(/Категория/i)).toBeInTheDocument();
      expect(screen.getByText(/Пользователь/i)).toBeInTheDocument();
    });
  
    // Проверяем наличие селекторов (combobox) для категории и пользователя
    expect(screen.getAllByRole('combobox')[0]).toBeInTheDocument(); // Первая выпадающая категория
    expect(screen.getAllByRole('combobox')[1]).toBeInTheDocument(); // Вторая выпадающая для пользователя
  
    // Проверим placeholder-ы
    expect(screen.getByText(/Выберите категорию/i)).toBeInTheDocument();
    expect(screen.getByText(/Выберите пользователя/i)).toBeInTheDocument();
  });
  
  test.skip('handles input changes', async () => {
    render(<AddBudget />);
  
    // Ожидаем, что метки и выпадающие списки появятся на странице
    await waitFor(() => {
      expect(screen.getByLabelText(/Категория/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Пользователь/i)).toBeInTheDocument();
    });
  
    // Проверяем, что селект для категории содержит опции
    await waitFor(() => {
      const categorySelect = screen.getByLabelText(/Категория/i);
      expect(categorySelect.options.length).toBeGreaterThan(1); // Должны быть категории
    });
  
    // Проверяем изменение значения категории
    fireEvent.change(screen.getByLabelText(/Категория/i), { target: { value: '1' } });
    await waitFor(() => {
      expect(screen.getByLabelText(/Категория/i).value).toBe('1');
    });
  
    // Изменяем сумму
    fireEvent.change(screen.getByPlaceholderText(/Сумма/i), { target: { value: '1000' } });
    expect(screen.getByPlaceholderText(/Сумма/i).value).toBe('1000');
  
    // Изменяем даты
    fireEvent.change(screen.getByLabelText(/Дата начала/i), { target: { value: '2023-01-01' } });
    fireEvent.change(screen.getByLabelText(/Дата окончания/i), { target: { value: '2023-12-31' } });
    expect(screen.getByLabelText(/Дата начала/i).value).toBe('2023-01-01');
    expect(screen.getByLabelText(/Дата окончания/i).value).toBe('2023-12-31');
  
    // Проверяем, что селект для пользователя содержит опции
    await waitFor(() => {
      const userSelect = screen.getByLabelText(/Пользователь/i);
      expect(userSelect.options.length).toBeGreaterThan(1); // Должны быть пользователи
    });
  
    // Изменяем пользователя (по id)
    fireEvent.change(screen.getByLabelText(/Пользователь/i), { target: { value: '1' } }); // id пользователя
    await waitFor(() => {
      expect(screen.getByLabelText(/Пользователь/i).value).toBe('1'); // Проверяем id пользователя
    });
  });
  
  
  test.skip('submits the budget form', async () => {
    axiosInstance.post.mockResolvedValue({});
  
    render(<AddBudget />);
  
    // Ожидаем, что метки и выпадающие списки появятся на странице
    await waitFor(() => {
      expect(screen.getByLabelText(/Категория/i)).toBeInTheDocument();
    });
  
    // Проверяем, что селект для категории содержит опции
    await waitFor(() => {
      const categorySelect = screen.getByLabelText(/Категория/i);
      expect(categorySelect.options.length).toBeGreaterThan(1); // Должны быть категории
    });
  
    // Изменяем значение категории
    fireEvent.change(screen.getByLabelText(/Категория/i), { target: { value: '1' } });
    await waitFor(() => {
      expect(screen.getByLabelText(/Категория/i).value).toBe('1');
    });
  
    // Изменяем другие поля формы
    fireEvent.change(screen.getByPlaceholderText(/Сумма/i), { target: { value: '1000' } });
    fireEvent.change(screen.getByLabelText(/Дата начала/i), { target: { value: '2023-01-01' } });
    fireEvent.change(screen.getByLabelText(/Дата окончания/i), { target: { value: '2023-12-31' } });
    fireEvent.change(screen.getByLabelText(/Пользователь/i), { target: { value: '1' } });
  
    // Отправляем форму
    fireEvent.click(screen.getByText(/Добавить бюджет/i));
  
    // Проверяем, что форма отправлена с правильными значениями
    await waitFor(() => {
      expect(axiosInstance.post).toHaveBeenCalledWith('/budget/api/budgets/', {
        category: '1', // Должно быть значение категории
        amount: '1000',
        start_date: '2023-01-01',
        end_date: '2023-12-31',
        user: '1',
      });
    });
  });
  

  test('handles API errors when submitting', async () => {
    // Замокируем console.error
    const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});
  
    // Мокируем запрос с ошибкой
    axiosInstance.post.mockRejectedValue(new Error('Ошибка при добавлении бюджета'));
  
    render(<AddBudget />);
  
    // Ожидаем загрузки формы
    await waitFor(() => {
      expect(screen.getByLabelText(/Категория/i)).toBeInTheDocument();
    });
  
    // Заполняем форму
    fireEvent.change(screen.getByLabelText(/Категория/i), { target: { value: '1' } });
    fireEvent.change(screen.getByPlaceholderText(/Сумма/i), { target: { value: '1000' } });
    fireEvent.change(screen.getByLabelText(/Дата начала/i), { target: { value: '2023-01-01' } });
    fireEvent.change(screen.getByLabelText(/Дата окончания/i), { target: { value: '2023-12-31' } });
    fireEvent.change(screen.getByLabelText(/Пользователь/i), { target: { value: '1' } });
  
    // Отправляем форму
    fireEvent.click(screen.getByText(/Добавить бюджет/i));
  
    // Проверяем, что ошибка была вызвана
    await waitFor(() => {
      expect(axiosInstance.post).toHaveBeenCalled();
      expect(consoleErrorMock).toHaveBeenCalledWith('Error adding budget:', expect.any(Error));
    });
  
    // Очищаем mock
    consoleErrorMock.mockRestore();
  });  
});
