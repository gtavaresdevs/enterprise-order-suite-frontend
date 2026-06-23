import React, { useState } from 'react';
import { isAxiosError } from 'axios';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForgotPassword } from '../hooks/useForgotPassword';

export const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSuccess, setIsSuccess] = useState(false);

  const { mutate: forgotPassword, isPending, error } = useForgotPassword(() => setIsSuccess(true));

  const errorMessage =
    error && isAxiosError(error)
      ? (error.response?.data as { message?: string } | undefined)?.message ?? 'Failed to send reset email'
      : error
        ? 'Failed to send reset email'
        : null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    forgotPassword({ email: email.trim() });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: '' }));
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-white p-8 rounded-[8px] shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-200 max-w-md w-full text-center">
        <div className="mx-auto w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="w-6 h-6 text-green-600" />
        </div>
        <h2 className="text-2xl font-semibold text-slate-900 mb-2">Check your email</h2>
        <p className="text-slate-600 mb-6 break-words">
          If an account exists for{' '}
          <span className="font-medium text-slate-800 break-all">{email}</span>, you will receive a password reset link
          shortly.
        </p>
        <Link
          to="/login"
          className="block w-full bg-slate-700 hover:bg-slate-800 text-white font-medium py-2.5 px-4 rounded-md text-center transition-colors focus:outline-none focus:ring-2 focus:ring-slate-700"
        >
          Back to Sign In
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
        <Label htmlFor="email">Email Address</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <Input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={handleChange}
            className={`pl-10 ${errors.email ? 'border-red-300 focus:ring-red-500/10' : ''}`}
            placeholder="you@company.com"
            disabled={isPending}
          />
        </div>
        {errors.email && (
          <div className="flex items-center text-red-600 text-xs font-medium">
            <AlertCircle className="w-3.5 h-3.5 mr-1" />
            {errors.email}
          </div>
        )}
      </div>

      <Button
        type="submit"
        className="w-full rounded-[8px] bg-slate-950 hover:bg-slate-900 text-slate-50 font-semibold border border-slate-800 transition-all duration-200 shadow-sm hover:shadow"
        disabled={isPending}
      >
        {isPending ? 'Sending...' : 'Send reset link'}
      </Button>

      <p className="text-center text-sm text-slate-600">
        Remember your password?{' '}
        <Link to="/login" className="font-medium text-slate-900 hover:text-slate-700 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
};
