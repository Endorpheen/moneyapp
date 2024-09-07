import React, { useState, useEffect, useCallback } from 'react';
import { axiosInstance, startTokenRefreshInterval, stopTokenRefreshInterval } from '../api/axiosConfig';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

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

  // Данные для графика доходов и расходов
  const incomeExpenseData = [
    { name: 'Доходы', Доходы: data.income },
    { name: 'Расходы', Расходы: data.expenses }
  ];

  // Данные для круговой диаграммы расходов по категориям
  const expenseCategoryData = categories
    .filter(cat => cat.type === 'expense')
    .map(cat => ({
      name: cat.name,
      value: data.recent_transactions.filter(t => t.category?.id === cat.id).reduce((sum, t) => sum + Math.abs(t.amount), 0)
    }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div style={styles.dashboard}>
      <h1 style={styles.title}>Финансовый Дашборд</h1>
      
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
              label
            >
              {expenseCategoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>
      </div>
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
  title: {
    textAlign: 'center',
    color: '#ffd700',
    transition: 'all 0.3s ease'
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
}
};

export default Dashboard;