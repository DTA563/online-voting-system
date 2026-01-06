import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, Button, LoadingSpinner } from '../../components/ui';
import { electionsApi, votesApi } from '../../api';
import { Election } from '../../types';

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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Manage elections, candidates, and view statistics</p>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="text-center py-4">
            <p className="text-4xl font-bold text-blue-600">{elections.length}</p>
            <p className="text-sm text-gray-600">Total Elections</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center py-4">
            <p className="text-4xl font-bold text-green-600">
              {elections.filter(e => e.status === 'active').length}
            </p>
            <p className="text-sm text-gray-600">Active Elections</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center py-4">
            <p className="text-4xl font-bold text-yellow-600">
              {elections.filter(e => e.status === 'upcoming').length}
            </p>
            <p className="text-sm text-gray-600">Upcoming</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center py-4">
            <p className="text-4xl font-bold text-gray-600">
              {elections.filter(e => e.status === 'completed').length}
            </p>
            <p className="text-sm text-gray-600">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Election Turnout */}
      {activeElection && turnout && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>📊 Live Turnout - {activeElection.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-8">
              <div className="text-center">
                <p className="text-5xl font-bold text-blue-600">{turnout.percentage}%</p>
                <p className="text-sm text-gray-600">Voter Turnout</p>
              </div>
              <div className="flex-1">
                <div className="bg-gray-200 rounded-full h-6 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full transition-all duration-500"
                    style={{ width: `${turnout.percentage}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {turnout.voted} of {turnout.total} eligible voters have participated
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>🗳️ Elections</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Create and manage elections, set dates and positions.</p>
            <Link to="/admin/elections">
              <Button className="w-full">Manage Elections</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>👥 Candidates</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Add candidates, upload photos, and assign positions.</p>
            <Link to="/admin/candidates">
              <Button className="w-full">Manage Candidates</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📈 Results</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">View real-time results and voter statistics.</p>
            <Link to="/results">
              <Button className="w-full" variant="outline">View Results</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Elections Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Elections</CardTitle>
        </CardHeader>
        <CardContent>
          {elections.length === 0 ? (
            <p className="text-gray-600 text-center py-4">No elections created yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Title</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Start Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">End Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {elections.map((election) => (
                    <tr key={election.election_id} className="border-b border-gray-100">
                      <td className="py-3 px-4">{election.title}</td>
                      <td className="py-3 px-4">{new Date(election.start_date).toLocaleDateString()}</td>
                      <td className="py-3 px-4">{new Date(election.end_date).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          election.status === 'active' ? 'bg-green-100 text-green-700' :
                          election.status === 'upcoming' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {election.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
