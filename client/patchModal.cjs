const fs = require('fs');
const file = 'src/pages/admin/ManageVotersPage.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add userToRevoke state
content = content.replace(
  /const \[processingId, setProcessingId\] = useState<string \| null>\(null\);/,
  "const [processingId, setProcessingId] = useState<string | null>(null);\n  const [userToRevoke, setUserToRevoke] = useState<string | null>(null);"
);

content = content.replace(
  /const handleReject = async \(id: string\) => {[\s\S]*?  };\n\n  \/\/ --- Derived State ---/s,
  `const executeRevoke = async () => {
    if (!userToRevoke) return;
    setProcessingId(userToRevoke);
    try {
      await api.delete(\`/users/\${userToRevoke}\`);
      setSuccessMessage('Access revoked successfully');
      await loadVoters();
      setTimeout(() => setSuccessMessage(''), 3000);
      setUserToRevoke(null);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to remove user');
      console.error(err);
      setUserToRevoke(null);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = (id: string) => {
    setUserToRevoke(id);
  };

  // --- Derived State ---`
);

const modalString = `
      {/* Revoke Confirmation Modal */}
      {userToRevoke && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-red-500/10 rounded-xl text-red-500 shrink-0">
                <Icons.Trash />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Revoke Access</h3>
                <p className="text-sm text-gray-400">
                  Are you sure you want to revoke access for this user? This will permanently remove them from the registered voter list and they will no longer be able to vote.
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

        <div className="relative z-10 max-w-7xl mx-auto p-6 lg:p-10 space-y-10">`;

content = content.replace(/<div className="relative z-10 max-w-7xl mx-auto p-6 lg:p-10 space-y-10">/, modalString);

fs.writeFileSync(file, content);
console.log('done modal');
