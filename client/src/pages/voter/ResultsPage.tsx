import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, LoadingSpinner } from '../../components/ui';
import { electionsApi, votesApi } from '../../api';
import { Election, PositionResult } from '../../types';

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
      // Get active or most recent election
      const activeElection = await electionsApi.getActive();
      
      if (!activeElection) {
        setError('No election results available.');
        setIsLoading(false);
        return;
      }

      setElection(activeElection);

      // Get results and turnout
      const [electionResults, electionTurnout] = await Promise.all([
        votesApi.getResults(activeElection.election_id),
        votesApi.getTurnout(activeElection.election_id),
      ]);

      setResults(electionResults);
      setTurnout(electionTurnout);

    } catch (err) {
      setError('Failed to load results. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !election) {
    return (
      <div className="text-center py-12">
        <span className="text-6xl mb-4 block">📊</span>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Results Available</h2>
        <p className="text-gray-600">{error || 'Check back when an election has completed.'}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{election.title}</h1>
        <p className="text-gray-600">
          Status: <span className={`font-medium ${
            election.status === 'active' ? 'text-green-600' : 
            election.status === 'completed' ? 'text-blue-600' : 'text-yellow-600'
          }`}>{election.status.toUpperCase()}</span>
        </p>
      </div>

      {/* Turnout Card */}
      {turnout && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>📈 Voter Turnout</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-8">
              <div className="text-center">
                <p className="text-4xl font-bold text-blue-600">{turnout.percentage}%</p>
                <p className="text-sm text-gray-600">Participation</p>
              </div>
              <div className="flex-1">
                <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full transition-all duration-500"
                    style={{ width: `${turnout.percentage}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {turnout.voted} of {turnout.total} eligible voters
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results by Position */}
      <div className="space-y-6">
        {results.map((positionResult) => (
          <Card key={positionResult.position_id}>
            <CardHeader>
              <CardTitle>🏆 {positionResult.position_title}</CardTitle>
              <p className="text-sm text-gray-600">Total votes: {positionResult.total_votes}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {positionResult.candidates
                  .sort((a, b) => b.vote_count - a.vote_count)
                  .map((candidate, index) => (
                    <div key={candidate.candidate_id} className="flex items-center gap-4">
                      {/* Rank indicator */}
                      <span className={`text-2xl ${index === 0 ? '' : 'opacity-50'}`}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : ''}
                      </span>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-gray-900">
                            {candidate.candidate_name}
                          </span>
                          <span className="text-sm text-gray-600">
                            {candidate.vote_count} votes ({candidate.percentage}%)
                          </span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              index === 0 ? 'bg-green-500' : 'bg-blue-400'
                            }`}
                            style={{ width: `${candidate.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {results.length === 0 && (
        <div className="text-center py-8 text-gray-600">
          <p>No votes have been cast yet.</p>
        </div>
      )}
    </div>
  );
}
