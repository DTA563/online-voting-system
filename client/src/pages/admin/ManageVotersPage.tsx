import { useState, useEffect } from 'react';
import { LoadingSpinner, LoadingScreen } from '../../components/ui';
import { User } from '../../types';
import api from '../../api/axios';

// --- SHARED STYLES ---
const glassCardClass = "relative overflow-hidden backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl transition-all hover:border-white/20";
const tableHeaderClass = "text-left py-4 px-6 text-xs font-semibold text-blue-300 uppercase tracking-wider";
const tableCellClass = "py-4 px-6 text-sm text-gray-300 border-b border-white/5";
const inputClass = "w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all";

export function ManageVotersPage() {
  const [voters, setVoters] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadVoters();
  }, []);

  const loadVoters = async () => {
    try {
      const response = await api.get('/users?role=voter');
      setVoters(response.data.data || []);
    } catch (err) {
      setError('Failed to load voters');
    } finally {
      // Small delay to prevent spinner flicker, matching dashboard feel
      setTimeout(() => setIsLoading(false), 300);
    }
  };

  const handleVerify = async (id: string) => {
    setProcessingId(id);
    try {
      await api.patch(`/users/${id}`, { is_verified: true });
      setSuccessMessage('Voter verified successfully');
      await loadVoters();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to verify voter');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string, isRevoke = false) => {
    const action = isRevoke ? 'Revoke access for' : 'Reject registration of';
    if (!confirm(`⚠️ Are you sure you want to ${action} this user? This cannot be undone.`)) return;

    setProcessingId(id);
    try {
      await api.delete(`/users/${id}`);
      setSuccessMessage(isRevoke ? 'Access revoked successfully' : 'Request rejected');
      await loadVoters();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to remove user');
    } finally {
      setProcessingId(null);
    }
  };

  // --- Derived State ---
  const pendingVoters = voters.filter(v => !v.is_verified);
  const activeVoters = voters.filter(v => v.is_verified);

  const filteredActiveVoters = activeVoters.filter(
    (voter) =>
      voter.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voter.user_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <LoadingScreen message="Loading voter database..." />;
  }

  return (
    <>
      {/* --- INJECTED ANIMATION STYLES --- */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-enter {
          opacity: 0; /* Start hidden */
          animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      <div className="min-h-screen bg-black text-white relative font-sans selection:bg-blue-500/30 p-6 md:p-12">

        {/* --- Ambient Background --- */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-blue-900/20"></div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] opacity-50 animate-pulse"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">

          {/* --- Header (No Delay) --- */}
          <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4 animate-enter">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-gray-400 bg-clip-text text-transparent mb-2">
                Voter Database
              </h1>
              <p className="text-gray-400">
                Verify new registrations and manage the electoral roll.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-4">
              <div className={`${glassCardClass} px-4 py-2 flex flex-col items-center min-w-[100px]`}>
                <span className="text-xs text-gray-400 uppercase font-bold block mb-1">Pending</span>
                <span className="text-xl font-bold text-yellow-400">{pendingVoters.length}</span>
              </div>
              <div className={`${glassCardClass} px-4 py-2 flex flex-col items-center min-w-[100px]`}>
                <span className="text-xs text-gray-400 uppercase font-bold block mb-1">Verified</span>
                <span className="text-xl font-bold text-emerald-400">{activeVoters.length}</span>
              </div>
            </div>
          </div>

          {/* --- Feedback Toasts (Dynamic) --- */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-lg mb-6 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <span className="text-xl">⚠️</span> {error}
            </div>
          )}
          {successMessage && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 px-4 py-3 rounded-lg mb-6 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <span className="text-xl">✅</span> {successMessage}
            </div>
          )}

          {/* --- SECTION 1: Pending Verifications (Delay 100ms) --- */}
          {pendingVoters.length > 0 && (
            <div 
              className="mb-10 animate-enter"
              style={{ animationDelay: '100ms' }}
            >
              <h2 className="text-lg font-bold text-yellow-500 mb-4 flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                </span>
                Pending Verifications ({pendingVoters.length})
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingVoters.map((voter) => (
                  <div key={voter.user_id} className={`${glassCardClass} p-5 border-l-4 border-l-yellow-500 flex flex-col justify-between hover:translate-y-[-2px]`}>
                    <div className="mb-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-white text-lg">{voter.full_name}</h3>
                        <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded font-mono border border-yellow-500/20">
                          {voter.user_id}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">
                        Registered: {voter.created_at ? new Date(voter.created_at).toLocaleDateString() : 'Just now'}
                      </p>
                    </div>

                    <div className="flex gap-2 mt-auto">
                      <button
                        onClick={() => handleVerify(voter.user_id)}
                        disabled={processingId === voter.user_id}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold py-2 rounded-lg transition-colors disabled:opacity-50 shadow-lg shadow-emerald-900/20"
                      >
                        {processingId === voter.user_id ? '...' : 'Verify'}
                      </button>
                      <button
                        onClick={() => handleReject(voter.user_id, false)}
                        disabled={processingId === voter.user_id}
                        className="flex-1 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-white/10 text-sm font-semibold py-2 rounded-lg transition-all disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* --- SECTION 2: Verified Voters Table (Delay 200ms) --- */}
          <div 
            className="animate-enter"
            style={{ animationDelay: '200ms' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-blue-300 flex items-center gap-2">
                <span className="w-1 h-5 bg-blue-500 rounded-full"></span>
                Verified Voter Roll
              </h2>
              <div className="relative w-64">
                <input
                  type="text"
                  placeholder="Search verified voters..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`${inputClass} py-2 text-sm bg-white/5 hover:bg-white/10 focus:bg-black/40`}
                />
              </div>
            </div>

            <div className={`${glassCardClass} min-h-[400px]`}>
              {filteredActiveVoters.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[300px] text-gray-500">
                  <p>{searchTerm ? 'No matches found.' : 'No verified voters yet.'}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr>
                        <th className={tableHeaderClass}>User ID</th>
                        <th className={tableHeaderClass}>Full Name</th>
                        <th className={tableHeaderClass}>Status</th>
                        <th className="text-right py-4 px-6 text-xs font-semibold text-blue-300 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredActiveVoters.map((voter) => (
                        <tr key={voter.user_id} className="hover:bg-white/5 transition-colors group">
                          <td className={`${tableCellClass} font-mono text-blue-200`}>
                            {voter.user_id}
                          </td>
                          <td className={`${tableCellClass} font-medium text-white`}>
                            {voter.full_name}
                          </td>
                          <td className={tableCellClass}>
                            <span className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"></span>
                              Verified
                            </span>
                          </td>
                          <td className={`${tableCellClass} text-right`}>
                            <button
                              onClick={() => handleReject(voter.user_id, true)}
                              className="text-gray-500 hover:text-red-400 text-xs font-semibold transition-colors opacity-0 group-hover:opacity-100"
                            >
                              REVOKE ACCESS
                            </button>
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