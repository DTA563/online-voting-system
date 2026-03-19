import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';import { io } from 'socket.io-client';import { electionsApi, votesApi } from '../../api';
import { Election, Position, Candidate, VoteSubmission } from '../../types';

const SERVER_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5001/api').replace('/api', '');

// --- Icons (Updated to accept props for scaling/styling) ---
const Icons = {
  Check: (props: any) => <svg className={`w-5 h-5 ${props.className || ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>,
  User: (props: any) => <svg className={`w-6 h-6 ${props.className || ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  Spinner: (props: any) => <svg className={`w-5 h-5 animate-spin ${props.className || ''}`} fill="none" viewBox="0 0 24 24" {...props}><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>,
  Alert: (props: any) => <svg className={`w-5 h-5 ${props.className || ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
  ChevronRight: (props: any) => <svg className={`w-5 h-5 ${props.className || ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>,
  RadioUnchecked: (props: any) => <svg className={`w-6 h-6 icon-secondary ${props.className || ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><circle cx="12" cy="12" r="9" strokeWidth="2" /></svg>,
  RadioChecked: (props: any) => <svg className={`w-6 h-6 text-accent ${props.className || ''}`} fill="currentColor" viewBox="0 0 24 24" {...props}><circle cx="12" cy="12" r="9" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="12" r="4" /></svg>
};

export function VotingBoothPage() {
  const [eligibleElections, setEligibleElections] = useState<Election[]>([]);
  const [votedElectionIds, setVotedElectionIds] = useState<number[]>([]);
  
  const [selectedElection, setSelectedElection] = useState<Election | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [candidatesByPosition, setCandidatesByPosition] = useState<Record<number, Candidate[]>>({});
  const [selectedCandidates, setSelectedCandidates] = useState<Record<number, number>>({});
  const [turnouts, setTurnouts] = useState<Record<number, { total: number; voted: number; percentage: number }>>({});
  
  const [hasVoted, setHasVoted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [showEmptyState, setShowEmptyState] = useState(false);
  const [emptyStateMounted, setEmptyStateMounted] = useState(false);
  const [votedViewMounted, setVotedViewMounted] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (hasVoted && !isLoading) {
       // Reset first to ensure animation plays if state changes quickly
       setVotedViewMounted(false);
       const timer = setTimeout(() => setVotedViewMounted(true), 100);
       return () => clearTimeout(timer);
    } else {
       setVotedViewMounted(false);
    }
  }, [hasVoted, isLoading]);

  useEffect(() => {
    loadEligibleElections();
    const timer = setTimeout(() => setMounted(true), 50);
    
    // Set up socket listener for live turnout updates
    const socket = io(SERVER_URL);
    socket.on('turnout_update', async (data: { election_id: number }) => {
      try {
        const newTurnout = await votesApi.getTurnout(data.election_id);
        setTurnouts(prev => ({ ...prev, [data.election_id]: newTurnout }));
      } catch (err) {
        console.error('Failed to fetch updated turnout', err);
      }
    });

    return () => {
      clearTimeout(timer);
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    // Add a small delay before showing empty state to prevent glitch
    if (!isLoading && eligibleElections.length === 0) {
      const timer = setTimeout(() => {
        setShowEmptyState(true);
        // Trigger animation after empty state is shown
        setTimeout(() => setEmptyStateMounted(true), 50);
      }, 150);
      return () => clearTimeout(timer);
    } else {
      setShowEmptyState(false);
      setEmptyStateMounted(false);
    }
  }, [isLoading, eligibleElections.length]);

  const loadEligibleElections = async () => {
    try {
      const [allElections] = await Promise.all([
        electionsApi.getAll(), 
        new Promise(resolve => setTimeout(resolve, 500)) // Min loading time to prevent flash
      ]);

      const activeElections = allElections.filter((e: Election) => {
        if (!e.start_date || !e.end_date) return false;
        const now = new Date();
        return now >= new Date(e.start_date) && now <= new Date(e.end_date);
      });

      const eligible: Election[] = [];
      const votedIds: number[] = [];
      const turnoutsMap: Record<number, { total: number; voted: number; percentage: number }> = {};

      for (const election of activeElections) {
        try {
          const status = await votesApi.checkVoterStatus(election.election_id);
          eligible.push(election);
          if (status.has_voted) {
            votedIds.push(election.election_id);
          }
          // Fetch initial turnout
          const turnout = await votesApi.getTurnout(election.election_id);
          turnoutsMap[election.election_id] = turnout;
        } catch (err) {
          console.log(`User not eligible for election ID: ${election.election_id}`);
        }
      }

      setEligibleElections(eligible);
      setVotedElectionIds(votedIds);
      setTurnouts(turnoutsMap);

      if (eligible.length === 1) {
        await handleSelectElection(eligible[0], votedIds.includes(eligible[0].election_id));
      } else {
        setIsLoading(false);
      }
    } catch (err) {
      setError('Failed to load active elections. Please refresh.');
      console.error(err);
      setIsLoading(false);
    }
  };

  const handleSelectElection = async (election: Election, userHasVoted: boolean) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsLoading(true);
    setSelectedElection(election);
    setHasVoted(userHasVoted);

    if (!userHasVoted) {
      try {
        const electionPositions = await electionsApi.getPositions(election.election_id);
        setPositions(electionPositions);

        const candidatesMap: Record<number, Candidate[]> = {};
        for (const position of electionPositions) {
          const candidates = await electionsApi.getCandidates(position.position_id);
          candidatesMap[position.position_id] = candidates;
        }
        setCandidatesByPosition(candidatesMap);
      } catch (err) {
        setError('Failed to load ballot data. Please try again.');
        console.error(err);
      }
    }
    
    setTimeout(() => setIsLoading(false), 300);
  };

  const handleSelectCandidate = (positionId: number, candidateId: number) => {
    setSelectedCandidates(prev => ({ ...prev, [positionId]: candidateId }));
  };

  const handleSubmitVote = async () => {
    if (!selectedElection) return;

    const missingPositions = positions.filter(p => !selectedCandidates[p.position_id]);
    if (missingPositions.length > 0) {
      setError(`Please make a selection for: ${missingPositions.map(p => p.title).join(', ')}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const voteSubmission: VoteSubmission = {
        election_id: selectedElection.election_id,
        votes: Object.entries(selectedCandidates).map(([positionId, candidateId]) => ({
          position_id: Number(positionId),
          candidate_id: candidateId,
        })),
      };

      await votesApi.castVote(voteSubmission);
      navigate('/vote/success');
    } catch (err) {
      setError('Failed to submit vote. Please try again.');
      setIsSubmitting(false);
    }
  };

  const selectionProgress = positions.length > 0 ? (Object.keys(selectedCandidates).length / positions.length) * 100 : 0;

  // --- Shared Animations ---
  const globalStyles = (
    <style>{`
      @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      .animate-enter { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      @keyframes slideUpFancy { 
        0% { transform: translateY(30px) scale(0.95); opacity: 0; } 
        60% { transform: translateY(-5px) scale(1.01); opacity: 0.8; }
        100% { transform: translateY(0) scale(1); opacity: 1; } 
      }
      .animate-enter-fancy { animation: slideUpFancy 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
      @keyframes scan { 
        0% { transform: translateY(-100%); opacity: 0; } 
        50% { opacity: 1; }
        100% { transform: translateY(400%); opacity: 0; } 
      }
      .animate-scan { animation: scan 2.5s ease-in-out infinite; }
    `}</style>
  );

  // --- Loading Skeleton (Results Page Style) ---
  if (isLoading) {
    return (
      <div className="p-6 lg:p-10 space-y-6 animate-pulse max-w-4xl mx-auto mt-10">
        <div className="h-32 bg-card-hover rounded-3xl border border-border mb-10"></div>
        {[1, 2].map(i => (
          <div key={i} className="space-y-3">
            <div className="h-8 w-1/3 bg-card-hover rounded-lg mb-4"></div>
            <div className="h-20 bg-card-hover rounded-2xl border border-border"></div>
            <div className="h-20 bg-card-hover rounded-2xl border border-border"></div>
          </div>
        ))}
      </div>
    );
  }

  // --- No Eligible Elections State (Dashboard Diagnostic Style) ---
  if (eligibleElections.length === 0) {
    // Don't render empty state immediately, wait for showEmptyState
    if (!showEmptyState) {
      return (
        <div className="p-6 lg:p-10 space-y-6 max-w-4xl mx-auto mt-10">
          <div className="h-32 bg-card-hover rounded-3xl border border-border mb-10 opacity-50"></div>
          {[1, 2].map(i => (
            <div key={i} className="space-y-3 opacity-50">
              <div className="h-8 w-1/3 bg-card-hover rounded-lg mb-4"></div>
              <div className="h-20 bg-card-hover rounded-2xl border border-border"></div>
              <div className="h-20 bg-card-hover rounded-2xl border border-border"></div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <>
        {globalStyles}
        <div className="flex-1 flex items-center justify-center p-6 min-h-[80vh]">
          <div className={`w-full max-w-lg mx-auto transform transition-all duration-700 ease-out ${emptyStateMounted ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'}`}>
            
            <div className="bg-card border border-border rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl animate-enter-fancy">
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-accent-error/5 rounded-full blur-[80px] pointer-events-none"></div>
              
              <div className="flex flex-col sm:flex-row items-start gap-6 relative z-10">
                
                {/* Dashboard-style Icon Container */}
                <div className="shrink-0 w-16 h-16 rounded-2xl bg-card-hover border border-border flex items-center justify-center relative overflow-hidden shadow-inner">
                   {/* Tech scanner effect */}
                   <div className="absolute top-0 left-0 w-full h-1 bg-accent-primary/50 shadow-[0_0_10px_#06b6d4] animate-scan"></div>
                   
                   <svg className="w-8 h-8 icon-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                   </svg>
                </div>

                {/* Content */}
                <div className="flex-1 w-full">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card-hover border border-border text-secondary text-[10px] uppercase tracking-widest font-bold mb-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                    System Status
                  </div>
                  
                  <h2 className="text-2xl font-extrabold text-primary tracking-tight mb-2">No Active Ballots</h2>
                  <p className="text-sm text-secondary leading-relaxed mb-6">
                    Our system has scanned current election databases. You are either not registered on any active voter rolls, or your eligible elections have concluded.
                  </p>

                  {/* Diagnostic Output Log */}
                  <div className="space-y-3 bg-secondary p-4 rounded-xl border border-border font-mono">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-tertiary">User_Authentication</span>
                      <span className="text-accent-success flex items-center gap-1.5">
                        <Icons.Check className="w-3.5 h-3.5" />
                        OK
                      </span>
                    </div>
                    <div className="h-px w-full bg-border"></div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-tertiary">Database_Connection</span>
                      <span className="text-accent-success flex items-center gap-1.5">
                        <Icons.Check className="w-3.5 h-3.5" />
                        OK
                      </span>
                    </div>
                    <div className="h-px w-full bg-border"></div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-tertiary">Voter_Roll_Match</span>
                      <span className="text-accent-error/90 font-bold bg-accent-error/10 px-2 py-0.5 rounded">
                        0 RECORDS
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                     <button onClick={() => window.location.reload()} className="text-sm text-accent hover:text-accent-primary font-medium transition-colors flex items-center gap-2 group">
                       <Icons.Spinner className="w-4 h-4 opacity-50 group-hover:opacity-100" /> Re-run Scan
                     </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // --- Election Selection View ---
  if (!selectedElection && eligibleElections.length > 1) {
    return (
      <>
        {globalStyles}
        <div className="max-w-6xl mx-auto p-6 space-y-8 mt-6">
          <div className={`space-y-2 mb-8 opacity-0 ${mounted ? 'animate-enter' : ''}`}>
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-primary/10 border border-accent-primary/20 text-accent text-[10px] uppercase tracking-widest font-bold mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
                Action Required
             </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-primary">Select Election</h1>
            <p className="text-secondary max-w-2xl">You are eligible to vote in multiple active elections. Choose one to begin your ballot.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eligibleElections.map((election, index) => {
              const alreadyVoted = votedElectionIds.includes(election.election_id);
              return (
                <button
                  key={election.election_id}
                  onClick={() => handleSelectElection(election, alreadyVoted)}
                  className={`relative overflow-hidden opacity-0 ${mounted ? 'animate-enter' : ''} text-left flex flex-col justify-between p-6 rounded-3xl border transition-all duration-300 group h-full ${
                    alreadyVoted 
                      ? 'bg-card/50 border-border opacity-75 hover:opacity-100 hover:bg-card' 
                      : 'bg-card border-border hover:border-accent-primary/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] hover:-translate-y-1'
                  }`}
                  style={{ animationDelay: `${(index + 1) * 100}ms` }}
                >
                  {/* Decorative Gradient Background on Hover (for active) */}
                  {!alreadyVoted && (
                    <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  )}

                  <div className="relative z-10 w-full mb-6">
                    <div className="flex items-start justify-between mb-4">
                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${alreadyVoted ? 'bg-accent-success/10 text-accent-success' : 'bg-accent-primary/10 text-accent-primary group-hover:bg-accent-primary group-hover:text-white'}`}>
                          {alreadyVoted ? <Icons.Check className="w-6 h-6" /> : <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
                       </div>
                       {alreadyVoted ? (
                           <span className="px-3 py-1 rounded-full bg-accent-success/10 text-accent-success text-xs font-bold border border-accent-success/20">
                             VOTED
                           </span>
                       ) : (
                           <span className="px-3 py-1 rounded-full bg-accent-primary/10 text-accent-primary text-xs font-bold border border-accent-primary/20 group-hover:bg-accent-primary group-hover:text-white transition-colors flex items-center gap-1.5">
                             <div className="w-1.5 h-1.5 bg-accent-primary group-hover:bg-white rounded-full animate-pulse"></div> OPEN
                           </span>
                       )}
                    </div>
                    
                    <h3 className="text-xl font-bold text-primary group-hover:text-accent-primary transition-colors line-clamp-2 mb-2">{election.title}</h3>
                    
                    {/* Live Turnout Display */}
                    {turnouts[election.election_id] && (
                      <div className="mb-3 px-3 py-2 bg-card-hover rounded-xl border border-border flex items-center justify-between">
                        <span className="text-xs text-secondary font-medium uppercase tracking-wider">Live Turnout</span>
                        <span className="text-sm font-bold text-primary">{turnouts[election.election_id].percentage}%</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-tertiary">
                         <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                         <p>Closes {new Date(election.end_date).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="relative z-10 w-full pt-4 border-t border-border/50 flex items-center justify-between group-hover:border-accent-primary/20 transition-colors">
                    <span className={`text-sm font-medium transition-colors ${alreadyVoted ? 'text-accent-success' : 'text-accent-primary'}`}>
                        {alreadyVoted ? 'Ballot Submitted' : 'Vote Now'}
                    </span>
                    <Icons.ChevronRight className={`w-5 h-5 transition-transform duration-300 ${alreadyVoted ? 'text-accent-success/50' : 'text-accent-primary group-hover:translate-x-1'}`} />
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </>
    );
  }

  // --- Already Voted State ---
  if (hasVoted) {
    return (
      <>
        {globalStyles}
        <div className="flex-1 flex items-center justify-center p-6 min-h-[80vh]">
          <div className="w-full max-w-md">
            <div className={`bg-card border border-border rounded-3xl p-8 md:p-12 text-center shadow-2xl relative overflow-hidden transform transition-all duration-700 ease-out ${votedViewMounted ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'}`}>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-success to-teal-500"></div>
              {eligibleElections.length > 1 && (
                <button onClick={() => setSelectedElection(null)} className="absolute top-6 left-6 text-sm text-tertiary hover:text-primary transition-colors">
                  &larr; Back
                </button>
              )}
              <div className="w-20 h-20 mx-auto mb-6 mt-4">
                <div className="w-full h-full bg-gradient-to-br from-accent-success/20 to-teal-600/20 border border-accent-success/30 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.2)] text-accent-success">
                  <Icons.Check className="w-8 h-8" />
                </div>
              </div>
              <h2 className="text-2xl font-extrabold mb-2 text-primary">Vote Recorded</h2>
              <p className="mb-2 text-sm text-accent font-medium">{selectedElection?.title}</p>
              <p className="mb-6 text-sm text-secondary">Your ballot has been securely encrypted and submitted. You cannot modify your vote once cast.</p>
              
              <div className="bg-card-hover/50 p-4 rounded-xl border border-border/50">
                  <p className="text-xs text-secondary">
                    Please check the results page after the election has concluded to view the final outcome.
                  </p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // --- Main Ballot (Results/Leaderboard Style) ---
  return (
    <>
      {globalStyles}
      <div className="text-primary font-sans selection:bg-accent-primary/30">
        <div className="relative z-10 max-w-4xl mx-auto p-4 md:p-8 space-y-10 mt-4">

          {/* Header Dashboard Card */}
          <div className={`opacity-0 ${mounted ? 'animate-enter' : ''}`}>
            {eligibleElections.length > 1 && (
              <button onClick={() => setSelectedElection(null)} className="mb-6 text-sm text-secondary hover:text-primary transition-colors flex items-center gap-2">
                &larr; Back to Elections List
              </button>
            )}

            <div className="bg-card border border-border rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent-secondary/10 rounded-full blur-[80px] pointer-events-none"></div>
              
              <div className="relative z-10 w-full md:w-auto">
                <div className="flex gap-2 mb-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-primary/10 border border-accent-primary/20 text-accent text-[10px] uppercase tracking-widest font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
                    Official Ballot
                  </div>
                  {selectedElection && turnouts[selectedElection.election_id] && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card-hover border border-border text-secondary text-[10px] uppercase tracking-widest font-bold">
                      Live Turnout: <span className="text-primary">{turnouts[selectedElection.election_id].percentage}%</span>
                    </div>
                  )}
                </div>
                <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-primary">
                  {selectedElection?.title}
                </h1>
                <p className="text-sm text-secondary mt-2">Securely cast your vote. Select one candidate per position.</p>
              </div>

              {/* Progress Summary */}
              <div className="relative z-10 bg-card-hover border border-border rounded-2xl p-4 min-w-[200px] text-center">
                <div className="text-3xl font-extrabold text-primary mb-1">
                  {Object.keys(selectedCandidates).length} <span className="text-lg text-tertiary">/ {positions.length}</span>
                </div>
                <div className="text-xs text-secondary uppercase tracking-wider font-bold mb-3">Positions Selected</div>
                <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-accent-secondary to-accent-primary transition-all duration-500 ease-out"
                    style={{ width: `${selectionProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="animate-in fade-in bg-accent-error/10 border border-accent-error/20 p-4 rounded-2xl flex items-start gap-3 shadow-lg">
              <span className="text-accent-error mt-0.5"><Icons.Alert /></span>
              <p className="text-accent-error text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Voting Sections (List Style) */}
          <div className="space-y-12">
            {positions.map((position, index) => (
              <div
                key={position.position_id}
                className={`opacity-0 ${mounted ? 'animate-enter' : ''}`}
                style={{ animationDelay: `${(index + 1) * 100}ms` }}
              >
                {/* Position Header */}
                <div className="flex items-end justify-between border-b border-border pb-4 mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-primary tracking-wide">{position.title}</h2>
                    <p className="text-sm text-accent mt-1 font-medium">Select 1 Candidate</p>
                  </div>
                  {selectedCandidates[position.position_id] && (
                    <div className="text-accent-success flex items-center gap-1 text-sm font-bold bg-accent-success/10 px-3 py-1 rounded-lg">
                      <Icons.Check className="w-4 h-4" /> Selected
                    </div>
                  )}
                </div>

                {/* Candidate Rows */}
                <div className="flex flex-col gap-3">
                  {candidatesByPosition[position.position_id]?.map((candidate) => {
                    const isSelected = selectedCandidates[position.position_id] === candidate.candidate_id;

                    return (
                      <div
                        key={candidate.candidate_id}
                        onClick={() => handleSelectCandidate(position.position_id, candidate.candidate_id)}
                        className={`group cursor-pointer flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 ${
                          isSelected
                            ? 'bg-accent-primary/10 border-accent-primary/50 shadow-[0_0_20px_rgba(6,182,212,0.1)]'
                            : 'bg-card border-border hover:border-border-medium hover:bg-card-hover'
                        }`}
                      >
                        {/* Avatar */}
                        <div className={`w-14 h-14 shrink-0 rounded-full overflow-hidden border-2 transition-all ${
                          isSelected ? 'border-accent' : 'border-border group-hover:border-border-medium'
                        }`}>
                          {candidate.photo_url ? (
                            <img
                              src={candidate.photo_url.startsWith('/uploads') ? `${SERVER_URL}${candidate.photo_url}` : candidate.photo_url}
                              alt={candidate.full_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-card-hover flex items-center justify-center icon-secondary">
                              <Icons.User />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className={`text-lg font-bold truncate transition-colors ${isSelected ? 'text-primary' : 'text-secondary group-hover:text-primary'}`}>
                            {candidate.full_name}
                          </h3>
                          {candidate.manifesto && (
                            <p className="text-sm text-tertiary truncate mt-0.5">
                              {candidate.manifesto}
                            </p>
                          )}
                        </div>

                        {/* Radio Indicator */}
                        <div className="shrink-0 pl-4">
                          {isSelected ? <Icons.RadioChecked /> : <Icons.RadioUnchecked />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Submit Bar */}
          <div className={`transform transition-all duration-700 ease-out ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`} style={{ transitionDelay: '400ms' }}>
            <div className="bg-card border border-border rounded-2xl p-4 shadow-lg w-full flex flex-col sm:flex-row items-center justify-between gap-4">
              
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-card-hover flex items-center justify-center border border-border">
                  <span className="text-accent font-bold text-sm">{Math.round(selectionProgress)}%</span>
                </div>
                <div className="text-sm text-secondary">
                  {selectionProgress === 100 ? (
                    <span className="text-accent-success font-medium flex items-center gap-2"><Icons.Check className="w-4 h-4" /> Ballot Complete</span>
                  ) : (
                    <span>Please complete your selections</span>
                  )}
                </div>
              </div>

              <button
                onClick={handleSubmitVote}
                disabled={isSubmitting || Object.keys(selectedCandidates).length !== positions.length}
                className={`w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                  Object.keys(selectedCandidates).length === positions.length
                    ? 'bg-gradient-to-r from-accent-success to-teal-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] text-white hover:scale-[1.02] active:scale-[0.98]'
                    : 'bg-card-hover text-tertiary cursor-not-allowed border border-border'
                }`}
              >
                {isSubmitting ? (
                  <><Icons.Spinner /> Encrypting...</>
                ) : (
                  <><Icons.Check /> Cast Ballot</>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}