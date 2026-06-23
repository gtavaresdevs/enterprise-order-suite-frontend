import api from '@/api/client';
import type {
  AuthResponse,
  ForgotPasswordFields,
  LoginCredentials,
  RegisterFields,
  ResetPasswordFields,
} from '@/types/auth';

export const loginRequest = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>('/auth/login', credentials);
  return data;
};

export const registerRequest = async (data: RegisterFields): Promise<void> => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

export const forgotPasswordRequest = async (data: ForgotPasswordFields): Promise<void> => {
  await api.post('/auth/forgot-password', data);
};

export const resetPasswordRequest = async (data: ResetPasswordFields): Promise<void> => {
  await api.post('/auth/reset-password', data);
};
