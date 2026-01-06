import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, LoadingSpinner } from '../../components/ui';
import { User } from '../../types';
import api from '../../api/axios';

export function ManageVotersPage() {
  const [voters, setVoters] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [userId, setUserId] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    loadVoters();
  }, []);

  const loadVoters = async () => {
    try {
      const response = await api.get('/users?role=voter');
      setVoters(response.data.data || []);
    } catch (err) {
      setError('Failed to load voters');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setUserId('');
    setFullName('');
    setPassword('');
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      await api.post('/users', {
        user_id: userId,
        full_name: fullName,
        password: password,
        role: 'voter',
      });

      setSuccessMessage(`Voter "${fullName}" added successfully!`);
      await loadVoters();
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add voter');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this voter?')) return;

    try {
      await api.delete(`/users/${id}`);
      await loadVoters();
      setSuccessMessage('Voter deactivated successfully');
    } catch (err) {
      setError('Failed to deactivate voter');
      console.error(err);
    }
  };

  // Filter voters by search term
  const filteredVoters = voters.filter(
    (voter) =>
      voter.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voter.user_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold text-gray-900">Manage Voters</h1>
          <p className="text-gray-600">Add, view, and manage eligible voters</p>
        </div>
        <Button onClick={() => setShowForm(true)}>+ Add Voter</Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
          {successMessage}
        </div>
      )}

      {/* Add Voter Form */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add New Voter</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Student ID / User ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="e.g., STU001"
                required
              />

              <Input
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g., John Doe"
                required
              />

              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Initial password for the voter"
                required
              />

              <div className="flex gap-3">
                <Button type="submit" isLoading={isSubmitting}>
                  Add Voter
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Search and Stats */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold text-blue-600">{voters.length}</span>
              <span className="text-gray-600">Total Registered Voters</span>
            </div>
            <Input
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="md:w-64"
            />
          </div>
        </CardContent>
      </Card>

      {/* Voters Table */}
      <Card>
        <CardHeader>
          <CardTitle>Registered Voters</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredVoters.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              {searchTerm ? 'No voters match your search.' : 'No voters registered yet.'}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">User ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Full Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Role</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVoters.map((voter) => (
                    <tr key={voter.user_id} className="border-b border-gray-100">
                      <td className="py-3 px-4 font-mono text-sm">{voter.user_id}</td>
                      <td className="py-3 px-4">{voter.full_name}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          {voter.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDeactivate(voter.user_id)}
                        >
                          Deactivate
                        </Button>
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
