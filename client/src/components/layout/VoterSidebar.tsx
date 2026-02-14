import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Icons = {
  Vote: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
  Results: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  Logout: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
  ChevronLeft: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" /></svg>,
  ChevronRight: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" /></svg>,
  Sun: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Moon: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>,
};

export function VoterSidebar() {
  const [isExpanded, setIsExpanded] = useState(true);
  const { logout, user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { label: 'Cast Vote', path: '/vote', icon: <Icons.Vote /> },
    { label: 'Results', path: '/vote/results', icon: <Icons.Results /> },
  ];

  return (
    <div 
      className={`
        sticky top-0 h-screen flex flex-col transition-all duration-300 ease-in-out z-50
        ${isExpanded ? 'w-64' : 'w-20'}
      `}
      style={{
        backgroundColor: 'var(--v-sidebar)',
        borderRight: '1px solid var(--v-sidebar-border)',
      }}
    >
      {/* Header / Logo + Toggle */}
      <div 
        className={`flex items-center gap-3 px-3 h-20 ${!isExpanded ? 'justify-center' : 'justify-between'}`}
        style={{ borderBottom: '1px solid var(--v-sidebar-border)' }}
      >
        <div className={`flex items-center gap-3 ${!isExpanded && 'justify-center'}`}>
          <img 
            src="/ballot-logo.png" 
            alt="SmartBallot" 
            className="w-10 h-10 rounded-lg object-contain shrink-0"
          />
          <span className={`
            font-bold tracking-tight whitespace-nowrap transition-all duration-300 origin-left
            ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 absolute pointer-events-none w-0'}
          `} style={{ color: 'var(--v-text)' }}>
            SmartBallot
          </span>
        </div>

        {isExpanded && (
          <button 
            onClick={() => setIsExpanded(false)}
            className="p-1.5 rounded-lg transition-colors shrink-0"
            style={{ backgroundColor: 'var(--v-sidebar-hover)', color: 'var(--v-text-2)' }}
          >
            <Icons.ChevronLeft />
          </button>
        )}
      </div>

      {/* Open sidebar button — only when collapsed */}
      {!isExpanded && (
        <div className="px-3 pt-4 pb-2 flex justify-center">
          <button 
            onClick={() => setIsExpanded(true)}
            className="p-1.5 rounded-lg transition-colors"
            style={{ backgroundColor: 'var(--v-sidebar-hover)', color: 'var(--v-text-2)' }}
          >
            <Icons.ChevronRight />
          </button>
        </div>
      )}

      {/* Navigation Items */}
      <div className="flex-1 py-6 px-3 space-y-2 overflow-y-auto no-scrollbar">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden
                ${!isExpanded && 'justify-center'}
              `}
              style={{
                backgroundColor: isActive ? 'var(--v-sidebar-active)' : 'transparent',
                color: isActive ? 'var(--v-text)' : 'var(--v-text-2)',
              }}
            >
              <span className={`relative z-10 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}
                    style={{ color: isActive ? 'var(--v-accent)' : undefined }}>
                {item.icon}
              </span>

              <span className={`
                font-medium text-sm whitespace-nowrap transition-all duration-300 origin-left
                ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 absolute pointer-events-none w-0'}
              `}>
                {item.label}
              </span>

              {/* Active Indicator Line */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-cyan-500 rounded-r-full shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Theme Toggle */}
      <div className="px-3 pb-4">
        <button
          onClick={toggleTheme}
          className={`
            flex items-center gap-3 w-full rounded-xl transition-all duration-300 cursor-pointer
            ${isExpanded ? 'px-3 py-3' : 'justify-center py-3'}
          `}
          style={{ backgroundColor: 'var(--v-sidebar-hover)', color: 'var(--v-text-2)' }}
        >
          {/* Toggle track */}
          <div className="relative w-10 h-5 rounded-full shrink-0 transition-colors duration-300"
               style={{ backgroundColor: isDark ? '#374151' : '#06b6d4' }}>
            <div className={`
              absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 flex items-center justify-center
              ${isDark ? 'left-0.5' : 'left-5.5'}
            `}>
              <span className="text-[8px]" style={{ color: isDark ? '#374151' : '#06b6d4' }}>
                {isDark ? <Icons.Moon /> : <Icons.Sun />}
              </span>
            </div>
          </div>

          <span className={`
            font-medium text-sm whitespace-nowrap transition-all duration-300 origin-left
            ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 absolute pointer-events-none w-0'}
          `}>
            {isDark ? 'Dark Mode' : 'Light Mode'}
          </span>
        </button>
      </div>

      {/* User / Logout Section */}
      <div className="p-4" style={{ borderTop: '1px solid var(--v-sidebar-border)' }}>
        <div className={`
          rounded-2xl overflow-hidden transition-all duration-300
          ${isExpanded ? 'p-4' : 'p-2 justify-center'}
        `} style={{ backgroundColor: 'var(--v-sidebar-hover)', border: '1px solid var(--v-sidebar-border)' }}>
          {isExpanded && (
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-inner shrink-0">
                {user?.full_name?.charAt(0).toUpperCase() || 'V'}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold truncate" style={{ color: 'var(--v-text)' }}>{user?.full_name || 'Voter'}</p>
                <p className="text-xs truncate" style={{ color: 'var(--v-text-3)' }}>Voter</p>
              </div>
            </div>
          )}

          {!isExpanded && (
            <div className="flex justify-center mb-3">
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-inner">
                {user?.full_name?.charAt(0).toUpperCase() || 'V'}
              </div>
            </div>
          )}

          <button 
            onClick={handleLogout}
            className={`
              flex items-center gap-2 w-full rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-300 group cursor-pointer
              ${isExpanded ? 'px-4 py-2.5' : 'p-2.5 justify-center'}
            `}
          >
            <Icons.Logout />
            {isExpanded && <span className="text-sm font-bold">Sign Out</span>}
          </button>
        </div>
      </div>
    </div>
  );
}

