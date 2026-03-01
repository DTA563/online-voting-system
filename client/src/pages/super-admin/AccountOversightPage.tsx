import { useState, useEffect, useMemo } from 'react';
import { adminApi } from '../../api';
import { User } from '../../types';

// ── Icons (Consistent with Dashboard) ─────────────────────
const Icons = {
  Search: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  Check: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" /></svg>,
  Ban: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>,
  Key: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 14l-1 1-1 1H3v-4l4-7a6 6 0 1112 0z" /></svg>,
  Users: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Shield: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  Briefcase: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  Refresh: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
  TrendingUp: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
  TrendingDown: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" /></svg>,
  Clock: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Filter: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>,
  X: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>,
  UserPlus: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>,
  Calendar: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  Activity: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  Fingerprint: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" /></svg>,
};

export function AccountOversightPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'super_admin' | 'voter'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'deactivated'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [data] = await Promise.all([
        adminApi.getAllUsers(),
        new Promise(resolve => setTimeout(resolve, 500))
      ]);
      
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        setError('Received invalid data format from server');
        setUsers([]);
      }
    } catch (err: any) {
      console.error('Failed to load users:', err);
      setError(err.response?.data?.message || 'Failed to load users. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (action: 'activate' | 'deactivate' | 'reset', user: User) => {
    if (!user.user_id) {
      alert('Invalid user ID');
      return;
    }
    
    if (!window.confirm(`Are you sure you want to ${action} ${user.full_name}?`)) return;
    
    setActionLoading(user.user_id);
    setError(null);
    
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
      const errorMsg = err.response?.data?.message || `Failed to ${action} user`;
      setError(errorMsg);
      alert(errorMsg);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRoleChange = async (user: User, direction: 'promote' | 'demote') => {
    if (!user.user_id || !user.role) {
      alert('Invalid user data');
      return;
    }
    
    let newRole: 'voter' | 'admin' | 'super_admin' = user.role;
    
    if (direction === 'promote') {
      if (user.role === 'voter') newRole = 'admin';
      else if (user.role === 'admin') newRole = 'super_admin';
    } else {
      if (user.role === 'super_admin') newRole = 'admin';
      else if (user.role === 'admin') newRole = 'voter';
    }

    if (newRole === user.role) return;

    const roleDisplay = newRole.replace('_', ' ');
    if (!window.confirm(`Are you sure you want to ${direction} ${user.full_name} to ${roleDisplay}?`)) return;
    
    setActionLoading(user.user_id);
    setError(null);
    
    try {
      await adminApi.updateRole({ 
        targetUserId: user.user_id, 
        newRole: newRole
      });
      setUsers(prev => prev.map(u => u.user_id === user.user_id ? { ...u, role: newRole } : u));
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || `Failed to ${direction} user role`;
      setError(errorMsg);
      alert(errorMsg);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesRole = filterRole === 'all' || user.role === filterRole;
      const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
      const matchesSearch = 
        (user.full_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
        (user.user_id?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      
      return matchesRole && matchesStatus && matchesSearch;
    });
  }, [users, filterRole, filterStatus, searchQuery]);

  // More accurate stats calculation
  const stats = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return {
      totalSuperAdmins: users.filter(u => u.role === 'super_admin').length,
      totalAdmins: users.filter(u => u.role === 'admin').length,
      totalVoters: users.filter(u => u.role === 'voter').length,
      disabled: users.filter(u => u.status === 'deactivated').length,
      active: users.filter(u => u.status === 'active').length,
      // Count users with NO last_login OR last_login is more than 30 days old
      inactive: users.filter(u => {
        if (!u.last_login) return true;
        const lastLogin = new Date(u.last_login);
        return lastLogin < thirtyDaysAgo;
      }).length,
      // Count users with last_login in last 30 days
      recentlyActive: users.filter(u => {
        if (!u.last_login) return false;
        const lastLogin = new Date(u.last_login);
        return lastLogin >= thirtyDaysAgo;
      }).length
    };
  }, [users]);

  // Format last login with more accurate messaging
  const formatLastAccess = (lastLogin: string | null | undefined, status: string | undefined) => {
    if (!lastLogin) {
      return {
        text: 'No access record',
        detail: 'Login tracking unavailable',
        icon: <Icons.Calendar />,
        color: 'text-zinc-500'
      };
    }

    const date = new Date(lastLogin);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return {
        text: `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        detail: 'Active today',
        icon: <Icons.Activity />,
        color: 'text-emerald-400'
      };
    } else if (diffDays === 1) {
      return {
        text: 'Yesterday',
        detail: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        icon: <Icons.Clock />,
        color: 'text-emerald-400'
      };
    } else if (diffDays < 7) {
      return {
        text: `${diffDays} days ago`,
        detail: date.toLocaleDateString(),
        icon: <Icons.Clock />,
        color: 'text-zinc-400'
      };
    } else if (diffDays < 30) {
      return {
        text: `${Math.floor(diffDays / 7)} weeks ago`,
        detail: date.toLocaleDateString(),
        icon: <Icons.Clock />,
        color: 'text-zinc-500'
      };
    } else {
      return {
        text: 'Inactive',
        detail: `Last seen ${date.toLocaleDateString()}`,
        icon: <Icons.Calendar />,
        color: 'text-zinc-600'
      };
    }
  };

  // --- Loading Skeleton ---
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 space-y-8 animate-pulse">
        <div className="space-y-3">
          <div className="h-3 w-32 bg-zinc-800 rounded"></div>
          <div className="h-8 w-64 bg-zinc-800 rounded"></div>
          <div className="h-4 w-96 bg-zinc-800 rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-28 rounded-2xl bg-zinc-900/50 border border-white/5"></div>)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-28 rounded-2xl bg-zinc-900/50 border border-white/5"></div>)}
        </div>
        <div className="h-16 rounded-2xl bg-zinc-900/50 border border-white/5"></div>
        <div className="h-125 rounded-3xl bg-zinc-900/50 border border-white/5"></div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-up { animation: fadeUp 0.5s ease-out forwards; }
        .glass-panel { background: rgba(22, 22, 24, 0.6); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.08); }
        .glass-panel:hover { background: rgba(22, 22, 24, 0.8); border-color: rgba(255, 255, 255, 0.12); }
        .glass-input { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); color: #e4e4e7; }
        .glass-input:focus { border-color: #3b82f6; outline: none; background: rgba(255, 255, 255, 0.05); }
        .kpi-card { background: rgba(22, 22, 24, 0.6); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.08); }
        .kpi-card:hover { background: rgba(28, 28, 32, 0.8); border-color: rgba(255, 255, 255, 0.12); }
      `}</style>
      
      <div className="text-zinc-100 font-sans selection:bg-blue-500/20 pb-12 overflow-x-hidden">

        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 space-y-8">
          
          {/* --- Header with Refresh --- */}
          <div className={`flex justify-between items-start opacity-0 ${mounted ? 'animate-fade-up' : ''}`}>
            <div>
              <h2 className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Icons.Users /> PERSONNEL MANAGEMENT
              </h2>
              <h1 className="text-3xl font-bold text-white tracking-tight">Account Oversight</h1>
              <p className="text-zinc-400 mt-2 max-w-lg text-sm">
                Manage system access hierarchies, review roles, and control account statuses.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Total Accounts</div>
                <div className="font-mono text-xl text-zinc-300">{users.length}</div>
              </div>
              <button 
                onClick={loadUsers}
                className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-blue-500/50 hover:text-blue-500 transition-all text-zinc-400"
                title="Refresh users"
              >
                <Icons.Refresh />
              </button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-200 text-sm animate-fade-up">
              {error}
            </div>
          )}

          {/* --- Slimmer Stats Cards (First Row) --- */}
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 opacity-0 ${mounted ? 'animate-fade-up' : ''}`} style={{ animationDelay: '100ms' }}>
            <CompactKPICard 
              title="Total Population" 
              value={users.length} 
              icon={<Icons.Users />} 
              subValue={`${stats.active} active · ${stats.disabled} disabled`}
            />
            <CompactKPICard 
              title="Super Admins" 
              value={stats.totalSuperAdmins} 
              icon={<Icons.Shield />} 
              trend={stats.totalSuperAdmins > 0 ? `${stats.totalSuperAdmins}%` : undefined}
              valueColor={stats.totalSuperAdmins > 0 ? 'text-blue-400' : 'text-zinc-400'}
              highlight={stats.totalSuperAdmins > 0}
            />
            <CompactKPICard 
              title="Administrators" 
              value={stats.totalAdmins} 
              icon={<Icons.Briefcase />} 
              highlight={stats.totalAdmins > 0}
              subValue={`${Math.round((stats.totalAdmins / users.length) * 100) || 0}% of users`}
            />
            <CompactKPICard 
              title="Voter Base" 
              value={stats.totalVoters} 
              icon={<Icons.Fingerprint />} 
              trend={stats.active > 0 ? `${Math.round((stats.active / users.length) * 100)}% active` : undefined}
            />
          </div>

          {/* --- Slimmer Stats Cards (Second Row) --- */}
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 opacity-0 ${mounted ? 'animate-fade-up' : ''}`} style={{ animationDelay: '150ms' }}>
            <CompactMetricCard 
              label="Active Accounts" 
              value={stats.active} 
              total={users.length}
              color="emerald"
              icon={<Icons.Check />} 
              subLabel="Currently enabled"
            />
            <CompactMetricCard 
              label="Disabled Accounts" 
              value={stats.disabled} 
              total={users.length}
              color="rose"
              icon={<Icons.Ban />} 
              subLabel="Temporarily locked"
            />
            <CompactMetricCard 
              label="Recently Active" 
              value={stats.recentlyActive} 
              total={users.length}
              color="blue"
              icon={<Icons.Activity />} 
              subLabel="Last 30 days"
            />
          </div>

          {/* --- Filters Toolbar --- */}
          <div className={`glass-panel p-4 rounded-2xl flex flex-col md:flex-row gap-4 justify-between items-center opacity-0 ${mounted ? 'animate-fade-up' : ''}`} style={{ animationDelay: '200ms' }}>
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              <div className="relative group w-full md:w-80">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-blue-500 transition-colors">
                  <Icons.Search />
                </div>
                <input 
                  type="text" 
                  placeholder="Search by name or ID..." 
                  className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-sm transition-all font-mono"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <select 
                  className="glass-input rounded-xl px-4 py-2.5 text-sm text-zinc-300 w-full sm:w-auto"
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value as any)}
                >
                  <option value="all" className="bg-[#09090b]">All Roles</option>
                  <option value="super_admin" className="bg-[#09090b]">Super Admin</option>
                  <option value="admin" className="bg-[#09090b]">Admin</option>
                  <option value="voter" className="bg-[#09090b]">Voter</option>
                </select>

                <select 
                  className="glass-input rounded-xl px-4 py-2.5 text-sm text-zinc-300 w-full sm:w-auto"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                >
                  <option value="all" className="bg-[#09090b]">All Status</option>
                  <option value="active" className="bg-[#09090b]">Active</option>
                  <option value="deactivated" className="bg-[#09090b]">Disabled</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-xs font-mono text-zinc-500 px-3 py-1.5 border border-zinc-800 rounded-lg bg-zinc-900/50">
                {filteredUsers.length} OF {users.length} RECORDS
              </div>
              {(filterRole !== 'all' || filterStatus !== 'all' || searchQuery) && (
                <button
                  onClick={() => {
                    setFilterRole('all');
                    setFilterStatus('all');
                    setSearchQuery('');
                  }}
                  className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all"
                  title="Clear filters"
                >
                  <Icons.X />
                </button>
              )}
            </div>
          </div>

          {/* --- Users Table --- */}
          <div className={`glass-panel rounded-3xl overflow-hidden opacity-0 ${mounted ? 'animate-fade-up' : ''}`} style={{ animationDelay: '300ms' }}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] text-zinc-500 uppercase tracking-wider border-b border-white/5 bg-zinc-900/30">
                    <th className="px-4 md:px-6 py-4 font-medium">Identity</th>
                    <th className="hidden md:table-cell px-6 py-4 font-medium">Clearance Role</th>
                    <th className="px-4 md:px-6 py-4 font-medium">Status</th>
                    <th className="hidden md:table-cell px-6 py-4 font-medium">Last Access</th>
                    <th className="px-4 md:px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-white/5">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => {
                      const lastAccess = formatLastAccess(user.last_login, user.status);
                      const userId = user.user_id || 'unknown';
                      
                      return (
                        <tr 
                          key={userId} 
                          className="hover:bg-white/2 transition-colors group"
                        >
                          <td className="px-4 md:px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center text-xs md:text-sm font-bold border transition-all ${
                                user.role === 'super_admin' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 
                                user.role === 'admin' ? 'bg-zinc-100/10 text-zinc-300 border-zinc-500/20' :
                                'bg-zinc-800 text-zinc-400 border-zinc-700'
                              }`}>
                                {user.full_name?.charAt(0) || '?'}
                              </div>
                              <div>
                                <div className="font-medium text-zinc-200 group-hover:text-white transition-colors text-sm">
                                  {user.full_name || 'Unknown User'}
                                </div>
                                <div className="text-[10px] text-zinc-500 font-mono">{userId}</div>
                                {/* Role badge inline on mobile */}
                                <span className={`md:hidden inline-flex items-center mt-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide border
                                  ${user.role === 'super_admin' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                                    user.role === 'admin' ? 'bg-zinc-100/10 text-zinc-300 border-zinc-500/20' : 
                                    'bg-white/5 text-zinc-500 border-white/5'}`}>
                                  {user.role?.replace('_', ' ') || 'unknown'}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="hidden md:table-cell px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wide border
                              ${user.role === 'super_admin' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                                user.role === 'admin' ? 'bg-zinc-100/10 text-zinc-300 border-zinc-500/20' : 
                                'bg-white/5 text-zinc-500 border-white/5'}`}>
                              {user.role?.replace('_', ' ') || 'unknown'}
                            </span>
                          </td>
                          <td className="px-4 md:px-6 py-4">
                            {user.status === 'active' ? (
                              <div className="flex items-center gap-2">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <span className="text-emerald-400 text-xs font-medium">Active</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="relative flex h-2 w-2">
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                                </span>
                                <span className="text-rose-400 text-xs font-medium">Disabled</span>
                              </div>
                            )}
                          </td>
                          <td className="hidden md:table-cell px-6 py-4">
                            <div className={`flex items-center gap-2 ${lastAccess.color}`}>
                              <span className="text-current">{lastAccess.icon}</span>
                              <div className="flex flex-col">
                                <span className="text-xs font-medium">{lastAccess.text}</span>
                                <span className="text-[8px] text-zinc-600">{lastAccess.detail}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 md:px-6 py-4 text-right">
                            <div className="flex justify-end gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                              
                              {/* Demote Button */}
                              {(user.role === 'super_admin' || user.role === 'admin') && (
                                <button 
                                  onClick={() => handleRoleChange(user, 'demote')}
                                  disabled={actionLoading === user.user_id}
                                  className="p-1.5 rounded bg-zinc-800 text-zinc-400 hover:text-orange-400 hover:bg-zinc-700 transition-all border border-transparent hover:border-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {actionLoading === user.user_id ? (
                                    <div className="w-4 h-4 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <Icons.TrendingDown />
                                  )}
                                </button>
                              )}

                              {/* Promote Button */}
                              {(user.role === 'voter' || user.role === 'admin') && (
                                <button 
                                  onClick={() => handleRoleChange(user, 'promote')}
                                  disabled={actionLoading === user.user_id}
                                  className="p-1.5 rounded bg-zinc-800 text-zinc-400 hover:text-blue-400 hover:bg-zinc-700 transition-all border border-transparent hover:border-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {actionLoading === user.user_id ? (
                                    <div className="w-4 h-4 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <Icons.TrendingUp />
                                  )}
                                </button>
                              )}

                              {/* Reset Password */}
                              <button 
                                onClick={() => handleAction('reset', user)}
                                disabled={actionLoading === user.user_id}
                                className="p-1.5 rounded bg-zinc-800 text-zinc-400 hover:text-blue-400 hover:bg-zinc-700 transition-all border border-transparent hover:border-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {actionLoading === user.user_id ? (
                                  <div className="w-4 h-4 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Icons.Key />
                                )}
                              </button>
                              
                              {/* Toggle Active/Disabled */}
                              {user.status === 'active' ? (
                                <button 
                                  onClick={() => handleAction('deactivate', user)}
                                  disabled={actionLoading === user.user_id}
                                  className="p-1.5 rounded bg-zinc-800 text-zinc-400 hover:text-rose-400 hover:bg-zinc-700 transition-all border border-transparent hover:border-rose-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {actionLoading === user.user_id ? (
                                    <div className="w-4 h-4 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <Icons.Ban />
                                  )}
                                </button>
                              ) : (
                                <button 
                                  onClick={() => handleAction('activate', user)}
                                  disabled={actionLoading === user.user_id}
                                  className="p-1.5 rounded bg-zinc-800 text-zinc-400 hover:text-emerald-400 hover:bg-zinc-700 transition-all border border-transparent hover:border-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {actionLoading === user.user_id ? (
                                    <div className="w-4 h-4 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <Icons.Check />
                                  )}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center gap-3 text-zinc-600">
                          <Icons.Users />
                          <p className="text-sm italic">
                            {users.length === 0 ? 'No users found in the system.' : 'No personnel found matching the selected criteria.'}
                          </p>
                          {(filterRole !== 'all' || filterStatus !== 'all' || searchQuery) && (
                            <button
                              onClick={() => {
                                setFilterRole('all');
                                setFilterStatus('all');
                                setSearchQuery('');
                              }}
                              className="text-xs text-blue-500 hover:text-blue-400 transition-colors"
                            >
                              Clear all filters
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer with Engagement Summary */}
            <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs font-mono text-zinc-500 bg-zinc-900/30">
              <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-center sm:justify-start">
                <span>Showing {filteredUsers.length} of {users.length}</span>
                <span className="hidden sm:inline text-zinc-700">|</span>
                <span className="text-emerald-400">{stats.recentlyActive} active (30d)</span>
                <span className="text-zinc-500">{stats.inactive} inactive</span>
              </div>
              <div className="text-[10px] text-zinc-600">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Slimmer Components for Account Oversight ─────────────────

interface CompactKPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  highlight?: boolean;
  subValue?: string;
  valueColor?: string;
}

