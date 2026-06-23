import { useMutation } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { forgotPasswordRequest } from '../services/auth.service';
import type { ForgotPasswordFields } from '@/types/auth';

export const useForgotPassword = (onSuccessCallback: () => void) => {
  return useMutation({
    mutationFn: (data: ForgotPasswordFields) => forgotPasswordRequest(data),
    onSuccess: () => {
      onSuccessCallback();
    },
    onError: (error: unknown) => {
      const message = isAxiosError(error)
        ? (error.response?.data as { message?: string })?.message ?? error.message
        : error instanceof Error
          ? error.message
          : 'Failed to send reset email';
      console.error('Forgot password failed:', message);
    },
  });
};
