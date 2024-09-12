import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosConfig';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { toast } from 'react-toastify';

const BudgetList = () => {
  const [budgets, setBudgets] = useState([]);
  const [newBudget, setNewBudget] = useState({ amount: '', start_date: '', end_date: '', category: '' });
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const budgetsResponse = await axiosInstance.get('/budget/api/budgets/');
        setBudgets(budgetsResponse.data);
        const categoriesResponse = await axiosInstance.get('/budget/api/categories/');
        setCategories(categoriesResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchBudgets();
  }, []);

  const handleInputChange = (e) => {
    setNewBudget({ ...newBudget, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post('/budget/api/budgets/', newBudget);
      setBudgets([...budgets, response.data]);
      setNewBudget({ amount: '', start_date: '', end_date: '', category: '' });
      toast.success('Бюджет успешно добавлен!');
    } catch (error) {
      console.error('Error adding budget:', error);
      toast.error('Ошибка при добавлении бюджета');
    }
  };

  const deleteBudget = async (budgetId) => {
    try {
      await axiosInstance.delete(`/budget/api/budgets/${budgetId}/`);
      setBudgets(budgets.filter((budget) => budget.id !== budgetId));
      toast.success('Бюджет успешно удалён');
    } catch (error) {
      console.error('Error deleting budget:', error);
      toast.error('Ошибка при удалении бюджета');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(amount);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Бюджеты</h2>
      <div style={styles.budgetList}>
        {budgets.map((budget) => (
          <div key={budget.id} style={styles.budgetItem}>
            <h3 style={styles.budgetTitle}>{budget.category.name}</h3>
            <p style={styles.budgetAmount}>{formatCurrency(budget.amount)}</p>
            <p style={styles.budgetDates}>
              {format(new Date(budget.start_date), 'dd MMMM yyyy', { locale: ru })} - 
              {format(new Date(budget.end_date), 'dd MMMM yyyy', { locale: ru })}
            </p>
            <button style={styles.deleteButton} onClick={() => deleteBudget(budget.id)}>Удалить</button>
          </div>
        ))}
      </div>
      <div style={styles.addBudgetForm}>
        <h3 style={styles.formTitle}>Добавить новый бюджет</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="number"
            name="amount"
            value={newBudget.amount}
            onChange={handleInputChange}
            placeholder="Сумма"
            style={styles.input}
          />
          <input
            type="date"
            name="start_date"
            value={newBudget.start_date}
            onChange={handleInputChange}
            style={styles.input}
            aria-label="Дата начала"  // Добавляем aria-label
          />
          <input
            type="date"
            name="end_date"
            value={newBudget.end_date}
            onChange={handleInputChange}
            style={styles.input}
            aria-label="Дата окончания"  // Добавляем aria-label
          />
          <select
            name="category"
            value={newBudget.category}
            onChange={handleInputChange}
            style={styles.input}
            aria-label="Категория"  // Добавляем aria-label
          >
            <option value="">Выберите категорию</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
          <button type="submit" style={styles.button}>Добавить бюджет</button>
        </form>
      </div>
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
  budgetList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '40px',
  },
  budgetItem: {
    backgroundColor: '#2C2C2C',
    padding: '15px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  budgetTitle: {
    color: '#FFD700',
    marginBottom: '10px',
  },
  budgetAmount: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '5px',
  },
  budgetDates: {
    fontSize: '14px',
    color: '#CCCCCC',
  },
  deleteButton: {
    backgroundColor: '#f44336',
    color: 'white',
    padding: '10px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '10px',
    fontWeight: 'bold',
  },
  addBudgetForm: {
    backgroundColor: '#2C2C2C',
    padding: '20px',
    borderRadius: '8px',
  },
  formTitle: {
    color: '#FFD700',
    marginBottom: '15px',
  },
  input: {
    width: '100%',
    padding: '10px',
    marginBottom: '10px',
    backgroundColor: '#1E1E1E',
    border: '1px solid #FFD700',
    borderRadius: '4px',
    color: '#FFFFFF',
  },
  button: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#FFD700',
    color: '#1E1E1E',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
};

export default BudgetList;
