import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, LoadingSpinner } from '../../components/ui';
import { electionsApi } from '../../api';
import { Election } from '../../types';

export function ManageElectionsPage() {
  const [elections, setElections] = useState<Election[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingElection, setEditingElection] = useState<Election | null>(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<'upcoming' | 'active' | 'completed'>('upcoming');

  useEffect(() => {
    loadElections();
  }, []);

  const loadElections = async () => {
    try {
      const data = await electionsApi.getAll();
      setElections(data);
    } catch (err) {
      setError('Failed to load elections');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setStartDate('');
    setEndDate('');
    setStatus('upcoming');
    setEditingElection(null);
    setShowForm(false);
  };

  const handleEdit = (election: Election) => {
    setEditingElection(election);
    setTitle(election.title);
    setStartDate(election.start_date.slice(0, 16)); // Format for datetime-local
    setEndDate(election.end_date.slice(0, 16));
    setStatus(election.status);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const electionData = {
        title,
        start_date: startDate,
        end_date: endDate,
        status,
      };

      if (editingElection) {
        await electionsApi.update(editingElection.election_id, electionData);
      } else {
        await electionsApi.create(electionData);
      }

      await loadElections();
      resetForm();
    } catch (err) {
      setError('Failed to save election');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this election?')) return;

    try {
      await electionsApi.delete(id);
      await loadElections();
    } catch (err) {
      setError('Failed to delete election');
      console.error(err);
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Elections</h1>
          <p className="text-gray-600">Create and manage election periods</p>
        </div>
        <Button onClick={() => setShowForm(true)}>+ Create Election</Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Create/Edit Form */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingElection ? 'Edit Election' : 'Create New Election'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Election Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Student Government Election 2026"
                required
              />

              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Start Date & Time"
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
                <Input
                  label="End Date & Time"
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'upcoming' | 'active' | 'completed')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="flex gap-3">
                <Button type="submit" isLoading={isSubmitting}>
                  {editingElection ? 'Update Election' : 'Create Election'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Elections Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Elections</CardTitle>
        </CardHeader>
        <CardContent>
          {elections.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No elections created yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Title</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Start Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">End Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {elections.map((election) => (
                    <tr key={election.election_id} className="border-b border-gray-100">
                      <td className="py-3 px-4 font-medium">{election.title}</td>
                      <td className="py-3 px-4">{new Date(election.start_date).toLocaleString()}</td>
                      <td className="py-3 px-4">{new Date(election.end_date).toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          election.status === 'active' ? 'bg-green-100 text-green-700' :
                          election.status === 'upcoming' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {election.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(election)}>
                            Edit
                          </Button>
                          <Button size="sm" variant="danger" onClick={() => handleDelete(election.election_id)}>
                            Delete
                          </Button>
                        </div>
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
