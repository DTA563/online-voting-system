import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LoadingSpinner, LoadingScreen } from '../../components/ui';
import { electionsApi, positionsApi } from '../../api';
import { Election, Position } from '../../types';

// --- Icons ---
const Icons = {
  Back: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>,
  Hierarchy: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
  Plus: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>,
  Trash: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Edit: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
  Save: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" /></svg>,
  Filter: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>,
  Refresh: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
};

export function ManagePositionsPage() {
  // --- State ---
  const [elections, setElections] = useState<Election[]>([]);
  const [selectedElectionId, setSelectedElectionId] = useState<number | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState('');

  // Form
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [title, setTitle] = useState('');

  // --- Effects ---
  useEffect(() => {
    loadElections();
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (selectedElectionId) {
      loadPositions(selectedElectionId);
    } else {
      setPositions([]);
    }
  }, [selectedElectionId]);

  // Listen for position updates from other components
  useEffect(() => {
    const handlePositionsUpdated = (event: CustomEvent) => {
      if (selectedElectionId && event.detail?.electionId === selectedElectionId) {
        console.log('Positions updated in another component, reloading...');
        loadPositions(selectedElectionId);
      }
    };
    
    window.addEventListener('positionsUpdated', handlePositionsUpdated as EventListener);
    
    return () => {
      window.removeEventListener('positionsUpdated', handlePositionsUpdated as EventListener);
    };
  }, [selectedElectionId]);

  // --- Data Loading ---
  const loadElections = async () => {
    try {
      console.log('Loading elections...');
      const data = await electionsApi.getAll();
      console.log('Elections loaded:', data);
      setElections(data);
      if (data.length > 0) {
        console.log('Setting selected election to:', data[0].election_id);
        setSelectedElectionId(data[0].election_id);
      }
    } catch (err) {
      console.error('Error loading elections:', err);
      setError('Failed to load elections registry.');
    } finally {
      setTimeout(() => setIsLoading(false), 300);
    }
  };

  const loadPositions = async (electionId: number) => {
    try {
      setError('');
      setDebugInfo('');
      console.log('Loading positions for election:', electionId);
      const data = await positionsApi.getByElection(electionId);
      console.log('Positions loaded:', data);
      setPositions(data);
      
      if (data.length === 0) {
        setDebugInfo('No positions found for this election. You can create one using the form.');
      }
    } catch (err) { 
      console.error('Error loading positions:', err);
      setError('Failed to retrieve position hierarchy. Please check if the positions endpoint exists.'); 
    }
  };

  // --- Handlers ---
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
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  const handleRefresh = async () => {
    if (selectedElectionId) {
      await loadPositions(selectedElectionId);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedElectionId) return;
    setError('');
    setIsSubmitting(true);
    setDebugInfo('');

    try {
      let result;
      
      if (editingPosition) {
        // Update existing position
        console.log('Updating position ID:', editingPosition.position_id);
        result = await positionsApi.update(editingPosition.position_id, title);
        if (!result) throw new Error('Update failed');
        console.log('Position updated successfully');
      } else {
        // Create new position
        console.log('Creating new position for election:', selectedElectionId);
        result = await positionsApi.create(selectedElectionId, title);
        if (!result) throw new Error('Create failed');
        console.log('Position created successfully');
      }
      
      // Reload positions
      await loadPositions(selectedElectionId);
      
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('positionsUpdated', { 
        detail: { electionId: selectedElectionId } 
      }));
      
      resetForm();
      
    } catch (err: any) { 
      console.error('Operation failed:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Unknown error';
      setError(`Operation failed: ${errorMessage}. Please check the console for details.`); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('⚠️ Removing this position will delete all associated candidates. Continue?')) return;
    try {
      console.log('Deleting position ID:', id);
      const success = await positionsApi.delete(id);
      
      if (success) {
        console.log('Position deleted successfully');
        
        if (selectedElectionId) {
          await loadPositions(selectedElectionId);
          
          // Dispatch event to notify other components
          window.dispatchEvent(new CustomEvent('positionsUpdated', { 
            detail: { electionId: selectedElectionId } 
          }));
        }
      } else {
        throw new Error('Delete failed');
      }
    } catch (err: any) { 
      console.error('Error deleting position:', err);
      setError(`Failed to delete position: ${err.response?.data?.message || err.message}`); 
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <style>{`
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-enter { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
      `}</style>

      <div className="text-white font-sans selection:bg-blue-500/30 pb-12">
        <div className="relative z-10 max-w-7xl mx-auto p-6 lg:p-10 space-y-10">
          
          {/* --- Header --- */}
          <header className={`flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5 opacity-0 ${mounted ? 'animate-enter' : ''}`}>
            <div>
              <Link to="/admin" className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm mb-2 group">
                 <Icons.Back /> <span className="group-hover:translate-x-1 transition-transform">Back to Dashboard</span>
              </Link>
              <h1 className="text-3xl font-bold tracking-tight text-white bg-clip-text">
                Manage Positions
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Define the ballot hierarchy (e.g., President, Secretary) for each election.
              </p>
            </div>

            <div className="flex gap-3">
              {selectedElectionId && (
                <button
                  onClick={handleRefresh}
                  className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all hover:border-blue-500/30"
                  title="Refresh positions"
                >
                  <Icons.Refresh />
                </button>
              )}
              {!showForm && (
                <button 
                  onClick={() => setShowForm(true)}
                  disabled={!selectedElectionId}
                  className={`group flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 ${
                      !selectedElectionId 
                      ? 'bg-white/5 text-gray-500 cursor-not-allowed' 
                      : 'bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white'
                  }`}
                >
                  <Icons.Plus /> Add Position
                </button>
              )}
            </div>
          </header>

          {/* --- Error Banner --- */}
          {error && (
            <div className="animate-in fade-in slide-in-from-top-2 bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-xl flex items-center gap-3">
               <span className="p-1 bg-red-500/20 rounded-full"><Icons.Trash /></span> 
               <span className="flex-1">{error}</span>
               <button onClick={() => setError('')} className="text-red-400 hover:text-red-300">×</button>
            </div>
          )}

          {/* --- Debug Info --- */}
          {debugInfo && (
            <div className="bg-blue-500/10 border border-blue-500/20 text-blue-200 p-3 rounded-xl text-sm">
              {debugInfo}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* --- Left Column: Context & Form (Span 4) --- */}
            <div className={`lg:col-span-4 space-y-6 opacity-0 ${mounted ? 'animate-enter delay-100' : ''}`}>
              
              {/* Context Selector */}
              <div className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/50 group-hover:bg-blue-500 transition-colors"></div>
                <h3 className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Icons.Filter /> Active Context
                </h3>
                
                <div className="relative">
                    <select
                        value={selectedElectionId || ''}
                        onChange={(e) => setSelectedElectionId(Number(e.target.value))}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 appearance-none cursor-pointer transition-all hover:bg-white/5"
                    >
                        <option value="" disabled className="bg-gray-900">Select an Election...</option>
                        {elections.map((election) => (
                            <option key={election.election_id} value={election.election_id} className="bg-gray-900">
                                {election.title}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                </div>
                
                {selectedElectionId && (
                  <p className="text-xs text-gray-500 mt-3">
                    Election ID: {selectedElectionId} | Positions: {positions.length}
                  </p>
                )}
              </div>

              {/* Create/Edit Form */}
              {showForm && (
                <div className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative overflow-hidden animate-in slide-in-from-left-4 fade-in duration-300 shadow-[0_0_30px_rgba(59,130,246,0.1)]">
                   <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-500 to-cyan-500"></div>
                   
                   <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                     <span className={`w-2 h-2 rounded-full ${editingPosition ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
                     {editingPosition ? 'Edit Position' : 'New Position'}
                   </h3>

                   <form onSubmit={handleSubmit} className="space-y-5">
                     <div>
                       <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Title</label>
                       <input
                         type="text"
                         value={title}
                         onChange={(e) => setTitle(e.target.value)}
                         placeholder="e.g. President"
                         className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                         required
                         autoFocus
                       />
                     </div>

                     <div className="flex gap-3 pt-2">
                       <button 
                         type="submit" 
                         disabled={isSubmitting}
                         className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                       >
                         {isSubmitting ? <LoadingSpinner size="sm" /> : <><Icons.Save /> Save</>}
                       </button>
                       <button 
                         type="button" 
                         onClick={resetForm}
                         className="px-4 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm font-medium"
                       >
                         Cancel
                       </button>
                     </div>
                   </form>
                </div>
              )}
            </div>

            {/* --- Right Column: List (Span 8) --- */}
            <div className={`lg:col-span-8 opacity-0 ${mounted ? 'animate-enter delay-200' : ''}`}>
              <div className="bg-[#0a0a0a]/40 backdrop-blur-md border border-white/10 rounded-3xl min-h-125 flex flex-col">
                 
                 {/* List Header */}
                 <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                          <Icons.Hierarchy />
                        </div>
                        <h3 className="font-bold text-white text-lg">Position Hierarchy</h3>
                    </div>
                    <span className="text-[10px] font-bold text-gray-500 bg-white/5 px-2 py-1 rounded-md uppercase tracking-wider border border-white/5">
                       {positions.length} defined
                    </span>
                 </div>

                 {/* List Content */}
                 <div className="flex-1 p-2">
                    {!selectedElectionId ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-4 py-20">
                           <div className="text-6xl opacity-20 animate-pulse">👈</div>
                           <p>Select an election context to view positions.</p>
                        </div>
                    ) : positions.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500 py-16">
                           <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                              <Icons.Hierarchy />
                           </div>
                           <p className="font-medium text-white text-lg mb-2">No positions found</p>
                           <p className="text-sm text-gray-500 mb-6">Start by adding roles for this election.</p>
                           <button 
                             onClick={() => setShowForm(true)} 
                             className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all flex items-center gap-2"
                           >
                             <Icons.Plus /> Create First Position
                           </button>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                            {positions.map((position, index) => (
                                <div
                                  key={position.position_id}
                                  className="group flex items-center justify-between p-4 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all duration-200"
                                >
                                  <div className="flex items-center gap-5">
                                    {/* Stylized Number/Index */}
                                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-black/40 border border-white/10 text-gray-500 font-mono text-sm font-bold group-hover:text-blue-400 group-hover:border-blue-500/30 transition-colors shadow-inner">
                                       {String(index + 1).padStart(2, '0')}
                                    </div>
                                    
                                    <div>
                                      <h3 className="font-bold text-white text-lg group-hover:text-blue-100 transition-colors">{position.title}</h3>
                                      <p className="text-[10px] text-gray-600 font-mono uppercase tracking-widest">ID: {position.position_id}</p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:translate-x-4 md:group-hover:translate-x-0 md:group-hover:opacity-100 transition-all duration-300">
                                    <button 
                                      onClick={() => handleEdit(position)}
                                      className="p-2.5 rounded-lg bg-white/5 hover:bg-blue-500/20 text-gray-400 hover:text-blue-400 transition-colors"
                                      title="Edit"
                                    >
                                      <Icons.Edit />
                                    </button>
                                    <button 
                                      onClick={() => handleDelete(position.position_id)}
                                      className="p-2.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                                      title="Delete"
                                    >
                                      <Icons.Trash />
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
      </div>
    </>
  );
}