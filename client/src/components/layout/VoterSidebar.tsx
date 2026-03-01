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
  Sun: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Moon: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>,
  Close: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>,
};

interface VoterSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function VoterSidebar({ isOpen = false, onClose }: VoterSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const { logout, user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // 🔍 DEBUG: Log the entire user object
  console.log('🔍 VoterSidebar - Full user object:', user);
  console.log('🔍 VoterSidebar - user keys:', user ? Object.keys(user) : 'no user');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { label: 'Cast Vote', path: '/vote', icon: <Icons.Vote /> },
    { label: 'Results', path: '/vote/results', icon: <Icons.Results /> },
  ];

  // Get user's display name safely
  const getUserDisplayName = () => {
    if (!user) {
      console.log('🔍 No user object found');
      return 'Voter';
    }
    
    // Typecast to 'any' to bypass TypeScript errors while accessing runtime properties
    const u = user as any; 
    
    // Check for either the runtime property or the TypeScript property
    const actualName = u.name || u.full_name;
    const actualId = u.id || u.user_id;

    if (actualName) {
      return actualName;
    }
    
    if (actualId) {
      return `User ${actualId}`;
    }
    
    console.log('🔍 No name found, falling back to Voter');
    return 'Voter';
  };

  // Get user initials for avatar safely
  const getUserInitials = () => {
    if (!user) return 'V';
    
    const u = user as any;
    const actualName = u.name || u.full_name;
    const actualId = u.id || u.user_id;
    
    if (actualName) {
      const names = actualName.split(' ').filter(Boolean); // filter(Boolean) removes extra spaces
      if (names.length >= 2) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
      }
      return names[0][0].toUpperCase();
    }
    
    if (actualId) {
      return String(actualId)[0].toUpperCase();
    }
    
    return 'V';
  };

  const displayName = getUserDisplayName();
  const userInitials = getUserInitials();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <div 
        className={`
          flex flex-col transition-all duration-300 ease-in-out z-50
          md:sticky md:top-0 md:h-screen md:bg-[var(--v-sidebar)]
          fixed inset-0 w-full h-full bg-[var(--v-sidebar)]
          md:border-r md:border-[var(--v-sidebar-border)]
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${isExpanded ? 'md:w-64' : 'md:w-20'}
        `}
        style={{
          // On mobile, we might want to ensure it covers everything, color is handled by class/style
          backgroundColor: 'var(--v-sidebar)',
        }}
      >
      {/* Header / Logo + Toggle */}
      <div 
        className={`flex items-center justify-between px-6 md:px-3 h-20 shrink-0 ${!isExpanded ? 'md:justify-center' : ''}`}
        style={{ borderBottom: '1px solid var(--v-sidebar-border)' }}
      >
        <div className={`flex items-center gap-3 ${!isExpanded && 'md:justify-center'}`}>
          <img 
            src="/ballot-logo.png" 
            alt="SmartBallot" 
            className="w-10 h-10 rounded-lg object-contain shrink-0"
          />
          <span className={`
            font-bold tracking-tight whitespace-nowrap transition-all duration-300 origin-left
            md:block
            ${isExpanded ? 'opacity-100 translate-x-0' : 'md:opacity-0 md:-translate-x-4 md:absolute md:pointer-events-none md:w-0'}
          `} style={{ color: 'var(--v-text)' }}>
            SmartBallot
          </span>
        </div>

        {isExpanded && (
          <button 
            onClick={() => setIsExpanded(false)}
            className="p-1.5 rounded-lg transition-colors shrink-0 hidden md:block" // Hidden on mobile
            style={{ backgroundColor: 'var(--v-sidebar-hover)', color: 'var(--v-text-2)' }}
          >
            <Icons.ChevronLeft />
          </button>
        )}

        {/* Mobile Close Button */}
        <button 
          onClick={onClose}
          className="p-2 rounded-full transition-colors shrink-0 md:hidden"
          style={{ backgroundColor: 'var(--v-sidebar-hover)', color: 'var(--v-text-2)' }}
        >
          <Icons.Close />
        </button>
      </div>

      {/* Open sidebar button — only when collapsed (Desktop only) */}
      {!isExpanded && (
        <div className="px-3 pt-4 pb-2 justify-center hidden md:flex shrink-0">
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
      <div className={`
          flex-1 overflow-y-auto no-scrollbar
          grid grid-cols-2 gap-4 p-6 place-content-center
          md:flex md:flex-col md:gap-0 md:space-y-2 md:p-3 md:place-content-start
        `}>
        {navItems.map((item) => {
          const isActive = item.path === '/vote' 
            ? location.pathname === '/vote' 
            : location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => onClose?.()} // Close sidebar on mobile
              className={`
                flex items-center rounded-2xl transition-all duration-200 group relative overflow-hidden

                /* Mobile Styles */
                flex-col justify-center p-6 text-center gap-3
                hover:scale-[1.02] active:scale-95
                
                /* Desktop Styles */
                md:flex-row md:justify-start md:p-3 md:gap-3 md:hover:scale-100 md:active:scale-100 md:rounded-xl md:!bg-transparent
                
                ${!isExpanded ? 'md:justify-center' : ''}
              `}
              style={{
                backgroundColor: isActive ? 'var(--v-sidebar-active)' : 'var(--v-sidebar-hover)',
                color: isActive ? 'var(--v-text)' : 'var(--v-text-2)',
              }}
            >
              <span className={`relative z-10 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}
                    style={{ color: isActive ? 'var(--v-accent)' : undefined }}>
                {item.icon}
              </span>

              <span className={`
                font-medium text-sm whitespace-nowrap transition-all duration-300 origin-left
                ${isExpanded ? 'opacity-100 translate-x-0' : 'md:opacity-0 md:-translate-x-4 md:absolute md:pointer-events-none md:w-0'}
              `}>
                {item.label}
              </span>

              {/* Active Indicator Line */}
              {isActive && (
                <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-cyan-500 rounded-r-full shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>
              )}
            </NavLink>
          );
        })}
      </div>


      {/* Modern Theme Toggle */}
      <div className="px-3 pb-4">
        <button
          onClick={toggleTheme}
          className={`
            flex items-center gap-3 w-full rounded-xl transition-colors duration-100 cursor-pointer group hover:opacity-80
            ${isExpanded ? 'px-3 py-3' : 'justify-center py-3'}
          `}
          style={{ backgroundColor: 'var(--v-sidebar-hover)', color: 'var(--v-text-2)' }}
        >
          <div className="relative w-5 h-5 flex items-center justify-center shrink-0">
            {/* Sun Icon (Hidden in Dark Mode) */}
            <div className={`absolute inset-0 transition-all duration-150 ease-in-out ${isDark ? 'scale-0 opacity-0 rotate-90' : 'scale-100 opacity-100 rotate-0'}`}>
              <Icons.Sun />
            </div>
            {/* Moon Icon (Hidden in Light Mode) */}
            <div className={`absolute inset-0 transition-all duration-150 ease-in-out ${isDark ? 'scale-100 opacity-100 rotate-0' : 'scale-0 opacity-0 -rotate-90'}`}>
              <Icons.Moon />
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
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-inner shrink-0">
                {userInitials}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold truncate" style={{ color: 'var(--v-text)' }}>{displayName}</p>
                <p className="text-xs truncate" style={{ color: 'var(--v-text-3)' }}>
                  {user?.role === 'voter' ? 'Voter' : user?.role === 'admin' ? 'Admin' : 'Super Admin'}
                </p>
              </div>
            </div>
          )}

          {!isExpanded && (
            <div className="flex justify-center mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-inner">
                {userInitials}
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
    </>
  );
}