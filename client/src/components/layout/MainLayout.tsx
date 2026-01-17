import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer'; 

export function MainLayout() {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  return (
    // 2. Add 'flex flex-col' to the wrapper. 
    // This allows us to use Flexbox to space out the Navbar, Main, and Footer.
    <div className="min-h-screen bg-black text-white font-sans selection:bg-blue-500/30 flex flex-col">
      
      {/* Navbar sits at the top (fixed position handled inside Navbar component) */}
      <Navbar />
      
      {/* 3. Add 'flex-grow'. 
         This forces the <main> section to expand and fill all available empty space,
         effectively pushing the Footer to the very bottom of the screen.
      */}
      <main className={`relative w-full flex-grow ${isLandingPage ? '' : 'pt-24'}`}>
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}