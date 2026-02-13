import { useRef, useLayoutEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SuperAdminSidebar } from './SuperAdminSidebar';

export function SuperAdminLayout() {
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
          <SuperAdminSidebar />
        </div>

        {/* Scrollable Content Area */}
        <div ref={scrollRef} className="relative z-10 flex-1 overflow-y-auto no-scrollbar">
          <Outlet />
        </div>
      </div>
    </>
  );
}
