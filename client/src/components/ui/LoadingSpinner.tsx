import React from 'react';

// --- Keep this generic spinner in case you need it for small buttons later ---
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg
        className={`animate-spin text-blue-500 ${sizes[size]}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    </div>
  );
}

// --- UPDATED BRANDED LOADING SCREEN ---
export function LoadingScreen({ message = 'Loading...' }: { message?: string }) {
  return (
    // 1. Dark background container
    <div className="min-h-screen flex flex-col items-center justify-center bg-black relative overflow-hidden">
      
      {/* Optional: Subtle background glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-900/20 rounded-full blur-[120px] pointer-events-none"></div>

      {/* 2. The Shield Logo Container with animate-pulse */}
      <div className="relative z-10 animate-pulse">
        {/* The gradient border box (made slightly larger than navbar version for emphasis) */}
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 p-[2px] shadow-lg shadow-blue-500/20">
          {/* The inner black box */}
          <div className="w-full h-full bg-black rounded-2xl flex items-center justify-center">
            {/* The Shield Icon SVG */}
            <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
        </div>
      </div>

      {/* 3. Loading Message */}
      <p className="mt-8 text-gray-400 font-medium tracking-wider uppercase text-sm relative z-10 animate-pulse delay-75">
        {message}
      </p>
    </div>
  );
}