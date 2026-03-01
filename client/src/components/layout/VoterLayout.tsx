import { useRef, useLayoutEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { VoterSidebar } from './VoterSidebar';
import { ThemeProvider, useTheme } from '../../context';

function VoterLayoutInner() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isDark } = useTheme();
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

      <div
        className="flex h-screen overflow-hidden transition-colors duration-300"
        style={{
          '--v-bg': isDark ? '#0a0a0a' : '#f4f4f5',
          '--v-card': isDark ? '#141414' : '#ffffff',
          '--v-card-alt': isDark ? '#1a1a1a' : '#fafafa',
          '--v-border': isDark ? 'rgba(255,255,255,0.08)' : '#e4e4e7',
          '--v-text': isDark ? '#ffffff' : '#09090b',
          '--v-text-2': isDark ? '#a1a1aa' : '#52525b',
          '--v-text-3': isDark ? '#52525b' : '#a1a1aa',
          '--v-hover': isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
          '--v-accent': '#06b6d4',
          '--v-accent-2': '#0891b2',
          '--v-accent-bg': isDark ? 'rgba(6,182,212,0.1)' : 'rgba(8,145,178,0.08)',
          '--v-sidebar': isDark ? '#050505' : '#ffffff',
          '--v-sidebar-border': isDark ? 'rgba(255,255,255,0.05)' : '#e4e4e7',
          '--v-sidebar-hover': isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
          '--v-sidebar-active': isDark ? 'rgba(255,255,255,0.08)' : 'rgba(6,182,212,0.08)',
          backgroundColor: 'var(--v-bg)',
          color: 'var(--v-text)',
        } as React.CSSProperties}
      >
        {/* Sidebar */}
        <div className="relative z-20 shrink-0">
          <VoterSidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
        </div>

        {/* Main Content Wrapper */}
        <div className="flex-1 flex flex-col min-w-0 relative z-10 w-full">
            
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between p-4 sticky top-0 z-30 transition-colors duration-300"
                 style={{
                   backgroundColor: 'var(--v-bg)',
                   borderBottom: '1px solid var(--v-border)'
                 }}>
                <div className="flex items-center gap-3">
                   <img src="/ballot-logo.png" alt="SmartBallot" className="w-8 h-8 rounded-lg object-contain" />
                   <span className="font-bold text-lg" style={{ color: 'var(--v-text)' }}>SmartBallot</span>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="p-2 -mr-2 rounded-lg transition-colors"
                  style={{ color: 'var(--v-text-2)' }}
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

export function VoterLayout() {
  return (
    <ThemeProvider>
      <VoterLayoutInner />
    </ThemeProvider>
  );
}

