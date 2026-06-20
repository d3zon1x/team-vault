import axios, { AxiosError } from 'axios';
import type { AxiosInstance } from 'axios';
import { authStorage } from './authStorage';
import type { LoginResponse } from '../types/auth';

const API_BASE_URL = 'http://localhost:8000/api';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag to prevent infinite loops during token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });

  isRefreshing = false;
  failedQueue = [];
};

// Request interceptor: Add auth header
apiClient.interceptors.request.use(
  (config) => {
    const accessToken = authStorage.getAccessToken();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor: Handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // If 401 and we haven't retried yet, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = authStorage.getRefreshToken();
        if (!refreshToken) {
          authStorage.clearTokens();
          window.location.href = '/login';
          return Promise.reject(error);
        }

        const response = await axios.post<LoginResponse>(
          `${API_BASE_URL}/auth/refresh`,
          { refresh_token: refreshToken },
        );

        const { access_token, refresh_token } = response.data;
        authStorage.setTokens({
          accessToken: access_token,
          refreshToken: refresh_token,
        });

        apiClient.defaults.headers.common.Authorization = `Bearer ${access_token}`;
        originalRequest.headers.Authorization = `Bearer ${access_token}`;

        processQueue(null, access_token);
        return apiClient(originalRequest);
      } catch (err) {
        processQueue(err, null);
        authStorage.clearTokens();
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
