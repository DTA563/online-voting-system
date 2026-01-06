import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, LoadingSpinner } from '../../components/ui';
import { electionsApi } from '../../api';
import { Election, Position } from '../../types';
import api from '../../api/axios';

export function ManagePositionsPage() {
  const [elections, setElections] = useState<Election[]>([]);
  const [selectedElectionId, setSelectedElectionId] = useState<number | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState('');

  useEffect(() => {
    loadElections();
  }, []);

  useEffect(() => {
    if (selectedElectionId) {
      loadPositions(selectedElectionId);
    }
  }, [selectedElectionId]);

  const loadElections = async () => {
    try {
      const data = await electionsApi.getAll();
      setElections(data);
      if (data.length > 0) {
        setSelectedElectionId(data[0].election_id);
      }
    } catch (err) {
      setError('Failed to load elections');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPositions = async (electionId: number) => {
    try {
      const data = await electionsApi.getPositions(electionId);
      setPositions(data);
    } catch (err) {
      setError('Failed to load positions');
      console.error(err);
    }
  };

  const resetForm = () => {
    setTitle('');
    setEditingPosition(null);
    setShowForm(false);
  };

  const handleEdit = (position: Position) => {
    setEditingPosition(position);
    setTitle(position.title);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedElectionId) return;

    setError('');
    setIsSubmitting(true);

    try {
      const positionData = {
        election_id: selectedElectionId,
        title,
      };

      if (editingPosition) {
        await api.put(`/positions/${editingPosition.position_id}`, positionData);
      } else {
        await api.post('/positions', positionData);
      }

      await loadPositions(selectedElectionId);
      resetForm();
    } catch (err) {
      setError('Failed to save position');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this position? All candidates under it will also be deleted.')) return;

    try {
      await api.delete(`/positions/${id}`);
      if (selectedElectionId) {
        await loadPositions(selectedElectionId);
      }
    } catch (err) {
      setError('Failed to delete position');
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
          <h1 className="text-3xl font-bold text-gray-900">Manage Positions</h1>
          <p className="text-gray-600">Create positions like President, Vice President, etc.</p>
        </div>
        <Button onClick={() => setShowForm(true)} disabled={!selectedElectionId}>
          + Add Position
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Election Selector */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Election</label>
          <select
            value={selectedElectionId || ''}
            onChange={(e) => setSelectedElectionId(Number(e.target.value))}
            className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="" disabled>Choose an election</option>
            {elections.map((election) => (
              <option key={election.election_id} value={election.election_id}>
                {election.title} ({election.status})
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {/* Create/Edit Form */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingPosition ? 'Edit Position' : 'Add New Position'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Position Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., President, Vice President, Secretary"
                required
              />

              <div className="flex gap-3">
                <Button type="submit" isLoading={isSubmitting}>
                  {editingPosition ? 'Update Position' : 'Add Position'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Positions List */}
      <Card>
        <CardHeader>
          <CardTitle>Positions for Selected Election</CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedElectionId ? (
            <p className="text-gray-600 text-center py-8">Select an election first.</p>
          ) : positions.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No positions created for this election.</p>
          ) : (
            <div className="space-y-3">
              {positions.map((position, index) => (
                <div
                  key={position.position_id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                    <span className="font-medium text-gray-900">{position.title}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(position)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(position.position_id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
