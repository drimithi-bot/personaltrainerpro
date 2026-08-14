const fs = require('fs');
let code = fs.readFileSync('src/components/PricingView.tsx', 'utf8');

// Reduce card padding
code = code.replace('rounded-3xl p-5 border-2', 'rounded-2xl p-4 border-2');

// Reduce header margin inside card
code = code.replace('text-center mb-4 mt-2', 'text-center mb-2 mt-1');

// Reduce description height
code = code.replace('text-xs text-slate-500 dark:text-slate-400 mt-1 h-8', 'text-xs text-slate-500 dark:text-slate-400 mt-1 h-6 line-clamp-2');

// Reduce price margin
code = code.replace('text-center mb-4', 'text-center mb-2');

// Reduce list gap and margin
code = code.replace('flex flex-col gap-2 mb-4 text-xs text-slate-600 flex-1', 'flex flex-col gap-1.5 mb-3 text-[11px] md:text-xs text-slate-600 flex-1');

// Reduce button padding
code = code.replace('w-full py-2 rounded-xl', 'w-full py-1.5 rounded-xl');

// Container padding
code = code.replace('flex-1 p-5 md:p-6 overflow-y-auto', 'flex-1 p-4 overflow-y-auto');

fs.writeFileSync('src/components/PricingView.tsx', code);
