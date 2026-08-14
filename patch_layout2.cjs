const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  'div className="bg-slate-900 text-white p-6 md:p-8 rounded-3xl shrink-0"',
  'div className="bg-slate-900 text-white p-5 md:p-6 rounded-3xl shrink-0"'
);

code = code.replace(
  'h3 className="text-lg font-bold mb-4 flex items-center gap-2"',
  'h3 className="text-lg font-bold mb-3 flex items-center gap-2"'
);

code = code.replace(
  'div className="flex-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-blue-500/50 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col overflow-hidden"',
  'div className="flex-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-blue-500/50 rounded-3xl p-5 md:p-6 shadow-sm flex flex-col overflow-hidden"'
);

code = code.replace(
  'section className="flex-[2] flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-blue-500/50 p-6 md:p-8 h-full overflow-hidden"',
  'section className="flex-[2] flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-blue-500/50 p-5 md:p-6 h-full overflow-hidden"'
);

fs.writeFileSync('src/App.tsx', code);
