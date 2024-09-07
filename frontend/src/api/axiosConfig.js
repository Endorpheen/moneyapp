import axios from 'axios';
import { toast } from 'react-toastify';

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
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post('/budget/api/token/refresh/', { refresh: refreshToken });
        localStorage.setItem('access_token', response.data.access);
        axiosInstance.defaults.headers['Authorization'] = `Bearer ${response.data.access}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        toast.error('Ваша сессия истекла. Пожалуйста, войдите снова.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 3000); // Добавляем задержку в 3 секунды
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

const startTokenRefreshInterval = () => {
  const intervalTime = 4 * 60 * 1000; // 4 минуты
  return setInterval(async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        const response = await axios.post('/budget/api/token/refresh/', { refresh: refreshToken });
        localStorage.setItem('access_token', response.data.access);
        axiosInstance.defaults.headers['Authorization'] = `Bearer ${response.data.access}`;
      } catch (error) {
        console.error('Failed to refresh token:', error);
      }
    }
  }, intervalTime);
};

const stopTokenRefreshInterval = (intervalId) => {
  clearInterval(intervalId);
};

export { axiosInstance, startTokenRefreshInterval, stopTokenRefreshInterval };