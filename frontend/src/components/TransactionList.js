import React, { useState, useEffect, useMemo } from 'react';
import axiosInstance from '../api/axiosConfig';
import { format } from 'date-fns';

const TransactionList = () => {
  const [transactions, setTransactions] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axiosInstance.get('/budget/api/transactions/');
        setTransactions(response.data);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };

    fetchTransactions();
  }, []);

  const sortedTransactions = useMemo(() => {
    if (!transactions) return [];

    let sortableTransactions = [...transactions];

    // Проверяем, задана ли конфигурация сортировки
    if (sortConfig !== null) {
      sortableTransactions.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        // Если ключ - "amount", сортируем как числа
        if (sortConfig.key === 'amount') {
          return sortConfig.direction === 'asc' 
            ? aValue - bValue 
            : bValue - aValue;
        }

        // Если ключ - "date", сортируем как даты
        if (sortConfig.key === 'date') {
          return sortConfig.direction === 'asc' 
            ? new Date(aValue) - new Date(bValue) 
            : new Date(bValue) - new Date(aValue);
        }

        // В противном случае сортируем как строки
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      });
    }

    return sortableTransactions;
  }, [transactions, sortConfig]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredTransactions = sortedTransactions.filter(transaction =>
    transaction.description.toLowerCase().includes(filter.toLowerCase())
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(amount);
  };

  const formatDate = (dateString) => {
    // Проверяем, что дата существует и является валидной
    if (!dateString) {
      return 'Некорректная дата';
    }
    try {
      return format(new Date(dateString), 'dd MMMM yyyy');
    } catch (error) {
      console.error('Ошибка форматирования даты:', error);
      return 'Некорректная дата';
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Список транзакций</h2>
      <input
        type="text"
        placeholder="Фильтр"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        style={styles.filterInput}
      />
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th} onClick={() => requestSort('date')}>Дата</th>
            <th style={styles.th} onClick={() => requestSort('description')}>Описание</th>
            <th style={styles.th} onClick={() => requestSort('amount')}>Сумма</th>
          </tr>
        </thead>
        <tbody>
          {filteredTransactions.map((transaction) => (
            <tr key={transaction.id} className="transaction-item" style={styles.tr}> {/* Класс добавлен здесь */}
              <td style={styles.td}>{formatDate(transaction.date)}</td>
              <td style={styles.td}>{transaction.description}</td>
              <td style={{...styles.td, color: transaction.amount > 0 ? '#4caf50' : '#f44336'}}>
                {formatCurrency(transaction.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#1E1E1E',
    color: '#FFFFFF',
    padding: '20px',
    borderRadius: '8px',
    maxWidth: '800px',
    margin: '0 auto',
  },
  title: {
    color: '#FFD700',
    marginBottom: '20px',
  },
  filterInput: {
    width: '100%',
    padding: '10px',
    marginBottom: '20px',
    backgroundColor: '#2C2C2C',
    border: '1px solid #FFD700',
    borderRadius: '4px',
    color: '#FFFFFF',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    backgroundColor: '#2C2C2C',
    color: '#FFD700',
    padding: '12px',
    textAlign: 'center', // Выровняли заголовки по центру
    cursor: 'pointer',
  },
  tr: {
    borderBottom: '1px solid #2C2C2C',
  },
  td: {
    padding: '12px',
    textAlign: 'center', // Выровняли данные по центру
  },
};

export default TransactionList;
