import { useState, useEffect } from 'react';
import { electionsApi, votesApi } from '../../api';
import { Election, PositionResult } from '../../types';

// --- Icons ---
const Icons = {
  Trophy: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
  Chart: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  Lock: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
  Users: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
};

export function VoterResultsPage() {
  const [elections, setElections] = useState<Election[]>([]);
  const [selectedElection, setSelectedElection] = useState<Election | null>(null);
  const [results, setResults] = useState<PositionResult[]>([]);
  const [turnout, setTurnout] = useState<{ total: number; voted: number; percentage: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    loadElections();
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const loadElections = async () => {
    try {
      const data = await electionsApi.getAll();
      setElections(data);
      const completed = data.filter((e: Election) => e.status === 'completed');
      if (completed.length > 0) {
        handleSelectElection(completed[0]);
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

  // --- Loading Skeleton ---
  if (isLoading) {
    return (
      <div className="font-sans animate-pulse">
        <div className="p-5 md:p-8 space-y-5 pb-16">
          {/* Header skeleton */}
          <div className="rounded-2xl p-6 md:p-8" style={{ backgroundColor: 'var(--v-card)', border: '1px solid var(--v-border)' }}>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-3">
                <div className="h-8 w-56 rounded-xl" style={{ backgroundColor: 'var(--v-hover)' }}></div>
                <div className="h-4 w-80 rounded-lg" style={{ backgroundColor: 'var(--v-hover)' }}></div>
              </div>
              <div className="h-16 w-24 rounded-xl" style={{ backgroundColor: 'var(--v-hover)' }}></div>
            </div>
          </div>
          {/* Selector skeleton */}
          <div className="rounded-2xl p-5" style={{ backgroundColor: 'var(--v-card)', border: '1px solid var(--v-border)' }}>
            <div className="h-3 w-20 rounded mb-3" style={{ backgroundColor: 'var(--v-hover)' }}></div>
            <div className="flex gap-3">
              {[1, 2].map(i => <div key={i} className="h-10 w-36 rounded-xl" style={{ backgroundColor: 'var(--v-hover)' }}></div>)}
            </div>
          </div>
          {/* Turnout skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="md:col-span-2 rounded-2xl p-6" style={{ backgroundColor: 'var(--v-card)', border: '1px solid var(--v-border)' }}>
              <div className="h-4 w-32 rounded mb-4" style={{ backgroundColor: 'var(--v-hover)' }}></div>
              <div className="h-16 w-40 rounded-xl mb-4" style={{ backgroundColor: 'var(--v-hover)' }}></div>
              <div className="h-3 w-full rounded-full" style={{ backgroundColor: 'var(--v-hover)' }}></div>
            </div>
            <div className="rounded-2xl p-6" style={{ backgroundColor: 'var(--v-card)', border: '1px solid var(--v-border)' }}>
              <div className="space-y-6">
                <div><div className="h-3 w-20 rounded mb-2" style={{ backgroundColor: 'var(--v-hover)' }}></div><div className="h-8 w-16 rounded" style={{ backgroundColor: 'var(--v-hover)' }}></div></div>
                <div className="h-px" style={{ backgroundColor: 'var(--v-border)' }}></div>
                <div><div className="h-3 w-24 rounded mb-2" style={{ backgroundColor: 'var(--v-hover)' }}></div><div className="h-8 w-16 rounded" style={{ backgroundColor: 'var(--v-hover)' }}></div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans">
      <div className="p-5 md:p-8 space-y-5 pb-16">

        {/* Header Card */}
        <div className={`transform transition-all duration-700 ease-out ${mounted ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'}`}>
          <div className="rounded-2xl p-6 md:p-8" style={{ backgroundColor: 'var(--v-card)', border: '1px solid var(--v-border)' }}>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight mb-1">
                  <span className="bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    Election Results
                  </span>
                </h1>
                <p className="text-sm" style={{ color: 'var(--v-text-2)' }}>
                  View final tallies for completed elections. Results are published after the election ends.
                </p>
              </div>

              <div className="flex gap-3">
                <div className="px-5 py-2.5 rounded-xl flex flex-col items-end" style={{ backgroundColor: 'var(--v-hover)', border: '1px solid var(--v-border)' }}>
                  <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Completed</span>
                  <span className="font-mono text-xl font-bold leading-none mt-1" style={{ color: 'var(--v-text)' }}>{completedElections.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className={`transform transition-all duration-700 ease-out ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
             style={{ transitionDelay: '150ms' }}>
          {completedElections.length === 0 ? (
            /* --- Empty State --- */
            <div className="rounded-2xl border-dashed p-16 flex flex-col items-center justify-center text-center" style={{ backgroundColor: 'var(--v-card)', border: '2px dashed var(--v-border)' }}>
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: 'var(--v-hover)', color: 'var(--v-text-3)' }}>
                <Icons.Lock />
              </div>
              <h3 className="font-bold text-lg" style={{ color: 'var(--v-text)' }}>No Results Available</h3>
              <p className="text-sm mt-2 max-w-md" style={{ color: 'var(--v-text-3)' }}>
                Results will appear here once an election has been completed.
                {activeElections.length > 0 && ` There ${activeElections.length === 1 ? 'is' : 'are'} ${activeElections.length} active election${activeElections.length > 1 ? 's' : ''} currently running.`}
                {upcomingElections.length > 0 && ` ${upcomingElections.length} upcoming.`}
              </p>
            </div>
          ) : (
            <div className="space-y-5">

              {/* Election Selector Pills */}
              <div className="rounded-2xl p-5" style={{ backgroundColor: 'var(--v-card)', border: '1px solid var(--v-border)' }}>
                <p className="text-[10px] uppercase tracking-widest font-bold mb-3" style={{ color: 'var(--v-text-3)' }}>Select Election</p>
                <div className="flex flex-wrap gap-3">
                  {completedElections.map(election => (
                    <button
                      key={election.election_id}
                      onClick={() => handleSelectElection(election)}
                      className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                        selectedElection?.election_id === election.election_id
                          ? 'bg-cyan-600/20 border border-cyan-500 text-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.12)]'
                          : ''
                      }`}
                      style={selectedElection?.election_id !== election.election_id ? { backgroundColor: 'var(--v-hover)', border: '1px solid var(--v-border)', color: 'var(--v-text-2)' } : undefined}
                    >
                      {election.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Election Results */}
              {selectedElection && (
                <div className="space-y-5">

                  {/* Election Info Bar */}
                  <div className="rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4" style={{ backgroundColor: 'var(--v-card)', border: '1px solid var(--v-border)' }}>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--v-text-3)' }}></span>
                        <span className="text-xs uppercase tracking-widest font-bold" style={{ color: 'var(--v-text-3)' }}>Final Results</span>
                      </div>
                      <h2 className="text-2xl font-extrabold">
                        <span className="bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                          {selectedElection.title}
                        </span>
                      </h2>
                      <p className="text-sm mt-1 font-mono" style={{ color: 'var(--v-text-3)' }}>
                        Ended: {new Date(selectedElection.end_date).toLocaleDateString()} at {new Date(selectedElection.end_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <span className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest" style={{ backgroundColor: 'var(--v-hover)', color: 'var(--v-text-3)', border: '1px solid var(--v-border)' }}>
                      Completed
                    </span>
                  </div>

                  {/* Turnout & Results */}
                  {isLoadingResults ? (
                    <div className="space-y-5 animate-pulse">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="md:col-span-2 rounded-2xl p-6" style={{ backgroundColor: 'var(--v-card)', border: '1px solid var(--v-border)' }}>
                          <div className="h-4 w-32 rounded mb-4" style={{ backgroundColor: 'var(--v-hover)' }}></div>
                          <div className="h-16 w-40 rounded-xl mb-4" style={{ backgroundColor: 'var(--v-hover)' }}></div>
                          <div className="h-3 w-full rounded-full" style={{ backgroundColor: 'var(--v-hover)' }}></div>
                        </div>
                        <div className="rounded-2xl p-6" style={{ backgroundColor: 'var(--v-card)', border: '1px solid var(--v-border)' }}>
                          <div className="space-y-6"><div><div className="h-3 w-20 rounded mb-2" style={{ backgroundColor: 'var(--v-hover)' }}></div><div className="h-8 w-16 rounded" style={{ backgroundColor: 'var(--v-hover)' }}></div></div><div className="h-px" style={{ backgroundColor: 'var(--v-border)' }}></div><div><div className="h-3 w-24 rounded mb-2" style={{ backgroundColor: 'var(--v-hover)' }}></div><div className="h-8 w-16 rounded" style={{ backgroundColor: 'var(--v-hover)' }}></div></div></div>
                        </div>
                      </div>
                      {[1, 2].map(i => (
                        <div key={i} className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--v-card)', border: '1px solid var(--v-border)' }}>
                          <div className="p-5" style={{ backgroundColor: 'var(--v-hover)' }}><div className="h-5 w-40 rounded" style={{ backgroundColor: 'var(--v-border)' }}></div></div>
                          <div className="p-5 space-y-4">{[1,2,3].map(j => (<div key={j}><div className="flex justify-between mb-2"><div className="h-4 w-32 rounded" style={{ backgroundColor: 'var(--v-hover)' }}></div><div className="h-4 w-12 rounded" style={{ backgroundColor: 'var(--v-hover)' }}></div></div><div className="h-2 rounded-full" style={{ backgroundColor: 'var(--v-hover)' }}></div></div>))}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      {/* Voter Turnout Section */}
                      {turnout && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                          {/* Participation Rate Card */}
                          <div className="md:col-span-2 rounded-2xl p-6 group" style={{ backgroundColor: 'var(--v-card)', border: '1px solid var(--v-border)' }}>
                            <h3 className="text-sm uppercase tracking-wider font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--v-text-2)' }}>
                              <Icons.Chart /> Voter Turnout
                            </h3>
                            <div className="flex items-end gap-4 mb-4">
                              <span className="text-6xl md:text-7xl font-bold tracking-tighter">
                                <span className="bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">{turnout.percentage}%</span>
                              </span>
                              <span className="text-lg mb-2 font-medium" style={{ color: 'var(--v-text-3)' }}>Final</span>
                            </div>
                            <div className="w-full h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--v-hover)', border: '1px solid var(--v-border)' }}>
                              <div
                                className="h-full bg-linear-to-r from-blue-600 via-cyan-500 to-emerald-400 transition-all duration-1000 ease-out rounded-full"
                                style={{ width: `${turnout.percentage}%` }}
                              />
                            </div>
                          </div>

                          {/* Votes Cast / Total Eligible Card */}
                          <div className="rounded-2xl p-6 flex flex-col justify-center" style={{ backgroundColor: 'var(--v-card)', border: '1px solid var(--v-border)' }}>
                            <div className="space-y-6">
                              <div>
                                <p className="text-xs uppercase tracking-wider mb-1 flex items-center gap-2" style={{ color: 'var(--v-text-3)' }}>
                                  <Icons.Users /> Votes Cast
                                </p>
                                <p className="text-3xl font-mono" style={{ color: 'var(--v-text)' }}>{turnout.voted.toLocaleString()}</p>
                              </div>
                              <div className="w-full h-px" style={{ backgroundColor: 'var(--v-border)' }}></div>
                              <div>
                                <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--v-text-3)' }}>Total Eligible</p>
                                <p className="text-3xl font-mono" style={{ color: 'var(--v-text-2)' }}>{turnout.total.toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Position Breakdown */}
                      <div className="space-y-5">
                        <h2 className="text-xl font-bold flex items-center gap-3" style={{ color: 'var(--v-text)' }}>
                          <span className="w-1 h-7 bg-linear-to-b from-blue-500 to-cyan-400 rounded-full"></span>
                          Position Breakdown
                        </h2>

                        {results.length === 0 ? (
                          <div className="rounded-2xl p-12 text-center" style={{ backgroundColor: 'var(--v-card)', border: '1px solid var(--v-border)', color: 'var(--v-text-3)' }}>
                            <p>No results data available for this election.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 gap-5">
                            {results.map((position) => (
                              <div key={position.position_id} className="rounded-2xl overflow-hidden hover:-translate-y-0.5 transition-all" style={{ backgroundColor: 'var(--v-card)', border: '1px solid var(--v-border)' }}>
                                {/* Position Header */}
                                <div className="p-5 border-b flex justify-between items-center" style={{ borderColor: 'var(--v-border)', backgroundColor: 'var(--v-hover)' }}>
                                  <h3 className="text-lg font-bold" style={{ color: 'var(--v-text)' }}>{position.position_title}</h3>
                                  <div className="text-xs font-mono px-3 py-1 rounded-lg" style={{ color: 'var(--v-text-2)', backgroundColor: 'var(--v-bg)', border: '1px solid var(--v-border)' }}>
                                    {position.total_votes} Total Votes
                                  </div>
                                </div>

                                {/* Candidate Bars */}
                                <div className="p-5 space-y-5">
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
                                                  ? 'bg-yellow-500 text-black shadow-[0_0_12px_rgba(234,179,8,0.4)] scale-110'
                                                  : ''
                                              }`} style={!isWinner ? { backgroundColor: 'var(--v-hover)', color: 'var(--v-text-3)', border: '1px solid var(--v-border)' } : undefined}>
                                                {index + 1}
                                              </div>
                                              <div>
                                                <span className="font-bold text-lg" style={{ color: isWinner ? 'var(--v-text)' : 'var(--v-text-2)' }}>
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
                                              <span className="block font-mono font-bold text-lg" style={{ color: 'var(--v-text)' }}>{candidate.percentage}%</span>
                                              <span className="text-xs" style={{ color: 'var(--v-text-3)' }}>{candidate.vote_count} votes</span>
                                            </div>
                                          </div>
                                          <div className="h-2 rounded-full overflow-hidden relative" style={{ backgroundColor: 'var(--v-hover)' }}>
                                            <div
                                              className={`h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden ${
                                                isWinner ? 'bg-linear-to-r from-yellow-600 to-yellow-400' : 'bg-cyan-600/40'
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

        {/* Footer */}
        <div className="text-center pt-4">
          <p className="text-[10px] font-mono uppercase tracking-widest opacity-50" style={{ color: 'var(--v-text-3)' }}>
            SmartBallot • Secure Election Results
          </p>
        </div>
      </div>
    </div>
  );
}
