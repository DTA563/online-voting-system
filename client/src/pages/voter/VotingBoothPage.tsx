import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, LoadingSpinner, LoadingScreen } from '../../components/ui';
import { electionsApi, votesApi } from '../../api';
import { Election, Position, Candidate, VoteSubmission } from '../../types';

// --- Shared Styles ---
const glassCardClass = "relative overflow-hidden backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 transition-all duration-300";
const selectableCardClass = `${glassCardClass} cursor-pointer hover:bg-white/[0.07] hover:border-white/20 hover:scale-[1.02]`;
const selectedCardClass = "relative overflow-hidden backdrop-blur-xl bg-blue-600/10 border border-blue-500 rounded-2xl p-6 transition-all duration-300 shadow-[0_0_25px_rgba(37,99,235,0.3)] scale-[1.02]";

export function VotingBoothPage() {
  const [election, setElection] = useState<Election | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [candidatesByPosition, setCandidatesByPosition] = useState<Record<number, Candidate[]>>({});
  const [selectedCandidates, setSelectedCandidates] = useState<Record<number, number>>({});
  const [hasVoted, setHasVoted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    loadElectionData();
  }, []);

  const loadElectionData = async () => {
    try {
      const activeElection = await electionsApi.getActive();
      
      if (!activeElection) {
        setError('No active election at this time.');
        setIsLoading(false);
        return;
      }

      setElection(activeElection);

      // Check status
      const voterStatus = await votesApi.checkVoterStatus(activeElection.election_id);
      if (voterStatus.has_voted) {
        setHasVoted(true);
        setIsLoading(false);
        return;
      }

      // Load ballot data
      const electionPositions = await electionsApi.getPositions(activeElection.election_id);
      setPositions(electionPositions);

      const candidatesMap: Record<number, Candidate[]> = {};
      for (const position of electionPositions) {
        const candidates = await electionsApi.getCandidates(position.position_id);
        candidatesMap[position.position_id] = candidates;
      }
      setCandidatesByPosition(candidatesMap);

    } catch (err) {
      setError('Failed to load election data.');
      console.error(err);
    } finally {
      // Artificial delay to smooth out transition
      setTimeout(() => setIsLoading(false), 300);
    }
  };

  const handleSelectCandidate = (positionId: number, candidateId: number) => {
    setSelectedCandidates(prev => ({
      ...prev,
      [positionId]: candidateId,
    }));
  };

  const handleSubmitVote = async () => {
    if (!election) return;

    // Validation
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
        election_id: election.election_id,
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

  // --- Render Loading ---
  if (isLoading) {
    return <LoadingScreen message="Preparing official ballot..." />;
  }

  // --- Render Already Voted ---
  if (hasVoted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 relative animate-enter">
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
        
         {/* Ambient Background */}
         <div className="fixed inset-0 pointer-events-none">
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px]"></div>
        </div>

        <div className={`${glassCardClass} max-w-md text-center py-12 border-emerald-500/20`}>
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Vote Recorded</h2>
          <p className="text-gray-400 mb-8">
            Your ballot has been securely submitted. You cannot modify your vote once cast.
          </p>
          <Button 
            onClick={() => navigate('/results')}
            className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10"
          >
            View Live Results
          </Button>
        </div>
      </div>
    );
  }

  // --- Render No Election ---
  if (!election) {
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
        <div className={`${glassCardClass} max-w-md text-center py-12`}>
          <div className="text-6xl mb-6 opacity-50">📭</div>
          <h2 className="text-2xl font-bold text-white mb-2">No Active Election</h2>
          <p className="text-gray-400">Please check back later.</p>
        </div>
      </div>
    );
  }

  // --- Render Main Ballot ---
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
        
        {/* Ambient Background */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black"></div>
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-blue-900/10 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto space-y-10 pb-20">
          
          {/* Header (No Delay) */}
          <div className="text-center space-y-4 animate-enter">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs uppercase tracking-widest font-bold">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              Official Ballot
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-gray-400">
              {election.title}
            </h1>
            <p className="text-gray-400 max-w-lg mx-auto">
              Please select one candidate for each position below. Your vote is encrypted and anonymous.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-200 px-6 py-4 rounded-xl backdrop-blur-md animate-pulse animate-in fade-in slide-in-from-top-4">
              🚨 {error}
            </div>
          )}

          {/* Voting Sections */}
          <div className="space-y-12">
            {positions.map((position, index) => (
              <div 
                key={position.position_id} 
                className="space-y-6 animate-enter"
                style={{ animationDelay: `${(index + 1) * 100}ms` }}
              >
                
                {/* Position Title */}
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/20"></div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <span className="w-1.5 h-8 bg-purple-500 rounded-full shadow-[0_0_10px_#a855f7]"></span>
                    {position.title}
                  </h2>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/20"></div>
                </div>

                {/* Candidates Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {candidatesByPosition[position.position_id]?.map((candidate) => {
                    const isSelected = selectedCandidates[position.position_id] === candidate.candidate_id;
                    
                    return (
                      <div
                        key={candidate.candidate_id}
                        onClick={() => handleSelectCandidate(position.position_id, candidate.candidate_id)}
                        className={isSelected ? selectedCardClass : selectableCardClass}
                      >
                        {/* Selection Checkmark Indicator */}
                        <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                          isSelected 
                            ? 'bg-blue-500 border-blue-500 text-white shadow-[0_0_10px_#3b82f6]' 
                            : 'border-white/20 text-transparent'
                        }`}>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>

                        {/* Candidate Content */}
                        <div className="flex flex-col items-center text-center">
                          
                          {/* Avatar */}
                          <div className={`w-24 h-24 rounded-2xl mb-4 overflow-hidden border-2 transition-all ${
                            isSelected ? 'border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.4)]' : 'border-white/10'
                          }`}>
                            {candidate.photo_url ? (
                              <img
                                src={candidate.photo_url}
                                alt={candidate.full_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-white/5 flex items-center justify-center text-3xl">
                                👤
                              </div>
                            )}
                          </div>

                          <h3 className={`text-lg font-bold mb-2 transition-colors ${isSelected ? 'text-white' : 'text-gray-200'}`}>
                            {candidate.full_name}
                          </h3>
                          
                          {candidate.manifesto && (
                            <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed">
                              {candidate.manifesto}
                            </p>
                          )}

                          {/* Visual "Vote" Button Imitation */}
                          <div className={`mt-6 px-6 py-2 rounded-lg text-sm font-bold tracking-wide uppercase transition-all w-full ${
                            isSelected 
                              ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' 
                              : 'bg-white/5 text-gray-500 group-hover:bg-white/10'
                          }`}>
                            {isSelected ? 'Selected' : 'Select Candidate'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Submit Footer (Delay matches last item) */}
          <div 
            className="fixed bottom-0 left-0 w-full p-6 bg-black/80 backdrop-blur-xl border-t border-white/10 z-50 animate-enter"
            style={{ animationDelay: '500ms' }}
          >
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
              
              <div className="text-sm text-gray-400">
                <span className="text-white font-bold">{Object.keys(selectedCandidates).length}</span> of <span className="text-white font-bold">{positions.length}</span> positions selected
              </div>

              <Button
                size="lg"
                onClick={handleSubmitVote}
                disabled={isSubmitting || Object.keys(selectedCandidates).length !== positions.length}
                className={`
                  w-full md:w-auto px-8 py-3 rounded-xl font-bold text-lg shadow-lg transition-all
                  ${Object.keys(selectedCandidates).length === positions.length
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-[0_0_20px_rgba(37,99,235,0.5)] text-white border-none'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-white/5'}
                `}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <LoadingSpinner size="sm" /> encrypting...
                  </span>
                ) : (
                  "Submit Official Ballot"
                )}
              </Button>
            </div>
          </div>
          
          {/* Spacer for fixed footer */}
          <div className="h-24"></div>

        </div>
      </div>
    </>
  );
}