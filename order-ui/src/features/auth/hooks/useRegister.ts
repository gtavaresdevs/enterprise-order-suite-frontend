import { useMutation } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { registerRequest } from '../services/auth.service';
import type { RegisterFields } from '@/types/auth';

export const useRegister = (onSuccessCallback: () => void) => {
  return useMutation({
    mutationFn: (data: RegisterFields) => registerRequest(data),
    onSuccess: () => {
      onSuccessCallback();
    },
    onError: (error: unknown) => {
      const message = isAxiosError(error)
        ? (error.response?.data as { message?: string })?.message ?? error.message
        : error instanceof Error
          ? error.message
          : 'Registration failed';
      console.error('Registration failed:', message);
    },
  });
};
