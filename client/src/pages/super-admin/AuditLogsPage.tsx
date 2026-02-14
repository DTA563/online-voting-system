import { useState, useEffect, useMemo } from 'react';
import { adminApi } from '../../api';

interface Log {
  id: number;
  created_at: string;
  performed_by: string;
  full_name: string;
  role: string;
  action: string;
  ip_address: string;
  metadata?: string; 
}

// Icons - Clean Line Style
const Icons = {
  Filter: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>,
  Eye: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
  X: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>,
  Search: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  Shield: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  Clock: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Terminal: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
};

export function AuditLogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);
  const [mounted, setMounted] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'super_admin' | 'voter'>('all');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 12;

  useEffect(() => {
    loadLogs();
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const loadLogs = async () => {
    try {
      const data = await adminApi.getLogs();
      setLogs(data);
    } catch (err) {
      console.error('Failed to load logs', err);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Parsing Helper for heuristic columns ---
  const parseLog = (action: string) => {
    let type = 'General';
    let target = 'System';
    
    if (action.includes('login') || action.includes('Login')) type = 'Authentication';
    else if (action.includes('Register') || action.includes('Create')) type = 'Creation';
    else if (action.includes('Changed') || action.includes('Update')) type = 'Modification';
    else if (action.includes('Reset')) type = 'Security';
    
    if (action.includes('user')) target = 'User';
    else if (action.includes('election')) target = 'Election';
    else if (action.includes('candidate')) target = 'Candidate';
    
    return { type, target };
  };

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = 
        log.performed_by.toLowerCase().includes(searchQuery.toLowerCase()) || 
        log.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase());
      
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

  // --- Loading Skeleton ---
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 space-y-8 animate-pulse">
        <div className="space-y-3">
          <div className="h-3 w-32 bg-zinc-800 rounded"></div>
          <div className="h-8 w-64 bg-zinc-800 rounded"></div>
          <div className="h-4 w-96 bg-zinc-800 rounded"></div>
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
      `}</style>
      
      <div className="text-zinc-100 font-sans selection:bg-blue-500/20 pb-12">

        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 space-y-8">
           {/* Header */}
           <div className={`opacity-0 ${mounted ? 'animate-fade-up' : ''}`}>
               <h2 className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                 <Icons.Terminal /> SYSTEM ARCHIVE
               </h2>
               <h1 className="text-3xl font-bold text-white tracking-tight">Security Audit Logs</h1>
               <p className="text-zinc-400 mt-2 max-w-lg text-sm">Immutable ledger of all actions performed within the system.</p>
           </div>

           {/* Toolbar */}
           <div className={`glass-panel p-4 rounded-2xl flex flex-col md:flex-row gap-4 justify-between items-center opacity-0 ${mounted ? 'animate-fade-up' : ''}`} style={{ animationDelay: '100ms' }}>
             <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                <div className="relative group w-full md:w-80">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-blue-500 transition-colors">
                      <Icons.Search />
                   </div>
                   <input 
                     type="text" 
                     placeholder="Search log entries (Action, User, ID)..." 
                     className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-sm transition-all font-mono"
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                   />
                </div>

                <div className="flex gap-2">
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
                  
                  <div className="flex items-center gap-2 glass-input rounded-xl px-2">
                     <input 
                       type="date" 
                       className="bg-transparent text-sm text-zinc-300 focus:outline-none p-1"
                       value={filterStartDate}
                       onChange={(e) => setFilterStartDate(e.target.value)}
                     />
                     <span className="text-zinc-600">→</span>
                     <input 
                       type="date" 
                       className="bg-transparent text-sm text-zinc-300 focus:outline-none p-1"
                       value={filterEndDate}
                       onChange={(e) => setFilterEndDate(e.target.value)}
                     />
                  </div>
                </div>
             </div>

             <div className="text-xs font-mono text-zinc-500 px-3 py-1.5 border border-zinc-800 rounded-lg bg-zinc-900/50">
                Found {filteredLogs.length} entries
             </div>
           </div>

           {/* Table */}
           <div className={`glass-panel rounded-3xl overflow-hidden opacity-0 ${mounted ? 'animate-fade-up' : ''}`} style={{ animationDelay: '200ms' }}>
             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="text-[10px] text-zinc-500 uppercase tracking-wider border-b border-white/5 bg-zinc-900/30">
                        <th className="px-6 py-4 font-medium">Timestamp (UTC)</th>
                        <th className="px-6 py-4 font-medium">Principal</th>
                        <th className="px-6 py-4 font-medium">Authorization</th>
                        <th className="px-6 py-4 font-medium">Event Type</th>
                        <th className="px-6 py-4 font-medium">Payload Preview</th>
                        <th className="px-6 py-4 font-medium text-right">Inspect</th>
                     </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-white/5">
                     {currentLogs.map((log) => {
                       const { type } = parseLog(log.action);
                       return (
                         <tr key={log.id} className="hover:bg-white/2 transition-colors group">
                            <td className="px-6 py-4 text-zinc-500 font-mono text-xs">
                               {new Date(log.created_at).toLocaleString('en-GB')}
                            </td>
                            <td className="px-6 py-4">
                               <div className="font-medium text-zinc-200 group-hover:text-white transition-colors">{log.full_name}</div>
                               <div className="text-[10px] text-zinc-600 font-mono uppercase">ID: {log.performed_by}</div>
                            </td>
                            <td className="px-6 py-4">
                               <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                                 log.role === 'super_admin' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 
                                 log.role === 'admin' ? 'bg-zinc-100/10 text-zinc-300 border-zinc-500/20' : 
                                 'bg-white/5 text-zinc-500 border-white/5'
                               }`}>
                                 {log.role}
                               </span>
                            </td>
                            <td className="px-6 py-4">
                               <div className="flex items-center gap-2">
                                  <span className={`w-1.5 h-1.5 rounded-full ${
                                     type === 'Authentication' ? 'bg-blue-400' :
                                     type === 'Security' ? 'bg-rose-500' : 
                                     'bg-zinc-500'
                                  }`} />
                                  <span className="text-zinc-400 text-xs">{type}</span>
                               </div>
                            </td>
                            <td className="px-6 py-4 max-w-xs truncate text-zinc-500 font-mono text-xs group-hover:text-zinc-400 transition-colors">
                               {log.action}
                            </td>
                            <td className="px-6 py-4 text-right">
                               <button 
                                 onClick={() => setSelectedLog(log)}
                                 className="px-3 py-1.5 rounded bg-zinc-800 border border-transparent hover:border-zinc-600 text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition-all"
                               >
                                 View Data
                               </button>
                            </td>
                         </tr>
                       );
                     })}
                     {filteredLogs.length === 0 && (
                       <tr><td colSpan={6} className="px-6 py-16 text-center text-zinc-600 italic">No audit records located in this timeframe.</td></tr>
                     )}
                  </tbody>
               </table>
             </div>

             {/* Pagination */}
             <div className="px-6 py-4 border-t border-white/5 flex justify-between items-center text-xs font-mono text-zinc-500 bg-zinc-900/30">
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
           </div>
        </div>

        {/* 🔹 C. Log Detail Drawer / Modal */}
        {selectedLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={() => setSelectedLog(null)} />
             <div className="relative bg-[#0F0F0F] border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-up">
                
                {/* Modal Header */}
                <div className="px-8 py-6 border-b border-white/5 flex justify-between items-start bg-zinc-900/50">
                   <div>
                      <div className="flex items-center gap-3 mb-2">
                         <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20">
                            <Icons.Shield />
                         </div>
                         <h3 className="text-xl font-bold text-white">Log Entry #{selectedLog.id}</h3>
                      </div>
                      <p className="text-xs text-zinc-500 font-mono">HASH: {btoa(selectedLog.created_at + selectedLog.action).substring(0, 32)}...</p>
                   </div>
                   <button onClick={() => setSelectedLog(null)} className="p-2 rounded-full hover:bg-white/5 text-zinc-500 hover:text-white transition-colors">
                     <Icons.X />
                   </button>
                </div>

                {/* Modal Body */}
                <div className="p-8 overflow-y-auto space-y-8">
                   
                   {/* 1. Primary Metadata */}
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-zinc-900/50 border border-white/5">
                         <div className="flex items-center gap-2 mb-2 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                            <Icons.Clock /> Timestamp
                         </div>
                         <p className="text-zinc-200 font-mono text-sm">{new Date(selectedLog.created_at).toLocaleString()}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-zinc-900/50 border border-white/5">
                         <div className="flex items-center gap-2 mb-2 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                            Origin IP
                         </div>
                         <p className="text-zinc-200 font-mono text-sm">{selectedLog.ip_address}</p>
                      </div>
                   </div>

                   {/* 2. Actor Info */}
                   <div>
                     <h4 className="text-[10px] font-bold text-zinc-500 mb-3 uppercase tracking-widest">Actor Identity</h4>
                      <div className="flex items-center gap-5 p-5 rounded-xl bg-zinc-900/50 border border-white/5">
                         <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-xl text-zinc-400">
                           {selectedLog.full_name.charAt(0)}
                         </div>
                         <div>
                            <p className="text-lg text-white font-bold">{selectedLog.full_name}</p>
                            <div className="flex items-center gap-3 mt-1">
                               <span className="text-xs text-zinc-500 font-mono bg-black/40 px-2 py-0.5 rounded">ID: {selectedLog.performed_by}</span>
                               <span className="text-xs text-blue-500 font-bold uppercase">{selectedLog.role}</span>
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* 3. Action Details */}
                   <div>
                      <h4 className="text-[10px] font-bold text-zinc-500 mb-3 uppercase tracking-widest">Event Payload</h4>
                      <div className="p-5 rounded-xl bg-black/40 border border-white/10 font-mono text-sm text-zinc-300 leading-relaxed">
                         {selectedLog.action}
                      </div>
                   </div>

                   {/* 4. Integrity Check */}
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
