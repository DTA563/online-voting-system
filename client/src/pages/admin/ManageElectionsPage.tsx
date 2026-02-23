import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { LoadingSpinner } from '../../components/ui';
import { electionsApi } from '../../api';
import api from '../../api/axios';
import { Election } from '../../types';

// --- Icons (Consistent Set) ---
const Icons = {
  Back: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>,
  Calendar: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  Clock: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Plus: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>,
  Trash: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Edit: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
  Save: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>,
  Upload: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>,
  FileText: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  Check: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" /></svg>,
};

export function ManageElectionsPage() {
  // --- State ---
  const [elections, setElections] = useState<Election[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  // Form State
  const [showForm, setShowForm] = useState(false);
  const [editingElection, setEditingElection] = useState<Election | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form Data
  const [formData, setFormData] = useState({
    title: '',
    startDate: '',
    endDate: '',
    status: 'upcoming' as 'upcoming' | 'active' | 'completed'
  });

  // --- Effects ---
  useEffect(() => {
    loadElections();
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

 const loadElections = async () => {
  try {
    console.log('Fetching elections in ManageElectionsPage...');
    
    // Make a direct API call to see the raw response
    const rawResponse = await api.get('/elections', {
      params: { _t: new Date().getTime() }
    });
    console.log('RAW API Response:', rawResponse);
    console.log('RAW API Response data:', rawResponse.data);
    
    // Now try using the api function
    const data = await electionsApi.getAll();
    console.log('Processed data from electionsApi:', data);
    
    if (Array.isArray(data)) {
      setElections(data);
      console.log('Elections set in state:', data.length);
    } else {
      console.error('Data is not an array:', data);
      setElections([]);
    }
  } catch (err: any) {
    console.error('Error loading elections:', err);
    setElections([]);
  } finally {
    setTimeout(() => setIsLoading(false), 300);
  }
};

  // --- Handlers ---
  const handleEdit = (election: Election) => {
    setEditingElection(election);
    setFormData({
      title: election.title,
      startDate: election.start_date.slice(0, 16),
      endDate: election.end_date.slice(0, 16),
      status: election.status
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingElection(null);
    setFormData({ title: '', startDate: '', endDate: '', status: 'upcoming' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        start_date: formData.startDate,
        end_date: formData.endDate,
        status: formData.status,
      };

      if (editingElection) {
        await electionsApi.update(editingElection.election_id, payload);
      } else {
        await electionsApi.create(payload);
      }
      await loadElections();
      closeForm();
    } catch (err) {
      console.error(err);
      alert("Failed to save. Check console.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure? This will delete all votes associated with this election.')) return;
    try {
      await electionsApi.delete(id);
      await loadElections();
    } catch (err) { console.error(err); }
  };

  // --- Voter Registry Upload ---
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadElectionId, setUploadElectionId] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ success: boolean; message: string } | null>(null);
  const [parsedIds, setParsedIds] = useState<string[]>([]);
  const [fileName, setFileName] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      // Parse CSV/TXT — expects one ID per line (or comma-separated)
      const ids = text
        .split(/[\n,\r]+/)
        .map(id => id.trim())
        .filter(id => id.length > 0 && id !== 'user_id' && id !== 'id' && id !== 'student_id'); // skip header rows
      setParsedIds(ids);
      setUploadResult(null);
    };
    reader.readAsText(file);
  };

  const handleUploadRegistry = async () => {
    if (!uploadElectionId || parsedIds.length === 0) return;
    setIsUploading(true);
    setUploadResult(null);
    try {
      const res = await electionsApi.uploadVoterRegistry(uploadElectionId, parsedIds);
      setUploadResult({ success: true, message: (res as any).message || `Successfully registered ${parsedIds.length} voters.` });
      setParsedIds([]);
      setFileName('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      setUploadResult({ success: false, message: err.response?.data?.message || 'Upload failed. Please try again.' });
    } finally {
      setIsUploading(false);
    }
  };

  const closeUploadPanel = () => {
    setUploadElectionId(null);
    setParsedIds([]);
    setFileName('');
    setUploadResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };



  // Calculate stats
  const activeCount = elections.filter(e => e.status === 'active').length;

  // --- Loading Skeleton ---
  if (isLoading) {
    return (
      <div className="p-6 lg:p-10 space-y-8 animate-pulse">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5">
          <div className="space-y-3">
            <div className="h-4 w-24 bg-white/10 rounded"></div>
            <div className="h-8 w-56 bg-white/10 rounded"></div>
            <div className="h-4 w-72 bg-white/10 rounded"></div>
          </div>
          <div className="flex gap-4">
            <div className="h-16 w-28 bg-white/5 rounded-xl border border-white/10"></div>
            <div className="h-12 w-36 bg-white/5 rounded-xl border border-white/10"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-72 bg-white/5 rounded-2xl border border-white/10"></div>)}
        </div>
      </div>
    );
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
                Election Registry
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Create and monitor voting timelines.
              </p>
            </div>

            <div className="flex gap-4">
              <div className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col items-end">
                <span className="text-[10px] bg-emerald-400 bg-clip-text text-transparent font-bold uppercase tracking-wider">Live Now</span>
                <span className="font-mono text-xl text-white font-bold leading-none mt-1">{activeCount}</span>
              </div>
              <button 
                onClick={() => setShowForm(true)}
                disabled={showForm}
                className={`group flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 ${showForm ? 'bg-white/5 text-gray-500 cursor-not-allowed' : 'bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white'}`}
              >
                <Icons.Plus /> Create New
              </button>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* --- Left Column: Create/Edit Form (Span 4 or Full if Mobile) --- */}
            {showForm && (
              <div className="lg:col-span-12 animate-in slide-in-from-top-4 fade-in duration-500">
                <div className="rounded-3xl border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl p-8 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-500 to-cyan-500"></div>
                  
                  <div className="flex justify-between items-center mb-8">
                     <h3 className="text-xl font-bold text-white flex items-center gap-2">
                       {editingElection ? 'Edit Configuration' : 'New Election Setup'}
                     </h3>
                     <button onClick={closeForm} className="text-sm text-gray-500 hover:text-white transition-colors">Close</button>
                  </div>

                  <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-2 block">Election Title</label>
                      <input 
                        type="text" 
                        required
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all placeholder-gray-600"
                        placeholder="e.g. 2026 Student Council General Election"
                        value={formData.title}
                        onChange={e => setFormData({...formData, title: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Start Date (UTC)</label>
                      <input 
                        type="datetime-local" 
                        required
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500/50 outline-none transition-all scheme-dark"
                        value={formData.startDate}
                        onChange={e => setFormData({...formData, startDate: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">End Date (UTC)</label>
                      <input 
                        type="datetime-local" 
                        required
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500/50 outline-none transition-all scheme-dark"
                        value={formData.endDate}
                        onChange={e => setFormData({...formData, endDate: e.target.value})}
                      />
                    </div>

                    <div className="md:col-span-2">
                       <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Initial Status</label>
                       <div className="grid grid-cols-3 gap-3">
                          {(['upcoming', 'active', 'completed'] as const).map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setFormData({...formData, status: s})}
                              className={`py-3 rounded-xl border text-sm font-medium transition-all capitalize ${
                                formData.status === s 
                                  ? 'bg-blue-600/20 border-blue-500 text-blue-400' 
                                  : 'bg-black/30 border-white/10 text-gray-500 hover:bg-white/5'
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                       </div>
                    </div>

                    <div className="md:col-span-2 pt-4 border-t border-white/5 flex gap-3">
                      <button 
                         type="submit" 
                         disabled={isSubmitting}
                         className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? <LoadingSpinner size="sm"/> : <><Icons.Save /> Save Configuration</>}
                      </button>
                      <button 
                         type="button" 
                         onClick={closeForm}
                         className="px-8 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium py-3 rounded-xl transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* --- Voter Registry Upload Panel --- */}
            {uploadElectionId && (
              <div className="lg:col-span-12 animate-in slide-in-from-top-4 fade-in duration-500">
                <div className="rounded-3xl border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl p-8 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-emerald-500 to-cyan-500"></div>
                  
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <Icons.Upload />
                      </div>
                      Upload Voter Master List
                    </h3>
                    <button onClick={closeUploadPanel} className="text-sm text-gray-500 hover:text-white transition-colors">Close</button>
                  </div>

                  <p className="text-gray-400 text-sm mb-6">
                    Upload a <span className="text-cyan-400 font-medium">.csv</span> or <span className="text-cyan-400 font-medium">.txt</span> file containing student/user IDs (one per line or comma-separated) to register eligible voters for: <span className="text-white font-semibold">{elections.find(e => e.election_id === uploadElectionId)?.title}</span>
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* File Input Area */}
                    <div className="space-y-4">
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-white/10 hover:border-cyan-500/30 rounded-2xl p-8 text-center cursor-pointer transition-all hover:bg-white/2 group"
                      >
                        <input 
                          ref={fileInputRef}
                          type="file" 
                          accept=".csv,.txt" 
                          onChange={handleFileSelect}
                          className="hidden" 
                        />
                        <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-4 group-hover:bg-cyan-500/10 transition-colors">
                          <Icons.FileText />
                        </div>
                        {fileName ? (
                          <>
                            <p className="text-white font-medium">{fileName}</p>
                            <p className="text-emerald-400 text-sm mt-1">{parsedIds.length} IDs detected</p>
                          </>
                        ) : (
                          <>
                            <p className="text-gray-400 text-sm">Click to select file or drag & drop</p>
                            <p className="text-gray-600 text-xs mt-1">Supports .csv and .txt</p>
                          </>
                        )}
                      </div>

                      <button 
                        onClick={handleUploadRegistry}
                        disabled={parsedIds.length === 0 || isUploading}
                        className="w-full bg-linear-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 text-white font-bold py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                      >
                        {isUploading ? <LoadingSpinner size="sm" /> : <><Icons.Upload /> Register {parsedIds.length} Voters</>}
                      </button>
                    </div>

                    {/* Preview / Status */}
                    <div className="space-y-4">
                      {uploadResult && (
                        <div className={`p-4 rounded-xl border ${uploadResult.success ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-red-500/10 border-red-500/20 text-red-300'}`}>
                          <div className="flex items-center gap-2 font-bold text-sm mb-1">
                            {uploadResult.success ? <Icons.Check /> : <Icons.Trash />}
                            {uploadResult.success ? 'Upload Successful' : 'Upload Failed'}
                          </div>
                          <p className="text-xs opacity-80">{uploadResult.message}</p>
                        </div>
                      )}
                      
                      {parsedIds.length > 0 && (
                        <div className="rounded-xl bg-black/50 border border-white/10 overflow-hidden">
                          <div className="px-4 py-3 bg-white/2 border-b border-white/5 flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">ID Preview</span>
                            <span className="text-xs text-cyan-400 font-mono">{parsedIds.length} entries</span>
                          </div>
                          <div className="p-4 max-h-48 overflow-y-auto space-y-1 font-mono text-xs text-gray-400 no-scrollbar">
                            {parsedIds.slice(0, 50).map((id, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <span className="text-gray-600 w-6 text-right">{i + 1}.</span>
                                <span className="text-gray-300">{id}</span>
                              </div>
                            ))}
                            {parsedIds.length > 50 && (
                              <div className="text-gray-600 pt-2 border-t border-white/5">...and {parsedIds.length - 50} more</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* --- Right Column: Election List (Full Width) --- */}
            <div className={`lg:col-span-12 opacity-0 ${mounted ? 'animate-enter delay-100' : ''}`}>
               {elections.length === 0 ? (
                 <div className="rounded-3xl border border-dashed border-white/10 bg-[#0a0a0a]/30 p-20 flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-6 text-gray-600">
                       <Icons.Calendar />
                    </div>
                    <h3 className="text-white font-bold text-lg">No Elections Found</h3>
                    <p className="text-gray-500 text-sm mt-2 mb-6">Get started by creating your first voting timeline.</p>
                    <button onClick={() => setShowForm(true)} className="text-blue-400 hover:text-blue-300 font-semibold text-sm">Create Election &rarr;</button>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {elections.map((election) => (
                      <ElectionCard 
                        key={election.election_id} 
                        election={election} 
                        onEdit={() => handleEdit(election)}
                        onDelete={() => handleDelete(election.election_id)}
                        onUploadVoters={() => { setUploadElectionId(election.election_id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
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

function ElectionCard({ election, onEdit, onDelete, onUploadVoters }: { election: Election, onEdit: () => void, onDelete: () => void, onUploadVoters: () => void }) {
  const isCompleted = election.status === 'completed';
  const isActive = election.status === 'active';

  return (
    <div className={`group relative bg-[#0a0a0a] border rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 overflow-hidden
      ${isActive ? 'border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.1)]' : 'border-white/10 hover:border-blue-500/30'}
    `}>
       {/* Active Glow Effect */}
       {isActive && <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[50px] pointer-events-none" />}
       
       <div className="relative z-10 flex flex-col h-full">
         
         {/* Top Row: Status & Title */}
         <div className="flex justify-between items-start mb-4">
            <StatusBadge status={election.status} />
            <div className="flex gap-1">
              <button onClick={onUploadVoters} title="Upload Voter List" className="p-2 rounded-lg hover:bg-emerald-900/20 text-gray-400 hover:text-emerald-400 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              </button>
              <button onClick={onEdit} className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"><Icons.Edit /></button>
              <button onClick={onDelete} className="p-2 rounded-lg hover:bg-red-900/20 text-gray-400 hover:text-red-400 transition-colors"><Icons.Trash /></button>
            </div>
         </div>

         <h3 className={`text-lg font-bold mb-1 ${isCompleted ? 'text-gray-400' : 'text-white'}`}>
           {election.title}
         </h3>
         <p className="text-xs text-gray-600 font-mono mb-6">ID: {election.election_id}</p>

         {/* Timeline */}
         <div className="mt-auto space-y-3 pt-4 border-t border-white/5">
            <div className="flex items-center gap-3">
              <div className={`p-1.5 rounded-md ${isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-gray-400'}`}>
                 <Icons.Calendar />
              </div>
              <div>
                 <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Starts</p>
                 <p className="text-sm text-gray-300 font-medium">{new Date(election.start_date).toLocaleDateString()}</p>
                 <p className="text-xs text-gray-500">{new Date(election.start_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
              </div>
            </div>
            
            <div className="w-0.5 h-3 bg-white/10 ml-3.5"></div>

            <div className="flex items-center gap-3">
              <div className={`p-1.5 rounded-md ${isActive ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-gray-400'}`}>
                 <Icons.Clock />
              </div>
              <div>
                 <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Ends</p>
                 <p className="text-sm text-gray-300 font-medium">{new Date(election.end_date).toLocaleDateString()}</p>
                 <p className="text-xs text-gray-500">{new Date(election.end_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
              </div>
            </div>
         </div>

         {/* Upload Voters Button */}
         <button 
           onClick={onUploadVoters}
           className="mt-6 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-white/10 hover:border-emerald-500/30 bg-white/2 hover:bg-emerald-500/5 text-gray-500 hover:text-emerald-400 text-xs font-bold uppercase tracking-wider transition-all group"
         >
           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
           Upload Voter List
         </button>

       </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { color: string; label: string; icon: boolean }> = {
    active: { color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', label: 'Live Now', icon: true },
    upcoming: { color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', label: 'Upcoming', icon: false },
    completed: { color: 'bg-gray-500/10 text-gray-400 border-gray-500/20', label: 'Ended', icon: false },
  };
  
  const conf = configs[status] || configs.completed;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-widest ${conf.color}`}>
      {conf.icon && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
      {conf.label}
    </span>
  );
}