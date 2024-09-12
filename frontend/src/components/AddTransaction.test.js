import { fireEvent, waitFor, screen } from '@testing-library/react';
import { render } from '@testing-library/react';
import AddTransaction from './AddTransaction';
import axiosInstance from '../api/axiosConfig';
import { toast } from 'react-toastify';
import '@testing-library/jest-dom/extend-expect';

// Мокаем axios и toast
jest.mock('../api/axiosConfig');
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  }
}));

describe('AddTransaction component', () => {
  const mockCategories = [
    { id: 1, name: 'Food', type: 'expense' },
    { id: 2, name: 'Salary', type: 'income' },
  ];

  beforeEach(() => {
    axiosInstance.get.mockResolvedValue({ data: mockCategories });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders AddTransaction component and fetches categories', async () => {
    render(<AddTransaction />);
    
    // Отладка для проверки рендеринга
    screen.debug(); // Выводит текущий DOM после рендеринга компонента
  
    // Проверка наличия элементов
    await waitFor(() => {
      expect(screen.getByText(/Сумма/i)).toBeInTheDocument();
      expect(screen.getByText(/Категория/i)).toBeInTheDocument();
    });
  
    // Еще раз выводим DOM перед поиском элемента
    screen.debug();
  
    // Проверка наличия элемента с ролью "combobox"
    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: /Категория/i })).toBeInTheDocument();
    });
  });
  
  
  test('handles input changes', async () => {
    render(<AddTransaction />);
  
    // Ожидаем, что категории и другие элементы формы загрузятся
    await waitFor(() => {
      expect(screen.getByText(/Сумма/i)).toBeInTheDocument();
    });
  
    // Ожидаем, что элемент с ролью combobox будет доступен после загрузки категорий
    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: /Категория/i })).toBeInTheDocument();
    });
  
    // Ввод данных в поля формы
    fireEvent.change(screen.getByPlaceholderText(/Введите сумму/i), { target: { value: '500' } });
    fireEvent.change(screen.getByPlaceholderText(/Введите описание/i), { target: { value: 'Test transaction' } });
    fireEvent.change(screen.getByLabelText(/Дата/i), { target: { value: '2023-09-10' } });
  
    // Выбираем категорию из загруженных данных
    fireEvent.change(screen.getByRole('combobox', { name: /Категория/i }), { target: { value: '1' } });
  
    // Проверяем, что все данные корректно изменились
    expect(screen.getByPlaceholderText(/Введите сумму/i).value).toBe('500');
    expect(screen.getByPlaceholderText(/Введите описание/i).value).toBe('Test transaction');
    expect(screen.getByLabelText(/Дата/i).value).toBe('2023-09-10');
    expect(screen.getByRole('combobox', { name: /Категория/i }).value).toBe('1');
  });
  
  test('submits the transaction form', async () => {
    // Мокаем POST запрос
    axiosInstance.post.mockResolvedValue({});
  
    // Мокаем GET запрос для загрузки категорий
    const mockCategories = [
      { id: 1, name: 'Food', type: 'expense' },
      { id: 2, name: 'Salary', type: 'income' }
    ];
    axiosInstance.get.mockResolvedValue({ data: mockCategories });
  
    render(<AddTransaction />);
  
    // Ожидаем загрузку формы
    await waitFor(() => {
      expect(screen.getByText(/Сумма/i)).toBeInTheDocument();
    });
  
    // Вводим данные в поля формы
    fireEvent.change(screen.getByPlaceholderText(/Введите сумму/i), { target: { value: '500' } });
    fireEvent.change(screen.getByPlaceholderText(/Введите описание/i), { target: { value: 'Test transaction' } });
    fireEvent.change(screen.getByLabelText(/Дата/i), { target: { value: '2023-09-10' } });
  
    // Ожидаем загрузку категорий
    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: /Категория/i })).toBeInTheDocument();
    });
  
    // Выбираем категорию
    fireEvent.change(screen.getByRole('combobox', { name: /Категория/i }), { target: { value: '1' } });
  
    // Лог для отладки
    console.log("Форма после ввода данных:", {
      amount: screen.getByPlaceholderText(/Введите сумму/i).value,
      description: screen.getByPlaceholderText(/Введите описание/i).value,
      date: screen.getByLabelText(/Дата/i).value,
      category: screen.getByRole('combobox', { name: /Категория/i }).value,
    });
  
    // Ожидание и клик по кнопке отправки формы
    fireEvent.click(screen.getByText(/Добавить транзакцию/i));
  
    // Проверяем, что axios был вызван с корректными данными
    await waitFor(() => {
      expect(axiosInstance.post).toHaveBeenCalledWith('budget/api/transactions/', {
        amount: -500, // так как это расход
        date: '2023-09-10',
        description: 'Test transaction',
        category_id: 1
      });
    });
  
    // Проверяем, что был вызван toast для успешной отправки
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Транзакция успешно добавлена');
    });
  });
  
  
  test('handles API error when adding a transaction', async () => {
    axiosInstance.post.mockRejectedValue(new Error('Ошибка при добавлении транзакции'));

    render(<AddTransaction />);

    await waitFor(() => {
      expect(screen.getByText(/Сумма/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText(/Введите сумму/i), { target: { value: '500' } });
    fireEvent.change(screen.getByPlaceholderText(/Введите описание/i), { target: { value: 'Test transaction' } });
    fireEvent.change(screen.getByLabelText(/Дата/i), { target: { value: '2023-09-10' } });
    fireEvent.change(screen.getByRole('combobox', { name: /Категория/i }), { target: { value: '1' } });

    fireEvent.click(screen.getByText(/Добавить транзакцию/i));

    await waitFor(() => {
      expect(axiosInstance.post).toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith('Ошибка при добавлении транзакции');
    });
  });
});
