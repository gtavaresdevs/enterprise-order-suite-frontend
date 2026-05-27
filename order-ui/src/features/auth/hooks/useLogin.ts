import { isAxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import type { AuthResponse, LoginCredentials } from '@/types/auth';
import { loginRequest } from '../services/auth.service';

export const useLogin = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => loginRequest(credentials),
    onSuccess: (data: AuthResponse) => {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
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
