import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export function VoteSuccessPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className={`w-full max-w-md transform transition-all duration-700 ease-out ${mounted ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'}`}>
        <div className="rounded-2xl p-6 md:p-8 text-center" style={{ backgroundColor: 'var(--v-card)', border: '1px solid var(--v-border)' }}>

          {/* Success Icon */}
          <div className="w-16 h-16 mx-auto mb-5">
            <div className="w-full h-full bg-linear-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <svg className="w-8 h-8 text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-2xl md:text-3xl font-extrabold mb-2 tracking-tight">
            <span className="bg-linear-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Vote Confirmed
            </span>
          </h1>
          <p className="mb-5 text-sm" style={{ color: 'var(--v-text-2)' }}>
            Your ballot has been encrypted and securely added to the election tally.
          </p>

          {/* Security Receipt Block */}
          <div className="rounded-xl p-4 mb-5 text-left" style={{ backgroundColor: 'var(--v-hover)', border: '1px solid var(--v-border)' }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_#06b6d4]"></span>
              <h3 className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest">Security Verified</h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span style={{ color: 'var(--v-text-3)' }}>Anonymity</span>
                <span className="font-mono text-xs" style={{ color: 'var(--v-text-2)' }}>Protected</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span style={{ color: 'var(--v-text-3)' }}>Encryption</span>
                <span className="font-mono text-xs" style={{ color: 'var(--v-text-2)' }}>AES-256</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span style={{ color: 'var(--v-text-3)' }}>Traceability</span>
                <span className="font-mono text-xs" style={{ color: 'var(--v-text-2)' }}>None</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <Link to="/vote/results">
            <button className="w-full py-3 rounded-xl font-bold text-sm bg-linear-to-r from-blue-600 to-cyan-500 text-white transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.25)]">
              View Election Results
            </button>
          </Link>
        </div>

        {/* Footer Hash (Decorative) */}
        <p className="text-center text-[10px] font-mono mt-6 uppercase tracking-widest opacity-50" style={{ color: 'var(--v-text-3)' }}>
          Session ID: {Math.random().toString(36).substring(7).toUpperCase()} • Secure Connection
        </p>
      </div>
    </div>
  );
}

