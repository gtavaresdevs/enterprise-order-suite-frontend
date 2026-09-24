import axios, { isAxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { AuthResponse } from '@/types/auth';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Drops the local session and does a full navigation to /login. The full reload also wipes the
// in-memory React Query cache, so nothing from this session survives into the next login.
export function endSession() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('role');
  window.location.replace('/login');
}

let refreshInFlight: Promise<string> | null = null;

// POST /auth/refresh rotates the refresh token (the old one is rejected after one use), so
// concurrent callers must share a single request instead of each spending the same token.
// Resolves with the new access token. A 4xx means the session is over (ends it); a network
// error or 5xx is rethrown as-is so the UI can show an outage instead of logging the user out.
export function refreshSession(): Promise<string> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        endSession();
        throw new Error('No refresh token');
      }
      try {
        // Bare axios, not `api`, so a failing refresh can't re-enter the 401 interceptor.
        const { data } = await axios.post<AuthResponse>(`${baseURL}/auth/refresh`, { refreshToken });
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        return data.accessToken;
      } catch (error) {
        const status = isAxiosError(error) ? error.response?.status : undefined;
        if (status !== undefined && status >= 400 && status < 500) endSession();
        throw error;
      }
    })().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

// On a 401 from any authenticated endpoint: refresh once, then replay the original request.
// /auth/* is excluded — a 401 there is a real answer (e.g. wrong password), not an expired token.
api.interceptors.response.use(undefined, async (error) => {
  const config = error?.config as RetriableConfig | undefined;
  const isAuthEndpoint = config?.url?.startsWith('/auth/');
  if (!isAxiosError(error) || error.response?.status !== 401 || !config || isAuthEndpoint || config._retried) {
    if (isAxiosError(error) && error.response?.status === 401 && config?._retried) endSession();
    return Promise.reject(error);
  }
  config._retried = true;
  const accessToken = await refreshSession();
  config.headers.Authorization = `Bearer ${accessToken}`;
  return api(config);
});

export default api;
