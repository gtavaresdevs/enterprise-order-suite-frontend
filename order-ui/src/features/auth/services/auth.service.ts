import api from '@/api/client';
import type { AuthResponse, LoginCredentials } from '@/types/auth';

export const loginRequest = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>('/auth/login', credentials);
  return data;
};
