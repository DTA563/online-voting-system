import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { electionsApi, votesApi } from '../../api';
import { Election, Position, Candidate, VoteSubmission } from '../../types';

export function VotingBoothPage() {
  const [election, setElection] = useState<Election | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [candidatesByPosition, setCandidatesByPosition] = useState<Record<number, Candidate[]>>({});
  const [selectedCandidates, setSelectedCandidates] = useState<Record<number, number>>({});
  const [hasVoted, setHasVoted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    loadElectionData();
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
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

      const voterStatus = await votesApi.checkVoterStatus(activeElection.election_id);
      if (voterStatus.has_voted) {
        setHasVoted(true);
        setIsLoading(false);
        return;
      }

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
      setTimeout(() => setIsLoading(false), 300);
    }
  };

  const handleSelectCandidate = (positionId: number, candidateId: number) => {
    setSelectedCandidates(prev => ({ ...prev, [positionId]: candidateId }));
  };

  const handleSubmitVote = async () => {
    if (!election) return;

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



  // --- Loading Skeleton ---
  if (isLoading) {
    return (
      <div className="font-sans pb-32 animate-pulse">
        <div className="p-5 md:p-8 space-y-5">
          {/* Header skeleton */}
          <div className="rounded-2xl p-6 md:p-8" style={{ backgroundColor: 'var(--v-card)', border: '1px solid var(--v-border)' }}>
            <div className="flex flex-col items-center gap-4">
              <div className="h-6 w-28 rounded-full" style={{ backgroundColor: 'var(--v-hover)' }}></div>
              <div className="h-9 w-72 rounded-xl" style={{ backgroundColor: 'var(--v-hover)' }}></div>
              <div className="h-4 w-80 rounded-lg" style={{ backgroundColor: 'var(--v-hover)' }}></div>
            </div>
          </div>
          {/* Position skeletons */}
          {[1, 2].map(i => (
            <div key={i} className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--v-card)', border: '1px solid var(--v-border)' }}>
              <div className="p-5" style={{ borderBottom: '1px solid var(--v-border)', backgroundColor: 'var(--v-hover)' }}>
                <div className="h-6 w-48 rounded-lg" style={{ backgroundColor: 'var(--v-border)' }}></div>
              </div>
              <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map(j => (
                  <div key={j} className="rounded-xl p-5" style={{ backgroundColor: 'var(--v-hover)', border: '1px solid var(--v-border)' }}>
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-20 h-20 rounded-xl" style={{ backgroundColor: 'var(--v-border)' }}></div>
                      <div className="h-4 w-24 rounded" style={{ backgroundColor: 'var(--v-border)' }}></div>
                      <div className="h-3 w-32 rounded" style={{ backgroundColor: 'var(--v-border)' }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- Already Voted ---
  if (hasVoted) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className={`w-full max-w-md transform transition-all duration-700 ease-out ${mounted ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'}`}>
          <div className="rounded-2xl p-8 md:p-12 text-center" style={{ backgroundColor: 'var(--v-card)', border: '1px solid var(--v-border)' }}>
            <div className="w-20 h-20 mx-auto mb-6">
              <div className="w-full h-full bg-linear-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-extrabold mb-2" style={{ color: 'var(--v-text)' }}>Vote Already Recorded</h2>
            <p className="mb-8 text-sm" style={{ color: 'var(--v-text-2)' }}>
              Your ballot has been securely submitted. You cannot modify your vote once cast.
            </p>
            <Link to="/results">
              <button className="w-full py-3 rounded-xl font-bold text-sm bg-linear-to-r from-blue-600 to-cyan-500 text-white transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.25)]">
                View Election Results
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --- No Election ---
  if (!election) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className={`w-full max-w-md mx-auto transform transition-all duration-700 ease-out ${mounted ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'}`}>
          <div className="rounded-2xl p-8 md:p-12 text-center" style={{ backgroundColor: 'var(--v-card)', border: '1px solid var(--v-border)' }}>
            <div className="text-6xl mb-6 opacity-60">📭</div>
            <h2 className="text-2xl font-extrabold mb-2" style={{ color: 'var(--v-text)' }}>No Active Election</h2>
            <p className="text-sm" style={{ color: 'var(--v-text-2)' }}>There are no elections open for voting at this time. Please check back later.</p>
          </div>
        </div>
      </div>
    );
  }

  // --- Main Ballot ---
  return (
    <div className="font-sans pb-32">
      <div className="p-5 md:p-8 space-y-5">

        {/* Header Card */}
        <div className={`transform transition-all duration-700 ease-out ${mounted ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'}`}>
          <div className="rounded-2xl p-6 md:p-8 relative overflow-hidden text-center" style={{ backgroundColor: 'var(--v-card)', border: '1px solid var(--v-border)' }}>
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-cyan-500 text-xs uppercase tracking-widest font-bold mb-4"
                   style={{ backgroundColor: 'var(--v-accent-bg)' }}>
                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
                Official Ballot
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold mb-3">
                <span className="bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  {election.title}
                </span>
              </h1>
              <p className="max-w-lg mx-auto text-sm" style={{ color: 'var(--v-text-2)' }}>
                Select one candidate for each position below. Your vote is encrypted and anonymous.
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-xl p-4 flex items-start gap-3 bg-red-500/10 border border-red-500/20">
            <svg className="w-5 h-5 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Voting Sections */}
        <div className="space-y-5">
          {positions.map((position, index) => (
            <div
              key={position.position_id}
              className={`transform transition-all duration-700 ease-out ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
              style={{ transitionDelay: `${(index + 1) * 150}ms` }}
            >
              <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--v-card)', border: '1px solid var(--v-border)' }}>
                {/* Position Header */}
                <div className="p-5 border-b" style={{ borderColor: 'var(--v-border)', backgroundColor: 'var(--v-hover)' }}>
                  <div className="flex items-center gap-3">
                    <span className="w-1.5 h-8 bg-linear-to-b from-blue-500 to-cyan-400 rounded-full"></span>
                    <h2 className="text-xl font-bold" style={{ color: 'var(--v-text)' }}>{position.title}</h2>
                  </div>
                </div>

                {/* Candidates Grid */}
                <div className="p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {candidatesByPosition[position.position_id]?.map((candidate) => {
                      const isSelected = selectedCandidates[position.position_id] === candidate.candidate_id;

                      return (
                        <div
                          key={candidate.candidate_id}
                          onClick={() => handleSelectCandidate(position.position_id, candidate.candidate_id)}
                          className={`relative rounded-xl p-5 cursor-pointer transition-all duration-300 border ${
                            isSelected
                              ? 'border-cyan-500 scale-[1.02] shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                              : 'hover:scale-[1.01]'
                          }`}
                          style={{
                            backgroundColor: isSelected ? 'var(--v-accent-bg)' : 'var(--v-hover)',
                            borderColor: isSelected ? undefined : 'var(--v-border)',
                          }}
                        >
                          {/* Checkmark */}
                          <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                            isSelected
                              ? 'bg-cyan-500 border-cyan-500 text-white shadow-[0_0_8px_#06b6d4]'
                              : 'text-transparent'
                          }`} style={{ borderColor: isSelected ? undefined : 'var(--v-border)' }}>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>

                          {/* Candidate Content */}
                          <div className="flex flex-col items-center text-center pt-2">
                            <div className={`w-20 h-20 rounded-xl mb-4 overflow-hidden border-2 transition-all ${
                              isSelected ? 'border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]' : ''
                            }`} style={{ borderColor: isSelected ? undefined : 'var(--v-border)' }}>
                              {candidate.photo_url ? (
                                <img src={candidate.photo_url} alt={candidate.full_name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-2xl" style={{ backgroundColor: 'var(--v-hover)' }}>👤</div>
                              )}
                            </div>

                            <h3 className="text-base font-bold mb-1.5" style={{ color: isSelected ? 'var(--v-text)' : 'var(--v-text-2)' }}>
                              {candidate.full_name}
                            </h3>

                            {candidate.manifesto && (
                              <p className="text-xs line-clamp-3 leading-relaxed mb-4" style={{ color: 'var(--v-text-3)' }}>
                                {candidate.manifesto}
                              </p>
                            )}

                            <div className={`mt-auto w-full py-2 rounded-lg text-xs font-bold tracking-wide uppercase text-center transition-all ${
                              isSelected
                                ? 'bg-linear-to-r from-blue-600 to-cyan-500 text-white shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                                : ''
                            }`} style={!isSelected ? { backgroundColor: 'var(--v-hover)', color: 'var(--v-text-3)' } : undefined}>
                              {isSelected ? '✓ Selected' : 'Select'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fixed Bottom Submit Bar */}
      <div className={`fixed bottom-0 right-0 left-0 z-50 transform transition-all duration-700 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}
           style={{ transitionDelay: '600ms' }}>
        <div className="p-4 md:p-6" style={{ backgroundColor: 'var(--v-card)', borderTop: '1px solid var(--v-border)', backdropFilter: 'blur(12px)' }}>
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm" style={{ color: 'var(--v-text-2)' }}>
              <span className="text-cyan-500 font-bold">{Object.keys(selectedCandidates).length}</span>
              {' '}of{' '}
              <span className="font-bold" style={{ color: 'var(--v-text)' }}>{positions.length}</span>
              {' '}positions selected
            </div>

            <button
              onClick={handleSubmitVote}
              disabled={isSubmitting || Object.keys(selectedCandidates).length !== positions.length}
              className={`w-full md:w-auto px-8 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                Object.keys(selectedCandidates).length === positions.length
                  ? 'bg-linear-to-r from-blue-600 to-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.25)] text-white hover:scale-[1.02] active:scale-[0.98]'
                  : 'cursor-not-allowed'
              }`}
              style={Object.keys(selectedCandidates).length !== positions.length ? { backgroundColor: 'var(--v-hover)', color: 'var(--v-text-3)', border: '1px solid var(--v-border)' } : undefined}
            >
              {isSubmitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Encrypting...
                </>
              ) : (
                'Submit Official Ballot'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
