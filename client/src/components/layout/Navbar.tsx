import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context';
import { Button } from '../ui';
import { useState, useEffect } from 'react';

export function Navbar() {
  const { user, isAuthenticated, logout, isAdmin, isSuperAdmin } = useAuth();
  const location = useLocation();
  const isLandingPage = location.pathname === '/';
  
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    // Removed the navigate call - auth context will handle the redirect
  };

  // Hide Navbar on specific routes (e.g. admin dashboard)
  const isHiddenRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/super-admin');

  if (isHiddenRoute) return null;

  // --- Configuration for Authenticated Links ---
  const superAdminLinks = [
    { path: '/super-admin', label: 'DASHBOARD' },
    { path: '/super-admin/accounts', label: 'ACCOUNTS' },
    { path: '/super-admin/logs', label: 'LOGS' },
  ];

  const adminLinks = [
    { path: '/admin', label: 'DASHBOARD' },
    { path: '/admin/elections', label: 'ELECTIONS' },
    { path: '/admin/Positions', label: 'POSITIONS' },
    { path: '/admin/Candidates', label: 'CANDIDATES' },
    { path: '/admin/Voters', label: 'VOTERS' },
    { path: '/results', label: 'RESULTS' },
  ];

  const voterLinks = [
    { path: '/vote', label: 'VOTE NOW' },
    { path: '/results', label: 'RESULTS' },
  ];

  // --- Reusable NavItem Component ---
  const NavItem = ({ path, label }: { path: string, label: string }) => {
    const isActive = location.pathname === path;

    return (
      <Link
        to={path}
        className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 border ${
          isActive
            ? 'bg-white/10 text-white border-white/20 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
            : 'bg-transparent text-gray-400 border-transparent hover:text-white hover:bg-white/5'
        }`}
      >
        {label}
        {isActive && (
          <span className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full shadow-[0_0_5px_#60a5fa]"></span>
        )}
      </Link>
    );
  };

  return (
    <nav className={`fixed w-full z-50 top-0 start-0 border-b transition-all duration-300 ${
      isLandingPage 
        ? (isScrolled ? 'bg-black/80 border-white/10 backdrop-blur-xl shadow-lg' : 'bg-transparent border-transparent')
        : 'bg-black/60 border-white/10 backdrop-blur-xl'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 relative">
          
          {/* --- Brand / Logo Section --- */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-3 group">
              
              {/* UPDATED: Using the actual image file now */}
              <img 
                src="/ballot-logo.png" 
                alt="SmartBallot Logo" 
                className="w-10 h-10 object-contain group-hover:scale-110 transition-transform duration-300"
              />

              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-gray-400">
                SmartBallot
              </span>
            </Link>
          </div>

          {/* --- Navigation Links (Centered - Only if Authenticated) --- */}
          <div className="hidden md:flex items-center absolute left-1/2 transform -translate-x-1/2">
            {isAuthenticated && (
              <div className="flex items-center gap-1 p-1 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-md">
                {isSuperAdmin
                  ? superAdminLinks.map((link) => <NavItem key={link.path} path={link.path} label={link.label} />)
                  : isAdmin
                  ? adminLinks.map((link) => <NavItem key={link.path} path={link.path} label={link.label} />)
                  : voterLinks.map((link) => <NavItem key={link.path} path={link.path} label={link.label} />)
                }
              </div>
            )}
          </div>

          {/* --- Auth Buttons (Right Side) --- */}
          {/* Mobile Get Started Button */}
          <div className="md:hidden flex items-center">
            {!isAuthenticated && (
              <Link to="/login">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white border border-transparent backdrop-blur-sm !rounded-full text-sm px-6 h-10 font-bold shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all transform hover:scale-105">
                  Get Started
                </Button>
              </Link>
            )}
          </div>

          <div className="hidden md:flex items-center">
            {isAuthenticated ? (
              <div className="flex items-center gap-4 pl-6 border-l border-white/10">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium text-white">{user?.full_name}</span>
                  <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${
                    isSuperAdmin ? "text-pink-400 bg-pink-400/10 border-pink-400/20" :
                    isAdmin ? "text-purple-400 bg-purple-400/10 border-purple-400/20" : "text-blue-400 bg-blue-400/10 border-blue-400/20"
                  }`}>
                    {user?.role.replace('_', ' ')}
                  </span>
                </div>
                <Button onClick={handleLogout} variant="outline" className="h-9 px-4 text-xs border-white/10 text-gray-300 hover:text-white">
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                 <Link to="/login">
                  <Button className="bg-white/5 hover:bg-white/10 text-white border border-white/10 backdrop-blur-sm !rounded-full px-6 font-medium">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)] border border-blue-400/30 !rounded-full px-6 font-bold">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}