function CompactKPICard({ title, value, icon, trend, highlight, subValue, valueColor }: CompactKPICardProps) {
  return (
    <div className={`kpi-card rounded-xl p-4 flex flex-col justify-between transition-all duration-200 ${highlight ? 'border-blue-500/20 bg-blue-500/5' : ''}`}>
      <div className="flex items-start justify-between mb-2">
        <div className={`p-2 rounded-lg ${highlight ? 'bg-blue-500/10 text-blue-400' : 'bg-zinc-800/50 text-zinc-400'}`}>
          {icon}
        </div>
        {trend && <span className="text-[9px] font-bold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded-full">{trend}</span>}
      </div>
      <div>
        <div className={`text-2xl font-bold tracking-tight ${valueColor || (highlight ? 'text-blue-300' : 'text-white')}`}>{value}</div>
        <div className="flex items-center justify-between mt-0.5">
          <span className="text-[9px] text-zinc-500 font-medium uppercase tracking-wider">{title}</span>
          {subValue && <span className="text-[8px] text-zinc-600">{subValue}</span>}
        </div>
      </div>
    </div>
  );
}

interface CompactMetricCardProps {
  label: string;
  value: number;
  total: number;
  color: 'emerald' | 'rose' | 'blue';
  icon: React.ReactNode;
  subLabel?: string;
}

function CompactMetricCard({ label, value, total, color, icon, subLabel }: CompactMetricCardProps) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  
  const colorClasses = {
    emerald: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      text: 'text-emerald-400',
      progress: 'bg-emerald-500'
    },
    rose: {
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      text: 'text-rose-400',
      progress: 'bg-rose-500'
    },
    blue: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      text: 'text-blue-400',
      progress: 'bg-blue-500'
    }
  };

  return (
    <div className={`kpi-card rounded-xl p-4 ${colorClasses[color].bg} ${colorClasses[color].border}`}>
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg ${colorClasses[color].bg} ${colorClasses[color].text}`}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-white">{value}</span>
            <span className={`text-[9px] font-mono ${colorClasses[color].text}`}>{percentage}%</span>
          </div>
          <div className="text-[9px] text-zinc-500 font-medium uppercase tracking-wider">{label}</div>
          {subLabel && <div className="text-[7px] text-zinc-600 mt-0.5">{subLabel}</div>}
        </div>
      </div>
      <div className="w-full bg-zinc-800 rounded-full h-1 overflow-hidden">
        <div 
          className={`${colorClasses[color].progress} h-full rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}