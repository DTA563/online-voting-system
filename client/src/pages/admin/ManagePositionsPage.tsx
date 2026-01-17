import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, LoadingSpinner, LoadingScreen } from '../../components/ui';
import { electionsApi } from '../../api';
import { Election, Position } from '../../types';
import api from '../../api/axios';

// --- SHARED STYLES ---
const glassCardClass = "relative overflow-hidden backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl transition-all hover:border-white/20";
const inputClass = "w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all";
const labelClass = "block text-xs font-bold text-blue-300 uppercase tracking-wider mb-2";
const selectClass = "w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 appearance-none cursor-pointer";

export function ManagePositionsPage() {
  const [elections, setElections] = useState<Election[]>([]);
  const [selectedElectionId, setSelectedElectionId] = useState<number | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [title, setTitle] = useState('');

  useEffect(() => {
    loadElections();
  }, []);

  useEffect(() => {
    if (selectedElectionId) {
      loadPositions(selectedElectionId);
    } else {
      setPositions([]);
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
    } finally {
      // Small delay for smooth transition
      setTimeout(() => setIsLoading(false), 300);
    }
  };

  const loadPositions = async (electionId: number) => {
    try {
      const data = await electionsApi.getPositions(electionId);
      setPositions(data);
    } catch (err) {
      setError('Failed to load positions');
    }
  };

  const resetForm = () => {
    setTitle('');
    setEditingPosition(null);
    setShowForm(false);
    setError('');
  };

  const handleEdit = (position: Position) => {
    setEditingPosition(position);
    setTitle(position.title);
    setShowForm(true);
    
    // Smooth scroll to top to see form
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('⚠️ Are you sure? All candidates linked to this position will be removed.')) return;

    try {
      await api.delete(`/positions/${id}`);
      if (selectedElectionId) {
        await loadPositions(selectedElectionId);
      }
    } catch (err) {
      setError('Failed to delete position');
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Loading position hierarchy..." />;
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
        
        {/* --- Ambient Background --- */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-purple-900/20"></div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px]"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          
          {/* --- Header --- */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4 animate-enter">
            <div>
              <Link to="/admin" className="text-sm text-gray-500 hover:text-blue-400 transition-colors mb-2 inline-block">
                &larr; Back to Dashboard
              </Link>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-gray-400 bg-clip-text text-transparent">
                Manage Positions
              </h1>
              <p className="text-gray-400 mt-2">
                Define the hierarchy of roles (e.g., President, Secretary) for the ballot.
              </p>
            </div>
            
            {!showForm && (
              <Button 
                onClick={() => setShowForm(true)} 
                disabled={!selectedElectionId}
                className={`bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 border-0 shadow-lg shadow-blue-500/20 text-white font-semibold px-6 py-3 ${!selectedElectionId ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                + Add New Position
              </Button>
            )}
          </div>

          {error && (
            <div className="mb-8 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-200 animate-in fade-in backdrop-blur-sm">
               <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* --- Left Column: Context & Form (Span 4) --- */}
            <div className="lg:col-span-4 space-y-6 animate-enter" style={{ animationDelay: '100ms' }}>
              
              {/* Context Selector */}
              <div className={`${glassCardClass} p-6`}>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 bg-blue-500 rounded-full"></span>
                  Context
                </h3>
                <div>
                   <label className={labelClass}>Select Election</label>
                   <div className="relative">
                      <select
                        value={selectedElectionId || ''}
                        onChange={(e) => setSelectedElectionId(Number(e.target.value))}
                        className={selectClass}
                      >
                        <option value="" disabled className="bg-gray-900">Choose Election...</option>
                        {elections.map((election) => (
                          <option key={election.election_id} value={election.election_id} className="bg-gray-900">
                            {election.title}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-3.5 pointer-events-none text-gray-400">▼</div>
                   </div>
                </div>
              </div>

              {/* Add/Edit Form */}
              {showForm && (
                <div className={`${glassCardClass} p-6 border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.1)] animate-in slide-in-from-left-4 fade-in duration-300`}>
                   <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <span className="w-1 h-5 bg-emerald-500 rounded-full"></span>
                    {editingPosition ? 'Edit Position' : 'New Position'}
                  </h3>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className={labelClass}>Position Title</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. President"
                        className={inputClass}
                        required
                        autoFocus
                      />
                    </div>

                    <div className="pt-4 flex gap-3">
                      <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white border-0"
                      >
                        {isSubmitting ? <LoadingSpinner size="sm" /> : (editingPosition ? 'Save Changes' : 'Create Position')}
                      </Button>
                      <button 
                        type="button" 
                        onClick={resetForm}
                        className="px-4 py-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* --- Right Column: List (Span 8) --- */}
            <div className="lg:col-span-8 animate-enter" style={{ animationDelay: '200ms' }}>
              <div className={`${glassCardClass} min-h-[500px]`}>
                 <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <h3 className="font-bold text-white flex items-center gap-2">
                       <span className="text-xl">📋</span> Hierarchy
                    </h3>
                    <span className="text-xs font-mono text-blue-300 bg-blue-500/10 px-2 py-1 rounded">
                       {positions.length} ROLES DEFINED
                    </span>
                 </div>

                 {!selectedElectionId ? (
                   <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                      <div className="text-4xl mb-4 opacity-50">👈</div>
                      <p>Select an election to view positions.</p>
                   </div>
                 ) : positions.length === 0 ? (
                   <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                        <span className="text-2xl">📝</span>
                      </div>
                      <p>No positions defined yet.</p>
                      <button onClick={() => setShowForm(true)} className="text-blue-400 hover:text-blue-300 mt-2 text-sm font-semibold">
                        Create the first role &rarr;
                      </button>
                   </div>
                 ) : (
                   <div className="divide-y divide-white/5">
                      {positions.map((position, index) => (
                        <div
                          key={position.position_id}
                          className="group flex items-center justify-between p-5 hover:bg-white/5 transition-colors"
                        >
                          <div className="flex items-center gap-5">
                            {/* Stylized Numbering */}
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-black/40 border border-white/10 text-gray-400 font-mono text-sm group-hover:text-blue-400 group-hover:border-blue-500/30 transition-colors">
                               {String(index + 1).padStart(2, '0')}
                            </div>
                            
                            <div>
                              <h3 className="font-bold text-white text-lg">{position.title}</h3>
                              <p className="text-xs text-gray-500 font-mono mt-0.5">ID: {position.position_id}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleEdit(position)}
                              className="p-2 rounded-lg hover:bg-blue-500/20 text-gray-400 hover:text-blue-400 transition-all"
                              title="Edit Position"
                            >
                               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            <button 
                              onClick={() => handleDelete(position.position_id)}
                              className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all"
                              title="Delete Position"
                            >
                               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        </div>
                      ))}
                   </div>
                 )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}