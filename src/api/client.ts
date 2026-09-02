import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API } from '../constants/api';
import { logger } from '../utils/logger';

const SECURE_KEY_ACCESS = 'auth_access_token';
const SECURE_KEY_REFRESH = 'auth_refresh_token';

/** Store tokens securely */
export async function storeTokens(access: string, refresh: string): Promise<void> {
  await SecureStore.setItemAsync(SECURE_KEY_ACCESS, access);
  await SecureStore.setItemAsync(SECURE_KEY_REFRESH, refresh);
}

/** Retrieve access token */
export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(SECURE_KEY_ACCESS);
}

/** Retrieve refresh token */
export async function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(SECURE_KEY_REFRESH);
}

/** Remove all stored tokens */
export async function clearTokens(): Promise<void> {
  await SecureStore.deleteItemAsync(SECURE_KEY_ACCESS);
  await SecureStore.deleteItemAsync(SECURE_KEY_REFRESH);
}

let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

// Create the Axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API.BASE_URL,
  timeout: API.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor — attach access token
apiClient.interceptors.request.use(async config => {
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle 401 and token refresh
apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await getRefreshToken();
        if (!refreshToken) throw new Error('No refresh token');

        const response = await axios.post(`${API.BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefresh } = response.data;
        await storeTokens(accessToken, newRefresh);

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return apiClient(originalRequest);
      } catch {
        await clearTokens();
        onUnauthorized?.();
        return Promise.reject(error);
      }
    }

    logger.error('API error', error.response?.status, error.message);
    return Promise.reject(error);
  }
);

export default apiClient;
