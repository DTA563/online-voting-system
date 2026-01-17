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
    <span ref={elementRef} className="inline-block min-h-[3rem]">
      {displayedText}
      {/* Blinking Cursor - only show while typing or shortly after */}
      <span className="ml-1 inline-block w-1 h-4 bg-blue-400 align-middle animate-cursor"></span>
    </span>
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
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/10 to-black"></div>
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
      <section className="relative py-32 px-4 sm:px-6 lg:px-8 overflow-visible">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10 min-h-[600px]">
          
          {/* Left Column: Content */}
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-8 bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent leading-tight animate-fade-in-up">
              Secure & Transparent Voting
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-10 backdrop-blur-sm bg-white/5 rounded-2xl p-6 border border-white/10 leading-relaxed animate-fade-in-up delay-200">
              This is SmartBallot. A secure, transparent, and auditable e-voting platform designed for institutional elections. Empowering democracy through technology.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-5 animate-fade-in-up delay-300">
              <Link 
                to="/register" 
                className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all shadow-xl hover:shadow-2xl backdrop-blur-sm border border-blue-400/30 text-center"
              >
                Get Started
              </Link>
              <button 
                onClick={() => smoothScrollTo('features')} 
                className="backdrop-blur-sm bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all hover:border-white/30 text-center"
              >
                Learn More
              </button>
            </div>
          </div>

          {/* Right Column: Phone Animation */}
          <div className="flex justify-center items-center perspective-1000 lg:justify-end py-10">
            <div className="relative w-[320px] h-[650px] animate-float">
              
              {/* --- Phone Frame & Chassis --- */}
              <div className="absolute inset-0 rounded-[3.8rem] bg-gradient-to-b from-gray-900 via-black to-gray-900 shadow-2xl ring-1 ring-gray-700 p-[3px]">
                
                {/* Inner bezel */}
                <div className="w-full h-full bg-black rounded-[3.6rem] p-[10px] relative">
                  
                  {/* --- Screen Area --- */}
                  <div className="w-full h-full bg-gradient-to-b from-slate-900 via-slate-950 to-black rounded-[3.2rem] relative overflow-hidden animate-screen-glow">
                    
                    {/* Screen reflection overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none z-40 rounded-[3.2rem]"></div>
                    
                    {/* Status Bar */}
                    <div className="absolute top-0 left-0 right-0 z-50 pt-3.5 px-6 flex justify-between items-start text-white">
                      <div className="w-1/5 pt-1 flex justify-start"><span className="text-[13px] font-medium tracking-wide">9:41</span></div>
                      <div className="w-3/5 flex justify-center">
                        <div className="relative w-[116px] h-[32px] bg-black rounded-full flex items-center justify-between px-3 shadow-sm shadow-black/80 ring-1 ring-white/5">
                          <div className="w-8 h-3 bg-[#1a1a1a] rounded-full opacity-80 blur-[1px]"></div>
                          <div className="w-3 h-3 bg-[#141414] rounded-full ring-2 ring-[#1a1a1a] opacity-90"></div>
                        </div>
                      </div>
                      <div className="w-1/5 flex justify-end items-center space-x-1.5 pt-1.5">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" /></svg>
                        <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M17.778 8.222c-4.296-4.296-11.26-4.296-15.556 0A1 1 0 01.808 6.808c5.076-5.077 13.308-5.077 18.384 0a1 1 0 01-1.414 1.414zM14.95 11.05a7 7 0 00-9.9 0 1 1 0 01-1.414-1.414 9 9 0 0112.728 0 1 1 0 01-1.414 1.414zM12.12 13.88a3 3 0 00-4.242 0 1 1 0 01-1.415-1.415 5 5 0 017.072 0 1 1 0 01-1.415 1.415zM9 16a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
                        <svg className="w-5 h-3 text-white" fill="currentColor" viewBox="0 0 24 12"><rect x="1" y="3" width="18" height="6" rx="2" fill="currentColor" opacity="0.3"/><rect x="1" y="3" width="12" height="6" rx="2" fill="currentColor" /><rect x="20" y="4" width="2" height="4" rx="1" fill="currentColor" /></svg>
                      </div>
                    </div>
                    
                    {/* App content */}
                    <div className="w-full h-full flex flex-col justify-start pt-28 pb-10 px-6">
                      <div className="text-center mb-8">
                        <h3 className="text-3xl font-bold text-white mb-3 drop-shadow-2xl">Cast Your Vote</h3>
                        <p className="text-blue-300 text-sm font-semibold tracking-wider uppercase drop-shadow-lg">Secure & Anonymous</p>
                      </div>
                      <div className="flex-1 flex items-center justify-center">
                        <svg viewBox="0 0 240 320" className="w-full h-[320px]">
                          <defs>
                            <linearGradient id="boxFrontGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#4b5563" />
                              <stop offset="100%" stopColor="#374151" />
                            </linearGradient>
                            <linearGradient id="boxBackGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#1f2937" />
                              <stop offset="100%" stopColor="#111827" />
                            </linearGradient>
                            <filter id="shadow"><feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.5"/></filter>
                            <filter id="glow"><feGaussianBlur stdDeviation="2" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                          </defs>
                          <path d="M55,200 L185,200 L185,300 C185,310 175,320 165,320 L75,320 C65,320 55,310 55,300 Z" fill="url(#boxBackGrad)" />
                          <g className="animate-vote-drop">
                            <g transform="rotate(-8 120 100)">
                              <rect x="95" y="70" width="50" height="75" rx="3" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="1.5" filter="url(#shadow)" />
                              <line x1="105" y1="90" x2="135" y2="90" stroke="#9ca3af" strokeWidth="2" />
                              <line x1="105" y1="105" x2="125" y2="105" stroke="#9ca3af" strokeWidth="2" />
                              <line x1="105" y1="120" x2="135" y2="120" stroke="#9ca3af" strokeWidth="2" />
                              <path d="M125 132 L 130 137 L 140 127" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                            </g>
                            <g transform="translate(0, 10)">
                              <circle cx="140" cy="160" r="22" fill="none" stroke="#dc2626" strokeWidth="3" opacity="0.3"/>
                              <circle cx="140" cy="160" r="18" fill="none" stroke="#dc2626" strokeWidth="2.5"/>
                              <text x="140" y="155" textAnchor="middle" fill="#dc2626" fontSize="10" fontWeight="bold" fontFamily="Arial">VOTED</text>
                              <text x="140" y="168" textAnchor="middle" fill="#dc2626" fontSize="7" fontWeight="bold" fontFamily="Arial">2026</text>
                            </g>
                          </g>
                          <g filter="url(#shadow)">
                            <rect x="50" y="200" width="140" height="120" rx="12" fill="url(#boxFrontGrad)" stroke="#6b7280" strokeWidth="2" />
                            <rect x="80" y="200" width="80" height="14" rx="5" fill="#0f172a" stroke="#475569" strokeWidth="2"/>
                            <g transform="translate(110, 240)">
                              <rect x="5" y="8" width="10" height="12" rx="2" fill="#334155" stroke="#475569" strokeWidth="1"/>
                              <path d="M7,8 V5 a3,3 0 0 1 6,0 V8" fill="none" stroke="#475569" strokeWidth="1.5"/>
                              <circle cx="10" cy="14" r="1.5" fill="#64748b"/>
                            </g>
                            <text x="120" y="275" textAnchor="middle" fill="#f3f4f6" fontSize="11" fontWeight="bold" fontFamily="Arial" letterSpacing="1.2">BALLOT BOX</text>
                            <circle cx="120" cy="295" r="4" fill="#10b981" filter="url(#glow)" className="animate-pulse"/>
                            <text x="120" y="311" textAnchor="middle" fill="#10b981" fontSize="7" fontFamily="Arial">SECURED</text>
                          </g>
                        </svg>
                      </div>
                    </div>
                    {/* Home indicator */}
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white/30 rounded-full"></div>
                  </div>
                  
                  {/* --- Realistic Physical Buttons --- */}
                  <div className="absolute left-[-4px] top-32 w-[4px] h-8 bg-gradient-to-b from-gray-800 via-gray-900 to-black rounded-l-md shadow-sm"></div>
                  <div className="absolute left-[-4px] top-48 w-[4px] h-16 bg-gradient-to-b from-gray-800 via-gray-900 to-black rounded-l-md shadow-sm"></div>
                  <div className="absolute left-[-4px] top-68 w-[4px] h-16 bg-gradient-to-b from-gray-800 via-gray-900 to-black rounded-l-md shadow-sm"></div>
                  <div className="absolute right-[-4px] top-56 w-[4px] h-24 bg-gradient-to-b from-gray-800 via-gray-900 to-black rounded-r-md shadow-sm"></div>
                  
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-20 px-4 sm:px-6 lg:px-8 bg-black/50">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Key Security Features
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto backdrop-blur-sm bg-white/5 rounded-xl p-4 border border-white/10">
              Built with cutting-edge security to protect your vote.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
                title: "Structural Anonymity",
                description: "Our database is designed with no direct link between the Users and Votes tables.",
                gradient: "from-blue-500/20 to-blue-600/10"
              },
              {
                icon: <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
                title: "Time Bucketing",
                description: "To prevent 'Timing Correlation Attacks,' votes are stored in rounded time buckets rather than high-precision timestamps.",
                gradient: "from-emerald-500/20 to-emerald-600/10"
              },
              {
                icon: <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
                title: "Voter Anonymity",
                description: "Structural database design ensures your vote can never be traced back to your identity.",
                gradient: "from-purple-500/20 to-purple-600/10"
              }
            ].map((feature, index) => (
              <div key={index} className="backdrop-blur-xl bg-white/5 rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all hover:scale-[1.02] hover:shadow-2xl">
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-6 bg-gradient-to-br ${feature.gradient} border border-white/10`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-white">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed font-mono text-sm">
                  {/* UPDATED: Typewriter Component applied here */}
                  <TypewriterText text={feature.description} speed={25} />
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              How It Works
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto backdrop-blur-sm bg-white/5 rounded-xl p-4 border border-white/10">
              Vote in three simple steps
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { number: "1", title: "Login Securely", description: "Authenticate using JWT for a stateless, scalable experience.", gradient: "from-blue-500 to-cyan-400" },
              { number: "2", title: "Cast Your Vote", description: "Select your candidates in a secure, anonymous voting booth.", gradient: "from-emerald-500 to-teal-400" },
              { number: "3", title: "View Results", description: "Check transparent, real-time election results.", gradient: "from-purple-500 to-pink-400" }
            ].map((step, index) => (
              <div key={index} className="backdrop-blur-xl bg-white/5 rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all hover:scale-[1.02] text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white bg-gradient-to-br ${step.gradient}`}>
                  {step.number}
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-white">{step.title}</h3>
                <p className="text-gray-300">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-black/50">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="backdrop-blur-xl bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-cyan-500/20 rounded-3xl p-12 border border-white/20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Ready to Vote Securely?
            </h2>
            <p className="text-xl text-gray-200 mb-8">Join the future of democratic elections.</p>
            <Link 
              to="/login" 
              className="inline-block bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white px-10 py-5 rounded-xl text-lg font-semibold transition-all shadow-2xl hover:shadow-3xl backdrop-blur-sm border border-blue-400/30 hover:scale-105"
            >
              Start Voting Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}