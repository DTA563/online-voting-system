import { useState, useEffect, useMemo } from 'react';
import { adminApi } from '../../api';
<<<<<<< HEAD
import { User } from '../../types';
=======
import { LoadingScreen } from '../../components/ui';

interface User {
  user_id: string;
  full_name: string;
  role: 'voter' | 'admin' | 'super_admin';
  status: 'active' | 'deactivated';
  created_at: string;
  last_login?: string;
  is_verified?: number | boolean;
}
>>>>>>> d69e0fa3276b3c8a8f131053e77cb28d22c69fdb

const Icons = {
  Search: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  Check: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" /></svg>,
  Ban: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>,
  Key: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 14l-1 1-1 1H3v-4l4-7a6 6 0 1112 0z" /></svg>,
  Users: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Shield: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  Alert: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
  Briefcase: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
};

export function AccountOversightPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'super_admin' | 'voter'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'deactivated'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    loadUsers();
<<<<<<< HEAD
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
=======
    setMounted(true);
>>>>>>> d69e0fa3276b3c8a8f131053e77cb28d22c69fdb
  }, []);

  const loadUsers = async () => {
    try {
      const data = await adminApi.getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (action: 'activate' | 'deactivate' | 'reset', user: User) => {
    if (!window.confirm(`Are you sure you want to ${action} ${user.full_name}?`)) return;
    
    setActionLoading(user.user_id);
    try {
      if (action === 'reset') {
        const res = await adminApi.resetPassword(user.user_id);
        alert(res.message);
      } else {
        const newStatus = action === 'activate' ? 'active' : 'deactivated';
        await adminApi.manageUser({ 
          targetUserId: user.user_id, 
          newStatus: newStatus 
        });
        setUsers(prev => prev.map(u => u.user_id === user.user_id ? { ...u, status: newStatus } : u));
      }
    } catch (err: any) {
      alert(err.response?.data?.message || `Failed to ${action} user`);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesRole = filterRole === 'all' || user.role === filterRole;
      const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
      const matchesSearch = 
        user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        user.user_id.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesRole && matchesStatus && matchesSearch;
    });
  }, [users, filterRole, filterStatus, searchQuery]);

  const stats = useMemo(() => ({
    totalSuperAdmins: users.filter(u => u.role === 'super_admin').length,
    totalAdmins: users.filter(u => u.role === 'admin').length,
    disabled: users.filter(u => u.status === 'deactivated').length,
    pending: users.filter(u => !u.is_verified).length
  }), [users]);

<<<<<<< HEAD
  // --- Loading Skeleton ---
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 space-y-8 animate-pulse">
        <div className="space-y-3">
          <div className="h-3 w-32 bg-zinc-800 rounded"></div>
          <div className="h-8 w-64 bg-zinc-800 rounded"></div>
          <div className="h-4 w-96 bg-zinc-800 rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 rounded-2xl bg-zinc-900/50 border border-white/5"></div>)}
        </div>
        <div className="h-16 rounded-2xl bg-zinc-900/50 border border-white/5"></div>
        <div className="h-96 rounded-3xl bg-zinc-900/50 border border-white/5"></div>
      </div>
    );
  }

