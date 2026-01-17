import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, LoadingScreen } from '../../components/ui';
import { electionsApi, votesApi } from '../../api';
import { Election } from '../../types';

// Reusing the glass style logic
const glassCardClass = "relative overflow-hidden backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl transition-all hover:border-white/20";
const tableHeaderClass = "text-left py-4 px-6 text-xs font-semibold text-blue-300 uppercase tracking-wider";
const tableCellClass = "py-4 px-6 text-sm text-gray-300 border-b border-white/5";

export function AdminDashboardPage() {
  const [elections, setElections] = useState<Election[]>([]);
  const [activeElection, setActiveElection] = useState<Election | null>(null);
  const [turnout, setTurnout] = useState<{ total: number; voted: number; percentage: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
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
      // Add a tiny artificial delay if data loads too fast, 
      // preventing the spinner from flickering
      setTimeout(() => setIsLoading(false), 300);
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Loading dashboard..." />;
  }

  const activeCount = elections.filter(e => e.status === 'active').length;
  const upcomingCount = elections.filter(e => e.status === 'upcoming').length;
  const completedCount = elections.filter(e => e.status === 'completed').length;

  return (
    <>
      {/* --- Custom Animation Styles --- 
          Injecting a custom keyframe here ensures it works without 
          needing specific Tailwind config plugins. 
      */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-enter {
          opacity: 0; /* Start hidden to prevent flash */
          animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      <div className="min-h-screen bg-black text-white relative font-sans selection:bg-blue-500/30 p-6 md:p-12">
        
        {/* --- Background Ambient Effects --- */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-purple-900/20"></div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          
          {/* --- Header Section (No Delay) --- */}
          <div className="mb-10 animate-enter">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-gray-400 bg-clip-text text-transparent mb-2">
              Admin Command Center
            </h1>
            <p className="text-gray-400">
              System Status: <span className="text-emerald-400 font-mono">ONLINE</span> • {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* --- Stats Overview Grid (Delay 100ms) --- */}
          <div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 animate-enter"
            style={{ animationDelay: '100ms' }}
          >
            <StatCard label="Total Elections" value={elections.length} icon="📚" color="blue" />
            <StatCard label="Active Now" value={activeCount} icon="🟢" color="emerald" glow />
            <StatCard label="Upcoming" value={upcomingCount} icon="📅" color="yellow" />
            <StatCard label="Completed" value={completedCount} icon="🏁" color="purple" />
          </div>

          {/* --- Active Election Live Turnout (Delay 200ms) --- */}
          {activeElection && turnout && (
            <div 
              className={`${glassCardClass} p-8 mb-10 border-l-4 border-l-emerald-500 animate-enter`}
              style={{ animationDelay: '200ms' }}
            >
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="text-center md:text-left min-w-[150px]">
                   <h3 className="text-lg text-gray-400 mb-1">Live Turnout</h3>
                   <div className="text-5xl font-bold text-white tracking-tight">
                     {turnout.percentage}<span className="text-2xl text-emerald-500">%</span>
                   </div>
                   <p className="text-xs text-blue-300 uppercase tracking-widest mt-2 font-semibold">Real-time</p>
                </div>

                <div className="flex-1 w-full">
                   <div className="flex justify-between mb-2 text-sm">
                      <span className="text-white font-medium">{activeElection.title}</span>
                      <span className="text-gray-400">{turnout.voted} / {turnout.total} Voted</span>
                   </div>
                   {/* Animated Progress Bar */}
                   <div className="h-4 bg-gray-800 rounded-full overflow-hidden border border-white/5 relative">
                      <div className="absolute inset-0 bg-gray-800 w-full h-full"></div>
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 relative shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all duration-1000 ease-out"
                        style={{ width: `${turnout.percentage}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                      </div>
                   </div>
                   <p className="text-xs text-gray-500 mt-3">
                     * Updates automatically based on chain validation.
                   </p>
                </div>
              </div>
            </div>
          )}

          {/* --- Main Content Split: Quick Actions & Table (Delay 300ms) --- */}
          <div 
            className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-enter"
            style={{ animationDelay: '300ms' }}
          >
            
            {/* Quick Actions Column */}
            <div className="lg:col-span-1 space-y-6">
               <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                 <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                 Quick Management
               </h3>
               
               <ActionCard 
                 title="Elections" 
                 desc="Configure timestamps & metadata"
                 link="/admin/elections"
                 btnText="Manage Elections"
               />
               <ActionCard 
                 title="Candidates" 
                 desc="Approve & upload profiles"
                 link="/admin/candidates"
                 btnText="Manage Candidates"
               />
               <ActionCard 
                 title="Results Ledger" 
                 desc="Audit final tallies"
                 link="/results"
                 btnText="View Reports"
               />
            </div>

            {/* Recent Activity Table Column */}
            <div className="lg:col-span-2">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                 <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
                 Recent Activity
               </h3>
               
              <div className={`${glassCardClass} min-h-[400px]`}>
                {elections.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
                    <svg className="w-12 h-12 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                    <p>No elections found in the registry.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-white/5">
                        <tr>
                          <th className={tableHeaderClass}>Title</th>
                          <th className={tableHeaderClass}>Date Range</th>
                          <th className={tableHeaderClass}>Status</th>
                          <th className={tableHeaderClass}>Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {elections.slice(0, 5).map((election) => (
                          <tr key={election.election_id} className="hover:bg-white/5 transition-colors group">
                            <td className={`${tableCellClass} font-medium text-white`}>
                              {election.title}
                            </td>
                            <td className={tableCellClass}>
                              <div className="flex flex-col text-xs">
                                <span className="text-gray-400">Start: {new Date(election.start_date).toLocaleDateString()}</span>
                                <span className="text-gray-500">End: {new Date(election.end_date).toLocaleDateString()}</span>
                              </div>
                            </td>
                            <td className={tableCellClass}>
                              <StatusBadge status={election.status} />
                            </td>
                            <td className={tableCellClass}>
                              <Link to={`/admin/elections/${election.election_id}`} className="text-blue-400 hover:text-blue-300 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                                EDIT &rarr;
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

// --- Sub Components ---

function StatCard({ label, value, icon, color, glow }: { label: string, value: number, icon: string, color: string, glow?: boolean }) {
  const colorMap: Record<string, string> = {
    blue: 'text-blue-400',
    emerald: 'text-emerald-400',
    yellow: 'text-yellow-400',
    purple: 'text-purple-400',
  };

  return (
    <div className={`${glassCardClass} p-6 flex items-center justify-between ${glow ? 'shadow-[0_0_20px_rgba(16,185,129,0.15)] border-emerald-500/30' : ''}`}>
      <div>
        <p className={`text-4xl font-bold ${colorMap[color]} mb-1`}>{value}</p>
        <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">{label}</p>
      </div>
      <div className={`text-2xl p-3 rounded-xl bg-white/5 border border-white/5`}>{icon}</div>
    </div>
  );
}

function ActionCard({ title, desc, link, btnText }: { title: string, desc: string, link: string, btnText: string }) {
  return (
    <div className={`${glassCardClass} p-6 hover:-translate-y-1 transition-transform`}>
      <h4 className="text-lg font-bold text-white mb-2">{title}</h4>
      <p className="text-gray-400 text-sm mb-6 h-10">{desc}</p>
      <Link to={link}>
        <Button variant="outline" className="w-full border-white/20 text-gray-300 hover:text-white hover:bg-white/10 hover:border-white/40">
          {btnText}
        </Button>
      </Link>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    upcoming: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    completed: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };
  // @ts-ignore
  const activeStyle = styles[status] || styles.completed;

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${activeStyle} uppercase tracking-wider`}>
      {status}
    </span>
  );
}