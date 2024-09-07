import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000'; // Укажите ваш базовый URL

// Функция для входа пользователя
export const loginUser = async (username, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api-token-auth/`, {
      username,
      password,
    });
    const token = response.data.token;
    // Сохраните токен в localStorage или в состоянии приложения
    localStorage.setItem('authToken', token);
    // Установите заголовок по умолчанию для всех будущих запросов
    axios.defaults.headers.common['Authorization'] = `Token ${token}`;
    return true; // Вернуть успешный результат
  } catch (error) {
    console.error('Ошибка при входе:', error);
    return false; // Вернуть ошибку
  }
};
