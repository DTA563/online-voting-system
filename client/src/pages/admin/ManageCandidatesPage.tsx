import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LoadingScreen, LoadingSpinner } from '../../components/ui';
import { electionsApi, positionsApi, candidatesApi } from '../../api';
import { Election, Position, Candidate } from '../../types';

// --- Icons (Matching Dashboard Style) ---
const Icons = {
  Back: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>,
  Plus: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>,
  Trash: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Edit: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
  User: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  Search: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  Save: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>,
  Refresh: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
};

export function ManageCandidatesPage() {
  // --- State ---
  const [elections, setElections] = useState<Election[]>([]);
  const [selectedElectionId, setSelectedElectionId] = useState<number | null>(null);
  
  const [positions, setPositions] = useState<Position[]>([]);
  const [selectedPositionId, setSelectedPositionId] = useState<number | null>(null);
  
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  
  // UI State
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form Data
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [formData, setFormData] = useState({ fullName: '', manifesto: '', photoUrl: '' });

  // --- Effects ---
  useEffect(() => {
    loadElections();
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Listen for election created events
  useEffect(() => {
    const handleElectionCreated = () => {
      console.log('Election created event received, reloading elections...');
      loadElections();
    };
    
    window.addEventListener('electionCreated', handleElectionCreated);
    
    return () => {
      window.removeEventListener('electionCreated', handleElectionCreated);
    };
  }, []);

  // Listen for position updates
  useEffect(() => {
    const handlePositionsUpdated = (event: CustomEvent) => {
      if (selectedElectionId && event.detail?.electionId === selectedElectionId) {
        console.log('Positions updated, reloading...');
        loadPositions(selectedElectionId);
      }
    };
    
    window.addEventListener('positionsUpdated', handlePositionsUpdated as EventListener);
    
    return () => {
      window.removeEventListener('positionsUpdated', handlePositionsUpdated as EventListener);
    };
  }, [selectedElectionId]);

  // Refresh when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Tab became visible, reloading elections...');
        loadElections();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (selectedElectionId) {
      console.log('Selected election changed:', selectedElectionId);
      loadPositions(selectedElectionId);
      setSelectedPositionId(null);
      setCandidates([]);
    }
  }, [selectedElectionId]);

  useEffect(() => {
    if (selectedPositionId) {
      console.log('Selected position changed:', selectedPositionId);
      loadCandidates(selectedPositionId);
    } else {
      setCandidates([]);
    }
  }, [selectedPositionId]);

  // --- Loaders ---
  const loadElections = async () => {
    try {
      setIsRefreshing(true);
      setError(null);
      console.log('Fetching elections from API...');
      
      const data = await electionsApi.getAll();
      console.log('Elections received:', data);
      
      setElections(data);
      
      if (data.length > 0) {
        if (!selectedElectionId || !data.some(e => e.election_id === selectedElectionId)) {
          console.log('Setting selected election to:', data[0].election_id);
          setSelectedElectionId(data[0].election_id);
        }
      } else {
        console.log('No elections found in response');
        setSelectedElectionId(null);
        setSelectedPositionId(null);
        setPositions([]);
        setCandidates([]);
      }
    } catch (err) { 
      console.error('Error loading elections:', err); 
      setError('Failed to load elections. Please check your connection.');
    } finally { 
      setIsRefreshing(false);
      setTimeout(() => setIsLoading(false), 500); 
    }
  };

  const loadPositions = async (electionId: number) => {
    try {
      console.log('Fetching positions for election:', electionId);
      const data = await positionsApi.getByElection(electionId);
      console.log('Positions received:', data);
      
      setPositions(data);
      if (data.length > 0) {
        console.log('Setting selected position to:', data[0].position_id);
        setSelectedPositionId(data[0].position_id);
      } else {
        console.log('No positions found for this election');
        setSelectedPositionId(null);
      }
    } catch (err) { 
      console.error('Error loading positions:', err); 
    }
  };

  const loadCandidates = async (positionId: number) => {
    try {
      console.log('Fetching candidates for position:', positionId);
      const data = await candidatesApi.getByPosition(positionId);
      console.log('Candidates received:', data);
      
      setCandidates(data);
    } catch (err) { 
      console.error('Error loading candidates:', err); 
    }
  };

  // --- Handlers ---
  const handleRefresh = async () => {
    await loadElections();
  };

  const handleEdit = (candidate: Candidate) => {
    setEditingCandidate(candidate);
    setFormData({
      fullName: candidate.full_name,
      manifesto: candidate.manifesto || '',
      photoUrl: candidate.photo_url || ''
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPositionId) return;
    setIsSubmitting(true);
    setError(null);

    try {
      let result;
      
      if (editingCandidate) {
        // Update existing candidate
        console.log('Updating candidate ID:', editingCandidate.candidate_id);
        result = await candidatesApi.update(editingCandidate.candidate_id, {
          full_name: formData.fullName,
          manifesto: formData.manifesto || null,
          photo_url: formData.photoUrl || null,
        });
      } else {
        // Create new candidate
        console.log('Creating new candidate for position:', selectedPositionId);
        result = await candidatesApi.create({
          position_id: selectedPositionId,
          full_name: formData.fullName,
          manifesto: formData.manifesto || null,
          photo_url: formData.photoUrl || null,
        });
      }

      if (result) {
        console.log('Candidate saved successfully');
        await loadCandidates(selectedPositionId);
        closeForm();
      } else {
        throw new Error('Operation failed - no data returned');
      }
    } catch (err) {
      console.error('Error submitting candidate:', err);
      setError('Operation failed. Please check console.');
      alert('Operation failed. Please check console.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Confirm deletion?')) return;
    try {
      console.log('Deleting candidate ID:', id);
      const success = await candidatesApi.delete(id);
      
      if (success && selectedPositionId) {
        console.log('Candidate deleted successfully');
        await loadCandidates(selectedPositionId);
      } else {
        throw new Error('Delete failed');
      }
    } catch (err) { 
      console.error('Error deleting candidate:', err); 
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingCandidate(null);
    setFormData({ fullName: '', manifesto: '', photoUrl: '' });
  };

  const currentElectionTitle = elections.find(e => e.election_id === selectedElectionId)?.title;
  const currentPositionTitle = positions.find(p => p.position_id === selectedPositionId)?.title;

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-enter { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .spin { animation: spin 1s linear infinite; }
      `}</style>

      <div className="text-white font-sans selection:bg-cyan-500/30 pb-12">

        <div className="relative z-10 max-w-7xl mx-auto p-6 lg:p-10 space-y-8">
          
          {/* --- Header --- */}
          <header className={`flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5 opacity-0 ${mounted ? 'animate-enter' : ''}`}>
            <div>
              <Link to="/admin" className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm mb-2 group">
                 <Icons.Back /> <span className="group-hover:translate-x-1 transition-transform">Back to Dashboard</span>
              </Link>
              <h1 className="text-3xl font-bold tracking-tight text-white">
                Candidate Management
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Configure rosters for: <span className="text-cyan-400 font-medium">{currentElectionTitle || 'Select an election'}</span>
              </p>
              {error && (
                <p className="text-red-400 text-sm mt-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  Error: {error}
                </p>
              )}
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all hover:border-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed group"
                title="Refresh elections"
              >
                {isRefreshing ? (
                  <svg className="w-5 h-5 spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ) : (
                  <Icons.Refresh />
                )}
              </button>
              <div className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col items-end min-w-36">
                <span className="text-[10px] bg-linear-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent font-bold uppercase tracking-wider">Total Candidates</span>
                <span className="font-mono text-xl text-white font-bold leading-none mt-1">{candidates.length}</span>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* --- Left Column: Controls & Form (Span 4) --- */}
            <div className={`lg:col-span-4 space-y-6 opacity-0 ${mounted ? 'animate-enter delay-100' : ''}`}>
              
              {/* Configuration Card */}
              <div className="rounded-3xl border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl overflow-hidden p-6 shadow-2xl">
                 
                 {showForm ? (
                    // --- Edit/Add Mode ---
                    <div className="animate-[fadeIn_0.3s_ease-out]">
                      <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                        <h3 className="font-bold text-white flex items-center gap-2">
                           <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                           {editingCandidate ? 'Edit Candidate' : 'New Candidate'}
                        </h3>
                        <button onClick={closeForm} className="text-xs text-gray-500 hover:text-white">Cancel</button>
                      </div>

                      <form onSubmit={handleSubmit} className="space-y-4">
                        <InputGroup label="Full Name">
                          <input 
                            required
                            type="text" 
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all outline-none"
                            placeholder="e.g. Sarah Connor"
                            value={formData.fullName}
                            onChange={e => setFormData({...formData, fullName: e.target.value})}
                          />
                        </InputGroup>

                        <InputGroup label="Photo URL">
                          <input 
                            type="url" 
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all outline-none"
                            placeholder="https://..."
                            value={formData.photoUrl}
                            onChange={e => setFormData({...formData, photoUrl: e.target.value})}
                          />
                        </InputGroup>

                        <InputGroup label="Manifesto / Platform">
                          <textarea 
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all outline-none resize-none"
                            rows={4}
                            placeholder="Campaign promises..."
                            value={formData.manifesto}
                            onChange={e => setFormData({...formData, manifesto: e.target.value})}
                          />
                        </InputGroup>

                        <div className="pt-2">
                          <button 
                            disabled={isSubmitting}
                            type="submit" 
                            className="w-full bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                             {isSubmitting ? <LoadingSpinner size="sm" /> : <><Icons.Save /> Save Profile</>}
                          </button>
                        </div>
                      </form>
                    </div>
                 ) : (
                    // --- Selection Mode ---
                    <div className="animate-[fadeIn_0.3s_ease-out]">
                      <h3 className="font-bold text-gray-400 text-xs uppercase tracking-widest mb-6">Context Configuration</h3>
                      
                      <div className="space-y-5">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-white ml-1">Select Election</label>
                          <div className="relative">
                            <select 
                              value={selectedElectionId || ''}
                              onChange={(e) => setSelectedElectionId(Number(e.target.value))}
                              className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-500/50 outline-none cursor-pointer hover:bg-white/10 transition-colors"
                            >
                              {elections.length === 0 ? (
                                <option value="" disabled className="bg-gray-900">No elections available</option>
                              ) : (
                                elections.map(e => (
                                  <option key={e.election_id} value={e.election_id} className="bg-gray-900">
                                    {e.title} (ID: {e.election_id})
                                  </option>
                                ))
                              )}
                            </select>
                            <div className="absolute right-4 top-3.5 pointer-events-none text-gray-500">
                              {isRefreshing ? (
                                <svg className="w-5 h-5 spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                              ) : (
                                <Icons.Search />
                              )}
                            </div>
                          </div>
                          {elections.length > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                              {elections.length} election{elections.length !== 1 ? 's' : ''} loaded
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-white ml-1">Target Position</label>
                          <div className="relative">
                            <select 
                              value={selectedPositionId || ''}
                              onChange={(e) => setSelectedPositionId(Number(e.target.value))}
                              disabled={positions.length === 0}
                              className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-500/50 outline-none cursor-pointer hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                               <option value="" disabled className="bg-gray-900">
                                 {positions.length === 0 ? 'No positions available' : 'Select a position...'}
                               </option>
                               {positions.map(p => (
                                 <option key={p.position_id} value={p.position_id} className="bg-gray-900">
                                   {p.title} (ID: {p.position_id})
                                 </option>
                               ))}
                            </select>
                            <div className="absolute right-4 top-3.5 pointer-events-none text-gray-500">▼</div>
                          </div>
                        </div>

                        <div className="pt-6 border-t border-white/5 mt-6">
                           <button 
                             onClick={() => setShowForm(true)}
                             disabled={!selectedPositionId}
                             className="w-full group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/30 text-gray-300 hover:text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                           >
                              <div className="p-1 rounded bg-cyan-500/20 text-cyan-400 group-hover:bg-cyan-400 group-hover:text-black transition-colors">
                                <Icons.Plus />
                              </div>
                              Add New Candidate
                           </button>
                        </div>
                      </div>
                    </div>
                 )}
              </div>
            </div>

            {/* --- Right Column: Grid (Span 8) --- */}
            <div className={`lg:col-span-8 space-y-6 opacity-0 ${mounted ? 'animate-enter delay-200' : ''}`}>
               
               {/* Context Header */}
               <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white flex items-center gap-3">
                    <span className="p-2 rounded-lg bg-white/5 border border-white/10"><Icons.User /></span>
                    {currentPositionTitle ? `${currentPositionTitle} Candidates` : 'Select Position'}
                  </h2>
                  
                  {selectedPositionId && candidates.length > 0 && (
                    <span className="text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-full">
                      {candidates.length} candidate{candidates.length !== 1 ? 's' : ''}
                    </span>
                  )}
               </div>

               {elections.length === 0 ? (
                  <EmptyState message="No elections found. Create an election first to manage candidates." />
               ) : !selectedPositionId ? (
                  <EmptyState message="Select an election and position to view the roster." />
               ) : candidates.length === 0 ? (
                  <EmptyState message="No candidates found for this position. Use the panel to add one." />
               ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {candidates.map(candidate => (
                      <CandidateCard 
                        key={candidate.candidate_id} 
                        candidate={candidate} 
                        onEdit={() => handleEdit(candidate)}
                        onDelete={() => handleDelete(candidate.candidate_id)}
                      />
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

// --- Sub-Components ---

function InputGroup({ label, children }: { label: string, children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">{label}</label>
      {children}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-white/10 bg-[#0a0a0a]/30 p-12 flex flex-col items-center justify-center text-center">
       <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4 text-gray-600">
         <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
       </div>
       <p className="text-gray-500 text-sm max-w-xs">{message}</p>
    </div>
  );
}

function CandidateCard({ candidate, onEdit, onDelete }: { candidate: Candidate, onEdit: () => void, onDelete: () => void }) {
  return (
    <div className="group relative bg-[#0a0a0a] border border-white/10 hover:border-cyan-500/30 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden">
       {/* Background Glow on Hover */}
       <div className="absolute inset-0 bg-linear-to-br from-cyan-900/0 to-blue-900/0 group-hover:from-cyan-900/10 group-hover:to-blue-900/10 transition-colors duration-500" />
       
       <div className="relative z-10 flex items-start gap-4">
          <div className="relative shrink-0">
             {candidate.photo_url ? (
               <img src={candidate.photo_url} alt={candidate.full_name} className="w-14 h-14 rounded-full object-cover border-2 border-white/10 group-hover:border-cyan-400/50 transition-colors shadow-lg" />
             ) : (
               <div className="w-14 h-14 rounded-full bg-linear-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center text-gray-500 group-hover:text-cyan-400 transition-colors">
                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
               </div>
             )}
             <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#0a0a0a] rounded-full flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
             </div>
          </div>

          <div className="flex-1 min-w-0">
             <div className="flex justify-between items-start">
               <h3 className="text-white font-bold truncate pr-2 group-hover:text-cyan-400 transition-colors">{candidate.full_name}</h3>
               <span className="text-[10px] font-mono text-gray-600 bg-white/5 px-1.5 py-0.5 rounded">#{candidate.candidate_id}</span>
             </div>
             
             <p className="text-xs text-gray-500 mt-2 line-clamp-2 min-h-[2.5em] leading-relaxed">
               {candidate.manifesto || "No manifesto provided."}
             </p>

             <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5 opacity-60 group-hover:opacity-100 transition-opacity">
               <button onClick={onEdit} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-xs font-medium text-gray-400 hover:text-cyan-300 transition-colors">
                 <Icons.Edit /> Edit
               </button>
               <button onClick={onDelete} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-xs font-medium text-gray-400 hover:text-red-300 transition-colors">
                 <Icons.Trash /> Delete
               </button>
             </div>
          </div>
       </div>
    </div>
  );
}