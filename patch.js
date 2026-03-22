const fs = require('fs');
const file = 'client/src/pages/admin/ManageVotersPage.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /\{\/\* --- Pending Verifications Section --- \*\/\}.*?\{\/\* --- Verified Voters Section --- \*\/\}/s,
  '{/* --- Registered Voters Section --- */}'
);

content = content.replace(/Verified Voter Roll/g, 'Registered Voter Roll');
content = content.replace(/\{activeVoters\.length\} verified voter\{activeVoters\.length !== 1 \? 's' : ''\} in the system/g, "{voters.length} registered voter{voters.length !== 1 ? 's' : ''} in the system");
content = content.replace(/activeVoters/g, 'voters');
content = content.replace(/filteredActiveVoters/g, 'filteredVoters');
content = content.replace(/status="verified"/g, 'status="registered"');
content = content.replace(/No verified voters yet/g, 'No registered voters yet');
content = content.replace(/Verify pending registrations above to populate this list\./g, '');
content = content.replace(/Verify new registrations and manage the electoral roll\./g, 'Manage the electoral roll.');

content = content.replace(/function StatusBadge\(\{ status \}: \{ status: 'pending' \| 'verified' \}\) \{/, "function StatusBadge({ status }: { status: 'registered' }) {");
content = content.replace(/verified: \{ color: 'bg-emerald-500\/10 text-emerald-400 border-emerald-500\/20 shadow-\\[0_0_10px_rgba\(16,185,129,0\.2\)\\]', label: 'Verified', dot: 'bg-emerald-400' \},/, "registered: { color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]', label: 'Registered', dot: 'bg-emerald-400' },");
content = content.replace(/pending: \{.*?\},/, '');

fs.writeFileSync(file, content);
console.log('Done replacement');
