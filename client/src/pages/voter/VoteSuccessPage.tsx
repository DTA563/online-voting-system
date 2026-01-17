import { Link } from 'react-router-dom';
import { Button } from '../../components/ui';

// --- Shared Styles (Matches other pages) ---
const glassCardClass = "relative overflow-hidden backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 md:p-12 transition-all";

export function VoteSuccessPage() {
  return (
    <div className="min-h-screen bg-black text-white relative font-sans flex items-center justify-center p-6">
      
      {/* --- Ambient Background --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
      </div>

      <div className="relative z-10 w-full max-w-lg">
        <div className={`${glassCardClass} text-center shadow-[0_0_50px_rgba(16,185,129,0.1)]`}>
          
          {/* Success Icon */}
          <div className="w-24 h-24 mx-auto mb-8 relative">
            <div className="absolute inset-0 bg-emerald-500 rounded-full blur-xl opacity-40 animate-pulse"></div>
            <div className="relative w-full h-full bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.4)] border border-white/20">
              <svg className="w-10 h-10 text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
            Vote Confirmed
          </h1>
          <p className="text-gray-400 mb-8 text-lg">
            Your ballot has been encrypted and securely added to the election tally.
          </p>

          {/* Privacy Receipt Block */}
          <div className="bg-black/40 border border-white/10 rounded-xl p-6 mb-8 text-left space-y-4 relative overflow-hidden group">
            {/* Scannable line effect */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent animate-[shimmer_2s_infinite]"></div>

            <div className="flex items-center gap-3 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></span>
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-widest">Security Verified</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Anonymity</span>
                <span className="text-gray-300 font-mono">Protected</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Encryption</span>
                <span className="text-gray-300 font-mono">AES-256</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Traceability</span>
                <span className="text-gray-300 font-mono">None</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/results" className="w-full sm:w-auto">
              <Button 
                className="w-full bg-white text-black hover:bg-gray-200 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] font-bold transition-all transform hover:-translate-y-0.5"
                size="lg"
              >
                Watch Live Results
              </Button>
            </Link>
            
            <Link to="/" className="w-full sm:w-auto">
              <Button 
                variant="outline" 
                className="w-full border-white/10 text-gray-300 hover:bg-white/5 hover:text-white"
                size="lg"
              >
                Return Home
              </Button>
            </Link>
          </div>

        </div>
        
        {/* Footer Hash (Decorative) */}
        <p className="text-center text-gray-600 text-[10px] font-mono mt-6 uppercase tracking-widest opacity-50">
          Session ID: {Math.random().toString(36).substring(7).toUpperCase()} • Secure Connection
        </p>
      </div>
    </div>
  );
}