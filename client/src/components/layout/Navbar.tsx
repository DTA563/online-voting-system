import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context';
import { Button } from '../ui';
import { useState, useEffect } from 'react';

export function Navbar() {
  const { isAuthenticated } = useAuth();
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

  // Hide Navbar on specific routes (e.g. admin dashboard)
  const isHiddenRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/super-admin');

  if (isHiddenRoute) return null;

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
            {!isAuthenticated && (
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