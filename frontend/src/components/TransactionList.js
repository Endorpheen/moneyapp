import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../api/axiosConfig';
import { format } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';

const TransactionList = () => {
  const { t, i18n } = useTranslation();
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
    let sortableTransactions = [...transactions];
    if (sortConfig !== null) {
      sortableTransactions.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
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
    return new Intl.NumberFormat(i18n.language, { style: 'currency', currency: 'RUB' }).format(amount);
  };

  const formatDate = (dateString) => {
    const locale = i18n.language === 'ru' ? ru : enUS;
    return format(new Date(dateString), 'dd MMMM yyyy', { locale });
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>{t('transactions.title')}</h2>
      <input
        type="text"
        placeholder={t('transactions.filterPlaceholder')}
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        style={styles.filterInput}
      />
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th} onClick={() => requestSort('date')}>{t('transactions.date')}</th>
            <th style={styles.th} onClick={() => requestSort('description')}>{t('transactions.description')}</th>
            <th style={styles.th} onClick={() => requestSort('amount')}>{t('transactions.amount')}</th>
          </tr>
        </thead>
        <tbody>
          {filteredTransactions.map((transaction) => (
            <tr key={transaction.id} style={styles.tr}>
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
    textAlign: 'left',
    cursor: 'pointer',
  },
  tr: {
    borderBottom: '1px solid #2C2C2C',
  },
  td: {
    padding: '12px',
  },
};

export default TransactionList;