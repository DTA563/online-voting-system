import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { electionsApi, votesApi } from '../../api';
import { Election } from '../../types';

// --- Icons ---
const Icons = {
  Vote: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
  Users: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Activity: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  Archive: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>,
  Plus: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>,
  ChevronRight: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" /></svg>,
  Shield: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  Clock: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
};

export function AdminDashboardPage() {
  const [elections, setElections] = useState<Election[]>([]);
  const [activeElection, setActiveElection] = useState<Election | null>(null);
  const [turnout, setTurnout] = useState<{ total: number; voted: number; percentage: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    loadDashboardData();
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const loadDashboardData = async () => {
    try {
      const [allElections, active] = await Promise.all([
        electionsApi.getAll(),
        electionsApi.getActive(),
      ]);

      setElections(allElections);
      setActiveElection(active);

      if (active) {
        const turnoutData = await votesApi.getTurnout(active.election_id);
        setTurnout(turnoutData);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  if (isLoading) {
    return (
        <div className="p-6 lg:p-10 space-y-8">
          <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/10"></div>
                        <div className="h-8 w-48 bg-white/10 rounded"></div>
                    </div>
                    <div className="h-4 w-32 bg-white/10 rounded ml-11"></div>
                </div>
                <div className="flex gap-3">
                    <div className="h-10 w-32 bg-white/5 rounded-xl border border-white/10"></div>
                    <div className="h-10 w-36 bg-white/10 rounded-xl"></div>
                </div>
            </div>

            {/* Metrics Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-32 bg-white/5 rounded-3xl border border-white/10"></div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content Skeleton */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="h-80 bg-white/5 rounded-3xl border border-white/10"></div>
                    <div className="h-64 bg-white/5 rounded-3xl border border-white/10"></div>
                </div>
                
                {/* Right Panel Skeleton */}
                <div className="space-y-6">
                    <div className="h-48 bg-white/5 rounded-3xl border border-white/10"></div>
                    <div className="h-32 bg-white/5 rounded-3xl border border-white/10"></div>
                </div>
            </div>
          </div>
        </div>
    );
  }

  const activeCount = elections.filter(e => e.status === 'active').length;
  const upcomingCount = elections.filter(e => e.status === 'upcoming').length;
  const completedCount = elections.filter(e => e.status === 'completed').length;

  return (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-enter { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
      `}</style>

        <div className="p-6 lg:p-10 space-y-8">
          
          {/* --- Header --- */}
          <header className={`flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5 opacity-0 ${mounted ? 'animate-enter' : ''}`}>
             <div>
                <div className="flex items-center gap-3 mb-1">
                   {/* Logo / Brand Mark */}
                   <div className="w-8 h-8 rounded-lg bg-linear-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                   </div>
                   <h1 className="text-2xl font-bold tracking-tight text-white">
                      Admin Dashboard
                   </h1>
                </div>
                <p className="text-gray-400 text-sm ml-11">
                  System Status: <span className="text-emerald-400 font-medium drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]">● Operational</span>
                </p>
             </div>

             <div className="flex flex-col sm:flex-row gap-3">
                 <div className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col items-end min-w-35">
                    <span className="text-[10px] bg-linear-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent font-bold uppercase tracking-wider">Server Time</span>
                    <span className="font-mono text-sm text-gray-300 tabular-nums">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                 </div>
             </div>
          </header>

          {/* --- Metrics Grid --- */}
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 opacity-0 ${mounted ? 'animate-enter delay-100' : ''}`}>
            <StatCard label="Total Elections" value={elections.length} icon={<Icons.Archive />} color="blue" />
            <StatCard label="Active Sessions" value={activeCount} icon={<Icons.Activity />} color="cyan" active glow />
            <StatCard label="Votes Scheduled" value={upcomingCount} icon={<Icons.Clock />} color="purple" />
            <StatCard label="Completed" value={completedCount} icon={<Icons.Shield />} color="emerald" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            
            {/* --- Main Content (2 cols) --- */}
            <div className={`lg:col-span-2 space-y-6 opacity-0 ${mounted ? 'animate-enter delay-200' : ''}`}>
              
              {/* Live Monitor */}
              {activeElection && turnout ? (
                <div className="relative overflow-hidden rounded-3xl bg-[#0a0a0a] border border-white/10 shadow-2xl group">
                  {/* Dynamic Glow */}
                  <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-cyan-600/10 rounded-full blur-[80px] group-hover:bg-cyan-600/15 transition-all duration-1000"></div>
                  
                  <div className="p-8 relative z-10">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/30 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase tracking-widest mb-3 shadow-[0_0_10px_rgba(6,182,212,0.1)]">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500"></span>
                          </span>
                          Live Polling
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2">{activeElection.title}</h2>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span className="flex items-center gap-1.5">
                             <Icons.Users />
                             {turnout.voted.toLocaleString()} / {turnout.total.toLocaleString()}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                          <span>Ends {new Date(activeElection.end_date).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="text-center bg-white/5 rounded-2xl p-4 border border-white/5 backdrop-blur-sm">
                         <span className="block text-4xl font-mono font-bold text-transparent bg-clip-text bg-linear-to-b from-white to-gray-400">
                            {turnout.percentage}%
                         </span>
                         <span className="text-[10px] uppercase tracking-wide text-gray-500 font-bold">Participation</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-4">
                      <div className="h-4 w-full bg-black/50 rounded-full overflow-hidden border border-white/10 p-0.5 shadow-inner">
                        <div 
                          className="h-full bg-linear-to-r from-blue-600 via-cyan-500 to-emerald-400 rounded-full relative transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(6,182,212,0.4)]" 
                          style={{ width: `${turnout.percentage}%` }}
                        >
                          <div className="absolute inset-0 bg-white/30 animate-[pulse_2s_infinite]"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Decorative Footer Area in Card */}
                  <div className="bg-white/2 border-t border-white/5 p-4 flex justify-between items-center text-xs text-gray-500 font-mono">
                     <span>ID: #{activeElection.election_id.toString().padStart(4, '0')}</span>
                     <Link to={`/admin/elections/${activeElection.election_id}`} className="flex items-center gap-1 hover:text-cyan-400 transition-colors">
                        Detailed Analytics <Icons.ChevronRight />
                     </Link>
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-gray-800 bg-[#0a0a0a]/50 p-12 text-center hover:border-gray-700 transition-colors">
                   <div className="w-16 h-16 bg-gray-900/80 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-600 shadow-inner">
                      <Icons.Activity />
                   </div>
                   <h3 className="text-white font-semibold text-lg">No Live Election</h3>
                   <p className="text-gray-500 text-sm mt-2 max-w-xs mx-auto">
                      There are no elections currently active. Launch a new session to monitoring real-time voting data.
                   </p>
                   <Link to="/admin/elections/new" className="inline-block mt-6 text-cyan-400 hover:text-cyan-300 text-sm font-bold">
                      + Start Election
                   </Link>
                </div>
              )}

              {/* Recent History Table */}
              <div className="rounded-3xl border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl overflow-hidden">
                 <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/2">
                    <div>
                       <h3 className="font-bold text-white">Election Registry</h3>
                       <p className="text-xs text-gray-500 mt-1">Recent system activity logging</p>
                    </div>
                    <Link to="/admin/elections" className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors bg-cyan-500/10 px-3 py-1.5 rounded-lg border border-cyan-500/20">
                      View All <Icons.ChevronRight />
                    </Link>
                 </div>
                 
                 <div className="overflow-x-auto">
                   <table className="w-full text-left">
                      <thead className="bg-black/40 text-xs uppercase text-gray-500 font-bold tracking-wider">
                         <tr>
                            <th className="px-6 py-4 border-b border-white/5">Election Title</th>
                            <th className="px-6 py-4 border-b border-white/5">Status</th>
                            <th className="px-6 py-4 border-b border-white/5 hidden sm:table-cell">Date</th>
                            <th className="px-6 py-4 border-b border-white/5 text-right">Action</th>
                         </tr>
                      </thead>
                      <tbody className="text-sm divide-y divide-white/5">
                         {elections.slice(0, 5).map(e => (
                           <tr key={e.election_id} className="hover:bg-white/2 transition-colors group">
                              <td className="px-6 py-4 font-medium text-gray-200 group-hover:text-white transition-colors">{e.title}</td>
                              <td className="px-6 py-4"><StatusBadge status={e.status} /></td>
                              <td className="px-6 py-4 text-gray-500 font-mono text-xs hidden sm:table-cell">{new Date(e.end_date).toLocaleDateString()}</td>
                              <td className="px-6 py-4 text-right">
                                 <Link to={`/admin/elections/${e.election_id}`} className="text-gray-500 hover:text-cyan-400 transition-colors font-medium text-xs">Manage</Link>
                              </td>
                           </tr>
                         ))}
                         {elections.length === 0 && (
                           <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-600 italic">No elections records found</td></tr>
                         )}
                      </tbody>
                   </table>
                 </div>
              </div>
            </div>

            {/* --- Right Sidebar (1 col) --- */}
            <div className={`space-y-6 opacity-0 ${mounted ? 'animate-enter delay-300' : ''}`}>
              
              {/* Actions Panel */}
              <div className="rounded-3xl border border-white/10 bg-[#0a0a0a] p-1 overflow-hidden">
                 <div className="bg-white/2 px-5 py-4 border-b border-white/5">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Quick Actions</h3>
                 </div>
                 <div className="p-2 space-y-1">
                    <MenuButton icon={<Icons.Vote />} label="Manage Candidates" link="/admin/candidates" color="text-purple-400" />
                    <MenuButton icon={<Icons.Users />} label="Voter Database" link="/admin/voters" color="text-cyan-400" />
                    <MenuButton icon={<Icons.Archive />} label="Manage Positions" link="/admin/positions" color="text-blue-400" />
                 </div>
              </div>

              {/* Election Summary */}
              <div className="rounded-3xl border border-cyan-500/20 bg-linear-to-b from-cyan-950/30 to-[#0a0a0a] p-6 backdrop-blur-sm shadow-[0_4px_20px_rgba(6,182,212,0.05)]">
                 <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                       <Icons.Activity />
                    </div>
                    <div>
                       <h4 className="text-white font-bold text-sm">System Overview</h4>
                       <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                          {elections.length} total election{elections.length !== 1 ? 's' : ''} registered. <br/>
                          {activeCount > 0 
                            ? <span className="text-emerald-400">{activeCount} currently live.</span>
                            : <span className="text-gray-500">No elections currently live.</span>
                          }
                       </p>
                    </div>
                 </div>
              </div>

              {/* Results Card */}
              <div className="rounded-3xl border border-white/5 bg-linear-to-br from-purple-900/10 to-transparent p-6 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                 <h4 className="text-purple-300 font-bold text-sm mb-2 flex items-center gap-2">
                    <span className="p-1 rounded bg-purple-500/20"><Icons.Shield /></span>
                    View Results
                 </h4>
                 <p className="text-gray-400 text-xs leading-relaxed z-10 relative mb-3">
                    Access final tallies and position breakdowns for completed elections.
                 </p>
                 <Link to="/admin/results" className="text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors">
                    Go to Results &rarr;
                 </Link>
              </div>

            </div>
          </div>
        </div>
    </>
  );
}

// --- Sub-Components ---

function StatCard({ label, value, icon, active = false, glow = false, color = 'blue' }: { label: string, value: number, icon: any, active?: boolean, glow?: boolean, color?: string }) {
   
   const colorStyles: any = {
      blue: 'from-blue-600/20 to-indigo-900/20 border-blue-500/30 text-blue-400',
      cyan: 'from-cyan-600/20 to-blue-900/20 border-cyan-500/30 text-cyan-400',
      purple: 'from-purple-600/20 to-indigo-900/20 border-purple-500/30 text-purple-400',
      emerald: 'from-emerald-600/20 to-teal-900/20 border-emerald-500/30 text-emerald-400',
   };

   const activeClass = active 
      ? `bg-linear-to-br ${colorStyles[color]} shadow-lg`
      : 'bg-[#0a0a0a] border-white/10 hover:border-white/20';
   
   const glowClass = glow ? `shadow-[0_0_30px_rgba(6,182,212,0.15)]` : '';

   return (
      <div className={`
         relative overflow-hidden p-6 rounded-3xl border transition-all duration-300 group
         ${activeClass} ${glowClass}
      `}>
         <div className="flex justify-between items-start mb-4">
            <div className={`p-2.5 rounded-xl ${active ? 'bg-white/10 text-white' : 'bg-white/5 text-gray-400 group-hover:text-white transition-colors'}`}>
               {icon}
            </div>
            {active && <span className="flex h-2 w-2 relative">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>}
         </div>
         <div className="text-3xl font-bold text-white tracking-tight mb-1">{value}</div>
         <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">{label}</div>
      </div>
   );
}

function MenuButton({ icon, label, link, color }: { icon: any, label: string, link: string, color: string }) {
   return (
      <Link to={link} className="flex items-center gap-4 w-full p-4 rounded-2xl hover:bg-white/5 text-gray-400 hover:text-white transition-all group border border-transparent hover:border-white/5 relative overflow-hidden">
         <span className={`group-hover:${color} transition-colors p-2 rounded-lg bg-white/5 group-hover:bg-white/10`}>{icon}</span>
         <span className="text-sm font-bold">{label}</span>
         <span className="ml-auto opacity-0 group-hover:opacity-100 transform -translate-x-2.5 group-hover:translate-x-0 transition-all duration-300 text-gray-500">→</span>
      </Link>
   );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]',
    upcoming: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    completed: 'bg-gray-800/50 text-gray-400 border-gray-700/50',
    ineligible: 'bg-red-500/10 text-red-400 border-red-500/20'
  };
  
  const style = styles[status] || styles.completed;
  
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border ${style} inline-flex items-center gap-1.5`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-current opacity-50'}`}></span>
      {status}
    </span>
  );
}