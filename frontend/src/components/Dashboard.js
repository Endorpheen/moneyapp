import React, { useState, useEffect } from 'react';
import { axiosInstance } from '../api/axiosConfig'; // Исправлен импорт

function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [newTransaction, setNewTransaction] = useState({
    description: '',
    amount: '',
    category: '', // Изменено на category
    date: new Date().toISOString().split('T')[0]
  });

  const categories = [
    { id: 1, name: 'Продукты' },
    { id: 2, name: 'Транспорт' },
    { id: 3, name: 'Развлечения' },
    { id: 4, name: 'Зарплата' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axiosInstance.get('/budget/api/dashboard/');
      // Сортируем транзакции по дате в порядке убывания
      const sortedTransactions = response.data.recent_transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
      setData({ ...response.data, recent_transactions: sortedTransactions });
    } catch (error) {
      console.error('Fetch error:', error);
      setError(error.message);
    }
  };

  const handleInputChange = (e) => {
    setNewTransaction({
      ...newTransaction,
      [e.target.name]: e.target.name === 'amount' ? parseFloat(e.target.value) : e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Sending transaction data:', newTransaction); // Добавьте этот console.log
      await axiosInstance.post('/budget/api/transactions/', {
        ...newTransaction,
        category_id: newTransaction.category // Изменено на category_id
      });
      setNewTransaction({
        description: '',
        amount: '',
        category: '', // Изменено на category
        date: new Date().toISOString().split('T')[0]
      });
      fetchData(); // Обновляем данные после добавления транзакции
    } catch (error) {
      console.error('Error adding transaction:', error);
      console.log('Error response:', error.response); // Добавьте этот console.log
    }
  };

  if (error) return <div style={styles.error}>Error: {error}</div>;
  if (!data) return <div style={styles.loading}>Loading...</div>;

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

  const renderTransactions = () => {
    if (!Array.isArray(data.recent_transactions) || data.recent_transactions.length === 0) {
      return <p style={styles.noData}>Нет данных о транзакциях</p>;
    }
    return (
      <ul style={styles.transactionList}>
        {data.recent_transactions.map((transaction, index) => (
          <li key={index} style={styles.transactionItem}>
            <div style={styles.transactionDescription}>{transaction.description || 'N/A'}</div>
            <div style={{
              ...styles.transactionAmount,
              color: transaction.amount > 0 ? styles.income.color : styles.expense.color
            }}>
              {formatCurrency(Math.abs(transaction.amount))}
            </div>
            <div style={styles.transactionDate}>{formatDate(transaction.date)}</div>
            <div style={styles.transactionCategory}>
              {transaction.category?.name || 'N/A'} ({transaction.category?.type || 'N/A'})
            </div>
          </li>
        ))}
      </ul>
    );
  };

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
            name="category" // Изменено на category
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
        {renderTransactions()}
      </div>
    </div>
  );
}

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
  error: {
    color: '#f44336',
    textAlign: 'center',
    fontSize: '18px'
  },
  loading: {
    color: '#ffd700',
    textAlign: 'center',
    fontSize: '18px'
  },
  noData: {
    color: '#cccccc',
    textAlign: 'center'
  }
};

export default Dashboard;