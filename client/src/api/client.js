import axios from 'axios';

const rawBaseURL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const baseURL = rawBaseURL.replace(/\/+$/, '').endsWith('/api')
  ? rawBaseURL.replace(/\/+$/, '')
  : `${rawBaseURL.replace(/\/+$/, '')}/api`;

export const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('rentypark_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('rentypark_token');
      localStorage.removeItem('rentypark_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
