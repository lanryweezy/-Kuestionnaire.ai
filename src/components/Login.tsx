import { useAuthStore } from '../store/useAuthStore';

interface LoginProps {
  onLoginSuccess?: () => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
  const { signInWithGoogle, error, isLoading, clearError } = useAuthStore();

  const handleGoogleLogin = async () => {
    clearError();
    const { error } = await signInWithGoogle();
    if (!error) {
      onLoginSuccess?.();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 px-4">
      <div className="max-w-md w-full">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Kuestionnaire.ai
          </h1>
          <p className="text-indigo-200">
            Create intelligent forms with AI-powered insights
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          <h2 className="text-2xl font-semibold text-white text-center mb-6">
            Sign In
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 disabled:bg-gray-400 disabled:cursor-not-allowed text-gray-900 font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.766 12.2764c0-.8942-.0791-1.7583-.2237-2.5905H12.242v4.9242h6.4764c-.2823 1.5175-1.1398 2.803-2.4216 3.6626v3.0488h3.8703c2.2676-2.0864 3.5989-5.1747 3.5989-8.8451z"
                />
                <path
                  fill="#34A853"
                  d="M12.242 24.0015c3.2402 0 5.9598-1.0762 7.9495-2.9098l-3.8703-3.0488c-1.0785.7261-2.4555 1.1535-4.0792 1.1535-3.1376 0-5.7923-2.1179-6.7443-4.9629H1.492v3.1602c1.9898 3.962 6.0953 6.6078 10.75 6.6078z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.4977 16.1935c-.2444-.7261-.3816-1.5014-.3816-2.3013 0-.7999.1372-1.5752.3816-2.3013V8.4307H1.492C.5353 10.339 0 12.488 0 14.7522s.5353 4.4132 1.492 6.3215l3.9997-3.1602h.006z"
                />
                <path
                  fill="#EA4335"
                  d="M12.242 5.5015c1.7684 0 3.3558.6085 4.6066 1.8048l3.4495-3.4495C18.2058 1.9806 15.4436 0 12.242 0 7.5873 0 3.4818 2.6458 1.492 6.6078l4.0057 3.1602c.952-2.845 3.6067-4.9629 6.7443-4.9629z"
                />
              </svg>
            )}
            {isLoading ? 'Signing in...' : 'Sign in with Google'}
          </button>

          <div className="mt-6 text-center">
            <p className="text-indigo-200 text-sm">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="text-indigo-200 text-xs">
            <div className="text-2xl mb-1">🚀</div>
            <p>Fast AI Forms</p>
          </div>
          <div className="text-indigo-200 text-xs">
            <div className="text-2xl mb-1">📊</div>
            <p>Smart Analytics</p>
          </div>
          <div className="text-indigo-200 text-xs">
            <div className="text-2xl mb-1">🔒</div>
            <p>Secure Storage</p>
          </div>
        </div>
      </div>
    </div>
  );
}
