import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context';

export function LoginPage() {
  const [loginType, setLoginType] = useState<'user' | 'admin'>('user');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login({ userId, password });
      
      if (from) {
        navigate(from, { replace: true });
      } else {
        navigate(loginType === 'admin' ? '/admin' : '/vote', { replace: true });
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid credentials. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden flex items-center justify-center p-4">
      
      {/* 1. Animation Styles */}
      <style>{`
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-in {
          animation: slideInUp 0.4s ease-out forwards;
        }
      `}</style>

      {/* --- Background Elements --- */}
      <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/10 to-black"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* --- Main Login Card --- */}
      <div className={`
        relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 
        overflow-hidden rounded-3xl border border-white/10 shadow-2xl 
        backdrop-blur-md bg-white/[0.02]
        transform transition-all duration-700 ease-out
        ${mounted ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'}
      `}>
        
        {/* Left Side: Brand Identity */}
        <div className={`
          hidden lg:flex flex-col justify-center p-12 border-r border-white/10 
          bg-gradient-to-br from-blue-600/10 to-transparent
          transform transition-all duration-1000 delay-300
          ${mounted ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}
        `}>
          
          {/* ✅ UPDATED LOGO SECTION (Matches Navbar Design EXACTLY) */}
          <div className="flex items-center gap-4 mb-10">
            {/* Outer Gradient Container (The Border) */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 p-[1px] shadow-[0_0_20px_rgba(37,99,235,0.3)]">
              {/* Inner Black Container */}
              <div className="w-full h-full bg-black/90 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
            
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              SmartBallot
            </span>
          </div>

          <h1 className={`text-4xl font-extrabold mb-6 leading-tight transform transition-all duration-1000 delay-500 ${mounted ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}>
            Securely access your <br />
            <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">Voting Portal.</span>
          </h1>
          
          <p className={`text-gray-400 text-lg mb-8 leading-relaxed transform transition-all duration-1000 delay-700 ${mounted ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}>
            Choose your role and enter your credentials to proceed to the secure dashboard.
          </p>

          <div className={`space-y-4 transform transition-all duration-1000 delay-900 ${mounted ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}>
            {['256-bit Encryption', 'Verified Audit Log'].map((item, index) => (
              <div key={item} className={`flex items-center gap-3 text-gray-400 transform transition-all duration-500 ${mounted ? 'translate-x-0 opacity-100' : `-translate-x-full opacity-0 delay-${index * 100}`}`}>
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Authentication Form */}
        <div className={`p-8 md:p-12 flex flex-col justify-center transform transition-all duration-1000 delay-500 ${mounted ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
          {/* Mobile Logo */}
          <div className={`mb-8 lg:hidden flex justify-center transform transition-all duration-700 delay-300 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
             <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">SmartBallot</span>
          </div>

          <div className={`text-center mb-8 transform transition-all duration-700 delay-400 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <h2 className="text-3xl font-bold text-white mb-2">Sign In</h2>
            <p className="text-gray-400">Select your access level</p>
          </div>

          {/* Role Tabs */}
          <div className={`flex p-1 bg-white/5 rounded-xl mb-8 border border-white/10 transform transition-all duration-700 delay-500 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
            <button
              onClick={() => setLoginType('user')}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${loginType === 'user' ? 'bg-blue-600 text-white shadow-lg scale-100' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
            >
              Voter
            </button>
            <button
              onClick={() => setLoginType('admin')}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${loginType === 'admin' ? 'bg-purple-600 text-white shadow-lg scale-100' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
            >
              Administrator
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-start gap-3 animate-shake">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Inputs Container */}
            <div key={loginType} className="space-y-5 animate-slide-in">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2 ml-1">
                  {loginType === 'user' ? 'Student / Voter ID' : 'Admin Username'}
                </label>
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder={loginType === 'user' ? 'ID Number' : 'Admin ID'}
                  required
                  autoFocus
                  className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-white placeholder-gray-600 hover:border-white/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2 ml-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-white placeholder-gray-600 hover:border-white/20"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className={`transform transition-all duration-700 delay-800 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
              <button
                type="submit"
                disabled={isLoading}
                className={`
                  w-full py-4 rounded-xl font-bold transition-all duration-300
                  disabled:opacity-50 flex items-center justify-center gap-2
                  hover:scale-[1.02] active:scale-[0.98]
                  ${loginType === 'user' 
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 shadow-blue-900/20 hover:shadow-blue-900/40' 
                    : 'bg-gradient-to-r from-purple-600 to-pink-500 shadow-purple-900/20 hover:shadow-purple-900/40'
                  } shadow-lg
                `}
              >
                {isLoading ? 'Processing...' : `Sign In as ${loginType === 'user' ? 'Voter' : 'Admin'}`}
              </button>
            </div>
          </form>

          {/* New Register Link */}
          <div className={`mt-6 text-center transform transition-all duration-700 delay-900 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
            <p className="text-gray-400 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors hover:underline">
                Register for free
              </Link>
            </p>
          </div>

          {/* Return Link */}
          <div className={`mt-4 text-center transform transition-all duration-700 delay-1000 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
            <Link to="/" className="text-xs text-gray-500 hover:text-gray-300 transition-colors inline-flex items-center gap-1 group">
              <span className="group-hover:-translate-x-1 transition-transform">&larr;</span>
              Return to Landing Page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}