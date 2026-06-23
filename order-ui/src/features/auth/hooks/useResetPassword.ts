import { useMutation } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { resetPasswordRequest } from '../services/auth.service';
import type { ResetPasswordFields } from '@/types/auth';

export const useResetPassword = (onSuccessCallback: () => void) => {
  return useMutation({
    mutationFn: (data: ResetPasswordFields) => resetPasswordRequest(data),
    onSuccess: () => {
      onSuccessCallback();
    },
    onError: (error: unknown) => {
      const message = isAxiosError(error)
        ? (error.response?.data as { message?: string })?.message ?? error.message
        : error instanceof Error
          ? error.message
          : 'Failed to reset password';
      console.error('Reset password failed:', message);
    },
  });
};
