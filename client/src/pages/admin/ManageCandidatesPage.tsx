import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, LoadingSpinner, LoadingScreen } from '../../components/ui';
import { electionsApi } from '../../api';
import api from '../../api/axios';
import { Election, Position, Candidate } from '../../types';

// --- Shared Styles (Consistent with Admin Dashboard) ---
const glassCardClass = "relative overflow-hidden backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl transition-all";
const inputClass = "w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all";
const labelClass = "block text-xs font-bold text-blue-300 uppercase tracking-wider mb-2";
const selectClass = "w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 appearance-none cursor-pointer";

export function ManageCandidatesPage() {
  // --- State Management ---
  const [elections, setElections] = useState<Election[]>([]);
  const [selectedElectionId, setSelectedElectionId] = useState<number | null>(null);
  
  const [positions, setPositions] = useState<Position[]>([]);
  const [selectedPositionId, setSelectedPositionId] = useState<number | null>(null);
  
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // UI State
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Form Data
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [fullName, setFullName] = useState('');
  const [manifesto, setManifesto] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  // --- Effects ---
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
    } else {
      setCandidates([]);
    }
  }, [selectedPositionId]);

  // --- Data Loading Functions ---
  const loadElections = async () => {
    try {
      const data = await electionsApi.getAll();
      setElections(data);
      if (data.length > 0) setSelectedElectionId(data[0].election_id);
    } catch (err) {
      setError('Failed to load elections');
    } finally {
       // Add a tiny artificial delay to smooth out the loading transition
       setTimeout(() => setIsLoading(false), 300);
    }
  };

  const loadPositions = async (electionId: number) => {
    try {
      const data = await electionsApi.getPositions(electionId);
      setPositions(data);
      if (data.length > 0) setSelectedPositionId(data[0].position_id);
    } catch (err) {
      setError('Failed to load positions');
    }
  };

  const loadCandidates = async (positionId: number) => {
    try {
      const data = await electionsApi.getCandidates(positionId);
      setCandidates(data);
    } catch (err) {
      setError('Failed to load candidates');
    }
  };

  // --- Form Handlers ---
  const resetForm = () => {
    setFullName('');
    setManifesto('');
    setPhotoUrl('');
    setEditingCandidate(null);
    setShowForm(false);
    setError('');
  };

  const handleEdit = (candidate: Candidate) => {
    setEditingCandidate(candidate);
    setFullName(candidate.full_name);
    setManifesto(candidate.manifesto || '');
    setPhotoUrl(candidate.photo_url || '');
    setShowForm(true);
    // Scroll to top to see form
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      setError('Failed to save candidate. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('⚠️ Are you sure? This action cannot be undone.')) return;
    try {
      await api.delete(`/candidates/${id}`);
      if (selectedPositionId) await loadCandidates(selectedPositionId);
    } catch (err) {
      setError('Failed to delete candidate');
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Loading candidate registry..." />;
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
          <div className="absolute top-20 left-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px]"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">

          {/* --- Header --- */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 animate-enter">
            <div>
              <Link to="/admin" className="text-sm text-gray-500 hover:text-blue-400 transition-colors mb-2 inline-block">
                &larr; Back to Dashboard
              </Link>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-gray-400 bg-clip-text text-transparent mb-2">
                Candidate Registry
              </h1>
              <p className="text-gray-400">
                Manage profiles, manifestos, and approvals.
              </p>
            </div>
            
            {/* Toggle Add Button */}
            {!showForm && (
              <Button 
                onClick={() => setShowForm(true)} 
                disabled={!selectedPositionId}
                className={`bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 border-0 shadow-lg shadow-blue-500/20 ${!selectedPositionId ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                + Add Candidate
              </Button>
            )}
          </div>

          {/* --- Error Toast --- */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-lg mb-6 flex items-center gap-3 backdrop-blur-sm animate-in fade-in slide-in-from-top-2">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* --- Left Column: Filters & Form (Span 4) --- */}
            <div className="lg:col-span-4 space-y-6 animate-enter" style={{ animationDelay: '100ms' }}>
              
              {/* 1. Context Selectors */}
              <div className={`${glassCardClass} p-6`}>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 bg-blue-500 rounded-full"></span>
                  Context
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>Election</label>
                    <div className="relative">
                      <select
                        value={selectedElectionId || ''}
                        onChange={(e) => setSelectedElectionId(Number(e.target.value))}
                        className={selectClass}
                      >
                        <option value="" disabled className="bg-gray-900">Choose Election...</option>
                        {elections.map((e) => (
                          <option key={e.election_id} value={e.election_id} className="bg-gray-900">
                            {e.title}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-3.5 pointer-events-none text-gray-400">▼</div>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Position</label>
                    <div className="relative">
                      <select
                        value={selectedPositionId || ''}
                        onChange={(e) => setSelectedPositionId(Number(e.target.value))}
                        className={`${selectClass} ${!positions.length ? 'opacity-50' : ''}`}
                        disabled={positions.length === 0}
                      >
                        <option value="" disabled className="bg-gray-900">
                          {positions.length === 0 ? 'No positions found' : 'Choose Position...'}
                        </option>
                        {positions.map((p) => (
                          <option key={p.position_id} value={p.position_id} className="bg-gray-900">
                            {p.title}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-3.5 pointer-events-none text-gray-400">▼</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Add/Edit Form Panel (Conditional) */}
              {showForm && (
                <div className={`${glassCardClass} p-6 border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.1)] animate-in slide-in-from-left-4 fade-in duration-300`}>
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <span className="w-1 h-5 bg-emerald-500 rounded-full"></span>
                    {editingCandidate ? 'Edit Profile' : 'New Candidate'}
                  </h3>
                  
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className={labelClass}>Full Name</label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Jane Doe"
                        className={inputClass}
                        required
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Photo URL</label>
                      <input
                        type="url"
                        value={photoUrl}
                        onChange={(e) => setPhotoUrl(e.target.value)}
                        placeholder="https://..."
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Manifesto</label>
                      <textarea
                        value={manifesto}
                        onChange={(e) => setManifesto(e.target.value)}
                        placeholder="Platform goals..."
                        rows={4}
                        className={inputClass}
                      />
                    </div>

                    <div className="pt-4 flex gap-3">
                      <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white border-0"
                      >
                         {isSubmitting ? <LoadingSpinner size="sm" /> : (editingCandidate ? 'Save Changes' : 'Create Profile')}
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

            {/* --- Right Column: Grid (Span 8) --- */}
            <div className="lg:col-span-8 animate-enter" style={{ animationDelay: '200ms' }}>
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
                Roster
              </h3>

              {!selectedPositionId ? (
                 <div className={`${glassCardClass} flex flex-col items-center justify-center min-h-[400px] text-gray-500 p-8 border-dashed border-white/10`}>
                   <div className="text-4xl mb-4 opacity-50">👈</div>
                   <p>Select an election and position to view candidates.</p>
                 </div>
              ) : candidates.length === 0 ? (
                 <div className={`${glassCardClass} flex flex-col items-center justify-center min-h-[400px] text-gray-500 p-8`}>
                   <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                     <span className="text-2xl">👤</span>
                   </div>
                   <p>No candidates registered for this position yet.</p>
                   <button onClick={() => setShowForm(true)} className="text-blue-400 hover:text-blue-300 mt-2 text-sm font-semibold">
                     Create the first one &rarr;
                   </button>
                 </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {candidates.map((candidate) => (
                    <div key={candidate.candidate_id} className={`${glassCardClass} p-6 group hover:border-blue-500/30 hover:bg-white/10 transition-all`}>
                      
                      {/* Header: Photo & Name */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className="relative w-14 h-14 shrink-0">
                          {candidate.photo_url ? (
                            <img 
                              src={candidate.photo_url} 
                              alt={candidate.full_name} 
                              className="w-full h-full object-cover rounded-full border-2 border-white/10 group-hover:border-blue-500/50 transition-colors"
                            />
                          ) : (
                            <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center border-2 border-white/10">
                              <span className="text-xl">👤</span>
                            </div>
                          )}
                          {/* Status Dot */}
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-black"></div>
                        </div>
                        <div className="overflow-hidden">
                          <h4 className="font-bold text-white truncate">{candidate.full_name}</h4>
                          <p className="text-xs text-blue-300 uppercase tracking-wide">Candidate #{candidate.candidate_id}</p>
                        </div>
                      </div>

                      {/* Manifesto Preview */}
                      <div className="mb-6 h-16">
                        {candidate.manifesto ? (
                          <p className="text-sm text-gray-400 line-clamp-3 leading-relaxed">
                            {candidate.manifesto}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-600 italic">No manifesto provided.</p>
                        )}
                      </div>

                      {/* Action Footer */}
                      <div className="flex gap-2 pt-4 border-t border-white/5">
                        <button 
                          onClick={() => handleEdit(candidate)}
                          className="flex-1 py-2 text-xs font-semibold bg-white/5 hover:bg-blue-600/20 hover:text-blue-300 rounded text-gray-300 transition-colors"
                        >
                          EDIT
                        </button>
                        <button 
                          onClick={() => handleDelete(candidate.candidate_id)}
                          className="flex-1 py-2 text-xs font-semibold bg-white/5 hover:bg-red-600/20 hover:text-red-300 rounded text-gray-300 transition-colors"
                        >
                          DELETE
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
    </>
  );
}