import axios from 'axios';
import { COOKIE_AUTH, LOCAL_STORAGE_KEYS } from '../utils/constants';
import { loadState } from '../utils/localStorage';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  withCredentials: COOKIE_AUTH,
});

// Request interceptor: attach JWT token in non-cookie mode
apiClient.interceptors.request.use((config) => {
  if (!COOKIE_AUTH) {
    const sessionId = loadState(LOCAL_STORAGE_KEYS.sessionId);
    if (sessionId) {
      config.headers['X-Session-Token'] = sessionId;
    }
  }
  return config;
});

// Response interceptor: handle 401 globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Session expired or invalid — clear local state
      localStorage.removeItem(LOCAL_STORAGE_KEYS.loginAdminDetails);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.sessionId);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
