import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LoadingSpinner } from '../../components/ui';
import { User } from '../../types';
import api from '../../api/axios';

// --- Icons (Matching Dashboard Style) ---
const Icons = {
  Back: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>,
  Users: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Shield: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  Check: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" /></svg>,
  Trash: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Clock: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  User: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
};

export function ManageVotersPage() {
  const [voters, setVoters] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [userToRevoke, setUserToRevoke] = useState<string | null>(null);

  useEffect(() => {
    loadVoters();
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const loadVoters = async () => {
    try {
      const response = await api.get('/users?role=voter');
      setVoters(response.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load voters');
      console.error(err);
    } finally {
      setTimeout(() => setIsLoading(false), 300);
    }
  };

  const executeRevoke = async () => {
    if (!userToRevoke) return;
    setProcessingId(userToRevoke);
    try {
      await api.patch(`/users/status/${userToRevoke}`, { status: 'deactivated' });
      setSuccessMessage('Access revoked successfully');
      await loadVoters();
      setTimeout(() => setSuccessMessage(''), 3000);
      setUserToRevoke(null);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to revoke user access');
      console.error(err);
      setUserToRevoke(null);
    } finally {
      setProcessingId(null);
    }
  };

  const executeGrant = async (id: string) => {
    setProcessingId(id);
    try {
      await api.patch(`/users/status/${id}`, { status: 'active' });
      setSuccessMessage('Access granted successfully');
      await loadVoters();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to grant user access');
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = (id: string) => {
    setUserToRevoke(id);
  };

  // --- Derived State ---
  const filteredVoters = voters.filter(
    (voter) =>
      voter.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voter.user_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <div className="flex gap-3">
            <div className="h-16 w-28 bg-white/5 rounded-xl border border-white/10"></div>
            <div className="h-16 w-28 bg-white/5 rounded-xl border border-white/10"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-40 bg-white/5 rounded-2xl border border-white/10"></div>)}
        </div>
        <div className="h-96 bg-white/5 rounded-3xl border border-white/10"></div>
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
        .delay-300 { animation-delay: 300ms; }
      `}</style>

      <div className="text-white font-sans selection:bg-blue-500/30 pb-12">

        
      {/* Revoke Confirmation Modal */}
      {userToRevoke && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl relative overflow-hidden animate-enter">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-red-500/10 rounded-xl text-red-500 shrink-0">
                <Icons.Trash />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Revoke Access</h3>
                <p className="text-sm text-gray-400">
                  Are you sure you want to revoke access for this user? 
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setUserToRevoke(null)}
                disabled={!!processingId}
                className="flex-1 py-2.5 px-4 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 hover:text-white transition-colors text-sm font-semibold disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={executeRevoke}
                disabled={!!processingId}
                className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white transition-colors text-sm font-semibold shadow-lg shadow-red-900/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {processingId ? <LoadingSpinner size="sm" /> : 'Yes, Revoke Access'}
              </button>
            </div>
          </div>
        </div>
      )}

        <div className="relative z-10 max-w-7xl mx-auto p-6 lg:p-10 space-y-10">

          {/* --- Header --- */}
          <header className={`flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5 opacity-0 ${mounted ? 'animate-enter' : ''}`}>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">
                Voter Database
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Manage the electoral roll.
              </p>
            </div>

            <div className="flex gap-3">
              <div className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col items-end min-w-28">
                <span className="text-[10px] bg-linear-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent font-bold uppercase tracking-wider">Registered</span>
                <span className="font-mono text-xl text-white font-bold leading-none mt-1">{voters.length}</span>
              </div>
            </div>
          </header>

          {/* --- Feedback Toasts --- */}
          {error && (
            <div className="animate-in fade-in slide-in-from-top-2 bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-xl flex items-center gap-3">
              <span className="p-1 bg-red-500/20 rounded-full"><Icons.Trash /></span> {error}
            </div>
          )}
          {successMessage && (
            <div className="animate-in fade-in slide-in-from-top-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 p-4 rounded-xl flex items-center gap-3">
              <span className="p-1 bg-emerald-500/20 rounded-full"><Icons.Check /></span> {successMessage}
            </div>
          )}

          {/* --- Registered Voters Section --- */}
          <div className={`opacity-0 ${mounted ? 'animate-enter delay-200' : ''}`}>
            
            {/* Section Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 border border-blue-500/20">
                  <Icons.Shield />
                </div>
                <div>
                  <h2 className="font-bold text-white text-lg">Registered Voter Roll</h2>
                  <p className="text-xs text-gray-500">{voters.length} registered voter{voters.length !== 1 ? 's' : ''} in the system</p>
                </div>
              </div>
              
              {/* Search */}
              <div className="relative w-64">
                <input
                  type="text"
                  placeholder="Search voters..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 pl-10 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all hover:bg-white/5"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="bg-[#0a0a0a]/40 backdrop-blur-md border border-white/10 rounded-3xl min-h-100 flex flex-col overflow-hidden">
              {filteredVoters.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20 text-gray-500">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4 text-gray-600">
                    <Icons.Users />
                  </div>
                  <p className="font-medium text-white">{searchTerm ? 'No matches found' : 'No registered voters yet'}</p>
                  <p className="text-sm mt-1">{searchTerm ? 'Try a different search term.' : ''}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-black/40 text-xs uppercase text-gray-500 font-bold tracking-wider">
                      <tr>
                        <th className="px-6 py-4 border-b border-white/5">User ID</th>
                        <th className="px-6 py-4 border-b border-white/5">Full Name</th>
                        <th className="px-6 py-4 border-b border-white/5">Status</th>
                        <th className="px-6 py-4 border-b border-white/5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-white/5">
                      {filteredVoters.map((voter) => (
                        <tr key={voter.user_id} className="hover:bg-white/2 transition-colors group">
                          <td className="px-6 py-4 font-mono text-blue-200 text-xs">
                            {voter.user_id}
                          </td>
                          <td className="px-6 py-4 font-medium text-gray-200 group-hover:text-white transition-colors">
                            {voter.full_name}
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={voter.status === 'deactivated' ? 'suspended' : 'registered'} />
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-3 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                              {voter.status === 'deactivated' ? (
                                <button
                                  onClick={() => executeGrant(voter.user_id)}
                                  disabled={processingId === voter.user_id}
                                  className="text-emerald-400 hover:text-emerald-300 text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                                >
                                  Grant Access
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleReject(voter.user_id)}
                                  className="text-gray-600 hover:text-red-400 text-xs font-bold uppercase tracking-wider transition-colors"
                                >
                                  Revoke Access
                                </button>
                              )}
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
      </div>
    </>
  );
}

// --- Sub-Components ---

function StatusBadge({ status }: { status: 'registered' | 'suspended' }) {
  const configs = {
    registered: { color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]', label: 'Registered', dot: 'bg-emerald-400' },
    suspended: { color: 'bg-red-500/10 text-red-400 border-red-500/20', label: 'Suspended', dot: 'bg-red-400' },
  };

  const conf = configs[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wide ${conf.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${conf.dot}`}></span>
      {conf.label}
    </span>
  );
}