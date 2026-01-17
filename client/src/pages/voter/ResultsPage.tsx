import { useState, useEffect } from 'react';
import { LoadingSpinner, LoadingScreen } from '../../components/ui';
import { electionsApi, votesApi } from '../../api';
import { Election, PositionResult } from '../../types';

// --- Shared Styles ---
const glassCardClass = "relative overflow-hidden backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 transition-all hover:bg-white/[0.07]";
const badgeClass = "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border";

export function ResultsPage() {
  const [election, setElection] = useState<Election | null>(null);
  const [results, setResults] = useState<PositionResult[]>([]);
  const [turnout, setTurnout] = useState<{ total: number; voted: number; percentage: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      const activeElection = await electionsApi.getActive();
      
      if (!activeElection) {
        setError('No active election data found.');
        setIsLoading(false);
        return;
      }

      setElection(activeElection);

      const [electionResults, electionTurnout] = await Promise.all([
        votesApi.getResults(activeElection.election_id),
        votesApi.getTurnout(activeElection.election_id),
      ]);

      setResults(electionResults);
      setTurnout(electionTurnout);

    } catch (err) {
      setError('Unable to fetch live results.');
    } finally {
      // Artificial delay to smooth out the transition
      setTimeout(() => setIsLoading(false), 300);
    }
  };

  // Helper for status badge styling
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active': return "bg-emerald-500/10 text-emerald-300 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-pulse";
      case 'completed': return "bg-blue-500/10 text-blue-300 border-blue-500/50";
      default: return "bg-yellow-500/10 text-yellow-300 border-yellow-500/50";
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Fetching live election results..." />;
  }

  if (error || !election) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 animate-enter">
        <style>{`
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(20px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          .animate-enter {
            opacity: 0;
            animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        `}</style>
        <div className={`${glassCardClass} max-w-md text-center py-12 border-red-500/20`}>
          <div className="text-6xl mb-6 opacity-80">📊</div>
          <h2 className="text-2xl font-bold text-white mb-2">No Data Available</h2>
          <p className="text-gray-400">{error || 'Please check back once the election begins.'}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* --- INJECTED ANIMATION STYLES --- */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-enter {
          opacity: 0; /* Start hidden */
          animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      <div className="min-h-screen bg-black text-white relative font-sans selection:bg-blue-500/30 p-6 md:p-12">
        
        {/* --- Ambient Background --- */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black"></div>
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-blue-900/10 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto space-y-8">
          
          {/* --- Header Section (No Delay) --- */}
          <div className="flex flex-col md:flex-row justify-between items-end gap-4 pb-6 border-b border-white/10 animate-enter">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className={`w-2 h-2 rounded-full ${election.status === 'active' ? 'bg-emerald-500' : 'bg-gray-500'}`}></span>
                <span className="text-gray-400 text-xs uppercase tracking-widest">Election Monitor</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                {election.title}
              </h1>
            </div>
            <span className={`${badgeClass} ${getStatusStyle(election.status)}`}>
              {election.status}
            </span>
          </div>

          {/* --- Turnout HUD (Delay 100ms) --- */}
          {turnout && (
            <div 
              className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-enter"
              style={{ animationDelay: '100ms' }}
            >
              {/* Main Percentage */}
              <div className={`${glassCardClass} md:col-span-2 flex flex-col justify-center relative overflow-hidden group`}>
                <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] group-hover:bg-blue-500/20 transition-all"></div>
                
                <h3 className="text-gray-400 text-sm uppercase tracking-wider font-bold mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                  Participation Rate
                </h3>
                
                <div className="flex items-end gap-4 mb-4">
                  <span className="text-6xl md:text-7xl font-bold text-white tracking-tighter">
                    {turnout.percentage}%
                  </span>
                  <span className="text-blue-400 text-lg mb-2 font-medium animate-pulse">Live Update</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-800/50 h-3 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 via-cyan-500 to-white shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all duration-1000 ease-out relative"
                    style={{ width: `${turnout.percentage}%` }}
                  >
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/50 animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Stats Detail */}
              <div className={`${glassCardClass} flex flex-col justify-center bg-gradient-to-br from-white/5 to-white/[0.02]`}>
                 <div className="space-y-6">
                   <div>
                     <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Votes Cast</p>
                     <p className="text-3xl font-mono text-white">{turnout.voted.toLocaleString()}</p>
                   </div>
                   <div className="w-full h-px bg-white/10"></div>
                   <div>
                     <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Total Eligible</p>
                     <p className="text-3xl font-mono text-gray-400">{turnout.total.toLocaleString()}</p>
                   </div>
                 </div>
              </div>
            </div>
          )}

          {/* --- Results Breakdown (Delay 200ms) --- */}
          <div 
            className="space-y-8 pt-8 animate-enter"
            style={{ animationDelay: '200ms' }}
          >
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="w-1 h-8 bg-purple-500 rounded-full"></span>
              Position Breakdown
            </h2>

            <div className="grid grid-cols-1 gap-8">
              {results.map((position) => (
                <div key={position.position_id} className={`${glassCardClass} p-0 overflow-hidden hover:-translate-y-1`}>
                  
                  {/* Position Header */}
                  <div className="bg-white/5 p-6 border-b border-white/5 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-blue-100">{position.position_title}</h3>
                    <div className="text-xs font-mono text-gray-400 bg-black/30 px-3 py-1 rounded-lg border border-white/10">
                      {position.total_votes} Total Votes
                    </div>
                  </div>

                  {/* Candidates List */}
                  <div className="p-6 space-y-5">
                    {position.candidates
                      .sort((a, b) => b.vote_count - a.vote_count)
                      .map((candidate, index) => {
                        const isWinner = index === 0 && position.total_votes > 0;
                        return (
                          <div key={candidate.candidate_id} className="relative group">
                            
                            {/* Info Row */}
                            <div className="flex justify-between items-center mb-2 relative z-10">
                              <div className="flex items-center gap-4">
                                {/* Rank Box */}
                                <div className={`
                                  w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm transition-all
                                  ${isWinner 
                                    ? 'bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.5)] scale-110' 
                                    : 'bg-white/5 text-gray-500 border border-white/10 group-hover:bg-white/10'}
                                `}>
                                  {index + 1}
                                </div>
                                
                                <div>
                                  <span className={`font-bold text-lg transition-colors ${isWinner ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                                    {candidate.candidate_name}
                                  </span>
                                  {isWinner && (
                                    <span className="ml-3 text-[10px] uppercase font-bold text-yellow-500 tracking-wider animate-pulse">
                                      Leading
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="text-right">
                                <span className="block font-mono font-bold text-lg">{candidate.percentage}%</span>
                                <span className="text-xs text-gray-500">{candidate.vote_count} votes</span>
                              </div>
                            </div>

                            {/* Bar Background */}
                            <div className="h-2 bg-gray-800 rounded-full overflow-hidden relative">
                              <div 
                                className={`h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden ${
                                  isWinner ? 'bg-gradient-to-r from-yellow-600 to-yellow-400' : 'bg-blue-600/40'
                                }`}
                                style={{ width: `${candidate.percentage}%` }}
                              >
                                {/* Shine Effect */}
                                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/20 to-transparent"></div>
                              </div>
                            </div>
                            
                            {/* Glow behind winner */}
                            {isWinner && (
                              <div className="absolute -inset-2 bg-yellow-500/5 rounded-xl blur-md -z-0 opacity-50"></div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>

            {results.length === 0 && (
              <div className="text-center py-12 text-gray-500 bg-white/5 rounded-2xl border border-white/5">
                <p>Waiting for votes to be cast...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}