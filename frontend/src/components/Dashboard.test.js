import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Dashboard from './Dashboard';
import axiosInstance from '../api/axiosConfig';
import { BrowserRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import '@testing-library/jest-dom/extend-expect';

// Мокируем axios и react-toastify
jest.mock('../api/axiosConfig');
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  }
}));

describe('Dashboard component', () => {
  // Мокируем реальные данные, которые отображаются на странице
  const mockData = {
    balance: 17063,  // Обновляем значение баланса
    income: 29244,  // Доходы, которые отображаются
    expenses: 12181,  // Расходы
    recent_transactions: [
      { id: 1, description: 'Test Transaction 1', amount: 89, date: '2024-09-12', category: { id: 1, name: 'Продукты', type: 'expense' } },
      { id: 2, description: 'Test Transaction 2', amount: 7150, date: '2024-09-12', category: { id: 2, name: 'Развлечения', type: 'expense' } },
    ],
    budgets: [],
    total_budget: { amount: 3000, total_remaining_budget: 1000, start_date: '2023-01-01', end_date: '2023-12-31' }
  };

  const mockCategories = [
    { id: 1, name: 'Продукты', type: 'expense' },
    { id: 2, name: 'Развлечения', type: 'expense' }
  ];

  beforeEach(() => {
    // Мокируем ответы API
    axiosInstance.get.mockImplementation((url) => {
      if (url === '/budget/api/dashboard/') {
        return Promise.resolve({ data: mockData });
      }
      if (url === '/budget/api/categories/') {
        return Promise.resolve({ data: mockCategories });
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Исправленный тест для рендеринга Dashboard с реальными данными
  test('renders Dashboard component and loads data', async () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );
  
    expect(screen.getByText(/Загрузка данных/i)).toBeInTheDocument();
  
    await waitFor(() => {
      expect(screen.getByText(/Финансовый Дашборд/i)).toBeInTheDocument();
    });
  
    // Найдем баланс
    const balanceElement = screen.getByText((content, element) => 
      content.includes('17') && content.includes('063,00') && content.includes('₽') && element.tagName.toLowerCase() === 'p'
    );
    expect(balanceElement).toBeInTheDocument();
  
    // Получим все заголовки с текстом "Доходы"
    const incomeHeadings = screen.getAllByRole('heading', { name: /Доходы/i });
    
    // Выведем все найденные элементы в консоль
    console.log(incomeHeadings);
    
    // Проверим конкретный элемент по индексу, если его нужно найти
    const incomeHeader = incomeHeadings[1]; // Это можно изменить после проверки в консоли
    expect(incomeHeader).toBeInTheDocument();
  });
  
  test('handles new transaction input change', async () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Добавить новую транзакцию/i)).toBeInTheDocument();
    });

    const descriptionInput = screen.getByPlaceholderText(/Описание/i);
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
    expect(descriptionInput.value).toBe('Test Description');

    const amountInput = screen.getByPlaceholderText(/Сумма/i);
    fireEvent.change(amountInput, { target: { value: '500' } });
    expect(amountInput.value).toBe('500');
  });

  test('submits new transaction', async () => {
    axiosInstance.post.mockResolvedValue({});
  
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );
  
    await waitFor(() => {
      expect(screen.getByText(/Добавить новую транзакцию/i)).toBeInTheDocument();
    });
  
    const descriptionInput = screen.getByPlaceholderText(/Описание/i);
    const amountInput = screen.getByPlaceholderText(/Сумма/i);
    const categorySelect = screen.getByDisplayValue(/Выберите категорию/i);
    const submitButton = screen.getByText(/Добавить транзакцию/i);
  
    fireEvent.change(descriptionInput, { target: { value: 'Test Transaction' } });
    fireEvent.change(amountInput, { target: { value: '500' } });
    fireEvent.change(categorySelect, { target: { value: '1' } }); // Выбираем категорию Food
  
    fireEvent.click(submitButton);
  
    await waitFor(() => {
      expect(axiosInstance.post).toHaveBeenCalledWith('/budget/api/transactions/', {
        description: 'Test Transaction',
        amount: -500, // так как это расход
        category_id: '1',
        category: '1',  // Если это поле также присутствует
        date: "2024-09-12",  // Используем конкретную дату проведения теста
      });
      expect(toast.success).toHaveBeenCalledWith('Транзакция успешно добавлена');
    });
  });
  
  

  test('handles API error when adding a transaction', async () => {
    axiosInstance.post.mockRejectedValue({ response: { data: { detail: 'Ошибка при добавлении' } } });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Добавить новую транзакцию/i)).toBeInTheDocument();
    });

    const descriptionInput = screen.getByPlaceholderText(/Описание/i);
    const amountInput = screen.getByPlaceholderText(/Сумма/i);
    const submitButton = screen.getByText(/Добавить транзакцию/i);

    fireEvent.change(descriptionInput, { target: { value: 'Test Transaction' } });
    fireEvent.change(amountInput, { target: { value: '500' } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Ошибка при добавлении транзакции: Ошибка при добавлении');
    });
  });

  test('renders error and retry button when fetching data fails', async () => {
    axiosInstance.get.mockRejectedValueOnce(new Error('Network Error'));

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      const errorMessages = screen.getAllByText(/Ошибка при загрузке данных/i); // Изменение для нескольких элементов
      expect(errorMessages.length).toBeGreaterThan(0);
      expect(screen.getByText(/Попробовать снова/i)).toBeInTheDocument();
    });

    const retryButton = screen.getByText(/Попробовать снова/i);
    fireEvent.click(retryButton);

    expect(axiosInstance.get).toHaveBeenCalled();
  });
});
