import { isAxiosError } from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import type { AuthResponse, LoginCredentials } from '@/types/auth';
import { loginRequest } from '../services/auth.service';
import { extractUserFromStorage } from '../utils/auth.utils';

export const useLogin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => loginRequest(credentials),
    onSuccess: (data: AuthResponse) => {
      // Start the new session with an empty cache so nothing from a previous user/session leaks in.
      queryClient.clear();
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      const user = extractUserFromStorage();
      if (user && user.roles.length > 0) {
        localStorage.setItem('role', user.roles[0]);
      }
      navigate('/home');
    },
    onError: (error: unknown) => {
      const message = isAxiosError(error)
        ? (error.response?.data as { message?: string } | undefined)?.message ?? error.message
        : error instanceof Error
          ? error.message
          : 'Login failed';
      console.error('Login failed:', message);
    },
  });
};
