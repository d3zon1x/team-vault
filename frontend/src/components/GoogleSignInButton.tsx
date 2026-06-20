import React, { useEffect, useRef, useState } from 'react';
import { Loader } from 'lucide-react';
import {
  getGoogleClientId,
  initializeGoogleAuth,
  renderGoogleSignInButton,
} from '../lib/googleAuth';

interface GoogleSignInButtonProps {
  onSuccess: (idToken: string) => void | Promise<void>;
  disabled?: boolean;
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92a8.78 8.78 0 0 0 2.68-6.66z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.83.86-3.04.86-2.34 0-4.32-1.58-5.03-3.71H.96v2.33A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.71A5.41 5.41 0 0 1 3.68 9c0-.6.1-1.17.29-1.71V4.96H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.04l3.01-2.33z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.33l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.96l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"
      />
    </svg>
  );
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onSuccess,
  disabled = false,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const onSuccessRef = useRef(onSuccess);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [initError, setInitError] = useState(false);
  const clientId = getGoogleClientId();

  onSuccessRef.current = onSuccess;

  useEffect(() => {
    if (!clientId || !overlayRef.current) {
      return;
    }

    let mounted = true;

    initializeGoogleAuth(async (credential) => {
      setIsLoading(true);
      try {
        await onSuccessRef.current(credential);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    })
      .then(() => {
        if (!mounted || !overlayRef.current) {
          return;
        }
        renderGoogleSignInButton(overlayRef.current);
        setIsReady(true);
      })
      .catch(() => {
        if (mounted) {
          setInitError(true);
        }
      });

    return () => {
      mounted = false;
    };
  }, [clientId]);

  const isDisabled = disabled || isLoading || !isReady || initError;

  if (!clientId) {
    return (
      <button
        type="button"
        disabled
        title="Set VITE_GOOGLE_CLIENT_ID to enable Google sign-in"
        className="w-full py-2 border border-slate-600 rounded-lg font-semibold text-slate-300 transition-all disabled:opacity-50 cursor-not-allowed flex items-center justify-center gap-2"
      >
        <GoogleIcon />
        Continue with Google
      </button>
    );
  }

  return (
    <div className="relative w-full h-[42px]">
      <button
        type="button"
        disabled={isDisabled}
        className="w-full h-full border border-slate-600 rounded-lg font-semibold text-slate-300 hover:bg-slate-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 pointer-events-none"
      >
        {isLoading ? (
          <>
            <Loader size={18} className="animate-spin" />
            Signing in...
          </>
        ) : (
          <>
            <GoogleIcon />
            Continue with Google
          </>
        )}
      </button>
      <div
        ref={overlayRef}
        className={`absolute inset-0 overflow-hidden rounded-lg ${
          isReady && !disabled && !isLoading
            ? 'opacity-[0.01] cursor-pointer'
            : 'pointer-events-none opacity-0'
        }`}
        aria-hidden="true"
      />
    </div>
  );
};
