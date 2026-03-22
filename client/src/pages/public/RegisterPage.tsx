import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios'; // Assuming you have this set up

export function RegisterPage() {
  // --- State ---
  const [fullName, setFullName] = useState('');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  // User ID format: letters_numbers (e.g. CS_1234)
  const userIdPattern = /^[A-Za-z]+_\d+$/;

  // --- Animation Effect ---
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // --- Handlers ---
  const handleUserIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Auto-uppercase and only allow letters, underscores, and digits
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '');
    setUserId(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 1. Full Name Validation
    if (fullName.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }

    // 2. User ID Format Validation
    if (!userIdPattern.test(userId)) {
      setError("User ID must follow the format: LETTERS_NUMBERS (e.g. CS_1234)");
      return;
    }

    // 3. Password Validation
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
      // 4. API Call — matches backend: { userId, fullName, password }
      await api.post('/auth/register', { 
        userId,
        fullName: fullName.trim(),
        password,
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
        .animate-slide-in { animation: slideInUp 0.6s ease-out forwards; }
      `}</style>
      
      {/* --- Wavy Background (Unified Blue/Cyan Theme) --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-linear-to-br from-cyan-900/20 via-blue-900/10 to-black"></div>
         <div className="absolute top-0 left-0 w-full h-full opacity-20">
          <svg className="w-full h-full" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,400 C300,350 500,450 700,400 C900,350 1100,250 1200,200 L1200,800 L0,800 Z" fill="#06b6d4" fillOpacity="0.1" />
          </svg>
        </div>
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* --- Main Card --- */}
      <div className={`
        relative z-10 w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 
        overflow-hidden rounded-4xl border border-white/10 shadow-2xl 
        backdrop-blur-xl bg-[#0a0a0a]/80
        transform transition-all duration-700 ease-out
        ${mounted ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'}
      `}>
        
        {/* --- Left Side: Branding & Timeline --- */}
        <div className={`
          hidden lg:flex flex-col justify-between p-8 border-r border-white/10 
          bg-linear-to-br from-blue-900/10 to-transparent relative overflow-hidden
          transform transition-all duration-1000 delay-300
          ${mounted ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}
        `}>
          {/* Top Logo */}
          <div className="flex items-center gap-3">
             <img 
               src="/ballot-logo.png" 
               alt="SmartBallot Logo" 
               className="w-10 h-10 rounded-xl object-contain drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]"
             />
             <span className="text-xl font-bold tracking-wide text-white">SmartBallot</span>
          </div>

          {/* Middle Content */}
          <div className="relative z-10 my-4">
            <h1 className="text-3xl font-extrabold mb-4 leading-tight">
              Create your <br />
              <span className="bg-linear-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Voter Identity.
              </span>
            </h1>
            
            {/* Steps Timeline Visual - Updated: Changed "Verification" to "Login" */}
            <div className="space-y-4 relative">
               {/* Vertical Line */}
               <div className="absolute left-2.75 top-3 bottom-3 w-0.5 bg-white/10"></div>
               
               {[
                  { title: 'Registration', desc: 'Enter your details', active: true },
                  { title: 'Login', desc: 'Access your account', active: false },
                  { title: 'Vote', desc: 'Cast your ballot', active: false }
               ].map((step, idx) => (
                  <div key={idx} className="relative flex items-center gap-4">
                     <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 bg-[#0a0a0a] transition-colors duration-500 ${step.active ? 'border-cyan-500 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.4)]' : 'border-white/10 text-gray-600'}`}>
                        <span className="text-xs">{idx + 1}</span>
                     </div>
                     <div>
                        <div className={`text-sm font-bold ${step.active ? 'text-white' : 'text-gray-500'}`}>{step.title}</div>
                        <div className="text-[10px] text-gray-600">{step.desc}</div>
                     </div>
                  </div>
               ))}
            </div>
          </div>

           {/* Bottom Info */}
          <div className="text-[10px] text-gray-500 font-mono">
             ENCRYPTION: AES-256-GCM
          </div>
        </div>

        {/* --- Right Side: Registration Form --- */}
        <div className={`p-6 md:p-8 flex flex-col justify-center transform transition-all duration-1000 delay-500 ${mounted ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
          
          {/* Conditional Rendering: Success vs Form */}
          {isSuccess ? (
            <div className="flex flex-col items-center text-center animate-slide-in py-6">
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Registration Successful</h2>
              <p className="text-gray-400 text-sm mb-6 max-w-sm leading-relaxed">
                Your account has been successfully created. You can now log in to the system.
              </p>
              <Link 
                to="/login" 
                className="px-8 py-3 bg-white hover:bg-gray-200 text-black rounded-lg font-bold transition-all shadow-lg hover:scale-105 text-sm"
              >
                Return to Login
              </Link>
            </div>
          ) : (
            <>
              <div className={`text-center mb-6 transform transition-all duration-700 delay-400 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                <h2 className="text-2xl font-bold text-white mb-1">Sign Up</h2>
                <p className="text-sm text-gray-400">Join the democratic process today</p>
              </div>

              {error && (
                <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-2 animate-shake">
                   <svg className="w-4 h-4 text-red-400 min-w-4 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  <p className="text-red-200 text-xs text-left">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 animate-slide-in">
                
                {/* Full Name Field */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1">Full Name</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-cyan-400 transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Doe"
                      required
                      className="w-full pl-10 pr-3 py-3 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all text-white placeholder-gray-700 hover:border-white/20 text-sm"
                    />
                  </div>
                </div>

                {/* User ID Field - Changed label from "Student / Voter ID" to "USER ID" */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1">USER ID</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-cyan-400 transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0h4" /></svg>
                    </div>
                    <input
                      type="text"
                      value={userId}
                      onChange={handleUserIdChange}
                      placeholder="CS_1234"
                      required
                      className={`w-full pl-10 pr-3 py-3 bg-black/20 border rounded-lg focus:outline-none focus:ring-1 transition-all text-white placeholder-gray-700 hover:border-white/20 text-sm ${
                        userId && !userIdPattern.test(userId)
                          ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/50'
                          : 'border-white/10 focus:border-cyan-500/50 focus:ring-cyan-500/50'
                      }`}
                    />
                  </div>
                  {userId && !userIdPattern.test(userId) && (
                    <p className="text-red-400 text-[10px] mt-1 ml-1">Format: LETTERS_NUMBERS (e.g. CS_1234)</p>
                  )}
                </div>

                {/* Password Fields - Side by Side */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1">Password</label>
                    <div className="relative group">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full pl-3 pr-9 py-3 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all text-white placeholder-gray-700 hover:border-white/20 text-sm"
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
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1">Confirm</label>
                    <div className="relative group">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full pl-3 pr-9 py-3 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all text-white placeholder-gray-700 hover:border-white/20 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-cyan-400 transition-colors"
                      >
                        {showConfirmPassword ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-2 transform transition-all duration-700 delay-800">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-lg font-bold transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] bg-linear-to-r from-blue-600 to-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] text-white text-sm"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Creating secure account...
                      </span>
                    ) : 'Register Now'}
                  </button>
                </div>
              </form>

              {/* Footer Link */}
              <div className={`mt-4 text-center transform transition-all duration-700 delay-900 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
                <p className="text-xs text-gray-500">
                  Already have an account?{' '}
                  <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors hover:underline">
                    Sign In instead
                  </Link>
                </p>
              </div>
              {/* Return to Landing Page */}
              <div className={`mt-3 text-center transform transition-all duration-700 delay-1000 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
                <Link to="/" className="inline-flex items-center gap-2 text-[10px] font-medium text-gray-600 hover:text-gray-400 transition-colors group">
                  <span className="group-hover:-translate-x-0.5 transition-transform">&larr;</span>
                  Return to Landing Page
                </Link>
              </div>            </>
          )}
        </div>
      </div>
    </div>
  );
}