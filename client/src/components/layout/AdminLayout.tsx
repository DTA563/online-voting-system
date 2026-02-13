import { useRef, useLayoutEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';

export function AdminLayout() {
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

      <div className="flex h-screen bg-black text-white font-sans selection:bg-cyan-500/30 overflow-hidden">
        
        {/* --- Background Effects --- */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[150px] animate-pulse" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-900/10 rounded-full blur-[150px] animate-pulse delay-700" />
          <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-indigo-900/5 rounded-full blur-[100px]" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02]" />
        </div>

        {/* Sidebar */}
        <div className="relative z-20 shrink-0">
          <AdminSidebar />
        </div>

        {/* Scrollable Content Area */}
        <div ref={scrollRef} className="relative z-10 flex-1 overflow-y-auto no-scrollbar">
          <Outlet />
        </div>
      </div>
    </>
  );
}
