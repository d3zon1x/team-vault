import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, ArrowRight, Loader, CheckCircle, ArrowLeft } from 'lucide-react';
import { forgotPasswordSchema } from '../lib/validation';
import type { ForgotPasswordFormData } from '../lib/validation';
import apiClient from '../lib/apiClient';
import { toast } from 'sonner';

export const ForgotPasswordPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      await apiClient.post('/auth/forgot-password', { email: data.email });
      setEmail(data.email);
      setSuccess(true);
      toast.success('Password reset email sent!');
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.detail ||
        'Failed to send reset email';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center px-4">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-green-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8 backdrop-blur-sm shadow-xl text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="text-green-400" size={48} />
            </div>
            <h2 className="text-2xl font-bold mb-3">Check your email</h2>
            <p className="text-slate-300 mb-2">
              We sent a password reset link to <strong>{email}</strong>
            </p>
            <p className="text-slate-400 text-sm mb-6">
              Check your inbox and click the link to reset your password.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-200 gap-2"
            >
              Back to login
              <ArrowRight size={20} />
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
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors text-sm mb-4"
          >
            <ArrowLeft size={16} />
            Back to login
          </Link>
          <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
            TeamVault
          </div>
          <p className="text-slate-400">Reset your password</p>
        </div>

        {/* Card */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8 backdrop-blur-sm shadow-xl">
          <p className="text-slate-300 text-sm mb-6">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-500" size={20} />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white placeholder-slate-500 transition-all"
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
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
                  Sending...
                </>
              ) : (
                <>
                  Send reset link
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
