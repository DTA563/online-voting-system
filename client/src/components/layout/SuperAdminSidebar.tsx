import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Icons = {
  Dashboard: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
  Users: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Logs: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  Logout: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
  ChevronLeft: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" /></svg>,
  ChevronRight: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" /></svg>,
  Close: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>,
};

interface SuperAdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function SuperAdminSidebar({ isOpen = false, onClose }: SuperAdminSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { label: 'Overview', path: '/super-admin', icon: <Icons.Dashboard /> },
    { label: 'Accounts', path: '/super-admin/accounts', icon: <Icons.Users /> },
    { label: 'Audit Logs', path: '/super-admin/logs', icon: <Icons.Logs /> },
  ];

  return (
    <>
      {/* Mobile Overlay - Only needed if we want to click outside, but now the menu is full screen */}
      {/* We can keep it or remove it, but since menu is full screen, clicking "outside" is impossible unless we leave padding. 
          The request says "fixed inset-0 z-50 bg-[#050505]/95 backdrop-blur-xl", which implies full coverage. 
      */}

      <div 
        className={`
          flex flex-col transition-all duration-300 ease-in-out z-50
          md:sticky md:top-0 md:h-screen md:border-r md:border-white/5 md:bg-[#050505]
          fixed inset-0 w-full h-full bg-[#050505]/95 backdrop-blur-xl
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${isExpanded ? 'md:w-64' : 'md:w-20'}
        `}
      >
        {/* Header / Logo + Toggle */}
        <div className={`flex items-center justify-between px-6 md:px-3 border-b border-white/5 h-20 shrink-0`}>
          <div className={`flex items-center gap-3 ${!isExpanded && 'md:justify-center'}`}>
            <img 
              src="/ballot-logo.png" 
              alt="SmartBallot" 
              className="w-10 h-10 rounded-lg object-contain shrink-0"
            />
            <span className={`
              font-bold text-white tracking-tight whitespace-nowrap transition-all duration-300 origin-left
              md:block
              ${isExpanded ? 'opacity-100 translate-x-0' : 'md:opacity-0 md:-translate-x-4 md:absolute md:pointer-events-none md:w-0'}
            `}>
              SmartBallot
            </span>
          </div>

          {/* Desktop Toggle */}
          <div className="hidden md:block">
            {isExpanded && (
              <button 
                onClick={() => setIsExpanded(false)}
                className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
              >
                <Icons.ChevronLeft />
              </button>
            )}
          </div>

          {/* Mobile Close Button */}
          <button 
            onClick={onClose}
            className="md:hidden p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <Icons.Close />
          </button>
        </div>

        {/* Open sidebar button — only when collapsed (Desktop only) */}
        {!isExpanded && (
          <div className="px-3 pt-4 pb-2 justify-center hidden md:flex shrink-0">
            <button 
              onClick={() => setIsExpanded(true)}
              className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
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
              const isActive = item.path === '/super-admin' 
                 ? location.pathname === '/super-admin'
                 : location.pathname.startsWith(item.path);
              
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => onClose?.()} // Close sidebar on mobile when link clicked
                  className={() => `
                    flex items-center rounded-2xl transition-all duration-200 group relative overflow-hidden
                    
                    /* Mobile Styles */
                    flex-col justify-center p-6 bg-white/5 border border-white/10 text-center gap-3
                    hover:bg-white/10 hover:border-white/20 hover:scale-[1.02] active:scale-95
                    
                    /* Desktop Styles */
                    md:flex-row md:justify-start md:p-3 md:bg-transparent md:border-none md:gap-3 md:hover:bg-white/5 md:hover:scale-100 md:active:scale-100 md:rounded-xl

                    ${isActive 
                      ? 'bg-blue-600/20 border-blue-500/50 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)] md:bg-white/10 md:shadow-none md:border-none' 
                      : 'text-gray-400 md:hover:text-white'
                    }
                    ${!isExpanded ? 'md:justify-center' : ''}
                  `}
                >
                   <span className={`
                      relative z-10 transition-transform duration-300 text-3xl md:text-xl
                      ${isActive ? 'scale-110 text-blue-400' : 'group-hover:scale-110'}
                   `}>
                      {item.icon}
                   </span>
                   
                   <span className={`
                      font-medium text-sm whitespace-nowrap transition-all duration-300 origin-left
                      ${isExpanded ? 'opacity-100 translate-x-0' : 'md:opacity-0 md:-translate-x-4 md:absolute md:pointer-events-none md:w-0 md:h-0'}
                   `}>
                      {item.label}
                   </span>
                </NavLink>
              );
           })}
        </div>

        {/* User / Logout Section */}
        <div className="p-6 md:p-4 border-t border-white/5 shrink-0 bg-[#050505] md:bg-transparent">
           <div className={`
              rounded-2xl transition-all duration-300
              ${isExpanded ? 'md:bg-white/5 md:border md:border-white/5 md:p-4' : 'md:p-2 md:justify-center'}
           `}>
              {/* Desktop User Info */}
              {isExpanded && (
                 <div className="hidden md:flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-inner">
                       {user?.full_name?.charAt(0).toUpperCase() || 'S'}
                    </div>
                    <div className="overflow-hidden">
                       <p className="text-sm font-bold text-white truncate">{user?.full_name || 'Super Admin'}</p>
                       <p className="text-xs text-gray-500 truncate">{user?.role || 'Super Administrator'}</p>
                    </div>
                 </div>
              )}
              
              <button 
                 onClick={handleLogout}
                 className={`
                    flex items-center justify-center gap-2 w-full rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-300 group
                    p-4 md:p-2.5
                    ${!isExpanded ? 'md:justify-center' : ''}
                 `}
              >
                 <Icons.Logout />
                 <span className={`${!isExpanded ? 'md:hidden' : ''} font-bold`}>Sign Out</span>
              </button>
           </div>
        </div>
      </div>
    </>
  );
}
