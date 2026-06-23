import React, { useState } from 'react';
import { useRegister } from '../hooks/useRegister';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Building2, Eye, EyeOff, CheckCircle2, AlertCircle, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { mutate: register, isPending } = useRegister(() => setIsSuccess(true));

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[0-9])(?=.*[!@#$%^&*])/.test(formData.password)) {
      newErrors.password = 'Password must contain a number and a special character';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    register({
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email,
      password: formData.password,
      role: 'USER',
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-white p-8 rounded-[8px] shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-200 max-w-md w-full text-center">
        <div className="mx-auto w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="w-6 h-6 text-green-600" />
        </div>
        <h2 className="text-2xl font-semibold text-slate-900 mb-2">Account Created</h2>
        <p className="text-slate-600 mb-6">
          Your account has been successfully created. You can now access the Order Processing System.
        </p>
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
    <div className="w-full max-w-[440px] z-10">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-[8px] bg-slate-900 text-white mb-4 shadow-sm">
          <Building2 className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight mb-1.5">Create your account</h1>
        <p className="text-sm text-slate-600">Get started with the Order Processing System</p>
      </div>

      <div className="bg-white rounded-[8px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/80 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              className={errors.firstName ? 'border-red-300 focus:ring-red-500/10' : ''}
              placeholder="John"
              disabled={isPending}
            />
            {errors.firstName && (
              <div className="flex items-center text-red-600 text-xs font-medium">
                <AlertCircle className="w-3.5 h-3.5 mr-1" />
                {errors.firstName}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              className={errors.lastName ? 'border-red-300 focus:ring-red-500/10' : ''}
              placeholder="Doe"
              disabled={isPending}
            />
            {errors.lastName && (
              <div className="flex items-center text-red-600 text-xs font-medium">
                <AlertCircle className="w-3.5 h-3.5 mr-1" />
                {errors.lastName}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
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

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? 'border-red-300 focus:ring-red-500/10' : ''}
                placeholder="Enter your password"
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
            {errors.password ? (
              <div className="flex items-center text-red-600 text-xs font-medium">
                <AlertCircle className="w-3.5 h-3.5 mr-1 shrink-0" />
                <span>{errors.password}</span>
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
                placeholder="Confirm your password"
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
            {isPending ? 'Creating account...' : 'Create account'}
          </Button>
        </form>

        <div className="bg-slate-50/80 px-6 py-4 border-t border-slate-200/80 text-center">
          <p className="text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-slate-900 hover:text-slate-700 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-xs text-slate-500">
          By creating an account, you agree to our{' '}
          <a href="#" className="hover:text-slate-800 underline underline-offset-2">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="hover:text-slate-800 underline underline-offset-2">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
}
