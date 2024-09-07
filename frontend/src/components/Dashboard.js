import React, { useState, useEffect, useCallback } from 'react';
import { axiosInstance, startTokenRefreshInterval, stopTokenRefreshInterval } from '../api/axiosConfig';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [data, setData] = useState({
    balance: 0,
    income: 0,
    expenses: 0,
    recent_transactions: []
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newTransaction, setNewTransaction] = useState({
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0]
  });

  const navigate = useNavigate();

  const categories = [
    { id: 1, name: 'Продукты', type: 'expense' },
    { id: 2, name: 'Транспорт', type: 'expense' },
    { id: 3, name: 'Развлечения', type: 'expense' },
    { id: 4, name: 'Зарплата', type: 'income' }
  ];

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/budget/api/dashboard/');
      const sortedTransactions = response.data.recent_transactions
        .sort((a, b) => {
          // Сначала сортируем по дате (в обратном порядке)
          const dateComparison = new Date(b.date) - new Date(a.date);
          if (dateComparison !== 0) {
            return dateComparison;
          }
          // Если даты одинаковые, сортируем по ID (в обратном порядке)
          return b.id - a.id;
        })
        .slice(0, 10);
      setData({ ...response.data, recent_transactions: sortedTransactions });
    } catch (error) {
      console.error('Fetch error:', error);
      if (error.response && error.response.status === 401) {
        navigate('/login');
        return;
      }
      setError(error.response?.data?.detail || 'Произошла ошибка при загрузке данных');
      toast.error('Не удалось загрузить данные дашборда');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchData();
    const intervalId = startTokenRefreshInterval();
    return () => {
      stopTokenRefreshInterval(intervalId);
    };
  }, [fetchData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTransaction(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || '' : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const selectedCategory = categories.find(cat => cat.id === parseInt(newTransaction.category));
      const transactionType = selectedCategory ? selectedCategory.type : 'expense';
      const amount = transactionType === 'expense' ? -Math.abs(newTransaction.amount) : Math.abs(newTransaction.amount);
      
      await axiosInstance.post('/budget/api/transactions/', {
        ...newTransaction,
        amount: amount,
        category_id: newTransaction.category
      });
      setNewTransaction({
        description: '',
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0]
      });
      await fetchData();
      toast.success('Транзакция успешно добавлена');
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast.error('Ошибка при добавлении транзакции: ' + (error.response?.data?.detail || 'Неизвестная ошибка'));
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return <div style={styles.loading}>Загрузка данных...</div>;
  }

  if (error) {
    return (
      <div style={styles.error}>
        <h2>Ошибка при загрузке данных</h2>
        <p>{error}</p>
        <button onClick={fetchData} style={styles.retryButton}>Попробовать снова</button>
      </div>
    );
  }

  return (
    <div style={styles.dashboard}>
      <h1 style={styles.title}>Финансовый Дашборд</h1>
      
      <div style={styles.summary}>
        <div style={styles.summaryItem}>
          <h2 style={styles.summaryTitle}>Баланс</h2>
          <p style={styles.summaryValue}>{formatCurrency(data.balance)}</p>
        </div>
        <div style={styles.summaryItem}>
          <h2 style={styles.summaryTitle}>Доходы</h2>
          <p style={styles.income}>{formatCurrency(data.income)}</p>
        </div>
        <div style={styles.summaryItem}>
          <h2 style={styles.summaryTitle}>Расходы</h2>
          <p style={styles.expense}>{formatCurrency(data.expenses)}</p>
        </div>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Добавить новую транзакцию</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            name="description"
            value={newTransaction.description}
            onChange={handleInputChange}
            placeholder="Описание"
            style={styles.input}
            required
          />
          <input
            type="number"
            name="amount"
            value={newTransaction.amount}
            onChange={handleInputChange}
            placeholder="Сумма"
            style={styles.input}
            required
          />
          <select
            name="category"
            value={newTransaction.category}
            onChange={handleInputChange}
            style={styles.input}
            required
          >
            <option value="">Выберите категорию</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
          <input
            type="date"
            name="date"
            value={newTransaction.date}
            onChange={handleInputChange}
            style={styles.input}
            required
          />
          <button type="submit" style={styles.button}>Добавить транзакцию</button>
        </form>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Недавние Транзакции</h2>
        {data.recent_transactions.length > 0 ? (
          <ul style={styles.transactionList}>
            {data.recent_transactions.map((transaction) => (
              <li key={transaction.id} style={styles.transactionItem}>
                <div style={styles.transactionDescription}>{transaction.description}</div>
                <div style={{
                  ...styles.transactionAmount,
                  color: transaction.amount > 0 ? styles.income.color : styles.expense.color
                }}>
                  {formatCurrency(Math.abs(transaction.amount))}
                </div>
                <div style={styles.transactionDate}>{formatDate(transaction.date)}</div>
                <div style={styles.transactionCategory}>
                  {transaction.category?.name} ({transaction.category?.type})
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p style={styles.noTransactions}>Нет недавних транзакций</p>
        )}
      </div>
    </div>
  );
};

const styles = {
  dashboard: {
    fontFamily: 'Arial, sans-serif',
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#1c1c1c',
    color: '#ffd700'
  },
  title: {
    textAlign: 'center',
    color: '#ffd700'
  },
  summary: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '20px',
    backgroundColor: '#2c2c2c',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(255,215,0,0.1)'
  },
  summaryItem: {
    textAlign: 'center'
  },
  summaryTitle: {
    color: '#ffd700',
    marginBottom: '5px'
  },
  summaryValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#ffffff'
  },
  income: {
    color: '#4caf50',
    fontWeight: 'bold'
  },
  expense: {
    color: '#f44336',
    fontWeight: 'bold'
  },
  section: {
    backgroundColor: '#2c2c2c',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
    boxShadow: '0 2px 4px rgba(255,215,0,0.1)'
  },
  sectionTitle: {
    color: '#ffd700',
    marginBottom: '15px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column'
  },
  input: {
    margin: '5px 0',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ffd700',
    backgroundColor: '#1c1c1c',
    color: '#ffffff'
  },
  button: {
    margin: '10px 0',
    padding: '10px',
    backgroundColor: '#ffd700',
    color: '#1c1c1c',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  transactionList: {
    listStyleType: 'none',
    padding: 0
  },
  transactionItem: {
    marginBottom: '10px',
    borderBottom: '1px solid #ffd700',
    paddingBottom: '10px'
  },
  transactionDescription: {
    fontWeight: 'bold'
  },
  transactionAmount: {
    fontWeight: 'bold'
  },
  transactionDate: {
    fontSize: '0.9em',
    color: '#cccccc'
  },
  transactionCategory: {
    fontSize: '0.9em',
    color: '#cccccc'
  },
  loading: {
    textAlign: 'center',
    fontSize: '18px',
    color: '#ffd700',
    margin: '20px 0'
  },
  error: {
    textAlign: 'center',
    color: '#f44336',
    margin: '20px 0'
  },
  retryButton: {
    padding: '10px 20px',
    fontSize: '16px',
    backgroundColor: '#ffd700',
    color: '#1c1c1c',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '10px'
  },
  noTransactions: {
    textAlign: 'center',
    color: '#cccccc'
  }
};

export default Dashboard;