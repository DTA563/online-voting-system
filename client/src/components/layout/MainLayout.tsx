import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';

export function MainLayout() {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Only show navbar on non-landing pages, or make it transparent on landing */}
      {!isLandingPage && <Navbar />}
      
      {isLandingPage ? (
        <main>
          <Outlet />
        </main>
      ) : (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </main>
      )}
    </div>
  );
}
