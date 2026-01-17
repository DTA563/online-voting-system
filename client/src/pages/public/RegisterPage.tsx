import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios'; // Assuming you have this set up

export function RegisterPage() {
  // --- State ---
  // Removed fullName state
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  // --- Animation Effect ---
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // --- Handlers ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 1. Basic Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);

    try {
      // 2. API Call
      // Removed full_name from payload
      await api.post('/users', { 
        user_id: userId,
        password: password,
        role: 'voter'
      });
      
      // 3. Show Success View
      setIsSuccess(true);
      
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Registration failed. Try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden flex items-center justify-center p-4">
      
      {/* Custom Keyframe Styles */}
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
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/10 to-black"></div>
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* --- Main Card --- */}
      <div className={`
        relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 
        overflow-hidden rounded-3xl border border-white/10 shadow-2xl 
        backdrop-blur-md bg-white/[0.02]
        transform transition-all duration-700 ease-out
        ${mounted ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'}
      `}>
        
        {/* --- Left Side: Branding (Visuals) --- */}
        <div className={`
          hidden lg:flex flex-col justify-center p-12 border-r border-white/10 
          bg-gradient-to-br from-purple-600/10 to-transparent
          transform transition-all duration-1000 delay-300
          ${mounted ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}
        `}>
          <div className="flex items-center gap-3 mb-10">
            <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-400/30">
              <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-300 bg-clip-text text-transparent">
              Join SmartBallot
            </span>
          </div>

          <h1 className={`text-4xl font-extrabold mb-6 leading-tight transform transition-all duration-1000 delay-500 ${mounted ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}>
            Make your voice heard. <br />
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Register Today.</span>
          </h1>
          
          <p className={`text-gray-400 text-lg mb-8 leading-relaxed transform transition-all duration-1000 delay-700 ${mounted ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}>
            Create your secure voter account to participate in upcoming campus elections.
          </p>

          <div className={`space-y-4 transform transition-all duration-1000 delay-900 ${mounted ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}>
             <div className="flex items-center gap-3 text-gray-400">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-emerald-400">1</div>
                <span className="text-sm font-medium">Fill in your details</span>
             </div>
             <div className="h-6 w-0.5 bg-white/10 ml-4 my-1"></div>
             <div className="flex items-center gap-3 text-gray-400">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-yellow-400">2</div>
                <span className="text-sm font-medium">Wait for Admin Verification</span>
             </div>
             <div className="h-6 w-0.5 bg-white/10 ml-4 my-1"></div>
             <div className="flex items-center gap-3 text-gray-400">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-blue-400">3</div>
                <span className="text-sm font-medium">Cast your Secure Vote</span>
             </div>
          </div>
        </div>

        {/* --- Right Side: Registration Form --- */}
        <div className={`p-8 md:p-12 flex flex-col justify-center transform transition-all duration-1000 delay-500 ${mounted ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
          
          {/* Mobile Logo */}
          <div className={`mb-8 lg:hidden flex justify-center transform transition-all duration-700 delay-300 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
             <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-300 bg-clip-text text-transparent">SmartBallot</span>
          </div>

          {/* Conditional Rendering: Success vs Form */}
          {isSuccess ? (
            <div className="flex flex-col items-center text-center animate-slide-in">
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Request Submitted!</h2>
              <p className="text-gray-400 mb-8 max-w-sm">
                Your account has been created and is 
                <span className="text-yellow-400 font-bold"> pending verification</span>. 
                You will be able to log in once an admin approves your registration.
              </p>
              <Link 
                to="/login" 
                className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-all"
              >
                Return to Login
              </Link>
            </div>
          ) : (
            <>
              <div className={`text-center mb-8 transform transition-all duration-700 delay-400 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
                <p className="text-gray-400">Enter your details to register</p>
              </div>

              {error && (
                <div className="mb-6 bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-start gap-3 animate-shake">
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 animate-slide-in">
                
                {/* User ID Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5 ml-1">Student / Voter ID</label>
                  <input
                    type="text"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="STU-2024-001"
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-white placeholder-gray-600 hover:border-white/20"
                  />
                </div>

                {/* Password Fields - Side by Side */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5 ml-1">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-white placeholder-gray-600 hover:border-white/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5 ml-1">Confirm</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-white placeholder-gray-600 hover:border-white/20"
                    />
                  </div>
                </div>

                <div className="pt-2 transform transition-all duration-700 delay-800">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-r from-purple-600 to-pink-500 shadow-purple-900/20 hover:shadow-purple-900/40 shadow-lg text-white"
                  >
                    {isLoading ? 'Creating Account...' : 'Register'}
                  </button>
                </div>
              </form>

              {/* Footer Link */}
              <div className={`mt-6 text-center transform transition-all duration-700 delay-900 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
                <p className="text-sm text-gray-400">
                  Already have an account?{' '}
                  <Link to="/login" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
                    Sign In
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}