import axios from 'axios';

// Create the unified Axios client instance
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT authorization token dynamically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('medilex_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to catch authentication session expiries
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and reload if user session expires
      localStorage.removeItem('medilex_auth_token');
      localStorage.removeItem('medilex_user');
      
      // Allow graceful handling inside components rather than hard-crashing
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
