import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

// Add custom styles for complex animations
const customStyles = `
  /* --- Fade In Up Animation for Left Content --- */
  @keyframes fadeInUp {
    0% { opacity: 0; transform: translateY(30px); }
    100% { opacity: 1; transform: translateY(0); }
  }

  .animate-fade-in-up { 
    animation: fadeInUp 0.8s ease-out forwards; 
    opacity: 0; 
  }
  
  .delay-100 { animation-delay: 0.1s; }
  .delay-200 { animation-delay: 0.2s; }
  .delay-300 { animation-delay: 0.4s; }

  @keyframes floatSubtle { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
  @media (max-width: 1023px) { .animate-float-subtle { animation: floatSubtle 5s ease-in-out infinite; } }


  /* --- EXISTING ANIMATIONS --- */
  @keyframes slideInTiltLeft {
    0% { opacity: 0; transform: translateX(-50px) rotate(0deg); }
    100% { opacity: 1; transform: translateX(0) rotate(-8deg); }
  }

  @keyframes voteDropIntoBox {
    0% { transform: translateY(0); opacity: 1; }
    10% { transform: translateY(0); }
    50% { transform: translateY(150px); opacity: 1; }
    60% { transform: translateY(150px); opacity: 0; }
    61% { transform: translateY(-100px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(-8deg); }
    50% { transform: translateY(-20px) rotate(-8deg); }
  }

  @keyframes screenGlow {
    0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3), 0 0 40px rgba(59, 130, 246, 0.2); }
    50% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.5), 0 0 60px rgba(59, 130, 246, 0.3); }
  }

  /* --- NEW: Cursor Blink for Typewriter --- */
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }

  .animate-slide-in-tilt { animation: slideInTiltLeft 1.2s ease-out forwards; }
  .animate-vote-drop { animation: voteDropIntoBox 4s ease-in-out infinite; }
  .animate-float { animation: float 6s ease-in-out infinite; }
  .animate-screen-glow { animation: screenGlow 3s ease-in-out infinite; }
  .animate-cursor { animation: blink 1s step-end infinite; }

  /* --- NEW: Straight Float for Redesign --- */
  @keyframes floatVertical {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-20px); }
  }
  .animate-float-vertical { animation: floatVertical 6s ease-in-out infinite; }

  /* --- NEW: Subtle Float for Mobile Content --- */
  @keyframes floatSubtle {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  @media (max-width: 1023px) {
    .animate-float-subtle { animation: floatSubtle 5s ease-in-out infinite; }
  }
`;

// --- Helper Component: Typewriter Effect ---
// This component waits until it is visible on screen, then types out the text.
const TypewriterText = ({ text, speed = 30 }: { text: string; speed?: number }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const hasStartedRef = useRef(false); // Ref to ensure it only runs once per mount

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasStartedRef.current) {
          setIsVisible(true);
          hasStartedRef.current = true; // Lock it so it doesn't restart on scroll up/down
        }
      },
      { threshold: 0.1 } // Trigger when 10% of the element is visible
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) observer.unobserve(elementRef.current);
    };
  }, []);

  useEffect(() => {
    if (isVisible && displayedText.length < text.length) {
      const timeoutId = setTimeout(() => {
        setDisplayedText(text.slice(0, displayedText.length + 1));
      }, speed);
      return () => clearTimeout(timeoutId);
    }
  }, [isVisible, displayedText, text, speed]);

  return (
    <span ref={elementRef} className="inline-block min-h-12">
      {displayedText}
      {/* Blinking Cursor - only show while typing or shortly after */}
      <span className="ml-1 inline-block w-1 h-4 bg-blue-400 align-middle animate-cursor"></span>
    </span>
  );
};

