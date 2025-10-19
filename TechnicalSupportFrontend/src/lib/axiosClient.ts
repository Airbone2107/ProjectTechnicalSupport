import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'https://localhost:7194',
  headers: {
    'Content-Type': 'application/json',
  },
});

const handleLogout = () => {
  localStorage.removeItem('token');
  window.location.href = '/login';
};

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.error('Unauthorized or token expired. Logging out.');
      handleLogout();
    }
    return Promise.reject(error);
  }
);

export default axiosClient; 