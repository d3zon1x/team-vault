import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, ArrowRight, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { resetPasswordSchema } from '../lib/validation';
import type { ResetPasswordFormData } from '../lib/validation';
import apiClient from '../lib/apiClient';
import { toast } from 'sonner';

type ResetState = 'form' | 'success' | 'error';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [state, setState] = useState<ResetState>('form');
  const [errorMessage, setErrorMessage] = useState('');

  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setState('error');
      setErrorMessage('No reset token provided');
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post('/auth/reset-password', {
        token,
        new_password: data.password,
      });
      setState('success');
      toast.success('Password reset successfully!');
    } catch (error: any) {
      setState('error');
      const message =
        error.response?.data?.message ||
        error.response?.data?.detail ||
        'Failed to reset password. The link may have expired.';
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center px-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-red-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8 backdrop-blur-sm shadow-xl text-center">
            <div className="flex justify-center mb-4">
              <AlertCircle className="text-red-400" size={48} />
            </div>
            <h2 className="text-2xl font-bold mb-3">Invalid link</h2>
            <p className="text-slate-300 mb-6">
              No reset token provided. Please request a new password reset.
            </p>
            <Link
              to="/forgot-password"
              className="inline-flex items-center justify-center px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-200"
            >
              Request new link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (state === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center px-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-green-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8 backdrop-blur-sm shadow-xl text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="text-green-400" size={48} />
            </div>
            <h2 className="text-2xl font-bold mb-3">Password reset successful</h2>
            <p className="text-slate-300 mb-6">
              Your password has been reset successfully. You can now log in with your new password.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-200"
            >
              Go to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center px-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-red-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8 backdrop-blur-sm shadow-xl text-center">
            <div className="flex justify-center mb-4">
              <AlertCircle className="text-red-400" size={48} />
            </div>
            <h2 className="text-2xl font-bold mb-3">Reset failed</h2>
            <p className="text-slate-300 mb-6">{errorMessage}</p>
            <Link
              to="/forgot-password"
              className="inline-flex items-center justify-center px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-200"
            >
              Try again
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center px-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"></div>
      </div>

      {/* Main content */}
      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
            TeamVault
          </div>
          <p className="text-slate-400">Create a new password</p>
        </div>

        {/* Card */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8 backdrop-blur-sm shadow-xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-500" size={20} />
                <input
                  {...register('password')}
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white placeholder-slate-500 transition-all"
                />
              </div>
              {errors.password && (
                <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
              )}
              <p className="text-slate-500 text-xs mt-1">
                At least 8 characters, 1 uppercase, 1 lowercase, 1 number
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-500" size={20} />
                <input
                  {...register('confirmPassword')}
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white placeholder-slate-500 transition-all"
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
            >
              {isLoading ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  Resetting...
                </>
              ) : (
                <>
                  Reset password
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-slate-400 text-sm mt-6">
            Remember your password?{' '}
            <Link
              to="/login"
              className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
