import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context';

export function LoginPage() {
  const [loginType, setLoginType] = useState<'user' | 'admin'>('user');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // User ID format: letters_numbers (e.g. CS_1234), with super admin exception
  const userIdPattern = /^[A-Za-z]+_\d+$/;
  const SUPER_ADMIN_ID = 'SEED_SUPER_ADMIN';
  const isUserIdValid = (id: string) => userIdPattern.test(id) || id === SUPER_ADMIN_ID;

  // Get login from context
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

  // Stable session ID that doesn't regenerate on every render
  const sessionId = useMemo(() => Math.random().toString(36).substring(7).toUpperCase(), []);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleUserIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '');
    setUserId(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate User ID format (with super admin exception)
    if (!isUserIdValid(userId)) {
      setError('ID must follow the format: LETTERS_NUMBERS (e.g. CS_1234)');
      return;
    }

    setIsLoading(true);

    try {
      // Allow specific roles based on login tab
      const allowedRoles = loginType === 'user' ? ['voter'] : ['admin', 'super_admin'];
      
      const user = await login({ userId, password }, allowedRoles);
      
      // If we get here, the login AND role check were successful
      if (from) {
        navigate(from, { replace: true });
      } else {
        // Redirect based on actual user.role
        if (user.role === 'super_admin') {
          navigate('/super-admin', { replace: true });
        } else if (user.role === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate('/vote', { replace: true });
        }
      }

    } catch (err: unknown) {
      // If the role doesn't match, AuthContext throws an error, which is caught here
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
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-slide-in { animation: slideInUp 0.6s ease-out forwards; }
        .animate-float { animation: float 6s ease-in-out infinite; }
      `}</style>
      
      {/* --- Wavy Background (Unified Blue/Cyan Theme) --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-linear-to-br from-blue-900/20 via-cyan-900/10 to-black"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-20">
          <svg className="w-full h-full" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,600 C150,550 350,650 600,600 C850,550 1050,450 1200,400 L1200,800 L0,800 Z" fill="#3b82f6" fillOpacity="0.1" />
            <path d="M0,500 C200,450 400,550 600,500 C800,450 1000,350 1200,300 L1200,800 L0,800 Z" fill="#06b6d4" fillOpacity="0.1" />
          </svg>
        </div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* --- Main Login Card --- */}
      {/* Reduced size and padding for compaction */}
      <div className={`
        relative z-10 w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 
        overflow-hidden rounded-4xl border border-white/10 shadow-2xl 
        backdrop-blur-xl bg-[#0a0a0a]/80
        transform transition-all duration-700 ease-out
        ${mounted ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'}
      `}>
        
        {/* Left Side: Brand & Visuals */}
        <div className={`
          hidden lg:flex flex-col justify-between p-8 border-r border-white/10 
          bg-linear-to-br from-blue-900/10 to-transparent relative overflow-hidden
          transform transition-all duration-1000 delay-300
          ${mounted ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}
        `}>
          {/* Decor */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] -z-10 translate-x-1/2 -translate-y-1/2"></div>

          {/* Top: Logo */}
          <div className="flex items-center gap-3">
             <img 
               src="/ballot-logo.png" 
               alt="SmartBallot Logo" 
               className="w-10 h-10 rounded-xl object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]"
             />
            <span className="text-xl font-bold tracking-wide text-white">SmartBallot</span>
          </div>

          {/* Middle: Hero Text */}
          <div className="relative z-10 my-4">
            <h1 className="text-3xl font-extrabold mb-4 leading-tight">
              Welcome to the <br />
              <span className="bg-linear-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                Future of Voting.
              </span>
            </h1>
            <p className="text-gray-400 text-base max-w-sm mb-6">
              Secure, transparent, and decentralized. Your identity is your key.
            </p>
            
            {/* Visual Element: Floating Security Badge */}
            <div className="animate-float p-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md max-w-xs transition-all hover:bg-white/10">
               <div className="flex items-center gap-3 mb-2">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                     <div className="text-xs font-bold text-white">System Secure</div>
                     <div className="text-[10px] text-cyan-400">All nodes operational</div>
                  </div>
               </div>
               <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 w-full animate-pulse"></div>
               </div>
            </div>
          </div>

          {/* Bottom: Footer Info */}
          <div className="text-[10px] text-gray-500 font-mono">
             SESSION ID: {sessionId}
          </div>
        </div>

        {/* Right Side: Authentication Form */}
        <div className={`p-6 md:p-8 flex flex-col justify-center transform transition-all duration-1000 delay-500 ${mounted ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
          
          <div className={`text-center mb-6 transform transition-all duration-700 delay-400 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <h2 className="text-2xl font-bold text-white mb-1">Sign In</h2>
            <p className="text-sm text-gray-400">Select your access level to continue</p>
          </div>

          {/* Seamless Role Tabs */}
          <div className={`
             relative flex p-1 bg-black/40 rounded-xl mb-6 border border-white/5 
             transform transition-all duration-700 delay-500 
             ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}
          `}>
             {/* Slider Background used to indicate selection generally, but here we use direct styles for simplicity and robustness */}
             <div className="grid grid-cols-2 w-full gap-2">
                <button
                  onClick={() => setLoginType('user')}
                  className={`
                    relative py-2.5 rounded-lg text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2
                    ${loginType === 'user' 
                      ? 'bg-white/10 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.15)] border border-white/10' 
                      : 'text-gray-500 hover:text-gray-300 hover:bg-white/5 border border-transparent'
                    }
                  `}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  Voter
                </button>
                <button
                  onClick={() => setLoginType('admin')}
                  className={`
                    relative py-2.5 rounded-lg text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2
                    ${loginType === 'admin' 
                      ? 'bg-white/10 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.15)] border border-white/10' 
                      : 'text-gray-500 hover:text-gray-300 hover:bg-white/5 border border-transparent'
                    }
                  `}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  Admin
                </button>
             </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-2 animate-shake">
              <svg className="w-4 h-4 text-red-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <p className="text-red-200 text-xs">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Inputs Container */}
            <div key={loginType} className="space-y-4 animate-slide-in">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 ml-1">
                  {loginType === 'user' ? 'Student / Voter ID' : 'Admin ID'}
                </label>
                <div className="relative group">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-cyan-400 transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                   </div>
                   <input
                    type="text"
                    value={userId}
                    onChange={handleUserIdChange}
                    placeholder={loginType === 'user' ? 'CS_...' : 'ADM...'}
                    required
                    autoFocus
                    className={`w-full pl-10 pr-3 py-3 bg-black/20 border rounded-lg focus:outline-none focus:ring-1 transition-all text-white placeholder-gray-700 hover:border-white/20 text-sm ${
                      userId && !isUserIdValid(userId)
                        ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/50'
                        : 'border-white/10 focus:border-cyan-500/50 focus:ring-cyan-500/50'
                    }`}
                  />
                </div>
                {userId && !isUserIdValid(userId) && (
                  <p className="text-red-400 text-[10px] mt-1 ml-1">Format: LETTERS_NUMBERS (e.g. CS_1234)</p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 ml-1">Password</label>
                <div className="relative group">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-cyan-400 transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                   </div>
                   <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-10 py-3 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all text-white placeholder-gray-700 hover:border-white/20 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-cyan-400 transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className={`transform transition-all duration-700 delay-800 pt-1 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
              <button
                type="submit"
                disabled={isLoading}
                className={`
                  w-full py-3 rounded-lg font-bold transition-all duration-300
                  disabled:opacity-50 flex items-center justify-center gap-2
                  hover:scale-[1.02] active:scale-[0.98]
                  bg-linear-to-r from-blue-600 to-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] text-white text-sm
                `}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Verifying...
                  </span>
                ) : (
                   <>
                    Sign In as {loginType === 'user' ? 'Voter' : 'Administrator'}
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                   </>
                )}
              </button>
            </div>
          </form>

          {/* New Register Link */}
          <div className={`mt-4 text-center transform transition-all duration-700 delay-900 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
            <p className="text-gray-500 text-xs">
              New to the platform?{' '}
              <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors hover:underline">
                Create an Account
              </Link>
            </p>
          </div>

          {/* Return to Landing Page */}
          <div className={`mt-3 text-center transform transition-all duration-700 delay-1000 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
            <Link to="/" className="inline-flex items-center gap-2 text-[10px] font-medium text-gray-600 hover:text-gray-400 transition-colors group">
              <span className="group-hover:-translate-x-0.5 transition-transform">&larr;</span>
              Return to Landing Page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}