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

// Drops every trace of the session from localStorage without navigating. The refresh cookie is
// HttpOnly, so only the server can clear it (POST /auth/logout).
export function clearSession() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('role');
}

// Drops the local session and does a full navigation to /login. The full reload also wipes the
// in-memory React Query cache, so nothing from this session survives into the next login.
export function endSession() {
  clearSession();
  window.location.replace('/login');
}

// The backend answers 403 with this code when the refresh cookie arrives from an origin outside
// its CORS list: a deploy misconfiguration, not an expired session, so it must not log out.
const ORIGIN_NOT_ALLOWED = 'ORIGIN_NOT_ALLOWED';

// One network refresh. The refresh token travels in the HttpOnly cookie (withCredentials). A
// refreshToken still in localStorage predates the cookie: send it in the body this one time
// (the backend falls back to it when there is no cookie), then forget it; the response sets the
// cookie. `{}` keeps Content-Type: application/json, which the endpoint requires.
async function postRefresh(): Promise<string> {
  const legacyRefreshToken = localStorage.getItem('refreshToken');
  const body = legacyRefreshToken ? { refreshToken: legacyRefreshToken } : {};
  // Bare axios, not `api`, so a failing refresh can't re-enter the 401 interceptor.
  const { data } = await axios.post<AuthResponse>(`${baseURL}/auth/refresh`, body, { withCredentials: true });
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.removeItem('refreshToken');
  return data.accessToken;
}

// Web Locks serialize refresh across every tab of this origin. They need a secure context
// (https or localhost); where unavailable, fall back to the in-tab dedupe alone.
function withRefreshLock<T>(fn: () => Promise<T>): Promise<T> {
  if (typeof navigator.locks?.request !== 'function') return fn();
  return navigator.locks.request('order-ui:auth-refresh', fn);
}

let refreshInFlight: Promise<string> | null = null;

// POST /auth/refresh rotates the refresh token, and a second use of a rotated token revokes the
// whole token family (no grace window). So callers in this tab share a single request, and the
// Web Lock keeps other tabs from refreshing at the same time.
// Resolves with the new access token. A 4xx means the session is over (ends it), except
// ORIGIN_NOT_ALLOWED; a network error, 5xx or that 403 is rethrown so the UI shows an outage.
export function refreshSession(): Promise<string> {
  if (!refreshInFlight) {
    // The token that triggered this refresh. If localStorage holds a different one once we get
    // the lock, another tab already rotated: reuse its token. Rotating again would only waste a
    // rotation, and in the legacy body path it would spend a token that tab already used.
    const staleAccessToken = localStorage.getItem('accessToken');
    refreshInFlight = withRefreshLock(async () => {
      const current = localStorage.getItem('accessToken');
      if (current && current !== staleAccessToken) return current;
      try {
        return await postRefresh();
      } catch (error) {
        const status = isAxiosError(error) ? error.response?.status : undefined;
        const code = isAxiosError(error)
          ? (error.response?.data as { code?: string } | undefined)?.code
          : undefined;
        if (status !== undefined && status >= 400 && status < 500 && code !== ORIGIN_NOT_ALLOWED) {
          endSession();
        }
        throw error;
      }
    }).finally(() => {
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
