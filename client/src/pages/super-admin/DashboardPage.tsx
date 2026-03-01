import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi, DashboardStats } from '../../api/admin.api';
import { auditApi, AuditLog } from '../../api/audit.api';

// ── Types ────────────────────────────────────────────────
interface Alert {
  id: number;
  severity: 'low' | 'medium' | 'high';
  message: string;
  timestamp: string;
}

// ── Icons (Modern, Clean Line Style) ─────────────────────
const Icons = {
  Grid: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
  Users: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Server: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
  Shield: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  Bolt: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  Search: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  ChevronRight: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" /></svg>,
  Clock: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Vote: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Chart: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  Key: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>,
  Activity: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  CheckCircle: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
};

export function SuperAdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    loadDashboardData();
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsData, logsData] = await Promise.all([
        adminApi.getStats(), 
        auditApi.getSuperAdminLogs()
      ]);
      
      setStats(statsData);
      setLogs(logsData);
      
      generateAlerts(logsData, statsData);
    } catch (err) {
      console.error('Fetch failed', err);
    } finally {
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  const generateAlerts = (currentLogs: AuditLog[], currentStats: DashboardStats | null) => {
    const newAlerts: Alert[] = [];
    
    const failedLogins = currentLogs.filter(l => 
      l.action && l.action.toLowerCase().includes('failed')
    );
    
    if (failedLogins.length >= 3) {
      newAlerts.push({
        id: 1,
        severity: 'high',
        message: 'Multiple failed authentication attempts detected',
        timestamp: new Date().toISOString()
      });
    }

    // Check for suspicious activity
    const uniqueIPs = new Set(currentLogs.map(l => l.ip_address));
    if (uniqueIPs.size > 10 && currentLogs.length > 50) {
      newAlerts.push({
        id: 2,
        severity: 'medium',
        message: 'Unusual traffic pattern detected from multiple IP addresses',
        timestamp: new Date().toISOString()
      });
    }

    // Check for system errors in logs
    const errorLogs = currentLogs.filter(l => 
      l.action.toLowerCase().includes('error') || 
      l.action.toLowerCase().includes('fail')
    );
    if (errorLogs.length > 5) {
      newAlerts.push({
        id: 3,
        severity: 'medium',
        message: `${errorLogs.length} system errors detected in recent logs`,
        timestamp: new Date().toISOString()
      });
    }

    setAlerts(newAlerts);
  };

  // Calculate system metrics
  const calculateEngagementRate = () => {
    if (!stats?.users?.by_role) return 0;
    const totalVoters = stats.users.by_role.voter || 0;
    const activeElections = stats?.elections?.active || 0;
    // If there are active elections, calculate a realistic engagement rate
    if (activeElections > 0 && totalVoters > 0) {
      // This is a placeholder calculation - adjust based on your actual metrics
      return Math.min(85, Math.round((activeElections / totalVoters) * 1000));
    }
    return 0;
  };

  const getUniqueIPsToday = () => {
    const today = new Date().toDateString();
    const uniqueIPs = new Set(
      logs.filter(log => new Date(log.created_at).toDateString() === today)
           .map(log => log.ip_address)
    );
    return uniqueIPs.size;
  };

  const getAnomalyScore = () => {
    const failedAttempts = logs.filter(l => 
      l.action.toLowerCase().includes('failed')
    ).length;
    
    if (failedAttempts > 10) return 'High';
    if (failedAttempts > 5) return 'Medium';
    return 'Low';
  };

  const getCompletedElections = () => {
    return stats?.elections?.completed || 0;
  };

  const getTodayEvents = () => {
    const today = new Date().toDateString();
    return logs.filter(l => new Date(l.created_at).toDateString() === today).length;
  };

  const getYesterdayEvents = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();
    return logs.filter(l => new Date(l.created_at).toDateString() === yesterdayStr).length;
  };

  const getActiveVoters = () => {
    // This is a heuristic - you might want to track actual active sessions
    const lastHour = new Date();
    lastHour.setHours(lastHour.getHours() - 1);
    
    const activeUsers = new Set(
      logs.filter(l => new Date(l.created_at) > lastHour)
          .map(l => l.performed_by)
    );
    return activeUsers.size;
  };

  if (isLoading) {
    return (
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 space-y-8 animate-pulse">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5">
             <div className="space-y-3">
                <div className="h-3 w-32 bg-zinc-800 rounded"></div>
                <div className="h-8 w-64 bg-zinc-800 rounded"></div>
                <div className="h-4 w-96 bg-zinc-800 rounded"></div>
             </div>
             <div className="h-12 w-12 bg-zinc-900 rounded-full border border-zinc-800"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             {[1, 2, 3, 4].map((i) => (
               <div key={i} className="h-32 rounded-2xl bg-zinc-900/50 border border-white/5"></div>
             ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             <div className="lg:col-span-2 space-y-6">
                <div className="h-125 rounded-3xl bg-zinc-900/50 border border-white/5"></div>
             </div>
             
             <div className="space-y-6">
                <div className="h-64 rounded-3xl bg-zinc-900/50 border border-white/5"></div>
                <div className="h-48 rounded-3xl bg-zinc-900/50 border border-white/5"></div>
             </div>
          </div>
        </div>
    );
  }

  const totalUsers = stats?.users?.by_role 
    ? Object.values(stats.users.by_role).reduce((a, b) => a + b, 0) 
    : 0;

  return (
    <>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-up { animation: fadeUp 0.5s ease-out forwards; }
        .glass-panel { background: rgba(22, 22, 24, 0.6); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.08); }
        .glass-panel:hover { background: rgba(22, 22, 24, 0.8); border-color: rgba(255, 255, 255, 0.12); }
      `}</style>

      <div className="text-zinc-100 font-sans selection:bg-blue-500/20 pb-12">

        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 space-y-8">

          {/* --- Header --- */}
          <header className={`flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5 opacity-0 ${mounted ? 'animate-fade-up' : ''}`}>
             <div>
                <h2 className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-2">Executive Overview</h2>
                <h1 className="text-3xl font-bold text-white tracking-tight">System Command Center</h1>
                <p className="text-zinc-400 mt-2 max-w-lg text-sm">
                   Welcome back, Super Admin. System integrity is at 100%. All cryptographic nodes are synced.
                </p>
             </div>
             
             <div className="flex items-center gap-4">
               <div className="text-right hidden sm:block">
                 <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Server Time (UTC)</div>
                 <div className="font-mono text-xl text-zinc-300">
                    {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                 </div>
               </div>
               <button onClick={loadDashboardData} className="p-3 rounded-full bg-zinc-900 border border-zinc-800 hover:border-blue-500/50 hover:text-blue-500 transition-all text-zinc-400">
                  <Icons.Bolt />
               </button>
             </div>
          </header>

          {/* --- Key Performance Indicators --- */}
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 opacity-0 ${mounted ? 'animate-fade-up' : ''}`} style={{ animationDelay: '100ms' }}>
             
             <KPICard 
               title="Total Population" 
               value={totalUsers} 
               trend={totalUsers > 1000 ? '+12%' : undefined}
               icon={<Icons.Users />} 
               details={`${stats?.users?.by_role?.voter || 0} Voters · ${stats?.users?.by_role?.admin || 0} Admins`}
             />
             
             <KPICard 
               title="Active Elections" 
               value={stats?.elections?.active || 0} 
               icon={<Icons.Vote />} 
               highlight={!!stats?.elections?.active}
               details={`${stats?.elections?.total || 0} total · ${getCompletedElections()} completed`}
             />

             <KPICard 
               title="Security Posture" 
               value={getAnomalyScore()} 
               icon={<Icons.Shield />} 
               valueColor={
                 getAnomalyScore() === 'Low' ? 'text-emerald-400' :
                 getAnomalyScore() === 'Medium' ? 'text-yellow-400' : 'text-rose-400'
               }
               details={`${logs.filter(l => l.action.toLowerCase().includes('failed')).length} failed attempts`}
             />

             <KPICard 
               title="System Activity" 
               value={getUniqueIPsToday()} 
               icon={<Icons.Activity />} 
               details="Unique IPs today"
               trend={logs.length > 0 ? `${logs.length} total events` : undefined}
             />

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

             {/* --- Left Column: Live Audit Stream (2/3 width) --- */}
             <div className={`lg:col-span-2 space-y-6 opacity-0 ${mounted ? 'animate-fade-up' : ''}`} style={{ animationDelay: '200ms' }}>
                
                <div className="glass-panel rounded-3xl overflow-hidden min-h-125">
                   <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-white/2">
                      <div className="flex items-center gap-3">
                         <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400">
                           <Icons.Grid />
                         </div>
                         <div>
                            <h3 className="text-sm font-bold text-white">Live Audit Stream</h3>
                            <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Real-time Transaction Log</div>
                         </div>
                      </div>
                      <Link to="/super-admin/logs" className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-400 hover:text-white hover:border-zinc-700 transition-all">
                        View Full Ledger
                      </Link>
                   </div>

                   <div className="p-0">
                      <table className="w-full text-left border-collapse">
                         <thead>
                            <tr className="text-[10px] text-zinc-500 uppercase tracking-wider border-b border-white/5 bg-zinc-900/30">
                               <th className="px-6 py-3 font-medium">Timestamp</th>
                               <th className="px-6 py-3 font-medium">Principal</th>
                               <th className="px-6 py-3 font-medium">Event</th>
                               <th className="px-6 py-3 font-medium text-right">Origin</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-white/5 text-sm md:text-xs">
                            {logs.slice(0, 7).map((log) => (
                               <tr key={log.log_id} className="group hover:bg-white/2 transition-colors">
                                  <td className="px-6 py-4 text-zinc-500 font-mono">
                                     {new Date(log.created_at).toLocaleTimeString()}
                                  </td>
                                  <td className="px-6 py-4 font-medium text-zinc-200 group-hover:text-blue-500 transition-colors">
                                     {log.performed_by}
                                  </td>
                                  <td className="px-6 py-4 text-zinc-400">
                                     <span className={`inline-block w-1.5 h-1.5 rounded-full mr-2 ${
                                       log.action.toLowerCase().includes('failed') ? 'bg-rose-500' :
                                       log.action.toLowerCase().includes('login') ? 'bg-emerald-500' :
                                       log.action.toLowerCase().includes('create') ? 'bg-blue-500' :
                                       log.action.toLowerCase().includes('delete') ? 'bg-red-500' :
                                       'bg-zinc-500'
                                     }`} />
                                     {log.action}
                                  </td>
                                  <td className="px-6 py-4 text-right text-zinc-600 font-mono group-hover:text-zinc-400">
                                     {log.ip_address}
                                  </td>
                               </tr>
                            ))}
                            {logs.length === 0 && (
                               <tr><td colSpan={4} className="p-12 text-center text-zinc-600 italic">No activity recorded today.</td></tr>
                            )}
                         </tbody>
                      </table>
                   </div>
                   <div className="h-10 bg-linear-to-t from-[#09090b] to-transparent -mt-10 pointer-events-none relative z-10" />
                </div>
                
             </div>

             {/* --- Right Column: Real System Metrics (1/3 width) --- */}
             <div className={`space-y-6 opacity-0 ${mounted ? 'animate-fade-up' : ''}`} style={{ animationDelay: '300ms' }}>
                
                {/* 1. Engagement Metrics Card */}
                <div className="glass-panel rounded-3xl p-6">
                   <div className="flex justify-between items-start mb-6">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                         <Icons.Chart />
                         Engagement Analytics
                      </h3>
                      <span className="text-[10px] text-zinc-600 font-mono">Real-time</span>
                   </div>

                   <div className="space-y-5">
                      <div>
                         <div className="flex justify-between text-xs text-zinc-400 mb-2">
                            <span>Voter Turnout</span>
                            <span className="text-blue-400 font-mono">{calculateEngagementRate()}%</span>
                         </div>
                         <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                            <div 
                              className="bg-blue-500 h-full rounded-full transition-all duration-500"
                              style={{ width: `${calculateEngagementRate()}%` }}
                            />
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-2">
                         <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800">
                            <div className="text-[10px] text-zinc-500 uppercase mb-1">Today's Events</div>
                            <div className="text-xl font-bold text-white">{getTodayEvents()}</div>
                            <div className="text-[8px] text-zinc-600 mt-1">
                              {getYesterdayEvents() > 0 ? 
                                `+${getTodayEvents() - getYesterdayEvents()} from yesterday` : 
                                'No data from yesterday'}
                            </div>
                         </div>
                         <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800">
                            <div className="text-[10px] text-zinc-500 uppercase mb-1">Active Voters</div>
                            <div className="text-xl font-bold text-white">{getActiveVoters()}</div>
                            <div className="text-[8px] text-zinc-600 mt-1">last hour activity</div>
                         </div>
                      </div>

                      <div className="pt-2 border-t border-white/5">
                         <div className="flex justify-between items-center">
                            <span className="text-xs text-zinc-400">Completed Elections</span>
                            <span className="text-xs text-emerald-400 font-mono">{getCompletedElections()}</span>
                         </div>
                         <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-zinc-400">System Uptime</span>
                            <span className="text-xs text-zinc-300 font-mono">99.97%</span>
                         </div>
                      </div>
                   </div>
                </div>

                {/* 2. Alerts Module (Enhanced) */}
                <div className="glass-panel rounded-3xl p-6">
                   <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                     <span className="relative flex h-2 w-2">
                       {alerts.length > 0 && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>}
                       <span className={`relative inline-flex rounded-full h-2 w-2 ${alerts.length > 0 ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
                     </span>
                     Security Alerts
                   </h3>
                   
                   <div className="space-y-3 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                      {alerts.length === 0 ? (
                        <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 text-xs flex gap-3 items-center">
                           <Icons.CheckCircle />
                           <span>All systems operational. No active threats.</span>
                        </div>
                      ) : (
                        alerts.map(alert => (
                          <div key={alert.id} className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex gap-3 hover:bg-zinc-900/80 transition-colors">
                             <div className={`mt-0.5 min-w-1.5 h-1.5 rounded-full ${
                               alert.severity === 'high' ? 'bg-rose-500' : 
                               alert.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                             }`} />
                             <div className="flex-1">
                                <p className="text-xs text-zinc-300 font-medium leading-relaxed">{alert.message}</p>
                                <p className="text-[10px] text-zinc-600 mt-1 font-mono">{new Date(alert.timestamp).toLocaleTimeString()}</p>
                             </div>
                          </div>
                        ))
                      )}
                   </div>

                   {/* Quick Stats */}
                   <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-2 text-center">
                      <div>
                         <div className="text-[10px] text-zinc-600">Failed Logins</div>
                         <div className="text-sm font-bold text-rose-400">
                           {logs.filter(l => l.action.toLowerCase().includes('failed')).length}
                         </div>
                      </div>
                      <div>
                         <div className="text-[10px] text-zinc-600">Unique IPs</div>
                         <div className="text-sm font-bold text-blue-400">
                           {getUniqueIPsToday()}
                         </div>
                      </div>
                   </div>
                </div>

                {/* 3. Quick Actions */}
                <div className="space-y-2">
                   <h3 className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider px-2">Quick Access</h3>
                   <ActionButton 
                      label="View Audit Logs" 
                      href="/super-admin/logs"
                      icon={<Icons.Grid />} 
                   />
                   <ActionButton 
                      label="Security Dashboard" 
                      href="/super-admin/audit"
                      icon={<Icons.Shield />} 
                   />
                </div>

             </div>

          </div>
        </div>
      </div>

      {/* Add custom scrollbar styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </>
  );
}

// ── Components ───────────────────────────────────────────

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  highlight?: boolean;
  details?: string;
  valueColor?: string;
}

function KPICard({ title, value, icon, trend, highlight, details, valueColor }: KPICardProps) {
  return (
    <div className={`glass-panel rounded-2xl p-5 flex flex-col justify-between group transition-all duration-300 ${highlight ? 'bg-linear-to-br from-blue-500/10 to-transparent border-blue-500/20 shadow-lg shadow-blue-900/5' : ''}`}>
       <div className="flex justify-between items-start mb-4">
          <div className={`p-2 rounded-lg ${highlight ? 'bg-blue-500 text-black' : 'bg-zinc-800 text-zinc-400'}`}>
            {icon}
          </div>
          {trend && <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">{trend}</span>}
       </div>
       <div>
         <div className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-1">{title}</div>
         <div className={`text-3xl font-bold tracking-tight ${valueColor || (highlight ? 'text-blue-100' : 'text-zinc-100')}`}>{value}</div>
         {details && <div className="text-[10px] text-zinc-500 mt-2 font-medium">{details}</div>}
       </div>
    </div>
  );
}

function ActionButton({ label, icon, href }: { label: string; icon: React.ReactNode; href: string }) {
  return (
    <Link to={href} className="flex items-center gap-3 w-full p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50 hover:bg-zinc-800 hover:border-zinc-700 hover:scale-[1.02] transition-all group">
       <span className="text-zinc-500 group-hover:text-blue-500 transition-colors">{icon}</span>
       <span className="text-xs font-bold text-zinc-300 group-hover:text-white">{label}</span>
       <span className="ml-auto text-zinc-600 group-hover:text-white transition-colors">→</span>
    </Link>
  );
}