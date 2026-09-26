import api from '@/api/client';
import type {
  AuthResponse,
  ForgotPasswordFields,
  LoginCredentials,
  RegisterFields,
  ResetPasswordFields,
} from '@/types/auth';

// withCredentials so the browser stores the HttpOnly refreshToken cookie from Set-Cookie.
export const loginRequest = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>('/auth/login', credentials, { withCredentials: true });
  return data;
};

export const registerRequest = async (data: RegisterFields): Promise<void> => {
  const response = await api.post('/auth/register', data, { withCredentials: true });
  return response.data;
};

export const forgotPasswordRequest = async (data: ForgotPasswordFields): Promise<void> => {
  await api.post('/auth/forgot-password', data);
};

export const resetPasswordRequest = async (data: ResetPasswordFields): Promise<void> => {
  await api.post('/auth/reset-password', data);
};

export const logoutRequest = async (): Promise<void> => {
  // POST /auth/logout revokes the whole token family and clears the cookie; idempotent (200 even
  // with no token). A pre-cookie refreshToken still in localStorage goes in the body instead.
  const legacyRefreshToken = localStorage.getItem('refreshToken');
  await api.post('/auth/logout', legacyRefreshToken ? { refreshToken: legacyRefreshToken } : {}, {
    withCredentials: true,
  });
};
