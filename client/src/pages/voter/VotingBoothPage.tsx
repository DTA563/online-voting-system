import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, Button, LoadingScreen } from '../../components/ui';
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

  const navigate = useNavigate();

  useEffect(() => {
    loadElectionData();
  }, []);

  const loadElectionData = async () => {
    try {
      // Get active election
      const activeElection = await electionsApi.getActive();
      
      if (!activeElection) {
        setError('No active election at this time.');
        setIsLoading(false);
        return;
      }

      setElection(activeElection);

      // Check if user has already voted
      const voterStatus = await votesApi.checkVoterStatus(activeElection.election_id);
      if (voterStatus.has_voted) {
        setHasVoted(true);
        setIsLoading(false);
        return;
      }

      // Get positions for this election
      const electionPositions = await electionsApi.getPositions(activeElection.election_id);
      setPositions(electionPositions);

      // Get candidates for each position
      const candidatesMap: Record<number, Candidate[]> = {};
      for (const position of electionPositions) {
        const candidates = await electionsApi.getCandidates(position.position_id);
        candidatesMap[position.position_id] = candidates;
      }
      setCandidatesByPosition(candidatesMap);

    } catch (err) {
      setError('Failed to load election data. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
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

    // Validate all positions have selections
    const missingPositions = positions.filter(p => !selectedCandidates[p.position_id]);
    if (missingPositions.length > 0) {
      setError(`Please select a candidate for: ${missingPositions.map(p => p.title).join(', ')}`);
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
      setError('Failed to submit your vote. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Loading election..." />;
  }

  if (hasVoted) {
    return (
      <div className="text-center py-12">
        <span className="text-6xl mb-4 block">✅</span>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">You've Already Voted</h2>
        <p className="text-gray-600 mb-6">
          Your vote has been recorded securely and anonymously.
        </p>
        <Button onClick={() => navigate('/results')}>View Results</Button>
      </div>
    );
  }

  if (!election) {
    return (
      <div className="text-center py-12">
        <span className="text-6xl mb-4 block">📭</span>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Active Election</h2>
        <p className="text-gray-600">
          There is no election currently in progress. Please check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{election.title}</h1>
        <p className="text-gray-600">Select one candidate for each position below</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Positions & Candidates */}
      <div className="space-y-8">
        {positions.map((position) => (
          <div key={position.position_id}>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {position.title}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {candidatesByPosition[position.position_id]?.map((candidate) => (
                <Card
                  key={candidate.candidate_id}
                  selected={selectedCandidates[position.position_id] === candidate.candidate_id}
                  onClick={() => handleSelectCandidate(position.position_id, candidate.candidate_id)}
                  className="text-center"
                >
                  {/* Candidate Photo */}
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-200 overflow-hidden">
                    {candidate.photo_url ? (
                      <img
                        src={candidate.photo_url}
                        alt={candidate.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">
                        👤
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900">{candidate.full_name}</h3>
                  {candidate.manifesto && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                      {candidate.manifesto}
                    </p>
                  )}
                  {selectedCandidates[position.position_id] === candidate.candidate_id && (
                    <span className="inline-block mt-3 text-blue-600 font-medium">
                      ✓ Selected
                    </span>
                  )}
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <div className="mt-8 text-center">
        <Button
          size="lg"
          onClick={handleSubmitVote}
          isLoading={isSubmitting}
          disabled={Object.keys(selectedCandidates).length !== positions.length}
        >
          Submit My Vote
        </Button>
        <p className="text-sm text-gray-500 mt-2">
          Your vote is anonymous and cannot be changed after submission.
        </p>
      </div>
    </div>
  );
}
