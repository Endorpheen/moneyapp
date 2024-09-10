import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance, { startTokenRefreshInterval, stopTokenRefreshInterval } from '../api/axiosConfig';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';


const Footer = () => {
  return (
    <div style={styles.footer}>
      <p>Idea and produce by end0</p>
      <p>Code: Claude V3.5 DeepSeek-V2.5 GPT 4o</p>
      <p>Money App Beta V1.0</p>
      <p>Special thx to BagiraMur ❤️</p>
    </div>
  );
};

const Dashboard = () => {
  const [data, setData] = useState({
    balance: 0,
    income: 0,
    expenses: 0,
    recent_transactions: [],
    budgets: [],
    total_budget: null
  });
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newTransaction, setNewTransaction] = useState({
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0]
  });

  const navigate = useNavigate();

  const fetchCategories = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/budget/api/categories/');
      setCategories(response.data);
    } catch (error) {
      console.error('Ошибка при загрузке категорий:', error);
      toast.error('Не удалось загрузить категории');
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/budget/api/dashboard/');
      const sortedTransactions = response.data.recent_transactions
        .sort((a, b) => new Date(b.date) - new Date(a.date))
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

  const handleResetTransactions = async () => {
    if (window.confirm("Вы уверены, что хотите удалить все транзакции? Это действие необратимо.")) {
      try {
        await axiosInstance.delete('/budget/api/transactions/delete_all/');
        toast.success("Все транзакции успешно удалены");
        fetchData(); // Обновляем данные после сброса
      } catch (error) {
        console.error("Ошибка при удалении транзакций:", error);
        toast.error("Не удалось удалить транзакции");
      }
    }
  };

  const handleResetBudgets = async () => {
    if (window.confirm("Вы уверены, что хотите удалить все бюджеты? Это действие необратимо.")) {
      try {
        await axiosInstance.delete('/budget/api/budgets/delete_all/');
        toast.success("Все бюджеты успешно удалены");
        fetchData(); // Обновляем данные после сброса
      } catch (error) {
        console.error("Ошибка при удалении бюджетов:", error);
        toast.error("Не удалось удалить бюджеты");
      }
    }
  };

  useEffect(() => {
    fetchData();
    fetchCategories();
    const intervalId = startTokenRefreshInterval();
    return () => {
      stopTokenRefreshInterval(intervalId);
    };
  }, [fetchData, fetchCategories]);

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

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    stopTokenRefreshInterval();
    toast.success('Вы успешно вышли из системы');
    navigate('/login');
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

  const incomeExpenseData = [
    { name: 'Доходы', Доходы: data.income },
    { name: 'Расходы', Расходы: data.expenses }
  ];

  const expenseCategoryData = categories
    .filter(cat => cat.type === 'expense')
    .map(cat => ({
      name: cat.name,
      value: data.recent_transactions.filter(t => t.category?.id === cat.id).reduce((sum, t) => sum + Math.abs(t.amount), 0)
    }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div style={styles.dashboard}>
      <div style={styles.header}>
        <h1 style={styles.title}>Финансовый Дашборд</h1>
        <button onClick={handleLogout} style={styles.logoutButton}>Выйти</button>
      </div>

      <div style={styles.gridContainer}>
        <div style={styles.chartColumn}>
          <h2 style={styles.sectionTitle}>Доходы и Расходы</h2>
          <BarChart width={400} height={300} data={incomeExpenseData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Доходы" fill="#4caf50" />
            <Bar dataKey="Расходы" fill="#f44336" />
          </BarChart>
        </div>

        <div style={styles.mainColumn}>
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

          {data.total_budget && (
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Общий Бюджет</h2>
              <p>Сумма: {formatCurrency(data.total_budget.amount)}</p>
              <p>Оставшийся бюджет: {formatCurrency(data.total_budget.total_remaining_budget)}</p>
              <p>Период: {formatDate(data.total_budget.start_date)} - {formatDate(data.total_budget.end_date)}</p>
            </div>
          )}

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
                      {transaction.category?.name} ({transaction.transaction_type})
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={styles.noTransactions}>Нет недавних транзакций</p>
            )}
          </div>
        </div>

        <div style={styles.chartColumn}>
          <h2 style={styles.sectionTitle}>Распределение Расходов по Категориям</h2>
          <PieChart width={400} height={300}>
            <Pie
              data={expenseCategoryData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
            >
              {expenseCategoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name) => [`${value} руб.`, `${name}`]} />
            <Legend />
          </PieChart>
        </div>
      </div>

      <div>
        <button onClick={handleResetTransactions} style={styles.resetButton}>
          Удалить все транзакции
        </button>
        <button onClick={handleResetBudgets} style={styles.resetButton}>
          Удалить все бюджеты
        </button>
      </div>

      <Footer />
    </div>
  );
};

