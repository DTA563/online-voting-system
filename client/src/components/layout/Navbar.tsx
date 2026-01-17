import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context';
import { Button } from '../ui';

export function Navbar() {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Helper for smooth scrolling on Landing Page
  const scrollToSection = (id: string) => {
    if (!isLandingPage) {
      navigate('/');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // --- Configuration for Authenticated Links ---
  const adminLinks = [
    { path: '/admin', label: 'Dashboard' },
    { path: '/admin/elections', label: 'Elections' },
    { path: '/admin/Positions', label: 'Positions' },
    { path: '/admin/Candidates', label: 'Candidates' },
    { path: '/admin/Voters', label: 'Voters' },
    { path: '/results', label: 'Results' },
  ];

  const voterLinks = [
    { path: '/vote', label: 'Vote Now' },
    { path: '/results', label: 'Results' },
  ];

  // --- Reusable NavItem Component ---
  const NavItem = ({ path, label, onClick }: { path?: string, label: string, onClick?: () => void }) => {
    const isActive = path ? location.pathname === path : false;

    // --- UPDATED STYLE FOR SCROLL BUTTONS (Features / How it Works) ---
    if (onClick) {
      return (
        <button
          onClick={onClick}
          className="relative px-8 py-3 rounded-full text-sm font-semibold transition-all duration-300 
                     text-white overflow-hidden group
                     bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-cyan-600/20
                     hover:from-blue-600/30 hover:via-purple-600/30 hover:to-cyan-600/30
                     border border-white/20 hover:border-white/30
                     shadow-lg hover:shadow-[0_0_25px_rgba(59,130,246,0.4)]
                     active:scale-95 backdrop-blur-sm"
        >
          <span className="relative z-10">{label}</span>
          {/* Animated gradient overlay on hover */}
          <span className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-cyan-500/0 
                         group-hover:from-blue-500/20 group-hover:via-purple-500/20 group-hover:to-cyan-500/20 
                         transition-all duration-500"></span>
          {/* Shine effect */}
          <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent 
                           group-hover:left-[100%] transition-all duration-700"></span>
          </span>
        </button>
      );
    }

    // Standard Links (Dashboard, Vote, etc.)
    return (
      <Link
        to={path!}
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
        ? 'bg-black/20 border-white/5 backdrop-blur-sm' // More transparent on Landing
        : 'bg-black/60 border-white/10 backdrop-blur-xl' // Solid on App pages
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 relative">
          
          {/* --- Brand / Logo Section --- */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 p-[1px] group-hover:shadow-[0_0_20px_rgba(37,99,235,0.5)] transition-shadow duration-300">
                <div className="w-full h-full bg-black/90 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-gray-400">
                SmartBallot
              </span>
            </Link>
          </div>

          {/* --- Navigation Links (Centered) --- */}
          <div className="hidden md:flex items-center absolute left-1/2 transform -translate-x-1/2">
            
            {/* 1. If Logged In: Show App Links */}
            {isAuthenticated && (
              <div className="flex items-center gap-1 p-1 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-md">
                {isAdmin
                  ? adminLinks.map((link) => <NavItem key={link.path} path={link.path} label={link.label} />)
                  : voterLinks.map((link) => <NavItem key={link.path} path={link.path} label={link.label} />)
                }
              </div>
            )}

            {/* 2. If NOT Logged In & On Landing Page: Show Scroll Links */}
            {!isAuthenticated && isLandingPage && (
              <div className="flex items-center gap-3 p-2 bg-black/50 rounded-full border border-white/20 backdrop-blur-xl shadow-2xl shadow-blue-900/20">
                 <NavItem label="Features" onClick={() => scrollToSection('features')} />
                 <div className="w-px h-6 bg-gradient-to-b from-transparent via-white/30 to-transparent"></div>
                 <NavItem label="How It Works" onClick={() => scrollToSection('how-it-works')} />
              </div>
            )}
          </div>

          {/* --- Auth Buttons (Right Side) --- */}
          <div className="hidden md:flex items-center">
            {isAuthenticated ? (
              <div className="flex items-center gap-4 pl-6 border-l border-white/10">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium text-white">{user?.full_name}</span>
                  <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${
                    isAdmin ? "text-purple-400 bg-purple-400/10 border-purple-400/20" : "text-blue-400 bg-blue-400/10 border-blue-400/20"
                  }`}>
                    {user?.role}
                  </span>
                </div>
                <Button onClick={handleLogout} variant="outline" className="h-9 px-4 text-xs border-white/10 text-gray-300 hover:text-white">
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                 <Link to="/login">
                  <Button className="bg-white/5 hover:bg-white/10 text-white border border-white/10 backdrop-blur-sm rounded-xl">
                    Sign In
                  </Button>
                </Link>
                {/* --- RESTORED REGISTER BUTTON --- */}
                <Link to="/register">
                  <Button className="bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)] border border-blue-400/30 rounded-xl">
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