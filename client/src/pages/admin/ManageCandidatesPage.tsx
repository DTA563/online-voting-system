import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, LoadingSpinner } from '../../components/ui';
import { electionsApi } from '../../api';
import { Election, Position, Candidate } from '../../types';
import api from '../../api/axios';

export function ManageCandidatesPage() {
  const [elections, setElections] = useState<Election[]>([]);
  const [selectedElectionId, setSelectedElectionId] = useState<number | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [selectedPositionId, setSelectedPositionId] = useState<number | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [fullName, setFullName] = useState('');
  const [manifesto, setManifesto] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  useEffect(() => {
    loadElections();
  }, []);

  useEffect(() => {
    if (selectedElectionId) {
      loadPositions(selectedElectionId);
      setSelectedPositionId(null);
      setCandidates([]);
    }
  }, [selectedElectionId]);

  useEffect(() => {
    if (selectedPositionId) {
      loadCandidates(selectedPositionId);
    }
  }, [selectedPositionId]);

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
      if (data.length > 0) {
        setSelectedPositionId(data[0].position_id);
      }
    } catch (err) {
      setError('Failed to load positions');
      console.error(err);
    }
  };

  const loadCandidates = async (positionId: number) => {
    try {
      const data = await electionsApi.getCandidates(positionId);
      setCandidates(data);
    } catch (err) {
      setError('Failed to load candidates');
      console.error(err);
    }
  };

  const resetForm = () => {
    setFullName('');
    setManifesto('');
    setPhotoUrl('');
    setEditingCandidate(null);
    setShowForm(false);
  };

  const handleEdit = (candidate: Candidate) => {
    setEditingCandidate(candidate);
    setFullName(candidate.full_name);
    setManifesto(candidate.manifesto || '');
    setPhotoUrl(candidate.photo_url || '');
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPositionId) return;

    setError('');
    setIsSubmitting(true);

    try {
      const candidateData = {
        position_id: selectedPositionId,
        full_name: fullName,
        manifesto: manifesto || null,
        photo_url: photoUrl || null,
      };

      if (editingCandidate) {
        await api.put(`/candidates/${editingCandidate.candidate_id}`, candidateData);
      } else {
        await api.post('/candidates', candidateData);
      }

      await loadCandidates(selectedPositionId);
      resetForm();
    } catch (err) {
      setError('Failed to save candidate');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this candidate?')) return;

    try {
      await api.delete(`/candidates/${id}`);
      if (selectedPositionId) {
        await loadCandidates(selectedPositionId);
      }
    } catch (err) {
      setError('Failed to delete candidate');
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
          <h1 className="text-3xl font-bold text-gray-900">Manage Candidates</h1>
          <p className="text-gray-600">Add candidates with their name, photo, and manifesto</p>
        </div>
        <Button onClick={() => setShowForm(true)} disabled={!selectedPositionId}>
          + Add Candidate
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Election & Position Selectors */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Election</label>
              <select
                value={selectedElectionId || ''}
                onChange={(e) => setSelectedElectionId(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" disabled>Choose an election</option>
                {elections.map((election) => (
                  <option key={election.election_id} value={election.election_id}>
                    {election.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Position</label>
              <select
                value={selectedPositionId || ''}
                onChange={(e) => setSelectedPositionId(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={positions.length === 0}
              >
                <option value="" disabled>Choose a position</option>
                {positions.map((position) => (
                  <option key={position.position_id} value={position.position_id}>
                    {position.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Form */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingCandidate ? 'Edit Candidate' : 'Add New Candidate'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g., John Doe"
                required
              />

              <Input
                label="Photo URL (optional)"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://example.com/photo.jpg"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Manifesto (optional)
                </label>
                <textarea
                  value={manifesto}
                  onChange={(e) => setManifesto(e.target.value)}
                  placeholder="What the candidate stands for..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit" isLoading={isSubmitting}>
                  {editingCandidate ? 'Update Candidate' : 'Add Candidate'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Candidates Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Candidates for Selected Position</CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedPositionId ? (
            <p className="text-gray-600 text-center py-8">Select a position first.</p>
          ) : candidates.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No candidates added for this position.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {candidates.map((candidate) => (
                <div
                  key={candidate.candidate_id}
                  className="border border-gray-200 rounded-lg p-4 text-center"
                >
                  {/* Photo */}
                  <div className="w-24 h-24 mx-auto mb-3 rounded-full bg-gray-200 overflow-hidden">
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
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {candidate.manifesto}
                    </p>
                  )}

                  <div className="flex gap-2 mt-4 justify-center">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(candidate)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(candidate.candidate_id)}>
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
