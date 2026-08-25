const fs = require('fs');
let code = fs.readFileSync('src/components/PublicTrainerProfileView.tsx', 'utf8');

code = code.replace(
  'className="w-full h-full object-cover opacity-30" alt="Background"',
  'className="w-full h-full object-cover opacity-30" alt="Background" onError={(e) => { e.currentTarget.style.display = \'none\'; }}'
);
code = code.replace(
  'className="w-full h-auto rounded-3xl shadow-2xl object-cover aspect-[4/5] border border-slate-700/50" alt="Trainer"',
  'className="w-full h-auto rounded-3xl shadow-2xl object-cover aspect-[4/5] border border-slate-700/50 bg-slate-800" alt="Trainer" onError={(e) => { e.currentTarget.style.display = \'none\'; }}'
);

fs.writeFileSync('src/components/PublicTrainerProfileView.tsx', code);
