import { useMutation } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { clearSession } from '@/api/client';
import { resetPasswordRequest } from '../services/auth.service';
import type { ResetPasswordFields } from '@/types/auth';

export const useResetPassword = (onSuccessCallback: () => void) => {
  return useMutation({
    mutationFn: (data: ResetPasswordFields) => resetPasswordRequest(data),
    onSuccess: () => {
      // The backend revoked every refresh token of this user; drop the local access token too so
      // this browser doesn't stay signed in on it until it expires. No redirect: the form shows
      // its own success state with a link to /login.
      clearSession();
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
