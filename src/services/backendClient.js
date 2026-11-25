import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export const backendClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

let isRefreshing = false;
let failedQueue = [];

function processQueue(error) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve();
    }
  });
  failedQueue = [];
}

backendClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const url = originalRequest?.url || '';

    const isAuthEndpoint =
      url.includes('/auth/refresh') ||
      url.includes('/auth/google') ||
      url.includes('/auth/logout');

    if (status !== 401 || !originalRequest || originalRequest._retry || isAuthEndpoint) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(() => backendClient(originalRequest));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      await backendClient.post('/auth/refresh');
      processQueue(null);
      return backendClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth:session-expired'));
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
