import axios from 'axios';
import { toast } from 'react-toastify'; // Импортируем toast из react-toastify

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const accessToken = await refreshAccessToken();
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        toast.error('Ваша сессия истекла. Пожалуйста, войдите снова.'); // Добавляем уведомление
        setTimeout(() => {
          window.location.href = '/login';
        }, 3000); // Добавляем задержку в 3 секунды
      }
    }
    return Promise.reject(error);
  }
);

const refreshAccessToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refresh_token');
    const response = await axios.post('/budget/api/token/refresh/', { refresh: refreshToken });
    localStorage.setItem('access_token', response.data.access);
    return response.data.access;
  } catch (error) {
    console.error('Token refresh failed:', error);
    throw error;
  }
};

// Добавляем механизм автоматического обновления токена
const tokenExpirationTime = 5 * 60 * 1000; // 5 минут в миллисекундах
let tokenRefreshInterval;

const startTokenRefreshInterval = () => {
  tokenRefreshInterval = setInterval(async () => {
    try {
      await refreshAccessToken();
      console.log('Token refreshed successfully');
    } catch (error) {
      console.error('Token refresh failed:', error);
      clearInterval(tokenRefreshInterval);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      toast.error('Ваша сессия истекла. Пожалуйста, войдите снова.'); // Добавляем уведомление
      setTimeout(() => {
        window.location.href = '/login';
      }, 3000); // Добавляем задержку в 3 секунды
    }
  }, tokenExpirationTime - 10000); // Обновляем токен за 10 секунд до истечения срока действия
};

const stopTokenRefreshInterval = () => {
  clearInterval(tokenRefreshInterval);
};

export { axiosInstance, startTokenRefreshInterval, stopTokenRefreshInterval };