=======
>>>>>>> d69e0fa3276b3c8a8f131053e77cb28d22c69fdb


  return (
    <>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-up { animation: fadeUp 0.5s ease-out forwards; }
        .glass-panel { background: rgba(22, 22, 24, 0.6); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.08); }
        .glass-panel:hover { background: rgba(22, 22, 24, 0.8); border-color: rgba(255, 255, 255, 0.12); }
        .glass-input { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); color: #e4e4e7; }
        .glass-input:focus { border-color: #3b82f6; outline: none; background: rgba(255, 255, 255, 0.05); }
      `}</style>
      
      <div className="text-zinc-100 font-sans selection:bg-blue-500/20 pb-12">

        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 space-y-8">
           {/* Header */}
           <div className={`opacity-0 ${mounted ? 'animate-fade-up' : ''}`}>
               <h2 className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-2">Personnel Management</h2>
               <h1 className="text-3xl font-bold text-white tracking-tight">Account Oversight</h1>
               <p className="text-zinc-400 mt-2 max-w-lg text-sm">Manage system access hierarchies, review roles, and control entity statuses.</p>
           </div>

           {/* Stats Cards */}
           <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 opacity-0 ${mounted ? 'animate-fade-up' : ''}`} style={{ animationDelay: '100ms' }}>
              <StatBox label="Super Admins" value={stats.totalSuperAdmins} icon={<Icons.Shield />} />
              <StatBox label="Administrators" value={stats.totalAdmins} icon={<Icons.Briefcase />} highlight />
              <StatBox label="Disabled Users" value={stats.disabled} icon={<Icons.Ban />} valueColor="text-rose-400" />
              <StatBox label="Pending Review" value={stats.pending} icon={<Icons.Alert />} valueColor="text-blue-400" />
           </div>

           {/* Toolbar */}
           <div className={`glass-panel p-4 rounded-2xl flex flex-col md:flex-row gap-4 justify-between items-center opacity-0 ${mounted ? 'animate-fade-up' : ''}`} style={{ animationDelay: '200ms' }}>
              <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                 <div className="relative group w-full md:w-72">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-blue-500 transition-colors">
                       <Icons.Search />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Search Personnel ID or Name..." 
                      className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-sm transition-all font-mono"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                 </div>
                 
                 <select 
                   className="glass-input rounded-xl px-4 py-2.5 text-sm text-zinc-300"
                   value={filterRole}
                   onChange={(e) => setFilterRole(e.target.value as any)}
                 >
                   <option value="all" className="bg-[#09090b]">All Roles</option>
                   <option value="super_admin" className="bg-[#09090b]">Super Admin</option>
                   <option value="admin" className="bg-[#09090b]">Admin</option>
                   <option value="voter" className="bg-[#09090b]">Voter</option>
                 </select>

                 <select 
                   className="glass-input rounded-xl px-4 py-2.5 text-sm text-zinc-300"
                   value={filterStatus}
                   onChange={(e) => setFilterStatus(e.target.value as any)}
                 >
                   <option value="all" className="bg-[#09090b]">All Status</option>
                   <option value="active" className="bg-[#09090b]">Active</option>
                   <option value="deactivated" className="bg-[#09090b]">Disabled</option>
                 </select>
              </div>
              
              <div className="text-xs font-mono text-zinc-500 px-3 py-1.5 border border-zinc-800 rounded-lg bg-zinc-900/50">
                 {filteredUsers.length} RECORDS FOUND
              </div>
           </div>

           {/* Table */}
           <div className={`glass-panel rounded-3xl overflow-hidden opacity-0 ${mounted ? 'animate-fade-up' : ''}`} style={{ animationDelay: '300ms' }}>
             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="text-[10px] text-zinc-500 uppercase tracking-wider border-b border-white/5 bg-zinc-900/30">
                        <th className="px-6 py-4 font-medium">Identity</th>
                        <th className="px-6 py-4 font-medium">Clearance Role</th>
                        <th className="px-6 py-4 font-medium">Status</th>
                        <th className="px-6 py-4 font-medium">Last Access</th>
                        <th className="px-6 py-4 font-medium text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-white/5">
                     {filteredUsers.map((user) => (
                       <tr key={user.user_id} className="hover:bg-white/2 transition-colors group">
                          <td className="px-6 py-4">
                             <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold border transition-colors ${
                                   user.role === 'super_admin' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 
                                   'bg-zinc-800 text-zinc-400 border-zinc-700'
                                }`}>
                                   {user.full_name.charAt(0)}
                                </div>
                                <div>
                                   <div className="font-medium text-zinc-200 group-hover:text-white transition-colors">{user.full_name}</div>
                                   <div className="text-[10px] text-zinc-500 font-mono">{user.user_id}</div>
                                </div>
                             </div>
                          </td>
                          <td className="px-6 py-4">
                             <span className={`inline-flex items-center px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wide border
                               ${user.role === 'super_admin' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                                 user.role === 'admin' ? 'bg-zinc-100/10 text-zinc-300 border-zinc-500/20' : 
                                 'bg-white/5 text-zinc-500 border-white/5'}`}>
                               {user.role.replace('_', ' ')}
                             </span>
                          </td>
                          <td className="px-6 py-4">
                             {user.status === 'active' ? (
                                <span className="inline-flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                                   <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> Active
                                </span>
                             ) : (
                                <span className="inline-flex items-center gap-1.5 text-rose-400 text-[10px] font-bold uppercase tracking-wider">
                                   <span className="w-1.5 h-1.5 bg-rose-400 rounded-full" /> Disabled
                                </span>
                             )}
                          </td>
                          <td className="px-6 py-4">
                             {user.last_login ? (
                                <div className="flex flex-col">
                                   <span className="text-zinc-400 text-xs">{new Date(user.last_login).toLocaleDateString()}</span>
                                   <span className="text-[10px] text-zinc-600 font-mono">{new Date(user.last_login).toLocaleTimeString()}</span>
                                </div>
                             ) : (
                                <span className="text-zinc-600 text-xs italic">Never</span>
                             )}
                          </td>
                          <td className="px-6 py-4 text-right">
                             {user.role === 'super_admin' ? (
                                <span className="text-[10px] uppercase text-zinc-600 font-bold tracking-wider flex justify-end items-center gap-1">
                                    <Icons.Shield /> Protected
                                </span>
                             ) : (
                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                   <button 
                                     onClick={() => handleAction('reset', user)}
                                     disabled={!!actionLoading}
                                     className="p-1.5 rounded bg-zinc-800 text-zinc-400 hover:text-blue-400 hover:bg-zinc-700 transition-all border border-transparent hover:border-blue-500/30"
                                     title="Reset Password"
                                   >
                                      <Icons.Key />
                                   </button>
                                   
                                   {user.status === 'active' ? (
                                      <button 
                                        onClick={() => handleAction('deactivate', user)}
                                        disabled={!!actionLoading}
                                        className="p-1.5 rounded bg-zinc-800 text-zinc-400 hover:text-rose-400 hover:bg-zinc-700 transition-all border border-transparent hover:border-rose-500/30"
                                        title="Disable Account"
                                      >
                                        <Icons.Ban />
                                      </button>
                                   ) : (
                                      <button 
                                        onClick={() => handleAction('activate', user)}
                                        disabled={!!actionLoading}
                                        className="p-1.5 rounded bg-zinc-800 text-zinc-400 hover:text-emerald-400 hover:bg-zinc-700 transition-all border border-transparent hover:border-emerald-500/30"
                                        title="Activate Account"
                                      >
                                        <Icons.Check />
                                      </button>
                                   )}
                                </div>
                             )}
                          </td>
                       </tr>
                     ))}
                     {filteredUsers.length === 0 && (
                       <tr><td colSpan={5} className="px-6 py-12 text-center text-zinc-600 italic">No personnel found maintaining expected criteria.</td></tr>
                     )}
                  </tbody>
               </table>
             </div>
           </div>
        </div>
      </div>
    </>
  );
}

function StatBox({ label, value, icon, valueColor, highlight }: any) {
  return (
    <div className={`glass-panel p-5 rounded-2xl flex items-center gap-4 transition-all duration-300 ${highlight ? 'bg-zinc-800/50 border-blue-500/20 shadow-lg shadow-blue-900/5' : ''}`}>
       <div className={`p-3 rounded-lg bg-zinc-900 border border-zinc-800 ${highlight ? 'text-blue-500' : 'text-zinc-500'}`}>
          {icon}
       </div>
       <div>
          <div className={`text-2xl font-bold tracking-tight ${valueColor || 'text-white'}`}>{value}</div>
          <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{label}</div>
       </div>
    </div>
  );
}
