const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Header and main wrapper adjustments
code = code.replace(
  'className="flex-1 flex flex-col p-6 md:p-10 overflow-hidden overflow-y-auto dark:bg-slate-900 dark:text-white transition-colors"',
  'className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 overflow-hidden overflow-y-auto dark:bg-slate-900 dark:text-white transition-colors"'
);

code = code.replace(
  'header className="flex justify-between items-end mb-10 shrink-0"',
  'header className="flex justify-between items-end mb-6 shrink-0"'
);

// Stat cards section wrapper
code = code.replace(
  'section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 shrink-0"',
  'section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 shrink-0"'
);

// The 4 stat cards padding and text size
const oldCard1 = 'className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-blue-500/50 cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors group"';
const newCard1 = 'className="bg-white dark:bg-slate-900 px-5 py-4 rounded-2xl shadow-sm border border-slate-100 dark:border-blue-500/50 cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors group"';

const oldCard2 = 'className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-blue-500/50"';
const newCard2 = 'className="bg-white dark:bg-slate-900 px-5 py-4 rounded-2xl shadow-sm border border-slate-100 dark:border-blue-500/50"';

code = code.split(oldCard1).join(newCard1);
code = code.split(oldCard2).join(newCard2);

code = code.replace(/text-3xl font-bold/g, 'text-2xl font-bold');

// Also Agenda do dia section padding
code = code.replace(
  'section className="flex-[2] flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-blue-500/50 p-6 md:p-8 h-full overflow-hidden"',
  'section className="flex-[2] flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-blue-500/50 p-5 md:p-6 h-full overflow-hidden"'
);

code = code.replace(
  'div className="flex justify-between items-center mb-6 shrink-0"',
  'div className="flex justify-between items-center mb-4 shrink-0"'
);

code = code.replace(
  'div className="relative mb-6 shrink-0"',
  'div className="relative mb-4 shrink-0"'
);

fs.writeFileSync('src/App.tsx', code);
