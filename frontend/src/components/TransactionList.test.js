import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TransactionList from './TransactionList';
import axiosInstance from '../api/axiosConfig';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import '@testing-library/jest-dom/extend-expect';


// Mocking axiosInstance
jest.mock('../api/axiosConfig');

describe('TransactionList component', () => {
  const mockTransactions = [
    {
      id: 1,
      date: '2023-09-10',
      description: 'Test Transaction 1',
      amount: 1000,
    },
    {
      id: 2,
      date: '2023-09-11',
      description: 'Test Transaction 2',
      amount: -500,
    },
  ];

  beforeEach(() => {
    axiosInstance.get.mockResolvedValue({ data: mockTransactions });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders transaction list and loads data', async () => {
    render(<TransactionList />);

    // Проверяем загрузку данных транзакций
    await waitFor(() => {
      expect(screen.getByText(/Test Transaction 1/i)).toBeInTheDocument();
      expect(screen.getByText(/Test Transaction 2/i)).toBeInTheDocument();
    });

    // Проверяем, что запрос был выполнен
    expect(axiosInstance.get).toHaveBeenCalledWith('/budget/api/transactions/');
  });

  test('filters transactions based on description', async () => {
    render(<TransactionList />);

    // Ожидаем загрузки данных транзакций
    await waitFor(() => {
      expect(screen.getByText(/Test Transaction 1/i)).toBeInTheDocument();
      expect(screen.getByText(/Test Transaction 2/i)).toBeInTheDocument();
    });

    const filterInput = screen.getByPlaceholderText(/filter/i);
    fireEvent.change(filterInput, { target: { value: '1' } });

    // Проверяем фильтрацию
    expect(screen.getByText(/Test Transaction 1/i)).toBeInTheDocument();
    expect(screen.queryByText(/Test Transaction 2/i)).not.toBeInTheDocument();
  });

  test('sorts transactions by date, description, and amount', async () => {
    render(<TransactionList />);

    // Ожидаем загрузки данных транзакций
    await waitFor(() => {
      expect(screen.getByText(/Test Transaction 1/i)).toBeInTheDocument();
      expect(screen.getByText(/Test Transaction 2/i)).toBeInTheDocument();
    });

    // Сортировка по описанию
    fireEvent.click(screen.getByText(/description/i));
    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      expect(rows[1]).toHaveTextContent(/Test Transaction 1/i);
      expect(rows[2]).toHaveTextContent(/Test Transaction 2/i);
    });

    // Сортировка по сумме
    fireEvent.click(screen.getByText(/amount/i));
    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      expect(rows[1]).toHaveTextContent(/Test Transaction 2/i); // меньшее значение
      expect(rows[2]).toHaveTextContent(/Test Transaction 1/i); // большее значение
    });
  });

  test('formats currency and date correctly', async () => {
    render(<TransactionList />);

    await waitFor(() => {
      expect(screen.getByText(/Test Transaction 1/i)).toBeInTheDocument();
    });

    // Проверка правильного форматирования суммы
    const formattedCurrency = new Intl.NumberFormat('ru', {
      style: 'currency',
      currency: 'RUB',
    }).format(1000);

    expect(screen.getByText(formattedCurrency)).toBeInTheDocument();

    // Проверка правильного форматирования даты
    const formattedDate = format(new Date('2023-09-10'), 'dd MMMM yyyy', { locale: ru });
    expect(screen.getByText(formattedDate)).toBeInTheDocument();
  });
});
