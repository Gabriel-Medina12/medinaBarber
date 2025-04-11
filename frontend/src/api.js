import axios from 'axios';

const api = axios.create({
  baseURL: 'https://medinabarber.onrender.com/api', // Base URL para todas las peticiones
  headers: {
    'Content-Type': 'application/json'
  }
});
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
  
  // Interceptor para manejar errores globales
  api.interceptors.response.use(
    response => response,
    error => {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/pages/auth/login';
      }
      return Promise.reject(error);
    }
  );

export default api;