import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, User, ArrowRight, Loader, CheckCircle } from 'lucide-react';
import { registerSchema } from '../lib/validation';
import type { RegisterFormData } from '../lib/validation';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { GoogleSignInButton } from '../components/GoogleSignInButton';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register: authRegister, loginWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      await authRegister(data.email, data.username, data.password);
      setRegisteredEmail(data.email);
      setSuccess(true);
      toast.success('Registration successful! Check your email.');
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.detail ||
        'Failed to register';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (idToken: string) => {
    try {
      await loginWithGoogle(idToken);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.detail ||
        'Failed to sign up with Google';
      toast.error(message);
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
            <h2 className="text-2xl font-bold mb-3">Verify your email</h2>
            <p className="text-slate-300 mb-6">
              We sent a verification link to <strong>{registeredEmail}</strong>
            </p>
            <p className="text-slate-400 text-sm mb-6">
              Check your inbox and click the link to verify your email address.
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center px-4 py-8">
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
          <p className="text-slate-400">Create your account</p>
        </div>

        {/* Card */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8 backdrop-blur-sm shadow-xl">
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

            {/* Username */}
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-slate-500" size={20} />
                <input
                  {...register('username')}
                  type="text"
                  placeholder="john_doe"
                  className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white placeholder-slate-500 transition-all"
                />
              </div>
              {errors.username && (
                <p className="text-red-400 text-sm mt-1">{errors.username.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300">
                Password
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
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-800/50 text-slate-400">Or</span>
            </div>
          </div>

          <GoogleSignInButton
            onSuccess={handleGoogleSuccess}
            disabled={isLoading}
          />

          {/* Footer */}
          <p className="text-center text-slate-400 text-sm mt-6">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Help text */}
        <p className="text-center text-slate-500 text-xs mt-6">
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};
