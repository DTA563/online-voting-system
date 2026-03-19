import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { LoadingSpinner } from '../../components/ui';
import { electionsApi, votesApi } from '../../api';
import { Election, PositionResult } from '../../types';

const SERVER_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5001/api').replace('/api', '');

// --- Icons ---
const Icons = {
  Back: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>,
  Trophy: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
  Chart: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  Lock: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
};

export function ResultsPage() {
  const [elections, setElections] = useState<Election[]>([]);
  const [selectedElection, setSelectedElection] = useState<Election | null>(null);
  const [results, setResults] = useState<PositionResult[]>([]);
  const [turnout, setTurnout] = useState<{ total: number; voted: number; percentage: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    loadElections();
    const timer = setTimeout(() => setMounted(true), 100);
    
    const socket = io(SERVER_URL);

    socket.on('turnout_update', (data: { election_id: number; percentage: number; voted: number; total: number }) => {
      setTurnout((prev) => {
        if (!selectedElection || selectedElection.election_id !== data.election_id) {
          return prev;
        }
        return {
          total: data.total,
          voted: data.voted,
          percentage: data.percentage,
        };
      });
    });

    return () => {
      clearTimeout(timer);
      socket.disconnect();
    };
  }, [selectedElection]);

  const loadElections = async () => {
    try {
      const data = await electionsApi.getAll();
      setElections(data);
      if (!selectedElection) {
        const active = data.filter((e: Election) => e.status === 'active');
        const completed = data.filter((e: Election) => e.status === 'completed'); 
        if (active.length > 0) {
          handleSelectElection(active[0]);
        } else if (completed.length > 0) {
          handleSelectElection(completed[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setIsLoading(false), 300);
    }
  };

  const handleSelectElection = async (election: Election) => {
    setSelectedElection(election);
    setIsLoadingResults(true);
    setResults([]);
    setTurnout(null);
    try {
      const [electionResults, electionTurnout] = await Promise.all([
        votesApi.getResults(election.election_id),
        votesApi.getTurnout(election.election_id),
      ]);
      setResults(electionResults);
      setTurnout(electionTurnout);
    } catch (err) {
      console.error('Failed to load results:', err);
    } finally {
      setIsLoadingResults(false);
    }
  };

  const completedElections = elections.filter(e => e.status === 'completed');
  const activeElections = elections.filter(e => e.status === 'active');
  const upcomingElections = elections.filter(e => e.status === 'upcoming');
  const availableElections = [...activeElections, ...completedElections];

  if (isLoading) {
    return (
      <div className="p-6 lg:p-10 space-y-8 animate-pulse">
        <div className="h-8 w-48 bg-white/10 rounded mb-4"></div>
        <div className="h-4 w-32 bg-white/10 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-white/5 rounded-3xl border border-white/10"></div>)}
        </div>
        <div className="h-64 bg-white/5 rounded-3xl border border-white/10 mt-6"></div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-enter { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
      `}</style>

      <div className="pb-12">
        <div className="max-w-7xl mx-auto p-6 lg:p-10 space-y-8">

          {/* Header */}
          <header className={`flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5 opacity-0 ${mounted ? 'animate-enter' : ''}`}>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">
                Election Results & Live Turnouts
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                View real-time turnouts for active elections and final tallies for completed ones.
              </p>
            </div>

            <div className="flex gap-4">
              <div className="px-5 py-2.5 rounded-xl bg-cyan-900/20 border border-cyan-500/20 backdrop-blur-md flex flex-col items-end">
                <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">Active</span>
                <span className="font-mono text-xl text-white font-bold leading-none mt-1">{activeElections.length}</span>
              </div>
              <div className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col items-end">
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Completed</span>
                <span className="font-mono text-xl text-white font-bold leading-none mt-1">{completedElections.length}</span>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className={`opacity-0 ${mounted ? 'animate-enter delay-100' : ''}`}>
            {(completedElections.length === 0 && activeElections.length === 0) ? (
              <div className="rounded-3xl border border-dashed border-white/10 bg-[#0a0a0a]/30 p-16 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-6 text-gray-600">
                  <Icons.Lock />
                </div>
                <h3 className="text-white font-bold text-lg">No Data Available</h3>
                <p className="text-gray-500 text-sm mt-2 mb-2 max-w-md">
                  There are no active or completed elections to show.
                  {upcomingElections.length > 0 && ` ${upcomingElections.length} upcoming.`}
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Election Selector */}
                <div>
                  {/* Mobile Dropdown */}
                  <div className="block md:hidden mb-4 relative">
                    <select
                      className="w-full bg-[#0a0a0a] border border-white/10 p-3.5 pr-10 rounded-xl text-white font-medium text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 appearance-none cursor-pointer"
                      value={selectedElection?.election_id || ''}
                      onChange={(e) => {
                        const selected = availableElections.find(el => el.election_id === Number(e.target.value));
                        if (selected) handleSelectElection(selected);
                      }}
                    >
                      <option value="" disabled>Select an Election</option>     
                      {availableElections.map(election => (
                        <option key={election.election_id} value={election.election_id}>
                          {election.title} {election.status === 'active' ? '(Active)' : ''}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>

                  {/* Desktop Pills */}
                  <div className="hidden md:flex flex-wrap gap-3">
                    {availableElections.map(election => (
                      <button
                        key={election.election_id}
                        onClick={() => handleSelectElection(election)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                          selectedElection?.election_id === election.election_id
                            ? 'bg-cyan-600/20 border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {election.title}
                        {election.status === 'active' && <span className="ml-2 w-2 h-2 inline-block rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Results Content */}
                {selectedElection && (
                  <div className="space-y-8">
                    {/* Election Info Bar */}
                    <div className="rounded-2xl bg-[#0a0a0a] border border-white/10 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`w-2 h-2 rounded-full ${selectedElection.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-gray-500'}`}></span>
                          <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">
                            {selectedElection.status === 'active' ? 'Live Turnouts' : 'Final Results'}
                          </span>
                        </div>
                        <h2 className="text-2xl font-bold text-white">{selectedElection.title}</h2>
                        <p className="text-gray-500 text-sm mt-1 font-mono">
                          {selectedElection.status === 'active' ? 'Ends:' : 'Ended:'} {new Date(selectedElection.end_date).toLocaleDateString()} at {new Date(selectedElection.end_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                        selectedElection.status === 'active' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                      }`}>
                        {selectedElection.status}
                      </span>
                    </div>

                    {/* Turnout Stats */}
                    {isLoadingResults ? (
                      <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
                    ) : (
                      <>
                        {turnout && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2 rounded-2xl bg-[#0a0a0a] border border-white/10 p-6 relative overflow-hidden group">
                              <div className="absolute right-0 top-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[80px] group-hover:bg-cyan-500/10 transition-all"></div>
                              <h3 className="text-gray-400 text-sm uppercase tracking-wider font-bold mb-4 flex items-center gap-2">
                                <Icons.Chart /> {selectedElection.status === 'active' ? 'Live Turnout' : 'Final Participation Rate'}
                              </h3>
                              <div className="flex items-end gap-4 mb-4">
                                <span className="text-6xl md:text-7xl font-bold text-white tracking-tighter">{turnout.percentage}%</span>
                                <span className="text-gray-500 text-lg mb-2 font-medium">
                                  {selectedElection.status === 'active' ? 'Current' : 'Final'}
                                </span>
                              </div>
                              <div className="w-full bg-gray-800/50 h-3 rounded-full overflow-hidden border border-white/5">
                                <div
                                  className="h-full bg-linear-to-r from-blue-600 via-cyan-500 to-emerald-400 shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all duration-1000 ease-out rounded-full"
                                  style={{ width: `${turnout.percentage}%` }}
                                />
                              </div>
                            </div>
                            <div className="rounded-2xl bg-[#0a0a0a] border border-white/10 p-6 flex flex-col justify-center">
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

                        {/* Position Breakdown */}
                        <div className="space-y-6">
                          <h2 className="text-xl font-bold text-white flex items-center gap-3">
                            <span className="w-1 h-7 bg-purple-500 rounded-full"></span>
                            Position Breakdown
                          </h2>

                          {results.length === 0 ? (
                            <div className="text-center py-12 text-gray-500 bg-[#0a0a0a] rounded-2xl border border-white/10">
                              <p>No results data available for this election.</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 gap-6">
                              {results.map((position) => (
                                <div key={position.position_id} className="rounded-2xl bg-[#0a0a0a] border border-white/10 overflow-hidden hover:-translate-y-0.5 transition-all">
                                  <div className="bg-white/3 p-6 border-b border-white/5 flex justify-between items-center">
                                    <h3 className="text-lg font-bold text-blue-100">{position.position_title}</h3>
                                    <div className="text-xs font-mono text-gray-400 bg-black/30 px-3 py-1 rounded-lg border border-white/10">
                                      {position.total_votes} Total Votes
                                    </div>
                                  </div>
                                  <div className="p-6 space-y-5">
                                    {position.candidates
                                      .sort((a, b) => b.vote_count - a.vote_count)
                                      .map((candidate, index) => {
                                        const isWinner = index === 0 && position.total_votes > 0;
                                        return (
                                          <div key={candidate.candidate_id} className="relative group">
                                            <div className="flex justify-between items-center mb-2 relative z-10">
                                              <div className="flex items-center gap-4">
                                                <div className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm transition-all ${
                                                  isWinner
                                                    ? 'bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.5)] scale-110'
                                                    : 'bg-white/5 text-gray-500 border border-white/10 group-hover:bg-white/10'
                                                }`}>
                                                  {index + 1}
                                                </div>
                                                <div>
                                                  <span className={`font-bold text-lg transition-colors ${isWinner ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                                                    {candidate.candidate_name}
                                                  </span>
                                                  {isWinner && (
                                                    <span className="ml-3 text-[10px] uppercase font-bold text-yellow-500 tracking-wider inline-flex items-center gap-1">
                                                      <Icons.Trophy /> Winner
                                                    </span>
                                                  )}
                                                </div>
                                              </div>
                                              <div className="text-right">
                                                <span className="block font-mono font-bold text-lg">{candidate.percentage}%</span>
                                                <span className="text-xs text-gray-500">{candidate.vote_count} votes</span>
                                              </div>
                                            </div>
                                            <div className="h-2 bg-gray-800 rounded-full overflow-hidden relative">
                                              <div
                                                className={`h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden ${
                                                  isWinner ? 'bg-linear-to-r from-yellow-600 to-yellow-400' : 'bg-blue-600/40'
                                                }`}
                                                style={{ width: `${candidate.percentage}%` }}
                                              >
                                                <div className="absolute top-0 left-0 w-full h-full bg-linear-to-b from-white/20 to-transparent"></div>
                                              </div>
                                            </div>
                                            {isWinner && (
                                              <div className="absolute -inset-2 bg-yellow-500/5 rounded-xl blur-md z-0 opacity-50"></div>
                                            )}
                                          </div>
                                        );
                                      })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}