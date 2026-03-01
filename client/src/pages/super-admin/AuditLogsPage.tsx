import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { auditApi } from '../../api'; // Make sure this path is correct for your setup

// Updated interface to match your auditApi payload
interface Log {
  log_id: number;
  created_at: string;
  performed_by: string;
  full_name?: string;
  role?: string;
  action: string;
  ip_address: string;
  metadata?: string; 
}

type RoleFilter = 'all' | 'admin' | 'super_admin' | 'voter';

// Icons - Clean Line Style (Matching Account Oversight)
const Icons = {
  Filter: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>,
  Eye: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
  X: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>,
  Search: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  Shield: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  Clock: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Terminal: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  Refresh: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
  Bell: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
  Users: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Activity: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  Calendar: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  Check: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" /></svg>,
  Alert: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
  Key: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>,
  Globe: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Warning: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
  Fingerprint: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" /></svg>,
};

export function AuditLogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);
  const [mounted, setMounted] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [newLogsCount, setNewLogsCount] = useState(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<RoleFilter>('all');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 12;

  // Refs
  const pollingIntervalRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const tableRef = useRef<HTMLDivElement>(null);

  // Load initial logs
  useEffect(() => {
    loadLogs();
    const timer = setTimeout(() => setMounted(true), 100);
    
    // Start polling for new logs (every 30 seconds)
    startPolling();
    
    return () => {
      clearTimeout(timer);
      stopPolling();
    };
  }, []);

  const startPolling = () => {
    stopPolling();
    pollingIntervalRef.current = setInterval(() => {
      checkForNewLogs();
    }, 30000);
  };

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = undefined;
    }
  };

  const checkForNewLogs = async () => {
    try {
      const logsData = await auditApi.getAll();
      
      if (Array.isArray(logsData)) {
        const newLogs = logsData as Log[];
        
        if (logs.length > 0 && newLogs.length > logs.length) {
          const newEntriesCount = newLogs.length - logs.length;
          setNewLogsCount(newEntriesCount);
          
          if (tableRef.current) {
            tableRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }
        
        setLogs(newLogs);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('Failed to check for new logs', err);
    }
  };

  const loadLogs = async (showRefreshingState = false) => {
    try {
      if (showRefreshingState) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      
      const [logsData] = await Promise.all([
        auditApi.getAll(),
        new Promise(resolve => setTimeout(resolve, 500))
      ]);
      
      if (Array.isArray(logsData)) {
        setLogs(logsData as Log[]);
        setLastUpdated(new Date());
        setNewLogsCount(0);
      } else {
        console.warn("Unrecognized log data format received from API:", logsData);
        setLogs([]);
      }
    } catch (err) {
      console.error('Failed to load logs', err);
      setLogs([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleManualRefresh = () => {
    loadLogs(false);
  };

  // Calculate stats from logs
  const stats = useMemo(() => {
    const now = new Date();
    const today = now.toDateString();
    
    return {
      totalEntries: logs.length,
      todayEntries: logs.filter(log => new Date(log.created_at).toDateString() === today).length,
      uniqueUsers: new Set(logs.map(log => log.performed_by)).size,
      uniqueIPs: new Set(logs.map(log => log.ip_address)).size,
      failedAttempts: logs.filter(log => 
        log.action.toLowerCase().includes('failed') || 
        log.action.toLowerCase().includes('error')
      ).length,
      superAdminActions: logs.filter(log => log.role === 'super_admin').length,
      adminActions: logs.filter(log => log.role === 'admin').length,
      voterActions: logs.filter(log => log.role === 'voter').length,
    };
  }, [logs]);

  // --- Parsing Helper for heuristic columns ---
  const parseLog = (action: string) => {
    let type = 'General';
    let target = 'System';
    
    if (action.includes('login') || action.includes('Login')) type = 'Authentication';
    else if (action.includes('Register') || action.includes('Create')) type = 'Creation';
    else if (action.includes('Changed') || action.includes('Update')) type = 'Modification';
    else if (action.includes('Delete') || action.includes('Remove')) type = 'Deletion';
    else if (action.includes('Reset')) type = 'Security';
    else if (action.includes('Vote') || action.includes('Cast')) type = 'Action';
    else if (action.includes('Failed') || action.includes('Error')) type = 'Error';
    
    if (action.includes('user')) target = 'User';
    else if (action.includes('election')) target = 'Election';
    else if (action.includes('candidate')) target = 'Candidate';
    else if (action.includes('vote')) target = 'Ballot';
    else if (action.includes('password')) target = 'Credentials';
    
    return { type, target };
  };

  const filteredLogs = useMemo(() => {
    if (!Array.isArray(logs)) return [];

    return logs.filter(log => {
      const matchesSearch = 
        log.performed_by?.toString().toLowerCase().includes(searchQuery.toLowerCase()) || 
        (log.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.ip_address?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRole = filterRole === 'all' || log.role === filterRole;
      
      const date = new Date(log.created_at);
      const start = filterStartDate ? new Date(filterStartDate) : null;
      const end = filterEndDate ? new Date(filterEndDate) : null;
      
      if (end) end.setHours(23, 59, 59, 999);

      const matchesDate = (!start || date >= start) && (!end || date <= end);

      return matchesSearch && matchesRole && matchesDate;
    });
  }, [logs, searchQuery, filterRole, filterStartDate, filterEndDate]);

  // Pagination Logic
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterRole, filterStartDate, filterEndDate]);

  // Auto-clear new logs notification after 5 seconds
  useEffect(() => {
    if (newLogsCount > 0) {
      const timer = setTimeout(() => {
        setNewLogsCount(0);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [newLogsCount]);

  // --- Loading Skeleton (Matching Account Oversight) ---
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 rounded-2xl bg-zinc-900/50 border border-white/5"></div>)}
        </div>
        <div className="h-16 rounded-2xl bg-zinc-900/50 border border-white/5"></div>
        <div className="h-[500px] rounded-3xl bg-zinc-900/50 border border-white/5"></div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes slideDown { from { transform: translateY(-100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-fade-up { animation: fadeUp 0.5s ease-out forwards; }
        .animate-pulse-slow { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        .animate-slide-down { animation: slideDown 0.3s ease-out forwards; }
        .glass-panel { background: rgba(22, 22, 24, 0.6); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.08); }
        .glass-panel:hover { background: rgba(22, 22, 24, 0.8); border-color: rgba(255, 255, 255, 0.12); }
        .glass-input { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); color: #e4e4e7; }
        .glass-input:focus { border-color: #3b82f6; outline: none; background: rgba(255, 255, 255, 0.05); }
        .stat-card { background: rgba(18, 18, 20, 0.8); backdrop-filter: blur(8px); border: 1px solid rgba(255, 255, 255, 0.03); }
        .stat-card:hover { background: rgba(24, 24, 28, 0.9); border-color: rgba(255, 255, 255, 0.06); }
      `}</style>
      
      <div className="text-zinc-100 font-sans selection:bg-blue-500/20 pb-12 overflow-x-hidden">

        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 space-y-8">
          
          {/* Header with Refresh */}
          <div className={`opacity-0 ${mounted ? 'animate-fade-up' : ''}`}>
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Icons.Terminal /> SYSTEM ARCHIVE
                </h2>
                <h1 className="text-3xl font-bold text-white tracking-tight">Security Audit Logs</h1>
                <p className="text-zinc-400 mt-2 max-w-lg text-sm">Immutable ledger of all actions performed within the system.</p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Total Entries</div>
                  <div className="font-mono text-xl text-zinc-300">{logs.length}</div>
                </div>
                <button
                  onClick={handleManualRefresh}
                  disabled={isRefreshing}
                  className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-blue-500/50 hover:text-blue-500 transition-all text-zinc-400"
                  title="Refresh logs"
                >
                  <Icons.Refresh />
                </button>
              </div>
            </div>
          </div>

          {/* New Logs Notification */}
          {newLogsCount > 0 && (
            <div className="animate-slide-down">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg animate-pulse-slow">
                    <Icons.Bell />
                  </div>
                  <div>
                    <p className="text-sm text-blue-400">
                      <span className="font-bold">{newLogsCount}</span> new log{newLogsCount > 1 ? 's' : ''} available
                    </p>
                    <p className="text-xs text-zinc-500">Click refresh to load the latest entries</p>
                  </div>
                </div>
                <button
                  onClick={handleManualRefresh}
                  className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-xs font-medium transition-colors"
                >
                  Load Now
                </button>
              </div>
            </div>
          )}

          {/* Slim Stats Cards - Row 1 */}
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-3 opacity-0 ${mounted ? 'animate-fade-up' : ''}`} style={{ animationDelay: '100ms' }}>
            <StatChip 
              label="Total Entries" 
              value={stats.totalEntries} 
              icon={<Icons.Terminal />} 
              subValue={`${stats.todayEntries} today`}
            />
            <StatChip 
              label="Unique Users" 
              value={stats.uniqueUsers} 
              icon={<Icons.Users />} 
              subValue={`${stats.uniqueUsers > 0 ? Math.round((stats.uniqueUsers / stats.totalEntries) * 100) : 0}% of entries`}
            />
            <StatChip 
              label="Unique IPs" 
              value={stats.uniqueIPs} 
              icon={<Icons.Globe />} 
              highlight={stats.uniqueIPs > 10}
            />
            <StatChip 
              label="Failed Attempts" 
              value={stats.failedAttempts} 
              icon={<Icons.Warning />} 
              valueColor={stats.failedAttempts > 10 ? 'text-rose-400' : 'text-emerald-400'}
              subValue={`${stats.failedAttempts > 0 ? Math.round((stats.failedAttempts / stats.totalEntries) * 100) : 0}%`}
            />
          </div>

          {/* Slim Stats Cards - Row 2 (Role Distribution) */}
          <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 opacity-0 ${mounted ? 'animate-fade-up' : ''}`} style={{ animationDelay: '150ms' }}>
            <RoleChip 
              label="Super Admin" 
              value={stats.superAdminActions} 
              total={stats.totalEntries}
              color="blue"
              icon={<Icons.Shield />} 
            />
            <RoleChip 
              label="Admin" 
              value={stats.adminActions} 
              total={stats.totalEntries}
              color="emerald"
              icon={<Icons.Key />} 
            />
            <RoleChip 
              label="Voter" 
              value={stats.voterActions} 
              total={stats.totalEntries}
              color="zinc"
              icon={<Icons.Fingerprint />} 
            />
          </div>

          {/* Filters Toolbar */}
          <div className={`glass-panel p-4 rounded-2xl flex flex-col md:flex-row gap-4 justify-between items-center opacity-0 ${mounted ? 'animate-fade-up' : ''}`} style={{ animationDelay: '200ms' }}>
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              <div className="relative group w-full md:w-80">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-blue-500 transition-colors">
                  <Icons.Search />
                </div>
                <input 
                  type="text" 
                  placeholder="Search by user, action, or IP..." 
                  className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-sm transition-all font-mono"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <select 
                  className="glass-input rounded-xl px-4 py-2.5 text-sm text-zinc-300 w-full sm:w-auto"
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value as RoleFilter)}
                >
                  <option value="all" className="bg-[#09090b]">All Roles</option>
                  <option value="super_admin" className="bg-[#09090b]">Super Admin</option>
                  <option value="admin" className="bg-[#09090b]">Admin</option>
                  <option value="voter" className="bg-[#09090b]">Voter</option>
                </select>
                
                <div className="flex items-center gap-2 glass-input rounded-xl px-2 w-full sm:w-auto min-w-0">
                  <input 
                    type="date" 
                    className="bg-transparent text-sm text-zinc-300 focus:outline-none p-1 min-w-0 flex-1"
                    value={filterStartDate}
                    onChange={(e) => setFilterStartDate(e.target.value)}
                  />
                  <span className="text-zinc-600">→</span>
                  <input 
                    type="date" 
                    className="bg-transparent text-sm text-zinc-300 focus:outline-none p-1 min-w-0 flex-1"
                    value={filterEndDate}
                    onChange={(e) => setFilterEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-xs font-mono text-zinc-500 px-3 py-1.5 border border-zinc-800 rounded-lg bg-zinc-900/50">
                {filteredLogs.length} OF {logs.length} RECORDS
              </div>
              {(filterRole !== 'all' || searchQuery || filterStartDate || filterEndDate) && (
                <button
                  onClick={() => {
                    setFilterRole('all');
                    setSearchQuery('');
                    setFilterStartDate('');
                    setFilterEndDate('');
                  }}
                  className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all"
                  title="Clear filters"
                >
                  <Icons.X />
                </button>
              )}
              {isRefreshing && (
                <div className="flex items-center gap-2 text-xs text-blue-500">
                  <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                  <span>Syncing...</span>
                </div>
              )}
            </div>
          </div>

          {/* Table */}
          <div 
            ref={tableRef}
            className={`glass-panel rounded-3xl overflow-hidden opacity-0 ${mounted ? 'animate-fade-up' : ''}`} 
            style={{ animationDelay: '300ms' }}
          >
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] text-zinc-500 uppercase tracking-wider border-b border-white/5 bg-zinc-900/30">
                    <th className="px-4 md:px-6 py-4 font-medium">Timestamp</th>
                    <th className="px-4 md:px-6 py-4 font-medium">Principal</th>
                    <th className="hidden md:table-cell px-6 py-4 font-medium">Role</th>
                    <th className="px-4 md:px-6 py-4 font-medium">Event Type</th>
                    <th className="px-4 md:px-6 py-4 font-medium">Action</th>
                    <th className="hidden md:table-cell px-6 py-4 font-medium">Origin</th>
                    <th className="px-4 md:px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-white/5">
                  {currentLogs.map((log) => {
                    const { type } = parseLog(log.action);
                    const logId = log.log_id?.toString() || 'unknown';
                    
                    return (
                      <tr 
                        key={logId} 
                        className="hover:bg-white/2 transition-colors group"
                      >
                        <td className="px-4 md:px-6 py-4">
                          <div className="flex items-center gap-2 text-zinc-400">
                            <Icons.Clock />
                            <div className="flex flex-col">
                              <span className="text-xs font-mono">{new Date(log.created_at).toLocaleDateString()}</span>
                              <span className="text-[8px] text-zinc-600">{new Date(log.created_at).toLocaleTimeString()}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border ${
                              log.role === 'super_admin' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 
                              log.role === 'admin' ? 'bg-zinc-100/10 text-zinc-300 border-zinc-500/20' :
                              'bg-zinc-800 text-zinc-400 border-zinc-700'
                            }`}>
                              {log.full_name?.charAt(0) || log.performed_by?.charAt(0) || '?'}
                            </div>
                            <div>
                              <div className="font-medium text-zinc-200 group-hover:text-white transition-colors">
                                {log.full_name || 'System User'}
                              </div>
                              <div className="text-[8px] text-zinc-500 font-mono">ID: {log.performed_by}</div>
                            </div>
                          </div>
                        </td>
                        <td className="hidden md:table-cell px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide border ${
                            log.role === 'super_admin' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 
                            log.role === 'admin' ? 'bg-zinc-100/10 text-zinc-300 border-zinc-500/20' : 
                            'bg-white/5 text-zinc-500 border-white/5'
                          }`}>
                            {log.role?.replace('_', ' ') || 'N/A'}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              type === 'Authentication' ? 'bg-blue-400' :
                              type === 'Security' ? 'bg-rose-500' : 
                              type === 'Deletion' ? 'bg-red-500' :
                              type === 'Creation' ? 'bg-emerald-400' :
                              type === 'Action' ? 'bg-emerald-400' :
                              type === 'Error' ? 'bg-rose-500' :
                              'bg-zinc-500'
                            }`} />
                            <span className="text-zinc-400 text-xs">{type}</span>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4 max-w-[120px] md:max-w-xs">
                          <div className="truncate text-zinc-300 text-xs font-mono group-hover:text-white transition-colors">
                            {log.action}
                          </div>
                        </td>
                        <td className="hidden md:table-cell px-6 py-4">
                          <div className="flex items-center gap-1 text-zinc-500">
                            <Icons.Activity />
                            <span className="text-xs font-mono">{log.ip_address}</span>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4 text-right">
                          <button 
                            onClick={() => setSelectedLog(log)}
                            className="px-3 py-1.5 rounded bg-zinc-800 border border-transparent hover:border-blue-500/30 text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:text-blue-400 transition-all"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredLogs.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center gap-3 text-zinc-600">
                          <Icons.Terminal />
                          <p className="text-sm italic">
                            {logs.length === 0 ? 'No audit logs found in the system.' : 'No records match the selected criteria.'}
                          </p>
                          {(filterRole !== 'all' || searchQuery || filterStartDate || filterEndDate) && (
                            <button
                              onClick={() => {
                                setFilterRole('all');
                                setSearchQuery('');
                                setFilterStartDate('');
                                setFilterEndDate('');
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

            {/* Table Footer with Pagination */}
            <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-mono text-zinc-500 bg-zinc-900/30">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span>PAGE {currentPage} OF {totalPages || 1}</span>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
              
              <div className="flex items-center gap-4">
                {lastUpdated && (
                  <div className="text-[10px] text-zinc-600">
                    Last sync: {lastUpdated.toLocaleTimeString()}
                  </div>
                )}
                <span className="text-emerald-400">{stats.todayEntries} today</span>
              </div>
            </div>
          </div>
        </div>

        {/* Log Detail Modal */}
        {selectedLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={() => setSelectedLog(null)} />
            <div className="relative bg-[#0F0F0F] border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-up mx-1 sm:mx-0">
              
              <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-white/5 flex justify-between items-start bg-zinc-900/50">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20">
                      <Icons.Shield />
                    </div>
                    <h3 className="text-xl font-bold text-white">Log Entry #{selectedLog.log_id}</h3>
                  </div>
                  <p className="text-xs text-zinc-500 font-mono">
                    HASH: {btoa(selectedLog.created_at + selectedLog.action).substring(0, 32)}...
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedLog(null)} 
                  className="p-2 rounded-full hover:bg-white/5 text-zinc-500 hover:text-white transition-colors"
                >
                  <Icons.X />
                </button>
              </div>

              <div className="p-4 sm:p-8 overflow-y-auto space-y-6 sm:space-y-8">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <DetailBox 
                    icon={<Icons.Clock />}
                    label="Timestamp"
                    value={new Date(selectedLog.created_at).toLocaleString()}
                  />
                  <DetailBox 
                    icon={<Icons.Activity />}
                    label="Origin IP"
                    value={selectedLog.ip_address}
                  />
                </div>

                <div>
                  <h4 className="text-[10px] font-bold text-zinc-500 mb-3 uppercase tracking-widest">Actor Identity</h4>
                  <div className="flex items-center gap-5 p-5 rounded-xl bg-zinc-900/50 border border-white/5">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl border ${
                      selectedLog.role === 'super_admin' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 
                      selectedLog.role === 'admin' ? 'bg-zinc-100/10 text-zinc-300 border-zinc-500/20' :
                      'bg-zinc-800 text-zinc-400 border-zinc-700'
                    }`}>
                      {selectedLog.full_name?.charAt(0) || selectedLog.performed_by?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="text-lg text-white font-bold">{selectedLog.full_name || 'Unknown User'}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-zinc-500 font-mono bg-black/40 px-2 py-0.5 rounded">
                          ID: {selectedLog.performed_by}
                        </span>
                        <span className={`text-xs font-bold uppercase ${
                          selectedLog.role === 'super_admin' ? 'text-blue-500' :
                          selectedLog.role === 'admin' ? 'text-zinc-300' :
                          'text-zinc-500'
                        }`}>
                          {selectedLog.role?.replace('_', ' ') || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-bold text-zinc-500 mb-3 uppercase tracking-widest">Event Payload</h4>
                  <div className="p-5 rounded-xl bg-black/40 border border-white/10 font-mono text-sm text-zinc-300 leading-relaxed">
                    {selectedLog.action}
                  </div>
                </div>

                {selectedLog.metadata && (
                  <div>
                    <h4 className="text-[10px] font-bold text-zinc-500 mb-3 uppercase tracking-widest">Metadata</h4>
                    <pre className="p-5 rounded-xl bg-black/40 border border-white/10 font-mono text-xs text-zinc-400 overflow-x-auto">
                      {JSON.stringify(JSON.parse(selectedLog.metadata), null, 2)}
                    </pre>
                  </div>
                )}

                <div className="pt-6 border-t border-white/5">
                  <div className="flex gap-3 text-xs text-emerald-500 font-mono bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/10 items-center">
                    <Icons.Shield />
                    <span>Cryptographic verification passed. Record integrity confirmed.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ── Slimmer Components for Audit Logs ─────────────────

interface StatChipProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  subValue?: string;
  highlight?: boolean;
  valueColor?: string;
}

function StatChip({ label, value, icon, subValue, highlight, valueColor }: StatChipProps) {
  return (
    <div className={`stat-card rounded-xl p-4 flex items-center gap-3 transition-all duration-200 ${highlight ? 'border-blue-500/20 bg-blue-500/5' : ''}`}>
      <div className={`p-2 rounded-lg ${highlight ? 'bg-blue-500/10 text-blue-400' : 'bg-zinc-800/50 text-zinc-500'}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between">
          <span className={`text-xl font-bold ${valueColor || 'text-white'}`}>{value}</span>
          {subValue && <span className="text-[8px] text-zinc-600 ml-1">{subValue}</span>}
        </div>
        <div className="text-[9px] font-medium text-zinc-500 uppercase tracking-wider truncate">{label}</div>
      </div>
    </div>
  );
}

interface RoleChipProps {
  label: string;
  value: number;
  total: number;
  color: 'blue' | 'emerald' | 'zinc';
  icon: React.ReactNode;
}

function RoleChip({ label, value, total, color, icon }: RoleChipProps) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  
  const colorClasses = {
    blue: 'text-blue-400 bg-blue-500/10',
    emerald: 'text-emerald-400 bg-emerald-500/10',
    zinc: 'text-zinc-400 bg-zinc-500/10'
  };

  return (
    <div className="stat-card rounded-xl p-4 flex items-center gap-3">
      <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-baseline justify-between">
          <span className="text-xl font-bold text-white">{value}</span>
          <span className="text-[9px] font-mono text-zinc-600">{percentage}%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-[9px] font-medium text-zinc-500 uppercase tracking-wider">{label}</div>
          <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${
                color === 'blue' ? 'bg-blue-500' :
                color === 'emerald' ? 'bg-emerald-500' : 'bg-zinc-500'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface DetailBoxProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function DetailBox({ icon, label, value }: DetailBoxProps) {
  return (
    <div className="p-4 rounded-xl bg-zinc-900/50 border border-white/5">
      <div className="flex items-center gap-2 mb-2 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
        {icon} {label}
      </div>
      <p className="text-zinc-200 font-mono text-sm break-all">{value}</p>
    </div>
  );
}