import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Icons = {
  Check: (props: any) => <svg className={`w-5 h-5 ${props.className || ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>,
};

export function VoteSuccessPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const globalStyles = (
    <style>{`
      @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      .animate-enter { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    `}</style>
  );

  return (
    <>
      {globalStyles}
      <div className="flex-1 flex items-center justify-center p-6 min-h-[80vh]">
        <div className={`w-full max-w-md transform transition-all duration-700 ease-out ${mounted ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'}`}>
          <div className="bg-card border border-border rounded-3xl p-8 md:p-12 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-success to-teal-500"></div>
            
            <div className="w-20 h-20 mx-auto mb-6 mt-4">
              <div className="w-full h-full bg-gradient-to-br from-accent-success/20 to-teal-600/20 border border-accent-success/30 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.2)] text-accent-success">
                <Icons.Check className="w-8 h-8" />
              </div>
            </div>
            
            <h2 className="text-2xl font-extrabold mb-2 text-primary">Vote Confirmed</h2>
            <p className="mb-6 text-sm text-secondary">Your ballot has been securely encrypted and submitted. You cannot modify your vote once cast.</p>
            
            <div className="bg-card-hover/50 p-4 rounded-xl border border-border/50 mb-8">
                <p className="text-xs text-secondary">
                  Detailed results and analytics will be available on the results page after the election has concluded.
                </p>
            </div>

            <Link to="/vote">
              <button className="w-full py-3.5 rounded-xl font-bold text-sm bg-card-hover text-primary border border-border transition-all hover:bg-card hover:border-accent-primary/50 hover:text-accent-primary">
                &larr; Back to Election List
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