const styles = {
  dashboard: {
    fontFamily: 'Arial, sans-serif',
    width: '100%',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#1c1c1c',
    color: '#ffd700',
    transition: 'all 0.3s ease'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    textAlign: 'center',
    color: '#ffd700',
    transition: 'all 0.3s ease'
  },
  logoutButton: {
    padding: '10px 20px',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'all 0.3s ease',
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr 1fr',
    gap: '20px',
    width: '100%',
    transition: 'all 0.3s ease',
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr',
      gap: '10px'
    }
  },
  chartColumn: {
    backgroundColor: '#2c2c2c',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(255,215,0,0.1)',
    transition: 'all 0.3s ease'
  },
  mainColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    transition: 'all 0.3s ease'
  },
  summary: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '20px',
    backgroundColor: '#2c2c2c',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(255,215,0,0.1)',
    transition: 'all 0.3s ease'
  },
  summaryItem: {
    textAlign: 'center',
    transition: 'all 0.3s ease'
  },
  summaryTitle: {
    color: '#ffd700',
    marginBottom: '5px',
    transition: 'all 0.3s ease'
  },
  summaryValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#ffffff',
    transition: 'all 0.3s ease'
  },
  income: {
    color: '#4caf50',
    fontWeight: 'bold',
    transition: 'all 0.3s ease'
  },
  expense: {
    color: '#f44336',
    fontWeight: 'bold',
    transition: 'all 0.3s ease'
  },
  section: {
    backgroundColor: '#2c2c2c',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
    boxShadow: '0 2px 4px rgba(255,215,0,0.1)',
    transition: 'all 0.3s ease'
  },
  sectionTitle: {
    color: '#ffd700',
    marginBottom: '15px',
    transition: 'all 0.3s ease'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.3s ease'
  },
  input: {
    margin: '5px 0',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ffd700',
    backgroundColor: '#1c1c1c',
    color: '#ffffff',
    transition: 'all 0.3s ease'
  },
  button: {
    margin: '10px 0',
    padding: '10px',
    backgroundColor: '#ffd700',
    color: '#1c1c1c',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  resetButton: {
    margin: '10px',
    padding: '10px 20px',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'all 0.3s ease',
  },
  transactionList: {
    listStyleType: 'none',
    padding: 0,
    transition: 'all 0.3s ease'
  },
  transactionItem: {
    marginBottom: '10px',
    borderBottom: '1px solid #ffd700',
    paddingBottom: '10px',
    transition: 'all 0.3s ease'
  },
  transactionDescription: {
    fontWeight: 'bold',
    transition: 'all 0.3s ease'
  },
  transactionAmount: {
    fontWeight: 'bold',
    transition: 'all 0.3s ease'
  },
  transactionDate: {
    fontSize: '0.9em',
    color: '#cccccc',
    transition: 'all 0.3s ease'
  },
  transactionCategory: {
    fontSize: '0.9em',
    color: '#cccccc',
    transition: 'all 0.3s ease'
  },
  loading: {
    textAlign: 'center',
    fontSize: '18px',
    color: '#ffd700',
    margin: '20px 0',
    transition: 'all 0.3s ease'
  },
  error: {
    textAlign: 'center',
    color: '#f44336',
    margin: '20px 0',
    transition: 'all 0.3s ease'
  },
  retryButton: {
    padding: '10px 20px',
    fontSize: '16px',
    backgroundColor: '#ffd700',
    color: '#1c1c1c',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '10px',
    transition: 'all 0.3s ease'
  },
  noTransactions: {
    textAlign: 'center',
    color: '#cccccc',
    transition: 'all 0.3s ease'
  },
  footer: {
    textAlign: 'center',
    marginTop: '20px',
    padding: '10px',
    borderTop: '1px solid #ffd700',
    color: '#cccccc',
    transition: 'all 0.3s ease'
  }
};

export default Dashboard;

