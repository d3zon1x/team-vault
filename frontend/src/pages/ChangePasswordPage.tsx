import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, ArrowRight, Loader, CheckCircle, ArrowLeft } from 'lucide-react';
import { changePasswordSchema } from '../lib/validation';
import type { ChangePasswordFormData } from '../lib/validation';
import apiClient from '../lib/apiClient';
import { toast } from 'sonner';

type ChangePasswordState = 'form' | 'success';

export const ChangePasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [state, setState] = useState<ChangePasswordState>('form');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    setIsLoading(true);
    try {
      await apiClient.post('/auth/change-password', {
        current_password: data.currentPassword,
        new_password: data.newPassword,
      });
      setState('success');
      reset();
      toast.success('Password changed successfully!');
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.detail ||
        'Failed to change password';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

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
            <h2 className="text-2xl font-bold mb-3">Password changed</h2>
            <p className="text-slate-300 mb-6">
              Your password has been changed successfully.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center justify-center px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-200"
            >
              Back to dashboard
            </button>
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
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors text-sm mb-4"
          >
            <ArrowLeft size={16} />
            Back to dashboard
          </button>
          <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
            TeamVault
          </div>
          <p className="text-slate-400">Change your password</p>
        </div>

        {/* Card */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8 backdrop-blur-sm shadow-xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300">
                Current Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-500" size={20} />
                <input
                  {...register('currentPassword')}
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white placeholder-slate-500 transition-all"
                />
              </div>
              {errors.currentPassword && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.currentPassword.message}
                </p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-500" size={20} />
                <input
                  {...register('newPassword')}
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white placeholder-slate-500 transition-all"
                />
              </div>
              {errors.newPassword && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.newPassword.message}
                </p>
              )}
              <p className="text-slate-500 text-xs mt-1">
                At least 8 characters, 1 uppercase, 1 lowercase, 1 number
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300">
                Confirm New Password
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
                  Changing...
                </>
              ) : (
                <>
                  Change password
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
