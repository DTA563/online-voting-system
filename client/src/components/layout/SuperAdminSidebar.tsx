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
};

export function SuperAdminSidebar() {
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
    <div 
      className={`
        sticky top-0 h-screen bg-[#050505] border-r border-white/5 
        flex flex-col transition-all duration-300 ease-in-out z-50
        ${isExpanded ? 'w-64' : 'w-20'}
      `}
    >
      {/* Header / Logo + Toggle */}
      <div className={`flex items-center gap-3 px-3 border-b border-white/5 h-20 ${!isExpanded ? 'justify-center' : 'justify-between'}`}>
        <div className={`flex items-center gap-3 ${!isExpanded && 'justify-center'}`}>
          <img 
            src="/ballot-logo.png" 
            alt="SmartBallot" 
            className="w-10 h-10 rounded-lg object-contain shrink-0"
          />
          <span className={`
            font-bold text-white tracking-tight whitespace-nowrap transition-all duration-300 origin-left
            ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 absolute pointer-events-none w-0'}
          `}>
            SmartBallot
          </span>
        </div>

        {isExpanded && (
          <button 
            onClick={() => setIsExpanded(false)}
            className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
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
            className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Icons.ChevronRight />
          </button>
        </div>
      )}

      {/* Navigation Items */}
      <div className="flex-1 py-6 px-3 space-y-2 overflow-y-auto no-scrollbar">
         {navItems.map((item) => {
            const isActive = item.path === '/super-admin' 
               ? location.pathname === '/super-admin'
               : location.pathname.startsWith(item.path);
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={() => `
                  flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden
                  ${isActive ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}
                  ${!isExpanded && 'justify-center'}
                `}
              >
                 <span className={`relative z-10 transition-transform duration-300 ${isActive ? 'scale-110 text-blue-400' : 'group-hover:scale-110'}`}>
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
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                 )}
              </NavLink>
            );
         })}
      </div>

      {/* User / Logout Section */}
      <div className="p-4 border-t border-white/5">
         <div className={`
            rounded-2xl bg-white/5 border border-white/5 overflow-hidden transition-all duration-300
            ${isExpanded ? 'p-4' : 'p-2 justify-center'}
         `}>
            {isExpanded && (
               <div className="flex items-center gap-3 mb-4">
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
                  flex items-center gap-2 w-full rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-300 group
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
