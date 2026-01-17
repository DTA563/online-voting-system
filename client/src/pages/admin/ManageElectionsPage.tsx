import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, LoadingSpinner, LoadingScreen } from '../../components/ui';
import { electionsApi } from '../../api';
import { Election } from '../../types';

// --- SHARED STYLES (Matching Dashboard) ---
const glassCardClass = "relative overflow-hidden backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl transition-all hover:border-white/20";
const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder-gray-500 [color-scheme:dark]";
const labelClass = "block text-sm font-medium text-gray-400 mb-2 ml-1";
const tableHeaderClass = "text-left py-4 px-6 text-xs font-semibold text-blue-300 uppercase tracking-wider";
const tableCellClass = "py-4 px-6 text-sm text-gray-300 border-b border-white/5";

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
    // Clear any previous errors before loading
    setError(''); 
    
    try {
      const data = await electionsApi.getAll();
      setElections(data);
    } catch (err: any) {
      if (err.response && err.response.status === 404) {
        setElections([]);
      } else {
        setError('Failed to load elections');
        console.error(err);
      }
    } finally {
      // Add a tiny artificial delay to smooth out the loading transition
      setTimeout(() => setIsLoading(false), 300);
    }
  };

  const resetForm = () => {
    setTitle('');
    setStartDate('');
    setEndDate('');
    setStatus('upcoming');
    setEditingElection(null);
    setShowForm(false);
    setError('');
  };

  const handleEdit = (election: Election) => {
    setEditingElection(election);
    setTitle(election.title);
    setStartDate(election.start_date.slice(0, 16));
    setEndDate(election.end_date.slice(0, 16));
    setStatus(election.status);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      setError('Failed to save election. Please check your network.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this election? This action cannot be undone.')) return;

    try {
      await electionsApi.delete(id);
      await loadElections();
    } catch (err) {
      setError('Failed to delete election');
      console.error(err);
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Loading elections registry..." />;
  }

  return (
    <>
      {/* --- Custom Animation Styles --- */}
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

      <div className="min-h-screen bg-black text-white relative font-sans selection:bg-blue-500/30 p-6 md:p-12">
        
        {/* --- Background Ambient Effects --- */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-purple-900/20"></div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          
          {/* --- Header (Animate In) --- */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4 animate-enter">
            <div>
              <Link to="/admin" className="text-sm text-gray-500 hover:text-blue-400 transition-colors mb-2 inline-block">
                &larr; Back to Dashboard
              </Link>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-gray-400 bg-clip-text text-transparent">
                Election Registry
              </h1>
              <p className="text-gray-400 mt-2">
                Create, configure, and monitor voting periods.
              </p>
            </div>
            
            {!showForm && (
              <Button 
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 border-0 shadow-lg shadow-blue-500/20 text-white font-semibold px-6 py-3"
              >
                + Create New Election
              </Button>
            )}
          </div>

          {/* --- Error Banner --- */}
          {error && (
            <div className="mb-8 bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-center gap-3 text-red-200 animate-in fade-in slide-in-from-top-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error}
            </div>
          )}

          {/* --- Create/Edit Form (Glass Style) --- */}
          {showForm && (
            <div className={`${glassCardClass} p-8 mb-10 animate-in fade-in slide-in-from-top-4 duration-300 border-l-4 border-l-blue-500`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">
                  {editingElection ? 'Edit Election Configuration' : 'Configure New Election'}
                </h2>
                <button onClick={resetForm} className="text-gray-500 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Title (Full Width) */}
                  <div className="md:col-span-2">
                    <label className={labelClass}>Election Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Student Government General Election 2026"
                      className={inputClass}
                      required
                    />
                  </div>

                  {/* Dates */}
                  <div>
                    <label className={labelClass}>Start Date & Time</label>
                    <input
                      type="datetime-local"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className={inputClass}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>End Date & Time</label>
                    <input
                      type="datetime-local"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className={inputClass}
                      required
                    />
                  </div>

                  {/* Status */}
                  <div className="md:col-span-2">
                    <label className={labelClass}>Current Status</label>
                    <div className="relative">
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as any)}
                        className={`${inputClass} appearance-none cursor-pointer`}
                      >
                        <option value="upcoming">Upcoming (Not visible to voters)</option>
                        <option value="active">Active (Voting Open)</option>
                        <option value="completed">Completed (Results Finalized)</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-white/5">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-8"
                  >
                    {isSubmitting ? <LoadingSpinner size="sm" /> : (editingElection ? 'Update Configuration' : 'Launch Election')}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={resetForm}
                    className="border-white/10 text-gray-400 hover:text-white hover:bg-white/5"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* --- Elections Table (Animate In with Delay) --- */}
          <div 
            className={`${glassCardClass} animate-enter`}
            style={{ animationDelay: '100ms' }}
          >
            {elections.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                <p className="text-lg">No elections found in the registry.</p>
                <button onClick={() => setShowForm(true)} className="text-blue-400 hover:text-blue-300 text-sm mt-2 font-semibold">
                  Create your first election &rarr;
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className={tableHeaderClass}>Title</th>
                      <th className={tableHeaderClass}>Timeline</th>
                      <th className={tableHeaderClass}>Status</th>
                      <th className={tableHeaderClass}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {elections.map((election) => (
                      <tr key={election.election_id} className="hover:bg-white/5 transition-colors">
                        <td className={`${tableCellClass} font-medium text-white`}>
                          {election.title}
                        </td>
                        <td className={tableCellClass}>
                          <div className="flex flex-col text-xs space-y-1">
                            <span className="flex items-center gap-2">
                               <span className="w-2 h-2 rounded-full bg-emerald-500/50"></span>
                               {new Date(election.start_date).toLocaleString()}
                            </span>
                            <span className="flex items-center gap-2">
                               <span className="w-2 h-2 rounded-full bg-red-500/50"></span>
                               {new Date(election.end_date).toLocaleString()}
                            </span>
                          </div>
                        </td>
                        <td className={tableCellClass}>
                          <StatusBadge status={election.status} />
                        </td>
                        <td className={tableCellClass}>
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => handleEdit(election)}
                              className="p-2 rounded-lg hover:bg-blue-500/20 text-gray-400 hover:text-blue-400 transition-all"
                              title="Edit Election"
                            >
                               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </button>
                            <button 
                              onClick={() => handleDelete(election.election_id)}
                              className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all"
                              title="Delete Election"
                            >
                               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// Helper Component for Status
function StatusBadge({ status }: { status: string }) {
  const styles = {
    active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]',
    upcoming: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    completed: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };
  
  // @ts-ignore
  const activeStyle = styles[status] || styles.completed;

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${activeStyle} uppercase tracking-wider`}>
      {status}
    </span>
  );
}