import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export function AuthCallback() {
  const navigate = useNavigate();
  const { checkAuth, isLoading } = useAuthStore();
  const [status, setStatus] = useState<'checking' | 'success' | 'error'>('checking');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        await checkAuth();
        setStatus('success');
        // Redirect to dashboard after successful auth
        setTimeout(() => navigate('/'), 1000);
      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
      }
    };

    handleAuthCallback();
  }, [checkAuth, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
      <div className="text-center">
        {status === 'checking' && (
          <>
            <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-white">Completing sign in...</h2>
            <p className="text-indigo-200 mt-2">Please wait</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="text-5xl mb-4">✓</div>
            <h2 className="text-2xl font-semibold text-white">Welcome!</h2>
            <p className="text-indigo-200 mt-2">Redirecting to dashboard...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="text-5xl mb-4">✗</div>
            <h2 className="text-2xl font-semibold text-white">Sign in failed</h2>
            <p className="text-indigo-200 mt-2">
              Please try again or{' '}
              <button
                onClick={() => navigate('/')}
                className="text-white underline"
              >
                return home
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
