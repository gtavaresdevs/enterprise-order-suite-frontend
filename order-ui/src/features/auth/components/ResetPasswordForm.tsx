import React, { useState } from 'react';
import { isAxiosError } from 'axios';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useResetPassword } from '../hooks/useResetPassword';

export const ResetPasswordForm = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { mutate: resetPassword, isPending, error } = useResetPassword(() => setIsSuccess(true));

  const errorMessage =
    error && isAxiosError(error)
      ? (error.response?.data as { message?: string } | undefined)?.message ?? 'Failed to reset password'
      : error
        ? 'Failed to reset password'
        : null;

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.newPassword) {
      newErrors.newPassword = 'Password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    } else if (!/(?=.*[0-9])(?=.*[!@#$%^&*])/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain a number and a special character';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!validate()) return;
    resetPassword({ token, newPassword: formData.newPassword });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  if (!token) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm text-center">
        <p className="mb-4">Invalid or missing reset link. Please request a new password reset.</p>
        <Link
          to="/forgot-password"
          className="font-medium text-red-800 hover:text-red-900 hover:underline"
        >
          Request new link
        </Link>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="bg-white p-8 rounded-[8px] shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-200 max-w-md w-full text-center">
        <div className="mx-auto w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="w-6 h-6 text-green-600" />
        </div>
        <h2 className="text-2xl font-semibold text-slate-900 mb-2">Password updated</h2>
        <p className="text-slate-600 mb-6">Your password has been reset successfully. You can now sign in.</p>
        <Link
          to="/login"
          className="block w-full bg-slate-700 hover:bg-slate-800 text-white font-medium py-2.5 px-4 rounded-md text-center transition-colors focus:outline-none focus:ring-2 focus:ring-slate-700"
        >
          Continue to Sign In
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {errorMessage}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="newPassword">New Password</Label>
        <div className="relative">
          <Input
            id="newPassword"
            name="newPassword"
            type={showPassword ? 'text' : 'password'}
            value={formData.newPassword}
            onChange={handleChange}
            className={errors.newPassword ? 'border-red-300 focus:ring-red-500/10' : ''}
            placeholder="Enter your new password"
            disabled={isPending}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.newPassword ? (
          <div className="flex items-center text-red-600 text-xs font-medium">
            <AlertCircle className="w-3.5 h-3.5 mr-1 shrink-0" />
            <span>{errors.newPassword}</span>
          </div>
        ) : (
          <p className="text-xs text-slate-500">
            Must be at least 8 characters, include a number and special character.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={handleChange}
            className={errors.confirmPassword ? 'border-red-300 focus:ring-red-500/10' : ''}
            placeholder="Confirm your new password"
            disabled={isPending}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
            tabIndex={-1}
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <div className="flex items-center text-red-600 text-xs font-medium">
            <AlertCircle className="w-3.5 h-3.5 mr-1" />
            {errors.confirmPassword}
          </div>
        )}
      </div>

      <Button
        type="submit"
        className="w-full rounded-[8px] bg-slate-950 hover:bg-slate-900 text-slate-50 font-semibold border border-slate-800 transition-all duration-200 shadow-sm hover:shadow"
        disabled={isPending}
      >
        {isPending ? 'Resetting password...' : 'Reset password'}
      </Button>

      <p className="text-center text-sm text-slate-600">
        <Link to="/login" className="font-medium text-slate-900 hover:text-slate-700 hover:underline">
          Back to Sign In
        </Link>
      </p>
    </form>
  );
};
