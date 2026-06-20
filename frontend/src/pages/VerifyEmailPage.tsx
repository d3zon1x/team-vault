import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';
import apiClient from '../lib/apiClient';

type VerificationState = 'loading' | 'success' | 'error';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<VerificationState>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setState('error');
        setMessage('No verification token provided');
        return;
      }

      try {
        const response = await apiClient.get(`/auth/verify-email?token=${token}`);
        setState('success');
        setMessage(
          response.data.message ||
            'Email verified successfully! You can now log in.',
        );
      } catch (error: any) {
        setState('error');
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.detail ||
          'Failed to verify email. The link may have expired.';
        setMessage(errorMessage);
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center px-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"></div>
      </div>

      {/* Main content */}
      <div className="w-full max-w-md relative z-10">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8 backdrop-blur-sm shadow-xl text-center">
          {/* Loading state */}
          {state === 'loading' && (
            <>
              <div className="flex justify-center mb-4">
                <Loader className="text-blue-400 animate-spin" size={48} />
              </div>
              <h2 className="text-2xl font-bold mb-3">
                Verifying your email...
              </h2>
              <p className="text-slate-300">{message}</p>
            </>
          )}

          {/* Success state */}
          {state === 'success' && (
            <>
              <div className="flex justify-center mb-4">
                <CheckCircle className="text-green-400" size={48} />
              </div>
              <h2 className="text-2xl font-bold mb-3">Email verified!</h2>
              <p className="text-slate-300 mb-6">{message}</p>
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-200"
              >
                Go to login
              </Link>
            </>
          )}

          {/* Error state */}
          {state === 'error' && (
            <>
              <div className="flex justify-center mb-4">
                <AlertCircle className="text-red-400" size={48} />
              </div>
              <h2 className="text-2xl font-bold mb-3">Verification failed</h2>
              <p className="text-slate-300 mb-6">{message}</p>
              <div className="space-y-2">
                <Link
                  to="/register"
                  className="block px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-200"
                >
                  Try again
                </Link>
                <Link
                  to="/login"
                  className="block px-6 py-2 border border-slate-600 rounded-lg font-semibold hover:bg-slate-700 transition-all"
                >
                  Back to login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
