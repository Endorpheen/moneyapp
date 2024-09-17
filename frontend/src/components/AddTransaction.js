import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosConfig';
import { toast } from 'react-toastify';

const AddTransaction = () => {
  const [transaction, setTransaction] = useState({
    amount: '',
    date: '',
    description: '',
    category: '' // Начальное состояние категории пустое
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true); // Добавляем состояние для отслеживания загрузки категорий

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get('budget/api/categories/');
        setCategories(response.data);
        
        // Устанавливаем первую категорию по умолчанию после загрузки
        if (response.data.length > 0) {
          setTransaction((prevState) => ({
            ...prevState,
            category: response.data[0].id  // Инициализируем первую категорию
          }));
        }
        setLoading(false); // Отключаем состояние загрузки после получения данных
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Ошибка при загрузке категорий');
        setLoading(false); // Отключаем состояние загрузки в случае ошибки
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTransaction((prevState) => ({
      ...prevState,
      [name]: name === 'category' ? (value ? parseInt(value, 10) : '') : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Проверяем, что категория выбрана
    if (!transaction.category) {
      toast.error('Пожалуйста, выберите категорию');
      return;
    }
  
    try {
      const selectedCategory = categories.find(cat => cat.id === transaction.category);
      const transactionType = selectedCategory ? selectedCategory.type : 'expense';
      const amount = transactionType === 'expense' ? -Math.abs(parseFloat(transaction.amount)) : Math.abs(parseFloat(transaction.amount));
  
      // Удаляем лишнее поле `category` и отправляем только `category_id`
      const transactionData = {
        amount: amount,
        date: transaction.date,
        description: transaction.description,
        category_id: transaction.category // Отправляем только category_id
      };
  
      await axiosInstance.post('budget/api/transactions/', transactionData);
      setTransaction({ amount: '', date: '', description: '', category: categories[0]?.id || '' });
      toast.success('Транзакция успешно добавлена');
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast.error('Ошибка при добавлении транзакции');
    }
  };
  

  if (loading) {
    return <div>Загрузка категорий...</div>; // Пока категории не загружены, отображаем сообщение
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.formGroup}>
        <label htmlFor="amount" style={styles.label}>Сумма</label>
        <input
          id="amount"
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
        <label htmlFor="date" style={styles.label}>Дата</label>
        <input
          id="date"
          type="date"
          name="date"
          value={transaction.date}
          onChange={handleChange}
          required
          style={styles.input}
        />
      </div>

      <div style={styles.formGroup}>
        <label htmlFor="description" style={styles.label}>Описание</label>
        <input
          id="description"
          type="text"
          name="description"
          value={transaction.description}
          onChange={handleChange}
          placeholder="Введите описание"
          style={styles.input}
        />
      </div>

      <div style={styles.formGroup}>
        <label htmlFor="category" style={styles.label}>Категория</label>
        <select
          id="category"
          name="category"
          value={transaction.category}
          onChange={handleChange}
          required
          style={styles.input}
        >
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
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
    cursor: 'pointer',
    fontWeight: 'bold'
  }
};

export default AddTransaction;