// --- Helper Component: Scroll Reveal Animation ---
const ScrollReveal = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export function LandingPage() {
  
  const smoothScrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <style>{customStyles}</style>

      {/* Wavy Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-linear-to-br from-blue-900/20 via-purple-900/10 to-black"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-20">
          <svg className="w-full h-full" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="wave1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
              </linearGradient>
              <linearGradient id="wave2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            <path d="M0,600 C150,550 350,650 600,600 C850,550 1050,450 1200,400 L1200,800 L0,800 Z" fill="url(#wave1)" />
            <path d="M0,500 C200,450 400,550 600,500 C800,450 1000,350 1200,300 L1200,800 L0,800 Z" fill="url(#wave2)" opacity="0.7" />
            <path d="M0,400 C300,350 500,450 700,400 C900,350 1100,250 1200,200 L1200,800 L0,800 Z" fill="url(#wave1)" opacity="0.5" />
          </svg>
        </div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-20 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10 w-full">
          
          {/* Left Column: Content */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left relative z-20 pt-10 lg:pt-0">
            
            {/* Mobile-Only Visual (Hidden on Large Screens) */}
            <div className="lg:hidden w-full flex justify-center mb-8 animate-fade-in-up">
              <div className="relative w-28 h-28">
                <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl animate-pulse"></div>
                <div className="w-full h-full bg-linear-to-br from-gray-900 to-black border border-white/10 rounded-4xl shadow-2xl flex items-center justify-center transform rotate-6 animate-float">
                  <div className="absolute inset-0 bg-linear-to-b from-white/5 to-transparent rounded-4xl"></div>
                  <svg className="w-12 h-12 text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="lg:hidden inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-300 text-xs font-medium mb-6 animate-fade-in-up shadow-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
              Secure Voting Live
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-[1.1] animate-fade-in-up shadow-black drop-shadow-lg lg:p-0">
              Democracy, <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 via-cyan-300 to-emerald-400">
                Decentralized.
              </span>
            </h1>
            
            <p className="text-lg text-gray-400 mb-8 max-w-lg leading-relaxed animate-fade-in-up delay-100 lg:p-0">
              Your voice matters. Secure, transparent, and immutable voting for the modern era.
            </p>
            
            {/* Buttons - UPDATED FOR WIDTH */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10 animate-fade-in-up delay-200 w-full sm:w-auto">
              <button 
                onClick={() => smoothScrollTo('features')}
                className="bg-linear-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white px-10 py-4 w-full sm:w-auto rounded-xl sm:rounded-full text-lg font-bold transition-all shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:shadow-[0_0_30px_rgba(59,130,246,0.7)] transform hover:-translate-y-1 whitespace-nowrap"
              >
                View Features
              </button>
              <button 
                onClick={() => smoothScrollTo('how-it-works')} 
                className="backdrop-blur-sm bg-white/5 hover:bg-white/10 border border-white/20 text-white px-10 py-4 w-full sm:w-auto rounded-xl sm:rounded-full text-lg font-bold transition-all hover:border-white/40 whitespace-nowrap"
              >
                How It Works
              </button>
            </div>

            {/* Social Proof / Stats Pill */}
            <div className="animate-fade-in-up delay-300 inline-flex items-center gap-4 bg-[#121212]/80 backdrop-blur-md border border-white/10 rounded-2xl p-3 w-fit shadow-lg transform transition-transform hover:scale-105 cursor-default mt-auto lg:mt-0">
               <div className="flex -space-x-3">
                  <div className="w-8 h-8 rounded-full border-2 border-black bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-[10px] font-bold text-white shadow-md">A</div>
                  <div className="w-8 h-8 rounded-full border-2 border-black bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center text-[10px] font-bold text-white shadow-md">B</div>
                  <div className="w-8 h-8 rounded-full border-2 border-black bg-linear-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-[10px] font-bold text-white shadow-md">C</div>
               </div>
               <div>
                  <p className="text-white font-bold leading-none mb-1 text-sm">Trusted by Students</p>
                  <p className="text-gray-400 text-[10px]">100% Verified Identities</p>
               </div>
            </div>
          </div>
         </div>

          {/* Right Column: Visual Composition */}
          <div className="relative hidden lg:flex justify-center items-center h-150 w-full perspective-1000">
            {/* Wrapper for Phone & Cards - Centered & Moved Down with Entry Animation */}
            <div className="relative w-65 h-130 mt-16 transition-transform animate-fade-in-up delay-300">
             
             {/* Floating Card: Top Left - Security */}
             <div className="absolute top-[18%] -left-41.25 z-10 animate-float-vertical" style={{ animationDelay: '1s' }}>
                <div className="bg-[#1a1a1a]/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl w-40 transition-transform hover:scale-105">
                   <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                      </div>
                      <span className="text-gray-400 text-[8px] font-bold tracking-widest uppercase">AES-256</span>
                   </div>
                   <div className="text-white font-bold text-sm">Vote Encrypted</div>
                   <div className="text-blue-400/80 text-[10px] font-mono mt-1">Hash: 0x7F...3A</div>
                </div>
             </div>

             {/* Floating Card: Top Right - Success */}
             <div className="absolute top-[8%] -right-37.5 z-30 animate-float-vertical" style={{ animationDelay: '2.5s' }}>
                <div className="bg-[#1a1a1a]/90 backdrop-blur-xl border border-emerald-500/30 p-3 rounded-full shadow-[0_0_30px_rgba(16,185,129,0.2)] flex items-center gap-3 pr-5 transition-transform hover:scale-105">
                   <div className="w-8 h-8 rounded-full bg-linear-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-black shadow-lg">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                   </div>
                   <div>
                      <div className="text-white font-bold text-xs">Ballot Submitted</div>
                      <div className="text-emerald-400 text-[9px]">Confirmed on Chain</div>
                   </div>
                </div>
             </div>

             {/* Floating Card: Bottom Left - Identity */}
             <div className="absolute bottom-[22%] -left-42.5 z-30 animate-float-vertical" style={{ animationDelay: '3.5s' }}>
                <div className="bg-[#1a1a1a]/90 backdrop-blur-xl border border-purple-500/30 p-3 rounded-2xl shadow-2xl flex items-center gap-3 transition-transform hover:scale-105">
                   <div className="w-8 h-8 rounded-full bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                   </div>
                   <div>
                      <div className="text-white font-bold text-xs">ID Verified</div>
                      <div className="text-purple-400 text-[9px]">Biometric Match</div>
                   </div>
                </div>
             </div>

             {/* Floating Card: Bottom Right - Analytics */}
             <div className="absolute bottom-[10%] -right-35 z-30 animate-float-vertical" style={{ animationDelay: '0.5s' }}>
                <div className="bg-[#1a1a1a]/90 backdrop-blur-xl border border-blue-500/30 p-3 rounded-2xl shadow-2xl w-32 transition-transform hover:scale-105">
                   <div className="flex justify-between items-center mb-2">
                      <span className="text-[9px] text-gray-400 font-bold uppercase">Turnout</span>
                      <span className="text-[9px] text-green-400 font-bold">▲ 12%</span>
                   </div>
                   <div className="flex items-end gap-1 h-8">
                      <div className="bg-blue-500/30 w-1/5 h-[40%] rounded-sm"></div>
                      <div className="bg-blue-500/50 w-1/5 h-[70%] rounded-sm"></div>
                      <div className="bg-blue-500 w-1/5 h-[50%] rounded-sm"></div>
                      <div className="bg-blue-400 w-1/5 h-[90%] rounded-sm"></div>
                      <div className="bg-cyan-300 w-1/5 h-full rounded-sm shadow-[0_0_10px_rgba(34,211,238,0.5)]"></div>
                   </div>
                </div>
             </div>

             {/* Phone Chassis (STATIC - Removed animate-float-vertical) */}
            <div className="relative w-full h-full z-20">
              <div className="absolute inset-0 rounded-[2.5rem] bg-black ring-1 ring-white/20 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                {/* Border / Bezel */}
                <div className="absolute top-0 left-0 right-0 bottom-0 rounded-[2.4rem] border-[5px] border-[#0a0a0a] bg-black overflow-hidden">
                  
                  {/* Screen */}
                  <div className="w-full h-full bg-linear-to-b from-gray-900 to-[#050505] relative flex flex-col">
                    
                    {/* Status Bar */}
                    <div className="w-full h-12 flex justify-between items-center px-5 pt-2 z-10">
                       <span className="text-white text-[10px] font-semibold">9:41</span>
                       <div className="flex gap-1">
                          <div className="w-3 h-3 bg-white/20 rounded-full"></div>
                          <div className="w-3 h-3 bg-white/20 rounded-full"></div>
                       </div>
                    </div>

                    {/* App Header */}
                    <div className="px-5 mb-4">
                       <div className="flex justify-between items-center mb-4">
                          <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white text-xs font-bold ring-2 ring-black">AM</div>
                          <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"><svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg></div>
                       </div>
                       <h2 className="text-white text-xl font-bold leading-tight">University<br />Council 2026</h2>
                       <p className="text-gray-500 text-[10px] mt-1 uppercase tracking-wider">Voting Open • Ends in 24h</p>
                    </div>

                    {/* Voting Cards (Mockup) */}
                    <div className="px-3 flex-1 space-y-3 overflow-hidden">
                       
                       {/* Active Election Card */}
                       <div className="bg-[#1c1c1e] p-3 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-blue-500/30 transition-colors cursor-pointer">
                          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl -mr-8 -mt-8"></div>
                          
                          <div className="flex justify-between items-start mb-3">
                            <div className="bg-blue-500/20 text-blue-400 text-[9px] font-bold px-2 py-0.5 rounded-lg border border-blue-500/20">PRESIDENT</div>
                            <div className="text-gray-500 text-[10px]">1/4 Positions</div>
                          </div>
                          
                          <div className="flex items-center gap-2 mb-3">
                             <div className="w-10 h-10 rounded-lg bg-gray-800 border-2 border-blue-500/50">
                                <div className="w-full h-full bg-linear-to-tr from-gray-700 to-gray-600 rounded-md opacity-50"></div>
                             </div>
                             <div>
                                <div className="text-white font-bold text-xs">Sarah Jenkins</div>
                                <div className="text-gray-500 text-[10px]">"Innovation for All"</div>
                             </div>
                             <div className="ml-auto w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-black text-[10px] font-bold shadow-[0_0_10px_rgba(59,130,246,0.5)]">✓</div>
                          </div>
                          
                          <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden">
                             <div className="bg-blue-500 w-2/3 h-full rounded-full"></div>
                          </div>
                       </div>

                       {/* Secondary Card */}
                       <div className="bg-[#161617] p-3 rounded-2xl border border-white/5 opacity-60 scale-95 origin-top">
                          <div className="flex justify-between items-start mb-2">
                            <div className="bg-purple-500/20 text-purple-400 text-[9px] font-bold px-2 py-0.5 rounded-lg">SECRETARY</div>
                          </div>
                          <div className="h-1.5 bg-gray-800 rounded-full w-1/2 mb-2"></div>
                          <div className="h-1.5 bg-gray-800 rounded-full w-3/4"></div>
                       </div>

                    </div>

                    {/* Bottom Nav Area */}
                    <div className="h-16 bg-[#0f0f10]/90 backdrop-blur-md border-t border-white/5 flex justify-around items-center px-4 pb-1 z-10">
                       <div className="flex flex-col items-center gap-1 text-blue-500">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>
                       </div>
                       <div className="flex flex-col items-center gap-1 text-gray-600 hover:text-gray-400 transition-colors cursor-pointer">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                       </div>
                       <div className="flex flex-col items-center gap-1 text-gray-600 hover:text-gray-400 transition-colors cursor-pointer">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                       </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Redesigned */}
      <section id="features" className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-black/50">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/4 w-125 h-125 bg-blue-900/20 rounded-full blur-[128px] -z-10" />
        <div className="absolute bottom-0 right-1/4 w-125 h-125 bg-purple-900/20 rounded-full blur-[128px] -z-10" />

        <div className="max-w-7xl mx-auto relative z-20">
          <ScrollReveal>
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6 relative z-30">
              <div className="max-w-2xl relative z-40"> {/* Increased z-index */}
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 drop-shadow-sm">
                  Uncompromising Security.
                </h2>
                <p className="text-xl text-gray-400 leading-relaxed">
                  We've re-engineered the voting stack from the ground up. 
                  Using database-level isolation and cryptographic verification to ensure your vote is yours alone.
                </p>
              </div>
              {/* Decoration or Stat */}
              <div className="hidden md:block pb-2 relative z-40">
                <div className="flex items-center gap-2 text-emerald-400 bg-emerald-400/10 px-4 py-2 rounded-full border border-emerald-400/20 font-mono text-sm">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    System Operational
                </div>
              </div>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Feature 1: Structural Anonymity - Large Card */}
            <div className="md:col-span-8">
              <ScrollReveal delay={100}>
                <div className="group relative overflow-hidden rounded-[2.5rem] bg-[#0c0c0c] border border-white/10 p-6 md:p-10 hover:border-white/20 transition-all duration-500 h-full">
                  <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10 flex flex-col h-full justify-between">
                      <div className="mb-8">
                        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 mb-6 text-blue-400">
                            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-4">Structural Anonymity</h3>
                        <p className="text-gray-400 text-lg max-w-md">The Identity Table and Vote Table are fundamentally disconnected. There is no foreign key linking a voter to their choice.</p>
                      </div>
                      {/* Visual Decoration */}
                      <div className="flex gap-4 opacity-50 grayscale group-hover:grayscale-0 transition-all duration-700">
                        <div className="h-2 w-32 bg-blue-500 rounded-full"></div>
                        <div className="h-2 w-16 bg-gray-700 rounded-full"></div>
                      </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Feature 2: Time Bucketing - Tall/Side Card */}
            <div className="md:col-span-4">
              <ScrollReveal delay={200}>
                <div className="group relative overflow-hidden rounded-[2.5rem] bg-[#0e0e0e] border border-white/10 p-6 md:p-10 hover:border-white/20 transition-all duration-500 h-full">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -z-10 translate-x-1/2 -translate-y-1/2"></div>
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 mb-6 text-emerald-400">
                      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Anti-Correlation</h3>
                  <p className="text-gray-400 mb-6">Votes are time-bucketed. We fuzz timestamps to prevent timing attacks.</p>
                  <div className="mt-auto bg-black/50 rounded-xl p-4 border border-white/5 font-mono text-xs text-emerald-400/80">
                      timestamp: <span className="text-gray-600 line-through">12:04:31</span> → <span className="text-white">12:00:00</span>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Feature 3: Cryptography - Full Width Card */}
            <div className="md:col-span-12">
              <ScrollReveal delay={300}>
                <div className="group relative overflow-hidden rounded-[2.5rem] bg-[#0c0c0c] border border-white/10 p-6 md:p-10 hover:border-white/20 transition-all duration-500">
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                  <div className="grid md:grid-cols-2 gap-12 items-center">
                      <div>
                        <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 mb-6 text-purple-400">
                            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-4">Voter Integrity</h3>
                        <p className="text-gray-400 text-lg">Every vote is cryptographically signed. Once cast, it cannot be altered without breaking the chain.</p>
                        <ul className="mt-6 space-y-3">
                          {["Immutable Records", "JWT Authentication", "Role-Based Access Control"].map(item => (
                              <li key={item} className="flex items-center gap-3 text-sm text-gray-300">
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                                {item}
                              </li>
                          ))}
                        </ul>
                      </div>
                      <div className="relative h-48 bg-black/40 rounded-3xl border border-white/5 flex items-center justify-center p-8 overflow-hidden">
                        <div className="absolute inset-0 bg-linear-to-r from-purple-500/10 to-blue-500/10"></div>
                        <div className="text-center">
                            <div className="font-mono text-xs text-purple-300 mb-2">HASH VERIFICATION</div>
                            <div className="text-2xl md:text-3xl font-bold text-white tracking-widest break-all opacity-80 font-mono">
                              <TypewriterText text="0x7f8a9b...c2d3" speed={50} />
                            </div>
                        </div>
                      </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

            {/* How It Works Section - Redesigned */}
      <section id="how-it-works" className="relative py-32 px-4 sm:px-6 lg:px-8 bg-black">
        <div className="max-w-7xl mx-auto relative z-10">
           
           <ScrollReveal>
             <div className="text-center mb-20">
                <span className="text-blue-500 font-bold tracking-wider uppercase text-sm mb-3 block">Process</span>
                <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6">Simple. Fast. Secure.</h2>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto">From registration to results in three seamless steps.</p>
             </div>
           </ScrollReveal>

           <div className="relative">
              {/* Connector Line (Desktop) */}
              <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-linear-to-r from-blue-900/0 via-blue-500/30 to-blue-900/0"></div>

              <div className="grid md:grid-cols-3 gap-16 pt-12">
                 {[
                    { title: "Authenticate", sub: "Verify your identity via secure portal", icon: "01" },
                    { title: "Cast Vote", sub: "Select & confirm your secure ballot", icon: "02" },
                    { title: "Watch Live", sub: "Track transparent real-time availability", icon: "03" }
                 ].map((step, i) => (
                    <div key={i} className="relative group text-center md:text-left">
                       <ScrollReveal delay={i * 200}>
                         <div className="relative">
                           {/* Step Number with proper spacing */}
                           <div className="absolute -top-20 md:-top-24 left-1/2 md:left-0 transform -translate-x-1/2 md:translate-x-0 w-20 h-20 bg-black border-4 border-[#1a1a1a] rounded-full flex items-center justify-center text-2xl font-black text-gray-700 group-hover:text-white group-hover:border-blue-500 transition-all duration-300 z-10 shadow-2xl mb-8">
                              {step.icon}
                           </div>
                           
                           {/* Arrow Connector - Desktop */}
                           <div className="hidden md:block absolute left-20 top-0 w-12 h-px bg-blue-500/50 z-0">
                              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 border-r-2 border-t-2 border-blue-500 rotate-45"></div>
                           </div>
                           
                           {/* Arrow Connector - Mobile */}
                           <div className="md:hidden absolute top-12 left-1/2 transform -translate-x-1/2 w-px h-8 bg-blue-500/50">
                              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3 h-3 border-b-2 border-r-2 border-blue-500 rotate-45"></div>
                           </div>
                           
                           <div className="pt-24 md:pt-0 md:pl-32">
                             <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{step.title}</h3>
                             <p className="text-gray-500 leading-relaxed max-w-xs mx-auto md:mx-0">{step.sub}</p>
                           </div>
                           
                           {/* Mobile Connector Line */}
                           {i !== 2 && <div className="md:hidden w-0.5 h-12 bg-white/10 mx-auto my-8"></div>}
                         </div>
                       </ScrollReveal>
                    </div>
                 ))}
              </div>
           </div>
           
           {/* Visual Demo Area */}
           <ScrollReveal delay={400}>
             <div className="mt-24 p-1 rounded-[2.5rem] bg-linear-to-br from-white/10 to-white/5 ring-1 ring-white/10">
                <div className="bg-black rounded-[2.4rem] overflow-hidden relative min-h-75 flex items-center justify-center border border-white/5">
                   <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-blue-900/20 via-black to-black"></div>
                   <div className="text-center relative z-10 px-4">
                      <p className="font-bold text-2xl text-white mb-6">Start your journey today</p>
                      <Link to="/register">
                        <button className="bg-white hover:bg-gray-100 text-black px-10 py-4 rounded-full font-bold hover:scale-105 transition-transform flex items-center gap-2 mx-auto shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                          Create Voter Account 
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                        </button>
                      </Link>
                   </div>
                </div>
             </div>
           </ScrollReveal>

        </div>
      </section>
    </div>
  );
}