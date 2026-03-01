import { useRef, useLayoutEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SuperAdminSidebar } from './SuperAdminSidebar';

export function SuperAdminLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    scrollRef.current?.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="flex h-screen bg-[#09090b] text-white font-sans selection:bg-blue-500/20 overflow-hidden">
        
        {/* --- Background Effects --- */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-125 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-blue-900/10 via-[#09090b] to-[#09090b]" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
        </div>

        {/* Sidebar */}
        <div className="relative z-20 shrink-0">
          <SuperAdminSidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
        </div>

        {/* Main Content Wrapper */}
        <div className="flex-1 flex flex-col min-w-0 relative z-10">
          
          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between p-4 border-b border-white/5 bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <img src="/ballot-logo.png" alt="SmartBallot" className="w-8 h-8 rounded-lg object-contain" />
              <span className="font-bold text-white tracking-tight">SmartBallot</span>
            </div>
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -mr-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Scrollable Content Area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
}
