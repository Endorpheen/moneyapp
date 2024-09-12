import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosConfig';

const AddBudget = () => {
  const [budget, setBudget] = useState({
    category: '',
    amount: '',
    start_date: '',
    end_date: '',
    user: ''
  });

  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Fetch categories and users from the API
    const fetchCategories = axiosInstance.get('/budget/api/categories/');
    const fetchUsers = axiosInstance.get('/budget/api/users/');

    Promise.all([fetchCategories, fetchUsers])
      .then(([categoriesResponse, usersResponse]) => {
        setCategories(categoriesResponse.data);
        setUsers(usersResponse.data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, []);

  const handleChange = (e) => {
    setBudget({ ...budget, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/budget/api/budgets/', budget);
      alert('Бюджет успешно добавлен!');
      setBudget({ category: '', amount: '', start_date: '', end_date: '', user: '' });
    } catch (error) {
      console.error('Error adding budget:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.formGroup}>
        <label htmlFor="category" style={styles.label}>Категория</label>
        <select
          id="category"
          name="category"
          value={budget.category}
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
  
      <div style={styles.formGroup}>
        <label htmlFor="amount" style={styles.label}>Сумма</label>
        <input
          id="amount"
          type="number"
          name="amount"
          value={budget.amount}
          onChange={handleChange}
          placeholder="Сумма"
          required
          style={styles.input}
        />
      </div>
  
      <div style={styles.formGroup}>
        <label htmlFor="start_date" style={styles.label}>Дата начала</label>
        <input
          id="start_date"
          type="date"
          name="start_date"
          value={budget.start_date}
          onChange={handleChange}
          required
          style={styles.input}
        />
      </div>
  
      <div style={styles.formGroup}>
        <label htmlFor="end_date" style={styles.label}>Дата окончания</label>
        <input
          id="end_date"
          type="date"
          name="end_date"
          value={budget.end_date}
          onChange={handleChange}
          required
          style={styles.input}
        />
      </div>
  
      <div style={styles.formGroup}>
        <label htmlFor="user" style={styles.label}>Пользователь</label>
        <select
          id="user"
          name="user"
          value={budget.user}
          onChange={handleChange}
          required
          style={styles.input}
        >
          <option value="">Выберите пользователя</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>{user.username}</option>
          ))}
        </select>
      </div>
  
      <button type="submit" style={styles.button}>Добавить бюджет</button>
    </form>
  );
}

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

export default AddBudget;