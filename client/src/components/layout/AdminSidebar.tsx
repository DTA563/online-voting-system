import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Icons = {
  Dashboard: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
  Elections: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>,
  Candidates: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  Voters: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Logout: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
  ChevronLeft: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" /></svg>,
  ChevronRight: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" /></svg>,
  Positions: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
  Results: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  Close: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>,
};

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({ isOpen = false, onClose }: AdminSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { label: 'Overview', path: '/admin', icon: <Icons.Dashboard /> },
    { label: 'Elections', path: '/admin/elections', icon: <Icons.Elections /> },
     { label: 'Positions', path: '/admin/positions', icon: <Icons.Positions /> },
    { label: 'Candidates', path: '/admin/candidates', icon: <Icons.Candidates /> },
    { label: 'Voters', path: '/admin/voters', icon: <Icons.Voters /> },
    { label: 'Results', path: '/admin/results', icon: <Icons.Results /> },
  ];

  return (
    <>
      <div 
        className={`
          flex flex-col transition-all duration-300 ease-in-out z-50
          md:sticky md:top-0 md:h-screen md:bg-[#050505]
          fixed inset-0 w-full h-full bg-[#050505]/95 backdrop-blur-xl
          md:border-r md:border-white/5
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${isExpanded ? 'md:w-64' : 'md:w-20'}
        `}
      >
      {/* Header / Logo + Toggle */}
      <div className={`flex items-center justify-between px-6 md:px-3 border-b border-white/5 h-20 shrink-0 ${!isExpanded ? 'md:justify-center' : ''}`}>
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

        {isExpanded && (
          <button 
            onClick={() => setIsExpanded(false)}
            className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors shrink-0 hidden md:block"
          >
            <Icons.ChevronLeft />
          </button>
        )}
        
        {/* Mobile Close Button */}
        <button 
            onClick={onClose}
            className="md:hidden p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <Icons.Close />
        </button>
      </div>

      {/* Open sidebar button — only when collapsed, sits above nav items */}
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
            const isActive = item.path === '/admin' 
               ? location.pathname === '/admin'
               : location.pathname.startsWith(item.path);
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onClose?.()} // Close sidebar on mobile
                className={({ isActive: linkActive }) => `
                  flex items-center rounded-2xl transition-all duration-200 group relative overflow-hidden

                  /* Mobile Styles */
                  flex-col justify-center p-6 bg-white/5 border border-white/10 text-center gap-3
                  hover:bg-white/10 hover:border-white/20 hover:scale-[1.02] active:scale-95
                  
                  /* Desktop Styles */
                  md:flex-row md:justify-start md:p-3 md:bg-transparent md:border-none md:gap-3 md:hover:bg-white/5 md:hover:scale-100 md:active:scale-100 md:rounded-xl

                  ${isActive 
                    ? 'bg-cyan-600/20 border-cyan-500/50 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)] md:bg-white/10 md:shadow-none md:border-none' 
                    : 'text-gray-400 md:hover:text-white'
                  }
                  ${!isExpanded ? 'md:justify-center' : ''}
                `}
              >
                 <span className={`
                    relative z-10 transition-transform duration-300 text-3xl md:text-xl
                    ${isActive ? 'scale-110 text-cyan-400' : 'group-hover:scale-110'}
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
                  <div className="w-10 h-10 rounded-full bg-linear-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-inner">
                     {user?.full_name?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <div className="overflow-hidden">
                     <p className="text-sm font-bold text-white truncate">{user?.full_name || 'Admin'}</p>
                     <p className="text-xs text-gray-500 truncate">{user?.role || 'Administrator'}</p>
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
