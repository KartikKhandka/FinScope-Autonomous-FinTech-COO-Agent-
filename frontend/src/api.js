import axios from 'axios';
import { getAccessToken, clearAccessToken } from './auth';
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});
apiClient.interceptors.request.use(config => {
  const token = getAccessToken();
  console.log('API Request:', config.method, config.url, 'Token:', token ? 'Present' : 'Missing');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('Authorization header set');
  }
  return config;
});
apiClient.interceptors.response.use(response => response, error => {
  console.error('API Error:', error.response?.status, error.response?.data);
  if (error.response?.status === 401) {
    console.log('Got 401, clearing token and redirecting to login');
    clearAccessToken();
    window.location.href = '/login';
  }
  return Promise.reject(error);
});
export const login = (username, password) => {
  const form = new URLSearchParams();
  form.append('username', username);
  form.append('password', password);
  console.log('Sending login request with form data');
  return apiClient.post('/login', form, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
};
export const register = (username, password) => {
  return apiClient.post('/register', {
    username,
    password
  });
};
export const uploadDataset = (file, onProgress) => {
  const form = new FormData();
  form.append('file', file);
  return apiClient.post('/datasets/upload', form, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    timeout: 0,
    onUploadProgress: e => {
      if (e.total && onProgress) onProgress(Math.round(e.loaded / e.total * 100));
    }
  });
};
export const getDatasets = () => apiClient.get('/datasets');
export const getDashboard = () => apiClient.get('/dashboard');
export const getRevenueAnalysis = () => apiClient.get('/revenue-analysis');
export const getForecast = () => apiClient.get('/forecast');
export const getFraudAnalysis = () => apiClient.get('/fraud-analysis');
export const getChurnAnalysis = () => apiClient.get('/churn-analysis');
export const generateReport = payload => apiClient.post('/generate-report', payload);
export const askCOOAgent = payload => apiClient.post('/ask-coo-agent', payload);