import React from 'react';
import { render, screen, waitFor, within, act, fireEvent } from '@testing-library/react';
import BudgetList from './BudgetList';
import axiosInstance from '../api/axiosConfig';
import '@testing-library/jest-dom/extend-expect';
import { toast } from 'react-toastify';

// Mocking axiosInstance и toast
jest.mock('../api/axiosConfig');
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),  // Мокаем функции toast
    error: jest.fn(),
  },
}));

describe('BudgetList component', () => {
  const mockBudgets = [
    {
      id: 1,
      amount: 1000,
      start_date: '2023-01-01',
      end_date: '2023-12-31',
      category: { id: 1, name: 'Продукты' },
    },
  ];

  const mockCategories = [
    { id: 1, name: 'Продукты' },
    { id: 2, name: 'Развлечения' },
  ];

  beforeEach(() => {
    // Моки для API
    axiosInstance.get.mockImplementation((url) => {
      if (url === '/budget/api/budgets/') {
        return Promise.resolve({ data: mockBudgets });
      }
      if (url === '/budget/api/categories/') {
        return Promise.resolve({ data: mockCategories });
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders BudgetList and loads budgets', async () => {
    await act(async () => {
      render(<BudgetList />);
    });
  
    // Ждем рендеринга заголовка "Бюджеты"
    await waitFor(() => {
      expect(screen.getByText(/Бюджеты/i)).toBeInTheDocument();
    });
  
    // Находим контейнер, который содержит список бюджетов (где есть grid-template-columns)
    const budgetListContainer = screen.getByText(/Бюджеты/i).parentElement.querySelector('div[style*="grid-template-columns"]');
  
    // Проверяем наличие категории "Продукты"
    await waitFor(() => {
      expect(within(budgetListContainer).getByText(/Продукты/i)).toBeInTheDocument();
    });
  
    // Проверяем корректное отображение суммы бюджета с помощью регулярного выражения
    await waitFor(() => {
      expect(screen.getByText(/1\s?000,00\s?₽/)).toBeInTheDocument();
    });
  });
  
  
  test('handles adding a new budget', async () => {
    axiosInstance.post.mockResolvedValue({
      data: {
        id: 3,
        amount: 2000,
        start_date: '2023-02-01',
        end_date: '2023-04-30',
        category: { id: 1, name: 'Продукты' },
      },
    });
  
    render(<BudgetList />);
  
    // Ожидаем загрузки категорий
    await waitFor(() => {
      const categorySelect = screen.getByLabelText(/Категория/i);
      expect(categorySelect.options.length).toBeGreaterThan(1); // Убедимся, что категории подгружены
    });
  
    // Имитируем ввод значений в поля формы
    fireEvent.change(screen.getByPlaceholderText(/Сумма/i), { target: { value: '2000' } });
    fireEvent.change(screen.getByLabelText(/Дата начала/i), { target: { value: '2023-02-01' } });
    fireEvent.change(screen.getByLabelText(/Дата окончания/i), { target: { value: '2023-04-30' } });
  
    // Имитируем выбор категории после её загрузки
    fireEvent.change(screen.getByLabelText(/Категория/i), { target: { value: '1' } });
  
    fireEvent.click(screen.getByText(/Добавить бюджет/i));
  
    // Проверяем, что запрос был отправлен с правильными данными
    await waitFor(() => {
      expect(axiosInstance.post).toHaveBeenCalledWith('/budget/api/budgets/', {
        amount: '2000',
        start_date: '2023-02-01',
        end_date: '2023-04-30',
        category: '1',
      });
  
      // Проверяем, что был вызван замокированный toast.success
      expect(toast.success).toHaveBeenCalledWith('Бюджет успешно добавлен!');
    });
  
    // Проверяем, что новый бюджет отображается, используя регулярное выражение для поиска
    expect(screen.getByText(/2[\s ]?000/)).toBeInTheDocument();
  });
  
  
  test('handles API error when adding a budget', async () => {
    axiosInstance.post.mockRejectedValue(new Error('Ошибка при добавлении бюджета'));

    render(<BudgetList />);

    fireEvent.change(screen.getByPlaceholderText(/Сумма/i), { target: { value: '2000' } });
    fireEvent.change(screen.getByLabelText(/Дата начала/i), { target: { value: '2023-02-01' } });
    fireEvent.change(screen.getByLabelText(/Дата окончания/i), { target: { value: '2023-04-30' } });
    fireEvent.change(screen.getByRole('combobox', { name: /Категория/i }), { target: { value: '1' } });

    fireEvent.click(screen.getByText(/Добавить бюджет/i));

    await waitFor(() => {
      expect(axiosInstance.post).toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith('Ошибка при добавлении бюджета');
    });
  });  
});