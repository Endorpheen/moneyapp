import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosConfig';
import { toast } from 'react-toastify';

const AddTransaction = () => {
  const [transaction, setTransaction] = useState({
    amount: '',
    date: '',
    description: '',
    category: ''
  });

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get('budget/api/categories/');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Ошибка при загрузке категорий');
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setTransaction({ ...transaction, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const selectedCategory = categories.find(cat => cat.id === parseInt(transaction.category));
      const transactionType = selectedCategory ? selectedCategory.type : 'expense';
      const amount = transactionType === 'expense' ? -Math.abs(parseFloat(transaction.amount)) : Math.abs(parseFloat(transaction.amount));

      const transactionData = {
        ...transaction,
        amount: amount,
        category_id: parseInt(transaction.category)
      };

      await axiosInstance.post('budget/api/transactions/', transactionData);
      setTransaction({ amount: '', date: '', description: '', category: '' });
      toast.success('Транзакция успешно добавлена');
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast.error('Ошибка при добавлении транзакции');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.formGroup}>
        <label style={styles.label}>Сумма</label>
        <input
          type="number"
          name="amount"
          value={transaction.amount}
          onChange={handleChange}
          placeholder="Введите сумму"
          required
          style={styles.input}
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Дата</label>
        <input
          type="date"
          name="date"
          value={transaction.date}
          onChange={handleChange}
          required
          style={styles.input}
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Описание</label>
        <input
          type="text"
          name="description"
          value={transaction.description}
          onChange={handleChange}
          placeholder="Введите описание"
          style={styles.input}
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Категория</label>
        <select
          name="category"
          value={transaction.category}
          onChange={handleChange}
          required
          style={styles.input}
        >
          <option value="">Выберите категорию</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
      </div>

      <button type="submit" style={styles.button}>Добавить транзакцию</button>
    </form>
  );
};

const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    maxWidth: '400px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#2c2c2c',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(255,215,0,0.1)'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column'
  },
  label: {
    color: '#ffd700',
    marginBottom: '5px'
  },
  input: {
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ffd700',
    backgroundColor: '#1c1c1c',
    color: '#ffffff'
  },
  button: {
    padding: '10px',
    backgroundColor: '#ffd700',
    color: '#1c1c1c',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  }
};

export default AddTransaction;