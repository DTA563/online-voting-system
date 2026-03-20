import { useState, useEffect } from 'react';
import { electionsApi, votesApi } from '../../api';
import { Election, PositionResult } from '../../types';

// --- Polished Icons ---
const Icons = {
  Trophy: (props: any) => <svg className={`w-4 h-4 ${props.className || ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
  Chart: (props: any) => <svg className={`w-5 h-5 ${props.className || ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  Lock: (props: any) => <svg className={`w-6 h-6 ${props.className || ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
  Users: (props: any) => <svg className={`w-5 h-5 ${props.className || ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Check: (props: any) => <svg className={`w-5 h-5 ${props.className || ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>,
  Archive: (props: any) => <svg className={`w-6 h-6 ${props.className || ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>,
  UserPlaceholder: (props: any) => <svg className={`w-6 h-6 ${props.className || ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
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
      const allElections = await electionsApi.getAll();
      const eligibleElections: Election[] = [];

      for (const election of allElections) {
        try {
          await votesApi.checkVoterStatus(election.election_id);
          eligibleElections.push(election);
        } catch (err) {
          // User not eligible, silently skip
        }
      }

      setElections(eligibleElections);
      
      const completed = eligibleElections.filter((e: Election) => e.status === 'completed');
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

  const globalStyles = (
    <style>{`
      @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      .animate-enter { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      @keyframes scan { 
        0% { transform: translateY(-100%); opacity: 0; } 
        50% { opacity: 1; }
        100% { transform: translateY(400%); opacity: 0; } 
      }
      .animate-scan { animation: scan 2.5s ease-in-out infinite; }
    `}</style>
  );

  if (isLoading) {
    return (
      <div className="font-sans animate-pulse max-w-4xl mx-auto p-4 md:p-8 space-y-8 mt-4">
        <div className="h-32 bg-card-hover rounded-3xl border border-border"></div>
        <div className="flex gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-10 w-32 rounded-full bg-card-hover border border-border"></div>)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-32 rounded-3xl bg-card-hover border border-border"></div>)}
        </div>
      </div>
    );
  }

  return (
    <>
      {globalStyles}
      <div className="text-primary font-sans selection:bg-accent-primary/30 min-h-screen pb-16">
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-10 mt-4">
          
          {/* Header Section */}
          <div className={`opacity-0 ${mounted ? 'animate-enter' : ''}`}>
            <div className="bg-card border border-border rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-64 h-64 bg-accent-primary/10 rounded-full blur-[80px] pointer-events-none"></div>
              
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card-hover border border-border text-accent text-[10px] uppercase tracking-widest font-bold mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_#22d3ee]"></span>
                  Live Archive
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 text-primary">
                  Election Results
                </h1>
                <p className="text-sm text-secondary max-w-xl">
                  Transparent, immutable final tallies for your completed elections.
                </p>
              </div>

              <div className="relative z-10 bg-card-hover border border-border rounded-2xl p-4 flex items-center gap-4 text-center">
                <div className="w-10 h-10 rounded-full bg-accent-primary/10 flex items-center justify-center text-accent shrink-0">
                  <Icons.Chart className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-2xl font-extrabold text-primary leading-none mb-1">
                    {completedElections.length}
                  </div>
                  <div className="text-xs text-secondary uppercase tracking-wider font-bold">Results Available</div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Flow */}
          <div className={`opacity-0 ${mounted ? 'animate-enter' : ''}`} style={{ animationDelay: '100ms' }}>
            {completedElections.length === 0 ? (
              
              /* --- System Diagnostic Empty State --- */
              <div className="bg-card border border-border rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl">
                <div className={`absolute -bottom-10 -right-10 w-48 h-48 rounded-full blur-[80px] pointer-events-none ${activeElections.length > 0 ? 'bg-accent-warning/10' : 'bg-accent-error/5'}`}></div>
                
                <div className="flex flex-col sm:flex-row items-start gap-6 relative z-10">
                  <div className="shrink-0 w-16 h-16 rounded-2xl bg-card-hover border border-border flex items-center justify-center relative overflow-hidden shadow-inner">
                    <div className="absolute top-0 left-0 w-full h-1 bg-accent-primary/50 shadow-[0_0_10px_#06b6d4] animate-scan"></div>
                    {activeElections.length > 0 ? <Icons.Lock className="w-8 h-8 text-accent-warning/80" /> : <Icons.Archive className="w-8 h-8 icon-secondary" />}
                  </div>

                  <div className="flex-1 w-full">
                    <h2 className="text-2xl font-extrabold text-primary tracking-tight mb-2">
                      {activeElections.length > 0 ? 'Results Sealed' : 'No Results Available'}
                    </h2>
                    <p className="text-sm text-secondary leading-relaxed mb-6">
                      {activeElections.length > 0 
                        ? 'Cryptographic tallies are strictly locked while elections remain active to ensure integrity.'
                        : 'You are not currently registered for any completed elections with published results.'}
                    </p>

                    <div className="space-y-3 bg-secondary p-4 rounded-xl border border-border font-mono">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-tertiary">Active_Elections</span>
                        <span className="text-accent font-bold">{activeElections.length} RUNNING</span>
                      </div>
                      <div className="h-px w-full bg-border"></div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-tertiary">Data_Status</span>
                        {activeElections.length > 0 ? (
                          <span className="text-accent-warning/90 font-bold bg-accent-warning/10 px-2 py-0.5 rounded flex items-center gap-1.5">
                            <Icons.Lock className="w-3 h-3" /> ENCRYPTED
                          </span>
                        ) : (
                          <span className="text-accent-error/90 font-bold bg-accent-error/10 px-2 py-0.5 rounded">
                            0 RECORDS
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            ) : (
              <div className="space-y-8">

                {/* Seamless Election Selector */}
                <div className="pb-2">
                  <div className="block md:hidden mb-4 relative">
                    <select
                      className="w-full bg-card border border-border p-3.5 pr-10 rounded-2xl text-primary font-semibold text-sm focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary appearance-none cursor-pointer"
                      value={selectedElection?.election_id || ''}
                      onChange={(e) => {
                        const selected = completedElections.find(el => el.election_id === Number(e.target.value));
                        if (selected) handleSelectElection(selected);
                      }}
                    >
                      <option value="" disabled>Select an Election</option>
                      {completedElections.map(election => (
                        <option key={election.election_id} value={election.election_id}>
                          {election.title}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-secondary">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>

                  <div className="hidden md:flex flex-wrap gap-3">
                    {completedElections.map(election => {
                      const isSelected = selectedElection?.election_id === election.election_id;
                      return (
                        <button
                          key={election.election_id}
                          onClick={() => handleSelectElection(election)}
                          className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 border ${
                            isSelected 
                              ? 'bg-accent-primary/10 text-accent border-accent-primary/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
                              : 'bg-card text-secondary border-border hover:border-border-medium hover:text-primary'
                          }`}
                        >
                          {election.title}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Election Content */}
                {selectedElection && (
                  <div className="space-y-8 animate-enter">
                    
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-primary tracking-wide">{selectedElection.title}</h2>
                        <p className="text-sm text-secondary mt-1">
                          Concluded on {new Date(selectedElection.end_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    {isLoadingResults ? (
                      <div className="h-64 rounded-3xl bg-card-hover border border-border animate-pulse"></div>
                    ) : (
                      <>
                        {/* Metric Dashboard */}
                        {turnout && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                            
                            {/* Final Turnout Metric */}
                            <div className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden group">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-accent-primary/5 rounded-full blur-[40px] group-hover:bg-accent-primary/10 transition-colors"></div>
                              <div className="relative z-10">
                                <p className="text-xs font-bold uppercase tracking-wider text-tertiary mb-2 flex items-center gap-2">
                                  <Icons.Chart className="w-4 h-4" /> Final Turnout
                                </p>
                                <div className="text-4xl font-extrabold text-primary tracking-tighter">
                                  {turnout.percentage}<span className="text-2xl text-tertiary">%</span>
                                </div>
                              </div>
                              <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-accent-secondary to-accent-primary" style={{ width: `${turnout.percentage}%` }}></div>
                            </div>

                            {/* Votes Cast */}
                            <div className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden group">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-accent-success/5 rounded-full blur-[40px] group-hover:bg-accent-success/10 transition-colors"></div>
                              <p className="text-xs font-bold uppercase tracking-wider text-tertiary mb-2 flex items-center gap-2">
                                <Icons.Users className="w-4 h-4" /> Total Votes Cast
                              </p>
                              <div className="text-3xl font-bold text-primary">
                                {turnout.voted.toLocaleString()}
                              </div>
                            </div>

                            {/* Eligible Voters */}
                            <div className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden group">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-card-hover rounded-full blur-[40px] group-hover:bg-card-hover transition-colors"></div>
                              <p className="text-xs font-bold uppercase tracking-wider text-tertiary mb-2">
                                Total Eligible Voters
                              </p>
                              <div className="text-3xl font-bold text-secondary">
                                {turnout.total.toLocaleString()}
                              </div>
                            </div>

                          </div>
                        )}

                        {/* Positions & Results Grid */}
                        <div className="space-y-8 mt-4">
                          {results.length === 0 ? (
                            <div className="bg-card border border-border rounded-2xl p-12 text-center text-tertiary text-sm">
                              No candidate data available for this election.
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 gap-8">
                              {results.map((position) => (
                                <div key={position.position_id} className="bg-card border border-border rounded-3xl overflow-hidden shadow-lg">
                                  
                                  <div className="px-6 py-5 flex justify-between items-center bg-card-hover border-b border-border">
                                    <h3 className="text-lg font-bold text-primary">{position.position_title}</h3>
                                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-secondary border border-border text-secondary tracking-wider uppercase">
                                      {position.total_votes.toLocaleString()} Votes
                                    </span>
                                  </div>

                                  <div className="p-4 sm:p-6 space-y-4">
                                    {position.candidates
                                      // The backend already sorted this, but doing it again guarantees UI matches
                                      .sort((a, b) => b.vote_count - a.vote_count)
                                      .map((candidate, index) => {
                                        // UPDATED LOGIC: Account for is_tie
                                        const isWinner = index === 0 && position.total_votes > 0 && !position.is_tie;
                                        const isTied = position.is_tie && (index === 0 || index === 1) && position.total_votes > 0;
                                        
                                        return (
                                          <div key={candidate.candidate_id} className={`relative p-4 rounded-2xl border transition-all ${
                                            isWinner ? 'bg-accent-warning/5 border-accent-warning/30 shadow-[0_0_20px_rgba(245,158,11,0.05)]' : 
                                            isTied ? 'bg-blue-500/10 border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.05)]' :
                                            'bg-card-hover border-border'
                                          }`}>
                                            <div className="flex justify-between items-center mb-4">
                                              
                                              <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold shrink-0 border-2 ${
                                                  isWinner ? 'bg-accent-warning/20 text-accent-warning border-accent-warning shadow-lg shadow-accent-warning/20' : 
                                                  isTied ? 'bg-blue-500/20 text-blue-400 border-blue-500 shadow-lg shadow-blue-500/20' :
                                                  'bg-card-hover text-tertiary border-border'
                                                }`}>
                                                  {isWinner || isTied ? <Icons.Trophy /> : <Icons.UserPlaceholder className="w-5 h-5" />}
                                                </div>
                                                
                                                <div>
                                                  <div className={`font-bold text-base sm:text-lg leading-tight ${isWinner || isTied ? 'text-primary' : 'text-secondary'}`}>
                                                    {candidate.candidate_name}
                                                  </div>
                                                  {isWinner && (
                                                    <div className="text-[10px] font-bold text-accent-warning uppercase tracking-widest mt-1">
                                                      Elected Winner
                                                    </div>
                                                  )}
                                                  {isTied && (
                                                    <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1">
                                                      Tied - Runoff Required
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                              
                                              <div className="text-right pl-4">
                                                <div className="font-extrabold text-xl sm:text-2xl leading-none text-primary">
                                                  {candidate.percentage}%
                                                </div>
                                                <div className="text-xs font-medium mt-1 text-secondary">
                                                  {candidate.vote_count.toLocaleString()} <span className="hidden sm:inline">votes</span>
                                                </div>
                                              </div>
                                            </div>

                                            <div className="h-1.5 rounded-full overflow-hidden w-full bg-secondary border border-border">
                                              <div
                                                className={`h-full rounded-full transition-all duration-1000 ease-out ${
                                                  isWinner ? 'bg-gradient-to-r from-accent-warning to-yellow-300' : 
                                                  isTied ? 'bg-gradient-to-r from-blue-600 to-blue-400' :
                                                  'bg-gradient-to-r from-accent-secondary to-accent-primary opacity-70'
                                                }`}
                                                style={{ width: `${candidate.percentage}%` }}
                                              />
                                            </div>
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